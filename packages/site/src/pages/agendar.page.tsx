import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarSelector } from '../components/site/CalendarSelector';
import { AgendamentoForm } from '../components/site/AgendamentoForm';
import { AnimatedSection } from '../components/luxury/AnimatedSection';
import { SectionDivider } from '../components/luxury/SectionDivider';

export function AgendarPage() {
  const [searchParams] = useSearchParams();
  const urgente = searchParams.get('urgente') === 'true';
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHora, setSelectedHora] = useState<string | null>(null);

  const handleDateSelect = (date: string, hora: string) => {
    setSelectedDate(date);
    setSelectedHora(hora);
  };

  return (
    <div
      className="pt-28 pb-24 min-h-screen"
      style={{ backgroundColor: 'var(--brand-surface)' }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-12">
            <span className="section-label">
              {urgente ? 'Mudança Urgente' : 'Agendar Mudança'}
            </span>
            <h1
              className="section-title"
              style={{ color: 'var(--brand-on-surface)' }}
            >
              {urgente ? 'Pedir Mudança Urgente' : 'Agende a sua Mudança'}
            </h1>
          </div>
        </AnimatedSection>

        <SectionDivider className="mb-12" />

        {/* Step 1 — Calendar */}
        {!selectedDate && (
          <AnimatedSection>
            <h2
              className="text-2xl font-light mb-6 text-center"
              style={{
                color: 'var(--brand-on-surface)',
                fontFamily: 'var(--tenant-font-display)',
              }}
            >
              1. Escolha a data e hora
            </h2>
            <CalendarSelector onSelect={handleDateSelect} />
          </AnimatedSection>
        )}

        {/* Step 2 — Form */}
        {selectedDate && (
          <AnimatedSection>
            <h2
              className="text-2xl font-light mb-6 text-center"
              style={{
                color: 'var(--brand-on-surface)',
                fontFamily: 'var(--tenant-font-display)',
              }}
            >
              2. Preencha os detalhes
            </h2>
            <AgendamentoForm
              selectedDate={selectedDate}
              selectedHora={selectedHora}
              urgente={urgente}
            />
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
