import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { TenantBrand, TenantBrandCores, TenantBrandFontes } from '@mudancas/shared';
import {
  DEFAULT_TENANT_BRAND, DEFAULT_CORES, DEFAULT_FONTES,
  injectBrandCSS, detectSubdomain,
  getThemePreference, resolveTheme, type ThemePreference,
} from '@mudancas/shared';
import { publicApi } from '../lib/api';

interface TenantThemeContextType {
  brand: TenantBrand;
  cores: TenantBrandCores;
  fontes: TenantBrandFontes;
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  tenantId: string | null;
}

const TenantThemeContext = createContext<TenantThemeContextType>({
  brand: DEFAULT_TENANT_BRAND,
  cores: DEFAULT_CORES,
  fontes: DEFAULT_FONTES,
  isLoading: true,
  error: null,
  theme: 'light',
  tenantId: null,
});

export function useTenantTheme() {
  return useContext(TenantThemeContext);
}

interface TenantProviderProps {
  children: ReactNode;
  brand?: TenantBrand | null;
}

export function TenantProvider({ children, brand: providedBrand }: TenantProviderProps) {
  const [brand, setBrand] = useState<TenantBrand | null>(providedBrand || null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!providedBrand);
  const [error, setError] = useState<string | null>(null);
  const [theme, setThemeState] = useState<'light' | 'dark'>(resolveTheme(getThemePreference()));

  useEffect(() => {
    if (providedBrand) {
      setBrand(providedBrand);
      setIsLoading(false);
      return;
    }

    const subdomain = detectSubdomain() || (import.meta.env.DEV ? 'demo' : null);
    if (!subdomain) {
      setIsLoading(false);
      return;
    }

    setError(null);
    publicApi
      .getTenantBrand(subdomain)
      .then((response) => {
        const brandData = response.data?.brand;
        const tenantIdFromResponse = response.data?.tenantId;
        if (brandData) {
          setBrand(brandData as TenantBrand);
        }
        if (tenantIdFromResponse) {
          setTenantId(tenantIdFromResponse);
        }
      })
      .catch((err) => {
        const msg = err?.response?.status === 404
          ? 'Empresa nao encontrada. Verifique o endereco de acesso.'
          : 'Nao foi possivel carregar os dados da empresa. Usando configuracao padrao.';
        console.error('[TenantProvider] Falha ao buscar brand:', err);
        setError(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [providedBrand]);

  const mergedBrand: TenantBrand = {
    ...DEFAULT_TENANT_BRAND,
    ...brand,
    cores: { ...DEFAULT_CORES, ...brand?.cores },
    fontes: { ...DEFAULT_FONTES, ...brand?.fontes },
  };

  useEffect(() => {
    injectBrandCSS(mergedBrand.cores, mergedBrand.fontes, theme);

    if (mergedBrand.nome) {
      document.title = mergedBrand.nome;
    }

    if (mergedBrand.faviconUrl) {
      const existing = document.querySelector("link[rel*='icon']");
      if (existing) {
        existing.setAttribute('href', mergedBrand.faviconUrl);
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = mergedBrand.faviconUrl;
        document.head.appendChild(link);
      }
    }
  }, [mergedBrand, theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (getThemePreference() === 'system') {
        setThemeState(resolveTheme('system'));
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <TenantThemeContext.Provider
      value={{
        brand: mergedBrand,
        cores: mergedBrand.cores,
        fontes: mergedBrand.fontes,
        isLoading,
        error,
        theme,
        tenantId,
      }}
    >
      {children}
    </TenantThemeContext.Provider>
  );
}
