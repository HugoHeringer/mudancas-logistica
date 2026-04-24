import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTenantTheme } from '../../theme/TenantProvider';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { cn } from '../../lib/utils';

export function HeroSection() {
  const { brand } = useTenantTheme();
  const banners = brand.bannerUrls?.length ? brand.bannerUrls : [];
  const hasBanners = banners.length > 0;
  const [activeBanner, setActiveBanner] = useState(0);

  // Auto-play carousel
  const nextBanner = useCallback(() => {
    setActiveBanner((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (!hasBanners) return;
    const timer = setInterval(nextBanner, 5000);
    return () => clearInterval(timer);
  }, [hasBanners, nextBanner]);

  // Background image: banners > heroImageUrl > fallback
  const bgImage = hasBanners
    ? banners[activeBanner]
    : brand.heroImageUrl || 'https://images.unsplash.com/photo-1600518464441-9154a4dea847?w=1920&q=80';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with parallax */}
      <div
        className="absolute inset-0 parallax-bg transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />

      {/* Overlay with tenant colors */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            color-mix(in srgb, var(--brand-surface-dark) 70%, transparent),
            color-mix(in srgb, var(--brand-surface-dark) 50%, transparent),
            color-mix(in srgb, var(--brand-surface-dark) 90%, transparent)
          )`,
        }}
      />

      {/* Banner navigation dots */}
      {hasBanners && banners.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              className={cn(
                'rounded-full transition-all duration-300',
                i === activeBanner
                  ? 'w-6 h-2'
                  : 'w-2 h-2'
              )}
              style={{
                backgroundColor: i === activeBanner
                  ? 'var(--brand-accent)'
                  : 'color-mix(in srgb, var(--brand-on-surface-dark) 30%, transparent)',
              }}
            />
          ))}
        </div>
      )}

      {/* Banner arrows */}
      {hasBanners && banners.length > 1 && (
        <>
          <button
            onClick={() => setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110"
            style={{
              background: 'color-mix(in srgb, var(--brand-on-surface-dark) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--brand-accent) 30%, transparent)',
              color: 'var(--brand-on-surface-dark)',
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110"
            style={{
              background: 'color-mix(in srgb, var(--brand-on-surface-dark) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--brand-accent) 30%, transparent)',
              color: 'var(--brand-on-surface-dark)',
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <AnimatedSection>
          {/* Logo */}
          {brand.logoUrl && (
            <div className="flex justify-center mb-6">
              <img
                src={brand.logoUrl}
                alt={brand.nome}
                className="h-16 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
          )}

          <span
            className="section-label"
            style={{ color: 'var(--brand-accent)' }}
          >
            {brand.slogan || 'Sua mudança, sem stress'}
          </span>
        </AnimatedSection>

        <AnimatedSection delay={150}>
          <h1
            className="font-display text-5xl md:text-7xl font-light mb-6"
            style={{
              lineHeight: 1.1,
              color: 'var(--brand-on-surface-dark)',
              fontFamily: 'var(--tenant-font-display)',
            }}
          >
            {brand.nome}
          </h1>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10"
            style={{
              color: 'color-mix(in srgb, var(--brand-on-surface-dark) 70%, transparent)',
            }}
          >
            Profissionais dedicados a tornar a sua mudança uma experiência simples e sem preocupações.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={450}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/agendar">
              <button className="btn-brand-accent px-8 py-4 text-base font-medium tracking-widest uppercase rounded-sm">
                Agendar Mudança
              </button>
            </Link>
            <Link to="/agendar?urgente=true">
              <button className="btn-brand-glass px-8 py-4 text-base font-medium tracking-widest uppercase rounded-sm">
                Mudança Urgente
              </button>
            </Link>
          </div>
        </AnimatedSection>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 50%, transparent)' }}
        >
          Scroll
        </span>
        <div
          className="w-px h-8 relative overflow-hidden"
          style={{ backgroundColor: 'color-mix(in srgb, var(--brand-on-surface-dark) 15%, transparent)' }}
        >
          <div
            className="absolute inset-x-0 h-2 animate-scroll-pulse"
            style={{ backgroundColor: 'var(--brand-accent)' }}
          />
        </div>
      </div>
    </section>
  );
}
