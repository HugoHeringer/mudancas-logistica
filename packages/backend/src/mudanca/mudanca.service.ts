import { Injectable, NotFoundException, Inject, forwardRef, BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMudancaDto } from './dto/create-mudanca.dto';
import { UpdateMudancaDto } from './dto/update-mudanca.dto';
import { AprovarMudancaDto } from './dto/aprovar-mudanca.dto';
import { ConcluirMudancaDto } from './dto/concluir-mudanca.dto';
import { PrecoCalculatorService } from './preco-calculator.service';
import { EmailService } from '../comunicacao/email.service';
import { NotificacaoService } from '../notificacao/notificacao.service';
import { SMS_SERVICE_TOKEN, ISmsService } from '../comunicacao/sms.interface';
import { ClienteService } from '../cliente/cliente.service';
import { ConflictDetectorService } from './conflict-detector.service';
import { getMotoristaFilter } from '../common/helpers/get-motorista-filter';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

@Injectable()
export class MudancaService {
  constructor(
    private prisma: PrismaService,
    private precoCalculator: PrecoCalculatorService,
    private emailService: EmailService,
    private notificacaoService: NotificacaoService,
    @Inject(SMS_SERVICE_TOKEN) private smsService: ISmsService,
    private clienteService: ClienteService,
    private conflictDetector: ConflictDetectorService,
  ) {}

  async create(tenantId: string, createMudancaDto: CreateMudancaDto) {
    const { tenantId: _dtoTenantId, moradaRecolha, moradaEntrega, materiais, dataPretendida, ...rest } = createMudancaDto as any;
    const dataPretendidaDate = dataPretendida ? new Date(dataPretendida) : new Date();

    // C5: Validar veículo não está em manutenção
    if (createMudancaDto.veiculoId) {
      const veiculoRecord = await this.prisma.veiculo.findUnique({ where: { id: createMudancaDto.veiculoId } });
      if (veiculoRecord?.estado === 'em_manutencao') {
        throw new BadRequestException('Veículo em manutenção não pode ser seleccionado');
      }
    }

    // C6: Validar motorista não está inactivo
    if (createMudancaDto.motoristaId) {
      const motoristaRecord = await this.prisma.motorista.findUnique({ where: { id: createMudancaDto.motoristaId } });
      if (motoristaRecord?.estado === 'inativo') {
        throw new BadRequestException('Motorista inactivo não pode ser seleccionado');
      }
    }

    // Validar conflitos se houver motorista/veículo já no create (Site Público)
    if (createMudancaDto.motoristaId || createMudancaDto.veiculoId) {
      const conflict = await this.conflictDetector.checkConflicts(
        tenantId,
        dataPretendidaDate,
        createMudancaDto.horaPretendida || '08:00',
        Number((createMudancaDto as any).tempoEstimadoHoras || 4),
        createMudancaDto.motoristaId,
        createMudancaDto.veiculoId,
      );
      
      if (conflict.hasConflict) {
        throw new BadRequestException(
          `O ${conflict.type === 'motorista' ? 'motorista' : 'veículo'} já possui um serviço agendado para este horário.`,
        );
      }
    }

    const mudanca = await this.prisma.mudanca.create({
      data: {
        tenantId,
        ...rest,
        dataPretendida: dataPretendidaDate,
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

  async findAll(tenantId: string, filters?: any, user?: any) {
    const where: any = { tenantId, ...getMotoristaFilter(user) };

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

    // Resolve ajudante names from relation
    const ajudantes = await this.prisma.mudanca.findUnique({
      where: { id, tenantId },
      include: { ajudantes: { select: { id: true, nome: true, telefone: true } } },
    });
    (mudanca as any).ajudantes = ajudantes?.ajudantes || [];

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
      const conflict = await this.conflictDetector.checkConflicts(
        tenantId,
        updated.dataPretendida,
        updated.horaPretendida || '08:00',
        Number(updated.tempoEstimadoHoras || 4),
        updated.motoristaId ?? undefined,
        updated.veiculoId ?? undefined,
        id,
      );
      if (conflict.hasConflict) {
        console.warn(`[Agenda] Admin atualizando mudança com conflito de ${conflict.type}. Mudança ID: ${id}`);
      }
    }

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

    // Buscar ConfigPreco e ConfigAgenda do tenant
    const tenantConfig = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { configPreco: true, configAgenda: true },
    });
    const configPreco = (tenantConfig?.configPreco as any) || {};
    const configAgenda = (tenantConfig?.configAgenda as any) || {};
    if (!configPreco.precoHora) {
      throw new Error('Configuração de preço (precoHora) não definida para este tenant. Configure antes de aprovar mudanças.');
    }

    // Validar conflitos — bloqueia com erro 409 se houver sobreposição
    const tempoHoras = Number(aprovarMudancaDto.tempoEstimadoHoras || 4);

    if (aprovarMudancaDto.motoristaId) {
      const motoristaConflict = await this.conflictDetector.detectarConflito(
        tenantId, aprovarMudancaDto.motoristaId, 'motorista',
        mudanca.dataPretendida, mudanca.horaPretendida || '08:00', tempoHoras, id,
      );
      if (motoristaConflict.hasConflict) {
        console.warn(`[Agenda] Alerta de Conflito (Motorista): ${motoristaConflict.message}`);
      }
    }

    if (aprovarMudancaDto.veiculoId) {
      const veiculoConflict = await this.conflictDetector.detectarConflito(
        tenantId, aprovarMudancaDto.veiculoId, 'veiculo',
        mudanca.dataPretendida, mudanca.horaPretendida || '08:00', tempoHoras, id,
      );
      if (veiculoConflict.hasConflict) {
        console.warn(`[Agenda] Alerta de Conflito (Veículo): ${veiculoConflict.message}`);
      }
    }

    if (aprovarMudancaDto.ajudantesIds && aprovarMudancaDto.ajudantesIds.length > 0) {
      for (const ajudanteId of aprovarMudancaDto.ajudantesIds) {
        const ajudanteConflict = await this.conflictDetector.detectarConflito(
          tenantId, ajudanteId, 'ajudante',
          mudanca.dataPretendida, mudanca.horaPretendida || '08:00', tempoHoras, id,
        );
        if (ajudanteConflict.hasConflict) {
          console.warn(`[Agenda] Alerta de Conflito (Ajudante): ${ajudanteConflict.message}`);
        }
      }
    }

    // Validate motorista is available
    if (aprovarMudancaDto.motoristaId) {
      const motoristaRecord = await this.prisma.motorista.findUnique({ where: { id: aprovarMudancaDto.motoristaId } });
      if (motoristaRecord?.estado === 'inativo') {
        throw new BadRequestException('Motorista inactivo não pode ser seleccionado');
      }
    }

    // Validate veiculo is not in maintenance
    if (aprovarMudancaDto.veiculoId) {
      const veiculoRecord = await this.prisma.veiculo.findUnique({ where: { id: aprovarMudancaDto.veiculoId } });
      if (veiculoRecord?.estado === 'em_manutencao') {
        throw new BadRequestException('Veículo em manutenção não pode ser seleccionado');
      }
    }

    // Validate ajudantes are active
    if (aprovarMudancaDto.ajudantesIds && aprovarMudancaDto.ajudantesIds.length > 0) {
      const ajudantes = await this.prisma.ajudante.findMany({
        where: { id: { in: aprovarMudancaDto.ajudantesIds }, tenantId },
      });
      const inactiveAjudante = ajudantes.find(a => !a.eAtivo);
      if (inactiveAjudante) {
        throw new BadRequestException(`Ajudante "${inactiveAjudante.nome}" está inactivo`);
      }
    }

    // Buscar veículo com precoHora
    const veiculo = aprovarMudancaDto.veiculoId
      ? await this.prisma.veiculo.findUnique({ where: { id: aprovarMudancaDto.veiculoId } })
      : null;
    const precoBaseHora = Number(veiculo?.precoHora || configPreco.precoHora || 0);

    // Contar ajudantes
    const numAjudantes = (aprovarMudancaDto.ajudantesIds || []).length;

    // Calcular preço/hora final com PrecoCalculator
    const precoHoraFinal = this.precoCalculator.calcularPrecoHora(
      precoBaseHora,
      numAjudantes,
      Number(configPreco.acrescimo1Ajudante || 0),
      Number(configPreco.acrescimo2Ajudantes || 0),
    );

    // Buscar acrescimoUrgencia de ConfigAgenda (não ConfigPreco)
    const acrescimoUrgencia = Number(configAgenda.acrescimoUrgencia || 0);
    const isUrgente = mudanca.tipoServico === 'urgente';

    // Calcular receita prevista com PrecoCalculator
    const receitaPrevista = this.precoCalculator.calcularReceitaPrevista(
      aprovarMudancaDto.tempoEstimadoHoras || 4,
      precoHoraFinal,
      acrescimoUrgencia,
      isUrgente,
    );

    // Gravar snapshots do motorista e ajudantes na aprovação
    const motorista = aprovarMudancaDto.motoristaId
      ? await this.prisma.motorista.findUnique({ where: { id: aprovarMudancaDto.motoristaId } })
      : null;
    const valorHoraMotoristaSnapshot = Number(motorista?.valorHora || 0);

    let valorHoraAjudanteSnapshot = 0;
    if (aprovarMudancaDto.ajudantesIds && aprovarMudancaDto.ajudantesIds.length > 0) {
      const ajudantes = await this.prisma.ajudante.findMany({
        where: { id: { in: aprovarMudancaDto.ajudantesIds }, tenantId },
        select: { valorHora: true },
      });
      valorHoraAjudanteSnapshot = ajudantes.length > 0
        ? ajudantes.reduce((sum, a) => sum + Number(a.valorHora || 0), 0) / ajudantes.length
        : 0;
    }

    const updated = await this.prisma.mudanca.update({
      where: { id },
      data: {
        estado: 'aprovada',
        aprovadoPor: aprovarMudancaDto.aprovadoPor,
        aprovadoEm: new Date(),
        motoristaId: aprovarMudancaDto.motoristaId,
        veiculoId: aprovarMudancaDto.veiculoId || null,
        tempoEstimadoHoras: aprovarMudancaDto.tempoEstimadoHoras,
        observacoesAdmin: aprovarMudancaDto.observacoesAdmin,
        receitaPrevista,
        // Snapshots financeiros gravados na aprovação (não na conclusão)
        valorHoraMotoristaSnapshot,
        valorHoraAjudanteSnapshot,
      },
    });

    // Connect ajudantes via relation - validate they belong to tenant first
    if (aprovarMudancaDto.ajudantesIds && aprovarMudancaDto.ajudantesIds.length > 0) {
      const validAjudantes = await this.prisma.ajudante.findMany({
        where: { id: { in: aprovarMudancaDto.ajudantesIds }, tenantId },
        select: { id: true },
      });
      const validIds = validAjudantes.map((a) => a.id);
      if (validIds.length !== aprovarMudancaDto.ajudantesIds.length) {
        throw new Error('Um ou mais ajudantes não pertencem a este tenant');
      }
      await this.prisma.mudanca.update({
        where: { id },
        data: {
          ajudantes: {
            set: validIds.map((ajId) => ({ id: ajId })),
          },
        },
      });
    }

    // Email ao cliente
    if (updated.clienteEmail) {
      this.emailService.send(tenantId, updated.clienteEmail, 'confirmacao_aprovacao', {
        nomeCliente: updated.clienteNome || 'Cliente',
        dataPretendida: updated.dataPretendida,
        horaPretendida: updated.horaPretendida || '08:00',
      }, updated.id);
    }

    // Atualizar estados para 'reservado'
    if (aprovarMudancaDto.motoristaId) {
      await this.prisma.motorista.update({
        where: { id: aprovarMudancaDto.motoristaId },
        data: { estado: 'reservado' },
      });
    }
    if (aprovarMudancaDto.veiculoId) {
      await this.prisma.veiculo.update({
        where: { id: aprovarMudancaDto.veiculoId },
        data: { estado: 'reservado' },
      });
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

    // Atualizar estados: motorista → em_deslocamento, veículo → em_servico
    if (updated.motoristaId) {
      await this.prisma.motorista.update({
        where: { id: updated.motoristaId },
        data: { estado: 'em_deslocamento' },
      });
    }
    if (updated.veiculoId) {
      await this.prisma.veiculo.update({
        where: { id: updated.veiculoId },
        data: { estado: 'em_servico' },
      });
    }

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

    const motorista = await this.prisma.motorista.findFirst({
      where: { tenantId, userId },
    });

    if (!motorista || mudanca.motoristaId !== motorista.id) {
      throw new NotFoundException('Mudança não atribuída a este motorista');
    }

    const updated = await this.prisma.mudanca.update({
      where: { id },
      data: {
        estado: 'em_servico',
        ...(mudanca.iniciadoEm ? {} : { iniciadoEm: new Date() }),
      },
    });

    // Atualizar estado do motorista para 'em_servico'
    if (updated.motoristaId) {
      await this.prisma.motorista.update({
        where: { id: updated.motoristaId },
        data: { estado: 'em_servico' },
      });
    }

    return updated;
  }

  async concluir(tenantId: string, id: string, concluirMudancaDto: ConcluirMudancaDto) {
    const mudanca = await this.findOne(tenantId, id);

    // Ler snapshots gravados na aprovação (NÃO buscar valores actuais)
    const valorHoraMotoristaSnapshot = Number((mudanca as any).valorHoraMotoristaSnapshot || 0);
    const valorHoraAjudanteSnapshot = Number((mudanca as any).valorHoraAjudanteSnapshot || 0);

    // Buscar ConfigPreco e ConfigAgenda para cálculo de receita
    const tenantConfig = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { configPreco: true, configAgenda: true },
    });
    const configPreco = (tenantConfig?.configPreco as any) || {};
    const configAgenda = (tenantConfig?.configAgenda as any) || {};

    // Buscar veículo para preço base
    const veiculo = mudanca.veiculoId
      ? await this.prisma.veiculo.findUnique({ where: { id: mudanca.veiculoId } })
      : null;
    const precoBaseHora = Number(veiculo?.precoHora || configPreco.precoHora || 0);

    // Contar ajudantes
    const numAjudantes = concluirMudancaDto.ajudantesConfirmados?.length || 0;

    // Calcular preço/hora com PrecoCalculator
    const precoHoraFinal = this.precoCalculator.calcularPrecoHora(
      precoBaseHora,
      numAjudantes,
      Number(configPreco.acrescimo1Ajudante || 0),
      Number(configPreco.acrescimo2Ajudantes || 0),
    );

    // Urgência de ConfigAgenda
    const acrescimoUrgencia = Number(configAgenda.acrescimoUrgencia || 0);
    const isUrgente = mudanca.tipoServico === 'urgente';

    // Calcular valor total de materiais utilizados
    const materiais = concluirMudancaDto.materiaisUtilizados;
    const valorMateriais =
      (materiais?.protecaoFilme || 0) * (configPreco.precoProtecaoFilme || 0) +
      (materiais?.protecaoCartao || 0) * (configPreco.precoProtecaoCartao || 0) +
      (materiais?.caixas || 0) * (configPreco.precoCaixas || 0) +
      (materiais?.fitaCola || 0) * (configPreco.precoFitaCola || 0);

    // Calcular receita realizada com PrecoCalculator
    const receitaRealizada = this.precoCalculator.calcularReceitaRealizada(
      concluirMudancaDto.horasCobradas,
      precoHoraFinal,
      acrescimoUrgencia,
      isUrgente,
      valorMateriais,
    );

    // --- CUSTOS: usar snapshots da aprovação ---
    const horasCobradas = concluirMudancaDto.horasCobradas;
    const horasRegistadas = concluirMudancaDto.horasRegistadas || concluirMudancaDto.horasCobradas;

    const totalPagoMotorista = horasCobradas * valorHoraMotoristaSnapshot;
    const totalPagoAjudantes = numAjudantes * horasCobradas * valorHoraAjudanteSnapshot;

    // Custo total da equipa com PrecoCalculator
    const custoEquipa = this.precoCalculator.calcularCustoEquipa(
      horasRegistadas,
      valorHoraMotoristaSnapshot,
      numAjudantes > 0
        ? Array(numAjudantes).fill({ valorHora: valorHoraAjudanteSnapshot })
        : [],
    );

    // Custos operacionais
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
        // Manter snapshots já gravados na aprovação
        totalPagoMotorista,
        totalPagoAjudantes,
        horasCobradas,
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

    // Criar movimentos financeiros com categorias correctas
    await this.criarMovimentosFinanceiros(tenantId, updated.id, {
      receitaServico: receitaRealizada,
      custoEquipa: totalPagoMotorista + totalPagoAjudantes,
      custoCombustivel: custosCombustivel,
      custoAlimentacao: custosAlimentacao,
    });

    // Atualizar horas trabalhadas e valor recebido do motorista
    if (mudanca.motoristaId && horasRegistadas > 0) {
      const motorista = await this.prisma.motorista.findUnique({ where: { id: mudanca.motoristaId } });
      if (motorista) {
        await this.prisma.motorista.update({
          where: { id: motorista.id },
          data: {
            horasTrabalhadasMes: Number(motorista.horasTrabalhadasMes || 0) + horasRegistadas,
            valorRecebidoMes: Number(motorista.valorRecebidoMes || 0) + totalPagoMotorista,
          },
        });
      }
    }

    // Notificação admin/gerente sobre conclusão

    // Recalcular tipo do cliente (novo/recorrente/vip)
    if (updated.clienteId) {
      await this.clienteService.recalcularTipoCliente(tenantId, updated.clienteId);
    } else if (updated.clienteEmail) {
      // Auto-increment se não tem clienteId (mudança pública)
      await this.clienteService.incrementMudancasCount(tenantId, updated.clienteEmail);
    }

    // Libertar recursos (motorista e veículo)
    if (updated.motoristaId) {
      await this.prisma.motorista.update({
        where: { id: updated.motoristaId },
        data: { estado: 'disponivel' },
      });
    }
    if (updated.veiculoId) {
      await this.prisma.veiculo.update({
        where: { id: updated.veiculoId },
        data: { estado: 'disponivel' },
      });
    }
    if (updated.veiculoId) {
      await this.prisma.veiculo.update({
        where: { id: updated.veiculoId },
        data: { estado: 'disponivel' },
      });
    }
    // Libertar ajudantes
    const ajudantesNaMudanca = await this.prisma.ajudante.findMany({
      where: { mudancas: { some: { id: updated.id } }, tenantId },
      select: { id: true },
    });
    if (ajudantesNaMudanca.length > 0) {
      await this.prisma.ajudante.updateMany({
        where: { id: { in: ajudantesNaMudanca.map(a => a.id) } },
        data: { disponivel: true },
      });
    }

    return updated;
  }

  private async criarMovimentosFinanceiros(
    tenantId: string,
    mudancaId: string,
    dados: {
      receitaServico: number;
      custoEquipa: number;
      custoCombustivel: number;
      custoAlimentacao: number;
    },
  ) {
    const movimentos: any[] = [];

    // Receita do serviço
    if (dados.receitaServico > 0) {
      movimentos.push({
        tenantId,
        mudancaId,
        tipo: 'receita',
        categoria: 'receita_servico',
        descricao: 'Receita de mudança',
        valor: dados.receitaServico,
        data: new Date(),
      });
    }

    // Custo da equipa (motorista + ajudantes)
    if (dados.custoEquipa > 0) {
      movimentos.push({
        tenantId,
        mudancaId,
        tipo: 'custo',
        categoria: 'custo_equipa',
        descricao: 'Custo da equipa (motorista + ajudantes)',
        valor: dados.custoEquipa,
        data: new Date(),
      });
    }

    // Custo combustível
    if (dados.custoCombustivel > 0) {
      movimentos.push({
        tenantId,
        mudancaId,
        tipo: 'custo',
        categoria: 'custo_combustivel',
        descricao: 'Combustível',
        valor: dados.custoCombustivel,
        data: new Date(),
      });
    }

    // Custo alimentação
    if (dados.custoAlimentacao > 0) {
      movimentos.push({
        tenantId,
        mudancaId,
        tipo: 'custo',
        categoria: 'custo_alimentacao',
        descricao: 'Alimentação',
        valor: dados.custoAlimentacao,
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

    const updated = await this.prisma.mudanca.update({
      where: { id },
      data: {
        estado: 'cancelada',
        ...(motivo ? { observacoesAdmin: motivo } : {}),
      },
    });

    // Reverter estados dos recursos se a mudança estava em curso
    if (['a_caminho', 'em_servico', 'aprovada'].includes(mudanca.estado)) {
      if (updated.motoristaId) {
        await this.prisma.motorista.update({
          where: { id: updated.motoristaId },
          data: { estado: 'disponivel' },
        });
      }
      if (updated.veiculoId) {
        await this.prisma.veiculo.update({
          where: { id: updated.veiculoId },
          data: { estado: 'disponivel' },
        });
      }
      // Reverter ajudantes
      const ajudantesNaMudanca = await this.prisma.ajudante.findMany({
        where: { mudancas: { some: { id: updated.id } }, tenantId },
        select: { id: true },
      });
      if (ajudantesNaMudanca.length > 0) {
        await this.prisma.ajudante.updateMany({
          where: { id: { in: ajudantesNaMudanca.map(a => a.id) } },
          data: { disponivel: true },
        });
      }
    }

    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.mudanca.delete({
      where: { id },
    });
  }

  async getMinhas(tenantId: string, userId: string, filters?: any) {
    const motorista = await this.prisma.motorista.findFirst({
      where: { tenantId, userId },
    });

    if (!motorista) {
      return [];
    }

    const where: any = { tenantId, motoristaId: motorista.id };

    if (filters?.data) {
      const inicioDia = new Date(filters.data + 'T00:00:00.000');
      const fimDia = new Date(filters.data + 'T23:59:59.999');
      where.dataPretendida = { gte: inicioDia, lte: fimDia };
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
    const timeZone = 'Europe/Lisbon';
    const agoraLisboa = toZonedTime(new Date(), timeZone);
    
    const inicioDia = fromZonedTime(
      new Date(agoraLisboa.getFullYear(), agoraLisboa.getMonth(), agoraLisboa.getDate()), 
      timeZone
    );
    const fimDia = fromZonedTime(
      new Date(agoraLisboa.getFullYear(), agoraLisboa.getMonth(), agoraLisboa.getDate(), 23, 59, 59, 999), 
      timeZone
    );
    const inicioMes = fromZonedTime(
      new Date(agoraLisboa.getFullYear(), agoraLisboa.getMonth(), 1), 
      timeZone
    );

    // Resolve gerente motorista restrictions
    let motoristaFilterWhere: Record<string, any> = {};
    if (userId) {
      const userRecord = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { perfil: true, permissoes: true },
      });
      motoristaFilterWhere = getMotoristaFilter(userRecord);
    }

    const baseWhere: any = { tenantId, ...motoristaFilterWhere };

    const [
      mudancasHoje,
      pendentes,
      emCurso,
      concluidasSemFicha,
      estatisticasMes,
      pendentesList,
    ] = await Promise.all([
      this.prisma.mudanca.findMany({
        where: { ...baseWhere, dataPretendida: { gte: inicioDia, lte: fimDia } },
        include: { motorista: true, veiculo: true },
      }),
      this.prisma.mudanca.count({ where: { ...baseWhere, estado: 'pendente' } }),
      this.prisma.mudanca.count({ where: { ...baseWhere, estado: { in: ['a_caminho', 'em_servico', 'ocupado'] } } }),
      this.prisma.mudanca.count({
        where: {
          ...baseWhere,
          estado: 'concluida',
          concluidoEm: { not: null },
          conclusao: null,
        },
      }),
      this.prisma.mudanca.aggregate({
        where: {
          ...baseWhere,
          dataPretendida: {
            gte: inicioMes,
          },
        },
        _sum: {
          receitaRealizada: true,
          receitaPrevista: true,
          custosOperacionais: true,
          margem: true,
        },
        _count: true,
      }),
      // First 5 pending mudancas for quick view
      this.prisma.mudanca.findMany({
        where: { ...baseWhere, estado: 'pendente' },
        select: { id: true, clienteNome: true, dataPretendida: true },
        orderBy: { createdAt: 'asc' },
        take: 5,
      }),
    ]);

    const receitaTotal = Number(estatisticasMes._sum.receitaRealizada || 0);
    const custosTotal = Number(estatisticasMes._sum.custosOperacionais || 0);
    const margemTotal = Number(estatisticasMes._sum.margem || 0);
    const margemPercentual = receitaTotal > 0 ? (margemTotal / receitaTotal) * 100 : 0;

    return {
      hoje: {
        mudancas: mudancasHoje,
        total: mudancasHoje.length,
      },
      pendentes,
      emCurso,
      concluidasSemFicha,
      pendentesList,
      mes: {
        total: estatisticasMes._count,
        receita: receitaTotal,
        receitaPrevista: Number(estatisticasMes._sum.receitaPrevista || 0),
        custos: custosTotal,
        margem: margemTotal,
        margemPercentual: Math.round(margemPercentual * 100) / 100,
      },
    };
  }
}
