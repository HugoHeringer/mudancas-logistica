import { PhoneCall, CalendarCheck, Truck, PartyPopper } from 'lucide-react';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { SectionDivider } from '../luxury/SectionDivider';
import { useTenantTheme } from '../../theme/TenantProvider';

const steps = [
  {
    icon: PhoneCall,
    title: 'Contacte-nos',
    description: 'Peça um orçamento gratuito pelo site, telefone ou WhatsApp. Respondemos em minutos.',
  },
  {
    icon: CalendarCheck,
    title: 'Agende',
    description: 'Escolha a data e hora que lhe convém. Confirmamos a disponibilidade de imediato.',
  },
  {
    icon: Truck,
    title: 'Mudança',
    description: 'A nossa equipa profissional cuida de tudo: embalagem, transporte e montagem.',
  },
  {
    icon: PartyPopper,
    title: 'Feito!',
    description: 'Desfrute da sua nova casa sem stress. Tudo entregue em perfeitas condições.',
  },
];

export function ComoFuncionaSection() {
  const { brand } = useTenantTheme();

  return (
    <section id="como-funciona" className="night-section py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="section-label">Como funciona</span>
            <h2 className="section-title">Simples, rápido e sem stress</h2>
          </div>
        </AnimatedSection>

        <SectionDivider className="mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative">
          {steps.map((step, i) => (
            <AnimatedSection key={step.title} delay={i * 150}>
              <div className="text-center relative">
                {/* Step number */}
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-xl font-light"
                  style={{
                    background: `linear-gradient(135deg, var(--brand-accent), var(--brand-secondary))`,
                    color: 'var(--brand-on-surface-dark)',
                    fontFamily: 'var(--tenant-font-display)',
                  }}
                >
                  {i + 1}
                </div>

                {/* Icon */}
                <step.icon
                  className="w-8 h-8 mx-auto mb-4"
                  style={{ color: 'var(--brand-accent)' }}
                  strokeWidth={1.5}
                />

                {/* Title */}
                <h3
                  className="text-lg font-light mb-2"
                  style={{
                    color: 'var(--brand-on-surface-dark)',
                    fontFamily: 'var(--tenant-font-display)',
                  }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: 'color-mix(in srgb, var(--brand-on-surface-dark) 60%, transparent)',
                  }}
                >
                  {step.description}
                </p>

                {/* Connector line (hidden on mobile, between items) */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px"
                    style={{
                      background: 'linear-gradient(to right, var(--brand-accent), color-mix(in srgb, var(--brand-accent) 20%, transparent))',
                    }}
                  />
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
