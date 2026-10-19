import { VisionView } from '../components/HubViews';
import { useTerminal } from '../app/TerminalContext';

export function VisionPage() {
  const {
    tokens,
    quickBuyAmountEth,
    setWalletTrackerOpen,
    trackedWallets,
    setTrackedWallets,
    handleExecuteSpotSwap,
    openTokenInTerminal,
  } = useTerminal();
  return (
    <>
      <VisionView
        wallets={trackedWallets}
        onTrackWallet={() => setWalletTrackerOpen(true)}
        tokens={tokens}
        onToggleCopyTrade={(addr) =>
          setTrackedWallets((prev) =>
            prev.map((w) =>
              w.address === addr ? { ...w, copyTradeEnabled: !w.copyTradeEnabled } : w,
            ),
          )
        }
        onSelectToken={openTokenInTerminal}
        onQuickBuy={(tok, e) => {
          e.stopPropagation();
          handleExecuteSpotSwap(tok, 'BUY', quickBuyAmountEth);
        }}
      />
    </>
  );
}
