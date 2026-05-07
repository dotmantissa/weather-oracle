export const APP_NAME = 'WeatherOracle';
export const GENLAYER_STUDIO_CHAIN_ID = import.meta.env.VITE_GENLAYER_STUDIO_CHAIN_ID ?? '0x3e9';
export const GENLAYER_STUDIO_CHAIN_ID_DECIMAL = Number.parseInt(GENLAYER_STUDIO_CHAIN_ID, 16);

export const GENLAYER_STUDIO_NETWORK_PARAMS = {
  chainId: GENLAYER_STUDIO_CHAIN_ID,
  chainName: import.meta.env.VITE_GENLAYER_STUDIO_CHAIN_NAME ?? 'GenLayer Studio',
  nativeCurrency: {
    name: import.meta.env.VITE_GENLAYER_NATIVE_CURRENCY_NAME ?? 'GEN',
    symbol: import.meta.env.VITE_GENLAYER_NATIVE_CURRENCY_SYMBOL ?? 'GEN',
    decimals: Number.parseInt(import.meta.env.VITE_GENLAYER_NATIVE_CURRENCY_DECIMALS ?? '18', 10),
  },
  rpcUrls: [import.meta.env.VITE_GENLAYER_RPC_URL ?? 'http://127.0.0.1:4000'],
  blockExplorerUrls: [import.meta.env.VITE_GENLAYER_EXPLORER_URL ?? ''],
};

export const WEATHER_ORACLE_ADDRESS = import.meta.env.VITE_WEATHER_ORACLE_ADDRESS ?? '';
export const DEFAULT_POLL_INTERVAL_MS = 2000;
export const DEFAULT_MAX_POLL_ATTEMPTS = 20;
