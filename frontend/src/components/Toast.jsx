import { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={onRemove} />)}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  const ok = toast.type === 'success';
  return (
    <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
      text-white text-sm font-medium animate-slide-up max-w-xs
      ${ok ? 'bg-brand-500' : 'bg-red-500'}`}>
      {ok ? <CheckCircle2 size={16} className="flex-shrink-0" /> : <XCircle size={16} className="flex-shrink-0" />}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="opacity-70 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}
