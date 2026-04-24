import { useCounter } from '../../hooks/use-counter';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { SectionDivider } from '../luxury/SectionDivider';
import { useTenantTheme } from '../../theme/TenantProvider';

function CounterItem({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const { count, ref } = useCounter({ end, duration: 2500 });

  return (
    <div ref={ref} className="text-center">
      <div
        className="font-display text-5xl md:text-6xl font-light mb-2"
        style={{
          color: 'var(--brand-accent)',
          fontFamily: 'var(--tenant-font-display)',
        }}
      >
        {count}{suffix}
      </div>
      <div
        className="text-sm tracking-wide uppercase"
        style={{
          color: 'color-mix(in srgb, var(--brand-on-surface-dark) 60%, transparent)',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function TrustSection() {
  const { brand } = useTenantTheme();

  return (
    <section id="sobre" className="night-section py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="section-label">Confiança</span>
            <h2 className="section-title">Números que falam por nós</h2>
          </div>
        </AnimatedSection>

        <SectionDivider className="mb-16" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <AnimatedSection delay={0}>
            <CounterItem
              end={brand.avaliacoes?.googleReviews || 500}
              suffix="+"
              label="Mudanças Realizadas"
            />
          </AnimatedSection>
          <AnimatedSection delay={150}>
            <CounterItem end={10} suffix="+" label="Anos de Experiência" />
          </AnimatedSection>
          <AnimatedSection delay={300}>
            <CounterItem end={50} suffix="+" label="Cidades Cobertas" />
          </AnimatedSection>
          <AnimatedSection delay={450}>
            <CounterItem
              end={brand.avaliacoes?.googleRating ? Math.round(brand.avaliacoes.googleRating * 10) / 10 : 4.9}
              suffix=""
              label="Classificação Google"
            />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
