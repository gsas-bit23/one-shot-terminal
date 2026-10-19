import { Zap, Settings, Star, Wallet } from 'lucide-react';
import { DemoBadge } from '../components/ui/DemoBadge';
import { formatCompactUsd } from '../lib/marketData';
import { DEMO_NOTES } from '../app/types';
import { useTerminal } from '../app/TerminalContext';

export function SubHeader() {
  const {
    activeTab,
    setActiveTab,
    tokens,
    selectedTokenAddress,
    watchlistAddresses,
    paperMode,
    setSecurityModalOpen,
    instantTradeOpen,
    setInstantTradeOpen,
    subWallets,
    openTokenInTerminal,
    activeEthBalanceNum,
  } = useTerminal();
  return (
    <>
      {/* Demo data notice: every hub below renders simulated data unless stated otherwise */}
      <div className="px-3 py-1 border-b border-amber-400/20 bg-amber-400/[0.04] flex items-center gap-2 text-[11px] text-amber-200/80 shrink-0">
        <DemoBadge />
        <span>
          {DEMO_NOTES[activeTab] ??
            'Market data on this screen is simulated for demo purposes. Not financial data.'}
        </span>
        {paperMode && <DemoBadge label="Paper mode" className="ml-auto" />}
      </div>

      {/* =====================================================================
          2. SECONDARY WATCHLIST & QUICK-TAPE SUB-HEADER (`full_terminal.webp`)
      ===================================================================== */}
      <div className="h-7 px-3 border-b border-[#161823] bg-[#080A10] flex items-center justify-between text-[11px] shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSecurityModalOpen(true)}
            className="text-[#6B7280] hover:text-white p-0.5 flex items-center gap-1"
            title="Zero-Trust Security Settings"
          >
            <Settings className="w-3 h-3" />
          </button>
          <button className="text-[#F59E0B] p-0.5" title="Favorite Tokens">
            <Star className="w-3 h-3 fill-[#F59E0B]" />
          </button>
          <div className="h-3 w-[1px] bg-[#161823]" />

          {tokens
            .filter((t) => watchlistAddresses.includes(t.address))
            .map((t) => (
              <button
                key={t.address}
                onClick={() => openTokenInTerminal(t)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#121521] transition whitespace-nowrap ${
                  selectedTokenAddress === t.address && activeTab === 'terminal'
                    ? 'bg-[#121521] border border-[#22273B]'
                    : ''
                }`}
              >
                <span className="font-semibold text-[#D1D5DB]">{t.symbol}</span>
                <span className="font-mono-tabular text-[#8A91A6]">
                  {formatCompactUsd(t.marketCapUsd)}
                </span>
                <span
                  className={`font-mono-tabular font-semibold ${
                    t.change1h >= 0 ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                  }`}
                >
                  {t.change1h >= 0 ? '+' : ''}
                  {t.change1h}%
                </span>
              </button>
            ))}
        </div>

        {/* Right side of sub-header: Active Multi-Wallet & Instant Trade Hotkey toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setInstantTradeOpen(!instantTradeOpen)}
            className={`px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-semibold transition border ${
              instantTradeOpen
                ? 'bg-[#526FFF]/20 text-[#526FFF] border-[#526FFF]/40'
                : 'bg-[#10131E] text-[#9CA3AF] border-[#1E2233] hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 text-[#526FFF]" />
            <span>Instant Trade (Hotkeys)</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className="px-2 py-0.5 rounded bg-[#10131E] border border-[#1E2233] flex items-center gap-1.5 text-[11px] text-[#D1D5DB] font-mono-tabular"
          >
            <Wallet className="w-3 h-3 text-[#526FFF]" />
            <span>{subWallets.length} Wallets</span>
            <span className="text-[#2CE59B] font-semibold">
              {activeEthBalanceNum.toFixed(3)} ETH
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
