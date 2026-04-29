const steps = [
  {
    number: '01',
    title: 'Cria a tua conta trial',
    description:
      'Regista a tua empresa em menos de 2 minutos. Sem cartão de crédito, sem compromissos. Tens 30 dias para explorar tudo.',
    detail: 'Preenches: nome da empresa, email e telefone.',
    color: '#E8B84B',
  },
  {
    number: '02',
    title: 'Personaliza a tua plataforma',
    description:
      'Define preços por veículo, adiciona a equipa, carrega o logótipo e escolhe as cores. O teu site fica imediatamente online.',
    detail: 'Menos de 15 minutos de configuração inicial.',
    color: '#60A5FA',
  },
  {
    number: '03',
    title: 'Começa a receber pedidos',
    description:
      'Partilha o link do teu site com os clientes. Eles agendam online, tu approvas e os motoristas recebem tudo na app.',
    detail: 'Sem formação técnica necessária para a equipa.',
    color: '#34D399',
  },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="container-lg">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-tag mb-3">Processo</p>
          <h2 className="display-md mb-4" style={{ color: 'var(--color-primary)' }}>
            Comece em{' '}
            <span className="gradient-text">3 passos simples</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--color-muted)' }}>
            Da criação de conta à primeira mudança gerida, em menos de uma hora.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line desktop */}
          <div
            className="hidden md:block absolute top-12 left-0 right-0 h-0.5 z-0"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-border), var(--color-border), transparent)' }}
          />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, i) => (
              <div key={step.number} className="flex flex-col items-center text-center">
                {/* Number bubble */}
                <div
                  className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center mb-6 shadow-lg"
                  style={{
                    background: 'var(--color-card)',
                    border: `2px solid ${step.color}`,
                    boxShadow: `0 0 24px ${step.color}30`,
                  }}
                >
                  <span
                    className="text-3xl font-bold"
                    style={{ color: step.color, fontFamily: 'var(--font-outfit)' }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-primary)' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-muted)' }}>
                  {step.description}
                </p>
                <p
                  className="text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{ background: `${step.color}18`, color: step.color }}
                >
                  {step.detail}
                </p>

                {/* Mobile connector */}
                {i < steps.length - 1 && (
                  <div
                    className="md:hidden w-0.5 h-8 mt-6"
                    style={{ background: 'var(--color-border)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
