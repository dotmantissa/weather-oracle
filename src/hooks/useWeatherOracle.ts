import { useCallback, useEffect, useMemo, useState } from 'react';
import { callFetchTemp, callGetLastTemp } from '../lib/genlayerClient';
import type { WeatherStatus } from '../lib/types';

const LAST_CITY_KEY = 'weather_oracle_last_city';

type UseWeatherOracleParams = {
  canInteract: boolean;
  isConnected: boolean;
  isCorrectNetwork: boolean;
};

export const useWeatherOracle = ({ canInteract, isConnected, isCorrectNetwork }: UseWeatherOracleParams) => {
  const [city, setCity] = useState<string>(() => localStorage.getItem(LAST_CITY_KEY) ?? '');
  const [temperature, setTemperature] = useState<number | null>(null);
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [message, setMessage] = useState<string>('Enter a city to fetch on-chain weather.');
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(LAST_CITY_KEY, city);
  }, [city]);

  const fetchWeather = useCallback(async () => {
    const normalizedCity = city.trim();

    if (!isConnected) {
      setStatus('error');
      setMessage('Connect wallet to continue.');
      return;
    }

    if (!isCorrectNetwork) {
      setStatus('error');
      setMessage('Please switch to GenLayer Studio network.');
      return;
    }

    if (!normalizedCity) {
      setStatus('error');
      setMessage('City is required.');
      return;
    }

    if (!canInteract) {
      setStatus('error');
      setMessage('App is locked until wallet/network requirements are met.');
      return;
    }

    try {
      setStatus('fetching');
      setMessage('Submitting transaction and waiting for confirmation...');
      setTemperature(null);
      setTxHash(null);

      const { txHash: hash } = await callFetchTemp(normalizedCity);
      setTxHash(hash);
      setMessage('Transaction confirmed. Reading final temperature...');

      const value = await callGetLastTemp(normalizedCity);
      if (value === -999) {
        setStatus('error');
        setMessage('No valid weather data found for this city yet. Try again shortly.');
        setTemperature(null);
        return;
      }

      setStatus('success');
      setTemperature(value);
      setMessage(`Latest weather for ${normalizedCity} loaded successfully.`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Weather request failed.');
      setTemperature(null);
    }
  }, [canInteract, city, isConnected, isCorrectNetwork]);

  const resetStatus = useCallback(() => {
    setStatus('idle');
    setMessage('Enter a city to fetch on-chain weather.');
  }, []);

  return useMemo(
    () => ({ city, setCity, temperature, status, message, txHash, fetchWeather, resetStatus }),
    [city, fetchWeather, message, resetStatus, status, temperature, txHash],
  );
};
