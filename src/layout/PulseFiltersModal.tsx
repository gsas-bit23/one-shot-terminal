import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTerminal } from '../app/TerminalContext';

export function PulseFiltersModal() {
  const {
    pulseFiltersOpen,
    setPulseFiltersOpen,
    pulseFilterTab,
    setPulseFilterTab,
    pulseFilters,
    setPulseFilters,
  } = useTerminal();
  return (
    <>
      {/* =====================================================================
          5. 14-FILTER PULSE MODAL (`pulse_filters.png` 1:1)
      ===================================================================== */}
      {pulseFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#0B0D14] border border-[#1E2233] shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#181B27] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#526FFF]" />
                <span className="font-bold text-sm text-white">Pulse Filters (14 Parameters)</span>
              </div>
              <button
                onClick={() => setPulseFiltersOpen(false)}
                className="text-[#8A91A6] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Protocols Pills (`pulse_filters.png`) */}
              <div>
                <div className="text-xs font-semibold text-[#8A91A6] mb-2">Protocols</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Robinhood Bonding Curve',
                    'Pump V2',
                    'GitPump',
                    'Sherwood DBC',
                    'Uniswap V4 Pool',
                    'Raydium AMM',
                    'Moonshot',
                    'Bonk',
                    'LaunchLab',
                    'Meteora',
                  ].map((proto) => {
                    const active = pulseFilters.protocols.includes(proto);
                    return (
                      <button
                        key={proto}
                        onClick={() =>
                          setPulseFilters((prev) => ({
                            ...prev,
                            protocols: active
                              ? prev.protocols.filter((p) => p !== proto)
                              : [...prev.protocols, proto],
                          }))
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                          active
                            ? 'bg-[#2CE59B]/15 border-[#2CE59B] text-[#2CE59B]'
                            : 'bg-[#10131E] border-[#1E2233] text-[#8A91A6]'
                        }`}
                      >
                        {proto}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Keywords */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#8A91A6]">Search Keywords</label>
                  <input
                    type="text"
                    value={pulseFilters.includeKeywords}
                    onChange={(e) =>
                      setPulseFilters((prev) => ({ ...prev, includeKeywords: e.target.value }))
                    }
                    placeholder="keyword1, keyword2..."
                    className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#8A91A6]">Exclude Keywords</label>
                  <input
                    type="text"
                    value={pulseFilters.excludeKeywords}
                    onChange={(e) =>
                      setPulseFilters((prev) => ({ ...prev, excludeKeywords: e.target.value }))
                    }
                    placeholder="scam, test..."
                    className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-xs text-white"
                  />
                </div>
              </div>

              {/* Sub-tabs: Metrics / Audit / Socials */}
              <div className="flex items-center gap-2 border-b border-[#181B27] pb-2 text-xs font-bold">
                {(
                  [
                    { id: 'keywords', label: 'Market Cap & Volume' },
                    {
                      id: 'metrics',
                      label: 'Security & Holders (Top 10 / Dev / Snipers / Bundle)',
                    },
                    { id: 'socials', label: 'Socials & DEX Paid' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPulseFilterTab(t.id)}
                    className={`px-2.5 py-1 rounded ${
                      pulseFilterTab === t.id ? 'bg-[#526FFF] text-white' : 'text-[#8A91A6]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {pulseFilterTab === 'keywords' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[#8A91A6]">Min Market Cap ($)</label>
                    <input
                      type="text"
                      value={pulseFilters.minMcap}
                      onChange={(e) => setPulseFilters((p) => ({ ...p, minMcap: e.target.value }))}
                      placeholder="e.g. 10000"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Max Market Cap ($)</label>
                    <input
                      type="text"
                      value={pulseFilters.maxMcap}
                      onChange={(e) => setPulseFilters((p) => ({ ...p, maxMcap: e.target.value }))}
                      placeholder="e.g. 5000000"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Min Volume ($)</label>
                    <input
                      type="text"
                      value={pulseFilters.minVolume}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, minVolume: e.target.value }))
                      }
                      placeholder="e.g. 5000"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Min Liquidity ($)</label>
                    <input
                      type="text"
                      value={pulseFilters.minLiquidity}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, minLiquidity: e.target.value }))
                      }
                      placeholder="e.g. 8000"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                </div>
              )}

              {pulseFilterTab === 'metrics' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[#8A91A6]">Max Top 10 Holders (%)</label>
                    <input
                      type="text"
                      value={pulseFilters.maxTop10Pct}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, maxTop10Pct: e.target.value }))
                      }
                      placeholder="e.g. 25"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Max Dev Holding (%)</label>
                    <input
                      type="text"
                      value={pulseFilters.maxDevPct}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, maxDevPct: e.target.value }))
                      }
                      placeholder="e.g. 5"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Max Snipers (%)</label>
                    <input
                      type="text"
                      value={pulseFilters.maxSnipersPct}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, maxSnipersPct: e.target.value }))
                      }
                      placeholder="e.g. 10"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Max Bundle (%)</label>
                    <input
                      type="text"
                      value={pulseFilters.maxBundlePct}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, maxBundlePct: e.target.value }))
                      }
                      placeholder="e.g. 15"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Min Holders Count</label>
                    <input
                      type="text"
                      value={pulseFilters.minHolders}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, minHolders: e.target.value }))
                      }
                      placeholder="e.g. 100"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Min Pro Traders</label>
                    <input
                      type="text"
                      value={pulseFilters.minProTraders}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, minProTraders: e.target.value }))
                      }
                      placeholder="e.g. 5"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                </div>
              )}

              {pulseFilterTab === 'socials' && (
                <div className="space-y-2.5 text-xs">
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pulseFilters.dexPaidOnly}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, dexPaidOnly: e.target.checked }))
                      }
                      className="accent-[#526FFF]"
                    />
                    <span>DEX Paid Only (Verified Enhanced Token Info)</span>
                  </label>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-[#181B27] bg-[#080A10] flex items-center justify-between">
              <button
                onClick={() =>
                  setPulseFilters({
                    protocols: [
                      'Robinhood Bonding Curve',
                      'Pump V2',
                      'GitPump',
                      'Sherwood DBC',
                      'Uniswap V4 Pool',
                      'Raydium AMM',
                    ],
                    includeKeywords: '',
                    excludeKeywords: '',
                    minMcap: '',
                    maxMcap: '',
                    minVolume: '',
                    minLiquidity: '',
                    maxTop10Pct: '',
                    maxDevPct: '',
                    maxSnipersPct: '',
                    maxInsidersPct: '',
                    maxBundlePct: '',
                    minHolders: '',
                    minProTraders: '',
                    dexPaidOnly: false,
                  })
                }
                className="text-xs text-[#8A91A6] hover:text-white"
              >
                Reset All
              </button>
              <button
                onClick={() => setPulseFiltersOpen(false)}
                className="px-5 py-1.5 rounded-full bg-[#526FFF] text-white font-bold text-xs"
              >
                Apply All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
