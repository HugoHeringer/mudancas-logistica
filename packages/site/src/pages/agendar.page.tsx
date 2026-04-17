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
    <div className="pt-28 pb-24 bg-sand min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-12">
            <span className="section-label">
              {urgente ? 'Mudanca Urgente' : 'Agendar Mudanca'}
            </span>
            <h1 className="section-title">
              {urgente ? 'Pedir Mudanca Urgente' : 'Agende a sua Mudanca'}
            </h1>
          </div>
        </AnimatedSection>

        <SectionDivider className="mb-12" />

        {/* Step 1 — Calendar */}
        {!selectedDate && (
          <AnimatedSection>
            <h2 className="font-display text-2xl font-light mb-6 text-center">
              1. Escolha a data e hora
            </h2>
            <CalendarSelector onSelect={handleDateSelect} />
          </AnimatedSection>
        )}

        {/* Step 2 — Form */}
        {selectedDate && (
          <AnimatedSection>
            <h2 className="font-display text-2xl font-light mb-6 text-center">
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
