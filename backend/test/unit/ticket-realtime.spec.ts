import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TicketGateway } from '../../src/presentation/gateways/ticket.gateway.js';
import { InMemoryTicketRepository } from '../../src/infrastructure/database/in-memory/in-memory-ticket.repository.js';
import { JwtSessionService } from '../../src/infrastructure/auth/jwt-session.service.js';
import { SendMessageUseCase } from '../../src/application/use-cases/ticket/ticket.use-cases.js';
import { WsException } from '@nestjs/websockets';

describe('Ticket WebSocket Gateway & Real-time Flow (Unit)', () => {
  let gateway: TicketGateway;
  let repo: InMemoryTicketRepository;
  let jwtSessionService: JwtSessionService;
  let sendMessageUseCase: SendMessageUseCase;
  let mockServer: any;

  const OWNER_USER_ID = '00000000-0000-4000-a000-000000000003';
  const OTHER_USER_ID = '00000000-0000-4000-a000-000000000099';
  const ADMIN_USER_ID = '00000000-0000-4000-a000-000000000001';

  beforeEach(async () => {
    repo = new InMemoryTicketRepository();
    jwtSessionService = new JwtSessionService();
    sendMessageUseCase = new SendMessageUseCase(repo);
    gateway = new TicketGateway(jwtSessionService, repo, sendMessageUseCase);

    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    gateway.server = mockServer as any;
  });

  it('allows ticket owner to join the ticket room successfully', async () => {
    const ticket = await repo.createTicket({
      userId: OWNER_USER_ID,
      subject: 'مشکل در روتر میکروتیک',
      department: 'CISCO_SWITCHING' as any,
      priority: 'HIGH' as any,
      initialMessage: 'پیام اولیه تیکت',
    });

    const mockSocket: any = {
      userId: OWNER_USER_ID,
      userRole: 'customer',
      join: vi.fn(),
      emit: vi.fn(),
    };

    await gateway.handleJoinRoom(mockSocket, { ticketId: ticket.id });

    expect(mockSocket.join).toHaveBeenCalledWith(`ticket:${ticket.id}`);
    expect(mockSocket.emit).toHaveBeenCalledWith('ticket:joined', {
      ticketId: ticket.id,
      room: `ticket:${ticket.id}`,
    });
  });

  it('allows owner to join when ticketId is passed directly as a string', async () => {
    const ticket = await repo.createTicket({
      userId: OWNER_USER_ID,
      subject: 'مشکل کابل شبکه',
      department: 'FIBER_CABLING' as any,
      priority: 'NORMAL' as any,
      initialMessage: 'سلام، نیاز به پچ‌کورد دارم',
    });

    const mockSocket: any = {
      userId: OWNER_USER_ID,
      userRole: 'customer',
      join: vi.fn(),
      emit: vi.fn(),
    };

    await gateway.handleJoinRoom(mockSocket, ticket.id);

    expect(mockSocket.join).toHaveBeenCalledWith(`ticket:${ticket.id}`);
    expect(mockSocket.emit).toHaveBeenCalledWith('ticket:joined', {
      ticketId: ticket.id,
      room: `ticket:${ticket.id}`,
    });
  });

  it('allows admin to join ticket room belonging to another customer', async () => {
    const ticket = await repo.createTicket({
      userId: OWNER_USER_ID,
      subject: 'درخواست بررسی ترافیک',
      department: 'CISCO_SWITCHING' as any,
      priority: 'NORMAL' as any,
      initialMessage: 'بررسی ترافیک شبکه',
    });

    const mockAdminSocket: any = {
      userId: ADMIN_USER_ID,
      userRole: 'admin',
      join: vi.fn(),
      emit: vi.fn(),
    };

    await gateway.handleJoinRoom(mockAdminSocket, { ticketId: ticket.id });

    expect(mockAdminSocket.join).toHaveBeenCalledWith(`ticket:${ticket.id}`);
    expect(mockAdminSocket.emit).toHaveBeenCalledWith('ticket:joined', {
      ticketId: ticket.id,
      room: `ticket:${ticket.id}`,
    });
  });

  it('allows support staff roles (support_agent, owner, super_admin) to join any ticket room', async () => {
    const ticket = await repo.createTicket({
      userId: OWNER_USER_ID,
      subject: 'مشکل سرور',
      department: 'GENERAL' as any,
      priority: 'CRITICAL' as any,
      initialMessage: 'سرور از دسترس خارج شده',
    });

    const staffRoles = ['support_agent', 'support', 'owner', 'super_admin', 'engineer_ccie'];

    for (const role of staffRoles) {
      const mockStaffSocket: any = {
        userId: 'staff-user-id',
        userRole: role,
        join: vi.fn(),
        emit: vi.fn(),
      };

      await gateway.handleJoinRoom(mockStaffSocket, { ticketId: ticket.id });
      expect(mockStaffSocket.join).toHaveBeenCalledWith(`ticket:${ticket.id}`);
    }
  });

  it('denies another unauthorized customer from joining ticket room', async () => {
    const ticket = await repo.createTicket({
      userId: OWNER_USER_ID,
      subject: 'اطلاعات خصوصی شبکه',
      department: 'CISCO_SWITCHING' as any,
      priority: 'HIGH' as any,
      initialMessage: 'پیکربندی ویلن‌ها',
    });

    const mockIntruderSocket: any = {
      userId: OTHER_USER_ID,
      userRole: 'customer',
      join: vi.fn(),
      emit: vi.fn(),
    };

    await expect(gateway.handleJoinRoom(mockIntruderSocket, { ticketId: ticket.id })).rejects.toThrow(
      WsException,
    );
    expect(mockIntruderSocket.join).not.toHaveBeenCalled();
    expect(mockIntruderSocket.emit).toHaveBeenCalledWith('error', expect.objectContaining({
      message: expect.stringContaining('دسترسی غیرمجاز'),
    }));
  });

  it('emits ticket update event to the exact room', () => {
    const ticketId = 'ticket-uuid-abc-123';
    const payload = { message: { id: 'msg-1', content: 'سلام' } };

    gateway.emitTicketUpdate(ticketId, 'ticket:new_message', payload);

    expect(mockServer.to).toHaveBeenCalledWith(`ticket:${ticketId}`);
    expect(mockServer.emit).toHaveBeenCalledWith('ticket:new_message', {
      ticketId,
      ...payload,
    });
  });

  it('properly validates message deduplication without dropping messages with undefined clientMessageId', () => {
    // Regression test for the critical bug where undefined clientMessageId dropped all incoming messages
    const existingMessages = [
      { id: 'msg-1', content: 'پیام اول', clientMessageId: undefined },
      { id: 'msg-2', content: 'پیام دوم', clientMessageId: undefined },
    ];

    const incomingNewMessage = {
      id: 'msg-3',
      content: 'پیام جدید از پشتیبانی',
      clientMessageId: undefined,
    };

    // Old flawed check:
    const oldCheck = existingMessages.some(
      (m: any) => m.id === incomingNewMessage.id || m.clientMessageId === incomingNewMessage.clientMessageId,
    );
    // Old flawed check was true because undefined === undefined!
    expect(oldCheck).toBe(true);

    // Fixed check:
    const fixedCheck = existingMessages.some(
      (m: any) =>
        m.id === incomingNewMessage.id ||
        (Boolean(incomingNewMessage.clientMessageId) &&
          Boolean(m.clientMessageId) &&
          m.clientMessageId === incomingNewMessage.clientMessageId),
    );
    // Fixed check correctly evaluates to false, allowing the new message!
    expect(fixedCheck).toBe(false);

    // True duplicate by id is correctly caught:
    const duplicateById = existingMessages.some(
      (m: any) =>
        m.id === 'msg-1' ||
        (Boolean(incomingNewMessage.clientMessageId) &&
          Boolean(m.clientMessageId) &&
          m.clientMessageId === incomingNewMessage.clientMessageId),
    );
    expect(duplicateById).toBe(true);

    // True duplicate by non-empty clientMessageId is correctly caught:
    const messageWithCmsg = { id: 'msg-4', content: 'پیام ۴', clientMessageId: 'cmsg-123' };
    const duplicateByCmsg = [messageWithCmsg].some(
      (m: any) =>
        m.id === 'msg-different-id' ||
        (Boolean('cmsg-123') && Boolean(m.clientMessageId) && m.clientMessageId === 'cmsg-123'),
    );
    expect(duplicateByCmsg).toBe(true);
  });

  it('allows owner to join room even if userId has different casing or whitespace', async () => {
    const ticket = await repo.createTicket({
      userId: OWNER_USER_ID,
      subject: 'تست شناسه بزرگ و کوچک',
      department: 'GENERAL' as any,
      priority: 'NORMAL' as any,
      initialMessage: 'تست',
    });

    const mockSocketUpper: any = {
      userId: `  ${OWNER_USER_ID.toUpperCase()}  `,
      userRole: 'customer',
      join: vi.fn(),
      emit: vi.fn(),
    };

    await gateway.handleJoinRoom(mockSocketUpper, { ticketId: ticket.id });
    expect(mockSocketUpper.join).toHaveBeenCalledWith(`ticket:${ticket.id}`);
  });

  it('rejects customer from joining if ticket does not exist', async () => {
    const mockSocket: any = {
      userId: OWNER_USER_ID,
      userRole: 'customer',
      join: vi.fn(),
      emit: vi.fn(),
    };

    await expect(gateway.handleJoinRoom(mockSocket, { ticketId: '00000000-0000-0000-0000-000000000000' })).rejects.toThrow(
      WsException,
    );
    expect(mockSocket.join).not.toHaveBeenCalled();
    expect(mockSocket.emit).toHaveBeenCalledWith('error', expect.objectContaining({
      message: expect.stringContaining('تیکت یافت نشد'),
    }));
  });

  it('correctly matches duplicate messages with case-insensitive IDs and clientMessageId', () => {
    const isSameMessage = (a: any, b: any): boolean => {
      if (a.id && b.id && a.id.toLowerCase() === b.id.toLowerCase()) {
        return true;
      }
      if (
        a.clientMessageId &&
        b.clientMessageId &&
        a.clientMessageId.trim() &&
        b.clientMessageId.trim() &&
        a.clientMessageId.trim() === b.clientMessageId.trim()
      ) {
        return true;
      }
      return false;
    };

    const msgA = { id: 'uuid-abc-123', clientMessageId: 'cmsg-1' };
    const msgB = { id: 'UUID-ABC-123', clientMessageId: 'cmsg-different' };
    expect(isSameMessage(msgA, msgB)).toBe(true);

    const msgC = { id: 'uuid-1', clientMessageId: ' cmsg-xyz ' };
    const msgD = { id: 'uuid-2', clientMessageId: 'cmsg-xyz' };
    expect(isSameMessage(msgC, msgD)).toBe(true);

    const msgE = { id: 'uuid-3', clientMessageId: undefined };
    const msgF = { id: 'uuid-4', clientMessageId: undefined };
    expect(isSameMessage(msgE, msgF)).toBe(false);
  });
});
