import { useEffect, useRef, useState } from 'react';
import { Search, Bell, Star, Wallet, ChevronDown } from 'lucide-react';
import { OneShotLogo } from '../components/OneShotLogo';
import { useTerminal } from '../app/TerminalContext';

// `inline` = visibility in the bar, `menu` = visibility inside "More" (the inverse breakpoint).
// Class strings are literal so Tailwind can see them.
const NAV_ITEMS = [
  { id: 'discover', label: 'Discover', inline: 'inline-flex', menu: '' },
  { id: 'pulse', label: 'Pulse', inline: 'inline-flex', menu: '' },
  { id: 'trackers', label: 'Trackers', inline: 'hidden md:inline-flex', menu: 'block md:hidden' },
  { id: 'perps', label: 'Perpetuals', inline: 'hidden lg:inline-flex', menu: 'block lg:hidden' },
  { id: 'yield', label: 'Yield', inline: 'hidden xl:inline-flex', menu: 'block xl:hidden' },
  { id: 'vision', label: 'Vision', inline: 'hidden 2xl:inline-flex', menu: 'block 2xl:hidden' },
  { id: 'portfolio', label: 'Portfolio', inline: 'hidden 2xl:inline-flex', menu: 'block 2xl:hidden' },
  { id: 'rewards', label: 'Rewards', inline: 'hidden 2xl:inline-flex', menu: 'block 2xl:hidden' },
] as const;

export function TopNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [moreOpen]);

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
  const isActiveItem = (id: string) =>
    activeTab === id || (activeTab === 'terminal' && id === 'discover');
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

          <nav className="flex items-center gap-0.5" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`${item.inline} px-2.5 py-1.5 rounded-md text-[13px] font-medium transition whitespace-nowrap ${
                  isActiveItem(item.id)
                    ? 'text-[#526FFF] font-semibold bg-[#526FFF]/10'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-[#10131D]'
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* Overflow menu: lists the tabs hidden at the current breakpoint */}
            <div className="relative 2xl:hidden" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                className={`px-2.5 py-1.5 rounded-md text-[13px] font-medium transition whitespace-nowrap inline-flex items-center gap-1 ${
                  NAV_ITEMS.some((i) => i.inline !== 'inline-flex' && isActiveItem(i.id))
                    ? 'text-[#526FFF] bg-[#526FFF]/10'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-[#10131D]'
                }`}
              >
                More <ChevronDown className="w-3 h-3" />
              </button>
              {moreOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-1 w-44 rounded-lg border border-[#1B1E2B] bg-[#0D0F17] p-1 shadow-2xl z-50"
                >
                  {NAV_ITEMS.filter((i) => i.menu).map((item) => (
                    <button
                      key={item.id}
                      role="menuitem"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMoreOpen(false);
                      }}
                      className={`${item.menu} w-full text-left px-3 py-2 rounded-md text-[13px] ${
                        isActiveItem(item.id)
                          ? 'text-[#526FFF] bg-[#526FFF]/10'
                          : 'text-[#C4C9D4] hover:bg-[#151926]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
              placeholder="Search token or address"
              className="w-44 xl:w-52 2xl:w-64 h-8 pl-8 pr-7 rounded-full bg-[#0D0F17] border border-[#1B1E2B] text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#526FFF]"
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
