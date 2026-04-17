import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useTenantTheme } from '../../theme/TenantProvider';
import { GlassCard } from '../luxury/GlassCard';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { SectionDivider } from '../luxury/SectionDivider';
import { cn } from '../../lib/utils';

const defaultTestimonials = [
  {
    nome: 'Ana Silva',
    texto: 'Excelente servico! A equipa foi pontual, cuidou de tudo com muito profissionalismo. Recomendo vivamente.',
    estrelas: 5,
  },
  {
    nome: 'Pedro Santos',
    texto: 'Mudanca internacional sem stress. Tudo foi tratado com eficiencia e os bens chegaram em perfeitas condicoes.',
    estrelas: 5,
  },
  {
    nome: 'Maria Costa',
    texto: 'Servico de armazenamento impecavel. Espaco limpo e seguro, com acesso facil quando precisei.',
    estrelas: 4,
  },
  {
    nome: 'Joao Ferreira',
    texto: 'Ja usei 3 vezes e sempre a mesma qualidade. Profissionais de confianca que tratam dos nossos bens como se fossem deles.',
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
          <GlassCard variant="dark" className="p-10 md:p-14 text-center">
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-5 h-5',
                    i < (current.estrelas ?? 5)
                      ? 'text-gold fill-gold'
                      : 'text-cream-muted/30'
                  )}
                />
              ))}
            </div>

            {/* Quote */}
            <p className="text-lg md:text-xl text-cream/80 leading-relaxed mb-8 font-display font-light italic">
              &ldquo;{current.texto}&rdquo;
            </p>

            {/* Name */}
            <p className="text-gold font-medium tracking-wide text-sm uppercase">
              {current.nome}
            </p>

            {/* Navigation */}
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={prev}
                  className="p-2 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all duration-300',
                        i === active ? 'bg-gold w-6' : 'bg-cream-muted/30'
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="p-2 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
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
