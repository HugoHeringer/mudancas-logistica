'use client';

import { useState } from 'react';
import { Check, Star, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 29,
    priceAnnual: 23,
    description: 'Ideal para empresas a começar ou com volume reduzido.',
    features: [
      'Até 50 mudanças/mês',
      '1 utilizador admin',
      'Site público incluído',
      'PWA para motoristas',
      'Agenda com capacidade diária',
      'Suporte por email',
    ],
    cta: 'Começar grátis',
    featured: false,
    color: '#6B7280',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 59,
    priceAnnual: 47,
    description: 'Para empresas em crescimento que precisam de mais potência.',
    features: [
      'Mudanças ilimitadas',
      'Até 5 utilizadores',
      'Gestão financeira avançada',
      'Notificações por email automáticas',
      'Relatórios mensais de equipa',
      'Suporte prioritário (< 4h)',
      'Exportação de dados',
    ],
    cta: 'Começar grátis',
    featured: true,
    color: '#E8B84B',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: null,
    priceAnnual: null,
    description: 'Para grandes empresas com requisitos específicos.',
    features: [
      'Multi-tenant próprio',
      'White-label completo',
      'Utilizadores ilimitados',
      'SLA com uptime garantido',
      'Onboarding dedicado',
      'Integrações custom (API)',
      'Suporte 24/7',
    ],
    cta: 'Falar connosco',
    featured: false,
    color: '#6B7280',
  },
];

export default function Precos() {
  const [annual, setAnnual] = useState(false);

  const scrollToTrial = () => {
    document.querySelector('#trial')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="precos" className="section-padding" style={{ background: 'var(--color-card)' }}>
      <div className="container-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="section-tag mb-3">Preços</p>
          <h2 className="display-md mb-4" style={{ color: 'var(--color-primary)' }}>
            Preço simples e{' '}
            <span className="gradient-text">transparente</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--color-muted)' }}>
            Sem taxas escondidas. Cancele a qualquer momento.
          </p>

          {/* Toggle mensal/anual */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl" style={{ background: 'var(--color-bg)' }}>
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                !annual ? 'bg-white shadow-sm text-primary' : 'text-muted'
              }`}
              id="precos-mensal-btn"
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                annual ? 'bg-white shadow-sm text-primary' : 'text-muted'
              }`}
              id="precos-anual-btn"
            >
              Anual
              <span className="badge-green text-xs">2 meses grátis</span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={plan.featured ? 'card-featured p-8 relative' : 'card p-8'}
            >
              {plan.featured && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 badge-accent font-bold"
                >
                  <Star className="w-3 h-3" />
                  Mais popular
                </div>
              )}

              <div className="mb-6">
                <h3
                  className="text-2xl font-bold mb-1"
                  style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-primary)' }}
                >
                  {plan.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.priceMonthly !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-4xl font-bold"
                      style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-primary)' }}
                    >
                      €{annual ? plan.priceAnnual : plan.priceMonthly}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--color-muted)' }}>/mês</span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-primary)' }}>
                    Contacto
                  </div>
                )}
                {plan.priceMonthly && annual && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                    Facturado €{(plan.priceAnnual! * 12).toFixed(0)}/ano (poupança de €{((plan.priceMonthly - plan.priceAnnual!) * 12).toFixed(0)})
                  </p>
                )}
                {plan.priceMonthly && !annual && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                    30 dias grátis incluídos
                  </p>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={plan.id === 'enterprise'
                  ? () => { window.location.href = 'mailto:hello@movefy.pt?subject=Enterprise'; }
                  : scrollToTrial
                }
                className={`w-full mb-6 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  plan.featured
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
                id={`precos-${plan.id}-cta-btn`}
              >
                {plan.cta}
                {plan.id !== 'enterprise' && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.featured ? 'var(--color-accent)' : '#34D399' }} />
                    <span style={{ color: 'var(--color-text)' }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal note */}
        <p className="text-center text-xs mt-8" style={{ color: 'var(--color-muted)' }}>
          Preços em EUR, IVA não incluído. Cancele a qualquer momento sem penalizações.
          Os dados ficam disponíveis para exportação durante 30 dias após cancelamento.
        </p>
      </div>
    </section>
  );
}
