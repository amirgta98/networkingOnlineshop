import { User } from '../../../domain/entities/user.entity.js';

export interface UserOutputDto {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class UserOutputMapper {
  public static toDto(user: User): UserOutputDto {
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
