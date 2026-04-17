import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UtilizadorService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, filters?: any) {
    const where: any = { tenantId };

    if (filters?.perfil) {
      where.perfil = filters.perfil;
    }

    if (filters?.eAtivo !== undefined) {
      where.eAtivo = filters.eAtivo === 'true';
    }

    if (filters?.search) {
      where.OR = [
        { nome: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        eAtivo: true,
        ultimaSessao: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        eAtivo: true,
        ultimaSessao: true,
        permissoes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilizador não encontrado');
    }

    return user;
  }

  async update(tenantId: string, id: string, data: { nome?: string; email?: string }) {
    await this.findOne(tenantId, id);

    if (data.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: data.email, tenantId, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Já existe um utilizador com este email');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        eAtivo: true,
        ultimaSessao: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateEstado(tenantId: string, id: string, eAtivo: boolean) {
    await this.findOne(tenantId, id);

    return this.prisma.user.update({
      where: { id },
      data: { eAtivo },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        eAtivo: true,
        ultimaSessao: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updatePerfil(tenantId: string, id: string, perfil: string) {
    await this.findOne(tenantId, id);

    const perfisValidos = ['admin', 'gerente', 'financeiro', 'operacional', 'motorista'];
    if (!perfisValidos.includes(perfil)) {
      throw new ConflictException(`Perfil inválido. Perfis válidos: ${perfisValidos.join(', ')}`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { perfil },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        eAtivo: true,
        ultimaSessao: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updatePermissoes(tenantId: string, id: string, permissoes: any) {
    await this.findOne(tenantId, id);

    return this.prisma.user.update({
      where: { id },
      data: { permissoes },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        eAtivo: true,
        ultimaSessao: true,
        permissoes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
