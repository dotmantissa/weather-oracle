import { useCallback, useEffect, useMemo, useState } from 'react';
import { GENLAYER_STUDIO_CHAIN_ID, GENLAYER_STUDIO_NETWORK_PARAMS } from '../lib/config';
import type { WalletState } from '../lib/types';

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

const getProvider = (): EthereumProvider | null => window.ethereum ?? null;

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    isCorrectNetwork: false,
    isSwitchingNetwork: false,
    error: null,
  });

  const hydrate = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setState((prev) => ({ ...prev, error: 'No wallet provider found.' }));
      return;
    }

    try {
      const [accounts, chainId] = await Promise.all([
        provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
        provider.request({ method: 'eth_chainId' }) as Promise<string>,
      ]);

      const address = accounts[0] ?? null;
      setState((prev) => ({
        ...prev,
        address,
        isConnected: Boolean(address),
        chainId,
        isCorrectNetwork: chainId?.toLowerCase() === GENLAYER_STUDIO_CHAIN_ID.toLowerCase(),
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error instanceof Error ? error.message : 'Wallet state error.' }));
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setState((prev) => ({ ...prev, error: 'No wallet provider found.' }));
      return;
    }

    try {
      const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
      const chainId = (await provider.request({ method: 'eth_chainId' })) as string;
      const address = accounts[0] ?? null;

      setState((prev) => ({
        ...prev,
        address,
        chainId,
        isConnected: Boolean(address),
        isCorrectNetwork: chainId.toLowerCase() === GENLAYER_STUDIO_CHAIN_ID.toLowerCase(),
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error instanceof Error ? error.message : 'Failed to connect wallet.' }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setState((prev) => ({
      ...prev,
      address: null,
      isConnected: false,
      error: null,
    }));
  }, []);

  const switchToStudioNetwork = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setState((prev) => ({ ...prev, error: 'No wallet provider found.' }));
      return;
    }

    setState((prev) => ({ ...prev, isSwitchingNetwork: true, error: null }));

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: GENLAYER_STUDIO_CHAIN_ID }],
      });
    } catch (switchError) {
      const error = switchError as { code?: number };
      if (error.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [GENLAYER_STUDIO_NETWORK_PARAMS],
        });
      } else {
        throw switchError;
      }
    } finally {
      const chainId = (await provider.request({ method: 'eth_chainId' })) as string;
      setState((prev) => ({
        ...prev,
        chainId,
        isCorrectNetwork: chainId.toLowerCase() === GENLAYER_STUDIO_CHAIN_ID.toLowerCase(),
        isSwitchingNetwork: false,
      }));
    }
  }, []);

  useEffect(() => {
    void hydrate();
    const provider = getProvider();
    if (!provider?.on || !provider.removeListener) {
      return;
    }

    const onAccountsChanged = (accounts: unknown) => {
      const parsed = Array.isArray(accounts) ? (accounts as string[]) : [];
      const address = parsed[0] ?? null;
      setState((prev) => ({ ...prev, address, isConnected: Boolean(address) }));
    };

    const onChainChanged = (chainId: unknown) => {
      const parsed = typeof chainId === 'string' ? chainId : null;
      setState((prev) => ({
        ...prev,
        chainId: parsed,
        isCorrectNetwork: parsed?.toLowerCase() === GENLAYER_STUDIO_CHAIN_ID.toLowerCase(),
      }));
    };

    provider.on('accountsChanged', onAccountsChanged);
    provider.on('chainChanged', onChainChanged);

    return () => {
      provider.removeListener?.('accountsChanged', onAccountsChanged);
      provider.removeListener?.('chainChanged', onChainChanged);
    };
  }, [hydrate]);

  return useMemo(
    () => ({
      ...state,
      connectWallet,
      disconnectWallet,
      switchToStudioNetwork,
    }),
    [connectWallet, disconnectWallet, state, switchToStudioNetwork],
  );
};
