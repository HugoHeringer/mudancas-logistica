import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTenantTheme } from '../../theme/TenantProvider';
import { GlassCard } from '../luxury/GlassCard';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { GradientButton } from '../luxury/GradientButton';
import { cn } from '../../lib/utils';
import { publicApi } from '../../lib/api';
import {
  User, MapPin, Truck, Package, Upload, AlertTriangle,
  ChevronDown, ChevronUp, Globe, Phone, Mail
} from 'lucide-react';

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatorio'),
  apelido: z.string().min(2, 'Apelido obrigatorio'),
  email: z.string().email('Email invalido'),
  telefone: z.string().min(9, 'Telefone invalido'),
  recRua: z.string().min(1, 'Rua obrigatoria'),
  recNumero: z.string().min(1, 'Numero obrigatorio'),
  recCodPostal: z.string().min(1, 'Codigo postal obrigatorio'),
  recLocalidade: z.string().min(1, 'Localidade obrigatoria'),
  recAndar: z.string().optional(),
  recElevador: z.boolean().optional(),
  entRua: z.string().min(1, 'Rua obrigatoria'),
  entNumero: z.string().min(1, 'Numero obrigatorio'),
  entCodPostal: z.string().min(1, 'Codigo postal obrigatorio'),
  entLocalidade: z.string().min(1, 'Localidade obrigatoria'),
  entAndar: z.string().optional(),
  entElevador: z.boolean().optional(),
  internacional: z.boolean().optional(),
  recPais: z.string().optional(),
  entPais: z.string().optional(),
  veiculoId: z.string().optional(),
  protecaoFilme: z.number().optional(),
  cartao: z.number().optional(),
  caixas: z.number().optional(),
  fitaCola: z.number().optional(),
  observacoes: z.string().optional(),
  camposPersonalizados: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

type FormData = z.infer<typeof schema>;

interface AgendamentoFormProps {
  selectedDate?: string | null;
  selectedHora?: string | null;
  urgente?: boolean;
}

const MATERIAIS = [
  { key: 'protecaoFilme', label: 'Protecao Filme', unitPrice: 2.5 },
  { key: 'cartao', label: 'Cartao', unitPrice: 3.0 },
  { key: 'caixas', label: 'Caixas', unitPrice: 4.5 },
  { key: 'fitaCola', label: 'Fita Cola', unitPrice: 1.5 },
] as const;

export function AgendamentoForm({ selectedDate: propDate, selectedHora: propHora, urgente: propUrgente = false }: AgendamentoFormProps) {
  const { brand, tenantId } = useTenantTheme();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [selectedDate] = useState(propDate || '');
  const [selectedHora] = useState(propHora || '');
  const [urgente] = useState(propUrgente);
  const [selectedVeiculoId, setSelectedVeiculoId] = useState('');
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [camposPersonalizados, setCamposPersonalizados] = useState<any[]>([]);
  const [valoresCampos, setValoresCampos] = useState<Record<string, any>>({});

  useEffect(() => {
    if (tenantId) {
      publicApi.getVeiculos(tenantId)
        .then(res => setVeiculos(res.data || []))
        .catch(() => setVeiculos([]));
      publicApi.getCamposFormulario(tenantId)
        .then(res => setCamposPersonalizados(res.data || []))
        .catch(() => setCamposPersonalizados([]));
    }
  }, [tenantId]);

  const handleCampoChange = (campoId: string, value: any) => {
    setValoresCampos(prev => ({ ...prev, [campoId]: value }));
  };

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      internacional: false,
      recElevador: false,
      entElevador: false,
      protecaoFilme: 0,
      cartao: 0,
      caixas: 0,
      fitaCola: 0,
    },
  });

  const internacional = watch('internacional');

  // [7.5] Validate fields of current step before allowing navigation
  const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
    1: ['nome', 'apelido', 'email', 'telefone'],
    2: ['recRua', 'recNumero', 'recCodPostal', 'recLocalidade', 'entRua', 'entNumero', 'entCodPostal', 'entLocalidade'],
    3: [],
    4: [],
  };

  const goNext = async (nextStep: number) => {
    const fields = STEP_FIELDS[step] || [];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStep(nextStep);
  };

  const onSubmit = async (data: FormData) => {
    if (!tenantId) {
      console.error('Tenant ID nao disponivel');
      return;
    }

    const moradaRecolha = {
      rua: data.recRua,
      numero: data.recNumero,
      codigoPostal: data.recCodPostal,
      localidade: data.recLocalidade, // [7.3] Use localidade instead of locality
      andar: data.recAndar || undefined,
      elevador: data.recElevador || false,
      pais: data.recPais || 'Portugal',
    };

    const moradaEntrega = {
      rua: data.entRua,
      numero: data.entNumero,
      codigoPostal: data.entCodPostal,
      localidade: data.entLocalidade, // [7.3] Use localidade instead of locality
      andar: data.entAndar || undefined,
      elevador: data.entElevador || false,
      pais: data.entPais || 'Portugal',
    };

    // [5.8] Determine equipa based on vehicle selection
    const equipa = selectedVeiculoId ? 'motorista' : 'motorista';

    setSubmitting(true);
    setSubmitError(null);
    try {
      await publicApi.criarMudanca({
        tipoServico: urgente ? 'urgente' : 'normal',
        clienteNome: `${data.nome} ${data.apelido}`,
        clienteEmail: data.email,
        clienteTelefone: data.telefone,
        moradaRecolha,
        moradaEntrega,
        dataPretendida: selectedDate,
        horaPretendida: selectedHora,
        veiculoId: selectedVeiculoId || undefined,
        equipa,
        materiais: {
          protecaoFilme: data.protecaoFilme || 0,
          protecaoCartao: data.cartao || 0,
          caixas: data.caixas || 0,
          fitaCola: data.fitaCola || 0,
        },
        observacoes: data.observacoes,
        eInternacional: data.internacional || false,
        tenantId,
        camposPersonalizados: Object.keys(valoresCampos).length > 0 ? valoresCampos : undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Erro ao submeter:', err);
      const msg = err?.response?.data?.message || err?.message || 'Ocorreu um erro ao submeter o pedido. Tente novamente.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <AnimatedSection>
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-light mb-4">Pedido recebido!</h2>
          <p className="text-brown/60">
            O seu pedido de mudanca foi submetido com sucesso. Entraremos em contacto brevemente para confirmar os detalhes.
          </p>
        </AnimatedSection>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Dados Pessoais', icon: User },
    { num: 2, label: 'Moradas', icon: MapPin },
    { num: 3, label: 'Veiculo', icon: Truck },
    { num: 4, label: 'Materiais', icon: Package },
  ];
  const hasCustomFields = camposPersonalizados.length > 0;

  const renderCampoField = (campo: any) => {
    const value = valoresCampos[campo.id] ?? '';
    switch (campo.tipo) {
      case 'texto':
        return (
          <input
            value={value}
            onChange={(e) => handleCampoChange(campo.id, e.target.value)}
            placeholder={campo.nome}
            className="w-full px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50"
          />
        );
      case 'numero':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleCampoChange(campo.id, Number(e.target.value))}
            placeholder={campo.nome}
            className="w-full px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50"
          />
        );
      case 'checkbox':
        if (campo.opcoes?.length > 0) {
          return (
            <div className="space-y-2">
              {campo.opcoes.map((op: string) => (
                <label key={op} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(value || []).includes(op)}
                    onChange={(e) => {
                      const current = valoresCampos[campo.id] || [];
                      if (e.target.checked) {
                        handleCampoChange(campo.id, [...current, op]);
                      } else {
                        handleCampoChange(campo.id, current.filter((v: string) => v !== op));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{op}</span>
                </label>
              ))}
            </div>
          );
        }
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleCampoChange(campo.id, e.target.checked)}
            className="rounded"
          />
        );
      case 'selector':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleCampoChange(campo.id, e.target.value)}
            className="w-full px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">{`Selecionar ${campo.nome}`}</option>
            {(campo.opcoes || []).map((op: string) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            value={value}
            onChange={(e) => handleCampoChange(campo.id, e.target.value)}
            placeholder={campo.nome}
            className="w-full px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50"
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {submitError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
          <button type="button" onClick={() => setSubmitError(null)} className="text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}
      {urgente && (
        <div className="flex items-center gap-3 p-4 bg-terracotta/10 border border-terracotta/30 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-terracotta shrink-0" />
          <div>
            <p className="font-medium text-sm text-terracotta">Mudanca Urgente</p>
            <p className="text-xs text-brown/60">Tarifas diferenciadas aplicam-se a pedidos urgentes</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        {[...steps, ...(hasCustomFields ? [{ num: 5, label: 'Extra', icon: Package }] : [])].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => s.num > step ? goNext(s.num) : setStep(s.num)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
              step === s.num
                ? 'bg-primary text-primary-foreground'
                : step > s.num
                  ? 'bg-primary/10 text-primary'
                  : 'bg-sand-dark text-brown/40'
            )}
          >
            <s.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sm:hidden">{s.num}</span>
          </button>
        ))}
      </div>

      {step === 1 && (
        <AnimatedSection>
          <GlassCard className="p-6 md:p-8">
            <h3 className="font-display text-2xl font-light mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-terracotta" />
              Dados Pessoais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium tracking-wide uppercase text-brown/50 mb-1.5 block">Nome</label>
                <input
                  {...register('nome')}
                  className="w-full px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Nome"
                />
                {errors.nome && <p className="text-xs text-terracotta mt-1">{errors.nome.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium tracking-wide uppercase text-brown/50 mb-1.5 block">Apelido</label>
                <input
                  {...register('apelido')}
                  className="w-full px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Apelido"
                />
                {errors.apelido && <p className="text-xs text-terracotta mt-1">{errors.apelido.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium tracking-wide uppercase text-brown/50 mb-1.5 block">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="email@exemplo.com"
                />
                {errors.email && <p className="text-xs text-terracotta mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium tracking-wide uppercase text-brown/50 mb-1.5 block">Telefone</label>
                <input
                  {...register('telefone')}
                  type="tel"
                  className="w-full px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="912345678"
                />
                {errors.telefone && <p className="text-xs text-terracotta mt-1">{errors.telefone.message}</p>}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button type="button" onClick={() => goNext(2)} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                Proximo
              </button>
            </div>
          </GlassCard>
        </AnimatedSection>
      )}

      {step === 2 && (
        <AnimatedSection>
          <GlassCard className="p-6 md:p-8">
            <h3 className="font-display text-2xl font-light mb-4 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-terracotta" />
              Moradas
            </h3>

            <div className="flex items-center gap-3 mb-6 p-3 bg-sand-dark/50 rounded-lg">
              <Globe className="w-5 h-5 text-primary" />
              <label className="text-sm font-medium">Mudanca Internacional</label>
              <input type="checkbox" {...register('internacional')} className="ml-auto" />
            </div>

            <div className="mb-8">
              <h4 className="text-sm font-medium tracking-wide uppercase text-terracotta mb-4">Morada de Recolha</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input {...register('recRua')} placeholder="Rua" className="w-full px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <input {...register('recNumero')} placeholder="Numero" className="px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                <input {...register('recCodPostal')} placeholder="Codigo Postal" className="px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                <input {...register('recLocalidade')} placeholder="Localidade" className="px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                <input {...register('recAndar')} placeholder="Andar (opcional)" className="px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register('recElevador')} className="rounded" />
                  <label className="text-sm">Elevador</label>
                </div>
                {internacional && (
                  <input {...register('recPais')} placeholder="Pais" className="px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium tracking-wide uppercase text-terracotta mb-4">Morada de Entrega</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input {...register('entRua')} placeholder="Rua" className="w-full px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <input {...register('entNumero')} placeholder="Numero" className="px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                <input {...register('entCodPostal')} placeholder="Codigo Postal" className="px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                <input {...register('entLocalidade')} placeholder="Localidade" className="px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                <input {...register('entAndar')} placeholder="Andar (opcional)" className="px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register('entElevador')} className="rounded" />
                  <label className="text-sm">Elevador</label>
                </div>
                {internacional && (
                  <input {...register('entPais')} placeholder="Pais" className="px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                )}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 border border-gold/20 text-brown/60 rounded-lg text-sm font-medium">
                Anterior
              </button>
              <button type="button" onClick={() => goNext(3)} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                Proximo
              </button>
            </div>
          </GlassCard>
        </AnimatedSection>
      )}

      {step === 3 && (
        <AnimatedSection>
          <GlassCard className="p-6 md:p-8">
            <h3 className="font-display text-2xl font-light mb-6 flex items-center gap-3">
              <Truck className="w-6 h-6 text-terracotta" />
              Veiculo
            </h3>

            {veiculos.length > 0 ? (
              <div className="space-y-2">
                {veiculos.map((v: any) => (
                  <label key={v.id} className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                    selectedVeiculoId === v.id ? 'border-primary bg-primary/5' : 'border-gold/20 hover:border-gold/40'
                  )}>
                    <input
                      type="radio"
                      name="veiculo"
                      value={v.id}
                      checked={selectedVeiculoId === v.id}
                      onChange={() => setSelectedVeiculoId(v.id)}
                      className="rounded"
                    />
                    {v.imagemUrl && (
                      <img src={v.imagemUrl} alt={v.nome} className="w-16 h-12 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{v.nome}</p>
                      <p className="text-xs text-brown/60">{v.marca} {v.modelo}</p>
                    </div>
                    <p className="text-sm font-medium text-primary">{v.precoHora}€/h</p>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brown/60">Nenhum veiculo disponivel</p>
            )}

            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 border border-gold/20 text-brown/60 rounded-lg text-sm font-medium">
                Anterior
              </button>
              <button type="button" onClick={() => goNext(4)} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                Proximo
              </button>
            </div>
          </GlassCard>
        </AnimatedSection>
      )}

      {step === 4 && (
        <AnimatedSection>
          <GlassCard className="p-6 md:p-8">
            <h3 className="font-display text-2xl font-light mb-6 flex items-center gap-3">
              <Package className="w-6 h-6 text-terracotta" />
              Materiais
            </h3>

            <div className="space-y-4">
              {MATERIAIS.map((m) => (
                <div key={m.key} className="flex items-center justify-between p-3 bg-sand-dark/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      {...register(m.key as any, { valueAsNumber: true })}
                      className="w-16 px-2 py-1 bg-sand-dark/50 border border-gold/10 rounded text-sm text-center focus:outline-none focus:border-primary/50"
                    />
                    <span className="text-sm text-brown/60">un x {m.unitPrice}€</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="text-xs font-medium tracking-wide uppercase text-brown/50 mb-1.5 block">Observacoes</label>
              <textarea
                {...register('observacoes')}
                className="w-full px-4 py-2.5 bg-sand-dark/50 border border-gold/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors"
                rows={3}
                placeholder="Informacoes adicionais..."
              />
            </div>

            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(3)} className="px-6 py-2.5 border border-gold/20 text-brown/60 rounded-lg text-sm font-medium">
                Anterior
              </button>
              {hasCustomFields ? (
                <button type="button" onClick={() => goNext(5)} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                  Proximo
                </button>
              ) : (
                <GradientButton type="submit" disabled={submitting}>
                  {submitting ? 'A submeter...' : 'Submeter Pedido'}
                </GradientButton>
              )}
            </div>
          </GlassCard>
        </AnimatedSection>
      )}

      {hasCustomFields && step === 5 && (
        <AnimatedSection>
          <GlassCard className="p-6 md:p-8">
            <h3 className="font-display text-2xl font-light mb-6 flex items-center gap-3">
              <Package className="w-6 h-6 text-terracotta" />
              Informacao Adicional
            </h3>

            <div className="space-y-4">
              {camposPersonalizados.map((campo: any) => (
                <div key={campo.id}>
                  <label className="text-xs font-medium tracking-wide uppercase text-brown/50 mb-1.5 block">
                    {campo.nome}
                    {campo.obrigatorio && <span className="text-terracotta"> *</span>}
                  </label>
                  {renderCampoField(campo)}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(4)} className="px-6 py-2.5 border border-gold/20 text-brown/60 rounded-lg text-sm font-medium">
                Anterior
              </button>
              <GradientButton type="submit" disabled={submitting}>
                {submitting ? 'A submeter...' : 'Submeter Pedido'}
              </GradientButton>
            </div>
          </GlassCard>
        </AnimatedSection>
      )}
    </form>
  );
}