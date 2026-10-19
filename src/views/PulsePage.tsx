import { SlidersHorizontal, Zap, Volume2, VolumeX } from 'lucide-react';
import { LaunchTokenCard } from '../components/LaunchTokenCard';
import { useTerminal } from '../app/TerminalContext';

export function PulsePage() {
  const {
    setActiveTab,
    selectedTokenAddress,
    setSelectedTokenAddress,
    activePresetId,
    setActivePresetId,
    quickBuyAmountEth,
    setQuickBuyAmountEth,
    soundEnabled,
    setSoundEnabled,
    setSecurityModalOpen,
    setPulseFiltersOpen,
    pulseFilters,
    setOrderMode,
    armedSnipes,
    setArmedSnipes,
    handleExecuteSpotSwap,
    openTokenInTerminal,
    pulseNewPairs,
    pulseFinalStretch,
    pulseMigrated,
  } = useTerminal();
  return (
    <>
      <div className="flex-1 flex flex-col min-h-0 bg-[#06070B]">
        {/* Pulse Top Sub-Toolbar */}
        <div className="h-11 px-4 border-b border-[#161823] bg-[#080A10] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[16px] font-bold text-white tracking-tight flex items-center gap-2">
              <span>Pulse</span>
              <span className="w-5 h-5 rounded-full bg-[#121624] border border-[#232942] flex items-center justify-center text-[#526FFF] text-[10px]">
                ⚡
              </span>
            </h1>
          </div>

          {/* Right Controls: Filters, Sound, Quick Buy Input, P1/P2/P3 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPulseFiltersOpen(true)}
              className="h-7 px-2.5 rounded-md bg-[#10131D] border border-[#1E2233] hover:border-[#526FFF] text-xs text-[#D1D5DB] flex items-center gap-1.5 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#526FFF]" />
              <span>Filters</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#526FFF] text-white text-[10px] font-bold">
                {pulseFilters.protocols.length}
              </span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-7 h-7 rounded-md bg-[#10131D] border border-[#1E2233] flex items-center justify-center text-[#9CA3AF] hover:text-white"
              title={soundEnabled ? 'Sound Alerts On' : 'Muted'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#2CE59B]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Quick Buy ETH Input + P1/P2/P3 Selector */}
            <div className="h-7 px-2 rounded-md bg-[#0D0F17] border border-[#1E2233] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#526FFF]" />
              <span className="text-[11px] text-[#8A91A6]">Quick Buy</span>
              <input
                type="text"
                value={quickBuyAmountEth}
                onChange={(e) => setQuickBuyAmountEth(e.target.value)}
                className="w-12 bg-transparent text-right text-xs font-mono-tabular font-bold text-white focus:outline-none"
              />
              <span className="text-[10px] text-[#6B7280] font-semibold">ETH</span>
              <div className="h-3.5 w-[1px] bg-[#1E2233] mx-0.5" />
              {([1, 2, 3] as const).map((pId) => (
                <button
                  key={pId}
                  onClick={() => setActivePresetId(pId)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                    activePresetId === pId
                      ? 'bg-[#526FFF] text-white'
                      : 'text-[#8A91A6] hover:text-white'
                  }`}
                >
                  P{pId}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Column Pulse Grid (`New Pairs`, `Final Stretch`, `Migrated`) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 divide-x divide-[#161823] overflow-hidden">
          {[
            {
              key: 'new',
              title: 'New Pairs',
              items: pulseNewPairs,
            },
            {
              key: 'final_stretch',
              title: 'Final Stretch',
              items: pulseFinalStretch,
            },
            {
              key: 'migrated',
              title: 'Migrated',
              items: pulseMigrated,
            },
          ].map((col) => (
            <div key={col.key} className="flex flex-col min-h-0 bg-[#06070B]">
              {/* Column Header (`pulse_new.png` 1:1) */}
              <div className="h-10 px-3 border-b border-[#161823] bg-[#090B11] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[13px] text-white">{col.title}</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#141722] text-[10px] text-[#8A91A6] font-mono-tabular">
                    {col.items.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="px-2 py-0.5 rounded bg-[#0D0F17] border border-[#1B1E2B] flex items-center gap-1 text-[11px] font-mono-tabular text-[#D1D5DB]">
                    <Zap className="w-3 h-3 text-[#526FFF]" />
                    <span>{quickBuyAmountEth}</span>
                  </div>
                  <div className="flex items-center bg-[#0D0F17] border border-[#1B1E2B] rounded p-0.5 text-[10px] font-bold">
                    {([1, 2, 3] as const).map((pId) => (
                      <button
                        key={pId}
                        onClick={() => setActivePresetId(pId)}
                        className={`px-1 rounded ${
                          activePresetId === pId
                            ? 'text-[#526FFF] bg-[#526FFF]/15'
                            : 'text-[#6B7280]'
                        }`}
                      >
                        P{pId}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPulseFiltersOpen(true)}
                    className="p-1 rounded hover:bg-[#161926] text-[#8A91A6] hover:text-white"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#141722]">
                {col.items.map((token) => (
                  <LaunchTokenCard
                    key={token.address}
                    token={token}
                    selected={selectedTokenAddress === token.address}
                    quickBuyEth={quickBuyAmountEth}
                    onSelect={openTokenInTerminal}
                    onQuickBuy={(t, e) => {
                      e.stopPropagation();
                      handleExecuteSpotSwap(t, 'BUY', quickBuyAmountEth);
                    }}
                    onInspectAudit={() => setSecurityModalOpen(true)}
                    onSnipeMigration={(t, e) => {
                      e.stopPropagation();
                      setSelectedTokenAddress(t.address);
                      setOrderMode('SNIPER');
                      setArmedSnipes((prev) =>
                        prev.includes(t.address) ? prev : [...prev, t.address],
                      );
                      setActiveTab('terminal');
                    }}
                    snipeArmed={armedSnipes.includes(token.address)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
