import { Search, X, SlidersHorizontal, Zap } from 'lucide-react';

const STATUS_OPTS  = [{ v: 'todos', l: 'Todos' }, { v: 'pendente', l: 'Pendentes' }, { v: 'concluido', l: 'Concluídos' }];
const ENCAIXE_OPTS = [{ v: 'todos', l: 'Todos' }, { v: 'sim', l: '⚡ Encaixe' }, { v: 'nao', l: 'Agendado' }];

const Chip = ({ active, orange, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
      ${active
        ? orange ? 'bg-brand-500 text-white shadow-sm' : 'bg-gray-800 text-white shadow-sm'
        : 'bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700'}`}
  >
    {children}
  </button>
);

export default function FilterBar({ filters, onChange, totalShown }) {
  const hasActive = filters.search || filters.status !== 'todos' || filters.date || filters.encaixe !== 'todos';
  const clear = () => onChange({ search: '', status: 'todos', date: '', encaixe: 'todos' });

  return (
    <div className="card p-4 mb-4">
      {/* Busca */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            className="input-field pl-10 text-sm"
          />
          {filters.search && (
            <button onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        {hasActive && (
          <button onClick={clear} className="btn-ghost text-sm whitespace-nowrap">
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Status */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTS.map(o => (
            <Chip key={o.v} active={filters.status === o.v}
              onClick={() => onChange({ ...filters, status: o.v })}>
              {o.l}
            </Chip>
          ))}
        </div>

        <div className="h-4 w-px bg-gray-200 hidden sm:block" />

        {/* Encaixe */}
        <div className="flex gap-1.5 items-center flex-wrap">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
            <Zap size={11} />Encaixe:
          </span>
          {ENCAIXE_OPTS.map(o => (
            <Chip key={o.v} active={filters.encaixe === o.v} orange
              onClick={() => onChange({ ...filters, encaixe: o.v })}>
              {o.l}
            </Chip>
          ))}
        </div>

        <div className="h-4 w-px bg-gray-200 hidden sm:block" />

        {/* Data */}
        <div className="flex items-center gap-2">
          <input type="date" value={filters.date}
            onChange={e => onChange({ ...filters, date: e.target.value })}
            className="input-field text-sm py-1.5 w-auto" />
          {filters.date && (
            <button onClick={() => onChange({ ...filters, date: '' })}
              className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        <span className="ml-auto text-xs text-gray-400 font-medium flex items-center gap-1">
          <SlidersHorizontal size={12} />
          {totalShown} resultado{totalShown !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
