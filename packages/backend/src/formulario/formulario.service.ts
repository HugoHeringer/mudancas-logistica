import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampoDto } from './dto/create-campo.dto';
import { UpdateCampoDto } from './dto/update-campo.dto';
import { ReorderCamposDto } from './dto/reorder-campo.dto';

@Injectable()
export class FormularioService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCampoDto) {
    const maxOrdem = await this.prisma.campoFormulario.aggregate({
      where: { tenantId },
      _max: { ordem: true },
    });

    return this.prisma.campoFormulario.create({
      data: {
        tenantId,
        nome: dto.nome,
        tipo: dto.tipo,
        obrigatorio: dto.obrigatorio ?? false,
        ordem: dto.ordem ?? (maxOrdem._max.ordem ?? -1) + 1,
        opcoes: dto.opcoes ?? [],
        eBase: dto.eBase ?? false,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.campoFormulario.findMany({
      where: { tenantId },
      orderBy: { ordem: 'asc' },
    });
  }

  async findAtivos(tenantId: string) {
    return this.prisma.campoFormulario.findMany({
      where: { tenantId, eAtivo: true },
      orderBy: { ordem: 'asc' },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateCampoDto) {
    const campo = await this.prisma.campoFormulario.findFirst({ where: { id, tenantId } });
    if (!campo) throw new NotFoundException('Campo não encontrado');

    return this.prisma.campoFormulario.update({
      where: { id },
      data: {
        nome: dto.nome,
        tipo: dto.tipo,
        obrigatorio: dto.obrigatorio,
        ordem: dto.ordem,
        opcoes: dto.opcoes,
        eBase: dto.eBase,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const campo = await this.prisma.campoFormulario.findFirst({ where: { id, tenantId } });
    if (!campo) throw new NotFoundException('Campo não encontrado');
    if (campo.eBase) throw new Error('Campos base do sistema não podem ser removidos');

    return this.prisma.campoFormulario.delete({ where: { id } });
  }

  async toggleAtivo(tenantId: string, id: string) {
    const campo = await this.prisma.campoFormulario.findFirst({ where: { id, tenantId } });
    if (!campo) throw new NotFoundException('Campo não encontrado');

    return this.prisma.campoFormulario.update({
      where: { id },
      data: { eAtivo: !campo.eAtivo },
    });
  }

  async reorder(tenantId: string, dto: ReorderCamposDto) {
    const updates = dto.items.map((item) =>
      this.prisma.campoFormulario.updateMany({
        where: { id: item.id, tenantId },
        data: { ordem: item.ordem },
      }),
    );
    await Promise.all(updates);
    return this.findAll(tenantId);
  }

  async seedBaseFields(tenantId: string) {
    const camposBase = [
      { nome: 'Nome', tipo: 'texto', obrigatorio: true, ordem: 0, eBase: true },
      { nome: 'Apelido', tipo: 'texto', obrigatorio: true, ordem: 1, eBase: true },
      { nome: 'Email', tipo: 'texto', obrigatorio: true, ordem: 2, eBase: true },
      { nome: 'Telefone', tipo: 'texto', obrigatorio: true, ordem: 3, eBase: true },
      { nome: 'Morada de Recolha', tipo: 'texto', obrigatorio: true, ordem: 4, eBase: true },
      { nome: 'Morada de Entrega', tipo: 'texto', obrigatorio: true, ordem: 5, eBase: true },
      { nome: 'Data Pretendida', tipo: 'texto', obrigatorio: true, ordem: 6, eBase: true },
      { nome: 'Observações', tipo: 'texto', obrigatorio: false, ordem: 7, eBase: true },
    ];

    const existing = await this.prisma.campoFormulario.findMany({ where: { tenantId, eBase: true } });
    if (existing.length > 0) return existing;

    return this.prisma.campoFormulario.createMany({
      data: camposBase.map((c) => ({ tenantId, opcoes: [], ...c })),
    });
  }
}
