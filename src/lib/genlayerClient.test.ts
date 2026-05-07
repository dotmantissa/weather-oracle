import { beforeEach, describe, expect, it, vi } from 'vitest';
import { callFetchTemp, callGetLastTemp } from './genlayerClient';

const write = vi.fn();
const read = vi.fn();
const waitForTransaction = vi.fn();

vi.mock('./config', () => ({
  WEATHER_ORACLE_ADDRESS: '0xabc123',
}));

describe('genlayerClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as Window & { genlayer: unknown }).genlayer = {
      sdk: {
        createContract: vi.fn().mockReturnValue({ write, read }),
        waitForTransaction,
      },
    };
  });

  it('calls fetch_temp and waits for confirmation', async () => {
    write.mockResolvedValue({ hash: '0xtx' });
    waitForTransaction.mockResolvedValue(undefined);

    const result = await callFetchTemp('Lagos');

    expect(write).toHaveBeenCalledWith('fetch_temp', ['Lagos']);
    expect(waitForTransaction).toHaveBeenCalledWith('0xtx');
    expect(result).toEqual({ txHash: '0xtx' });
  });

  it('retries get_last_temp after failure', async () => {
    read.mockRejectedValueOnce(new Error('temporary'));
    read.mockResolvedValueOnce(22);

    const result = await callGetLastTemp('Paris', { retries: 2, retryDelayMs: 1 });

    expect(read).toHaveBeenCalledTimes(2);
    expect(result).toBe(22);
  });

  it('throws clear error when sdk is unavailable', async () => {
    (window as Window & { genlayer?: unknown }).genlayer = undefined;

    await expect(callFetchTemp('Berlin')).rejects.toThrow('GenLayer SDK not found');
  });
});
