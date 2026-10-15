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
}
