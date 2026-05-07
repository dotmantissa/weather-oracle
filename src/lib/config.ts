export const APP_NAME = 'WeatherOracle';

export const GENLAYER_STUDIO_CHAIN_ID_HEX = (import.meta.env.VITE_GENLAYER_STUDIO_CHAIN_ID ?? '0xF22F').toLowerCase();
export const GENLAYER_STUDIO_CHAIN_ID = Number.parseInt(GENLAYER_STUDIO_CHAIN_ID_HEX, 16);

export const GENLAYER_STUDIO_NETWORK_PARAMS = {
  chainId: GENLAYER_STUDIO_CHAIN_ID_HEX,
  chainName: import.meta.env.VITE_GENLAYER_STUDIO_CHAIN_NAME ?? 'GenLayer Studio',
  nativeCurrency: {
    name: import.meta.env.VITE_GENLAYER_NATIVE_CURRENCY_NAME ?? 'GEN',
    symbol: import.meta.env.VITE_GENLAYER_NATIVE_CURRENCY_SYMBOL ?? 'GEN',
    decimals: Number.parseInt(import.meta.env.VITE_GENLAYER_NATIVE_CURRENCY_DECIMALS ?? '18', 10),
  },
  rpcUrls: [import.meta.env.VITE_GENLAYER_RPC_URL ?? 'http://127.0.0.1:4000/api'],
  blockExplorerUrls: [import.meta.env.VITE_GENLAYER_EXPLORER_URL ?? ''],
};

export const WEATHER_ORACLE_ADDRESS = import.meta.env.VITE_WEATHER_ORACLE_ADDRESS ?? '';

export const TX_POLL_INTERVAL = Number.parseInt(import.meta.env.VITE_TX_POLL_INTERVAL ?? '3000', 10);
export const TX_POLL_RETRIES = Number.parseInt(import.meta.env.VITE_TX_POLL_RETRIES ?? '120', 10);
