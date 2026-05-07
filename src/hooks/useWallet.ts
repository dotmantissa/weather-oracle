import { BrowserProvider } from 'ethers';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GENLAYER_STUDIO_CHAIN_ID,
  GENLAYER_STUDIO_CHAIN_ID_HEX,
  GENLAYER_STUDIO_NETWORK_PARAMS,
} from '../lib/config';
import type { WalletState } from '../lib/types';

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

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

  const chainChangedRef = useRef<((chainId: unknown) => void) | null>(null);
  const accountsChangedRef = useRef<((accounts: unknown) => void) | null>(null);

  const removeListeners = useCallback(() => {
    const provider = getProvider();
    if (!provider?.removeListener) {
      return;
    }

    if (chainChangedRef.current) {
      provider.removeListener('chainChanged', chainChangedRef.current);
      chainChangedRef.current = null;
    }

    if (accountsChangedRef.current) {
      provider.removeListener('accountsChanged', accountsChangedRef.current);
      accountsChangedRef.current = null;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    removeListeners();
    setState({
      address: null,
      isConnected: false,
      chainId: null,
      isCorrectNetwork: false,
      isSwitchingNetwork: false,
      error: null,
    });
  }, [removeListeners]);

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
        isCorrectNetwork: Number.parseInt(chainId, 16) === GENLAYER_STUDIO_CHAIN_ID,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: error instanceof Error ? error.message : 'Wallet state error.' }));
    }
  }, []);

  const attachListeners = useCallback(() => {
    const provider = getProvider();
    if (!provider?.on) {
      return;
    }

    const onChainChanged = (nextChainId: unknown) => {
      const chainId = typeof nextChainId === 'string' ? nextChainId : null;
      const isCorrect = chainId ? Number.parseInt(chainId, 16) === GENLAYER_STUDIO_CHAIN_ID : false;

      if (!isCorrect) {
        disconnectWallet();
        setState((prev) => ({ ...prev, error: 'Please switch to GenLayer Studio network.' }));
        return;
      }

      void hydrate();
    };

    const onAccountsChanged = (accountsRaw: unknown) => {
      const accounts = Array.isArray(accountsRaw) ? (accountsRaw as string[]) : [];
      if (accounts.length === 0) {
        disconnectWallet();
        return;
      }
      void hydrate();
    };

    removeListeners();
    chainChangedRef.current = onChainChanged;
    accountsChangedRef.current = onAccountsChanged;
    provider.on('chainChanged', onChainChanged);
    provider.on('accountsChanged', onAccountsChanged);
  }, [disconnectWallet, hydrate, removeListeners]);

  const connectWallet = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setState((prev) => ({ ...prev, error: 'No wallet provider found.' }));
      return;
    }

    try {
      const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
      const address = accounts[0] ?? null;
      if (!address) {
        setState((prev) => ({ ...prev, error: 'No wallet account selected.' }));
        return;
      }

      let chainId = (await provider.request({ method: 'eth_chainId' })) as string;
      if (Number.parseInt(chainId, 16) !== GENLAYER_STUDIO_CHAIN_ID) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: GENLAYER_STUDIO_CHAIN_ID_HEX }],
          });
        } catch (switchError) {
          const err = switchError as { code?: number };
          if (err.code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [GENLAYER_STUDIO_NETWORK_PARAMS],
            });
          } else {
            setState((prev) => ({ ...prev, error: 'Switch to GenLayer Studio network to continue.' }));
            return;
          }
        }
        chainId = (await provider.request({ method: 'eth_chainId' })) as string;
      }

      const browserProvider = new BrowserProvider(provider);
      const network = await browserProvider.getNetwork();
      if (Number(network.chainId) !== GENLAYER_STUDIO_CHAIN_ID) {
        disconnectWallet();
        setState((prev) => ({ ...prev, error: 'Wrong network. GenLayer Studio required.' }));
        return;
      }

      setState((prev) => ({
        ...prev,
        address,
        chainId,
        isConnected: true,
        isCorrectNetwork: true,
        error: null,
      }));

      attachListeners();
    } catch (error) {
      const code = (error as { code?: number }).code;
      const message = code === 4001 ? 'Wallet request rejected by user.' : error instanceof Error ? error.message : 'Failed to connect wallet.';
      setState((prev) => ({ ...prev, error: message }));
    }
  }, [attachListeners, disconnectWallet]);

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
        params: [{ chainId: GENLAYER_STUDIO_CHAIN_ID_HEX }],
      });
      await hydrate();
    } catch (switchError) {
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [GENLAYER_STUDIO_NETWORK_PARAMS],
        });
        await hydrate();
      } else {
        setState((prev) => ({ ...prev, error: 'Unable to switch network automatically. Please switch manually in wallet.' }));
      }
    } finally {
      setState((prev) => ({ ...prev, isSwitchingNetwork: false }));
    }
  }, [hydrate]);

  useEffect(() => {
    void hydrate();
    return () => {
      removeListeners();
    };
  }, [hydrate, removeListeners]);

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
