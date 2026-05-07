import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';
import { TX_POLL_INTERVAL, TX_POLL_RETRIES, WEATHER_ORACLE_ADDRESS } from './config';
import type { FetchResult } from './types';

type HexAddress = `0x${string}`;

const asHexAddress = (value: string, label: string): HexAddress => {
  if (!value || !value.startsWith('0x')) {
    throw new Error(`${label} must be a valid 0x-prefixed address.`);
  }
  return value as HexAddress;
};

const getClient = (accountAddress: string) => {
  if (!WEATHER_ORACLE_ADDRESS) {
    throw new Error('WeatherOracle contract address is missing. Set VITE_WEATHER_ORACLE_ADDRESS.');
  }

  return createClient({
    chain: studionet,
    account: asHexAddress(accountAddress, 'Wallet address'),
  });
};

export const callFetchTemp = async (
  accountAddress: string,
  city: string,
  options: { retries?: number } = {},
): Promise<FetchResult> => {
  const retries = options.retries ?? 1;
  let lastError: unknown;
  const contractAddress = asHexAddress(WEATHER_ORACLE_ADDRESS, 'Contract address');

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const client = getClient(accountAddress);
      const txHash = await client.writeContract({
        address: contractAddress,
        functionName: 'fetch_temp',
        args: [city],
        value: BigInt(0),
      });

      const receipt = await client.waitForTransactionReceipt({
        hash: txHash,
        status: TransactionStatus.FINALIZED,
        retries: TX_POLL_RETRIES,
        interval: TX_POLL_INTERVAL,
      });

      if (!receipt) {
        throw new Error('Transaction did not finalize within the timeout window.');
      }

      return { txHash };
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(lastError instanceof Error ? lastError.message : 'Failed to submit fetch_temp transaction.');
};

export const callGetLastTemp = async (accountAddress: string, city: string): Promise<number> => {
  const client = getClient(accountAddress);
  const contractAddress = asHexAddress(WEATHER_ORACLE_ADDRESS, 'Contract address');

  const value = await client.readContract({
    address: contractAddress,
    functionName: 'get_last_temp',
    args: [city],
  });

  return Number(value);
};
