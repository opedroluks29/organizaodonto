/**
 * ReminderPopup.jsx
 * Pop-up que aparece às 14:00 para lembrar de confirmar
 * a presença dos pacientes do dia seguinte.
 */

import { Bell, CalendarCheck, X } from 'lucide-react';
import ToothIcon from './ToothIcon';

export default function ReminderPopup({ isOpen, tomorrowCount, onGoConfirm, onDismiss }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onDismiss(); }}>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Card */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden">

        {/* Faixa laranja topo */}
        <div className="bg-brand-500 px-6 pt-6 pb-8 text-white text-center relative">
          {/* Fechar */}
          <button onClick={onDismiss}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>

          {/* Ícone animado */}
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse-soft">
              <Bell size={30} className="text-white" strokeWidth={2} />
            </div>
          </div>

          <h2 className="font-display font-extrabold text-2xl leading-tight">
            Lembrete das 14h
          </h2>
          <p className="text-white/80 text-sm mt-1">
            Hora de confirmar as presenças!
          </p>
        </div>

        {/* Ondinha decorativa */}
        <div className="h-4 bg-brand-500 relative">
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-white rounded-t-[2rem]" />
        </div>

        {/* Conteúdo */}
        <div className="px-6 pb-6 pt-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ToothIcon size={20} className="text-brand-500" />
            <p className="text-gray-600 text-sm font-medium">Pacientes agendados para amanhã</p>
          </div>

          <div className="bg-brand-50 border border-brand-200 rounded-2xl py-4 px-6 mb-5">
            <span className="font-display font-extrabold text-5xl text-brand-600">
              {tomorrowCount}
            </span>
            <p className="text-brand-600 text-sm font-semibold mt-0.5">
              {tomorrowCount === 1 ? 'paciente pendente' : 'pacientes pendentes'}
            </p>
          </div>

          <p className="text-gray-500 text-xs mb-5 leading-relaxed">
            Ligue ou envie mensagem para confirmar a presença de cada paciente amanhã.
          </p>

          <div className="flex gap-3">
            <button onClick={onDismiss}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-colors active:scale-95">
              Agora não
            </button>
            <button onClick={onGoConfirm}
              className="flex-1 btn-primary justify-center py-3 text-sm">
              <CalendarCheck size={16} />
              Ver confirmações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
