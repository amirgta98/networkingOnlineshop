import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard } from '../guards/auth.guard.js';
import { GetUserAddressesUseCase } from '../../application/use-cases/address/get-user-addresses.use-case.js';
import { GetAddressByIdUseCase } from '../../application/use-cases/address/get-address-by-id.use-case.js';
import { CreateAddressUseCase } from '../../application/use-cases/address/create-address.use-case.js';
import { UpdateAddressUseCase } from '../../application/use-cases/address/update-address.use-case.js';
import { DeleteAddressUseCase } from '../../application/use-cases/address/delete-address.use-case.js';
import { SetDefaultAddressUseCase } from '../../application/use-cases/address/set-default-address.use-case.js';
import { CreateAddressRequestDto } from '../dto/request/address/create-address.request.dto.js';
import { UpdateAddressRequestDto } from '../dto/request/address/update-address.request.dto.js';
import { AddressResponseDto } from '../dto/response/address/address.response.dto.js';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role?: string;
    phone?: string;
  };
}

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('addresses')
export class AddressController {
  constructor(
    private readonly getUserAddressesUseCase: GetUserAddressesUseCase,
    private readonly getAddressByIdUseCase: GetAddressByIdUseCase,
    private readonly createAddressUseCase: CreateAddressUseCase,
    private readonly updateAddressUseCase: UpdateAddressUseCase,
    private readonly deleteAddressUseCase: DeleteAddressUseCase,
    private readonly setDefaultAddressUseCase: SetDefaultAddressUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست تمامی نشانی‌های کاربر جاری' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست نشانی‌های ثبت‌شده با موفقیت بازگردانده شد.',
    type: [AddressResponseDto],
  })
  async getMyAddresses(@Req() req: AuthenticatedRequest): Promise<AddressResponseDto[]> {
    const list = await this.getUserAddressesUseCase.execute(req.user.sub);
    return list.map((entity) => AddressResponseDto.fromDomain(entity));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت یک نشانی جدید برای کاربر جاری' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'نشانی با موفقیت ایجاد و ذخیره شد.',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'اطلاعات ورودی نامعتبر است.',
  })
  async createAddress(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAddressRequestDto,
  ): Promise<AddressResponseDto> {
    const created = await this.createAddressUseCase.execute(req.user.sub, {
      title: dto.title,
      type: dto.type || dto.tag,
      recipientFirstName: dto.recipientFirstName,
      recipientLastName: dto.recipientLastName,
      recipientName: dto.recipientName,
      recipientMobile: dto.recipientMobile,
      phoneNumber: dto.phoneNumber,
      province: dto.province,
      city: dto.city,
      detailedAddress: dto.detailedAddress || dto.fullAddress || dto.address,
      plaque: dto.plaque || dto.buildingNumber,
      unit: dto.unit,
      postalCode: dto.postalCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      deliveryNotes: dto.deliveryNotes,
      isDefault: dto.isDefault,
    });
    return AddressResponseDto.fromDomain(created);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت مشخصات یک نشانی با شناسه' })
  @ApiParam({ name: 'id', description: 'شناسه نشانی' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'مشخصات نشانی بازگردانده شد.',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'نشانی پیدا نشد.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'کاربر اجازه دسترسی به این نشانی را ندارد.',
  })
  async getAddressById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<AddressResponseDto> {
    const address = await this.getAddressByIdUseCase.execute(req.user.sub, id);
    return AddressResponseDto.fromDomain(address);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش مشخصات نشانی' })
  @ApiParam({ name: 'id', description: 'شناسه نشانی' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'نشانی با موفقیت بروزرسانی شد.',
    type: AddressResponseDto,
  })
  async updateAddress(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateAddressRequestDto,
  ): Promise<AddressResponseDto> {
    const updated = await this.updateAddressUseCase.execute(req.user.sub, id, {
      title: dto.title,
      type: dto.type || dto.tag,
      recipientFirstName: dto.recipientFirstName,
      recipientLastName: dto.recipientLastName,
      recipientName: dto.recipientName,
      recipientMobile: dto.recipientMobile,
      phoneNumber: dto.phoneNumber,
      province: dto.province,
      city: dto.city,
      detailedAddress: dto.detailedAddress || dto.fullAddress || dto.address,
      plaque: dto.plaque || dto.buildingNumber,
      unit: dto.unit,
      postalCode: dto.postalCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      deliveryNotes: dto.deliveryNotes,
      isDefault: dto.isDefault,
    });
    return AddressResponseDto.fromDomain(updated);
  }

  @Patch(':id/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تنظیم یک نشانی به عنوان نشانی پیش‌فرض ارسال' })
  @ApiParam({ name: 'id', description: 'شناسه نشانی' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'نشانی پیش‌فرض با موفقیت تنظیم شد.',
    type: AddressResponseDto,
  })
  async setDefaultAddress(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<AddressResponseDto> {
    const result = await this.setDefaultAddressUseCase.execute(req.user.sub, id);
    return AddressResponseDto.fromDomain(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف یک نشانی' })
  @ApiParam({ name: 'id', description: 'شناسه نشانی' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'نشانی با موفقیت حذف شد.',
  })
  async deleteAddress(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.deleteAddressUseCase.execute(req.user.sub, id);
    return {
      success: true,
      message: 'نشانی با موفقیت حذف شد.',
    };
  }
}
