import { Wallet } from 'lucide-react';
import {
  InstantTradeFloatingPanel,
  FloatingWalletTrackerModal,
  FloatingTwitterMonitorModal,
} from '../components/FloatingWidgets';
import { INITIAL_TOKEN_MARKETS } from '../lib/marketData';
import { useTerminal } from '../app/TerminalContext';

export function FloatingOverlays() {
  const {
    tokens,
    activePresetId,
    setActivePresetId,
    activePreset,
    quickBuyAmountEth,
    setSecurityModalOpen,
    instantTradeOpen,
    setInstantTradeOpen,
    walletTrackerOpen,
    setWalletTrackerOpen,
    twitterMonitorOpen,
    setTwitterMonitorOpen,
    trackedWallets,
    setTrackedWallets,
    tweets,
    setTweets,
    selectedToken,
    handleExecuteSpotSwap,
    openTokenInTerminal,
    currentHoldingTokens,
    currentHoldingUsd,
    activeEthBalanceNum,
  } = useTerminal();
  return (
    <>
      {/* ===================================================================
            FLOATING OVERLAYS (`Instant Trade`, `Wallet Tracker`, `Tweet Monitor`)
        =================================================================== */}
      <InstantTradeFloatingPanel
        open={instantTradeOpen}
        onClose={() => setInstantTradeOpen(false)}
        token={selectedToken}
        activePreset={activePresetId}
        onSelectPreset={setActivePresetId}
        presetConfig={activePreset}
        ethBalance={activeEthBalanceNum}
        tokenHoldingAmount={currentHoldingTokens}
        tokenHoldingUsd={currentHoldingUsd}
        onExecuteBuy={(ethAmt) => handleExecuteSpotSwap(selectedToken, 'BUY', ethAmt)}
        onExecuteSellPct={(pct) => handleExecuteSpotSwap(selectedToken, 'SELL', '0.05', pct)}
        onOpenPresetSettings={() => setSecurityModalOpen(true)}
      />

      <FloatingWalletTrackerModal
        open={walletTrackerOpen}
        onClose={() => setWalletTrackerOpen(false)}
        wallets={trackedWallets}
        onAddWallet={(emoji, label, address) =>
          setTrackedWallets((prev) => [
            {
              address,
              emoji,
              label,
              tag: 'Smart Whale',
              winRatePct: 74.5,
              pnl7dUsd: 14200,
              pnl7dPct: 88.4,
              trades7d: 31,
              copyTradeEnabled: true,
              lastAction: {
                side: 'BUY',
                symbol: 'FEATHER',
                tokenAddress: INITIAL_TOKEN_MARKETS[0].address,
                amountEth: 0.25,
                valueUsd: 650,
                marketCapUsd: 41800000,
                timeAgo: '1m',
              },
            },
            ...prev,
          ])
        }
        onRemoveWallet={(addr) =>
          setTrackedWallets((prev) => prev.filter((w) => w.address !== addr))
        }
        onToggleCopyTrade={(addr) =>
          setTrackedWallets((prev) =>
            prev.map((w) =>
              w.address === addr ? { ...w, copyTradeEnabled: !w.copyTradeEnabled } : w,
            ),
          )
        }
        quickBuyEth={quickBuyAmountEth}
        onQuickCopyBuy={(symbol, amtEth) => {
          const target = tokens.find((t) => t.symbol === symbol) || tokens[0];
          handleExecuteSpotSwap(target, 'BUY', amtEth);
        }}
      />

      <FloatingTwitterMonitorModal
        open={twitterMonitorOpen}
        onClose={() => setTwitterMonitorOpen(false)}
        tweets={tweets}
        onAddCustomTweetHandle={(handle) =>
          setTweets((prev) => [
            {
              id: `tw-${Date.now()}`,
              author: handle.replace('@', ''),
              handle: handle.startsWith('@') ? handle : `@${handle}`,
              avatarUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
              verified: true,
              timeAgo: 'now',
              timestamp: 'Live',
              text: `Tracking live Robinhood Chain alerts for ${handle} on One Shot Pro ($FEATHER)`,
              detectedTicker: 'FEATHER',
              category: 'KOL',
            },
            ...prev,
          ])
        }
        onQuickBuyDetectedToken={(sym) => {
          const target = tokens.find((t) => t.symbol === sym) || tokens[0];
          openTokenInTerminal(target);
          handleExecuteSpotSwap(target, 'BUY', quickBuyAmountEth);
        }}
      />
    </>
  );
}
