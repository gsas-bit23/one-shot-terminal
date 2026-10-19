import { TokenAvatar } from '../components/TokenAvatar';
import { ProTradingChart } from '../components/ProTradingChart';
import { formatCompactUsd } from '../lib/marketData';
import { useTerminal } from '../app/TerminalContext';

export function PerpsPage() {
  const {
    perpMarkets,
    selectedPerpSymbol,
    setSelectedPerpSymbol,
    perpSide,
    setPerpSide,
    perpOrderType,
    setPerpOrderType,
    perpLeverage,
    setPerpLeverage,
    perpCollateralUsd,
    setPerpCollateralUsd,
    perpLimitPrice,
    setPerpLimitPrice,
    perpTpSlEnabled,
    setPerpTpSlEnabled,
    perpTpPrice,
    setPerpTpPrice,
    perpSlPrice,
    setPerpSlPrice,
    perpPositions,
    setPerpPositions,
    selectedPerp,
    handleOpenPerpPosition,
  } = useTerminal();
  return (
    <>
      <div className="flex-1 flex flex-col min-h-0 bg-[#06070B]">
        {/* Perps Top Pair Bar (`perps.png`) */}
        <div className="h-14 px-4 border-b border-[#161823] bg-[#080A10] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {perpMarkets.map((pm) => (
              <button
                key={pm.symbol}
                onClick={() => setSelectedPerpSymbol(pm.symbol)}
                className={`px-3 py-1.5 rounded-lg border text-left transition flex items-center gap-2.5 shrink-0 ${
                  selectedPerpSymbol === pm.symbol
                    ? 'bg-[#121624] border-[#526FFF] text-white'
                    : 'bg-[#0C0E16] border-[#181B26] text-[#8A91A6] hover:text-white'
                }`}
              >
                <TokenAvatar symbol={pm.baseAsset} name={pm.name} size="sm" />
                <div>
                  <div className="text-xs font-extrabold text-white">{pm.symbol}</div>
                  <div className="text-[10px] font-mono-tabular text-[#2CE59B]">
                    ${pm.markPrice.toLocaleString()}
                  </div>
                </div>
              </button>
            ))}

            <div className="hidden xl:flex items-center gap-6 pl-4 border-l border-[#161823] text-xs font-mono-tabular">
              <div>
                <div className="text-[10px] text-[#8A91A6]">Mark</div>
                <div className="font-bold text-white">
                  ${selectedPerp.markPrice.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8A91A6]">Oracle</div>
                <div className="font-bold text-[#D1D5DB]">
                  ${selectedPerp.indexPrice.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8A91A6]">24h Volume</div>
                <div className="font-bold text-white">
                  {formatCompactUsd(selectedPerp.volume24hUsd)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8A91A6]">Open Interest</div>
                <div className="font-bold text-white">
                  {formatCompactUsd(selectedPerp.openInterestUsd)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8A91A6]">Funding</div>
                <div className="font-bold text-[#2CE59B]">{selectedPerp.fundingRate8h}</div>
              </div>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-[#2CE59B]/10 border border-[#2CE59B]/30 text-[#2CE59B] text-xs font-bold shrink-0">
            0.00% Maker / 0.00% Taker Fee
          </div>
        </div>

        {/* Perps 3-Column Body (`perps.png`) */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Left: Chart + Perp Positions Dock */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 border-r border-[#161823]">
            <ProTradingChart
              symbol={selectedPerp.baseAsset}
              name={selectedPerp.name}
              basePrice={selectedPerp.markPrice}
              marketCapUsd={selectedPerp.openInterestUsd}
              change24h={selectedPerp.change24h}
              isPerp
            />

            {/* Perps Bottom Positions Table */}
            <div className="h-52 border-t border-[#161823] bg-[#080A10] flex flex-col shrink-0">
              <div className="h-8 px-4 border-b border-[#161823] flex items-center gap-6 text-xs font-bold">
                <span className="text-white border-b-2 border-[#526FFF] py-1.5">
                  Positions ({perpPositions.length})
                </span>
                <span className="text-[#8A91A6]">Open Orders (0)</span>
                <span className="text-[#8A91A6]">Trade History</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono-tabular">
                  <thead className="bg-[#090B11] text-[10px] text-[#8A91A6] border-b border-[#161823]">
                    <tr>
                      <th className="py-2 px-4">Market</th>
                      <th className="py-2 px-3">Side</th>
                      <th className="py-2 px-3">Size</th>
                      <th className="py-2 px-3">Entry Price</th>
                      <th className="py-2 px-3">Mark Price</th>
                      <th className="py-2 px-3">Liq. Price</th>
                      <th className="py-2 px-3">Unrealized PnL</th>
                      <th className="py-2 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141722]">
                    {perpPositions.map((pos) => {
                      const liveMkt =
                        perpMarkets.find((m) => m.symbol === pos.symbol)?.markPrice ||
                        pos.markPrice;
                      const diffRatio =
                        pos.side === 'LONG'
                          ? (liveMkt - pos.entryPrice) / pos.entryPrice
                          : (pos.entryPrice - liveMkt) / pos.entryPrice;
                      const pnlUsd = pos.sizeUsd * diffRatio;
                      return (
                        <tr key={pos.id} className="hover:bg-[#0D101A]">
                          <td className="py-2.5 px-4 font-bold text-white">
                            {pos.symbol}{' '}
                            <span className="px-1.5 py-0.2 rounded bg-[#526FFF]/20 text-[#526FFF] text-[10px]">
                              {pos.leverage}x
                            </span>
                          </td>
                          <td
                            className={`py-2.5 px-3 font-bold ${
                              pos.side === 'LONG' ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                            }`}
                          >
                            {pos.side}
                          </td>
                          <td className="py-2.5 px-3 text-white">
                            ${pos.sizeUsd.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-[#D1D5DB]">
                            ${pos.entryPrice.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-white">${liveMkt.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-[#F59E0B]">
                            ${pos.liqPrice.toLocaleString()}
                          </td>
                          <td
                            className={`py-2.5 px-3 font-bold ${
                              pnlUsd >= 0 ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                            }`}
                          >
                            {pnlUsd >= 0 ? '+' : ''}${pnlUsd.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() =>
                                setPerpPositions((prev) => prev.filter((p) => p.id !== pos.id))
                              }
                              className="px-2.5 py-1 rounded bg-[#FF4D6A]/15 text-[#FF4D6A] hover:bg-[#FF4D6A] hover:text-white font-bold text-[11px] transition"
                            >
                              Market Close
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Center-Right (`240px`): L2 Orderbook (`perps.png`) */}
          <div className="w-[240px] border-r border-[#161823] bg-[#080A10] hidden lg:flex flex-col shrink-0 font-mono-tabular text-[11px]">
            <div className="h-8 px-3 border-b border-[#161823] flex items-center justify-between text-xs font-bold text-white">
              <span>Orderbook</span>
              <span className="text-[10px] text-[#8A91A6]">Trades</span>
            </div>
            <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] text-[#6B7280] border-b border-[#141722]">
              <span>Price</span>
              <span className="text-right">Size</span>
              <span className="text-right">Total</span>
            </div>
            {/* Asks */}
            <div className="flex-1 flex flex-col justify-end divide-y divide-[#11131D]">
              {[0.003, 0.0024, 0.0018, 0.0012, 0.0006].map((spread, i) => {
                const p = selectedPerp.markPrice * (1 + spread);
                const sz = (12.4 - i * 1.8).toFixed(2);
                return (
                  <div key={i} className="grid grid-cols-3 px-3 py-1 text-[#FF4D6A] relative">
                    <span>{p.toFixed(2)}</span>
                    <span className="text-right text-[#D1D5DB]">{sz}</span>
                    <span className="text-right text-[#8A91A6]">
                      {(Number(sz) * (5 - i)).toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Spread Mid */}
            <div className="py-1.5 px-3 bg-[#0E111B] border-y border-[#181C2B] flex items-center justify-between font-bold text-xs text-[#2CE59B]">
              <span>${selectedPerp.markPrice.toLocaleString()}</span>
              <span className="text-[10px] text-[#8A91A6]">Spread 0.01%</span>
            </div>
            {/* Bids */}
            <div className="flex-1 divide-y divide-[#11131D]">
              {[0.0006, 0.0012, 0.0018, 0.0024, 0.003].map((spread, i) => {
                const p = selectedPerp.markPrice * (1 - spread);
                const sz = (14.2 + i * 2.1).toFixed(2);
                return (
                  <div key={i} className="grid grid-cols-3 px-3 py-1 text-[#2CE59B]">
                    <span>{p.toFixed(2)}</span>
                    <span className="text-right text-[#D1D5DB]">{sz}</span>
                    <span className="text-right text-[#8A91A6]">
                      {(Number(sz) * (i + 1)).toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Far-Right (`315px`): Perps Order Ticket (`perps.png` 1:1) */}
          <div className="w-[315px] bg-[#080A10] p-3 flex flex-col gap-3 shrink-0 overflow-y-auto">
            <div className="grid grid-cols-2 gap-1.5">
              <button className="py-1.5 rounded bg-[#121624] border border-[#22283E] text-xs font-bold text-white">
                Isolated
              </button>
              <button className="py-1.5 rounded bg-[#121624] border border-[#526FFF]/50 text-xs font-bold text-[#526FFF]">
                {perpLeverage}x Leverage
              </button>
            </div>

            {/* Buy / Long vs Sell / Short */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-[#0C0E16] border border-[#171A26]">
              <button
                onClick={() => setPerpSide('LONG')}
                className={`py-2 rounded-md font-bold text-xs transition ${
                  perpSide === 'LONG' ? 'bg-[#2CE59B] text-[#06070B]' : 'text-[#8A91A6]'
                }`}
              >
                Buy / Long
              </button>
              <button
                onClick={() => setPerpSide('SHORT')}
                className={`py-2 rounded-md font-bold text-xs transition ${
                  perpSide === 'SHORT' ? 'bg-[#FF4D6A] text-white' : 'text-[#8A91A6]'
                }`}
              >
                Sell / Short
              </button>
            </div>

            {/* Market / Limit */}
            <div className="flex items-center gap-4 border-b border-[#161823] text-xs">
              {(['MARKET', 'LIMIT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPerpOrderType(t)}
                  className={`pb-2 font-bold border-b-2 ${
                    perpOrderType === t
                      ? 'border-[#526FFF] text-white'
                      : 'border-transparent text-[#8A91A6]'
                  }`}
                >
                  {t === 'MARKET' ? 'Market' : 'Limit'}
                </button>
              ))}
            </div>

            {/* Collateral Input */}
            <div className="p-2.5 rounded-lg bg-[#0C0E16] border border-[#1B1E2B]">
              <div className="flex items-center justify-between text-[11px] text-[#8A91A6] mb-1">
                <span>Margin Collateral (USDC)</span>
                <span className="text-white font-mono-tabular">Avail: $3,810.50</span>
              </div>
              <input
                type="text"
                value={perpCollateralUsd}
                onChange={(e) => setPerpCollateralUsd(e.target.value)}
                className="w-full bg-transparent text-base font-extrabold font-mono-tabular text-white focus:outline-none"
              />
            </div>

            {perpOrderType === 'LIMIT' && (
              <div className="p-2.5 rounded-lg bg-[#0C0E16] border border-[#1B1E2B]">
                <div className="text-[11px] text-[#8A91A6] mb-1">Limit Price (USD)</div>
                <input
                  type="text"
                  value={perpLimitPrice}
                  onChange={(e) => setPerpLimitPrice(e.target.value)}
                  placeholder={selectedPerp.markPrice.toString()}
                  className="w-full bg-transparent text-sm font-bold font-mono-tabular text-white focus:outline-none"
                />
              </div>
            )}

            {/* Leverage Slider (`1x` – `50x`) */}
            <div className="p-2.5 rounded-lg bg-[#0C0E16] border border-[#1B1E2B] space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#8A91A6]">Leverage</span>
                <span className="font-mono-tabular font-bold text-[#526FFF]">{perpLeverage}x</span>
              </div>
              <input
                type="range"
                min={1}
                max={selectedPerp.maxLeverage}
                value={perpLeverage}
                onChange={(e) => setPerpLeverage(Number(e.target.value))}
                className="w-full accent-[#526FFF]"
              />
            </div>

            {/* Take Profit / Stop Loss */}
            <label className="flex items-center gap-2 text-xs text-[#D1D5DB]">
              <input
                type="checkbox"
                checked={perpTpSlEnabled}
                onChange={(e) => setPerpTpSlEnabled(e.target.checked)}
                className="accent-[#526FFF]"
              />
              <span>Take Profit / Stop Loss</span>
            </label>

            {perpTpSlEnabled && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={perpTpPrice}
                  onChange={(e) => setPerpTpPrice(e.target.value)}
                  placeholder="TP Price"
                  className="px-2.5 py-1.5 rounded bg-[#0C0E16] border border-[#1B1E2B] text-xs font-mono-tabular text-white"
                />
                <input
                  type="text"
                  value={perpSlPrice}
                  onChange={(e) => setPerpSlPrice(e.target.value)}
                  placeholder="SL Price"
                  className="px-2.5 py-1.5 rounded bg-[#0C0E16] border border-[#1B1E2B] text-xs font-mono-tabular text-white"
                />
              </div>
            )}

            <button
              onClick={handleOpenPerpPosition}
              className={`w-full py-2.5 rounded-full font-extrabold text-xs transition ${
                perpSide === 'LONG'
                  ? 'bg-[#2CE59B] text-[#06070B] hover:bg-[#22C583]'
                  : 'bg-[#FF4D6A] text-white hover:bg-[#E63E5B]'
              }`}
            >
              {perpSide === 'LONG' ? 'Buy / Long' : 'Sell / Short'} {selectedPerp.baseAsset} (0%
              Fee)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
