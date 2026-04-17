import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { ComunicacaoService } from './comunicacao.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private comunicacaoService: ComunicacaoService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : (null as any);
    this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'noreply@mudancas.app');
  }

  /**
   * Render template and send email. Fire-and-forget from caller's perspective.
   * Logs result to EmailLog.
   */
  send(
    tenantId: string,
    to: string,
    templateNome: string,
    variaveis: Record<string, any>,
    mudancaId?: string,
  ): void {
    this._sendInternal(tenantId, to, templateNome, variaveis, mudancaId).catch(() => {
      // Already logged internally; swallow to prevent unhandled rejection
    });
  }

  private async _sendInternal(
    tenantId: string,
    to: string,
    templateNome: string,
    variaveis: Record<string, any>,
    mudancaId?: string,
  ) {
    try {
      // 1. Resolve nomeEmpresa if not provided
      if (!variaveis.nomeEmpresa) {
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { configMarca: true },
        });
        variaveis = {
          ...variaveis,
          nomeEmpresa: (tenant?.configMarca as any)?.nome || 'Mudanças',
        };
      }

      // 2. Render template using ComunicacaoService
      const rendered = await this.comunicacaoService.renderTemplate(tenantId, templateNome, variaveis);

      if (!rendered.eAtivo) {
        this.logger.log(`Template "${templateNome}" is inactive — skipping send to ${to}`);
        return;
      }

      // 3. Send via Resend
      if (!this.resend) {
        this.logger.warn(`Resend not configured — skipping send to ${to} (template: ${templateNome})`);
        return;
      }
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject: rendered.assunto,
        html: rendered.corpo,
      });

      if (error) {
        throw new Error(error.message);
      }

      // 4. Log success
      await this.prisma.emailLog.create({
        data: {
          tenantId,
          mudancaId,
          destinatario: to,
          templateNome,
          assunto: rendered.assunto,
          status: 'enviado',
        },
      });

      this.logger.log(`Email sent: ${templateNome} to ${to} (id=${data?.id})`);
    } catch (err: any) {
      // Log failure
      try {
        await this.prisma.emailLog.create({
          data: {
            tenantId,
            mudancaId,
            destinatario: to,
            templateNome,
            assunto: '',
            status: 'falhou',
            erroMensagem: err.message?.substring(0, 500),
          },
        });
      } catch (logErr) {
        this.logger.error(`Failed to log email error: ${logErr}`);
      }

      this.logger.error(`Email failed: ${templateNome} to ${to} — ${err.message}`);
    }
  }
}
