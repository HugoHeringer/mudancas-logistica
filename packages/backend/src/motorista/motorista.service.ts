import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMotoristaDto } from './dto/create-motorista.dto';
import { UpdateMotoristaDto } from './dto/update-motorista.dto';

@Injectable()
export class MotoristaService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createMotoristaDto: CreateMotoristaDto) {
    return this.prisma.motorista.create({
      data: {
        tenantId,
        nome: createMotoristaDto.nome,
        email: createMotoristaDto.email,
        telefone: createMotoristaDto.telefone,
        cartaConducao: createMotoristaDto.cartaConducao || '',
        validadeCarta: createMotoristaDto.validadeCarta || '',
        veiculoId: createMotoristaDto.veiculoId || null,
        estado: createMotoristaDto.estado || 'disponivel',
        valorHora: createMotoristaDto.valorHora || 0,
      },
      include: {
        veiculo: true,
      },
    });
  }

  async findAll(tenantId: string, filters?: any, user?: any) {
    const where: any = { tenantId };

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.veiculoId) {
      where.veiculoId = filters.veiculoId;
    }

    if (filters?.search) {
      where.OR = [
        { nome: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Gerente visibility restriction: only see allowed motoristas
    if (user?.perfil === 'gerente') {
      const permissoes = user.permissoes as any;
      if (!permissoes?.verTodosMotoristas && permissoes?.motoristasPermitidos?.length > 0) {
        where.id = { in: permissoes.motoristasPermitidos };
      }
    }

    return this.prisma.motorista.findMany({
      where,
      include: {
        veiculo: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const motorista = await this.prisma.motorista.findFirst({
      where: { id, tenantId },
      include: {
        veiculo: true,
        mudancas: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!motorista) {
      throw new NotFoundException('Motorista não encontrado');
    }

    return motorista;
  }

  async findByUserId(tenantId: string, userId: string) {
    const motorista = await this.prisma.motorista.findFirst({
      where: { tenantId, userId },
      include: { veiculo: true },
    });

    if (!motorista) {
      throw new NotFoundException('Motorista não encontrado para este utilizador');
    }

    return motorista;
  }

  async getDisponiveis(tenantId: string, data?: string) {
    const where: any = {
      tenantId,
      estado: 'disponivel',
    };

    // Excluir motoristas já ocupados na data
    if (data) {
      const ocupados = await this.prisma.mudanca.findMany({
        where: {
          tenantId,
          dataPretendida: data,
          estado: { in: ['aprovada', 'a_caminho', 'em_servico'] },
        },
        select: { motoristaId: true },
      });

      const ocupadosIds = ocupados.map((m) => m.motoristaId).filter(Boolean) as string[];

      if (ocupadosIds.length > 0) {
        where.id = { notIn: ocupadosIds };
      }
    }

    return this.prisma.motorista.findMany({
      where,
      include: {
        veiculo: true,
      },
    });
  }

  async update(tenantId: string, id: string, updateMotoristaDto: UpdateMotoristaDto) {
    const motorista = await this.findOne(tenantId, id);

    return this.prisma.motorista.update({
      where: { id },
      data: updateMotoristaDto,
      include: {
        veiculo: true,
      },
    });
  }

  async updateEstado(tenantId: string, id: string, estado: string) {
    const motorista = await this.findOne(tenantId, id);
    return this.prisma.motorista.update({
      where: { id },
      data: { estado },
    });
  }

  async getPerformance(tenantId: string, motoristaId: string, mes: number, ano: number) {
    const inicioMes = new Date(ano, mes - 1, 1).toISOString().split('T')[0];
    const fimMes = new Date(ano, mes, 0).toISOString().split('T')[0];

    const mudancas = await this.prisma.mudanca.findMany({
      where: {
        tenantId,
        motoristaId,
        dataPretendida: {
          gte: inicioMes,
          lte: fimMes,
        },
        estado: 'concluida',
      },
    });

    const horasTrabalhadas = mudancas.reduce(
      (acc, m) => acc + (m.conclusao as any)?.horasRegistadas || 0,
      0,
    );

    const receitaGerada = mudancas.reduce(
      (acc, m) => acc + (m.receitaRealizada || 0),
      0,
    );

    const custosCombustivel = mudancas.reduce(
      (acc, m) => acc + ((m.conclusao as any)?.combustivel?.valor || 0),
      0,
    );

    const custosAlimentacao = mudancas.reduce(
      (acc, m) => acc + ((m.conclusao as any)?.alimentacao?.valor || 0),
      0,
    );

    const margem = receitaGerada - custosCombustivel - custosAlimentacao;

    return {
      motoristaId,
      mudancasNoMes: mudancas.length,
      horasTrabalhadas,
      receitaGerada,
      custosCombustivel,
      custosAlimentacao,
      margem,
    };
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.motorista.delete({
      where: { id },
    });
  }
}
