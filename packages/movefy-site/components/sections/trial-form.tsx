'use client';

import { useState } from 'react';
import { z } from 'zod';
import { ArrowRight, CheckCircle, Loader2, Shield } from 'lucide-react';

const trialSchema = z.object({
  nomeEmpresa: z.string().min(3, 'Nome da empresa deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z
    .string()
    .min(9, 'Telefone deve ter pelo menos 9 dígitos')
    .regex(/^[0-9+\s()-]+$/, 'Telefone inválido'),
});

type TrialForm = z.infer<typeof trialSchema>;
type FormErrors = Partial<Record<keyof TrialForm, string>>;

export default function TrialForm() {
  const [form, setForm] = useState<TrialForm>({ nomeEmpresa: '', email: '', telefone: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (field: keyof TrialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    // Validar com Zod
    const result = trialSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof TrialForm;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/super-admin/trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setServerError('Já existe uma conta com este email. Tente entrar em console.movefy.pt.');
        } else {
          setServerError(data.message || 'Erro ao criar conta. Tente novamente.');
        }
        return;
      }

      setSuccess(true);
    } catch {
      setServerError('Erro de ligação. Verifique a sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="trial"
      className="section-padding"
      style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #2D2D5E 100%)' }}
    >
      <div className="container-md">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <p className="section-tag mb-3" style={{ color: 'var(--color-accent)' }}>
              Comece hoje
            </p>
            <h2
              className="display-md mb-4 text-white"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              Experimente grátis{' '}
              <span style={{ color: 'var(--color-accent)' }}>30 dias</span>
            </h2>
            <p className="text-lg text-white/70 mb-8">
              Sem cartão de crédito. Configurado em menos de 5 minutos.
              Cancele quando quiser.
            </p>

            <ul className="space-y-3">
              {[
                'Site da sua empresa online imediatamente',
                'App para motoristas pronta a usar',
                'Suporte em português durante o trial',
                'Exportação total dos dados se sair',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/80 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — form */}
          <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            {success ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(52,211,153,0.2)' }}
                >
                  <CheckCircle className="w-8 h-8" style={{ color: '#34D399' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
                  Conta criada com sucesso!
                </h3>
                <p className="text-white/60 text-sm">
                  Verifique o seu email para activar a conta e receber as credenciais de acesso.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>
                  Criar conta trial gratuita
                </h3>

                {/* nomeEmpresa */}
                <div className="mb-4">
                  <label htmlFor="trial-nomeEmpresa" className="block text-sm font-medium text-white/80 mb-1">
                    Nome da empresa
                  </label>
                  <input
                    id="trial-nomeEmpresa"
                    type="text"
                    placeholder="Ex: Silva Mudanças"
                    value={form.nomeEmpresa}
                    onChange={(e) => handleChange('nomeEmpresa', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: errors.nomeEmpresa ? '1px solid #F87171' : '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                    }}
                    disabled={loading}
                    autoComplete="organization"
                  />
                  {errors.nomeEmpresa && (
                    <p className="text-xs mt-1 text-red-400">{errors.nomeEmpresa}</p>
                  )}
                </div>

                {/* email */}
                <div className="mb-4">
                  <label htmlFor="trial-email" className="block text-sm font-medium text-white/80 mb-1">
                    Email profissional
                  </label>
                  <input
                    id="trial-email"
                    type="email"
                    placeholder="empresa@email.pt"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: errors.email ? '1px solid #F87171' : '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                    }}
                    disabled={loading}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-xs mt-1 text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* telefone */}
                <div className="mb-6">
                  <label htmlFor="trial-telefone" className="block text-sm font-medium text-white/80 mb-1">
                    Telefone
                  </label>
                  <input
                    id="trial-telefone"
                    type="tel"
                    placeholder="+351 912 345 678"
                    value={form.telefone}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: errors.telefone ? '1px solid #F87171' : '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                    }}
                    disabled={loading}
                    autoComplete="tel"
                  />
                  {errors.telefone && (
                    <p className="text-xs mt-1 text-red-400">{errors.telefone}</p>
                  )}
                </div>

                {/* Server error */}
                {serverError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                    <p className="text-xs text-red-300">{serverError}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-base gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  id="trial-submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      A criar conta...
                    </>
                  ) : (
                    <>
                      Criar conta grátis
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <Shield className="w-3.5 h-3.5 text-white/40" />
                  <p className="text-xs text-white/40">
                    Dados protegidos. Cumprimos o RGPD.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
