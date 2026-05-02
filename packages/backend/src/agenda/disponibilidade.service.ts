import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addHours, format } from 'date-fns';

export interface DisponibilidadeResult {
  disponivel: boolean;
  motoristasDisponiveis: any[];
  veiculosDisponiveis: any[];
  motivoBloqueio?: string;
}

export interface HorarioDisponivelResult {
  data: string;
  horariosDisponiveis: string[];
  horariosIndisponiveis: string[];
}

@Injectable()
export class DisponibilidadeService {
  private readonly timeZone = 'Europe/Lisbon';

  constructor(private prisma: PrismaService) {}

  /**
   * Verifica disponibilidade de motoristas e veículos para um determinado horário.
   * Um recurso está ocupado se tiver uma mudança aprovada cujo período
   * (horaPretendida + tempoEstimadoHoras) se sobreponha ao horário pedido.
   */
  async verificarDisponibilidade(
    tenantId: string,
    dataHoraInicio: Date,
    horasPrevistas: number,
  ): Promise<DisponibilidadeResult> {
    const fimNovo = addHours(dataHoraInicio, horasPrevistas || 4);

    // Buscar bloqueios para esta data
    const inicioDia = new Date(dataHoraInicio);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataHoraInicio);
    fimDia.setHours(23, 59, 59, 999);

    const bloqueio = await this.prisma.bloqueioAgenda.findFirst({
      where: {
        tenantId,
        dataInicio: { lte: fimDia },
        dataFim: { gte: inicioDia },
      },
    });

    if (bloqueio) {
      return {
        disponivel: false,
        motoristasDisponiveis: [],
        veiculosDisponiveis: [],
        motivoBloqueio: 'Dia bloqueado na agenda',
      };
    }

    // Buscar mudanças que se sobrepõem ao período pedido
    const mudancasSobrepostas = await this.prisma.mudanca.findMany({
      where: {
        tenantId,
        dataPretendida: { gte: inicioDia, lte: fimDia },
        estado: { in: ['aprovada', 'a_caminho', 'em_servico'] },
      },
      select: {
        id: true,
        motoristaId: true,
        veiculoId: true,
        dataPretendida: true,
        horaPretendida: true,
        tempoEstimadoHoras: true,
      },
    });

    // Calcular IDs de motoristas e veículos ocupados neste horário
    const motoristasOcupados = new Set<string>();
    const veiculosOcupados = new Set<string>();

    for (const m of mudancasSobrepostas) {
      const mStart = this.combineDateAndTime(m.dataPretendida, m.horaPretendida || '08:00');
      const mEnd = addHours(mStart, Number(m.tempoEstimadoHoras || 4));

      // Verificar sobreposição: inicioNovo < fimExistente AND inicioExistente < fimNovo
      const overlap = dataHoraInicio < mEnd && fimNovo > mStart;

      if (overlap) {
        if (m.motoristaId) motoristasOcupados.add(m.motoristaId);
        if (m.veiculoId) veiculosOcupados.add(m.veiculoId);
      }
    }

    // Buscar motoristas disponíveis (estado 'disponivel' e não ocupados)
    const motoristasDisponiveis = await this.prisma.motorista.findMany({
      where: {
        tenantId,
        estado: 'disponivel',
        id: { notIn: Array.from(motoristasOcupados) },
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        cartaConducao: true,
        valorHora: true,
      },
    });

    // Buscar veículos disponíveis (estado 'disponivel' e não ocupados)
    const veiculosDisponiveis = await this.prisma.veiculo.findMany({
      where: {
        tenantId,
        estado: 'disponivel',
        id: { notIn: Array.from(veiculosOcupados) },
      },
      select: {
        id: true,
        nome: true,
        marca: true,
        modelo: true,
        matricula: true,
        metrosCubicos: true,
        precoHora: true,
        imagemUrl: true,
        eParaUrgencias: true,
      },
    });

    const disponivel = motoristasDisponiveis.length > 0 && veiculosDisponiveis.length > 0;

    let motivoBloqueio: string | undefined;
    if (!disponivel) {
      if (motoristasDisponiveis.length === 0 && veiculosDisponiveis.length === 0) {
        motivoBloqueio = 'Sem motoristas e veículos disponíveis neste horário';
      } else if (motoristasDisponiveis.length === 0) {
        motivoBloqueio = 'Sem motoristas disponíveis neste horário';
      } else {
        motivoBloqueio = 'Sem veículos disponíveis neste horário';
      }
    }

    return {
      disponivel,
      motoristasDisponiveis,
      veiculosDisponiveis,
      motivoBloqueio,
    };
  }

  /**
   * Retorna lista de horários disponíveis (de meia em meia hora) para um dia.
   * Usa as configurações de agenda do tenant (horaAbertura, horaFecho).
   */
  async getHorariosDisponiveisDia(
    tenantId: string,
    data: string,
    horasPrevistas: number = 4,
  ): Promise<HorarioDisponivelResult> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return { data, horariosDisponiveis: [], horariosIndisponiveis: [] };
    }

    const configAgenda = (tenant.configAgenda as any) || {};
    const horaAbertura = configAgenda.horaInicio || configAgenda.horaAbertura || '08:00';
    const horaFecho = configAgenda.horaFim || configAgenda.horaFecho || '18:00';

    // Gerar slots de meia em meia hora
    const slots = this.generateTimeSlots(horaAbertura, horaFecho);

    const horariosDisponiveis: string[] = [];
    const horariosIndisponiveis: string[] = [];

    // Verificar bloqueio do dia
    const inicioDia = new Date(data + 'T00:00:00.000');
    const fimDia = new Date(data + 'T23:59:59.999');

    const bloqueio = await this.prisma.bloqueioAgenda.findFirst({
      where: {
        tenantId,
        dataInicio: { lte: fimDia },
        dataFim: { gte: inicioDia },
      },
    });

    if (bloqueio) {
      return { data, horariosDisponiveis: [], horariosIndisponiveis: slots };
    }

    // Verificar cada slot
    for (const slot of slots) {
      const dataHoraInicio = this.combineDateAndTime(new Date(data), slot);
      const result = await this.verificarDisponibilidade(tenantId, dataHoraInicio, horasPrevistas);

      if (result.disponivel) {
        horariosDisponiveis.push(slot);
      } else {
        horariosIndisponiveis.push(slot);
      }
    }

    return { data, horariosDisponiveis, horariosIndisponiveis };
  }

  /**
   * Versão optimizada que faz uma única query para calcular todos os slots do dia.
   * Evita N+1 queries ao verificar disponibilidade slot a slot.
   */
  async getHorariosDisponiveisDiaOptimised(
    tenantId: string,
    data: string,
    horasPrevistas: number = 4,
  ): Promise<HorarioDisponivelResult> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return { data, horariosDisponiveis: [], horariosIndisponiveis: [] };
    }

    const configAgenda = (tenant.configAgenda as any) || {};
    const horaAbertura = configAgenda.horaInicio || configAgenda.horaAbertura || '08:00';
    const horaFecho = configAgenda.horaFim || configAgenda.horaFecho || '18:00';

    const slots = this.generateTimeSlots(horaAbertura, horaFecho);

    // Verificar bloqueio do dia
    const inicioDia = new Date(data + 'T00:00:00.000');
    const fimDia = new Date(data + 'T23:59:59.999');

    const bloqueio = await this.prisma.bloqueioAgenda.findFirst({
      where: {
        tenantId,
        dataInicio: { lte: fimDia },
        dataFim: { gte: inicioDia },
      },
    });

    if (bloqueio) {
      return { data, horariosDisponiveis: [], horariosIndisponiveis: slots };
    }

    // Buscar todas as mudanças do dia + todos os motoristas/veículos disponíveis
    const [mudancasDia, todosMotoristas, todosVeiculos] = await Promise.all([
      this.prisma.mudanca.findMany({
        where: {
          tenantId,
          dataPretendida: { gte: inicioDia, lte: fimDia },
          estado: { in: ['aprovada', 'a_caminho', 'em_servico'] },
        },
        select: {
          id: true,
          motoristaId: true,
          veiculoId: true,
          dataPretendida: true,
          horaPretendida: true,
          tempoEstimadoHoras: true,
        },
      }),
      this.prisma.motorista.findMany({
        where: { tenantId, estado: 'disponivel' },
        select: { id: true },
      }),
      this.prisma.veiculo.findMany({
        where: { tenantId, estado: 'disponivel' },
        select: { id: true },
      }),
    ]);

    // Pré-calcular intervalos de cada mudança existente
    const intervals = mudancasDia.map(m => {
      const start = this.combineDateAndTime(m.dataPretendida, m.horaPretendida || '08:00');
      const end = addHours(start, Number(m.tempoEstimadoHoras || 4));
      return { start, end, motoristaId: m.motoristaId, veiculoId: m.veiculoId };
    });

    const totalMotoristas = todosMotoristas.length;
    const totalVeiculos = todosVeiculos.length;

    const horariosDisponiveis: string[] = [];
    const horariosIndisponiveis: string[] = [];

    for (const slot of slots) {
      const slotStart = this.combineDateAndTime(new Date(data), slot);
      const slotEnd = addHours(slotStart, horasPrevistas || 4);

      // Contar motoristas e veículos ocupados neste slot
      const motoristasOcupados = new Set<string>();
      const veiculosOcupados = new Set<string>();

      for (const interval of intervals) {
        const overlap = slotStart < interval.end && slotEnd > interval.start;
        if (overlap) {
          if (interval.motoristaId) motoristasOcupados.add(interval.motoristaId);
          if (interval.veiculoId) veiculosOcupados.add(interval.veiculoId);
        }
      }

      const motoristasLivres = totalMotoristas - motoristasOcupados.size;
      const veiculosLivres = totalVeiculos - veiculosOcupados.size;

      if (motoristasLivres > 0 && veiculosLivres > 0) {
        horariosDisponiveis.push(slot);
      } else {
        horariosIndisponiveis.push(slot);
      }
    }

    return { data, horariosDisponiveis, horariosIndisponiveis };
  }

  private generateTimeSlots(horaAbertura: string, horaFecho: string): string[] {
    const slots: string[] = [];
    const [startH, startM] = horaAbertura.split(':').map(Number);
    const [endH, endM] = horaFecho.split(':').map(Number);

    let currentH = startH;
    let currentM = startM;
    const endTotalMin = endH * 60 + endM;

    while (currentH * 60 + currentM < endTotalMin) {
      slots.push(`${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`);
      currentM += 30;
      if (currentM >= 60) {
        currentM = 0;
        currentH++;
      }
    }

    return slots;
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const d = new Date(date);
    d.setHours(hours || 8, minutes || 0, 0, 0);
    return d;
  }
}
