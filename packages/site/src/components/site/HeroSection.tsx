import { Link } from 'react-router-dom';
import { useTenantTheme } from '../../theme/TenantProvider';
import { GradientButton } from '../luxury/GradientButton';
import { AnimatedSection } from '../luxury/AnimatedSection';

export function HeroSection() {
  const { brand } = useTenantTheme();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with parallax */}
      <div
        className="absolute inset-0 parallax-bg"
        style={{
          backgroundImage: brand.heroImageUrl
            ? `url(${brand.heroImageUrl})`
            : `url('https://images.unsplash.com/photo-1600518464441-9154a4dea847?w=1920&q=80')`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-night/60" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <AnimatedSection>
          <span className="section-label" style={{ color: 'var(--gold)' }}>
            {brand.slogan || 'A sua mudanca, sem stress'}
          </span>
        </AnimatedSection>

        <AnimatedSection delay={150}>
          <h1
            className="font-display text-5xl md:text-7xl font-light text-cream mb-6"
            style={{ lineHeight: 1.1 }}
          >
            {brand.nome}
          </h1>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <p className="text-lg md:text-xl text-cream-muted max-w-2xl mx-auto mb-10">
            Profissionais dedicados a tornar a sua mudanca uma experiencia simples e sem preocupacoes.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={450}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/agendar">
              <GradientButton variant="gold" size="lg">
                Agendar Mudanca
              </GradientButton>
            </Link>
            <Link to="/agendar?urgente=true">
              <GradientButton variant="glass" size="lg">
                Mudanca Urgente
              </GradientButton>
            </Link>
          </div>
        </AnimatedSection>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs tracking-widest uppercase text-cream-muted">Scroll</span>
        <div className="w-px h-8 bg-cream-muted/30 relative overflow-hidden">
          <div className="absolute inset-x-0 h-2 bg-gold animate-scroll-pulse" />
        </div>
      </div>
    </section>
  );
}
