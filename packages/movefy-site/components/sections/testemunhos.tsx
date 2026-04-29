import { Star } from 'lucide-react';

const testimonials = [
  {
    initials: 'CF',
    name: 'Carlos Ferreira',
    company: 'Ferreira Mudanças, Lisboa',
    text: 'Desde que adoptámos o Movefy, deixámos de perder pedidos por esquecimento. O site automático foi um game-changer — os clientes chegam ao formulário sem nós termos feito nada.',
    rating: 5,
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.15)',
  },
  {
    initials: 'AR',
    name: 'Ana Rodrigues',
    company: 'MudaFácil, Porto',
    text: 'A app para os motoristas mudou tudo. Já não preciso de ligar a cada um para saber o estado da mudança. Eles actualizam tudo no telemóvel e eu vejo no painel em tempo real.',
    rating: 5,
    color: '#E8B84B',
    bg: 'rgba(232,184,75,0.15)',
  },
  {
    initials: 'JS',
    name: 'João Silva',
    company: 'Silva Transportes, Braga',
    text: 'O financeiro integrado poupou-me horas de Excel todos os meses. Agora sei exactamente a margem de cada mudança e quanto paguei a cada motorista. Recomendo vivamente.',
    rating: 5,
    color: '#34D399',
    bg: 'rgba(52,211,153,0.15)',
  },
];

export default function Testemunhos() {
  return (
    <section id="testemunhos" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="container-lg">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-tag mb-3">Testemunhos</p>
          <h2 className="display-md mb-4" style={{ color: 'var(--color-primary)' }}>
            O que dizem as empresas que{' '}
            <span className="gradient-text">usam Movefy</span>
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
            Resultados reais de empresas de mudanças em Portugal.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-7 flex flex-col">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-current"
                    style={{ color: '#E8B84B' }}
                  />
                ))}
              </div>

              {/* Quote */}
              <p
                className="text-sm leading-relaxed flex-1 mb-6 italic"
                style={{ color: 'var(--color-text)' }}
              >
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: t.bg, color: t.color, fontFamily: 'var(--font-outfit)' }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {t.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 rounded-2xl p-8"
          style={{ background: 'var(--color-primary)' }}
        >
          {[
            { value: '+50', label: 'Empresas activas' },
            { value: '+1.200', label: 'Mudanças geridas/mês' },
            { value: '4.9/5', label: 'Avaliação média' },
            { value: '30 dias', label: 'Trial gratuito' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-3xl font-bold mb-1"
                style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-accent)' }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
