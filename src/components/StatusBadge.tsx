import type { WeatherStatus } from '../lib/types';

const statusClassMap: Record<WeatherStatus, string> = {
  idle: 'bg-zinc-100 text-zinc-600',
  fetching: 'bg-amber-100 text-amber-700',
  success: 'bg-emerald-100 text-emerald-700',
  error: 'bg-rose-100 text-rose-700',
};

export const StatusBadge = ({ status }: { status: WeatherStatus }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClassMap[status]}`}>
    {status}
  </span>
);
