import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateTenantDto } from '../tenant/dto/create-tenant.dto';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  async getAllTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            mudancas: true,
            clientes: true,
            motoristas: true,
            veiculos: true,
          },
        },
      },
    });
  }

  async getTenantStats() {
    const [totalTenants, activeTenants, totalMudancas, totalClientes] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { estado: 'ativa' } }),
      this.prisma.mudanca.count(),
      this.prisma.cliente.count(),
    ]);

    return {
      totalTenants,
      activeTenants,
      totalMudancas,
      totalClientes,
    };
  }

  async createTenantWithAdmin(createTenantDto: CreateTenantDto & {
    adminNome: string;
    adminEmail: string;
    adminPassword: string;
  }) {
    // Verificar se subdomínio já existe
    const existingSubdomain = await this.prisma.tenant.findUnique({
      where: { subdomain: createTenantDto.subdomain },
    });

    if (existingSubdomain) {
      throw new ConflictException('Subdomínio já registado');
    }

    // Verificar se email do admin já existe
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: createTenantDto.adminEmail },
    });

    if (existingEmail) {
      throw new ConflictException('Email de admin já registado');
    }

    // Criar tenant
    const tenant = await this.prisma.tenant.create({
      data: {
        subdomain: createTenantDto.subdomain,
        estado: createTenantDto.estado || 'em_setup',
        configMarca: createTenantDto.configMarca || {},
        configPreco: createTenantDto.configPreco || {},
        configAgenda: createTenantDto.configAgenda || {},
      },
    });

    // Criar admin
    const passwordHash = await bcrypt.hash(createTenantDto.adminPassword, 10);

    const adminUser = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        nome: createTenantDto.adminNome,
        email: createTenantDto.adminEmail,
        passwordHash,
        perfil: 'admin',
        eAtivo: true,
      },
    });

    // Atualizar tenant com adminUserId
    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: { adminUserId: adminUser.id },
    });

    // Inicializar templates de email
    await this.initializeEmailTemplates(tenant.id);

    return {
      tenant,
      admin: {
        id: adminUser.id,
        nome: adminUser.nome,
        email: adminUser.email,
      },
    };
  }

  async updateTenantEstado(id: string, estado: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { estado },
    });
  }

  async deleteTenant(id: string) {
    return this.prisma.tenant.delete({
      where: { id },
    });
  }

  async resetAdminPassword(tenantId: string, newPassword: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.adminUserId) {
      throw new Error('Tenant não encontrado ou sem admin associado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: tenant.adminUserId },
      data: { passwordHash },
    });

    return { message: 'Senha do admin redefinida com sucesso' };
  }

  async initializeEmailTemplates(tenantId: string) {
    const defaultTemplates = [
      {
        nome: 'confirmacao_rececao',
        assunto: 'Solicitação de mudança recebida - {{nomeCliente}}',
        corpo: `Olá {{nomeCliente}},\n\nRecebemos a sua solicitação de mudança para {{dataPretendida}}.\n\nEm breve entraremos em contacto para confirmar os detalhes.\n\nObrigado,\n{{nomeEmpresa}}`,
        variaveis: ['nomeCliente', 'dataPretendida', 'nomeEmpresa'],
        eAtivo: true,
      },
      {
        nome: 'confirmacao_aprovacao',
        assunto: 'Mudança confirmada - {{dataPretendida}}',
        corpo: `Olá {{nomeCliente}},\n\nA sua mudança foi confirmada para {{dataPretendida}} às {{horaPretendida}}.\n\nMotorista: {{motoristaNome}}\nEquipa: {{equipa}}\n\nObrigado,\n{{nomeEmpresa}}`,
        variaveis: ['nomeCliente', 'dataPretendida', 'horaPretendida', 'motoristaNome', 'equipa', 'nomeEmpresa'],
        eAtivo: true,
      },
      {
        nome: 'inicio_deslocamento',
        assunto: 'O motorista está a caminho',
        corpo: `Olá {{nomeCliente}},\n\nO nosso motorista {{motoristaNome}} está a caminho para a sua mudança.\n\nPrevisão de chegada: {{previsaoChegada}}\n\nObrigado,\n{{nomeEmpresa}}`,
        variaveis: ['nomeCliente', 'motoristaNome', 'previsaoChegada', 'nomeEmpresa'],
        eAtivo: true,
      },
      {
        nome: 'mudanca_concluida',
        assunto: 'Mudança concluída',
        corpo: `Olá {{nomeCliente}},\n\nA sua mudança foi concluída com sucesso.\n\nObrigado por escolher a {{nomeEmpresa}}!`,
        variaveis: ['nomeCliente', 'nomeEmpresa'],
        eAtivo: true,
      },
      {
        nome: 'recusa_mudanca',
        assunto: 'Solicitação de mudança - {{nomeCliente}}',
        corpo: `Olá {{nomeCliente}},\n\nInfelizmente não podemos aceitar a sua solicitação de mudança.\n\nMotivo: {{motivo}}\n\nObrigado,\n{{nomeEmpresa}}`,
        variaveis: ['nomeCliente', 'motivo', 'nomeEmpresa'],
        eAtivo: true,
      },
    ];

    for (const template of defaultTemplates) {
      await this.prisma.emailTemplate.create({
        data: { ...template, tenantId },
      });
    }
  }
}
