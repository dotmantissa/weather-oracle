import { WEATHER_ORACLE_ADDRESS } from './config';
import type { FetchResult } from './types';

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

type GenLayerContract = {
  write: (method: string, args: unknown[]) => Promise<{ hash: string }>;
  read: (method: string, args: unknown[]) => Promise<unknown>;
};

type GenLayerSdk = {
  createContract: (address: string, abi: unknown[]) => GenLayerContract;
  waitForTransaction: (txHash: string) => Promise<void>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    genlayer?: {
      sdk: GenLayerSdk;
    };
  }
}

const weatherOracleAbi = [
  { name: 'fetch_temp', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'city', type: 'string' }], outputs: [] },
  { name: 'get_last_temp', type: 'function', stateMutability: 'view', inputs: [{ name: 'city', type: 'string' }], outputs: [{ name: '', type: 'int256' }] },
];

const getSdk = (): GenLayerSdk => {
  const sdk = window.genlayer?.sdk;
  if (!sdk) {
    throw new Error('GenLayer SDK not found. Make sure GenLayer Studio wallet bridge is enabled.');
  }
  return sdk;
};

const getContract = (): GenLayerContract => {
  if (!WEATHER_ORACLE_ADDRESS) {
    throw new Error('WeatherOracle contract address is missing. Set VITE_WEATHER_ORACLE_ADDRESS.');
  }
  return getSdk().createContract(WEATHER_ORACLE_ADDRESS, weatherOracleAbi);
};

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const callFetchTemp = async (
  city: string,
  options: { retries?: number; retryDelayMs?: number } = {},
): Promise<FetchResult> => {
  const retries = options.retries ?? 2;
  const retryDelayMs = options.retryDelayMs ?? 1200;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const contract = getContract();
      const tx = await contract.write('fetch_temp', [city]);
      await getSdk().waitForTransaction(tx.hash);
      return { txHash: tx.hash };
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(retryDelayMs);
      }
    }
  }

  throw new Error(lastError instanceof Error ? lastError.message : 'Failed to submit fetch_temp transaction.');
};

export const callGetLastTemp = async (
  city: string,
  options: { retries?: number; retryDelayMs?: number } = {},
): Promise<number> => {
  const retries = options.retries ?? 2;
  const retryDelayMs = options.retryDelayMs ?? 1000;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const contract = getContract();
      const value = await contract.read('get_last_temp', [city]);
      return Number(value);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(retryDelayMs);
      }
    }
  }

  throw new Error(lastError instanceof Error ? lastError.message : 'Failed to read get_last_temp from contract.');
};
