import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CreateTenantDto } from '../tenant/dto/create-tenant.dto';
import { Resend } from 'resend';

@Injectable()
export class SuperAdminService {
  private resend: Resend;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const key = this.configService.get<string>('RESEND_API_KEY');
    this.resend = key ? new Resend(key) : (null as any);
  }

  async getAllTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        subdomain: true,
        slug: true,
        estado: true,
        plano: true,
        eAtivo: true,
        trialExpiraEm: true,
        configMarca: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            mudancas: true,
            clientes: true,
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

    // Verificar se email do admin já existe neste tenant
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: createTenantDto.adminEmail, tenantId: tenant.id },
    });

    if (existingEmail) {
      await this.prisma.tenant.delete({ where: { id: tenant.id } });
      throw new ConflictException('Email de admin já registado neste tenant');
    }

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

  // ──────────────────────────────────────────
  // TRIAL: Registo público do site movefy.pt
  // ──────────────────────────────────────────
  async criarTrial(dto: { nomeEmpresa: string; email: string; telefone: string }) {
    // 1. Verificar email duplicado
    const emailExiste = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (emailExiste) {
      throw new ConflictException('Já existe uma conta com este email. Aceda em console.movefy.pt.');
    }

    // 2. Gerar slug único a partir do nome da empresa
    let baseSlug = dto.nomeEmpresa
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remover acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 40);

    let slug = baseSlug;
    let suffix = 1;
    while (await this.prisma.tenant.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    // 3. Criar tenant em modo trial
    const trialExpiraEm = new Date();
    trialExpiraEm.setDate(trialExpiraEm.getDate() + 30);

    const tenant = await this.prisma.tenant.create({
      data: {
        subdomain: slug,
        slug,
        plano: 'trial',
        estado: 'em_setup',
        eAtivo: true,
        trialExpiraEm,
        configMarca: { nome: dto.nomeEmpresa, email: dto.email, telefone: dto.telefone },
        configPreco: {},
        configAgenda: {},
      },
    });

    // 4. Criar utilizador admin com password temporária
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const tempPassword = Array.from({ length: 10 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const adminUser = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        nome: dto.nomeEmpresa,
        email: dto.email,
        passwordHash,
        perfil: 'admin',
        eAtivo: true,
      },
    });

    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: { adminUserId: adminUser.id },
    });

    // 5. Inicializar templates de email
    await this.initializeEmailTemplates(tenant.id);

    // 6. Enviar email de boas-vindas (fire-and-forget)
    this._sendTrialWelcomeEmail(dto.email, dto.nomeEmpresa, slug, tempPassword).catch(() => {});

    return {
      slug,
      mensagem: 'Trial criado com sucesso. Verifique o seu email para activar a conta.',
    };
  }

  private async _sendTrialWelcomeEmail(
    email: string,
    nomeEmpresa: string,
    slug: string,
    password: string,
  ) {
    if (!this.resend) return;
    const fromEmail = this.configService.get<string>('EMAIL_FROM', 'noreply@movefy.pt');
    await this.resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `Bem-vindo ao Movefy — As suas credenciais de acesso`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
          <h1 style="color:#1A1A2E;font-size:24px;margin-bottom:8px">Bem-vindo ao Movefy! 🎉</h1>
          <p style="color:#6B7280;margin-bottom:24px">A conta da <strong>${nomeEmpresa}</strong> foi criada. Aqui estão os seus dados de acesso:</p>
          <div style="background:#F9F7F3;border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="margin:0 0 8px"><strong>URL do painel:</strong> <a href="https://${slug}.movefy.pt/admin">https://${slug}.movefy.pt/admin</a></p>
            <p style="margin:0 0 8px"><strong>Email:</strong> ${email}</p>
            <p style="margin:0"><strong>Password temporária:</strong> <code style="background:#E5E7EB;padding:2px 8px;border-radius:4px">${password}</code></p>
          </div>
          <p style="color:#6B7280;font-size:14px">Por segurança, altere a password após o primeiro login. O seu trial termina em 30 dias.</p>
          <p style="color:#6B7280;font-size:14px">Qualquer dúvida, responda a este email — estamos cá para ajudar.</p>
          <p style="margin-top:32px;color:#9CA3AF;font-size:12px">Movefy · <a href="https://movefy.pt" style="color:#E8B84B">movefy.pt</a></p>
        </div>
      `,
    });
  }
}
