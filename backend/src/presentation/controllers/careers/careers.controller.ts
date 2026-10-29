import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { AuthGuard } from '../../guards/auth.guard.js';
import { RolesGuard } from '../../guards/roles.guard.js';
import { OptionalAuthGuard } from '../../guards/optional-auth.guard.js';
import { Roles } from '../../decorators/roles.decorator.js';
import type { UploadedMulterFile } from '../product.controller.js';
import {
  CareersService,
  CreateJobPositionDto,
  UpdateJobPositionDto,
  JobPositionQueryDto,
  CreateJobApplicationDto,
  UpdateJobApplicationStatusDto,
} from '../../../application/services/careers/careers.service.js';
import { JobApplicationStatus } from '@prisma/client';

@ApiTags('Careers')
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  // ─── Public: Job Positions ─────────────────────────────────────

  @Get('positions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'دریافت لیست موقعیت‌های شغلی فعال (عمومی)' })
  async findAllPositions(@Query() query: JobPositionQueryDto, @Request() req: any) {
    const role = req?.user?.role?.toLowerCase();
    const isAdmin =
      role === 'admin' || role === 'super_admin' || role === 'staff_manager' || role === 'sales_manager';
    return this.careersService.findAllPositions(query, isAdmin);
  }

  @Get('positions/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'دریافت جزئیات یک موقعیت شغلی بر اساس شناسه' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای موقعیت شغلی' })
  async findPositionById(@Param('id') id: string) {
    return this.careersService.findPositionById(id);
  }

  // ─── Admin: Job Positions CRUD & Stats ────────────────────────

  @Get('admin/positions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'دریافت کلیه موقعیت‌های شغلی فعال و غیرفعال (ادمین)' })
  async findAdminPositions(@Query() query: JobPositionQueryDto) {
    return this.careersService.findAllPositions(query, true);
  }

  @Get('admin/stats')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'دریافت آمار کلی فرصت‌های شغلی و رزومه‌ها (ادمین)' })
  async getAdminStats() {
    return this.careersService.getStats();
  }

  @Post('positions')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'ایجاد موقعیت شغلی جدید توسط ادمین' })
  async createPosition(@Body() dto: CreateJobPositionDto) {
    return this.careersService.createPosition(dto);
  }

  @Put('positions/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'ویرایش موقعیت شغلی توسط ادمین' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای موقعیت شغلی' })
  async updatePosition(@Param('id') id: string, @Body() dto: UpdateJobPositionDto) {
    return this.careersService.updatePosition(id, dto);
  }

  @Patch('positions/:id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'غیرفعال/فعال کردن موقعیت شغلی توسط ادمین' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای موقعیت شغلی' })
  async togglePositionActive(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.careersService.togglePositionActive(id, !!body.isActive);
  }

  @Delete('positions/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'حذف موقعیت شغلی توسط ادمین' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای موقعیت شغلی' })
  async deletePosition(
    @Param('id') id: string,
    @Query('force') force?: string,
  ) {
    return this.careersService.deletePosition(id, force === 'true');
  }

  // ─── Public: Submit Job Application ────────────────────────────

  @Post('applications')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('resume'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'ارسال درخواست استخدام و رزومه توسط متقاضی (عمومی)' })
  async createApplication(
    @UploadedFile() file: UploadedMulterFile,
    @Body() dto: CreateJobApplicationDto,
  ) {
    if (!file) {
      throw new BadRequestException('فایل رزومه ارسال نشده است.');
    }

    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const ext = file.originalname
      .substring(file.originalname.lastIndexOf('.'))
      .toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        'فرمت فایل نامعتبر است. لطفاً فایل رزومه با پسوند PDF یا Word ارسال فرمایید.',
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException(
        'حجم فایل رزومه بیش از حد مجاز (حداکثر ۱۰ مگابایت) است.',
      );
    }

    const uploadsDir = fs.existsSync(path.resolve(process.cwd(), 'backend'))
      ? path.resolve(process.cwd(), 'backend', 'uploads', 'resumes')
      : path.resolve(process.cwd(), 'uploads', 'resumes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeFilename = `${Date.now()}-${randomUUID().substring(0, 8)}${ext}`;
    const filePath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(filePath, file.buffer);

    const resumeFileUrl = `/uploads/resumes/${safeFilename}`;
    return this.careersService.createApplication({
      ...dto,
      resumeFileName: file.originalname,
      resumeFileUrl,
    });
  }

  // ─── Admin: Job Applications Management ────────────────────────

  @Get('applications')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'دریافت لیست درخواست‌های استخدامی (ادمین)' })
  async findAllApplications(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: JobApplicationStatus,
    @Query('positionId') positionId?: string,
  ) {
    return this.careersService.findAllApplications(page, limit, search, status, positionId);
  }

  @Get('applications/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'دریافت جزئیات یک درخواست استخدامی (ادمین)' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای درخواست استخدامی' })
  async findApplicationById(@Param('id') id: string) {
    return this.careersService.findApplicationById(id);
  }

  @Patch('applications/:id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'تغییر وضعیت درخواست استخدامی (ادمین)' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای درخواست استخدامی' })
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateJobApplicationStatusDto,
  ) {
    return this.careersService.updateApplicationStatus(id, dto);
  }

  @Delete('applications/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'حذف درخواست استخدامی (ادمین)' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای درخواست استخدامی' })
  async deleteApplication(@Param('id') id: string) {
    return this.careersService.deleteApplication(id);
  }
}
