import { APP_NAME } from '../lib/config';

type WalletPanelProps = {
  address: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  isSwitchingNetwork: boolean;
  error: string | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  onSwitchNetwork: () => Promise<void>;
};

const shortAddress = (address: string): string => `${address.slice(0, 6)}...${address.slice(-4)}`;

export const WalletPanel = ({
  address,
  isConnected,
  isCorrectNetwork,
  isSwitchingNetwork,
  error,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
}: WalletPanelProps) => (
  <section className="space-y-4 rounded-2xl bg-white p-5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.35)] ring-1 ring-zinc-100">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-zinc-800">{APP_NAME}</p>
        <p className="text-xs text-zinc-500">Wallet access is required for all actions.</p>
      </div>
      {!isConnected ? (
        <button
          type="button"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          onClick={() => {
            void onConnect();
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <button
          type="button"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          onClick={onDisconnect}
        >
          Disconnect
        </button>
      )}
    </div>

    {isConnected && address && (
      <div className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700">Connected: {shortAddress(address)}</div>
    )}

    {isConnected && !isCorrectNetwork && (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <p className="font-medium">Please switch to GenLayer Studio network</p>
        <p className="mt-1 text-xs">Automatic switch will be attempted first. If your wallet blocks it, add/select GenLayer Studio manually.</p>
        <button
          type="button"
          className="mt-3 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSwitchingNetwork}
          onClick={() => {
            void onSwitchNetwork();
          }}
        >
          {isSwitchingNetwork ? 'Switching...' : 'Switch Network'}
        </button>
      </div>
    )}

    {error && <p className="text-xs text-rose-600">{error}</p>}
  </section>
);
