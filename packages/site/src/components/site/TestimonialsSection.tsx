import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useTenantTheme } from '../../theme/TenantProvider';
import { GlassCard } from '../luxury/GlassCard';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { SectionDivider } from '../luxury/SectionDivider';
import { cn } from '../../lib/utils';

const defaultTestimonials = [
  {
    nome: 'Ana Silva',
    texto: 'Excelente serviço! A equipa foi pontual, cuidou de tudo com muito profissionalismo. Recomendo vivamente.',
    estrelas: 5,
  },
  {
    nome: 'Pedro Santos',
    texto: 'Mudança internacional sem stress. Tudo foi tratado com eficiência e os bens chegaram em perfeitas condições.',
    estrelas: 5,
  },
  {
    nome: 'Maria Costa',
    texto: 'Serviço de armazenamento impecável. Espaço limpo e seguro, com acesso fácil quando precisei.',
    estrelas: 4,
  },
  {
    nome: 'João Ferreira',
    texto: 'Já usei 3 vezes e sempre a mesma qualidade. Profissionais de confiança que tratam dos nossos bens como se fossem deles.',
    estrelas: 5,
  },
];

export function TestimonialsSection() {
  const { brand } = useTenantTheme();
  const testimonials: any[] = brand.avaliacoes?.depoimentos?.length
    ? brand.avaliacoes.depoimentos
    : defaultTestimonials;
  const [active, setActive] = useState(0);

  const next = () => setActive((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const current = testimonials[active];

  return (
    <section id="testemunhos" className="night-section py-24 relative">
      <div className="max-w-4xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="section-label">Testemunhos</span>
            <h2 className="section-title">O que dizem os nossos clientes</h2>
          </div>
        </AnimatedSection>

        <SectionDivider className="mb-16" />

        <AnimatedSection>
          <GlassCard
            variant="dark"
            className="p-10 md:p-14 text-center"
            style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)' }}
          >
            {/* Quote icon */}
            <Quote
              className="w-10 h-10 mx-auto mb-6"
              style={{ color: 'var(--brand-accent)', opacity: 0.4 }}
            />

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn('w-5 h-5')}
                  style={{
                    color: i < (current.estrelas ?? 5) ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-on-surface-dark) 30%, transparent)',
                    fill: i < (current.estrelas ?? 5) ? 'var(--brand-accent)' : 'transparent',
                  }}
                />
              ))}
            </div>

            {/* Quote */}
            <p
              className="text-lg md:text-xl leading-relaxed mb-8 font-display font-light italic"
              style={{
                color: 'color-mix(in srgb, var(--brand-on-surface-dark) 80%, transparent)',
                fontFamily: 'var(--tenant-font-display)',
              }}
            >
              &ldquo;{current.texto}&rdquo;
            </p>

            {/* Name */}
            <p
              className="font-medium tracking-wide text-sm uppercase"
              style={{ color: 'var(--brand-accent)' }}
            >
              {current.nome}
            </p>

            {/* Navigation */}
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={prev}
                  className="p-2 rounded-full transition-colors"
                  style={{
                    border: `1px solid color-mix(in srgb, var(--brand-accent) 30%, transparent)`,
                    color: 'var(--brand-accent)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'color-mix(in srgb, var(--brand-accent) 10%, transparent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={cn('w-2 h-2 rounded-full transition-all duration-300', i === active && 'w-6')}
                      style={{
                        backgroundColor: i === active
                          ? 'var(--brand-accent)'
                          : 'color-mix(in srgb, var(--brand-on-surface-dark) 30%, transparent)',
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="p-2 rounded-full transition-colors"
                  style={{
                    border: `1px solid color-mix(in srgb, var(--brand-accent) 30%, transparent)`,
                    color: 'var(--brand-accent)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'color-mix(in srgb, var(--brand-accent) 10%, transparent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </GlassCard>
        </AnimatedSection>
      </div>
    </section>
  );
}
