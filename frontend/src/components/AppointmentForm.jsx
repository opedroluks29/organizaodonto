import { useState, useEffect } from 'react';
import { X, Save, UserPlus, Pencil, Zap } from 'lucide-react';

const PROCS = ['Limpeza', 'Manutenção', 'Urgência', 'Consulta', 'Extração', 'Avaliação', 'Canal', 'Clareamento', 'Prótese', 'Ortodontia'];
const EMPTY = { patient_name: '', procedure: '', date: '', time: '', notes: '', status: 'pendente', encaixe: false };

export default function AppointmentForm({ isOpen, onClose, onSave, editData }) {
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [showSug, setShowSug]   = useState(false);
  const isEditing = Boolean(editData);

  useEffect(() => {
    if (editData) {
      setForm({
        patient_name: editData.patient_name || '',
        procedure:    editData.procedure    || '',
        date:         editData.date         || '',
        time:         editData.time         || '',
        notes:        editData.notes        || '',
        status:       editData.status       || 'pendente',
        encaixe:      editData.encaixe === 1,
      });
    } else {
      const now = new Date();
      setForm({ ...EMPTY, date: now.toISOString().split('T')[0], time: now.toTimeString().slice(0,5) });
    }
    setErrors({});
  }, [editData, isOpen]);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!form.patient_name.trim()) e.patient_name = 'Nome é obrigatório';
    if (!form.procedure.trim())    e.procedure    = 'Procedimento é obrigatório';
    if (!form.date)                e.date         = 'Data é obrigatória';
    if (!form.time)                e.time         = 'Hora é obrigatória';
    return e;
  };

  const set  = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })); };
  const sugs = PROCS.filter(s => s.toLowerCase().includes(form.procedure.toLowerCase()) && form.procedure.length > 0);

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try { await onSave({ ...form, encaixe: form.encaixe ? 1 : 0 }); onClose(); }
    catch { /* errors shown by parent */ }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
              {isEditing ? <Pencil size={16} className="text-brand-600" /> : <UserPlus size={16} className="text-brand-600" />}
            </div>
            <div>
              <h2 className="font-display font-bold text-gray-800 text-base">
                {isEditing ? 'Editar Atendimento' : 'Novo Atendimento'}
              </h2>
              <p className="text-xs text-gray-400">{isEditing ? 'Atualize os dados abaixo' : 'Preencha os dados do paciente'}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
        </div>

        {/* Formulário */}
        <div className="px-6 py-5 space-y-4">

          {/* Nome */}
          <div>
            <label className="label">Nome do paciente *</label>
            <input type="text" placeholder="Ex: Maria Silva" value={form.patient_name}
              onChange={e => set('patient_name', e.target.value)}
              className={`input-field ${errors.patient_name ? 'border-red-300 focus:ring-red-300' : ''}`}
              autoFocus />
            {errors.patient_name && <p className="text-xs text-red-500 mt-1">{errors.patient_name}</p>}
          </div>

          {/* Procedimento */}
          <div className="relative">
            <label className="label">Procedimento *</label>
            <input type="text" placeholder="Ex: Limpeza, Manutenção..." value={form.procedure}
              onChange={e => { set('procedure', e.target.value); setShowSug(true); }}
              onBlur={() => setTimeout(() => setShowSug(false), 150)}
              onFocus={() => setShowSug(true)}
              className={`input-field ${errors.procedure ? 'border-red-300 focus:ring-red-300' : ''}`} />
            {errors.procedure && <p className="text-xs text-red-500 mt-1">{errors.procedure}</p>}
            {showSug && sugs.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {sugs.map(s => (
                  <button key={s} onMouseDown={() => { set('procedure', s); setShowSug(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-50 hover:text-brand-700 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Data + Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className={`input-field ${errors.date ? 'border-red-300' : ''}`} />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="label">Hora *</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
                className={`input-field ${errors.time ? 'border-red-300' : ''}`} />
              {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* ── ENCAIXE ── */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Zap size={14} className="text-brand-500" />
              Encaixe?
            </label>
            <div className="flex gap-2">
              {[{ v: true, l: '⚡ Sim, é encaixe' }, { v: false, l: 'Não, agendado' }].map(opt => (
                <button key={String(opt.v)} type="button"
                  onClick={() => set('encaixe', opt.v)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${form.encaixe === opt.v
                      ? opt.v
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-gray-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="label">Status</label>
            <div className="flex gap-2">
              {[{ v: 'pendente', l: '⏳ Pendente' }, { v: 'concluido', l: '✅ Concluído' }].map(s => (
                <button key={s.v} type="button" onClick={() => set('status', s.v)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${form.status === s.v
                      ? s.v === 'pendente' ? 'bg-amber-500 text-white shadow-sm' : 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {s.l}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="label">Observações <span className="font-normal text-gray-400">(opcional)</span></label>
            <textarea placeholder="Anotações sobre o atendimento..." value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3} className="input-field resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving}
            className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed">
            {saving
              ? <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </span>
              : <><Save size={16} />{isEditing ? 'Salvar alterações' : 'Criar atendimento'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
