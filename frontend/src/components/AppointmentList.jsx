import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarX } from 'lucide-react';
import AppointmentCard from './AppointmentCard';

function dateLabel(dateStr) {
  try {
    const d = parseISO(dateStr);
    if (isToday(d))     return '📅 Hoje';
    if (isTomorrow(d))  return '⏭️ Amanhã';
    if (isYesterday(d)) return '⏪ Ontem';
    return format(d, "EEEE, dd 'de' MMMM", { locale: ptBR });
  } catch { return dateStr; }
}

function groupByDate(apts) {
  const map = {};
  apts.forEach(a => { if (!map[a.date]) map[a.date] = []; map[a.date].push(a); });
  return Object.entries(map).sort(([a],[b]) => a.localeCompare(b)).map(([date,items]) => ({ date, items }));
}

export default function AppointmentList({ appointments, loading, onEdit, onDelete, onToggleStatus }) {
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Carregando atendimentos...</p>
    </div>
  );

  if (!appointments.length) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
      <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center">
        <CalendarX size={28} className="text-brand-300" />
      </div>
      <p className="font-display font-bold text-gray-400 text-lg">Nenhum atendimento encontrado</p>
      <p className="text-sm text-gray-400 text-center max-w-xs">Clique em "Novo Atendimento" para adicionar o primeiro registro.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {groupByDate(appointments).map(({ date, items }) => (
        <section key={date}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-sm font-display font-bold capitalize text-gray-500">{dateLabel(date)}</h2>
            <span className="text-xs bg-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded-full">{items.length}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(a => (
              <AppointmentCard key={a.id} appointment={a}
                onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
