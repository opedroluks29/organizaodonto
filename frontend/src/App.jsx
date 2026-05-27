/**
 * App.jsx — Organiza Odonto
 * Estado global, navegação entre telas e lógica do lembrete das 14h.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Header            from './components/Header';
import StatsBar          from './components/StatsBar';
import FilterBar         from './components/FilterBar';
import AppointmentList   from './components/AppointmentList';
import AppointmentForm   from './components/AppointmentForm';
import ConfirmDialog     from './components/ConfirmDialog';
import Toast             from './components/Toast';
import ReminderPopup     from './components/ReminderPopup';
import ConfirmationScreen from './components/ConfirmationScreen';
import {
  getAppointments, getStats, getTomorrowAppointments,
  createAppointment, updateAppointment, updateStatus, deleteAppointment,
} from './services/api';

export default function App() {
  // ── Tela atual: 'main' | 'confirmations' ──────────────────────
  const [screen, setScreen] = useState('main');

  // ── Dados da tela principal ────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [filters, setFilters]           = useState({ search: '', status: 'todos', date: '', encaixe: 'todos' });

  // ── Modal formulário ───────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // ── Diálogo exclusão ──────────────────────────────────────────
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Toasts ────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, message, type }]);
  }, []);
  const removeToast = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);

  // ── Lembrete 14h ──────────────────────────────────────────────
  const [reminderOpen, setReminderOpen]       = useState(false);
  const [tomorrowCount, setTomorrowCount]     = useState(0);
  const lastReminderDate = useRef(null); // evita disparar duas vezes no mesmo dia

  // Verifica o horário a cada 30 segundos
  useEffect(() => {
    const checkTime = async () => {
      const now = new Date();
      const hh  = now.getHours();
      const mm  = now.getMinutes();
      const today = now.toDateString();

      if (hh === 14 && mm === 0 && lastReminderDate.current !== today) {
        lastReminderDate.current = today;
        try {
          const d = await getTomorrowAppointments();
          const pendentes = d.appointments.filter(a => !a.confirmacao || a.confirmacao === 'pendente').length;
          setTomorrowCount(pendentes);
          if (pendentes > 0) setReminderOpen(true); // só abre se houver pacientes
        } catch { /* silencioso */ }
      }
    };

    checkTime(); // checa imediatamente ao montar
    const interval = setInterval(checkTime, 30_000); // a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  // ── Fetch dados tela principal ─────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [data, statsData] = await Promise.all([getAppointments(filters), getStats()]);
      setAppointments(data);
      setStats(statsData);
    } catch { showToast('Erro ao carregar atendimentos.', 'error'); }
    finally { setLoading(false); }
  }, [filters, showToast]);

  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchAll, filters.search ? 300 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [filters, fetchAll]);

  // ── Handlers ──────────────────────────────────────────────────

  const handleNew  = () => { setEditData(null); setFormOpen(true); };
  const handleEdit = (a) => { setEditData(a); setFormOpen(true); };

  const handleSave = async (formData) => {
    try {
      if (editData) {
        await updateAppointment(editData.id, formData);
        showToast('Atendimento atualizado!');
      } else {
        await createAppointment(formData);
        showToast('Atendimento criado com sucesso!');
      }
      await fetchAll();
    } catch (err) {
      showToast(err.message || 'Erro ao salvar.', 'error');
      throw err;
    }
  };

  const handleDeleteRequest = (a) => { setDeleteTarget(a); setConfirmOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAppointment(deleteTarget.id);
      showToast(`"${deleteTarget.patient_name}" excluído.`);
      setConfirmOpen(false);
      setDeleteTarget(null);
      await fetchAll();
    } catch { showToast('Erro ao excluir.', 'error'); }
  };

  const handleToggleStatus = async (a) => {
    const next = a.status === 'pendente' ? 'concluido' : 'pendente';
    try {
      await updateStatus(a.id, next);
      showToast(next === 'concluido'
        ? `"${a.patient_name}" concluído ✅`
        : `"${a.patient_name}" reaberto ⏳`);
      await fetchAll();
    } catch { showToast('Erro ao atualizar status.', 'error'); }
  };

  const goToConfirmations = () => setScreen('confirmations');
  const goToMain          = () => setScreen('main');

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <Header
        onNewAppointment={handleNew}
        onGoToConfirmations={screen === 'confirmations' ? goToMain : goToConfirmations}
        screen={screen}
      />

      {/* ── Tela Principal ── */}
      {screen === 'main' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <StatsBar stats={stats} />
          <FilterBar filters={filters} onChange={setFilters} totalShown={appointments.length} />
          <AppointmentList
            appointments={appointments} loading={loading}
            onEdit={handleEdit} onDelete={handleDeleteRequest} onToggleStatus={handleToggleStatus} />
        </main>
      )}

      {/* ── Tela de Confirmações ── */}
      {screen === 'confirmations' && (
        <ConfirmationScreen onToast={showToast} />
      )}

      {/* Modais globais */}
      <AppointmentForm
        isOpen={formOpen} onClose={() => setFormOpen(false)}
        onSave={handleSave} editData={editData} />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Excluir atendimento?"
        message={`O atendimento de "${deleteTarget?.patient_name}" será removido permanentemente.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }} />

      {/* Pop-up de lembrete das 14h */}
      <ReminderPopup
        isOpen={reminderOpen}
        tomorrowCount={tomorrowCount}
        onGoConfirm={() => { setReminderOpen(false); goToConfirmations(); }}
        onDismiss={() => setReminderOpen(false)} />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
