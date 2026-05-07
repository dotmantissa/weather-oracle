import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeatherOracle } from './useWeatherOracle';

const fetchMock = vi.fn();
const getMock = vi.fn();

vi.mock('../lib/genlayerClient', () => ({
  callFetchTemp: (...args: unknown[]) => fetchMock(...args),
  callGetLastTemp: (...args: unknown[]) => getMock(...args),
}));

describe('useWeatherOracle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('blocks when wallet is disconnected', async () => {
    const { result } = renderHook(() => useWeatherOracle({ canInteract: false, isConnected: false, isCorrectNetwork: false }));

    await act(async () => {
      await result.current.fetchWeather();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.message).toContain('Connect wallet');
  });

  it('handles successful flow and stores temp', async () => {
    fetchMock.mockResolvedValue({ txHash: '0x123' });
    getMock.mockResolvedValue(28);

    const { result } = renderHook(() => useWeatherOracle({ canInteract: true, isConnected: true, isCorrectNetwork: true }));

    act(() => result.current.setCity('Lagos'));
    await act(async () => {
      await result.current.fetchWeather();
    });

    expect(fetchMock).toHaveBeenCalledWith('Lagos');
    expect(getMock).toHaveBeenCalledWith('Lagos');
    expect(result.current.status).toBe('success');
    expect(result.current.temperature).toBe(28);
  });

  it('handles -999 as invalid city data', async () => {
    fetchMock.mockResolvedValue({ txHash: '0x123' });
    getMock.mockResolvedValue(-999);

    const { result } = renderHook(() => useWeatherOracle({ canInteract: true, isConnected: true, isCorrectNetwork: true }));

    act(() => result.current.setCity('invalid-city'));
    await act(async () => {
      await result.current.fetchWeather();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.message).toContain('No valid weather data');
  });
});
