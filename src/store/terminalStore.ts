import { create } from 'zustand';
import { INITIAL_TOKEN_MARKETS } from '../lib/marketData';

interface TerminalState {
  selectedTokenAddress: string;
  setSelectedTokenAddress: (addr: string) => void;
  paperMode: boolean;
  setPaperMode: (v: boolean | ((prev: boolean) => boolean)) => void;
}

/** Shared terminal state that must survive route changes. */
export const useTerminalStore = create<TerminalState>((set) => ({
  selectedTokenAddress: INITIAL_TOKEN_MARKETS[0]?.address ?? '',
  setSelectedTokenAddress: (addr) => set({ selectedTokenAddress: addr }),
  // Paper mode is ON by default: on-chain trades require an explicitly connected wallet.
  paperMode: true,
  setPaperMode: (v) =>
    set((s) => ({ paperMode: typeof v === 'function' ? v(s.paperMode) : v })),
}));
