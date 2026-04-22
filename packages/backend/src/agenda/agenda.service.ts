import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBloqueioDto } from './dto/create-bloqueio.dto';
import { UpdateConfigAgendaDto } from './dto/update-config-agenda.dto';

@Injectable()
export class AgendaService {
  constructor(private prisma: PrismaService) {}

  async getSlotsByDate(tenantId: string, dataStr: string) {
    // [2.7] Normalize date comparison for DateTime field
    const inicioDia = new Date(dataStr + 'T00:00:00.000');
    const fimDia = new Date(dataStr + 'T23:59:59.999');

    const existingSlots = await this.prisma.slotAgenda.findMany({
      where: { tenantId, data: { gte: inicioDia, lte: fimDia } },
      orderBy: { horaInicio: 'asc' },
    });

    if (existingSlots.length > 0) {
      return existingSlots;
    }

    const config = await this.getConfigAgenda(tenantId) as any;
    const diaSemana = new Date(dataStr).getDay();
    const diaSemanaMap = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaSemanaKey = diaSemanaMap[diaSemana];

    if (config.diasFuncionamento && !config.diasFuncionamento[diaSemanaKey]) {
      return [];
    }

    const horaAbertura = config.horaAbertura || '08:00';
    const horaFecho = config.horaFecho || '18:00';
    const duracaoMinutos = config.duracaoSlotMinutos || 60;
    const capacidade = config.capacidadeSlot || 1;

    const slotsData: any[] = [];
    const [aberturaH, aberturaM] = horaAbertura.split(':').map(Number);
    const [fechoH, fechoM] = horaFecho.split(':').map(Number);

    let horaAtual = aberturaH * 60 + aberturaM;
    const horaFim = fechoH * 60 + fechoM;

    while (horaAtual + duracaoMinutos <= horaFim) {
      const h = Math.floor(horaAtual / 60);
      const m = horaAtual % 60;
      const horaInicio = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const hFim = Math.floor((horaAtual + duracaoMinutos) / 60);
      const mFim = (horaAtual + duracaoMinutos) % 60;
      const horaFimSlot = `${hFim.toString().padStart(2, '0')}:${mFim.toString().padStart(2, '0')}`;
      slotsData.push({
        tenantId,
        data: dataStr,
        horaInicio,
        horaFim: horaFimSlot,
        capacidadeTotal: capacidade,
        capacidadeOcupada: 0,
        eBloqueado: false,
      });
      horaAtual += duracaoMinutos;
    }

    // [2.4] Persist dynamically generated slots before returning
    if (slotsData.length > 0) {
      await this.prisma.slotAgenda.createMany({ data: slotsData });
      return this.prisma.slotAgenda.findMany({
        where: { tenantId, data: { gte: inicioDia, lte: fimDia } },
        orderBy: { horaInicio: 'asc' },
      });
    }

    return [];
  }

  async getSlotsByRange(tenantId: string, dataInicio: string, dataFim: string) {
    const inicio = new Date(dataInicio + 'T00:00:00.000');
    const fim = new Date(dataFim + 'T23:59:59.999');
    return this.prisma.slotAgenda.findMany({
      where: {
        tenantId,
        data: {
          gte: inicio,
          lte: fim,
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
    const inicioStr = inicio.toISOString();
    const fimStr = fim.toISOString();

    const [slots, mudancas] = await Promise.all([
      this.getSlotsByRange(tenantId, inicio.toISOString().split('T')[0], fim.toISOString().split('T')[0]),
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
      const dataKey = slot.data.toISOString().split('T')[0];
      if (!acc[dataKey]) {
        acc[dataKey] = [];
      }
      acc[dataKey].push(slot);
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
    const fim = new Date(ano, mes, 0, 23, 59, 59);
    const inicioStr = inicio.toISOString();
    const fimStr = fim.toISOString();

    const [slots, mudancas] = await Promise.all([
      this.getSlotsByRange(tenantId, inicio.toISOString().split('T')[0], fim.toISOString().split('T')[0]),
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
      const dataKey = slot.data.toISOString().split('T')[0];
      if (!acc[dataKey]) {
        acc[dataKey] = {
          total: 0,
          ocupada: 0,
          bloqueada: false,
        };
      }
      acc[dataKey].total += slot.capacidadeTotal;
      acc[dataKey].ocupada += slot.capacidadeOcupada;
      if (slot.eBloqueado) acc[dataKey].bloqueada = true;
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
    const inicioDia = new Date(data + 'T00:00:00.000');
    const fimDia = new Date(data + 'T23:59:59.999');
    const existentes = await this.prisma.slotAgenda.findMany({
      where: { tenantId, data: { gte: inicioDia, lte: fimDia } },
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
    // [2.4] Ensure slots exist for this date before trying to occupy
    await this.getSlotsByDate(tenantId, data);

    const inicioDia = new Date(data + 'T00:00:00.000');
    const fimDia = new Date(data + 'T23:59:59.999');

    const slot = await this.prisma.slotAgenda.findFirst({
      where: { tenantId, data: { gte: inicioDia, lte: fimDia }, horaInicio },
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
    const inicioDia = new Date(data + 'T00:00:00.000');
    const fimDia = new Date(data + 'T23:59:59.999');

    const slot = await this.prisma.slotAgenda.findFirst({
      where: { tenantId, data: { gte: inicioDia, lte: fimDia }, horaInicio },
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
