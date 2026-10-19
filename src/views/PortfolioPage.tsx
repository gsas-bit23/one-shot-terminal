import { Wallet } from 'lucide-react';
import { PortfolioView } from '../components/HubViews';
import { formatTokenPrice } from '../lib/marketData';
import { useTerminal } from '../app/TerminalContext';

export function PortfolioPage() {
  const {
    tokens,
    setSharePnlData,
    subWallets,
    setSubWallets,
    tokenHoldings,
    tradeHistory,
    ethPriceUsd,
    triggerToast,
    handleExecuteSpotSwap,
    openTokenInTerminal,
    activeEthBalanceNum,
  } = useTerminal();
  return (
    <>
      <PortfolioView
        ethBalance={activeEthBalanceNum}
        ethPriceUsd={ethPriceUsd}
        tokenHoldings={tokenHoldings}
        tokens={tokens}
        trades={tradeHistory}
        subWallets={subWallets}
        onCreateSubWallet={(name) =>
          setSubWallets((prev) => [
            ...prev,
            {
              id: `sw-${Date.now()}`,
              name,
              address: `0x${Math.random().toString(16).slice(2, 10)}92A87cD3190f88721bC00192837465Fe`,
              balanceEth: 0.25,
              balanceUsdc: 100,
              holdingsCount: 0,
              isPrimary: false,
              selectedForMultiBuy: true,
              tag: 'Sub-Wallet',
            },
          ])
        }
        onDistributeEth={(amt) =>
          triggerToast(
            'Multi-Wallet Splitter Executed',
            `Distributed ${amt} ETH across ${subWallets.length} sub-wallets with 0% fee`,
            'success',
          )
        }
        onSelectToken={openTokenInTerminal}
        onQuickSellFull={(tok) => handleExecuteSpotSwap(tok, 'SELL', '0.05', 100)}
        onOpenSharePnl={(tok) =>
          setSharePnlData({
            symbol: tok.symbol,
            name: tok.name,
            pnlPct: 142.8,
            pnlUsd: 384.2,
            investedUsd: 269.0,
            currentValueUsd: 653.2,
            entryPrice: formatTokenPrice(tok.priceUsd * 0.65),
            markPrice: formatTokenPrice(tok.priceUsd),
          })
        }
      />
    </>
  );
}
