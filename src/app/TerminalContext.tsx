import { createContext, useContext } from 'react';
import type { TerminalController } from './useTerminalController';

export const TerminalContext = createContext<TerminalController | null>(null);

export function useTerminal(): TerminalController {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error('useTerminal must be used inside <TerminalContext.Provider>');
  return ctx;
}
