import { Injectable, Logger } from '@nestjs/common';
import { RateLimitExceededException } from '../../domain/exceptions/auth.exceptions.js';

interface RateLimitRecord {
  timestamps: number[];
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly phoneStore = new Map<string, RateLimitRecord>();
  private readonly ipStore = new Map<string, RateLimitRecord>();

  private readonly maxPhoneRequests: number;
  private readonly maxIpRequests: number;
  private readonly windowMs: number;

  constructor() {
    this.maxPhoneRequests = parseInt(process.env.RATE_LIMIT_PHONE_MAX ?? '5', 10);
    this.maxIpRequests = parseInt(process.env.RATE_LIMIT_IP_MAX ?? '15', 10);
    this.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS ?? '600', 10) * 1000; // 10 minutes default
  }

  public checkPhoneRateLimit(phone: string): void {
    this.checkLimit(this.phoneStore, phone, this.maxPhoneRequests, 'شماره همراه');
  }

  public checkIpRateLimit(ipAddress?: string | null): void {
    if (!ipAddress) return;
    this.checkLimit(this.ipStore, ipAddress, this.maxIpRequests, 'آدرس IP');
  }

  private checkLimit(
    store: Map<string, RateLimitRecord>,
    key: string,
    maxLimit: number,
    label: string,
  ): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = store.get(key);
    if (!record) {
      record = { timestamps: [] };
      store.set(key, record);
    }

    // Filter out old timestamps outside window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= maxLimit) {
      const oldestInWindow = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((oldestInWindow + this.windowMs - now) / 1000);
      this.logger.warn(`Rate limit triggered for ${label} [${key}]. Limit: ${maxLimit}`);
      throw new RateLimitExceededException(Math.max(1, retryAfterSeconds));
    }

    // Record this attempt
    record.timestamps.push(now);
  }
}
