import { Truck, Globe, Warehouse, Package } from 'lucide-react';
import { GlassCard } from '../luxury/GlassCard';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { SectionDivider } from '../luxury/SectionDivider';
import { useTenantTheme } from '../../theme/TenantProvider';

const services = [
  {
    icon: Truck,
    title: 'Mudanças Locais',
    description: 'Mudanças dentro da mesma cidade com eficiência e cuidado. Equipa profissional e veículos adequados.',
  },
  {
    icon: Globe,
    title: 'Mudanças Nacionais',
    description: 'Cobertura em todo o território nacional. Logística planeada para garantir a segurança dos seus bens.',
  },
  {
    icon: Package,
    title: 'Mudanças Internacionais',
    description: 'Transporte internacional com todo o suporte aduaneiro e documental necessário.',
  },
  {
    icon: Warehouse,
    title: 'Armazenagem',
    description: 'Espaços de armazenamento seguros e climatizados para guardar os seus bens pelo tempo que precisar.',
  },
];

export function ServicesSection() {
  const { brand } = useTenantTheme();

  return (
    <section
      id="servicos"
      className="py-24"
      style={{ backgroundColor: 'var(--brand-surface)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="section-label">Os nossos serviços</span>
            <h2
              className="section-title"
              style={{ color: 'var(--brand-on-surface)' }}
            >
              Soluções completas para a sua mudança
            </h2>
          </div>
        </AnimatedSection>

        <SectionDivider className="mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <AnimatedSection key={service.title} delay={i * 120}>
              <GlassCard hover className="p-8 h-full" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)' }}>
                <service.icon
                  className="w-10 h-10 mb-6"
                  strokeWidth={1.5}
                  style={{ color: 'var(--brand-secondary)' }}
                />
                <h3
                  className="text-xl font-light mb-3"
                  style={{
                    color: 'var(--brand-on-surface)',
                    fontFamily: 'var(--tenant-font-display)',
                  }}
                >
                  {service.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'color-mix(in srgb, var(--brand-on-surface) 60%, transparent)' }}
                >
                  {service.description}
                </p>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
