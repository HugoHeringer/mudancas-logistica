import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMudancaDto } from '../mudanca/dto/create-mudanca.dto';
import { AgendaService } from '../agenda/agenda.service';

@Injectable()
export class PublicService {
  constructor(
    private prisma: PrismaService,
    private agendaService: AgendaService,
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
      },
    });

    // [3.5] Occupy slot when creating mudanca from public site
    if (dto.dataPretendida && dto.horaPretendida) {
      try {
        const dataStr = typeof dto.dataPretendida === 'string'
          ? dto.dataPretendida.split('T')[0]
          : new Date(dto.dataPretendida).toISOString().split('T')[0];
        await this.agendaService.ocuparSlot(tenantId, dataStr, dto.horaPretendida);
      } catch {
        // Slot occupation failed (slot may not exist), mudanca still created
      }
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

    // Get mudanças for that date to check availability
    const inicioDia = new Date(data + 'T00:00:00.000');
    const fimDia = new Date(data + 'T23:59:59.999');
    const mudancas = await this.prisma.mudanca.findMany({
      where: {
        tenantId,
        dataPretendida: { gte: inicioDia, lte: fimDia },
        estado: { in: ['aprovada', 'a_caminho', 'em_servico'] },
      },
      select: {
        id: true,
        horaPretendida: true,
        motoristaId: true,
        veiculoId: true,
      },
    });

    const motoristasDisponiveis = await this.prisma.motorista.count({
      where: { tenantId, estado: 'disponivel' },
    });

    return {
      data,
      mudancasAgendadas: mudancas.length,
      motoristasDisponiveis,
      disponivel: motoristasDisponiveis > mudancas.length,
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
