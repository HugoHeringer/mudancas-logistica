import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';

@Injectable()
export class VeiculoService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createVeiculoDto: CreateVeiculoDto) {
    return this.prisma.veiculo.create({
      data: {
        tenantId,
        ...createVeiculoDto,
      },
    });
  }

  async findAll(tenantId: string, filters?: any) {
    const where: any = { tenantId };

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.eParaUrgencias !== undefined) {
      where.eParaUrgencias = filters.eParaUrgencias;
    }

    if (filters?.search) {
      where.OR = [
        { nome: { contains: filters.search, mode: 'insensitive' } },
        { marca: { contains: filters.search, mode: 'insensitive' } },
        { matricula: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.veiculo.findMany({
      where,
      include: {
        motoristas: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const veiculo = await this.prisma.veiculo.findFirst({
      where: { id, tenantId },
      include: {
        motoristas: true,
      },
    });

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    return veiculo;
  }

  async getDisponiveis(tenantId: string, paraUrgencias?: boolean) {
    const where: any = {
      tenantId,
      estado: 'disponivel',
    };

    if (paraUrgencias) {
      where.eParaUrgencias = true;
    }

    return this.prisma.veiculo.findMany({
      where,
    });
  }

  async update(tenantId: string, id: string, updateVeiculoDto: UpdateVeiculoDto) {
    await this.findOne(tenantId, id);

    return this.prisma.veiculo.update({
      where: { id },
      data: updateVeiculoDto,
    });
  }

  async updateEstado(id: string, estado: string) {
    return this.prisma.veiculo.update({
      where: { id },
      data: { estado },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.veiculo.delete({
      where: { id },
    });
  }
}
