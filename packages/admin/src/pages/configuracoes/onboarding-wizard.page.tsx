import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Palette,
  DollarSign,
  Calendar,
  Truck,
} from 'lucide-react';
import { tenantsApi, uploadApi, veiculosApi } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { useTenantTheme } from '../../theme/TenantProvider';

const STEPS = [
  { id: 'marca', label: 'Marca', icon: Palette },
  { id: 'precos', label: 'Preços', icon: DollarSign },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'veiculos', label: 'Veículos', icon: Truck },
];

export function OnboardingWizardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { brand, setTheme } = useTenantTheme();
  const queryClient = useQueryClient();
  const tenantId = user?.tenantId || '';

  const [currentStep, setCurrentStep] = useState(0);
  const [marcaForm, setMarcaForm] = useState({
    nome: brand.nome || '',
    corPrimaria: brand.cores?.primaria || '#D4A853',
    corSecundaria: brand.cores?.secundaria || '#C4572A',
    corDetalhe: brand.cores?.acento || '#1E2640',
  });
  const [precoForm, setPrecoForm] = useState({
    precoHora: '',
    precoBase: '',
    taxaUrgencia: '',
  });
  const [agendaForm, setAgendaForm] = useState({
    horaInicio: '08:00',
    horaFim: '18:00',
    intervaloMinutos: '60',
    diasUteis: '1,2,3,4,5',
  });
  const [veiculoForm, setVeiculoForm] = useState({
    nome: '',
    marca: '',
    modelo: '',
    matricula: '',
    metrosCubicos: '',
    precoHora: '',
  });

  const { data: setupProgress } = useQuery({
    queryKey: ['setup-progress'],
    queryFn: () => tenantsApi.getSetupProgress(tenantId).then((r) => r.data),
    enabled: !!tenantId,
  });

  const saveMarca = useMutation({
    mutationFn: () =>
      tenantsApi.updateBrand(tenantId, {
        nome: marcaForm.nome,
        cores: {
          primaria: marcaForm.corPrimaria,
          secundaria: marcaForm.corSecundaria,
          acento: marcaForm.corDetalhe,
          fundo: '#F5EDE0',
          fundoEscuro: '#0A0F1E',
          texto: '#2C1810',
          textoClaro: '#F0E6D6',
        },
        fontes: {
          display: 'Cormorant Garamond',
          body: 'Inter',
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup-progress'] });
    },
  });

  const savePreco = useMutation({
    mutationFn: () =>
      tenantsApi.update(tenantId, {
        configPreco: {
          precoHora: Number(precoForm.precoHora) || 0,
          precoBase: Number(precoForm.precoBase) || 0,
          taxaUrgencia: Number(precoForm.taxaUrgencia) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup-progress'] });
    },
  });

  const saveAgenda = useMutation({
    mutationFn: () =>
      tenantsApi.update(tenantId, {
        configAgenda: {
          horaInicio: agendaForm.horaInicio,
          horaFim: agendaForm.horaFim,
          intervaloMinutos: Number(agendaForm.intervaloMinutos) || 60,
          diasUteis: agendaForm.diasUteis.split(',').map(Number),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup-progress'] });
    },
  });

  const createVeiculo = useMutation({
    mutationFn: () =>
      veiculosApi.create({
        nome: veiculoForm.nome,
        marca: veiculoForm.marca,
        modelo: veiculoForm.modelo,
        matricula: veiculoForm.matricula,
        metrosCubicos: Number(veiculoForm.metrosCubicos) || 0,
        precoHora: Number(veiculoForm.precoHora) || 0,
        estado: 'disponivel',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup-progress'] });
    },
  });

  const handleNext = async () => {
    if (currentStep === 0) {
      await saveMarca.mutateAsync();
    } else if (currentStep === 1) {
      await savePreco.mutateAsync();
    } else if (currentStep === 2) {
      await saveAgenda.mutateAsync();
    } else if (currentStep === 3) {
      if (veiculoForm.nome) {
        await createVeiculo.mutateAsync();
      }
      // Mark setup complete
      await tenantsApi.update(tenantId, { estado: 'ativa' });
      navigate('/');
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Progress header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-light text-foreground mb-6"
          style={{ fontFamily: 'var(--tenant-font-display)' }}
        >
          Configurar Empresa
        </h1>
        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 flex-1 ${
                  i === currentStep
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : i < currentStep
                    ? 'border-green-500/20 bg-green-500/5 text-green-700'
                    : 'border-border text-muted-foreground/40'
                }`}
              >
                {i < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                <span className="text-sm">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-px ${i < currentStep ? 'bg-green-500/30' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-card/50 border border-border rounded-xl p-6">
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
              Marca da Empresa
            </h2>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Nome da Empresa</label>
              <input
                type="text"
                value={marcaForm.nome}
                onChange={(e) => setMarcaForm({ ...marcaForm, nome: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                placeholder="Ex: Mudancas Lisboa"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Cor Principal (60%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={marcaForm.corPrimaria}
                    onChange={(e) => setMarcaForm({ ...marcaForm, corPrimaria: e.target.value })}
                    className="h-10 w-10 rounded border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={marcaForm.corPrimaria}
                    onChange={(e) => setMarcaForm({ ...marcaForm, corPrimaria: e.target.value })}
                    className="flex-1 px-2 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Cor Secundária (30%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={marcaForm.corSecundaria}
                    onChange={(e) => setMarcaForm({ ...marcaForm, corSecundaria: e.target.value })}
                    className="h-10 w-10 rounded border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={marcaForm.corSecundaria}
                    onChange={(e) => setMarcaForm({ ...marcaForm, corSecundaria: e.target.value })}
                    className="flex-1 px-2 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Cor Detalhe (10%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={marcaForm.corDetalhe}
                    onChange={(e) => setMarcaForm({ ...marcaForm, corDetalhe: e.target.value })}
                    className="h-10 w-10 rounded border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={marcaForm.corDetalhe}
                    onChange={(e) => setMarcaForm({ ...marcaForm, corDetalhe: e.target.value })}
                    className="flex-1 px-2 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
              Preços
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Preço por Hora (€)</label>
                <input
                  type="number"
                  value={precoForm.precoHora}
                  onChange={(e) => setPrecoForm({ ...precoForm, precoHora: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                  placeholder="35"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Preço Base (€)</label>
                <input
                  type="number"
                  value={precoForm.precoBase}
                  onChange={(e) => setPrecoForm({ ...precoForm, precoBase: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Taxa Urgência (%)</label>
                <input
                  type="number"
                  value={precoForm.taxaUrgencia}
                  onChange={(e) => setPrecoForm({ ...precoForm, taxaUrgencia: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                  placeholder="50"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
              Agenda
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Hora de Início</label>
                <input
                  type="time"
                  value={agendaForm.horaInicio}
                  onChange={(e) => setAgendaForm({ ...agendaForm, horaInicio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Hora de Fim</label>
                <input
                  type="time"
                  value={agendaForm.horaFim}
                  onChange={(e) => setAgendaForm({ ...agendaForm, horaFim: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Intervalo (minutos)</label>
                <input
                  type="number"
                  value={agendaForm.intervaloMinutos}
                  onChange={(e) => setAgendaForm({ ...agendaForm, intervaloMinutos: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Dias Úteis (1=Seg, 7=Dom)</label>
                <input
                  type="text"
                  value={agendaForm.diasUteis}
                  onChange={(e) => setAgendaForm({ ...agendaForm, diasUteis: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                  placeholder="1,2,3,4,5"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-light text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>
              Veículo Inicial
            </h2>
            <p className="text-sm text-muted-foreground/60">
              Adicione pelo menos um veículo para começar a receber mudanças.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Nome</label>
                <input
                  type="text"
                  value={veiculoForm.nome}
                  onChange={(e) => setVeiculoForm({ ...veiculoForm, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                  placeholder="Camião Grande"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Matrícula</label>
                <input
                  type="text"
                  value={veiculoForm.matricula}
                  onChange={(e) => setVeiculoForm({ ...veiculoForm, matricula: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                  placeholder="XX-XX-XX"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Marca / Modelo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={veiculoForm.marca}
                    onChange={(e) => setVeiculoForm({ ...veiculoForm, marca: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                    placeholder="Mercedes"
                  />
                  <input
                    type="text"
                    value={veiculoForm.modelo}
                    onChange={(e) => setVeiculoForm({ ...veiculoForm, modelo: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                    placeholder="Sprinter"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">m³ / Preço-hora</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={veiculoForm.metrosCubicos}
                    onChange={(e) => setVeiculoForm({ ...veiculoForm, metrosCubicos: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                    placeholder="18"
                  />
                  <input
                    type="number"
                    value={veiculoForm.precoHora}
                    onChange={(e) => setVeiculoForm({ ...veiculoForm, precoHora: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none text-foreground"
                    placeholder="35"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={saveMarca.isPending || savePreco.isPending || saveAgenda.isPending || createVeiculo.isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/90 text-primary-foreground hover:bg-primary transition-colors disabled:opacity-50"
        >
          {isLastStep ? 'Concluir' : 'Próximo'}
          {!isLastStep && <ArrowRight className="h-4 w-4" />}
          {isLastStep && <Check className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
