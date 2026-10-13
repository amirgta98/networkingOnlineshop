import { AuthOtpChallenge } from '../entities/auth-otp-challenge.entity.js';

export interface IAuthOtpChallengeRepository {
  create(challenge: AuthOtpChallenge): Promise<void>;
  findById(id: string): Promise<AuthOtpChallenge | null>;
  findLatestActiveByPhone(phone: string): Promise<AuthOtpChallenge | null>;
  update(challenge: AuthOtpChallenge): Promise<void>;
  countRecentRequests(phone: string, windowSeconds: number): Promise<number>;
  countRecentRequestsByIp(ipAddress: string, windowSeconds: number): Promise<number>;
}
