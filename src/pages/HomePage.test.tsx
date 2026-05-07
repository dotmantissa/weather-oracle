import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';

const walletMock = {
  address: null as string | null,
  isConnected: false,
  chainId: null as string | null,
  isCorrectNetwork: false,
  isSwitchingNetwork: false,
  error: null as string | null,
  connectWallet: vi.fn().mockResolvedValue(undefined),
  disconnectWallet: vi.fn(),
  switchToStudioNetwork: vi.fn().mockResolvedValue(undefined),
};

vi.mock('../hooks/useWallet', () => ({
  useWallet: () => walletMock,
}));

describe('HomePage', () => {
  beforeEach(() => {
    walletMock.address = null;
    walletMock.isConnected = false;
    walletMock.isCorrectNetwork = false;
    walletMock.error = null;
  });

  it('blocks interactions when network is incorrect', () => {
    render(<HomePage />);

    expect(screen.getByText('Please switch to GenLayer Studio network')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fetch Weather' })).toBeDisabled();
  });

  it('enables weather fetch when wallet is connected on correct network', async () => {
    walletMock.isConnected = true;
    walletMock.address = '0x1234567890abcdef1234567890abcdef12345678';
    walletMock.isCorrectNetwork = true;

    render(<HomePage />);

    const button = screen.getByRole('button', { name: 'Fetch Weather' });
    expect(button).toBeEnabled();

    await userEvent.type(screen.getByLabelText('City'), 'Lagos');
    expect(screen.getByDisplayValue('Lagos')).toBeInTheDocument();
  });
});
