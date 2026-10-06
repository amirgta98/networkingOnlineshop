import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case.js';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-user-by-id.use-case.js';
import { CreateUserRequestDto } from '../dto/request/create-user.request.dto.js';
import { UserResponseDto } from '../dto/response/user.response.dto.js';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A user with this email already exists.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed or invalid input format.',
  })
  async create(@Body() dto: CreateUserRequestDto): Promise<UserResponseDto> {
    return await this.createUserUseCase.execute({
      email: dto.email,
      name: dto.name,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User UUID identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User details found.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.getUserByIdUseCase.execute(id);
  }
}
