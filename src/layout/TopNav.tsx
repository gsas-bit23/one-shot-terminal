import { Search, Bell, Star, Wallet, ChevronDown } from 'lucide-react';
import { OneShotLogo } from '../components/OneShotLogo';
import { useTerminal } from '../app/TerminalContext';

export function TopNav() {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    setSearchModalOpen,
    searchInputRef,
    walletAddress,
    setSecurityModalOpen,
    twitterMonitorOpen,
    setTwitterMonitorOpen,
    handleConnectWallet,
    activeEthBalanceNum,
  } = useTerminal();
  return (
    <>
      {/* =====================================================================
          1. TOP NAVIGATION BAR (`full_terminal.webp`, `explore.png`)
      ===================================================================== */}
      <header className="h-[50px] px-3 border-b border-[#161823] bg-[#06070B] flex items-center justify-between gap-2 shrink-0 z-30">
        {/* Left: Brand + 8 Primary Navigation Tabs */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => setActiveTab('pulse')}
            className="flex items-center gap-2 text-left group shrink-0"
          >
            <OneShotLogo className="w-7 h-7" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold tracking-tight text-[16px] text-white group-hover:text-[#526FFF] transition">
                ONE SHOT
              </span>
              <span className="text-[11px] font-medium text-[#8A91A6]">Pro</span>
            </div>
          </button>

          <nav className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'discover', label: 'Discover' },
                { id: 'pulse', label: 'Pulse' },
                { id: 'trackers', label: 'Trackers' },
                { id: 'perps', label: 'Perpetuals' },
                { id: 'yield', label: 'Yield' },
                { id: 'vision', label: 'Vision' },
                { id: 'portfolio', label: 'Portfolio' },
                { id: 'rewards', label: 'Rewards' },
              ] as const
            ).map((item) => {
              const isActive =
                activeTab === item.id || (activeTab === 'terminal' && item.id === 'discover');
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 py-1.5 rounded-md text-[13px] font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'text-[#526FFF] font-semibold bg-[#526FFF]/10'
                      : 'text-[#9CA3AF] hover:text-white hover:bg-[#10131D]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search (`/`) + Network Pill (`Robinhood`) + `Deposit` (`#526FFF`) + Watchlist/Bell/Wallet */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Trigger */}
          <div className="relative hidden md:flex items-center">
            <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchModalOpen(true)}
              placeholder="Search by token or LP contract"
              className="w-56 lg:w-64 h-8 pl-8 pr-7 rounded-full bg-[#0D0F17] border border-[#1B1E2B] text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#526FFF]"
            />
            <span className="absolute right-2.5 px-1.5 py-0.2 rounded bg-[#161926] border border-[#252A3D] text-[10px] text-[#8A91A6] font-mono-tabular">
              /
            </span>
          </div>

          {/* Network pill */}
          <button
            onClick={() => setSecurityModalOpen(true)}
            className="h-8 px-2.5 rounded-full bg-[#0D1412] border border-[#1E382D] flex items-center gap-1.5 text-xs font-semibold text-white hover:border-[#2CE59B]/60 transition"
            title="Testnet (Chain ID 46630): security details"
          >
            <span className="w-2 h-2 rounded-full bg-[#2CE59B] animate-pulse" />
            <span>Testnet</span>
            <ChevronDown className="w-3 h-3 text-[#8A91A6]" />
          </button>

          {/* Electric Blue `Deposit` / Connect Button */}
          <button
            onClick={handleConnectWallet}
            className="h-8 px-3.5 rounded-full bg-[#526FFF] hover:bg-[#425FEF] text-white font-semibold text-xs transition shadow-[0_0_15px_rgba(82,111,255,0.35)]"
          >
            {walletAddress ? 'Deposit' : 'Connect'}
          </button>

          {/* Star Watchlist */}
          <button
            onClick={() => setActiveTab('discover')}
            className="w-8 h-8 rounded-full bg-[#0D0F17] border border-[#1B1E2B] flex items-center justify-center text-[#9CA3AF] hover:text-white transition"
            title="Watchlist"
          >
            <Star className="w-3.5 h-3.5" />
          </button>

          {/* Bell Alerts */}
          <button
            onClick={() => setTwitterMonitorOpen(!twitterMonitorOpen)}
            className="w-8 h-8 rounded-full bg-[#0D0F17] border border-[#1B1E2B] flex items-center justify-center text-[#9CA3AF] hover:text-white transition relative"
            title="Live Narrative & Tweet Monitor"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#526FFF] absolute top-1.5 right-1.5" />
          </button>

          {/* Wallet Balance Pill (`full_terminal.webp` top right) */}
          <button
            onClick={() => setActiveTab('portfolio')}
            className="h-8 px-3 rounded-full bg-[#0D0F17] border border-[#1B1E2B] hover:border-[#2B3044] flex items-center gap-2 text-xs font-mono-tabular transition"
          >
            <Wallet className="w-3.5 h-3.5 text-[#8A91A6]" />
            <span className="text-white font-semibold">{activeEthBalanceNum.toFixed(3)} ETH</span>
            <span className="text-[#6B7280]">|</span>
            <span className="text-[#2CE59B] font-semibold">3,810 USDC</span>
            <ChevronDown className="w-3 h-3 text-[#8A91A6]" />
          </button>
        </div>
      </header>
    </>
  );
}
