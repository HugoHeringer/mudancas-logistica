import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMudancaDto } from './dto/create-mudanca.dto';
import { UpdateMudancaDto } from './dto/update-mudanca.dto';
import { AprovarMudancaDto } from './dto/aprovar-mudanca.dto';
import { ConcluirMudancaDto } from './dto/concluir-mudanca.dto';

@Injectable()
export class MudancaService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createMudancaDto: CreateMudancaDto) {
    return this.prisma.mudanca.create({
      data: {
        tenantId,
        ...createMudancaDto,
        estado: 'pendente',
      },
      include: {
        veiculo: true,
      },
    });
  }

  async findAll(tenantId: string, filters?: any) {
    const where: any = { tenantId };

    if (filters?.estado) {
      where.estado = { in: filters.estado };
    }

    if (filters?.tipoServico) {
      where.tipoServico = filters.tipoServico;
    }

    if (filters?.motoristaId) {
      where.motoristaId = filters.motoristaId;
    }

    if (filters?.dataInicio || filters?.dataFim) {
      where.dataPretendida = {};
      if (filters.dataInicio) where.dataPretendida.gte = filters.dataInicio;
      if (filters.dataFim) where.dataPretendida.lte = filters.dataFim;
    }

    return this.prisma.mudanca.findMany({
      where,
      include: {
        veiculo: true,
        motorista: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const mudanca = await this.prisma.mudanca.findFirst({
      where: { id, tenantId },
      include: {
        veiculo: true,
        motorista: {
          select: {
            id: true,
            nome: true,
            telefone: true,
          },
        },
        cliente: {
          select: {
            id: true,
            nome: true,
            apelido: true,
            email: true,
            telefone: true,
            eRecorrente: true,
          },
        },
      },
    });

    if (!mudanca) {
      throw new NotFoundException('Mudança não encontrada');
    }

    return mudanca;
  }

  async update(tenantId: string, id: string, updateMudancaDto: UpdateMudancaDto) {
    const mudanca = await this.findOne(tenantId, id);

    return this.prisma.mudanca.update({
      where: { id },
      data: updateMudancaDto,
      include: {
        veiculo: true,
        motorista: true,
      },
    });
  }

  async aprovar(tenantId: string, id: string, aprovarMudancaDto: AprovarMudancaDto) {
    const mudanca = await this.findOne(tenantId, id);

    // Atualizar estado do motorista
    if (aprovarMudancaDto.motoristaId) {
      await this.prisma.motorista.update({
        where: { id: aprovarMudancaDto.motoristaId },
        data: { estado: 'em_servico' },
      });
    }

    // Ocupar slot na agenda
    const dataMudanca = mudanca.dataPretendida;
    const slot = await this.prisma.slotAgenda.findFirst({
      where: {
        tenantId,
        data: dataMudanca,
        horaInicio: mudanca.horaPretendida || '08:00',
      },
    });

    if (slot) {
      await this.prisma.slotAgenda.update({
        where: { id: slot.id },
        data: { capacidadeOcupada: { increment: 1 } },
      });
    }

    return this.prisma.mudanca.update({
      where: { id },
      data: {
        estado: 'aprovada',
        aprovadoPor: aprovarMudancaDto.aprovadoPor,
        aprovadoEm: new Date(),
        motoristaId: aprovarMudancaDto.motoristaId,
        ajudantesIds: aprovarMudancaDto.ajudantesIds || [],
        tempoEstimadoHoras: aprovarMudancaDto.tempoEstimadoHoras,
        observacoesAdmin: aprovarMudancaDto.observacoesAdmin,
      },
      include: {
        veiculo: true,
        motorista: true,
      },
    });
  }

  async iniciarDeslocamento(tenantId: string, id: string, motoristaId: string) {
    const mudanca = await this.findOne(tenantId, id);

    if (mudanca.motoristaId !== motoristaId) {
      throw new NotFoundException('Mudança não atribuída a este motorista');
    }

    return this.prisma.mudanca.update({
      where: { id },
      data: { estado: 'a_caminho' },
    });
  }

  async emServico(tenantId: string, id: string, motoristaId: string) {
    const mudanca = await this.findOne(tenantId, id);

    if (mudanca.motoristaId !== motoristaId) {
      throw new NotFoundException('Mudança não atribuída a este motorista');
    }

    return this.prisma.mudanca.update({
      where: { id },
      data: { estado: 'em_servico' },
    });
  }

  async concluir(tenantId: string, id: string, concluirMudancaDto: ConcluirMudancaDto) {
    const mudanca = await this.findOne(tenantId, id);

    // Calcular financeiro
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id: mudanca.veiculoId },
    });

    const precoHora = veiculo?.precoHora || 0;
    const receitaRealizada = concluirMudancaDto.horasCobradas * precoHora;
    const custosCombustivel = concluirMudancaDto.combustivel?.valor || 0;
    const custosAlimentacao = concluirMudancaDto.alimentacao?.teve
      ? concluirMudancaDto.alimentacao.valor
      : 0;
    const custosOperacionais = custosCombustivel + custosAlimentacao;
    const margem = receitaRealizada - custosOperacionais;

    return this.prisma.mudanca.update({
      where: { id },
      data: {
        estado: 'concluida',
        conclusao: concluirMudancaDto,
        concluidoPor: concluirMudancaDto.concluidoPor,
        concluidoEm: new Date(),
        receitaRealizada,
        custosOperacionais,
        margem,
      },
    });
  }

  async recusar(tenantId: string, id: string, motivo: string) {
    const mudanca = await this.findOne(tenantId, id);

    return this.prisma.mudanca.update({
      where: { id },
      data: {
        estado: 'recusada',
        observacoesAdmin: motivo,
      },
    });
  }

  async cancelar(tenantId: string, id: string) {
    const mudanca = await this.findOne(tenantId, id);

    return this.prisma.mudanca.update({
      where: { id },
      data: { estado: 'cancelada' },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.mudanca.delete({
      where: { id },
    });
  }

  async getMinhas(tenantId: string, userId: string, filters?: any) {
    // Encontrar o motorista associado a este user
    const motorista = await this.prisma.motorista.findFirst({
      where: { tenantId, userId },
    });

    if (!motorista) {
      return [];
    }

    const where: any = { tenantId, motoristaId: motorista.id };

    if (filters?.data) {
      where.dataPretendida = filters.data;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.dataInicio || filters?.dataFim) {
      where.dataPretendida = {};
      if (filters.dataInicio) where.dataPretendida.gte = filters.dataInicio;
      if (filters.dataFim) where.dataPretendida.lte = filters.dataFim;
    }

    return this.prisma.mudanca.findMany({
      where,
      include: {
        veiculo: true,
        motorista: {
          select: { id: true, nome: true, telefone: true },
        },
      },
      orderBy: { horaPretendida: 'asc' },
    });
  }

  async getDashboard(tenantId: string) {
    const hoje = new Date().toISOString().split('T')[0];

    const [
      mudancasHoje,
      pendentes,
      emCurso,
      concluidasSemFicha,
      estatisticasMes,
    ] = await Promise.all([
      this.prisma.mudanca.findMany({
        where: { tenantId, dataPretendida: hoje },
        include: { motorista: true, veiculo: true },
      }),
      this.prisma.mudanca.count({ where: { tenantId, estado: 'pendente' } }),
      this.prisma.mudanca.count({ where: { tenantId, estado: { in: ['a_caminho', 'em_servico'] } } }),
      this.prisma.mudanca.count({
        where: {
          tenantId,
          estado: 'concluida',
          conclusao: null,
        },
      }),
      this.prisma.mudanca.aggregate({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(new Date().setDate(1)).toISOString(),
          },
        },
        _sum: {
          receitaRealizada: true,
          custosOperacionais: true,
          margem: true,
        },
        _count: true,
      }),
    ]);

    return {
      hoje: {
        mudancas: mudancasHoje,
        total: mudancasHoje.length,
      },
      pendentes,
      emCurso,
      concluidasSemFicha,
      mes: {
        total: estatisticasMes._count,
        receita: estatisticasMes._sum.receitaRealizada || 0,
        custos: estatisticasMes._sum.custosOperacionais || 0,
        margem: estatisticasMes._sum.margem || 0,
      },
    };
  }
}
