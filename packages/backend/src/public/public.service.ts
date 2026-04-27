import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMudancaDto } from '../mudanca/dto/create-mudanca.dto';
import { EmailService } from '../comunicacao/email.service';

@Injectable()
export class PublicService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async criarMudanca(tenantId: string, dto: CreateMudancaDto) {
    // Verify tenant exists and is active
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || tenant.estado !== 'ativa') {
      throw new NotFoundException('Empresa não encontrada');
    }

    const mudanca = await this.prisma.mudanca.create({
      data: {
        tenantId,
        estado: 'pendente',
        tipoServico: dto.tipoServico,
        clienteNome: dto.clienteNome,
        clienteEmail: dto.clienteEmail,
        clienteTelefone: dto.clienteTelefone,
        moradaRecolha: dto.moradaRecolha as any,
        moradaEntrega: dto.moradaEntrega as any,
        dataPretendida: dto.dataPretendida,
        horaPretendida: dto.horaPretendida,
        equipa: dto.equipa,
        veiculoId: dto.veiculoId,
        materiais: dto.materiais as any || {},
        observacoes: dto.observacoes,
        eInternacional: dto.eInternacional,
        documentacao: dto.documentacao,
        camposPersonalizados: dto.camposPersonalizados as any || undefined,
      },
    });

    // Email de confirmação ao cliente
    if (mudanca.clienteEmail) {
      this.emailService.send(tenantId, mudanca.clienteEmail, 'confirmacao_rececao', {
        nomeCliente: mudanca.clienteNome || 'Cliente',
        dataPretendida: mudanca.dataPretendida,
        horaPretendida: mudanca.horaPretendida || '08:00',
      }, mudanca.id);
    }

    return mudanca;
  }

  async getVeiculos(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || tenant.estado !== 'ativa') {
      throw new NotFoundException('Empresa não encontrada');
    }

    return this.prisma.veiculo.findMany({
      where: { tenantId, estado: 'disponivel' },
      select: {
        id: true,
        nome: true,
        marca: true,
        modelo: true,
        matricula: true,
        metrosCubicos: true,
        precoHora: true,
        eParaUrgencias: true,
      },
      orderBy: { metrosCubicos: 'asc' },
    });
  }

  async getDisponibilidade(tenantId: string, data: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || tenant.estado !== 'ativa') {
      throw new NotFoundException('Empresa não encontrada');
    }

    const configAgenda = (tenant.configAgenda as any) || {};
    const capacidadeMaximaDiaria = configAgenda.capacidadeMaximaDiaria || 3;

    const inicioDia = new Date(data + 'T00:00:00.000');
    const fimDia = new Date(data + 'T23:59:59.999');

    // Verificar bloqueio
    const bloqueio = await this.prisma.bloqueioAgenda.findFirst({
      where: {
        tenantId,
        dataInicio: { lte: fimDia },
        dataFim: { gte: inicioDia },
      },
    });

    if (bloqueio) {
      return { data, disponivel: false, capacidadeRestante: 0 };
    }

    // Contar mudanças aprovadas para essa data
    const mudancasCount = await this.prisma.mudanca.count({
      where: {
        tenantId,
        dataPretendida: { gte: inicioDia, lte: fimDia },
        estado: { in: ['aprovada', 'a_caminho', 'em_servico'] },
      },
    });

    const capacidadeRestante = Math.max(0, capacidadeMaximaDiaria - mudancasCount);

    return {
      data,
      disponivel: capacidadeRestante > 0,
      capacidadeRestante,
    };
  }

  async getTenantInfo(subdomain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
      select: {
        id: true,
        subdomain: true,
        configMarca: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Return brand config directly at top level for convenience
    const brand = (tenant.configMarca as Record<string, any>) || {};

    return {
      tenantId: tenant.id,
      id: tenant.id,
      subdomain: tenant.subdomain,
      brand: Object.keys(brand).length > 0 ? brand : null,
    };
  }

  async getTenantBrand(subdomain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
      select: {
        id: true,
        configMarca: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return {
      tenantId: tenant.id,
      brand: await this.formatTenantBrand(tenant.configMarca),
    };
  }

  private async formatTenantBrand(configMarca: any) {
    const raw = (configMarca as Record<string, any>) || {};

    // Normalize to TenantBrand format with sensible defaults
    const brand = {
      nome: raw.nome || 'Mudanças',
      slogan: raw.slogan || '',
      logoUrl: raw.logoUrl || null,
      faviconUrl: raw.faviconUrl || null,
      heroImageUrl: raw.heroImageUrl || null,
      galeriaUrls: raw.galeriaUrls || [],
      avaliacoes: raw.avaliacoes || null,
      contacto: raw.contacto || null,
      fontes: raw.fontes || { display: 'Cormorant Garamond', body: 'Inter' },
      cores: {
        primaria: raw.cores?.primaria || '#1B4D3E',
        primariaLight: raw.cores?.primariaLight || '#2A7A64',
        secundaria: raw.cores?.secundaria || '#C4572A',
        acento: raw.cores?.acento || '#D4A853',
        fundo: raw.cores?.fundo || '#F5EDE0',
        fundoEscuro: raw.cores?.fundoEscuro || '#0A0F1E',
        texto: raw.cores?.texto || '#2C1810',
        textoClaro: raw.cores?.textoClaro || '#F0E6D6',
      },
    };

    return brand;
  }
}
