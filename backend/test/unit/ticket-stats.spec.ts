import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTicketRepository } from '../../src/infrastructure/database/in-memory/in-memory-ticket.repository.js';
import {
  GetAllTicketsUseCase,
  GetTicketStatsUseCase,
  CreateTicketUseCase,
  UpdateTicketStatusUseCase,
} from '../../src/application/use-cases/ticket/ticket.use-cases.js';

describe('Ticket Stats & Tab Counts Flow (Unit)', () => {
  let repo: InMemoryTicketRepository;
  let getAllTicketsUseCase: GetAllTicketsUseCase;
  let getTicketStatsUseCase: GetTicketStatsUseCase;
  let createTicketUseCase: CreateTicketUseCase;
  let updateTicketStatusUseCase: UpdateTicketStatusUseCase;

  const USER_ID = '00000000-0000-4000-a000-000000000001';

  beforeEach(() => {
    repo = new InMemoryTicketRepository();
    getAllTicketsUseCase = new GetAllTicketsUseCase(repo);
    getTicketStatsUseCase = new GetTicketStatsUseCase(repo);
    createTicketUseCase = new CreateTicketUseCase(repo);
    updateTicketStatusUseCase = new UpdateTicketStatusUseCase(repo);
  });

  it('calculates correct stats across different ticket statuses', async () => {
    // 1. Create 3 tickets (they start as OPEN)
    const t1 = await createTicketUseCase.execute({
      userId: USER_ID,
      subject: 'تیکت ۱',
      department: 'CISCO_SWITCHING',
      priority: 'CRITICAL',
      initialMessage: 'پیام ۱',
    });

    const t2 = await createTicketUseCase.execute({
      userId: USER_ID,
      subject: 'تیکت ۲',
      department: 'FIBER_CABLING',
      priority: 'HIGH',
      initialMessage: 'پیام ۲',
    });

    const t3 = await createTicketUseCase.execute({
      userId: USER_ID,
      subject: 'تیکت ۳',
      department: 'GENERAL',
      priority: 'NORMAL',
      initialMessage: 'پیام ۳',
    });

    // Change t2 to ANSWERED and t3 to WAITING_USER
    await updateTicketStatusUseCase.execute(t2.id, 'ANSWERED', USER_ID);
    await updateTicketStatusUseCase.execute(t3.id, 'WAITING_USER', USER_ID);

    // Fetch stats
    const stats = await getTicketStatsUseCase.execute();
    expect(stats.total).toBe(3);
    expect(stats.open).toBe(1);
    expect(stats.answered).toBe(1);
    expect(stats.waitingUser).toBe(1);
    expect(stats.resolved).toBe(0);
    expect(stats.closed).toBe(0);
    expect(stats.critical).toBe(1);
  });

  it('keeps stats consistent when filtering tickets by status in getAllTickets', async () => {
    const t1 = await createTicketUseCase.execute({
      userId: USER_ID,
      subject: 'تیکت باز',
      department: 'CISCO_SWITCHING',
      priority: 'CRITICAL',
      initialMessage: 'مشکل ۱',
    });

    const t2 = await createTicketUseCase.execute({
      userId: USER_ID,
      subject: 'تیکت پاسخ‌داده‌شده',
      department: 'CISCO_SWITCHING',
      priority: 'NORMAL',
      initialMessage: 'مشکل ۲',
    });

    await updateTicketStatusUseCase.execute(t2.id, 'ANSWERED', USER_ID);

    // Query with filter for OPEN status
    const resultOpen = await getAllTicketsUseCase.execute({ status: 'OPEN' });
    expect(resultOpen.tickets.length).toBe(1);
    expect(resultOpen.total).toBe(1);
    expect(resultOpen.stats.total).toBe(2);
    expect(resultOpen.stats.open).toBe(1);
    expect(resultOpen.stats.answered).toBe(1);

    // Query with filter for ANSWERED status
    const resultAnswered = await getAllTicketsUseCase.execute({ status: 'ANSWERED' });
    expect(resultAnswered.tickets.length).toBe(1);
    expect(resultAnswered.total).toBe(1);
    expect(resultAnswered.stats.total).toBe(2);
    expect(resultAnswered.stats.open).toBe(1);
    expect(resultAnswered.stats.answered).toBe(1);
  });
});
