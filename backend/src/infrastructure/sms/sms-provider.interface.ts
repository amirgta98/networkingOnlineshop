export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  providerStatus?: string | number;
  errorMessage?: string;
}

export interface SmsPatternMetadata {
  title?: string;
  renderedText?: string;
  orderNumber?: string;
  customerName?: string;
  adminName?: string;
  [key: string]: unknown;
}

export interface ISmsProvider {
  /**
   * Sends an OTP code to a destination phone number.
   * Note: An accepted SMS request indicates that the provider accepted the dispatch;
   * it does not guarantee carrier delivery.
   */
  sendOtp(to: string, code: string): Promise<SmsSendResult>;

  /**
   * Sends a pre-approved pattern/template SMS message with dynamic parameters.
   */
  sendPattern?(
    to: string,
    bodyId: number,
    args: string[],
    metadata?: SmsPatternMetadata,
  ): Promise<SmsSendResult>;
}
