import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    // Verificar se subdomínio já existe
    const existing = await this.prisma.tenant.findUnique({
      where: { subdomain: createTenantDto.subdomain },
    });

    if (existing) {
      throw new ConflictException('Subdomínio já registado');
    }

    return this.prisma.tenant.create({
      data: {
        subdomain: createTenantDto.subdomain,
        estado: createTenantDto.estado || 'em_setup',
        configMarca: createTenantDto.configMarca || {},
        configPreco: createTenantDto.configPreco || {},
        configAgenda: createTenantDto.configAgenda || {},
      },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            eAtivo: true,
          },
        },
        _count: {
          select: {
            mudancas: true,
            clientes: true,
            motoristas: true,
            veiculos: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant;
  }

  async findBySubdomain(subdomain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return this.prisma.tenant.delete({
      where: { id },
    });
  }

  async updateLastAccess(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { dataUltimoAcesso: new Date() },
    });
  }

  async getStats(tenantId: string) {
    const [mudancasCount, clientesCount, motoristasCount, veiculosCount, receitaMes] =
      await Promise.all([
        this.prisma.mudanca.count({ where: { tenantId } }),
        this.prisma.cliente.count({ where: { tenantId } }),
        this.prisma.motorista.count({ where: { tenantId } }),
        this.prisma.veiculo.count({ where: { tenantId } }),
        this.prisma.movimentoFinanceiro.aggregate({
          where: {
            tenantId,
            tipo: 'receita',
            data: {
              gte: new Date(new Date().setDate(1)).toISOString().split('T')[0],
            },
          },
          _sum: { valor: true },
        }),
      ]);

    return {
      mudancas: mudancasCount,
      clientes: clientesCount,
      motoristas: motoristasCount,
      veiculos: veiculosCount,
      receitaMes: receitaMes._sum.valor || 0,
    };
  }

  async updateBrand(id: string, updateBrandDto: UpdateBrandDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: {
        configMarca: updateBrandDto as any,
      },
    });
  }

  /**
   * Returns the setup progress for a tenant.
   * Steps: marca → precos → agenda → veiculos
   */
  async getSetupProgress(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: { select: { veiculos: true, motoristas: true } },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    const configMarca = (tenant.configMarca as any) || {};
    const configPreco = (tenant.configPreco as any) || {};
    const configAgenda = (tenant.configAgenda as any) || {};

    const steps = [
      {
        id: 'marca',
        label: 'Marca',
        completed: !!(configMarca.nome || configMarca.logoUrl || configMarca.cores?.primaria),
      },
      {
        id: 'precos',
        label: 'Preços',
        completed: !!(configPreco.precoHora || configPreco.precoBase),
      },
      {
        id: 'agenda',
        label: 'Agenda',
        completed: !!(configAgenda.horaInicio || configAgenda.horaFim || configAgenda.diasUteis || (Array.isArray(configAgenda.diasDisponiveis) && configAgenda.diasDisponiveis.length > 0)),
      },
      {
        id: 'veiculos',
        label: 'Veículos',
        completed: tenant._count.veiculos > 0,
      },
      {
        id: 'motoristas',
        label: 'Motoristas',
        completed: tenant._count.motoristas > 0,
      },
    ];

    const completedCount = steps.filter((s) => s.completed).length;
    const percentage = Math.round((completedCount / steps.length) * 100);

    return {
      steps,
      completedCount,
      totalSteps: steps.length,
      percentage,
      isComplete: completedCount === steps.length,
    };
  }
}
