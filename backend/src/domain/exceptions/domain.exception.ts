/**
 * Base class for all domain-specific exceptions.
 * The domain layer throws these exceptions without any knowledge
 * of HTTP status codes or presentation logic.
 */
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
