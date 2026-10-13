import { PartialType } from '@nestjs/swagger';
import { CreateCategoryRequestDto } from './create-category.request.dto.js';

export class UpdateCategoryRequestDto extends PartialType(CreateCategoryRequestDto) {}
