import { BarChart3, Globe, Smartphone, Wallet } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Gestão completa no Admin',
    description:
      'Aprovações, agenda inteligente, financeiro detalhado, clientes e equipa — tudo num painel intuitivo com dark mode nativo.',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.1)',
    items: ['Agenda com capacidade diária', 'Aprovação rápida de pedidos', 'Dashboard com KPIs em tempo real'],
  },
  {
    icon: Globe,
    title: 'Site da sua empresa, automático',
    description:
      'O seu site personalizado com cores, logo e formulário de agendamento online fica pronto em minutos. Sem programação.',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.1)',
    items: ['Formulário de agendamento', 'Calendário de disponibilidade', 'SEO local optimizado'],
  },
  {
    icon: Smartphone,
    title: 'App para motoristas e ajudantes',
    description:
      'PWA instalável directamente no telemóvel. Recebem ordens de serviço, navegam até ao cliente e confirmam conclusões.',
    color: '#F97316',
    bg: 'rgba(249,115,22,0.1)',
    items: ['Instalação sem App Store', 'Navegação integrada', 'Confirmação com assinatura digital'],
  },
  {
    icon: Wallet,
    title: 'Financeiro sem esforço',
    description:
      'Receitas, custos de equipa, combustível e margens calculados automaticamente. Relatórios mensais por motorista.',
    color: '#E8B84B',
    bg: 'rgba(232,184,75,0.1)',
    items: ['Cálculo automático de margens', 'Pagamentos à equipa por hora', 'Relatórios exportáveis'],
  },
];

export default function Features() {
  return (
    <section id="funcionalidades" className="section-padding" style={{ background: 'var(--color-card)' }}>
      <div className="container-lg">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-tag mb-3">Funcionalidades</p>
          <h2 className="display-md mb-4" style={{ color: 'var(--color-primary)' }}>
            Uma plataforma.{' '}
            <span className="gradient-text">Quatro ferramentas poderosas.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
            Cada módulo foi desenhado especificamente para o dia-a-dia de uma empresa de mudanças em Portugal.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="card p-8 group"
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: feature.bg }}
                >
                  <Icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>

                {/* Content */}
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-primary)' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-muted)' }}>
                  {feature.description}
                </p>

                {/* Feature list */}
                <ul className="space-y-2">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: feature.color }} />
                      <span style={{ color: 'var(--color-text)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
