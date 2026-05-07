import { beforeEach, describe, expect, it, vi } from 'vitest';
import { callFetchTemp, callGetLastTemp } from './genlayerClient';

const writeContract = vi.fn();
const waitForTransactionReceipt = vi.fn();
const readContract = vi.fn();

vi.mock('./config', () => ({
  WEATHER_ORACLE_ADDRESS: '0xabc123',
  TX_POLL_INTERVAL: 10,
  TX_POLL_RETRIES: 3,
}));

vi.mock('genlayer-js/chains', () => ({
  studionet: { id: 61999 },
}));

vi.mock('genlayer-js/types', () => ({
  TransactionStatus: { FINALIZED: 'FINALIZED' },
}));

vi.mock('genlayer-js', () => ({
  createClient: vi.fn().mockImplementation(() => ({
    writeContract,
    waitForTransactionReceipt,
    readContract,
  })),
}));

describe('genlayerClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls fetch_temp and waits for finalized status', async () => {
    writeContract.mockResolvedValue('0xtx');
    waitForTransactionReceipt.mockResolvedValue({ status: 'FINALIZED' });

    const result = await callFetchTemp('0xuser', 'Lagos');

    expect(writeContract).toHaveBeenCalled();
    expect(waitForTransactionReceipt).toHaveBeenCalled();
    expect(result).toEqual({ txHash: '0xtx' });
  });

  it('throws clear error when receipt times out', async () => {
    writeContract.mockResolvedValue('0xtx');
    waitForTransactionReceipt.mockResolvedValue(null);

    await expect(callFetchTemp('0xuser', 'Paris')).rejects.toThrow('did not finalize');
  });

  it('reads get_last_temp and returns number', async () => {
    readContract.mockResolvedValue(17);

    const value = await callGetLastTemp('0xuser', 'Paris');

    expect(readContract).toHaveBeenCalled();
    expect(value).toBe(17);
  });
});
