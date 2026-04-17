import { Injectable, Logger } from '@nestjs/common';
import { ISmsService } from './sms.interface';

/**
 * Placeholder SMS service for development.
 * Logs messages to console instead of actually sending them.
 */
@Injectable()
export class SmsPlaceholderService implements ISmsService {
  private readonly logger = new Logger(SmsPlaceholderService.name);

  async send(to: string, message: string): Promise<string | null> {
    this.logger.log(`[SMS PLACEHOLDER] To: ${to} | Message: ${message}`);
    return `placeholder-${Date.now()}`;
  }

  async sendTemplate(to: string, template: string, variables: Record<string, string>): Promise<string | null> {
    let message = template;
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return this.send(to, message);
  }
}
