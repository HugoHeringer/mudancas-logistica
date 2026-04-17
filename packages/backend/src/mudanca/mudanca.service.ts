import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMudancaDto } from './dto/create-mudanca.dto';
import { UpdateMudancaDto } from './dto/update-mudanca.dto';
import { AprovarMudancaDto } from './dto/aprovar-mudanca.dto';
import { ConcluirMudancaDto } from './dto/concluir-mudanca.dto';
import { EmailService } from '../comunicacao/email.service';
import { NotificacaoService } from '../notificacao/notificacao.service';
import { SMS_SERVICE_TOKEN, ISmsService } from '../comunicacao/sms.interface';
import { ClienteService } from '../cliente/cliente.service';
import { AgendaService } from '../agenda/agenda.service';

@Injectable()
export class MudancaService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificacaoService: NotificacaoService,
    @Inject(SMS_SERVICE_TOKEN) private smsService: ISmsService,
    private clienteService: ClienteService,
    private agendaService: AgendaService,
  ) {}

  async create(tenantId: string, createMudancaDto: CreateMudancaDto) {
    const { tenantId: _dtoTenantId, moradaRecolha, moradaEntrega, materiais, ...rest } = createMudancaDto as any;
    const mudanca = await this.prisma.mudanca.create({
      data: {
        tenantId,
        ...rest,
        estado: 'pendente',
        moradaRecolha: moradaRecolha as any,
        moradaEntrega: moradaEntrega as any,
        materiais: materiais as any,
      },
      include: {
        veiculo: true,
      },
    });

    // Email ao cliente
    if (mudanca.clienteEmail) {
      this.emailService.send(tenantId, mudanca.clienteEmail, 'confirmacao_rececao', {
        nomeCliente: mudanca.clienteNome || 'Cliente',
        dataPretendida: mudanca.dataPretendida,
        horaPretendida: mudanca.horaPretendida || '08:00',
      }, mudanca.id);
    }

    // Notificação in-app para admin/gerente
    this.notificacaoService.criarParaUtilizadores(tenantId, ['admin', 'gerente'], {
      tipo: 'mudanca_criada',
      mensagem: `Nova mudança criada para ${mudanca.clienteNome || 'cliente'}`,
      link: `/mudancas/${mudanca.id}`,
      mudancaId: mudanca.id,
    });

    // Atualizar contagem do cliente
    if (mudanca.clienteEmail) {
      this.clienteService.incrementMudancasCount(tenantId, mudanca.clienteEmail).catch(() => {});
    }

    return mudanca;
  }

  async findAll(tenantId: string, filters?: any, userId?: string) {
    let motoristafilter: string[] | null = null;
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { perfil: true, permissoes: true },
      });
      if (user?.perfil === 'gerente' && user.permissoes) {
        const perms = user.permissoes as any;
        if (perms.motoristasPermitidos && !perms.verTodosMotoristas) {
          motoristafilter = perms.motoristasPermitidos;
        }
      }
    }

    const where: any = { tenantId };
    if (motoristafilter) {
      where.motoristaId = { in: motoristafilter };
    }

    if (filters?.estado) {
      where.estado = { in: filters.estado };
    }

    if (filters?.tipoServico) {
      where.tipoServico = filters.tipoServico;
    }

    if (filters?.motoristaId) {
      where.motoristaId = filters.motoristaId;
    }

    if (filters?.dataInicio || filters?.dataFim) {
      where.dataPretendida = {};
      if (filters.dataInicio) where.dataPretendida.gte = filters.dataInicio;
      if (filters.dataFim) where.dataPretendida.lte = filters.dataFim;
    }

    const skip = filters?.skip ? parseInt(filters.skip) : 0;
    const take = filters?.take ? parseInt(filters.take) : 50;

    const [items, total] = await Promise.all([
      this.prisma.mudanca.findMany({
        where,
        skip,
        take,
        include: {
          veiculo: true,
          motorista: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mudanca.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findOne(tenantId: string, id: string) {
    const mudanca = await this.prisma.mudanca.findFirst({
      where: { id, tenantId },
      include: {
        veiculo: true,
        motorista: {
          select: {
            id: true,
            nome: true,
            telefone: true,
          },
        },
        cliente: {
          select: {
            id: true,
            nome: true,
            apelido: true,
            email: true,
            telefone: true,
            eRecorrente: true,
          },
        },
      },
    });

    if (!mudanca) {
      throw new NotFoundException('Mudança não encontrada');
    }

    // Resolve ajudante names from IDs
    if (mudanca.ajudantesIds && mudanca.ajudantesIds.length > 0) {
      const ajudantes = await this.prisma.ajudante.findMany({
        where: { id: { in: mudanca.ajudantesIds } },
        select: { id: true, nome: true, telefone: true },
      });
      (mudanca as any).ajudantes = ajudantes;
    } else {
      (mudanca as any).ajudantes = [];
    }

    return mudanca;
  }

  async update(tenantId: string, id: string, updateMudancaDto: UpdateMudancaDto) {
    const mudanca = await this.findOne(tenantId, id);

    const updated = await this.prisma.mudanca.update({
      where: { id },
      data: updateMudancaDto as any,
      include: {
        veiculo: true,
        motorista: true,
      },
    });

    // Verificar se campos relevantes mudaram
    const dto = updateMudancaDto as any;
    const relevantFields = ['dataPretendida', 'horaPretendida', 'moradaRecolha', 'moradaEntrega', 'motoristaId', 'veiculoId'];
    const hasRelevantChange = relevantFields.some(f => dto[f] !== undefined);

    if (hasRelevantChange) {
      // Email ao cliente
      if (updated.clienteEmail) {
        this.emailService.send(tenantId, updated.clienteEmail, 'mudanca_alterada', {
          nomeCliente: updated.clienteNome || 'Cliente',
          dataPretendida: updated.dataPretendida,
          horaPretendida: updated.horaPretendida || '08:00',
        }, updated.id);
      }

      // Notificação ao motorista
      this.notificacaoService.criarParaUtilizadores(tenantId, ['motorista'], {
        tipo: 'mudanca_alterada',
        mensagem: `Detalhes da mudança de ${updated.clienteNome || 'cliente'} foram atualizados`,
        link: `/mudancas/${updated.id}`,
        mudancaId: updated.id,
      });
    }

    return updated;
  }

  async aprovar(tenantId: string, id: string, aprovarMudancaDto: AprovarMudancaDto) {
    const mudanca = await this.findOne(tenantId, id);

    // Atualizar estado do motorista
    if (aprovarMudancaDto.motoristaId) {
      await this.prisma.motorista.update({
        where: { id: aprovarMudancaDto.motoristaId },
        data: { estado: 'ocupado' },
      });
    }

    // Ocupar slot na agenda
    const dataMudanca = mudanca.dataPretendida;
    const slot = await this.prisma.slotAgenda.findFirst({
      where: {
        tenantId,
        data: dataMudanca,
        horaInicio: mudanca.horaPretendida || '08:00',
      },
    });

    if (slot) {
      await this.prisma.slotAgenda.update({
        where: { id: slot.id },
        data: { capacidadeOcupada: { increment: 1 } },
      });
    }

    // Calcular receita prevista
    const veiculo = mudanca.veiculoId
      ? await this.prisma.veiculo.findUnique({ where: { id: mudanca.veiculoId } })
      : null;
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { configPreco: true },
    });
    const configPreco = (tenant?.configPreco as any) || {};
    const precoBaseHora = veiculo?.precoHora || configPreco.precoHora || 0;
    const acrescimo1Ajudante = configPreco.acrescimo1Ajudante || configPreco.motorista1AjudantePrecoDiferenca || 0;
    const acrescimo2Ajudantes = configPreco.acrescimo2Ajudantes || configPreco.motorista2AjudantesPrecoDiferenca || 0;
    const acrescimoUrgencia = configPreco.acrescimoUrgencia || 0;

    let precoHoraPrevisto = precoBaseHora;
    const numAjudantes = (aprovarMudancaDto.ajudantesIds || []).length;
    if (numAjudantes >= 2) {
      precoHoraPrevisto += acrescimo2Ajudantes;
    } else if (numAjudantes === 1) {
      precoHoraPrevisto += acrescimo1Ajudante;
    }
    if (mudanca.tipoServico === 'urgente') {
      precoHoraPrevisto += acrescimoUrgencia;
    }
    const receitaPrevista = (aprovarMudancaDto.tempoEstimadoHoras || 4) * precoHoraPrevisto;

    const updated = await this.prisma.mudanca.update({
      where: { id },
      data: {
        estado: 'aprovada',
        aprovadoPor: aprovarMudancaDto.aprovadoPor,
        aprovadoEm: new Date(),
        motoristaId: aprovarMudancaDto.motoristaId,
        ajudantesIds: aprovarMudancaDto.ajudantesIds || [],
        tempoEstimadoHoras: aprovarMudancaDto.tempoEstimadoHoras,
        observacoesAdmin: aprovarMudancaDto.observacoesAdmin,
        receitaPrevista,
      },
      include: {
        veiculo: true,
        motorista: true,
      },
    });

    // Email ao cliente
    if (updated.clienteEmail) {
      this.emailService.send(tenantId, updated.clienteEmail, 'confirmacao_aprovacao', {
        nomeCliente: updated.clienteNome || 'Cliente',
        dataPretendida: updated.dataPretendida,
        horaPretendida: updated.horaPretendida || '08:00',
      }, updated.id);
    }

    // Notificação ao motorista
    this.notificacaoService.criarParaUtilizadores(tenantId, ['motorista'], {
      tipo: 'mudanca_aprovada',
      mensagem: `Mudança de ${updated.clienteNome || 'cliente'} aprovada — verificada para si`,
      link: `/mudancas/${updated.id}`,
      mudancaId: updated.id,
    });

    return updated;
  }

  async iniciarDeslocamento(tenantId: string, id: string, userId: string, previsaoChegadaMinutos?: number) {
    const mudanca = await this.findOne(tenantId, id);

    // Resolve userId → motorista record
    const motorista = await this.prisma.motorista.findFirst({
      where: { tenantId, userId },
    });

    if (!motorista || mudanca.motoristaId !== motorista.id) {
      throw new NotFoundException('Mudança não atribuída a este motorista');
    }

    const updated = await this.prisma.mudanca.update({
      where: { id },
      data: {
        estado: 'a_caminho',
        iniciadoEm: new Date(),
        ...(previsaoChegadaMinutos ? { previsaoChegadaMinutos } : {}),
      },
    });

    // Email ao cliente
    if (updated.clienteEmail) {
      this.emailService.send(tenantId, updated.clienteEmail, 'inicio_deslocamento', {
        nomeCliente: updated.clienteNome || 'Cliente',
        motoristaNome: motorista.nome,
        previsaoChegada: previsaoChegadaMinutos ? `${previsaoChegadaMinutos} minutos` : 'em breve',
      }, updated.id);
    }

    // SMS ao cliente (se tiver telefone)
    if (updated.clienteTelefone) {
      // Resolve nome da empresa do tenant
      let nomeEmpresa = 'Mudanças';
      try {
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { configMarca: true },
        });
        nomeEmpresa = (tenant?.configMarca as any)?.nome || nomeEmpresa;
      } catch {}

      this.smsService.sendTemplate(
        updated.clienteTelefone,
        'O motorista {{motoristaNome}} está a caminho! Previsão de chegada: {{previsaoChegada}}. - {{nomeEmpresa}}',
        {
          motoristaNome: motorista.nome,
          previsaoChegada: previsaoChegadaMinutos ? `${previsaoChegadaMinutos} minutos` : 'em breve',
          nomeEmpresa,
        },
      ).catch(() => {});
    }

    // Notificação admin/gerente
    this.notificacaoService.criarParaUtilizadores(tenantId, ['admin', 'gerente'], {
      tipo: 'motorista_a_caminho',
      mensagem: `Motorista ${motorista.nome} iniciou deslocamento para mudança de ${updated.clienteNome || 'cliente'}`,
      link: `/mudancas/${updated.id}`,
      mudancaId: updated.id,
    });

    return updated;
  }

  async emServico(tenantId: string, id: string, userId: string) {
    const mudanca = await this.findOne(tenantId, id);

    // Resolve userId → motorista record
    const motorista = await this.prisma.motorista.findFirst({
      where: { tenantId, userId },
    });

    if (!motorista || mudanca.motoristaId !== motorista.id) {
      throw new NotFoundException('Mudança não atribuída a este motorista');
    }

    return this.prisma.mudanca.update({
      where: { id },
      data: {
        estado: 'em_servico',
        ...(mudanca.iniciadoEm ? {} : { iniciadoEm: new Date() }),
      },
    });
  }

  async concluir(tenantId: string, id: string, concluirMudancaDto: ConcluirMudancaDto) {
    const mudanca = await this.findOne(tenantId, id);

    // Buscar veículo e config de preços do tenant
    const veiculo = mudanca.veiculoId
      ? await this.prisma.veiculo.findUnique({ where: { id: mudanca.veiculoId } })
      : null;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { configPreco: true },
    });
    const configPreco = (tenant?.configPreco as any) || {};

    // --- RECEITA ---
    // Preço base por hora (veículo) + adicional por ajudante + urgência
    const precoBaseHora = veiculo?.precoHora || configPreco.precoHora || 0;
    const acrescimo1Ajudante = configPreco.acrescimo1Ajudante || configPreco.motorista1AjudantePrecoDiferenca || 0;
    const acrescimo2Ajudantes = configPreco.acrescimo2Ajudantes || configPreco.motorista2AjudantesPrecoDiferenca || 0;
    const acrescimoUrgencia = configPreco.acrescimoUrgencia || 0;

    let precoHora = precoBaseHora;
    const numAjudantes = concluirMudancaDto.ajudantesConfirmados?.length || 0;
    if (numAjudantes >= 2) {
      precoHora += acrescimo2Ajudantes;
    } else if (numAjudantes === 1) {
      precoHora += acrescimo1Ajudante;
    }
    if (mudanca.tipoServico === 'urgente') {
      precoHora += acrescimoUrgencia;
    }

    // Calcular valor total de materiais utilizados
    const materiais = concluirMudancaDto.materiaisUtilizados;
    const precoMateriais = (configPreco as any) || {};
    const valorMateriais =
      (materiais?.protecaoFilme || 0) * (precoMateriais.precoProtecaoFilme || 0) +
      (materiais?.protecaoCartao || 0) * (precoMateriais.precoProtecaoCartao || 0) +
      (materiais?.caixas || 0) * (precoMateriais.precoCaixas || 0) +
      (materiais?.fitaCola || 0) * (precoMateriais.precoFitaCola || 0);

    // Receita = (preço base + ajudantes + urgência) × horas + materiais
    const receitaRealizada = (concluirMudancaDto.horasCobradas * precoHora) + valorMateriais;

    // --- CUSTOS: Motorista e Ajudantes (snapshot na data da mudança) ---
    const motorista = mudanca.motoristaId
      ? await this.prisma.motorista.findUnique({ where: { id: mudanca.motoristaId } })
      : null;
    const valorHoraMotorista = motorista?.valorHora || 0;
    const horasRegistadas = concluirMudancaDto.horasRegistadas || concluirMudancaDto.horasCobradas;
    const totalPagoMotorista = valorHoraMotorista * horasRegistadas;

    let totalPagoAjudantes = 0;
    const ajudantesIds = concluirMudancaDto.ajudantesConfirmados || [];
    if (ajudantesIds.length > 0) {
      const ajudantes = await this.prisma.ajudante.findMany({
        where: { id: { in: ajudantesIds } },
        select: { id: true, valorHora: true },
      });
      totalPagoAjudantes = ajudantes.reduce((sum, a) => sum + (a.valorHora || 0) * horasRegistadas, 0);
    }

    // --- CUSTOS OPERACIONAIS (combustível + alimentação + motorista + ajudantes) ---
    const custosCombustivel = concluirMudancaDto.combustivel?.valor || 0;
    const custosAlimentacao = concluirMudancaDto.alimentacao?.teve
      ? concluirMudancaDto.alimentacao.valor
      : 0;
    const custosOperacionais = custosCombustivel + custosAlimentacao + totalPagoMotorista + totalPagoAjudantes;
    const margem = receitaRealizada - custosOperacionais;

    const updated = await this.prisma.mudanca.update({
      where: { id },
      data: {
        estado: 'concluida',
        conclusao: concluirMudancaDto as any,
        concluidoPor: concluirMudancaDto.concluidoPor,
        concluidoEm: new Date(),
        // Snapshot dos valores na data da mudança
        valorHoraMotorista,
        valorHoraAjudante: ajudantesIds.length > 0
          ? (await this.prisma.ajudante.findMany({
              where: { id: { in: ajudantesIds } },
              select: { valorHora: true },
            })).reduce((sum, a) => sum + (a.valorHora || 0), 0) / ajudantesIds.length
          : 0,
        totalPagoMotorista,
        totalPagoAjudantes,
        // Financeiro calculado
        receitaRealizada,
        custosOperacionais,
        margem,
      },
    });

    // Email ao cliente
    if (updated.clienteEmail) {
      this.emailService.send(tenantId, updated.clienteEmail, 'mudanca_concluida', {
        nomeCliente: updated.clienteNome || 'Cliente',
        dataPretendida: updated.dataPretendida,
      }, updated.id);
    }

    // Notificação admin/gerente
    this.notificacaoService.criarParaUtilizadores(tenantId, ['admin', 'gerente'], {
      tipo: 'mudanca_concluida',
      mensagem: `Mudança de ${updated.clienteNome || 'cliente'} concluída`,
      link: `/mudancas/${updated.id}`,
      mudancaId: updated.id,
    });

    // Criar movimentos financeiros automáticos
    await this.criarMovimentosFinanceiros(tenantId, updated.id, {
      receita: receitaRealizada,
      custos: {
        combustivel: custosCombustivel,
        alimentacao: custosAlimentacao,
        motorista: totalPagoMotorista,
        ajudantes: totalPagoAjudantes,
      },
    });

// Atualizar horas trabalhadas do motorista
    if (motorista && horasRegistadas > 0) {
      await this.prisma.motorista.update({
        where: { id: motorista.id },
        data: {
          horasTrabalhadasMes: (motorista.horasTrabalhadasMes || 0) + horasRegistadas,
        },
      });
    }

    // Liberar slot na agenda
    if (mudanca.veiculoId && mudanca.dataPretendida && mudanca.horaPretendida) {
      try {
        await this.agendaService.liberarSlot(tenantId, mudanca.dataPretendida, mudanca.horaPretendida);
      } catch (e) {
        // Slot pode não existir, ignora erro
      }
    }

    return updated;
  }

  private async criarMovimentosFinanceiros(
    tenantId: string,
    mudancaId: string,
    dados: {
      receita: number;
      custos: {
        combustivel: number;
        alimentacao: number;
        motorista: number;
        ajudantes: number;
      };
    },
  ) {
    const movimentos: any[] = [];

    // Receita do serviço
    if (dados.receita > 0) {
      movimentos.push({
        tenantId,
        mudancaId,
        tipo: 'receita',
        categoria: 'servico',
        descricao: 'Receita de mudança',
        valor: dados.receita,
        data: new Date(),
      });
    }

    // Custos operacionais
    if (dados.custos.combustivel > 0) {
      movimentos.push({
        tenantId,
        mudancaId,
        tipo: 'custo',
        categoria: 'combustivel',
        descricao: 'Combustível',
        valor: dados.custos.combustivel,
        data: new Date(),
      });
    }

    if (dados.custos.alimentacao > 0) {
      movimentos.push({
        tenantId,
        mudancaId,
        tipo: 'custo',
        categoria: 'alimentacao',
        descricao: 'Alimentação',
        valor: dados.custos.alimentacao,
        data: new Date(),
      });
    }

    if (dados.custos.motorista > 0) {
      movimentos.push({
        tenantId,
        mudancaId,
        tipo: 'custo',
        categoria: 'pagamento_motorista',
        descricao: 'Pagamento ao motorista',
        valor: dados.custos.motorista,
        data: new Date(),
      });
    }

    if (dados.custos.ajudantes > 0) {
      movimentos.push({
        tenantId,
        mudancaId,
        tipo: 'custo',
        categoria: 'pagamento_ajudante',
        descricao: 'Pagamento aos ajudantes',
        valor: dados.custos.ajudantes,
        data: new Date(),
      });
    }

    if (movimentos.length > 0) {
      await this.prisma.movimentoFinanceiro.createMany({ data: movimentos });
    }
  }

  async recusar(tenantId: string, id: string, motivo: string) {
    const mudanca = await this.findOne(tenantId, id);

    const updated = await this.prisma.mudanca.update({
      where: { id },
      data: {
        estado: 'recusada',
        observacoesAdmin: motivo,
      },
    });

    // Email ao cliente
    if (updated.clienteEmail) {
      this.emailService.send(tenantId, updated.clienteEmail, 'recusa_mudanca', {
        nomeCliente: updated.clienteNome || 'Cliente',
        motivo,
      }, updated.id);
    }

    // Notificação admin/gerente
    this.notificacaoService.criarParaUtilizadores(tenantId, ['admin', 'gerente'], {
      tipo: 'mudanca_recusada',
      mensagem: `Mudança de ${updated.clienteNome || 'cliente'} foi recusada`,
      link: `/mudancas/${updated.id}`,
      mudancaId: updated.id,
    });

    return updated;
  }

  async cancelar(tenantId: string, id: string, motivo?: string) {
    const mudanca = await this.findOne(tenantId, id);

    return this.prisma.mudanca.update({
      where: { id },
      data: {
        estado: 'cancelada',
        ...(motivo ? { observacoesAdmin: motivo } : {}),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.mudanca.delete({
      where: { id },
    });
  }

  async getMinhas(tenantId: string, userId: string, filters?: any) {
    // Encontrar o motorista associado a este user
    const motorista = await this.prisma.motorista.findFirst({
      where: { tenantId, userId },
    });

    if (!motorista) {
      return [];
    }

    const where: any = { tenantId, motoristaId: motorista.id };

    if (filters?.data) {
      where.dataPretendida = filters.data;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.dataInicio || filters?.dataFim) {
      where.dataPretendida = {};
      if (filters.dataInicio) where.dataPretendida.gte = filters.dataInicio;
      if (filters.dataFim) where.dataPretendida.lte = filters.dataFim;
    }

    return this.prisma.mudanca.findMany({
      where,
      include: {
        veiculo: true,
        motorista: {
          select: { id: true, nome: true, telefone: true },
        },
      },
      orderBy: { horaPretendida: 'asc' },
    });
  }

  async getDashboard(tenantId: string, userId?: string) {
    const hoje = new Date().toISOString().split('T')[0];

    // Resolve gerente motorista restrictions
    let motoristaFilter: string[] | null = null;
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { perfil: true, permissoes: true },
      });
      if (user?.perfil === 'gerente' && user.permissoes) {
        const perms = user.permissoes as any;
        if (perms.motoristasPermitidos && !perms.verTodosMotoristas) {
          motoristaFilter = perms.motoristasPermitidos;
        }
      }
    }

    const baseWhere: any = { tenantId };
    if (motoristaFilter) {
      baseWhere.motoristaId = { in: motoristaFilter };
    }

    const [
      mudancasHoje,
      pendentes,
      emCurso,
      concluidasSemFicha,
      estatisticasMes,
    ] = await Promise.all([
      this.prisma.mudanca.findMany({
        where: { ...baseWhere, dataPretendida: hoje },
        include: { motorista: true, veiculo: true },
      }),
      this.prisma.mudanca.count({ where: { ...baseWhere, estado: 'pendente' } }),
      this.prisma.mudanca.count({ where: { ...baseWhere, estado: { in: ['a_caminho', 'em_servico', 'ocupado'] } } }),
      this.prisma.mudanca.count({
        where: {
          ...baseWhere,
          estado: 'concluida',
          NOT: { conclusao: Prisma.JsonNull },
        },
      }),
      this.prisma.mudanca.aggregate({
      where: {
        ...baseWhere,
        dataPretendida: {
          gte: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        },
      },
        _sum: {
          receitaRealizada: true,
          custosOperacionais: true,
          margem: true,
        },
        _count: true,
      }),
    ]);

    return {
      hoje: {
        mudancas: mudancasHoje,
        total: mudancasHoje.length,
      },
      pendentes,
      emCurso,
      concluidasSemFicha,
      mes: {
        total: estatisticasMes._count,
        receita: estatisticasMes._sum.receitaRealizada || 0,
        custos: estatisticasMes._sum.custosOperacionais || 0,
        margem: estatisticasMes._sum.margem || 0,
      },
    };
  }
}
