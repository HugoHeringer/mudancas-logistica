import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimentoDto } from './dto/create-movimento.dto';

@Injectable()
export class FinanceiroService {
  constructor(private prisma: PrismaService) {}

  async createMovimento(tenantId: string, createMovimentoDto: CreateMovimentoDto) {
    return this.prisma.movimentoFinanceiro.create({
      data: {
        tenantId,
        ...createMovimentoDto,
      },
    });
  }

  async findAll(tenantId: string, filters?: any) {
    const where: any = { tenantId };

    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters?.categoria) {
      where.categoria = filters.categoria;
    }

    if (filters?.dataInicio || filters?.dataFim) {
      where.data = {};
      if (filters.dataInicio) where.data.gte = filters.dataInicio;
      if (filters.dataFim) where.data.lte = filters.dataFim;
    }

    if (filters?.mudancaId) {
      where.mudancaId = filters.mudancaId;
    }

    return this.prisma.movimentoFinanceiro.findMany({
      where,
      orderBy: { data: 'desc' },
    });
  }

  async getResumo(tenantId: string, dataInicio: string, dataFim: string) {
    // Receita: soma de MovimentoFinanceiro com categoria 'receita_servico'
    const [receitas, custosEquipa, custosCombustivel, custosAlimentacao] = await Promise.all([
      this.prisma.movimentoFinanceiro.aggregate({
        where: {
          tenantId,
          tipo: 'receita',
          categoria: 'receita_servico',
          data: { gte: dataInicio, lte: dataFim },
        },
        _sum: { valor: true },
        _count: true,
      }),
      // Custo equipa (motorista + ajudantes)
      this.prisma.movimentoFinanceiro.aggregate({
        where: {
          tenantId,
          tipo: 'custo',
          categoria: 'custo_equipa',
          data: { gte: dataInicio, lte: dataFim },
        },
        _sum: { valor: true },
      }),
      // Custo combustível
      this.prisma.movimentoFinanceiro.aggregate({
        where: {
          tenantId,
          tipo: 'custo',
          categoria: 'custo_combustivel',
          data: { gte: dataInicio, lte: dataFim },
        },
        _sum: { valor: true },
      }),
      // Custo alimentação
      this.prisma.movimentoFinanceiro.aggregate({
        where: {
          tenantId,
          tipo: 'custo',
          categoria: 'custo_alimentacao',
          data: { gte: dataInicio, lte: dataFim },
        },
        _sum: { valor: true },
      }),
    ]);

    const receitaTotal = Number(receitas._sum.valor) || 0;
    const custosTotais =
      (Number(custosEquipa._sum.valor) || 0) +
      (Number(custosCombustivel._sum.valor) || 0) +
      (Number(custosAlimentacao._sum.valor) || 0);
    const margemTotal = receitaTotal - custosTotais;
    const margemPercentual = receitaTotal > 0 ? (margemTotal / receitaTotal) * 100 : 0;

    return {
      periodo: { inicio: dataInicio, fim: dataFim },
      receitaTotal,
      custosTotais,
      margemTotal,
      margemPercentual: Math.round(margemPercentual * 100) / 100,
      receitasCount: receitas._count,
      breakdown: {
        custoEquipa: Number(custosEquipa._sum.valor) || 0,
        custoCombustivel: Number(custosCombustivel._sum.valor) || 0,
        custoAlimentacao: Number(custosAlimentacao._sum.valor) || 0,
      },
    };
  }

  async getBreakdownMotorista(tenantId: string, dataInicio: string, dataFim: string) {
    const mudancas = await this.prisma.mudanca.findMany({
      where: {
        tenantId,
        estado: 'concluida',
        dataPretendida: {
          gte: dataInicio,
          lte: dataFim,
        },
        motoristaId: { not: null } as any,
      },
      include: {
        motorista: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    const breakdown = mudancas.reduce((acc: any, m) => {
      const mid = m.motoristaId || '_none';
      if (!acc[mid]) {
        acc[mid] = {
          motoristaId: m.motoristaId,
          motoristaNome: m.motorista?.nome || 'N/A',
          receitaGerada: 0,
          custoEquipa: 0,
          custosCombustivel: 0,
          custosAlimentacao: 0,
          mudancasCount: 0,
        };
      }
      acc[mid].receitaGerada += Number(m.receitaRealizada || 0);
      acc[mid].custoEquipa += Number(m.totalPagoMotorista || 0) + Number(m.totalPagoAjudantes || 0);
      acc[mid].custosCombustivel += (m.conclusao as any)?.combustivel?.valor || 0;
      acc[mid].custosAlimentacao += (m.conclusao as any)?.alimentacao?.valor || 0;
      acc[mid].mudancasCount += 1;
      return acc;
    }, {} as any);

    return Object.values(breakdown).map((b: any) => ({
      ...b,
      margem: b.receitaGerada - b.custoEquipa - b.custosCombustivel - b.custosAlimentacao,
    }));
  }

  async getBreakdownTipoServico(tenantId: string, dataInicio: string, dataFim: string) {
    const mudancas = await this.prisma.mudanca.findMany({
      where: {
        tenantId,
        estado: 'concluida',
        dataPretendida: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
    });

    const breakdown = mudancas.reduce((acc, m) => {
      const tipo = m.tipoServico as 'normal' | 'urgente';
      if (!acc[tipo]) {
        acc[tipo] = {
          tipo,
          quantidade: 0,
          receitaTotal: 0,
          margemTotal: 0,
        };
      }
      acc[tipo].quantidade += 1;
      acc[tipo].receitaTotal += Number(m.receitaRealizada || 0);
      acc[tipo].margemTotal += Number(m.margem || 0);
      return acc;
    }, {} as any);

    return Object.values(breakdown);
  }

  async getGastosDetalhados(tenantId: string, dataInicio: string, dataFim: string) {
    const [combustivelRegistos, alimentacaoRegistos, pagamentosMotorista] = await Promise.all([
      this.prisma.mudanca.findMany({
        where: {
          tenantId,
          estado: 'concluida',
          dataPretendida: {
            gte: dataInicio,
            lte: dataFim,
          },
          conclusao: {
            path: ['combustivel'],
            not: null as any,
          },
        },
        select: {
          id: true,
          conclusao: true,
        },
      }),
      this.prisma.mudanca.findMany({
        where: {
          tenantId,
          estado: 'concluida',
          dataPretendida: {
            gte: dataInicio,
            lte: dataFim,
          },
          conclusao: {
            path: ['alimentacao'],
            not: null as any,
          },
        },
        select: {
          id: true,
          conclusao: true,
        },
      }),
      this.prisma.mudanca.findMany({
        where: {
          tenantId,
          estado: 'concluida',
          dataPretendida: {
            gte: dataInicio,
            lte: dataFim,
          },
          totalPagoMotorista: { not: null } as any,
        },
        select: {
          id: true,
          totalPagoMotorista: true,
          totalPagoAjudantes: true,
          motorista: { select: { id: true, nome: true } },
        },
      }),
    ]);

    const combustivel = combustivelRegistos
      .map((m) => ({
        mudancaId: m.id,
        valor: (m.conclusao as any)?.combustivel?.valor || 0,
        litros: (m.conclusao as any)?.combustivel?.litros || 0,
      }))
      .filter((c) => c.valor > 0);

    const alimentacao = alimentacaoRegistos
      .map((m) => ({
        mudancaId: m.id,
        valor: (m.conclusao as any)?.alimentacao?.valor || 0,
      }))
      .filter((a) => a.valor > 0);

    const motoristas = pagamentosMotorista
      .map((m) => ({
        mudancaId: m.id,
        motoristaNome: m.motorista?.nome || 'N/A',
        totalPagoMotorista: Number(m.totalPagoMotorista || 0),
        totalPagoAjudantes: Number(m.totalPagoAjudantes || 0),
      }))
      .filter((p) => p.totalPagoMotorista > 0 || p.totalPagoAjudantes > 0);

    return {
      combustivel: {
        total: combustivel.reduce((acc, c) => acc + c.valor, 0),
        porMudanca: combustivel,
      },
      alimentacao: {
        total: alimentacao.reduce((acc, a) => acc + a.valor, 0),
        porMudanca: alimentacao,
      },
      motoristas: {
        totalMotoristas: motoristas.reduce((acc, p) => acc + p.totalPagoMotorista, 0),
        totalAjudantes: motoristas.reduce((acc, p) => acc + p.totalPagoAjudantes, 0),
        porMudanca: motoristas,
      },
    };
  }

  async removeMovimento(tenantId: string, id: string) {
    return this.prisma.movimentoFinanceiro.delete({
      where: { id, tenantId },
    });
  }
}
