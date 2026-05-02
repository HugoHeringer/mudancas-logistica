import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private resend: Resend | null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const key = this.configService.get<string>('RESEND_API_KEY');
    this.resend = key ? new Resend(key) : null;
  }

  /**
   * Reset mensal de horas trabalhadas e valor recebido
   * Corre no dia 1 de cada mês à 00:00
   */
  @Cron('0 0 1 * *')
  async resetMensalHorasEValor() {
    this.logger.log('Iniciando reset mensal de horas/valor para motoristas e ajudantes...');

    try {
      const motoristasResult = await this.prisma.motorista.updateMany({
        data: {
          horasTrabalhadasMes: 0,
          valorRecebidoMes: 0,
        },
      });

      const ajudantesResult = await this.prisma.ajudante.updateMany({
        data: {
          horasTrabalhadasMes: 0,
          valorRecebidoMes: 0,
        },
      });

      this.logger.log(
        `Reset concluído: ${motoristasResult.count} motoristas, ${ajudantesResult.count} ajudantes`,
      );
    } catch (error) {
      this.logger.error('Erro no reset mensal:', error);
    }
  }

  /**
   * Verifica expiração de trials diariamente às 08:00
   * 1. Notifica superadmin de trials expirados (sem notificação anterior)
   * 2. Bloqueia automaticamente tenants com trial expirado
   */
  @Cron('0 8 * * *')
  async checkTrialExpirations() {
    this.logger.log('Verificando expiração de trials...');

    try {
      const agora = new Date();

      // 1. Buscar tenants em_setup com trial expirado e ainda não notificados
      const tenantsParaNotificar = await this.prisma.tenant.findMany({
        where: {
          estado: 'em_setup',
          trialFim: { lt: agora },
          trialNotificadoEm: null,
        },
      });

      // 2. Enviar notificação ao superadmin
      if (tenantsParaNotificar.length > 0 && this.resend) {
        const fromEmail = this.configService.get<string>('EMAIL_FROM', 'noreply@movefy.pt');
        const superAdminEmail = this.configService.get<string>('SUPERADMIN_EMAIL');

        if (superAdminEmail) {
          const lista = tenantsParaNotificar
            .map((t) => {
              const marca = (t.configMarca as any)?.nome || t.subdomain;
              const expirouEm = t.trialFim ? new Date(t.trialFim).toLocaleDateString('pt-PT') : '—';
              return `- ${marca} (${t.slug}) — expirou em ${expirouEm}`;
            })
            .join('\n');

          await this.resend.emails.send({
            from: fromEmail,
            to: [superAdminEmail],
            subject: `[Movefy] ${tenantsParaNotificar.length} tenant(s) com trial expirado`,
            text: `Os seguintes tenants tiveram o trial expirado:\n\n${lista}\n\nAcesse o console para activar ou suspender.`,
          }).catch(() => {});
        }

        // 3. Marcar como notificado para não re-notificar
        await this.prisma.tenant.updateMany({
          where: {
            id: { in: tenantsParaNotificar.map((t) => t.id) },
          },
          data: { trialNotificadoEm: agora },
        });
      }

      // 4. Bloquear automaticamente: estado → 'suspensa'
      const bloqueados = await this.prisma.tenant.updateMany({
        where: {
          estado: 'em_setup',
          trialFim: { lt: agora },
        },
        data: {
          estado: 'suspensa',
          eAtivo: false,
        },
      });

      // Log de cada bloqueio
      const tenantsBloqueados = await this.prisma.tenant.findMany({
        where: {
          estado: 'suspensa',
          trialFim: { lt: agora },
          trialNotificadoEm: { not: null },
        },
        select: { id: true },
      });

      for (const t of tenantsBloqueados) {
        await this.prisma.tenantLog.create({
          data: {
            tenantId: t.id,
            acao: 'BLOQUEIO_AUTOMATICO_TRIAL',
            entidade: 'Tenant',
            detalhes: { motivo: 'Trial expirado — bloqueado automaticamente pelo cron' },
          },
        }).catch(() => {});
      }

      this.logger.log(`${bloqueados.count} tenants bloqueados por expiração de trial.`);
    } catch (error) {
      this.logger.error('Erro na verificação de expiração de trial:', error);
    }
  }
}
