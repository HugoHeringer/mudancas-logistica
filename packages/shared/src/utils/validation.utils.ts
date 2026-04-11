/**
 * Utilitários de validação
 */

import { z } from 'zod';

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida telefone português
 */
export function isValidPortuguesePhone(phone: string): boolean {
  const phoneRegex = /^(\+351)?[2-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Valida matrícula portuguesa
 */
export function isValidPortuguesePlate(plate: string): boolean {
  // Formato atual: AA-00-AA
  const plateRegex = /^[A-Z]{2}-\d{2}-[A-Z]{2}$/;
  return plateRegex.test(plate.toUpperCase());
}

/**
 * Valida código postal português
 */
export function isValidPortugueseZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{4}-\d{3}$/;
  return zipRegex.test(zipCode);
}

/**
 * Valida NIF português
 */
export function isValidNIF(nif: string): boolean {
  const nifRegex = /^[1-9]\d{8}$/;
  if (!nifRegex.test(nif)) return false;

  // Algoritmo de validação do NIF
  const digits = nif.split('').map(Number);
  const check = (digits[0] * 9 + digits[1] * 8 + digits[2] * 7 + digits[3] * 6 +
    digits[4] * 5 + digits[5] * 4 + digits[6] * 3 + digits[7] * 2) % 11;

  const expectedCheckDigit = check === 0 || check === 1 ? 0 : 11 - check;
  return digits[8] === expectedCheckDigit;
}

/**
 * Valida URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida cor hexadecimal
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
  return hexRegex.test(color);
}

/**
 * Sanitiza string HTML básica
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Valida dados contra um schema Zod
 */
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): { valid: true; data: T } | { valid: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
  return { valid: false, errors };
}

/**
 * Trunca string mantendo palavras inteiras
 */
export function truncateString(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  const truncated = str.substring(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace > 0 ? lastSpace : truncated.length) + suffix;
}

/**
 * Normaliza string (remove acentos, lowercase)
 */
export function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
