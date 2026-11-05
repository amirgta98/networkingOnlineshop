import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Inject,
  forwardRef,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityMonitorService } from '../../infrastructure/services/security-monitor.service.js';
import { SecurityGateway } from '../gateways/security.gateway.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import type { TokenPayload } from '../../infrastructure/auth/jwt-session.service.js';
import type {
  SecurityOverviewDto,
  SecurityTelemetryPayload,
  ActiveAdminSessionDto,
  WafSecurityStatus,
} from '../../domain/entities/security-telemetry.entity.js';
import type { SecurityAuditLog } from '../../domain/entities/security-audit-log.entity.js';

function getOperatorActor(user?: TokenPayload): { actor: string; name: string } {
  const name = user?.phone || user?.sub || 'مدیر سیستم';
  const roleLabel = user?.role === 'super_admin' ? 'سوپرادمین' : 'مدیر';
  return {
    actor: `${name} (${roleLabel})`,
    name,
  };
}

@ApiTags('Security & NOC')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@Controller('security')
export class SecurityController {
  constructor(
    private readonly securityService: SecurityMonitorService,
    @Inject(forwardRef(() => SecurityGateway))
    private readonly securityGateway: SecurityGateway,
  ) {}

  @Get('overview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت شاخص‌های کلیدی مانیتورینگ امنیت، سوییچ‌ها و آپلینک‌ها' })
  @ApiResponse({ status: HttpStatus.OK, description: 'خلاصه وضعیت NOC/SOC' })
  async getOverview(@Req() req: Request & { user?: TokenPayload }): Promise<SecurityOverviewDto> {
    const userAgent = (req.headers['user-agent'] as string) || undefined;
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
    return this.securityService.getOverview(req.user?.sub, { userAgent, ip });
  }

  @Get('telemetry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت وضعیت بلادرنگ سوییچ‌های Core، آپلینک‌ها، بار سرورها و پایگاه داده' })
  @ApiResponse({ status: HttpStatus.OK, description: 'اسنپ‌شات کامل تلمتری سخت‌افزار و شبکه' })
  async getTelemetry(): Promise<SecurityTelemetryPayload> {
    return this.securityService.getTelemetrySnapshot();
  }

  @Get('audit-logs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'جستجو و استعلام لاگ‌های ممیزی سیستم و احراز هویت' })
  @ApiQuery({ name: 'category', required: false, enum: ['ALL', 'AUTH', 'NETWORK', 'FIREWALL', 'SESSION', 'DATABASE', 'SYSTEM'] })
  @ApiQuery({ name: 'level', required: false, enum: ['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAuditLogs(
    @Query('category') category?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ): Promise<SecurityAuditLog[]> {
    return this.securityService.getAuditLogs({
      category,
      level,
      search,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'لیست نشست‌های فعال مدیران و کارشناسان سیستم' })
  @ApiResponse({ status: HttpStatus.OK, description: 'لیست کامل نشست‌های معتبر' })
  async getSessions(@Req() req: Request & { user?: TokenPayload }): Promise<ActiveAdminSessionDto[]> {
    const userAgent = (req.headers['user-agent'] as string) || undefined;
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
    return this.securityService.getActiveSessions(req.user?.sub, { userAgent, ip });
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ابطال و خروج یک نشست فعال خاص' })
  @ApiParam({ name: 'sessionId', description: 'شناسه سشن مورد نظر' })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @Req() req: Request & { user?: TokenPayload },
  ): Promise<{ success: boolean; message: string }> {
    const { actor, name } = getOperatorActor(req.user);
    const result = await this.securityService.revokeSession(sessionId, actor);
    this.securityGateway.broadcastSessionRevoked({
      sessionId,
      revokedBy: name,
      timestamp: new Date().toISOString(),
    });
    return result;
  }

  @Post('sessions/:sessionId/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ابطال نشست فعال (متد جایگزین POST)' })
  async revokeSessionPost(
    @Param('sessionId') sessionId: string,
    @Req() req: Request & { user?: TokenPayload },
  ): Promise<{ success: boolean; message: string }> {
    return this.revokeSession(sessionId, req);
  }

  @Post('sessions/emergency-kill')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'صدور فرمان خروج اضطراری کلی و ابطال تمام نشست‌های فعال' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        excludeCurrentSession: { type: 'boolean', default: false },
        currentSessionId: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  })
  async emergencyKillSessions(
    @Body()
    body: {
      excludeCurrentSession?: boolean;
      currentSessionId?: string;
      reason?: string;
    },
    @Req() req: Request & { user?: TokenPayload },
  ): Promise<{ success: boolean; revokedCount: number; message: string }> {
    const { actor: opActor, name: opName } = getOperatorActor(req.user);
    const actor = `${opName} (فرمان اضطراری NOC)`;

    let currentSessionId = body.currentSessionId;
    if (body.excludeCurrentSession && !currentSessionId && req.user?.sub) {
      const active = await this.securityService.getActiveSessions(req.user.sub);
      currentSessionId = active.find((s) => s.isCurrent)?.id;
    }

    const result = await this.securityService.emergencyKillAllSessions({
      excludeCurrentSession: body.excludeCurrentSession,
      currentSessionId,
      actor,
      reason: body.reason,
    });

    this.securityGateway.broadcastEmergencyLogout({
      triggeredBy: opActor,
      revokedCount: result.revokedCount,
      reason: body.reason,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  @Post('waf/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'فعال/غیرفعال‌سازی حالت آماده‌باش زیر حمله (Under Attack Mode)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
      },
    },
  })
  async toggleUnderAttackMode(
    @Body() body: { enabled: boolean },
    @Req() req: Request & { user?: TokenPayload },
  ): Promise<WafSecurityStatus> {
    const { name } = getOperatorActor(req.user);
    const result = this.securityService.toggleUnderAttackMode(body.enabled, name);
    this.securityGateway.broadcastWafChange(result);
    return result;
  }

  @Post('firewall/block-ip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'مسدودسازی دستی یک آدرس IP در فایروال دیتاسنتر' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['ip'],
      properties: {
        ip: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  })
  async blockIp(
    @Body() body: { ip: string; reason?: string },
    @Req() req: Request & { user?: TokenPayload },
  ): Promise<{ success: boolean; message: string }> {
    const { name } = getOperatorActor(req.user);
    const result = this.securityService.blockIpAddress(
      body.ip,
      body.reason || 'فعالیت مشکوک ثبت شده توسط مانیتورینگ امنیتی',
      name,
    );
    return result;
  }
}
