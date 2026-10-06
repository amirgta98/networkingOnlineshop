import { describe, it, expect, beforeEach } from 'vitest';
import { CreateUserUseCase } from '../../src/application/use-cases/user/create-user.use-case.js';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user.repository.js';
import { UserAlreadyExistsException } from '../../src/domain/exceptions/user-already-exists.exception.js';
import { InvalidEmailException } from '../../src/domain/exceptions/invalid-email.exception.js';

describe('CreateUserUseCase (Unit Test)', () => {
  let userRepository: InMemoryUserRepository;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    useCase = new CreateUserUseCase(userRepository);
  });

  it('should successfully create and return a new user', async () => {
    const result = await useCase.execute({
      email: 'alex@example.com',
      name: 'Alex Developer',
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.email).toBe('alex@example.com');
    expect(result.name).toBe('Alex Developer');
    expect(result.isActive).toBe(true);
    expect(result.createdAt).toBeDefined();

    // Verify it is actually persisted in the repository
    const persisted = await userRepository.findById(result.id);
    expect(persisted).not.toBeNull();
    expect(persisted?.email.value).toBe('alex@example.com');
  });

  it('should throw UserAlreadyExistsException when email is already registered', async () => {
    await useCase.execute({
      email: 'duplicate@example.com',
      name: 'User One',
    });

    await expect(
      useCase.execute({
        email: 'duplicate@example.com',
        name: 'User Two',
      }),
    ).rejects.toThrow(UserAlreadyExistsException);
  });

  it('should throw InvalidEmailException when email format is invalid', async () => {
    await expect(
      useCase.execute({
        email: 'invalid-email-format',
        name: 'User Three',
      }),
    ).rejects.toThrow(InvalidEmailException);
  });
});
