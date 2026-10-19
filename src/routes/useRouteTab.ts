import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTerminalStore } from '../store/terminalStore';
import { pathForTab, tabForPath, type PrimaryTab } from './tabs';

/** Drop-in replacement for the old `useState<PrimaryTab>` that is backed by the URL. */
export function useRouteTab(): {
  activeTab: PrimaryTab;
  setActiveTab: (tab: PrimaryTab) => void;
} {
  const location = useLocation();
  const navigate = useNavigate();
  const { addr } = useParams();
  const setSelected = useTerminalStore((s) => s.setSelectedTokenAddress);

  useEffect(() => {
    if (addr) setSelected(addr);
  }, [addr, setSelected]);

  const resolved = tabForPath(location.pathname);
  useEffect(() => {
    if (!resolved) navigate('/pulse', { replace: true });
  }, [resolved, navigate]);
  const activeTab = resolved ?? 'pulse';
  const setActiveTab = useCallback(
    (tab: PrimaryTab) => {
      // Read synchronously so a setSelectedTokenAddress() in the same handler is respected.
      navigate(pathForTab(tab, useTerminalStore.getState().selectedTokenAddress));
    },
    [navigate]
  );
  return { activeTab, setActiveTab };
}
