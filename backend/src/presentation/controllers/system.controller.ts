import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { buildSmsDiagnostics, type SmsDiagnostics } from '../../infrastructure/sms/sms-delivery-mode.js';

@ApiTags('System')
@Controller('system')
export class SystemController {
  @Get('sms-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OTP/SMS delivery routing diagnostics (no secrets are exposed)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Resolved SMS delivery mode (real | telegram | test) together with the environment flags that produced it.',
  })
  getSmsStatus(): SmsDiagnostics {
    return buildSmsDiagnostics();
  }

  @Get('sms-test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Diagnostics for SMS endpoints and DNS resolution',
  })
  async testSmsEndpoints(): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

    // 1. DNS lookups
    try {
      const dns = await import('node:dns/promises');
      results.dnsConsole = await dns.lookup('console.melipayamak.com');
    } catch (err: unknown) {
      results.dnsConsoleError = err instanceof Error ? err.message : String(err);
    }

    try {
      const dns = await import('node:dns/promises');
      results.dnsRest = await dns.lookup('rest.payamak-panel.com');
    } catch (err: unknown) {
      results.dnsRestError = err instanceof Error ? err.message : String(err);
    }

    // 2. HTTP connectivity test to Console
    try {
      const controller = new AbortController();
      const tId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('https://console.melipayamak.com/api/send', {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(tId);
      results.httpConsole = { status: res.status, ok: res.ok };
    } catch (err: unknown) {
      results.httpConsoleError = err instanceof Error ? err.message : String(err);
      if (err && typeof err === 'object' && 'cause' in err) {
        results.httpConsoleCause = String((err as any).cause);
      }
    }

    // 3. HTTP connectivity test to Rest
    try {
      const controller = new AbortController();
      const tId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('https://rest.payamak-panel.com', {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(tId);
      results.httpRest = { status: res.status, ok: res.ok };
    } catch (err: unknown) {
      results.httpRestError = err instanceof Error ? err.message : String(err);
      if (err && typeof err === 'object' && 'cause' in err) {
        results.httpRestCause = String((err as any).cause);
      }
    }

    return results;
  }
}
