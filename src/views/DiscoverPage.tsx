import {
  SlidersHorizontal,
  Copy,
  Check,
  Star,
  Flame,
  Users,
  X,
  Globe,
  Send,
  Crown,
  BadgeCheck,
} from 'lucide-react';
import { TokenAvatar } from '../components/TokenAvatar';
import { formatCompactUsd } from '../lib/marketData';
import { useTerminal } from '../app/TerminalContext';

export function DiscoverPage() {
  const {
    discoverSubTab,
    setDiscoverSubTab,
    timeWindow,
    setTimeWindow,
    watchlistAddresses,
    setWatchlistAddresses,
    activePresetId,
    setActivePresetId,
    quickBuyAmountEth,
    setQuickBuyAmountEth,
    setPulseFiltersOpen,
    copiedId,
    handleExecuteSpotSwap,
    handleCopy,
    openTokenInTerminal,
    filteredTokens,
  } = useTerminal();
  return (
    <>
      <div className="flex-1 flex flex-col min-h-0 bg-[#06070B]">
        {/* Discover Sub-Header (`DEX Screener`, `Trending`, `Robinhood Live`, Timeframe buttons, `Filter`) */}
        <div className="h-12 px-5 border-b border-[#161823] bg-[#080A10] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-5">
            {(
              [
                { id: 'dex_screener', label: 'DEX Screener' },
                { id: 'trending', label: 'Trending' },
                { id: 'pump_live', label: 'Robinhood Live' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setDiscoverSubTab(st.id)}
                className={`text-[15px] font-bold transition ${
                  discoverSubTab === st.id ? 'text-white' : 'text-[#6B7280] hover:text-[#D1D5DB]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Timeframe selector (`5m`, `1h`, `6h`, `24h`) */}
            <div className="flex items-center bg-[#0D0F17] border border-[#1B1E2B] rounded-md p-0.5 text-xs">
              {(['5m', '1h', '6h', '24h'] as const).map((tw) => (
                <button
                  key={tw}
                  onClick={() => setTimeWindow(tw)}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    timeWindow === tw
                      ? 'bg-[#191D2C] text-[#526FFF]'
                      : 'text-[#8A91A6] hover:text-white'
                  }`}
                >
                  {tw}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPulseFiltersOpen(true)}
              className="h-8 px-3 rounded-md bg-[#10131D] border border-[#1E2233] hover:border-[#526FFF] text-xs text-white flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#526FFF]" />
              <span>Filter</span>
            </button>

            {/* Quick Buy Amount Input + P1/P2/P3 */}
            <div className="h-8 px-2.5 rounded-md bg-[#0D0F17] border border-[#1E2233] flex items-center gap-2">
              <span className="text-xs text-[#8A91A6]">Quick Buy</span>
              <input
                type="text"
                value={quickBuyAmountEth}
                onChange={(e) => setQuickBuyAmountEth(e.target.value)}
                className="w-12 bg-transparent text-right text-xs font-mono-tabular font-bold text-white focus:outline-none"
              />
              <span className="text-[10px] text-[#526FFF] font-bold">ETH</span>
              <div className="flex items-center gap-1 ml-1">
                {([1, 2, 3] as const).map((pId) => (
                  <button
                    key={pId}
                    onClick={() => setActivePresetId(pId)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      activePresetId === pId ? 'bg-[#526FFF] text-white' : 'text-[#6B7280]'
                    }`}
                  >
                    P{pId}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Discover Table (`explore.png` 1:1 columns: `Pair Info`, `Market Cap`, `Liquidity`, `Volume`, `TXNS`, `Audit Log`, `Action`) */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#090B11] border-b border-[#161823] text-[11px] text-[#8A91A6] font-medium">
              <tr>
                <th className="py-2.5 px-5">Pair Info</th>
                <th className="py-2.5 px-3">Market Cap ↓</th>
                <th className="py-2.5 px-3">Liquidity</th>
                <th className="py-2.5 px-3">Volume</th>
                <th className="py-2.5 px-3">TXNS</th>
                <th className="py-2.5 px-3">Audit Log</th>
                <th className="py-2.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121520] text-xs">
              {filteredTokens.map((t) => {
                const changeVal =
                  timeWindow === '5m'
                    ? t.change5m
                    : timeWindow === '1h'
                      ? t.change1h
                      : timeWindow === '6h'
                        ? t.change6h
                        : t.change24h;
                const watched = watchlistAddresses.includes(t.address);
                return (
                  <tr
                    key={t.address}
                    onClick={() => openTokenInTerminal(t)}
                    className="hover:bg-[#0D101A] cursor-pointer transition group"
                  >
                    {/* Pair Info */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setWatchlistAddresses((prev) =>
                              prev.includes(t.address)
                                ? prev.filter((x) => x !== t.address)
                                : [...prev, t.address],
                            );
                          }}
                          className="text-[#4B5563] hover:text-[#F59E0B]"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              watched ? 'fill-[#F59E0B] text-[#F59E0B]' : ''
                            }`}
                          />
                        </button>
                        <TokenAvatar
                          symbol={t.symbol}
                          name={t.name}
                          address={t.address}
                          iconUrl={t.iconUrl}
                          size="lg"
                          bondingProgress={t.bondingProgress}
                          showChainBadge
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-[14px] group-hover:text-[#526FFF] transition">
                              {t.symbol}
                            </span>
                            <span className="text-[#8A91A6] text-xs">{t.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(t.address, t.address);
                              }}
                              className="text-[#6B7280] hover:text-white"
                            >
                              {copiedId === t.address ? (
                                <Check className="w-3 h-3 text-[#2CE59B]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8A91A6]">
                            <span className="text-[#2CE59B] font-mono-tabular font-semibold">
                              {t.age}
                            </span>
                            <Globe className="w-3 h-3 hover:text-white" />
                            <Send className="w-3 h-3 hover:text-white" />
                            <span className="flex items-center gap-0.5 font-mono-tabular">
                              <Users className="w-3 h-3" /> {t.holders}
                            </span>
                            <span className="flex items-center gap-0.5 text-[#F59E0B] font-mono-tabular">
                              <Crown className="w-3 h-3" /> {t.kolCount ?? 2}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Market Cap */}
                    <td className="py-3 px-3 font-mono-tabular">
                      <div className="font-bold text-white text-[13px]">
                        {formatCompactUsd(t.marketCapUsd)}
                      </div>
                      <div
                        className={`text-[11px] font-semibold ${
                          changeVal >= 0 ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                        }`}
                      >
                        {changeVal >= 0 ? '+' : ''}
                        {changeVal}%
                      </div>
                    </td>

                    {/* Liquidity */}
                    <td className="py-3 px-3 font-mono-tabular text-white font-semibold">
                      {formatCompactUsd(t.liquidityUsd)}
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-3 font-mono-tabular text-white font-semibold">
                      {formatCompactUsd(t.volume24hUsd)}
                    </td>

                    {/* TXNS */}
                    <td className="py-3 px-3 font-mono-tabular">
                      <div className="font-bold text-white">{t.txns24h.toLocaleString()}</div>
                      <div className="text-[11px]">
                        <span className="text-[#2CE59B]">{t.buys24h}</span>
                        <span className="text-[#4B5563]"> / </span>
                        <span className="text-[#FF4D6A]">{t.sells24h}</span>
                      </div>
                    </td>

                    {/* Audit Log (`explore.png` vertical stack: Top 10 %, LP Burned 99.98%, Paid) */}
                    <td className="py-3 px-3 font-mono-tabular text-[11px]">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-[#2CE59B]" />
                          <span
                            className={
                              t.security.top10HoldersPct > 25
                                ? 'text-[#FF4D6A] font-semibold'
                                : 'text-[#2CE59B]'
                            }
                          >
                            {t.security.top10HoldersPct.toFixed(2)}%
                          </span>
                          <span className="text-[#6B7280] text-[10px]">Top 10</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#2CE59B]">
                          <Flame className="w-3 h-3 text-[#F59E0B]" />
                          <span>
                            {t.security.lpLockedPct >= 99
                              ? '99.98%'
                              : `${t.bondingProgress}% Curve`}
                          </span>
                        </div>
                        {t.security.dexPaid && (
                          <div className="flex items-center gap-1 text-[#2CE59B] font-semibold">
                            <BadgeCheck className="w-3 h-3" />
                            <span>Paid</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action (`Buy X ETH` in `#526FFF`) */}
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteSpotSwap(t, 'BUY', quickBuyAmountEth);
                        }}
                        className="px-4 py-1.5 rounded-full bg-[#526FFF] hover:bg-[#425FEF] text-white font-bold text-xs transition shadow-[0_0_12px_rgba(82,111,255,0.3)]"
                      >
                        Buy {quickBuyAmountEth} ETH
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
