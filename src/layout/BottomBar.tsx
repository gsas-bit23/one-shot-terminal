import { SlidersHorizontal, Activity, Wallet, Globe } from 'lucide-react';
import { formatTokenPrice } from '../lib/marketData';
import { useTerminal } from '../app/TerminalContext';

export function BottomBar() {
  const {
    setActiveTab,
    paperMode,
    setPaperMode,
    blockNumber,
    gasGwei,
    rpcLatencyMs,
    activePresetId,
    setActivePresetId,
    setSecurityModalOpen,
    walletTrackerOpen,
    setWalletTrackerOpen,
    twitterMonitorOpen,
    setTwitterMonitorOpen,
    setSharePnlData,
    subWallets,
    selectedToken,
    ethPriceUsd,
    activeEthBalanceNum,
  } = useTerminal();
  return (
    <>
      {/* =====================================================================
          4. BOTTOM PERSISTENT STATUS BAR (`bottom_bar.png` & `full_terminal.webp`)
      ===================================================================== */}
      <footer className="h-7 px-3 border-t border-[#161823] bg-[#06070B] flex items-center justify-between text-[11px] text-[#8A91A6] shrink-0 z-30">
        {/* Left: PRESET 1 + Wallet Counter + Wallet Tracker + Twitter + Pulse + PnL + ETH Price */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              const next: Record<1 | 2 | 3, 1 | 2 | 3> = { 1: 2, 2: 3, 3: 1 };
              setActivePresetId(next[activePresetId]);
            }}
            className="px-2 py-0.5 rounded bg-[#526FFF]/20 text-[#526FFF] font-bold text-[10px] flex items-center gap-1"
          >
            <SlidersHorizontal className="w-2.5 h-2.5" />
            <span>PRESET {activePresetId}</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className="px-2 py-0.5 rounded bg-[#0D0F17] border border-[#1B1E2B] text-white font-mono-tabular text-[10px] flex items-center gap-1"
          >
            <Wallet className="w-2.5 h-2.5 text-[#526FFF]" />
            <span>{subWallets.length}</span>
            <span className="text-[#2CE59B]">{activeEthBalanceNum.toFixed(2)}</span>
          </button>

          <div className="h-3 w-[1px] bg-[#161823]" />

          <button
            onClick={() => setWalletTrackerOpen(!walletTrackerOpen)}
            className={`flex items-center gap-1 hover:text-white transition ${
              walletTrackerOpen ? 'text-white font-semibold' : ''
            }`}
          >
            <Wallet className="w-3 h-3" />
            <span>Wallet</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6A]" />
          </button>

          <button
            onClick={() => setTwitterMonitorOpen(!twitterMonitorOpen)}
            className={`flex items-center gap-1 hover:text-white transition ${
              twitterMonitorOpen ? 'text-white font-semibold' : ''
            }`}
          >
            <span>𝕏 Twitter</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6A]" />
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <Globe className="w-3 h-3" />
            <span>Discover</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6A]" />
          </button>

          <button
            onClick={() => setActiveTab('pulse')}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <Activity className="w-3 h-3" />
            <span>Pulse</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6A]" />
          </button>

          <button
            onClick={() =>
              setSharePnlData({
                symbol: selectedToken.symbol,
                name: selectedToken.name,
                pnlPct: 167.4,
                pnlUsd: 418.5,
                investedUsd: 250,
                currentValueUsd: 668.5,
                entryPrice: formatTokenPrice(selectedToken.priceUsd * 0.6),
                markPrice: formatTokenPrice(selectedToken.priceUsd),
              })
            }
            className="flex items-center gap-1 hover:text-white transition"
          >
            <span>PnL</span>
          </button>

          <div className="h-3 w-[1px] bg-[#161823]" />

          <span className="font-mono-tabular text-[#2CE59B] font-semibold">
            ETH ${ethPriceUsd.toLocaleString()}
          </span>
        </div>

        {/* Right: Connection is stable + Block # + GLOBAL + Docs */}
        <div className="flex items-center gap-3 shrink-0 font-mono-tabular">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0C1D17] border border-[#193B2D] text-[#2CE59B] text-[10px] font-sans font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2CE59B]" />
            <span>Connection is stable</span>
          </div>

          <span className="hidden md:inline text-[10px] text-[#8A91A6]">
            Block #{blockNumber.toLocaleString()} • {gasGwei} Gwei • {rpcLatencyMs}ms
          </span>

          <button
            onClick={() => setPaperMode(!paperMode)}
            className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
              !paperMode
                ? 'bg-[#2CE59B]/15 text-[#2CE59B] border-[#2CE59B]/30'
                : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
            }`}
            title="Toggle between Live Robinhood Chain Testnet (46630) and Instant Paper Sim"
          >
            {!paperMode ? 'ON-CHAIN 46630' : 'SIM MODE'}
          </button>

          <span className="text-[10px] text-[#D1D5DB] font-sans">GLOBAL ▾</span>

          <button
            onClick={() => setSecurityModalOpen(true)}
            className="text-[#8A91A6] hover:text-white font-sans text-[11px]"
          >
            Docs & Audit
          </button>
        </div>
      </footer>
    </>
  );
}
