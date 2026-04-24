/**
 * Tema default para tenants sem configMarca personalizado
 * Inspirado no Sirocco (aura.build) adaptado a logística/mudanças
 */

import type { TenantBrandCores, TenantBrandFontes, TenantBrand } from '../types/tenant-brand.types';

export const DEFAULT_CORES: TenantBrandCores = {
  primaria: '#1B4D3E',
  primariaLight: '#2A7A64',
  secundaria: '#C4572A',
  acento: '#D4A853',
  fundo: '#F5EDE0',
  fundoEscuro: '#0A0F1E',
  texto: '#2C1810',
  textoClaro: '#F0E6D6',
};

export const DEFAULT_FONTES: TenantBrandFontes = {
  display: "'Cormorant Garamond', serif",
  body: "'Inter', sans-serif",
};

export const DEFAULT_TENANT_BRAND: TenantBrand = {
  nome: 'Movefy',
  slogan: 'Sua mudança, sem stress',
  cores: DEFAULT_CORES,
  fontes: DEFAULT_FONTES,
  contacto: {
    telefone: '',
    email: '',
  },
};

/**
 * Mapeamento de cores do TenantBrand para CSS custom properties
 */
export const BRAND_CSS_MAP: Record<keyof TenantBrandCores, string> = {
  primaria: '--tenant-primary',
  primariaLight: '--tenant-primary-light',
  secundaria: '--tenant-secondary',
  acento: '--tenant-accent',
  fundo: '--tenant-bg',
  fundoEscuro: '--tenant-bg-dark',
  texto: '--tenant-text',
  textoClaro: '--tenant-text-light',
};

/**
 * Convert hex color to HSL string for CSS variables
 */
export function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 0%';

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Convert hex color to RGB components
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Calculate relative luminance (W3C) for contrast calculation
 */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [rs, gs, bs] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determine if text should be light or dark based on background
 * Uses W3C relative luminance
 */
export function getContrastTextColor(bgHex: string): string {
  const luminance = relativeLuminance(bgHex);
  return luminance > 0.179 ? '#2C1810' : '#F0E6D6';
}

/**
 * Generate opacity variations of a hex color
 */
export function hexWithOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Detect subdomain from current hostname
 */
export function detectSubdomain(): string | null {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'admin') {
    return parts[0];
  }
  return localStorage.getItem('tenantSubdomain');
}

/**
 * Get theme preference from localStorage
 */
export type ThemePreference = 'light' | 'dark' | 'system';

export function getThemePreference(): ThemePreference {
  return (localStorage.getItem('theme-preference') as ThemePreference) || 'system';
}

export function setThemePreference(theme: ThemePreference): void {
  localStorage.setItem('theme-preference', theme);
}

export function resolveTheme(theme: ThemePreference): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/**
 * Injects tenant brand colors as CSS custom properties on :root
 * Includes 60/30/10 scheme and opacity variations
 */
export function injectBrandCSS(cores: TenantBrandCores, fontes: TenantBrandFontes, theme?: 'light' | 'dark') {
  const root = document.documentElement;

  // Inject base color variables
  Object.entries(BRAND_CSS_MAP).forEach(([key, cssVar]) => {
    root.style.setProperty(cssVar, cores[key as keyof TenantBrandCores]);
  });

  // Inject font variables
  root.style.setProperty('--tenant-font-display', fontes.display);
  root.style.setProperty('--tenant-font-body', fontes.body);

  // 60/30/10 Scheme CSS vars
  // Principal = 60% (primaria), Secundária = 30% (secundaria), Detalhe = 10% (acento)
  root.style.setProperty('--c-principal', cores.primaria);
  root.style.setProperty('--c-secundaria', cores.secundaria);
  root.style.setProperty('--c-detalhe', cores.acento);

  // Opacity variations for each
  [90, 70, 50, 20, 10].forEach(op => {
    root.style.setProperty(`--c-principal-${op}`, hexWithOpacity(cores.primaria, op / 100));
    root.style.setProperty(`--c-secundaria-${op}`, hexWithOpacity(cores.secundaria, op / 100));
    root.style.setProperty(`--c-detalhe-${op}`, hexWithOpacity(cores.acento, op / 100));
  });

  // Auto contrast text colors
  const principalText = getContrastTextColor(cores.primaria);
  const secundariaText = getContrastTextColor(cores.secundaria);
  const detalheText = getContrastTextColor(cores.acento);
  root.style.setProperty('--c-principal-text', principalText);
  root.style.setProperty('--c-secundaria-text', secundariaText);
  root.style.setProperty('--c-detalhe-text', detalheText);

  // Resolve theme
  const resolvedTheme = theme || resolveTheme(getThemePreference());
  const isDark = resolvedTheme === 'dark';

  // Background and foreground based on theme
  const bgHsl = hexToHsl(isDark ? cores.fundoEscuro : cores.fundo);
  const textHsl = hexToHsl(isDark ? cores.textoClaro : cores.texto);
  const textLightHsl = hexToHsl(cores.textoClaro);

  // shadcn-compatible HSL variables
  const primaryHsl = hexToHsl(cores.primaria);
  const secondaryHsl = hexToHsl(cores.fundo);
  const accentHsl = hexToHsl(cores.secundaria);
  const darkBgHsl = hexToHsl(cores.fundoEscuro);
  const accentGoldHsl = hexToHsl(cores.acento);

  root.style.setProperty('--primary', primaryHsl);
  root.style.setProperty('--primary-foreground', textLightHsl);
  root.style.setProperty('--secondary', secondaryHsl);
  root.style.setProperty('--secondary-foreground', textHsl);
  root.style.setProperty('--accent', accentHsl);
  root.style.setProperty('--accent-foreground', textLightHsl);
  root.style.setProperty('--background', bgHsl);
  root.style.setProperty('--foreground', textHsl);
  root.style.setProperty('--card', bgHsl);
  root.style.setProperty('--card-foreground', textHsl);
  root.style.setProperty('--border', `${accentGoldHsl} / 0.15`);
  root.style.setProperty('--ring', primaryHsl);
  root.style.setProperty('--dark-background', darkBgHsl);
  root.style.setProperty('--dark-foreground', textLightHsl);

  // --- Curated Transit Surface Layer System ---
  // Generates tonal surface layers from the tenant fundo color (like Material Design)
  const fundoRgb = hexToRgb(isDark ? cores.fundoEscuro : cores.fundo);
  const isLightTheme = !isDark;

  if (fundoRgb) {
    const { r, g, b } = fundoRgb;
    if (isLightTheme) {
      root.style.setProperty('--surface', `rgb(${r}, ${g}, ${b})`);
      root.style.setProperty('--surface-container-lowest', `rgb(255, 255, 255)`);
      root.style.setProperty('--surface-container-low', `rgb(${Math.max(r - 10, 0)}, ${Math.max(g - 10, 0)}, ${Math.max(b - 10, 0)})`);
      root.style.setProperty('--surface-container', `rgb(${Math.max(r - 17, 0)}, ${Math.max(g - 17, 0)}, ${Math.max(b - 17, 0)})`);
      root.style.setProperty('--surface-container-high', `rgb(${Math.max(r - 24, 0)}, ${Math.max(g - 24, 0)}, ${Math.max(b - 24, 0)})`);
      root.style.setProperty('--surface-container-highest', `rgb(${Math.max(r - 31, 0)}, ${Math.max(g - 31, 0)}, ${Math.max(b - 31, 0)})`);
    } else {
      root.style.setProperty('--surface', `rgb(${r}, ${g}, ${b})`);
      root.style.setProperty('--surface-container-lowest', `rgb(${Math.max(r - 5, 0)}, ${Math.max(g - 5, 0)}, ${Math.max(b - 5, 0)})`);
      root.style.setProperty('--surface-container-low', `rgb(${Math.min(r + 8, 255)}, ${Math.min(g + 8, 255)}, ${Math.min(b + 8, 255)})`);
      root.style.setProperty('--surface-container', `rgb(${Math.min(r + 15, 255)}, ${Math.min(g + 15, 255)}, ${Math.min(b + 15, 255)})`);
      root.style.setProperty('--surface-container-high', `rgb(${Math.min(r + 22, 255)}, ${Math.min(g + 22, 255)}, ${Math.min(b + 22, 255)})`);
      root.style.setProperty('--surface-container-highest', `rgb(${Math.min(r + 30, 255)}, ${Math.min(g + 30, 255)}, ${Math.min(b + 30, 255)})`);
    }
  }

  // Sidebar surface (always uses fundoEscuro — the tenant's dark color)
  const darkRgb = hexToRgb(cores.fundoEscuro);
  if (darkRgb) {
    const { r, g, b } = darkRgb;
    root.style.setProperty('--sidebar-bg', `rgb(${r}, ${g}, ${b})`);
    root.style.setProperty('--sidebar-bg-elevated', `rgb(${Math.min(r + 12, 255)}, ${Math.min(g + 12, 255)}, ${Math.min(b + 12, 255)})`);
    root.style.setProperty('--sidebar-border', hexWithOpacity(cores.acento, 0.10));
    root.style.setProperty('--sidebar-text', cores.textoClaro);
    root.style.setProperty('--sidebar-text-muted', hexWithOpacity(cores.textoClaro, 0.50));
    root.style.setProperty('--sidebar-accent', cores.acento);
    root.style.setProperty('--sidebar-accent-bg', hexWithOpacity(cores.acento, 0.10));
    root.style.setProperty('--sidebar-accent-text', cores.acento);
  }

  // Theme class for CSS selectors
  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
}
