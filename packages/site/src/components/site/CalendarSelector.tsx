import { useState, useMemo, useEffect } from 'react';
import { useTenantTheme } from '../../theme/TenantProvider';
import { GlassCard } from '../luxury/GlassCard';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { cn } from '../../lib/utils';
import { publicApi } from '../../lib/api';
import { ChevronLeft, ChevronRight, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface CalendarSelectorProps {
  onSelect: (data: string, hora: string) => void;
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DEFAULT_SLOTS = [
  { hora: '08:00', disponivel: true },
  { hora: '09:00', disponivel: true },
  { hora: '10:00', disponivel: true },
  { hora: '14:00', disponivel: true },
  { hora: '15:00', disponivel: true },
  { hora: '16:00', disponivel: true },
];

export function CalendarSelector({ onSelect }: CalendarSelectorProps) {
  const { brand, tenantId } = useTenantTheme();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHora, setSelectedHora] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [slots, setSlots] = useState<{ hora: string; disponivel: boolean }[]>(DEFAULT_SLOTS);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (selectedDate && tenantId) {
      setLoadingSlots(true);
      publicApi.getDisponibilidade(tenantId, selectedDate)
        .then((res) => {
          const data = res.data;
          if (data && data.slots && data.slots.length > 0) {
            setSlots(data.slots);
          } else {
            setSlots(DEFAULT_SLOTS);
          }
        })
        .catch(() => {
          setSlots(DEFAULT_SLOTS);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate, tenantId]);

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    return days;
  }, [currentMonth, currentYear]);

  const isPast = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    return d < new Date(new Date().toDateString());
  };

  const isWeekend = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    return d.getDay() === 0;
  };

  const formatDate = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
    setSelectedHora(null);
    setConfirmed(false);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
    setSelectedHora(null);
    setConfirmed(false);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedHora) {
      setConfirmed(true);
      onSelect(selectedDate, selectedHora);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <GlassCard className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-gold/10 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-brown" />
          </button>
          <h3 className="font-display text-xl font-light">
            {MESES[currentMonth]} {currentYear}
          </h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gold/10 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-brown" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-brown/50 uppercase tracking-wider py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;

            const disabled = isPast(day) || isWeekend(day);
            const dateStr = formatDate(day);
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                disabled={disabled}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setSelectedHora(null);
                  setConfirmed(false);
                }}
                className={cn(
                  'aspect-square rounded-lg text-sm font-medium transition-all duration-200',
                  disabled && 'text-brown/20 cursor-not-allowed',
                  !disabled && !isSelected && 'hover:bg-gold/10 text-brown/70',
                  isSelected && 'bg-primary text-primary-foreground shadow-md',
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        {selectedDate && !confirmed && (
          <AnimatedSection className="mt-8">
            <h4 className="font-display text-lg font-light mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-terracotta" />
              Horarios disponiveis
            </h4>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-brown/50" />
                <span className="ml-2 text-sm text-brown/50">A carregar horarios...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.hora}
                      disabled={!slot.disponivel}
                      onClick={() => setSelectedHora(slot.hora)}
                      className={cn(
                        'py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                        !slot.disponivel && 'bg-sand-medium/50 text-brown/30 cursor-not-allowed line-through',
                        slot.disponivel && !selectedHora?.includes(slot.hora) && 'border border-gold/20 text-brown/70 hover:border-gold/50 hover:bg-gold/5',
                        selectedHora === slot.hora && 'bg-primary text-primary-foreground border border-primary',
                      )}
                    >
                      {slot.hora}
                    </button>
                  ))}
                </div>

                {selectedHora && (
                  <div className="mt-6 space-y-4">
                    <button
                      onClick={handleConfirm}
                      className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium tracking-wide uppercase text-sm hover:bg-primary/90 transition-all duration-300"
                    >
                      Confirmar data e hora
                    </button>
                  </div>
                )}
              </>
            )}
          </AnimatedSection>
        )}

        {confirmed && selectedDate && selectedHora && (
          <AnimatedSection className="mt-6">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">
                  {selectedDate} as {selectedHora}
                </p>
                <p className="text-xs text-brown/60 mt-1">
                  Data pendente de confirmacao pelo admin
                </p>
              </div>
            </div>
          </AnimatedSection>
        )}
      </GlassCard>
    </div>
  );
}