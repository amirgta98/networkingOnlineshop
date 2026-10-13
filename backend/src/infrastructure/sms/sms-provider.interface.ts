export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  providerStatus?: string | number;
  errorMessage?: string;
}

export interface ISmsProvider {
  /**
   * Sends an OTP code to a destination phone number.
   * Note: An accepted SMS request indicates that the provider accepted the dispatch;
   * it does not guarantee carrier delivery.
   */
  sendOtp(to: string, code: string): Promise<SmsSendResult>;
}
