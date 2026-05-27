import { Calendar, Clock, CheckCircle2, Users, Zap } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="card flex items-center gap-3 px-4 py-3">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <Icon size={16} className="text-white" strokeWidth={2.5} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400 truncate">{label}</p>
      <p className="text-xl font-display font-bold text-gray-800 leading-tight">{value}</p>
    </div>
  </div>
);

export default function StatsBar({ stats }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      <StatCard icon={Users}        label="Total"      value={stats.total      ?? 0} colorClass="bg-gray-700"    />
      <StatCard icon={Clock}        label="Pendentes"  value={stats.pendentes  ?? 0} colorClass="bg-amber-500"   />
      <StatCard icon={CheckCircle2} label="Concluídos" value={stats.concluidos ?? 0} colorClass="bg-emerald-500" />
      <StatCard icon={Calendar}     label="Hoje"       value={stats.hoje       ?? 0} colorClass="bg-brand-500"   />
      <StatCard icon={Zap}          label="Encaixes"   value={stats.encaixes   ?? 0} colorClass="bg-violet-500"  />
    </div>
  );
}
