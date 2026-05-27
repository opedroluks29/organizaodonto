/**
 * ConfirmationScreen.jsx
 * Tela dedicada para confirmar presença dos pacientes do dia seguinte.
 * Cada paciente pode ser marcado como: Confirmado | Não irá | Pendente
 */

import { useState, useEffect, useCallback } from 'react';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, XCircle, Clock, RotateCcw, Phone, CalendarCheck, Zap } from 'lucide-react';
import { getTomorrowAppointments, updateConfirmacao } from '../services/api';
import ToothIcon from './ToothIcon';

const CONFIRM_CONFIG = {
  confirmado: {
    label: '✓ Confirmado',
    cardBorder: 'border-l-emerald-400',
    badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
  },
  nao_ira: {
    label: '✗ Não irá',
    cardBorder: 'border-l-red-400',
    badgeCls: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
  pendente: {
    label: '⏳ Pendente',
    cardBorder: 'border-l-gray-300',
    badgeCls: 'bg-gray-50 text-gray-600 border-gray-200',
    icon: Clock,
    iconColor: 'text-gray-400',
  },
};

function SummaryBadge({ icon: Icon, count, label, colorCls }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${colorCls}`}>
      <Icon size={16} strokeWidth={2.5} />
      <div>
        <span className="font-display font-bold text-lg leading-none">{count}</span>
        <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
      </div>
    </div>
  );
}

export default function ConfirmationScreen({ onToast }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // id do que está sendo atualizado

  const tomorrow = addDays(new Date(), 1);
  const tomorrowLabel = format(tomorrow, "EEEE, dd 'de' MMMM", { locale: ptBR });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getTomorrowAppointments();
      setData(d);
    } catch {
      onToast('Erro ao carregar pacientes de amanhã.', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const handleConfirm = async (id, confirmacao) => {
    setUpdating(id);
    try {
      await updateConfirmacao(id, confirmacao);
      // Atualiza localmente sem re-fetch
      setData(prev => ({
        ...prev,
        appointments: prev.appointments.map(a =>
          a.id === id ? { ...a, confirmacao } : a
        ),
      }));
      const msgs = {
        confirmado: 'Presença confirmada ✓',
        nao_ira:    'Marcado como não irá ✗',
        pendente:   'Voltou para pendente',
      };
      onToast(msgs[confirmacao]);
    } catch {
      onToast('Erro ao atualizar.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  // Contagens
  const apts        = data?.appointments || [];
  const confirmados = apts.filter(a => a.confirmacao === 'confirmado').length;
  const naoVao      = apts.filter(a => a.confirmacao === 'nao_ira').length;
  const pendentes   = apts.filter(a => a.confirmacao === 'pendente' || !a.confirmacao).length;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Cabeçalho da tela */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
            <CalendarCheck size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-gray-900">Confirmações</h2>
            <p className="text-sm text-gray-500 capitalize">{tomorrowLabel}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2 ml-13 pl-1">
          Confirme a presença de cada paciente agendado para amanhã.
        </p>
      </div>

      {/* Resumo */}
      {!loading && apts.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <SummaryBadge icon={Clock}        count={pendentes}   label="Pendentes"   colorCls="bg-gray-50 border-gray-200 text-gray-600" />
          <SummaryBadge icon={CheckCircle2} count={confirmados} label="Confirmados" colorCls="bg-emerald-50 border-emerald-200 text-emerald-700" />
          <SummaryBadge icon={XCircle}      count={naoVao}      label="Não vão"     colorCls="bg-red-50 border-red-200 text-red-700" />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Carregando...</p>
        </div>
      )}

      {/* Nenhum paciente */}
      {!loading && apts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
          <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center">
            <ToothIcon size={36} className="text-brand-300" />
          </div>
          <p className="font-display font-bold text-gray-400 text-xl">Nenhum paciente amanhã</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Não há atendimentos pendentes agendados para amanhã.
          </p>
        </div>
      )}

      {/* Lista de pacientes */}
      {!loading && apts.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          {apts.map(a => {
            const cfg = CONFIRM_CONFIG[a.confirmacao || 'pendente'];
            const Icon = cfg.icon;
            const isUpdating = updating === a.id;

            return (
              <div key={a.id}
                className={`card card-enter p-4 border-l-4 ${cfg.cardBorder}
                  ${a.confirmacao === 'nao_ira' ? 'opacity-60' : ''}`}>

                {/* Info do paciente */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-display font-bold text-base text-gray-900
                        ${a.confirmacao === 'nao_ira' ? 'line-through text-gray-400' : ''}`}>
                        {a.patient_name}
                      </h3>
                      {a.encaixe === 1 && (
                        <span className="badge-encaixe text-xs">
                          <Zap size={10} />ENCAIXE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="font-medium text-brand-600">{a.time}</span>
                      <span className="text-gray-300">·</span>
                      <span>{a.procedure}</span>
                    </div>
                    {a.notes && (
                      <p className="text-xs text-gray-400 mt-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                        {a.notes}
                      </p>
                    )}
                  </div>

                  {/* Badge status atual */}
                  <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badgeCls}`}>
                    <Icon size={11} />
                    {cfg.label}
                  </span>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 flex-wrap">
                  {/* Confirmar */}
                  <button
                    disabled={isUpdating || a.confirmacao === 'confirmado'}
                    onClick={() => handleConfirm(a.id, 'confirmado')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                      transition-all duration-200 active:scale-95 disabled:cursor-not-allowed border
                      ${a.confirmacao === 'confirmado'
                        ? 'bg-emerald-500 text-white border-emerald-500 cursor-default'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>
                    {isUpdating
                      ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      : <CheckCircle2 size={15} strokeWidth={2.5} />}
                    Confirmou
                  </button>

                  {/* Não irá */}
                  <button
                    disabled={isUpdating || a.confirmacao === 'nao_ira'}
                    onClick={() => handleConfirm(a.id, 'nao_ira')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                      transition-all duration-200 active:scale-95 disabled:cursor-not-allowed border
                      ${a.confirmacao === 'nao_ira'
                        ? 'bg-red-500 text-white border-red-500 cursor-default'
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>
                    {isUpdating
                      ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      : <XCircle size={15} strokeWidth={2.5} />}
                    Não irá
                  </button>

                  {/* Reset — só mostra se tiver uma resposta definida */}
                  {a.confirmacao !== 'pendente' && a.confirmacao && (
                    <button
                      disabled={isUpdating}
                      onClick={() => handleConfirm(a.id, 'pendente')}
                      title="Voltar para pendente"
                      className="px-3 py-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100
                        border border-gray-200 transition-all duration-200 active:scale-95">
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progresso no rodapé */}
      {!loading && apts.length > 0 && (
        <div className="mt-6 card p-4">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
            <span>Progresso das confirmações</span>
            <span className="font-bold text-brand-600">
              {confirmados + naoVao}/{apts.length} respondidos
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${apts.length ? ((confirmados + naoVao) / apts.length) * 100 : 0}%` }}
            />
          </div>
          {confirmados + naoVao === apts.length && apts.length > 0 && (
            <p className="text-center text-xs text-emerald-600 font-semibold mt-2">
              ✅ Todas as confirmações concluídas!
            </p>
          )}
        </div>
      )}
    </main>
  );
}
