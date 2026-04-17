import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { TenantBrand, TenantBrandCores, TenantBrandFontes } from '@mudancas/shared';
import {
  DEFAULT_TENANT_BRAND, DEFAULT_CORES, DEFAULT_FONTES,
  injectBrandCSS, detectSubdomain,
  getThemePreference, setThemePreference, resolveTheme,
  type ThemePreference,
} from '@mudancas/shared';
import { publicApi, tenantsApi } from '../lib/api';

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

  // Fetch brand from API if not provided
  useEffect(() => {
    if (providedBrand) {
      setBrand(providedBrand);
      setIsLoading(false);
      return;
    }

    // Try subdomain-based brand (for public/site/PWA)
    const subdomain = detectSubdomain();
    if (subdomain) {
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
      return;
    }

    // Try authenticated tenant brand (for admin panel)
    const token = localStorage.getItem('accessToken');
    const tenantId = localStorage.getItem('tenantId');
    if (token && tenantId) {
      tenantsApi
        .findOne(tenantId)
        .then((response) => {
          const tenant = response.data;
          const configMarca = tenant?.configMarca || {};
          const brandData: TenantBrand = {
            nome: configMarca.nome || '',
            slogan: configMarca.slogan || '',
            logoUrl: configMarca.logoUrl || '',
            faviconUrl: configMarca.faviconUrl || '',
            cores: {
              ...DEFAULT_CORES,
              ...(configMarca.cores || {}),
            },
            fontes: {
              ...DEFAULT_FONTES,
              ...(configMarca.fontes || {}),
            },
            contacto: configMarca.contacto || {},
          };
          setBrand(brandData);
        })
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    setIsLoading(false);
  }, [providedBrand]);

  const mergedBrand: TenantBrand = {
    ...DEFAULT_TENANT_BRAND,
    ...brand,
    cores: { ...DEFAULT_CORES, ...brand?.cores },
    fontes: { ...DEFAULT_FONTES, ...brand?.fontes },
  };

  // Inject CSS and handle theme
  useEffect(() => {
    injectBrandCSS(mergedBrand.cores, mergedBrand.fontes, theme);

    // Apply dark class to html element for Tailwind dark mode
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

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
