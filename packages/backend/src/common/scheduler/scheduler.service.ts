import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private prisma: PrismaService) {}

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
}
