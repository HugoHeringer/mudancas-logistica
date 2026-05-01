import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addHours, format } from 'date-fns';

export interface ConflictResult {
  hasConflict: boolean;
  type?: 'motorista' | 'veiculo' | 'ajudante';
  entityName?: string;
  existingMudancaId?: string;
  message?: string;
}

@Injectable()
export class ConflictDetectorService {
  private readonly timeZone = 'Europe/Lisbon';

  constructor(private prisma: PrismaService) {}

  /**
   * Verifica se há conflito de agenda baseado em horários.
   * Suporta motorista, veículo e ajudante.
   */
  async checkConflicts(
    tenantId: string,
    data: Date,
    horaPretendida: string,
    duracaoHoras: number,
    motoristaId?: string,
    veiculoId?: string,
    ignoreMudancaId?: string,
  ): Promise<ConflictResult> {
    if (!motoristaId && !veiculoId) return { hasConflict: false };

    const start = this.combineDateAndTime(data, horaPretendida);
    const end = addHours(start, duracaoHoras || 4);

    const inicioDia = new Date(data);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(data);
    fimDia.setHours(23, 59, 59, 999);

    const mudancasNoDia = await this.prisma.mudanca.findMany({
      where: {
        tenantId,
        dataPretendida: { gte: inicioDia, lte: fimDia },
        estado: { in: ['aprovada', 'a_caminho', 'em_servico'] },
        id: ignoreMudancaId ? { not: ignoreMudancaId } : undefined,
        OR: [
          motoristaId ? { motoristaId } : {},
          veiculoId ? { veiculoId } : {},
        ].filter(obj => Object.keys(obj).length > 0),
      },
      select: {
        id: true,
        motoristaId: true,
        veiculoId: true,
        dataPretendida: true,
        horaPretendida: true,
        tempoEstimadoHoras: true,
        motorista: { select: { nome: true } },
        veiculo: { select: { nome: true } },
      },
    });

    for (const m of mudancasNoDia) {
      const mStart = this.combineDateAndTime(m.dataPretendida, m.horaPretendida || '08:00');
      const mEnd = addHours(mStart, Number(m.tempoEstimadoHoras || 4));

      const overlap = start < mEnd && end > mStart;

      if (overlap) {
        if (motoristaId && m.motoristaId === motoristaId) {
          const nome = m.motorista?.nome || 'Motorista';
          return {
            hasConflict: true,
            type: 'motorista',
            entityName: nome,
            existingMudancaId: m.id,
            message: `${nome} já tem serviço das ${format(mStart, 'HH:mm')} às ${format(mEnd, 'HH:mm')}`,
          };
        }
        if (veiculoId && m.veiculoId === veiculoId) {
          const nome = m.veiculo?.nome || 'Veículo';
          return {
            hasConflict: true,
            type: 'veiculo',
            entityName: nome,
            existingMudancaId: m.id,
            message: `${nome} já tem serviço das ${format(mStart, 'HH:mm')} às ${format(mEnd, 'HH:mm')}`,
          };
        }
      }
    }

    return { hasConflict: false };
  }

  /**
   * Verifica conflito para uma entidade específica (motorista, veículo ou ajudante).
   * Retorna mensagem descritiva com nome e horário.
   */
  async detectarConflito(
    tenantId: string,
    entidadeId: string,
    tipoEntidade: 'motorista' | 'veiculo' | 'ajudante',
    data: Date,
    horaPretendida: string,
    duracaoHoras: number,
    excluirMudancaId?: string,
  ): Promise<ConflictResult> {
    const start = this.combineDateAndTime(data, horaPretendida);
    const end = addHours(start, duracaoHoras || 4);

    const inicioDia = new Date(data);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(data);
    fimDia.setHours(23, 59, 59, 999);

    // Build where clause based on entity type
    const entityFilter: any = {};
    if (tipoEntidade === 'motorista') entityFilter.motoristaId = entidadeId;
    else if (tipoEntidade === 'veiculo') entityFilter.veiculoId = entidadeId;
    // For ajudante, we use the relation

    let mudancasNoDia: any[];

    if (tipoEntidade === 'ajudante') {
      mudancasNoDia = await this.prisma.mudanca.findMany({
        where: {
          tenantId,
          dataPretendida: { gte: inicioDia, lte: fimDia },
          estado: { in: ['aprovada', 'a_caminho', 'em_servico'] },
          id: excluirMudancaId ? { not: excluirMudancaId } : undefined,
          ajudantes: { some: { id: entidadeId } },
        },
        select: {
          id: true,
          dataPretendida: true,
          horaPretendida: true,
          tempoEstimadoHoras: true,
          ajudantes: { where: { id: entidadeId }, select: { nome: true } },
        },
      });
    } else {
      mudancasNoDia = await this.prisma.mudanca.findMany({
        where: {
          tenantId,
          dataPretendida: { gte: inicioDia, lte: fimDia },
          estado: { in: ['aprovada', 'a_caminho', 'em_servico'] },
          id: excluirMudancaId ? { not: excluirMudancaId } : undefined,
          ...entityFilter,
        },
        select: {
          id: true,
          dataPretendida: true,
          horaPretendida: true,
          tempoEstimadoHoras: true,
          motorista: tipoEntidade === 'motorista' ? { select: { nome: true } } : false,
          veiculo: tipoEntidade === 'veiculo' ? { select: { nome: true } } : false,
        },
      });
    }

    for (const m of mudancasNoDia) {
      const mStart = this.combineDateAndTime(m.dataPretendida, m.horaPretendida || '08:00');
      const mEnd = addHours(mStart, Number(m.tempoEstimadoHoras || 4));

      const overlap = start < mEnd && end > mStart;

      if (overlap) {
        let nome: string;
        if (tipoEntidade === 'motorista') nome = m.motorista?.nome || 'Motorista';
        else if (tipoEntidade === 'veiculo') nome = m.veiculo?.nome || 'Veículo';
        else nome = m.ajudantes?.[0]?.nome || 'Ajudante';

        return {
          hasConflict: true,
          type: tipoEntidade,
          entityName: nome,
          existingMudancaId: m.id,
          message: `${nome} já tem serviço das ${format(mStart, 'HH:mm')} às ${format(mEnd, 'HH:mm')}`,
        };
      }
    }

    return { hasConflict: false };
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const d = new Date(date);
    d.setHours(hours || 8, minutes || 0, 0, 0);
    return d;
  }
}
