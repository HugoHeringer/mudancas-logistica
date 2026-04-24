import type { ReactNode } from 'react';
import { useTenantTheme } from '../theme/TenantProvider';
import { NoiseOverlay } from '../components/luxury/NoiseOverlay';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Auth layout com estética Sirocco-inspired
 * Split-screen: lado esquerdo hero com gradiente, lado direito formulário
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  const { brand } = useTenantTheme();

  return (
    <div className="min-h-screen flex relative">
      <NoiseOverlay />

      {/* Left side - Hero with gradient overlay */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-night">
        {/* Background image or gradient */}
        {brand.heroImageUrl ? (
          <img
            src={brand.heroImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover saturate-[0.85] contrast-[1.05]"
          />
        ) : null}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-night/60 via-night/40 to-night/90" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Brand logo/name */}
          <div>
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.nome}
                className="h-12 object-contain"
              />
            ) : (
              <h1
                className="text-2xl tracking-[0.15em] text-cream font-light"
                style={{ fontFamily: 'var(--tenant-font-display)' }}
              >
                {brand.nome?.toUpperCase() || 'MOVEFY'}
              </h1>
            )}
          </div>

          {/* Center text */}
          <div className="max-w-md">
            <div className="w-16 h-px mb-8" style={{ background: 'var(--brand-accent)' }} />
            <h2
              className="text-4xl lg:text-5xl font-light text-cream leading-tight mb-6"
              style={{ fontFamily: 'var(--tenant-font-display)' }}
            >
              {brand.slogan || 'A sua mudança, sem stress'}
            </h2>
            <p className="text-cream-muted text-base leading-relaxed">
              Sistema completo para gestão de mudanças e logística.
              Controle total sobre aprovações, agenda, motoristas e financeiro.
            </p>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-6 text-cream-muted text-sm">
            {brand.contacto?.telefone && (
              <span>{brand.contacto.telefone}</span>
            )}
            {brand.contacto?.email && (
              <span>{brand.contacto.email}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.nome}
                className="h-10 object-contain mx-auto mb-2"
              />
            ) : (
              <h1
                className="text-xl tracking-[0.15em] text-foreground font-light"
                style={{ fontFamily: 'var(--tenant-font-display)' }}
              >
                {brand.nome?.toUpperCase() || 'MOVEFY'}
              </h1>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
