import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Termos e condições de utilização da plataforma Movefy para empresas de mudanças.',
  robots: { index: false },
};

export default function TermosPage() {
  return (
    <div className="container-md px-4">
      <div className="card p-10">
        <h1
          className="display-md mb-4"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}
        >
          Termos de Uso
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
          Última actualização: Janeiro 2026
        </p>
        <div className="prose max-w-none">
          <p className="leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>
            Documento em elaboração. Para questões relacionadas com os termos e condições
            de utilização da plataforma Movefy, contacte a nossa equipa legal através de{' '}
            <a
              href="mailto:legal@movefy.pt"
              className="font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              legal@movefy.pt
            </a>
            .
          </p>
          <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            A versão completa dos termos de uso estará disponível antes do lançamento oficial
            da plataforma. Ao registar-se durante o período de trial, aceita os termos que
            serão comunicados por email antes do início da cobrança.
          </p>
        </div>
      </div>
    </div>
  );
}
