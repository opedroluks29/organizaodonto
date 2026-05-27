import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onCancel(); };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-scale-in">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
        </div>
        <h3 className="font-display font-bold text-gray-800 text-lg text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center"><X size={15} />Cancelar</button>
          <button onClick={onConfirm}
            className="flex-1 justify-center inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm active:scale-95">
            <Trash2 size={15} />Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
