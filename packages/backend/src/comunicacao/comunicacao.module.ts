import { Module } from '@nestjs/common';
import { ComunicacaoService } from './comunicacao.service';
import { ComunicacaoController } from './comunicacao.controller';
import { EmailService } from './email.service';
import { SMS_SERVICE_TOKEN } from './sms.interface';
import { SmsPlaceholderService } from './sms-placeholder.service';

@Module({
  controllers: [ComunicacaoController],
  providers: [
    ComunicacaoService,
    EmailService,
    { provide: SMS_SERVICE_TOKEN, useClass: SmsPlaceholderService },
  ],
  exports: [ComunicacaoService, EmailService, SMS_SERVICE_TOKEN],
})
export class ComunicacaoModule {}
