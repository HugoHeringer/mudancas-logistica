import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { TenantBrand, TenantBrandCores, TenantBrandFontes } from '@mudancas/shared';
import {
  DEFAULT_TENANT_BRAND, DEFAULT_CORES, DEFAULT_FONTES,
  injectBrandCSS, detectSubdomain,
  getThemePreference, setThemePreference, resolveTheme,
  type ThemePreference,
} from '@mudancas/shared';
import { publicApi } from '../lib/api';

interface TenantThemeContextType {
  brand: TenantBrand;
  cores: TenantBrandCores;
  fontes: TenantBrandFontes;
  isLoading: boolean;
  theme: 'light' | 'dark';
  themePreference: ThemePreference;
  setTheme: (pref: ThemePreference) => void;
}

const TenantThemeContext = createContext<TenantThemeContextType>({
  brand: DEFAULT_TENANT_BRAND,
  cores: DEFAULT_CORES,
  fontes: DEFAULT_FONTES,
  isLoading: true,
  theme: 'light',
  themePreference: 'system',
  setTheme: () => {},
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
  const [isLoading, setIsLoading] = useState(!providedBrand);
  const [themePref, setThemePref] = useState<ThemePreference>(getThemePreference());
  const [theme, setThemeState] = useState<'light' | 'dark'>(resolveTheme(getThemePreference()));

  useEffect(() => {
    if (providedBrand) {
      setBrand(providedBrand);
      setIsLoading(false);
      return;
    }

    const subdomain = detectSubdomain();
    if (!subdomain) {
      setIsLoading(false);
      return;
    }

    publicApi
      .getTenantBrand(subdomain)
      .then((response) => {
        const brandData = response.data?.brand;
        if (brandData) {
          setBrand(brandData as TenantBrand);
        }
      })
      .catch(() => {})
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

    // Cache theme in localStorage for Service Worker offline access
    localStorage.setItem('cached-brand', JSON.stringify(mergedBrand));
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

  const setTheme = useCallback((pref: ThemePreference) => {
    setThemePreference(pref);
    setThemePref(pref);
    setThemeState(resolveTheme(pref));
  }, []);

  return (
    <TenantThemeContext.Provider
      value={{
        brand: mergedBrand,
        cores: mergedBrand.cores,
        fontes: mergedBrand.fontes,
        isLoading,
        theme,
        themePreference: themePref,
        setTheme,
      }}
    >
      {children}
    </TenantThemeContext.Provider>
  );
}
