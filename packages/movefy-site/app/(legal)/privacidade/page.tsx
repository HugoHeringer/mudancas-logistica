import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Política de privacidade e tratamento de dados pessoais da plataforma Movefy. Cumprimos o RGPD.',
  robots: { index: false },
};

export default function PrivacidadePage() {
  return (
    <div className="container-md px-4">
      <div className="card p-10">
        <h1
          className="display-md mb-4"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}
        >
          Política de Privacidade
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
          Última actualização: Janeiro 2026
        </p>

        <div className="space-y-6" style={{ color: 'var(--color-muted)' }}>
          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}>
              Responsável pelo tratamento
            </h2>
            <p className="text-sm leading-relaxed">
              Movefy, Lda. · NIF: em registo · Email:{' '}
              <a href="mailto:privacy@movefy.pt" className="font-medium" style={{ color: 'var(--color-accent)' }}>
                privacy@movefy.pt
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}>
              Dados recolhidos
            </h2>
            <p className="text-sm leading-relaxed">
              Recolhemos dados necessários para a prestação do serviço: nome da empresa,
              email, telefone, e dados relacionados com a operação das mudanças (clientes,
              moradas, datas). Não partilhamos dados com terceiros para fins publicitários.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}>
              Armazenamento e segurança
            </h2>
            <p className="text-sm leading-relaxed">
              Os dados ficam armazenados em servidores na União Europeia. Cada empresa tem
              a sua base de dados isolada. Utilizamos encriptação em trânsito (TLS) e em
              repouso para todos os dados sensíveis.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}>
              Os seus direitos (RGPD)
            </h2>
            <p className="text-sm leading-relaxed">
              Tem direito de acesso, rectificação, eliminação, portabilidade e oposição ao
              tratamento dos seus dados. Para exercer estes direitos, contacte{' '}
              <a href="mailto:privacy@movefy.pt" className="font-medium" style={{ color: 'var(--color-accent)' }}>
                privacy@movefy.pt
              </a>
              . Respondemos em até 30 dias.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}>
              Documento completo
            </h2>
            <p className="text-sm leading-relaxed">
              Este documento está em elaboração. A versão completa e juridicamente vinculativa
              estará disponível antes do lançamento oficial. Para questões urgentes contacte{' '}
              <a href="mailto:legal@movefy.pt" className="font-medium" style={{ color: 'var(--color-accent)' }}>
                legal@movefy.pt
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
