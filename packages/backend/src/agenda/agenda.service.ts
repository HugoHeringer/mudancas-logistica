import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBloqueioDto } from './dto/create-bloqueio.dto';
import { UpdateConfigAgendaDto } from './dto/update-config-agenda.dto';

@Injectable()
export class AgendaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Modelo de capacidade diária: em vez de slots manuais, usamos
   * capacidadeMaximaDiaria de ConfigAgenda e contamos mudanças aprovadas.
   */

  async getAgendaMensal(tenantId: string, ano: number, mes: number) {
    const inicio = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 0, 23, 59, 59);
    const inicioStr = inicio.toISOString();
    const fimStr = fim.toISOString();

    const config = await this.getConfigAgenda(tenantId) as any;
    const capacidadeMaximaDiaria = config.capacidadeMaximaDiaria || 3;

    const [mudancas, bloqueios] = await Promise.all([
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
      this.prisma.bloqueioAgenda.findMany({
        where: {
          tenantId,
          dataInicio: { lte: fimStr },
          dataFim: { gte: inicioStr },
        },
      }),
    ]);

    // Agrupar mudanças por data
    const mudancasPorData: Record<string, any[]> = {};
    for (const m of mudancas) {
      const dataKey = new Date(m.dataPretendida).toISOString().split('T')[0];
      if (!mudancasPorData[dataKey]) mudancasPorData[dataKey] = [];
      mudancasPorData[dataKey].push({
        id: m.id,
        cliente: m.clienteNome,
        estado: m.estado,
        horaInicio: m.horaPretendida,
        motorista: m.motorista,
        veiculo: m.veiculo,
        tipoServico: m.tipoServico,
      });
    }

    // Gerar todos os dias do mês com capacidade
    const diasMes: any[] = [];
    for (let d = 1; d <= fim.getDate(); d++) {
      const data = new Date(ano, mes - 1, d).toISOString().split('T')[0];
      const mudancasDoDia = mudancasPorData[data] || [];
      const capacidadeOcupada = mudancasDoDia.filter(
        (m: any) => m.estado !== 'concluida',
      ).length;

      // Verificar se há bloqueio neste dia
      const dataObj = new Date(ano, mes - 1, d);
      const eBloqueado = bloqueios.some(
        (b) => dataObj >= new Date(b.dataInicio) && dataObj <= new Date(b.dataFim),
      );

      diasMes.push({
        data,
        mudancas: mudancasDoDia,
        capacidadeOcupada,
        capacidadeTotal: capacidadeMaximaDiaria,
        eDisponivel: !eBloqueado && capacidadeOcupada < capacidadeMaximaDiaria,
        bloqueada: eBloqueado,
      });
    }

    return { dias: diasMes, mudancas };
  }

  async getAgendaSemanal(tenantId: string, dataInicio: string) {
    const inicio = new Date(dataInicio);
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 6);
    const inicioStr = inicio.toISOString();
    const fimStr = fim.toISOString();

    const config = await this.getConfigAgenda(tenantId) as any;
    const capacidadeMaximaDiaria = config.capacidadeMaximaDiaria || 3;

    const [mudancas, bloqueios] = await Promise.all([
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
      this.prisma.bloqueioAgenda.findMany({
        where: {
          tenantId,
          dataInicio: { lte: fimStr },
          dataFim: { gte: inicioStr },
        },
      }),
    ]);

    // Agrupar mudanças por data
    const mudancasPorData: Record<string, any[]> = {};
    for (const m of mudancas) {
      const dataKey = new Date(m.dataPretendida).toISOString().split('T')[0];
      if (!mudancasPorData[dataKey]) mudancasPorData[dataKey] = [];
      mudancasPorData[dataKey].push({
        id: m.id,
        cliente: m.clienteNome,
        estado: m.estado,
        horaInicio: m.horaPretendida,
        motorista: m.motorista,
        veiculo: m.veiculo,
        tipoServico: m.tipoServico,
      });
    }

    // Gerar 7 dias
    const dias: any[] = [];
    for (let i = 0; i < 7; i++) {
      const dataObj = new Date(inicio);
      dataObj.setDate(dataObj.getDate() + i);
      const data = dataObj.toISOString().split('T')[0];
      const mudancasDoDia = mudancasPorData[data] || [];
      const capacidadeOcupada = mudancasDoDia.filter(
        (m: any) => m.estado !== 'concluida',
      ).length;

      const eBloqueado = bloqueios.some(
        (b) => dataObj >= new Date(b.dataInicio) && dataObj <= new Date(b.dataFim),
      );

      dias.push({
        data,
        mudancas: mudancasDoDia,
        capacidadeOcupada,
        capacidadeTotal: capacidadeMaximaDiaria,
        eDisponivel: !eBloqueado && capacidadeOcupada < capacidadeMaximaDiaria,
        bloqueada: eBloqueado,
      });
    }

    return { dias, mudancas };
  }

  async getAgendaDiaria(tenantId: string, data: string) {
    const inicioDia = new Date(data + 'T00:00:00.000');
    const fimDia = new Date(data + 'T23:59:59.999');

    const config = await this.getConfigAgenda(tenantId) as any;
    const capacidadeMaximaDiaria = config.capacidadeMaximaDiaria || 3;

    const [mudancas, bloqueios] = await Promise.all([
      this.prisma.mudanca.findMany({
        where: {
          tenantId,
          dataPretendida: { gte: inicioDia, lte: fimDia },
          estado: { in: ['aprovada', 'a_caminho', 'em_servico', 'concluida', 'pendente'] },
        },
        include: {
          motorista: { select: { id: true, nome: true } },
          veiculo: { select: { id: true, nome: true } },
        },
        orderBy: { horaPretendida: 'asc' },
      }),
      this.prisma.bloqueioAgenda.findMany({
        where: {
          tenantId,
          dataInicio: { lte: fimDia },
          dataFim: { gte: inicioDia },
        },
      }),
    ]);

    const capacidadeOcupada = mudancas.filter(
      (m) => m.estado !== 'concluida' && m.estado !== 'pendente',
    ).length;
    const eBloqueado = bloqueios.length > 0;

    return {
      data,
      mudancas,
      capacidadeOcupada,
      capacidadeTotal: capacidadeMaximaDiaria,
      eDisponivel: !eBloqueado && capacidadeOcupada < capacidadeMaximaDiaria,
      bloqueada: eBloqueado,
    };
  }

  async getDisponibilidade(tenantId: string, data: string) {
    const config = await this.getConfigAgenda(tenantId) as any;
    const capacidadeMaximaDiaria = config.capacidadeMaximaDiaria || 3;

    const inicioDia = new Date(data + 'T00:00:00.000');
    const fimDia = new Date(data + 'T23:59:59.999');

    // Verificar bloqueio
    const bloqueio = await this.prisma.bloqueioAgenda.findFirst({
      where: {
        tenantId,
        dataInicio: { lte: fimDia },
        dataFim: { gte: inicioDia },
      },
    });

    if (bloqueio) {
      return { data, disponivel: false, capacidadeRestante: 0 };
    }

    // Contar mudanças aprovadas para essa data
    const mudancasCount = await this.prisma.mudanca.count({
      where: {
        tenantId,
        dataPretendida: { gte: inicioDia, lte: fimDia },
        estado: { in: ['aprovada', 'a_caminho', 'em_servico'] },
      },
    });

    const capacidadeRestante = Math.max(0, capacidadeMaximaDiaria - mudancasCount);

    return {
      data,
      disponivel: capacidadeRestante > 0,
      capacidadeRestante,
    };
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
}
