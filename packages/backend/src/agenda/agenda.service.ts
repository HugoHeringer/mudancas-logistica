import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBloqueioDto } from './dto/create-bloqueio.dto';
import { UpdateConfigAgendaDto } from './dto/update-config-agenda.dto';

@Injectable()
export class AgendaService {
  constructor(private prisma: PrismaService) {}

  async getSlotsByDate(tenantId: string, data: string) {
    return this.prisma.slotAgenda.findMany({
      where: { tenantId, data },
      orderBy: { horaInicio: 'asc' },
    });
  }

  async getSlotsByRange(tenantId: string, dataInicio: string, dataFim: string) {
    return this.prisma.slotAgenda.findMany({
      where: {
        tenantId,
        data: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }],
    });
  }

  async getDisponibilidade(tenantId: string, data: string, horaInicio?: string) {
    const slots = await this.getSlotsByDate(tenantId, data);

    if (horaInicio) {
      const slot = slots.find((s) => s.horaInicio === horaInicio);
      if (!slot) return null;
      return {
        ...slot,
        disponivel: !slot.eBloqueado && slot.capacidadeOcupada < slot.capacidadeTotal,
        slotsLivres: slot.capacidadeTotal - slot.capacidadeOcupada,
      };
    }

    return slots.map((slot) => ({
      ...slot,
      disponivel: !slot.eBloqueado && slot.capacidadeOcupada < slot.capacidadeTotal,
      slotsLivres: slot.capacidadeTotal - slot.capacidadeOcupada,
    }));
  }

  async getAgendaSemanal(tenantId: string, dataInicio: string) {
    const inicio = new Date(dataInicio);
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 6);
    const inicioStr = inicio.toISOString().split('T')[0];
    const fimStr = fim.toISOString().split('T')[0];

    const [slots, mudancas] = await Promise.all([
      this.getSlotsByRange(tenantId, inicioStr, fimStr),
      this.prisma.mudanca.findMany({
        where: {
          tenantId,
          dataPretendida: { gte: inicioStr, lte: fimStr },
          estado: { in: ['aprovada', 'a_caminho', 'em_servico', 'concluida'] },
        },
        include: {
          motorista: { select: { id: true, nome: true } },
          veiculo: { select: { id: true, nome: true } },
        },
        orderBy: { horaPretendida: 'asc' },
      }),
    ]);

    // Agrupar por data
    const porData = slots.reduce((acc, slot) => {
      if (!acc[slot.data]) {
        acc[slot.data] = [];
      }
      acc[slot.data].push(slot);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      dias: Object.entries(porData).map(([data, slotsDia]) => ({
        data,
        slots: slotsDia,
        capacidadeTotal: slotsDia.reduce((acc, s) => acc + s.capacidadeTotal, 0),
        capacidadeOcupada: slotsDia.reduce((acc, s) => acc + s.capacidadeOcupada, 0),
        disponivel: slotsDia.some(
          (s) => !s.eBloqueado && s.capacidadeOcupada < s.capacidadeTotal,
        ),
      })),
      mudancas,
    };
  }

  async getAgendaMensal(tenantId: string, ano: number, mes: number) {
    const inicio = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 0);
    const inicioStr = inicio.toISOString().split('T')[0];
    const fimStr = fim.toISOString().split('T')[0];

    const [slots, mudancas] = await Promise.all([
      this.getSlotsByRange(tenantId, inicioStr, fimStr),
      this.prisma.mudanca.findMany({
        where: {
          tenantId,
          dataPretendida: { gte: inicioStr, lte: fimStr },
          estado: { in: ['aprovada', 'a_caminho', 'em_servico', 'concluida'] },
        },
        include: {
          motorista: { select: { id: true, nome: true } },
          veiculo: { select: { id: true, nome: true } },
        },
        orderBy: { horaPretendida: 'asc' },
      }),
    ]);

    // Agrupar por data e calcular ocupação
    const porData = slots.reduce((acc, slot) => {
      if (!acc[slot.data]) {
        acc[slot.data] = {
          total: 0,
          ocupada: 0,
          bloqueada: false,
        };
      }
      acc[slot.data].total += slot.capacidadeTotal;
      acc[slot.data].ocupada += slot.capacidadeOcupada;
      if (slot.eBloqueado) acc[slot.data].bloqueada = true;
      return acc;
    }, {} as Record<string, any>);

    // Gerar todos os dias do mês
    const diasMes: any[] = [];
    for (let d = 1; d <= fim.getDate(); d++) {
      const data = new Date(ano, mes - 1, d).toISOString().split('T')[0];
      const info = porData[data] || { total: 0, ocupada: 0, bloqueada: false };
      diasMes.push({
        data,
        total: info.total,
        ocupada: info.ocupada,
        bloqueada: info.bloqueada,
        disponivel: !info.bloqueada && info.ocupada < info.total,
      });
    }

    return { dias: diasMes, mudancas };
  }

  async criarSlots(tenantId: string, data: string, slots: any[]) {
    // Verificar se já existem slots para esta data
    const existentes = await this.prisma.slotAgenda.findMany({
      where: { tenantId, data },
    });

    if (existentes.length > 0) {
      return existentes;
    }

    // Criar novos slots
    const novosSlots = slots.map((slot) => ({
      tenantId,
      data,
      horaInicio: slot.horaInicio,
      horaFim: slot.horaFim,
      capacidadeTotal: slot.capacidadeTotal || 1,
      capacidadeOcupada: 0,
      eBloqueado: false,
    }));

    return this.prisma.slotAgenda.createMany({
      data: novosSlots,
    });
  }

  async getBloqueios(tenantId: string, dataInicio?: string, dataFim?: string) {
    const where: any = { tenantId };
    if (dataInicio || dataFim) {
      where.OR = [
        { dataInicio: { lte: dataFim || '9999-12-31' }, dataFim: { gte: dataInicio || '0000-01-01' } },
      ];
    }
    return this.prisma.bloqueioAgenda.findMany({
      where,
      orderBy: { dataInicio: 'asc' },
    });
  }

  async criarBloqueio(tenantId: string, createBloqueioDto: CreateBloqueioDto) {
    return this.prisma.bloqueioAgenda.create({
      data: {
        tenantId,
        ...createBloqueioDto,
      },
    });
  }

  async removerBloqueio(tenantId: string, id: string) {
    return this.prisma.bloqueioAgenda.delete({
      where: { id, tenantId },
    });
  }

  async getConfigAgenda(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    return tenant?.configAgenda || {};
  }

  async updateConfigAgenda(tenantId: string, updateConfigAgendaDto: UpdateConfigAgendaDto) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { configAgenda: updateConfigAgendaDto as any },
    });
  }

  async ocuparSlot(tenantId: string, data: string, horaInicio: string) {
    const slot = await this.prisma.slotAgenda.findFirst({
      where: { tenantId, data, horaInicio },
    });

    if (!slot) {
      throw new Error('Slot não encontrado');
    }

    return this.prisma.slotAgenda.update({
      where: { id: slot.id },
      data: { capacidadeOcupada: { increment: 1 } },
    });
  }

  async liberarSlot(tenantId: string, data: string, horaInicio: string) {
    const slot = await this.prisma.slotAgenda.findFirst({
      where: { tenantId, data, horaInicio },
    });

    if (!slot) {
      throw new Error('Slot não encontrado');
    }

    return this.prisma.slotAgenda.update({
      where: { id: slot.id },
      data: { capacidadeOcupada: { decrement: 1 } },
    });
  }
}
