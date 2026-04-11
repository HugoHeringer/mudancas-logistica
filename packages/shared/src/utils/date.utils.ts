/**
 * Utilitários de data
 */

export const PT_LOCALE = 'pt-PT';

/**
 * Formata uma data para o formato pt-PT
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Data inválida';

  return new Intl.DateTimeFormat(PT_LOCALE, options).format(d);
}

/**
 * Formata data e hora
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formata apenas a data (sem hora)
 */
export function formatDateOnly(date: Date | string): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Verifica se uma data é hoje
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Verifica se uma data é amanhã
 */
export function isTomorrow(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.toDateString() === tomorrow.toDateString();
}

/**
 * Adiciona dias a uma data
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Adiciona horas a uma data
 */
export function addHours(date: Date | string, hours: number): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(d);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Diferença em horas entre duas datas
 */
export function diffInHours(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return Math.abs((d2.getTime() - d1.getTime()) / (1000 * 60 * 60));
}

/**
 * Diferença em minutos entre duas datas
 */
export function diffInMinutes(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return Math.abs((d2.getTime() - d1.getTime()) / (1000 * 60));
}

/**
 * Inicio do dia (00:00:00)
 */
export function startOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/**
 * Fim do dia (23:59:59)
 */
export function endOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/**
 * Primeiro dia do mês
 */
export function startOfMonth(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Último dia do mês
 */
export function endOfMonth(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Verifica se data está dentro de um range
 */
export function isDateInRange(
  date: Date | string,
  start: Date | string,
  end: Date | string
): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  return d >= s && d <= e;
}

/**
 * Gera array de datas entre dois pontos
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
