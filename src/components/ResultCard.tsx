import { StatusBadge } from './StatusBadge';
import type { WeatherStatus } from '../lib/types';

type ResultCardProps = {
  city: string;
  temperature: number | null;
  status: WeatherStatus;
  message: string;
  txHash: string | null;
};

export const ResultCard = ({ city, temperature, status, message, txHash }: ResultCardProps) => (
  <section className="rounded-2xl bg-zinc-50 p-5 ring-1 ring-zinc-200 transition-all duration-300">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm font-semibold text-zinc-800">Weather Result</p>
      <StatusBadge status={status} />
    </div>

    {temperature !== null ? (
      <div className="space-y-1">
        <p className="text-sm text-zinc-500">{city.trim() || 'Selected city'}</p>
        <p className="text-4xl font-semibold tracking-tight text-zinc-900">{temperature}°C</p>
      </div>
    ) : (
      <p className="text-sm text-zinc-600">{message}</p>
    )}

    {txHash && (
      <p className="mt-4 break-all text-xs text-zinc-500">
        Tx: <span className="font-mono">{txHash}</span>
      </p>
    )}
  </section>
);
