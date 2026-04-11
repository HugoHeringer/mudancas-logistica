import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class ComunicacaoService {
  constructor(private prisma: PrismaService) {}

  async getTemplates(tenantId: string) {
    return this.prisma.emailTemplate.findMany({
      where: { tenantId },
    });
  }

  async getTemplate(tenantId: string, nome: string) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: { tenantId, nome },
    });

    if (!template) {
      throw new NotFoundException('Template não encontrado');
    }

    return template;
  }

  async createTemplate(tenantId: string, createTemplateDto: CreateTemplateDto) {
    return this.prisma.emailTemplate.create({
      data: {
        tenantId,
        ...createTemplateDto,
      },
    });
  }

  async updateTemplate(tenantId: string, nome: string, updateTemplateDto: UpdateTemplateDto) {
    const template = await this.getTemplate(tenantId, nome);

    return this.prisma.emailTemplate.update({
      where: { id: template.id },
      data: updateTemplateDto,
    });
  }

  async deleteTemplate(tenantId: string, id: string) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Template não encontrado');
    }

    return this.prisma.emailTemplate.delete({
      where: { id },
    });
  }

  async renderTemplate(tenantId: string, nome: string, variaveis: Record<string, any>) {
    const template = await this.getTemplate(tenantId, nome);

    let assunto = template.assunto;
    let corpo = template.corpo;

    // Substituir variáveis {{variavel}}
    Object.entries(variaveis).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      assunto = assunto.replace(regex, String(value));
      corpo = corpo.replace(regex, String(value));
    });

    return {
      assunto,
      corpo,
      eAtivo: template.eAtivo,
    };
  }

  async initializeDefaultTemplates(tenantId: string) {
    const defaultTemplates = [
      {
        nome: 'confirmacao_rececao',
        assunto: 'Solicitação de mudança recebida - {{nomeCliente}}',
        corpo: `Olá {{nomeCliente}},

Recebemos a sua solicitação de mudança para {{dataPretendida}}.

Em breve entraremos em contacto para confirmar os detalhes.

Obrigado,
{{nomeEmpresa}}`,
        variaveis: ['nomeCliente', 'dataPretendida', 'nomeEmpresa'],
        eAtivo: true,
      },
      {
        nome: 'confirmacao_aprovacao',
        assunto: 'Mudança confirmada - {{dataPretendida}}',
        corpo: `Olá {{nomeCliente}},

A sua mudança foi confirmada para {{dataPretendida}} às {{horaPretendida}}.

Motorista: {{motoristaNome}}
Equipa: {{equipa}}

Obrigado,
{{nomeEmpresa}}`,
        variaveis: ['nomeCliente', 'dataPretendida', 'horaPretendida', 'motoristaNome', 'equipa', 'nomeEmpresa'],
        eAtivo: true,
      },
      {
        nome: 'inicio_deslocamento',
        assunto: 'O motorista está a caminho',
        corpo: `Olá {{nomeCliente}},

O nosso motorista {{motoristaNome}} está a caminho para a sua mudança.

Previsão de chegada: {{previsaoChegada}}

Obrigado,
{{nomeEmpresa}}`,
        variaveis: ['nomeCliente', 'motoristaNome', 'previsaoChegada', 'nomeEmpresa'],
        eAtivo: true,
      },
      {
        nome: 'mudanca_concluida',
        assunto: 'Mudança concluída',
        corpo: `Olá {{nomeCliente}},

A sua mudança foi concluída com sucesso.

Obrigado por escolher a {{nomeEmpresa}}!`,
        variaveis: ['nomeCliente', 'nomeEmpresa'],
        eAtivo: true,
      },
      {
        nome: 'recusa_mudanca',
        assunto: 'Solicitação de mudança - {{nomeCliente}}',
        corpo: `Olá {{nomeCliente}},

Infelizmente não podemos aceitar a sua solicitação de mudança.

Motivo: {{motivo}}

Obrigado,
{{nomeEmpresa}}`,
        variaveis: ['nomeCliente', 'motivo', 'nomeEmpresa'],
        eAtivo: true,
      },
    ];

    const created = [];
    for (const template of defaultTemplates) {
      const existing = await this.prisma.emailTemplate.findFirst({
        where: { tenantId, nome: template.nome },
      });

      if (!existing) {
        created.push(
          await this.prisma.emailTemplate.create({
            data: { ...template, tenantId },
          }),
        );
      }
    }

    return created;
  }
}
