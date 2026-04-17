import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISmsService } from './sms.interface';

/**
 * Twilio SMS service for production.
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER env vars.
 * Falls back to SmsPlaceholderService if credentials are missing.
 */
@Injectable()
export class SmsTwilioService implements ISmsService, OnModuleInit {
  private readonly logger = new Logger(SmsTwilioService.name);
  private client: any = null;
  private fromPhone: string = '';
  private enabled = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER', '');

    if (accountSid && authToken && this.fromPhone) {
      try {
        // Dynamic import to avoid hard dependency
        const twilio = require('twilio');
        this.client = twilio(accountSid, authToken);
        this.enabled = true;
        this.logger.log('Twilio SMS service initialized');
      } catch {
        this.logger.warn('Twilio SDK not installed — SMS will be logged as placeholder');
      }
    } else {
      this.logger.warn('Twilio credentials not configured — SMS will be logged as placeholder');
    }
  }

  async send(to: string, message: string): Promise<string | null> {
    if (!this.enabled || !this.client) {
      this.logger.log(`[SMS FALLBACK] To: ${to} | Message: ${message}`);
      return `fallback-${Date.now()}`;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromPhone,
        to,
      });
      this.logger.log(`SMS sent to ${to} (sid=${result.sid})`);
      return result.sid;
    } catch (err: any) {
      this.logger.error(`SMS failed to ${to}: ${err.message}`);
      return null;
    }
  }

  async sendTemplate(to: string, template: string, variables: Record<string, string>): Promise<string | null> {
    let message = template;
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return this.send(to, message);
  }
}
