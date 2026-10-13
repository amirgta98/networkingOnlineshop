import { PartialType } from '@nestjs/swagger';
import { CreateProductRequestDto } from './create-product.request.dto.js';

export class UpdateProductRequestDto extends PartialType(CreateProductRequestDto) {}
