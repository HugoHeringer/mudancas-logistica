'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'O trial é mesmo gratuito?',
    a: 'Sim, 30 dias completos sem cartão de crédito. Tem acesso a todas as funcionalidades do plano Pro durante o trial. No final, escolhe o plano que mais se adapta ou cancela — sem qualquer custo.',
  },
  {
    q: 'Preciso de saber programar para configurar o meu site?',
    a: 'Não. O seu site é gerado automaticamente com as cores, logótipo e informações que definir no painel admin. Em menos de 15 minutos tem o site online e a receber pedidos.',
  },
  {
    q: 'Os motoristas precisam de instalar uma app?',
    a: 'Não instalam nada da App Store nem do Google Play. A PWA é acedida pelo browser do telemóvel (Chrome ou Safari) e pode ser adicionada ao ecrã inicial como qualquer app. Funciona offline para ver ordens de serviço.',
  },
  {
    q: 'Os dados dos meus clientes estão seguros?',
    a: 'Sim. Cada empresa tem a sua base de dados completamente isolada. Cumprimos o RGPD, os dados ficam em servidores na União Europeia e nunca partilhamos informação com terceiros.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim, sem penalizações nem burocracia. Pode cancelar directamente no painel. Os seus dados ficam disponíveis para exportação (Excel e CSV) durante 30 dias após o cancelamento.',
  },
  {
    q: 'Existe suporte em português?',
    a: 'Sim, todo o suporte é em português de Portugal. Email sempre. O plano Pro inclui resposta em menos de 4 horas úteis. O Enterprise tem suporte dedicado com linha directa.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
};

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-padding" style={{ background: 'var(--color-card)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container-md">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="section-tag mb-3">FAQ</p>
          <h2 className="display-md mb-4" style={{ color: 'var(--color-primary)' }}>
            Perguntas{' '}
            <span className="gradient-text">frequentes</span>
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
            Tudo o que precisa de saber antes de começar.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border overflow-hidden transition-all duration-200"
              style={{
                borderColor: open === i ? 'var(--color-accent)' : 'var(--color-border)',
                background: 'var(--color-bg)',
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                aria-expanded={open === i}
                id={`faq-item-${i}-btn`}
              >
                <span
                  className="font-semibold text-base pr-4"
                  style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-inter)' }}
                >
                  {faq.q}
                </span>
                <ChevronDown
                  className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
                  style={{
                    color: open === i ? 'var(--color-accent)' : 'var(--color-muted)',
                    transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: open === i ? '200px' : '0px' }}
              >
                <p
                  className="px-6 pb-5 text-sm leading-relaxed"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div
          className="mt-12 text-center p-8 rounded-2xl"
          style={{ background: 'var(--color-bg)' }}
        >
          <p className="font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
            Ainda tem dúvidas?
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
            A nossa equipa responde em menos de 24 horas.
          </p>
          <a
            href="mailto:hello@movefy.pt"
            className="btn-primary inline-flex"
            id="faq-contact-btn"
          >
            Enviar uma mensagem
          </a>
        </div>
      </div>
    </section>
  );
}
