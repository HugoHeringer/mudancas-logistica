/**
 * Abstract SMS service interface.
 * Implementations: SmsPlaceholderService (dev), SmsTwilioService (prod).
 */
export interface ISmsService {
  /**
   * Send an SMS message.
   * Returns the provider's message ID or null if not applicable.
   */
  send(to: string, message: string): Promise<string | null>;

  /**
   * Send a template-based SMS (e.g. "motorista a caminho").
   * Variables are replaced in the message string.
   */
  sendTemplate(to: string, template: string, variables: Record<string, string>): Promise<string | null>;
}

/** NestJS injection token for ISmsService */
export const SMS_SERVICE_TOKEN = 'SMS_SERVICE';
