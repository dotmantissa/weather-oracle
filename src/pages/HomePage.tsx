import { ResultCard } from '../components/ResultCard';
import { WalletPanel } from '../components/WalletPanel';
import { WeatherForm } from '../components/WeatherForm';
import { useWallet } from '../hooks/useWallet';
import { useWeatherOracle } from '../hooks/useWeatherOracle';

export const HomePage = () => {
  const wallet = useWallet();
  const canInteract = wallet.isConnected && wallet.isCorrectNetwork;

  const weather = useWeatherOracle({
    canInteract,
    isConnected: wallet.isConnected,
    isCorrectNetwork: wallet.isCorrectNetwork,
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f4f4f5_0%,_#ffffff_45%,_#fafafa_100%)] px-4 py-10">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <WalletPanel
          address={wallet.address}
          isConnected={wallet.isConnected}
          isCorrectNetwork={wallet.isCorrectNetwork}
          isSwitchingNetwork={wallet.isSwitchingNetwork}
          error={wallet.error}
          onConnect={wallet.connectWallet}
          onDisconnect={wallet.disconnectWallet}
          onSwitchNetwork={wallet.switchToStudioNetwork}
        />

        <section className="space-y-5 rounded-2xl bg-white p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-zinc-100">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">GenLayer Weather Oracle</h1>
            <p className="mt-1 text-sm text-zinc-500">Fetch live weather via nondeterministic execution and read the final consensus result on-chain.</p>
          </div>

          {!canInteract && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              Please switch to GenLayer Studio network
            </div>
          )}

          <WeatherForm
            city={weather.city}
            onCityChange={(nextCity) => {
              weather.setCity(nextCity);
              if (weather.status !== 'fetching') {
                weather.resetStatus();
              }
            }}
            onSubmit={weather.fetchWeather}
            disabled={!canInteract}
            isLoading={weather.status === 'fetching'}
          />

          <ResultCard
            city={weather.city}
            temperature={weather.temperature}
            status={weather.status}
            message={weather.message}
            txHash={weather.txHash}
          />
        </section>
      </div>
    </main>
  );
};
