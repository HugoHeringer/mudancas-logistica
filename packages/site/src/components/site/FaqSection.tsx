import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { SectionDivider } from '../luxury/SectionDivider';
import { useTenantTheme } from '../../theme/TenantProvider';
import { cn } from '../../lib/utils';

const defaultFaqs = [
  {
    pergunta: 'Quanto tempo antes devo agendar a minha mudança?',
    resposta: 'Recomendamos agendar com pelo menos 2 semanas de antecedência, especialmente nos meses de verão que são mais procurados. No entanto, também oferecemos serviço urgente para mudanças de última hora.',
  },
  {
    pergunta: 'O que está incluído no serviço de mudança?',
    resposta: 'O serviço inclui embalagem, transporte, desmontagem e montagem de mobiliário, e proteção de todos os bens. Material de embalagem (caixas, fita, proteção) está disponível com custo adicional.',
  },
  {
    pergunta: 'Como é calculado o preço da mudança?',
    resposta: 'O preço é calculado com base no número de horas, ajudantes necessários e veículo utilizado. Oferecemos orçamento gratuito e sem compromisso antes de confirmar o serviço.',
  },
  {
    pergunta: 'Façam mudanças internacionais?',
    resposta: 'Sim! Cobrimos mudanças internacionais com todo o suporte aduaneiro e documental. Solicite um orçamento específico para o seu destino.',
  },
  {
    pergunta: 'Os meus bens estão segurados durante o transporte?',
    resposta: 'Sim, todos os nossos transportes incluem seguro básico. Também oferecemos opções de seguro ampliado para bens de maior valor.',
  },
  {
    pergunta: 'E se precisar de armazenamento temporário?',
    resposta: 'Disponibilizamos espaços de armazenamento seguros e climatizados por períodos flexíveis. Ideal entre a saída de uma casa e a entrada na outra.',
  },
];

export function FaqSection() {
  const { brand } = useTenantTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = brand.avaliacoes?.depoimentos?.length
    ? defaultFaqs // TODO: allow tenant to customize FAQs
    : defaultFaqs;

  return (
    <section
      id="faq"
      className="py-24"
      style={{ backgroundColor: 'var(--brand-surface)' }}
    >
      <div className="max-w-3xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="section-label">Perguntas Frequentes</span>
            <h2
              className="section-title"
              style={{ color: 'var(--brand-on-surface)' }}
            >
              Temos as respostas
            </h2>
          </div>
        </AnimatedSection>

        <SectionDivider className="mb-16" />

        <div className="space-y-0">
          {faqs.map((faq, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <div className="faq-item">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span
                    className="text-base font-medium pr-4"
                    style={{
                      color: 'var(--brand-on-surface)',
                      fontFamily: 'var(--tenant-font-display)',
                    }}
                  >
                    {faq.pergunta}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 flex-shrink-0 transition-transform duration-300',
                      openIndex === i && 'rotate-180'
                    )}
                    style={{ color: 'var(--brand-secondary)' }}
                  />
                </button>
                <div
                  className={cn(
                    'faq-answer',
                    openIndex === i && 'open'
                  )}
                  style={{
                    padding: openIndex === i ? '0 0 20px 0' : '0',
                  }}
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'color-mix(in srgb, var(--brand-on-surface) 60%, transparent)' }}
                  >
                    {faq.resposta}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
