import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAjudanteDto } from './dto/create-ajudante.dto';
import { UpdateAjudanteDto } from './dto/update-ajudante.dto';

@Injectable()
export class AjudanteService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateAjudanteDto) {
    return this.prisma.ajudante.create({
      data: { tenantId, ...dto },
    });
  }

  async findAll(tenantId: string, filters?: any) {
    const where: any = { tenantId };

    if (filters?.disponivel !== undefined) {
      where.disponivel = filters.disponivel === 'true';
    }

    if (filters?.search) {
      where.OR = [
        { nome: { contains: filters.search, mode: 'insensitive' } },
        { telefone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const ajudantes = await this.prisma.ajudante.findMany({
      where,
      orderBy: { nome: 'asc' },
    });

    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const inicioStr = inicioMes.toISOString().split('T')[0];
    const fimStr = fimMes.toISOString().split('T')[0];

    const ajudantesWithCount = await Promise.all(
      ajudantes.map(async (a) => {
        const mudancas = await this.prisma.mudanca.findMany({
          where: {
            tenantId,
            estado: 'concluida',
            dataPretendida: { gte: inicioStr, lte: fimStr },
            ajudantesIds: { has: a.id },
          },
          select: { conclusao: true },
        });

        const horasTrabalhadasMes = mudancas.reduce(
          (sum, m) => sum + ((m.conclusao as any)?.horasCobradas || 0),
          0,
        );

        return {
          ...a,
          mudancasParticipadas: mudancas.length,
          horasTrabalhadasMes,
        };
      }),
    );

    return ajudantesWithCount;
  }

  async findDisponiveis(tenantId: string, data?: string) {
    // Para uma implementação completa de disponibilidade por data,
    // seria necessário verificar se o ajudante está atribuído a uma mudança naquela data.
    // Por agora, retorna os ajudantes marcados como disponíveis.
    return this.prisma.ajudante.findMany({
      where: { tenantId, disponivel: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const ajudante = await this.prisma.ajudante.findFirst({
      where: { id, tenantId },
    });

    if (!ajudante) {
      throw new NotFoundException('Ajudante não encontrado');
    }

    return ajudante;
  }

  async update(tenantId: string, id: string, dto: UpdateAjudanteDto) {
    await this.findOne(tenantId, id);

    return this.prisma.ajudante.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.ajudante.delete({
      where: { id },
    });
  }

  async getPerformance(tenantId: string, id: string, mes: number, ano: number) {
    await this.findOne(tenantId, id);

    const inicio = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 0);
    const inicioStr = inicio.toISOString().split('T')[0];
    const fimStr = fim.toISOString().split('T')[0];

    // Find mudancas where this ajudante was in ajudantesIds
    const mudancas = await this.prisma.mudanca.findMany({
      where: {
        tenantId,
        estado: 'concluida',
        dataPretendida: { gte: inicioStr, lte: fimStr },
        ajudantesIds: { has: id },
      },
      select: {
        id: true,
        totalPagoAjudantes: true,
        conclusao: true,
      },
    });

    const mudancasNoMes = mudancas.length;
    const totalPago = mudancas.reduce((sum, m) => sum + (m.totalPagoAjudantes || 0), 0);

    // Estimate hours from conclusao data
    const horasTrabalhadas = mudancas.reduce((sum, m) => {
      return sum + ((m.conclusao as any)?.horasRegistadas || 0);
    }, 0);

    return {
      mudancasNoMes,
      horasTrabalhadas,
      totalPago,
    };
  }
}
