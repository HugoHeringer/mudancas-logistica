'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Play, CheckCircle, X } from 'lucide-react';

const SOCIAL_PROOF = [
  'Silva Mudanças, Lisboa',
  'MudaFácil, Porto',
  'Ferreira Transportes, Braga',
  'TransMudas, Coimbra',
];

export default function Hero() {
  const [showVideo, setShowVideo] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fechar modal com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowVideo(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const scrollToTrial = () => {
    document.querySelector('#trial')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #F9F7F3 0%, #EEE8F8 60%, #F9F7F3 100%)',
        }}
      />
      {/* Decorative blobs */}
      <div
        className="absolute top-20 right-0 w-96 h-96 rounded-full -z-10 opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(232,184,75,0.3) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full -z-10 opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(74,74,142,0.4) 0%, transparent 70%)' }}
      />

      <div className="container-lg section-padding w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            {/* Tag */}
            <div className="badge-accent mb-6 animate-fade-up">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>30 dias grátis · Sem cartão de crédito</span>
            </div>

            {/* Headline */}
            <h1
              className="display-xl mb-6 animate-fade-up animate-delay-100"
              style={{ color: 'var(--color-primary)' }}
            >
              Gerencie toda a sua empresa de mudanças{' '}
              <span className="gradient-text-accent">numa só plataforma</span>
            </h1>

            {/* Sub-headline */}
            <p
              className="text-lg md:text-xl mb-8 leading-relaxed animate-fade-up animate-delay-200"
              style={{ color: 'var(--color-muted)' }}
            >
              Do pedido online à conclusão da mudança. Admin, site automático,
              app para motoristas e financeiro integrado — tudo incluído.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-up animate-delay-300">
              <button
                onClick={scrollToTrial}
                className="btn-primary text-base px-8 py-4 gap-2"
                id="hero-trial-btn"
              >
                Começar grátis 30 dias
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowVideo(true)}
                className="btn-outline text-base px-8 py-4 gap-2"
                id="hero-demo-btn"
              >
                <Play className="w-4 h-4" />
                Ver demonstração
              </button>
            </div>

            {/* Social proof */}
            <div className="animate-fade-up animate-delay-400">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
                Usado por empresas como
              </p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PROOF.map((name) => (
                  <span key={name} className="badge-primary text-xs">
                    {name}
                  </span>
                ))}
              </div>
              <p className="text-sm mt-3" style={{ color: 'var(--color-muted)' }}>
                +50 empresas de mudanças em Portugal já usam o Movefy
              </p>
            </div>
          </div>

          {/* Right — mockup */}
          <div className="relative animate-fade-up animate-delay-200">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl animate-float"
              style={{
                background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D5E 100%)',
                padding: '2px',
              }}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: '#1A1A2E' }}
              >
                {/* Mockup header bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 mx-3 h-5 rounded-md bg-white/10 flex items-center px-3">
                    <span className="text-white/40 text-xs font-mono">admin.movefy.pt/dashboard</span>
                  </div>
                </div>
                {/* Mockup content */}
                <div className="p-4 space-y-3">
                  {/* KPI row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Pendentes', value: '4', color: '#E8B84B' },
                      { label: 'Hoje', value: '2', color: '#60A5FA' },
                      { label: 'Este mês', value: '18', color: '#34D399' },
                    ].map((kpi) => (
                      <div
                        key={kpi.label}
                        className="rounded-xl p-3 text-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <div className="text-2xl font-bold" style={{ color: kpi.color, fontFamily: 'var(--font-outfit)' }}>{kpi.value}</div>
                        <div className="text-xs text-white/50 mt-0.5">{kpi.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Agenda preview */}
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-wide">Próximas mudanças</div>
                    {[
                      { nome: 'Silva → Figueiredo', hora: '09:00', estado: 'aprovada', cor: '#60A5FA' },
                      { nome: 'Costa → Marques', hora: '14:00', estado: 'a_caminho', cor: '#F97316' },
                      { nome: 'Pereira → Santos', hora: '16:30', estado: 'pendente', cor: '#9CA3AF' },
                    ].map((m) => (
                      <div key={m.nome} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-white/80 text-xs">{m.nome}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-xs">{m.hora}</span>
                          <span className="w-2 h-2 rounded-full" style={{ background: m.cor }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Receita */}
                  <div
                    className="rounded-xl p-3 flex justify-between items-center"
                    style={{ background: 'rgba(232,184,75,0.12)' }}
                  >
                    <div>
                      <div className="text-xs text-white/50">Receita do mês</div>
                      <div className="text-xl font-bold" style={{ color: '#E8B84B', fontFamily: 'var(--font-outfit)' }}>€ 3.240</div>
                    </div>
                    <div className="text-green-400 text-sm font-semibold">+12%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -left-4 shadow-xl rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>Mudança concluída!</div>
                <div className="text-xs" style={{ color: 'var(--color-muted)' }}>Cliente notificado via email</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setShowVideo(false)}
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Demonstração em vídeo"
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              onClick={() => setShowVideo(false)}
              aria-label="Fechar vídeo"
              id="video-modal-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
            <div
              className="w-full flex items-center justify-center"
              style={{ background: '#111', aspectRatio: '16/9' }}
            >
              <div className="text-center text-white/60">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Vídeo de demonstração em breve</p>
                <p className="text-xs mt-1 opacity-60">Registe-se para aceder ao trial gratuito</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
