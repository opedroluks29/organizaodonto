import { Plus, CalendarCheck } from 'lucide-react';
import ToothIcon from './ToothIcon';

export default function Header({ onNewAppointment, onGoToConfirmations, screen }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo + Nome */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
            <ToothIcon size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-gray-900 text-lg leading-none tracking-tight">
              Organiza<span className="text-brand-500">Odonto</span>
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Gestão de atendimentos</p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex items-center gap-2">
          {/* Botão Confirmações */}
          <button
            onClick={onGoToConfirmations}
            className={`
              inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold
              transition-all duration-200 active:scale-95
              ${screen === 'confirmations'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700'}
            `}
          >
            <CalendarCheck size={15} strokeWidth={2.5} />
            <span className="hidden sm:inline">Confirmações</span>
          </button>

          {/* Botão Novo Atendimento (só na tela principal) */}
          {screen !== 'confirmations' && (
            <button className="btn-primary text-sm" onClick={onNewAppointment}>
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Novo Atendimento</span>
              <span className="sm:hidden">Novo</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
