import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Calendar, Pencil, Trash2, CheckCircle2, RotateCcw, ChevronDown, ChevronUp, FileText, Zap } from 'lucide-react';
import { useState } from 'react';

const PROC_COLORS = {
  'limpeza':    'bg-sky-100 text-sky-700',
  'manutenção': 'bg-violet-100 text-violet-700',
  'urgência':   'bg-red-100 text-red-700',
  'consulta':   'bg-emerald-100 text-emerald-700',
  'extração':   'bg-orange-100 text-orange-700',
  'avaliação':  'bg-indigo-100 text-indigo-700',
  'canal':      'bg-pink-100 text-pink-700',
};
const procColor = (p) => {
  const k = Object.keys(PROC_COLORS).find(k => p.toLowerCase().includes(k));
  return k ? PROC_COLORS[k] : 'bg-gray-100 text-gray-600';
};

const fmtDate = (d) => { try { return format(parseISO(d), "dd 'de' MMM", { locale: ptBR }); } catch { return d; } };
const fmtDay  = (d) => { try { return format(parseISO(d), 'EEEE', { locale: ptBR }); } catch { return ''; } };

const CONFIRM_LABELS = {
  confirmado: { label: '✓ Confirmado', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  nao_ira:    { label: '✗ Não irá',    cls: 'text-red-700    bg-red-50    border-red-200' },
};

export default function AppointmentCard({ appointment: a, onEdit, onDelete, onToggleStatus }) {
  const [showNotes, setShowNotes] = useState(false);
  const done = a.status === 'concluido';
  const conf = CONFIRM_LABELS[a.confirmacao];

  return (
    <div className={`card card-enter p-4 hover:shadow-md
      ${done ? 'border-l-4 border-l-emerald-400' : a.encaixe ? 'border-l-4 border-l-brand-400' : 'border-l-4 border-l-amber-400'}`}>

      {/* Linha 1: nome + badges */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className={`font-display font-bold text-base leading-tight truncate
            ${done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {a.patient_name}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${procColor(a.procedure)}`}>
              {a.procedure}
            </span>
            {a.encaixe === 1 && (
              <span className="badge-encaixe">
                <Zap size={10} />ENCAIXE
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {done
            ? <span className="badge-concluido"><CheckCircle2 size={11} />Concluído</span>
            : <span className="badge-pendente"><Clock size={11} />Pendente</span>}
          {conf && (
            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${conf.cls}`}>
              {conf.label}
            </span>
          )}
        </div>
      </div>

      {/* Data + hora */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-brand-500" />
          <span className="font-medium">{fmtDate(a.date)}</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-400 capitalize text-xs">{fmtDay(a.date)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-brand-500" />
          <span className="font-medium">{a.time}</span>
        </div>
      </div>

      {/* Observações */}
      {a.notes && (
        <div className="mb-3">
          <button onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-600 transition-colors">
            <FileText size={12} />
            Observações
            {showNotes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showNotes && (
            <p className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed border border-gray-100">
              {a.notes}
            </p>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => onToggleStatus(a)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
            transition-all duration-200 active:scale-95 border
            ${done
              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200'
              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'}`}>
          {done ? <><RotateCcw size={12} />Reabrir</> : <><CheckCircle2 size={12} />Concluir</>}
        </button>
        <div className="flex-1" />
        <button onClick={() => onEdit(a)} className="btn-ghost text-xs px-2.5 py-1.5">
          <Pencil size={13} />
          <span className="hidden sm:inline">Editar</span>
        </button>
        <button onClick={() => onDelete(a)}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-200"
          title="Excluir">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
