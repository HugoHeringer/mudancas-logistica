import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createClienteDto: CreateClienteDto) {
    // Verificar se email já existe
    const existing = await this.prisma.cliente.findFirst({
      where: {
        tenantId,
        email: createClienteDto.email,
      },
    });

    if (existing) {
      throw new ConflictException('Cliente com este email já registado');
    }

    return this.prisma.cliente.create({
      data: {
        tenantId,
        ...createClienteDto,
      },
    });
  }

  async findAll(tenantId: string, filters?: any) {
    const where: any = { tenantId };

    if (filters?.search) {
      where.OR = [
        { nome: { contains: filters.search, mode: 'insensitive' } },
        { apelido: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.eRecorrente !== undefined) {
      where.eRecorrente = filters.eRecorrente;
    }

    return this.prisma.cliente.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, tenantId },
      include: {
        mudancas: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return cliente;
  }

  async findByEmail(tenantId: string, email: string) {
    return this.prisma.cliente.findFirst({
      where: { tenantId, email },
      include: {
        mudancas: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async update(tenantId: string, id: string, updateClienteDto: UpdateClienteDto) {
    const cliente = await this.findOne(tenantId, id);

    // Verificar email duplicado se estiver a ser alterado
    if (updateClienteDto.email) {
      const existing = await this.prisma.cliente.findFirst({
        where: {
          tenantId,
          email: updateClienteDto.email,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Email já registado');
      }
    }

    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
    });
  }

  async merge(tenantId: string, sourceId: string, targetId: string) {
    // Verificar se ambos existem
    await this.findOne(tenantId, sourceId);
    await this.findOne(tenantId, targetId);

    // Transferir mudanças do source para target
    await this.prisma.mudanca.updateMany({
      where: { clienteEmail: { not: null } },
      data: { clienteId: targetId },
    });

    // Remover source
    return this.prisma.cliente.delete({
      where: { id: sourceId },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.cliente.delete({
      where: { id },
    });
  }

  async incrementMudancasCount(tenantId: string, email: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { tenantId, email },
    });

    if (!cliente) {
      // Criar cliente automaticamente
      return this.prisma.cliente.create({
        data: {
          tenantId,
          email,
          nome: 'Cliente',
          apelido: 'Novo',
          telefone: '',
          numeroMudancas: 1,
          eRecorrente: false,
        },
      });
    }

    return this.prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        numeroMudancas: { increment: 1 },
        eRecorrente: cliente.numeroMudancas > 0,
        ultimaMudanca: new Date(),
      },
    });
  }
}
