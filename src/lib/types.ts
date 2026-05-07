export type WeatherStatus = 'idle' | 'fetching' | 'success' | 'error';

export type WalletState = {
  address: string | null;
  isConnected: boolean;
  chainId: string | null;
  isCorrectNetwork: boolean;
  isSwitchingNetwork: boolean;
  error: string | null;
};

export type FetchResult = {
  txHash: string;
};
