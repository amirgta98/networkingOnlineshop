import { Email } from '../value-objects/email.vo.js';

export interface UserProps {
  id: string;
  email: Email;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserParams {
  id: string;
  email: string;
  name: string;
}

/**
 * Domain Entity representing a User.
 * Zero dependencies on ORM or NestJS.
 */
export class User {
  private readonly _id: string;
  private _email: Email;
  private _name: string;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email;
    this._name = props.name;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * Factory method to create a new User instance enforcing business invariants.
   */
  public static create(params: CreateUserParams): User {
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('User name cannot be empty.');
    }

    const now = new Date();
    return new User({
      id: params.id,
      email: Email.create(params.email),
      name: params.name.trim(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Getters for properties (read-only access)
  public get id(): string {
    return this._id;
  }

  public get email(): Email {
    return this._email;
  }

  public get name(): string {
    return this._name;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Domain Business Operations
  public changeName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('User name cannot be empty.');
    }
    this._name = newName.trim();
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  public activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }
}
