import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable, Inject, forwardRef } from '@nestjs/common';
import { SecurityMonitorService } from '../../infrastructure/services/security-monitor.service.js';
import type { SecurityAuditLog } from '../../domain/entities/security-audit-log.entity.js';
import type { WafSecurityStatus } from '../../domain/entities/security-telemetry.entity.js';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/security',
})
export class SecurityGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SecurityGateway.name);
  private telemetryInterval: NodeJS.Timeout | null = null;
  private connectedClientsCount = 0;

  constructor(
    @Inject(forwardRef(() => SecurityMonitorService))
    private readonly securityService: SecurityMonitorService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Security WebSocket Gateway initialized on namespace /security');
    this.startTelemetryBroadcast();
  }

  handleConnection(socket: Socket) {
    this.connectedClientsCount++;
    this.logger.log(`Security client connected: ${socket.id} (Total: ${this.connectedClientsCount})`);

    // Send immediate snapshot upon connection
    this.sendImmediateSnapshot(socket);
  }

  handleDisconnect(socket: Socket) {
    this.connectedClientsCount = Math.max(0, this.connectedClientsCount - 1);
    this.logger.log(`Security client disconnected: ${socket.id} (Remaining: ${this.connectedClientsCount})`);
  }

  private async sendImmediateSnapshot(socket: Socket) {
    try {
      const telemetry = await this.securityService.getTelemetrySnapshot();
      socket.emit('security:telemetry', telemetry);

      const logs = this.securityService.getAuditLogs({ limit: 30 });
      socket.emit('security:initial_logs', logs);
    } catch (err) {
      this.logger.error('Failed to send initial snapshot', err);
    }
  }

  private startTelemetryBroadcast() {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
    }

    // Broadcast telemetry every 3 seconds to all connected clients
    this.telemetryInterval = setInterval(async () => {
      try {
        if (!this.server || this.connectedClientsCount === 0) return;
        const telemetry = await this.securityService.getTelemetrySnapshot();
        this.server.emit('security:telemetry', telemetry);
      } catch (err) {
        this.logger.error('Error in telemetry broadcast tick', err);
      }
    }, 3000);
  }

  @SubscribeMessage('security:ping')
  handlePing(@ConnectedSocket() socket: Socket, @MessageBody() data: { clientTime?: number }) {
    return {
      event: 'security:pong',
      data: {
        clientTime: data?.clientTime,
        serverTime: Date.now(),
      },
    };
  }

  @SubscribeMessage('security:request_refresh')
  async handleRequestRefresh(@ConnectedSocket() socket: Socket) {
    const telemetry = await this.securityService.getTelemetrySnapshot();
    socket.emit('security:telemetry', telemetry);
    return { status: 'ok' };
  }

  // Broadcast helpers called by service / controller
  public broadcastAuditLog(log: SecurityAuditLog) {
    if (this.server) {
      this.server.emit('security:audit_log', log);
    }
  }

  public broadcastSessionRevoked(payload: { sessionId: string; revokedBy: string; timestamp: string }) {
    if (this.server) {
      this.server.emit('security:session_revoked', payload);
    }
  }

  public broadcastEmergencyLogout(payload: {
    triggeredBy: string;
    revokedCount: number;
    reason?: string;
    timestamp: string;
  }) {
    if (this.server) {
      this.server.emit('security:emergency_logout', payload);
    }
  }

  public broadcastWafChange(status: WafSecurityStatus) {
    if (this.server) {
      this.server.emit('security:waf_changed', status);
    }
  }
}
