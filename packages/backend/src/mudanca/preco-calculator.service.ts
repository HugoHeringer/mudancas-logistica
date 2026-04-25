import { Injectable } from '@nestjs/common';

@Injectable()
export class PrecoCalculatorService {
  /**
   * Calcular preço por hora baseado no veículo e número de ajudantes
   */
  calcularPrecoHora(
    precoBaseVeiculo: number,
    numAjudantes: number,
    acrescimo1: number,
    acrescimo2: number,
  ): number {
    if (numAjudantes >= 2) return precoBaseVeiculo + acrescimo2;
    if (numAjudantes === 1) return precoBaseVeiculo + acrescimo1;
    return precoBaseVeiculo;
  }

  /**
   * Calcular receita prevista (na aprovação)
   */
  calcularReceitaPrevista(
    horasEstimadas: number,
    precoHora: number,
    acrescimoUrgencia: number,
    isUrgente: boolean,
  ): number {
    const multiplicadorUrgencia = isUrgente ? (1 + acrescimoUrgencia / 100) : 1;
    return horasEstimadas * precoHora * multiplicadorUrgencia;
  }

  /**
   * Calcular receita realizada (na conclusão)
   */
  calcularReceitaRealizada(
    horasCobradas: number,
    precoHora: number,
    acrescimoUrgencia: number,
    isUrgente: boolean,
    totalMateriais: number,
  ): number {
    const multiplicadorUrgencia = isUrgente ? (1 + acrescimoUrgencia / 100) : 1;
    return (horasCobradas * precoHora * multiplicadorUrgencia) + totalMateriais;
  }

  /**
   * Calcular custo total da equipa
   */
  calcularCustoEquipa(
    horasTrabalhadas: number,
    valorHoraMotorista: number,
    ajudantes: Array<{ valorHora: number }>,
  ): number {
    const custoMotorista = horasTrabalhadas * valorHoraMotorista;
    const custoAjudantes = ajudantes.reduce(
      (sum, a) => sum + horasTrabalhadas * a.valorHora,
      0,
    );
    return custoMotorista + custoAjudantes;
  }
}
