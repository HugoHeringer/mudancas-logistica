import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificacaoService {
  constructor(private prisma: PrismaService) {}

  async criar(tenantId: string, data: {
    userId: string;
    tipo: string;
    mensagem: string;
    link?: string;
    mudancaId?: string;
  }) {
    return this.prisma.notificacao.create({
      data: {
        tenantId,
        ...data,
      },
    });
  }

  async criarParaUtilizadores(tenantId: string, perfis: string[], data: {
    tipo: string;
    mensagem: string;
    link?: string;
    mudancaId?: string;
  }) {
    const users = await this.prisma.user.findMany({
      where: { tenantId, perfil: { in: perfis }, eAtivo: true },
      select: { id: true },
    });

    if (users.length === 0) return [];

    return this.prisma.notificacao.createMany({
      data: users.map(u => ({
        tenantId,
        userId: u.id,
        ...data,
      })),
    });
  }

  async findMinhas(tenantId: string, userId: string, apenasNaoLidas?: boolean) {
    const where: any = { tenantId, userId };
    if (apenasNaoLidas) where.lida = false;

    const [notificacoes, totalNaoLidas] = await Promise.all([
      this.prisma.notificacao.findMany({
        where: { tenantId, userId },
        orderBy: { criadaEm: 'desc' },
        take: 50,
      }),
      this.prisma.notificacao.count({
        where: { tenantId, userId, lida: false },
      }),
    ]);

    return { notificacoes, totalNaoLidas };
  }

  async marcarComoLida(tenantId: string, id: string, userId: string) {
    const notificacao = await this.prisma.notificacao.findFirst({
      where: { id, tenantId, userId },
    });

    if (!notificacao) return null;

    return this.prisma.notificacao.update({
      where: { id },
      data: { lida: true, lidaEm: new Date() },
    });
  }

  async marcarTodasComoLidas(tenantId: string, userId: string) {
    return this.prisma.notificacao.updateMany({
      where: { tenantId, userId, lida: false },
      data: { lida: true, lidaEm: new Date() },
    });
  }
}
