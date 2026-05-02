import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { ComunicacaoService } from './comunicacao.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private globalResend: Resend | null;
  private globalFromEmail: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private comunicacaoService: ComunicacaoService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.globalResend = apiKey ? new Resend(apiKey) : null;
    this.globalFromEmail = this.configService.get<string>('EMAIL_FROM', 'noreply@mudancas.app');
  }

  private async getTenantResendConfig(tenantId: string): Promise<{ resend: Resend | null; fromEmail: string; fromNome: string }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { configComunicacao: true, configMarca: true },
    });
    const config = (tenant?.configComunicacao as Record<string, any>) || {};
    const brand = (tenant?.configMarca as Record<string, any>) || {};

    if (config.resendApiKey) {
      return {
        resend: new Resend(config.resendApiKey),
        fromEmail: config.resendFromEmail || this.globalFromEmail,
        fromNome: config.resendFromNome || brand.nome || 'Mudanças',
      };
    }

    this.logger.warn(`Tenant ${tenantId} sem Resend configurado, usando key global Movefy`);
    return {
      resend: this.globalResend,
      fromEmail: this.globalFromEmail,
      fromNome: brand.nome || 'Mudanças',
    };
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

      // 3. Send via Resend (tenant-specific or global fallback)
      const { resend, fromEmail, fromNome } = await this.getTenantResendConfig(tenantId);
      if (!resend) {
        this.logger.warn(`Resend not configured — skipping send to ${to} (template: ${templateNome})`);
        return;
      }
      const fromField = fromNome ? `${fromNome} <${fromEmail}>` : fromEmail;
      const { data, error } = await resend.emails.send({
        from: fromField,
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
