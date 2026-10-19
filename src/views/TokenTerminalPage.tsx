import {
  Search,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Crosshair,
  Settings,
  Wallet,
  Award,
} from 'lucide-react';
import { TokenAvatar } from '../components/TokenAvatar';
import { ProTradingChart } from '../components/ProTradingChart';
import { TraderScanPopover } from '../components/FloatingWidgets';
import { formatCompactUsd, formatTokenPrice } from '../lib/marketData';
import { ROBINHOOD_TESTNET_CONFIG, shortenAddress } from '../lib/robinhoodChain';
import { useTerminal } from '../app/TerminalContext';

export function TokenTerminalPage() {
  const {
    tokens,
    setPresets,
    activePresetId,
    setActivePresetId,
    activePreset,
    instantTradeOpen,
    setInstantTradeOpen,
    activeTraderScanWallet,
    setActiveTraderScanWallet,
    makerFilter,
    setMakerFilter,
    setSharePnlData,
    setTrackedWallets,
    orderSide,
    setOrderSide,
    orderMode,
    setOrderMode,
    orderAmountEth,
    setOrderAmountEth,
    sellPct,
    setSellPct,
    limitTriggerMcap,
    setLimitTriggerMcap,
    limitTargetPct,
    setLimitTargetPct,
    advStrategyEnabled,
    setAdvStrategyEnabled,
    tpPct,
    setTpPct,
    slPct,
    setSlPct,
    sniperMaxMcap,
    setSniperMaxMcap,
    isSwapping,
    terminalBottomTab,
    setTerminalBottomTab,
    centerRightTab,
    setCenterRightTab,
    tokenHoldings,
    tradeHistory,
    limitOrders,
    setLimitOrders,
    copiedId,
    selectedToken,
    triggerToast,
    handleExecuteSpotSwap,
    handlePlaceConditionalOrder,
    handleCopy,
    tokenLiveTrades,
    currentHoldingUsd,
    currentInvestedUsd,
    currentPnlUsd,
    activeEthBalanceNum,
  } = useTerminal();
  return (
    <>
      <div className="flex-1 flex flex-col min-h-0 bg-[#06070B]">
        {/* Token Header Bar (`full_terminal.webp` top strip) */}
        <div className="h-14 px-3 border-b border-[#161823] bg-[#080A10] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <TokenAvatar
              symbol={selectedToken.symbol}
              name={selectedToken.name}
              address={selectedToken.address}
              iconUrl={selectedToken.iconUrl}
              size="md"
              bondingProgress={selectedToken.bondingProgress}
              showChainBadge
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[15px] text-white">
                  {selectedToken.symbol}
                </span>
                <span className="text-xs text-[#8A91A6] truncate">{selectedToken.name}</span>
                <button
                  onClick={() => handleCopy('hdr-ca', selectedToken.address)}
                  className="text-[#8A91A6] hover:text-white"
                  title="Copy Contract Address"
                >
                  {copiedId === 'hdr-ca' ? (
                    <Check className="w-3.5 h-3.5 text-[#2CE59B]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <a
                  href={`${ROBINHOOD_TESTNET_CONFIG.explorerUrl}/address/${selectedToken.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#8A91A6] hover:text-[#526FFF]"
                  title="Open on Robinhood Explorer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#2CE59B]">
                <span className="font-mono-tabular font-semibold">{selectedToken.age}</span>
                <span className="text-[#8A91A6]">• {selectedToken.launchpad}</span>
              </div>
            </div>

            {/* Big MarketCap Readout (`$53.7K` in `full_terminal.webp`) */}
            <div className="pl-3 border-l border-[#161823]">
              <div className="text-[18px] font-extrabold font-mono-tabular text-white leading-tight">
                {formatCompactUsd(selectedToken.marketCapUsd)}
              </div>
              <div className="text-[10px] text-[#8A91A6] font-mono-tabular">
                Price <span className="text-white">{formatTokenPrice(selectedToken.priceUsd)}</span>
              </div>
            </div>

            {/* 24h Volume / Liquidity / B.Curve Metrics */}
            <div className="hidden xl:flex items-center gap-5 pl-3 border-l border-[#161823] text-xs font-mono-tabular">
              <div>
                <div className="text-[10px] text-[#8A91A6]">24h Volume</div>
                <div className="font-bold text-white">
                  {formatCompactUsd(selectedToken.volume24hUsd)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8A91A6]">Liquidity</div>
                <div className="font-bold text-white">
                  {formatCompactUsd(selectedToken.liquidityUsd)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8A91A6]">B.Curve</div>
                <div className="font-bold text-[#2CE59B]">{selectedToken.bondingProgress}%</div>
              </div>
              {[
                { label: '5m', val: selectedToken.change5m },
                { label: '1h', val: selectedToken.change1h },
                { label: '6h', val: selectedToken.change6h },
                { label: '24h', val: selectedToken.change24h },
              ].map((m) => (
                <div key={m.label}>
                  <div className="text-[10px] text-[#8A91A6]">{m.label}</div>
                  <div className={`font-bold ${m.val >= 0 ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'}`}>
                    {m.val >= 0 ? '+' : ''}
                    {m.val}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Share PnL + Instant Trade Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                setSharePnlData({
                  symbol: selectedToken.symbol,
                  name: selectedToken.name,
                  pnlPct:
                    currentInvestedUsd > 0
                      ? (currentPnlUsd / currentInvestedUsd) * 100
                      : selectedToken.change1h,
                  pnlUsd: currentInvestedUsd > 0 ? currentPnlUsd : 418.5,
                  investedUsd: currentInvestedUsd > 0 ? currentInvestedUsd : 250,
                  currentValueUsd: currentHoldingUsd > 0 ? currentHoldingUsd : 668.5,
                  entryPrice: formatTokenPrice(selectedToken.priceUsd * 0.72),
                  markPrice: formatTokenPrice(selectedToken.priceUsd),
                })
              }
              className="h-8 px-3 rounded-md bg-[#121521] border border-[#22273B] hover:border-[#526FFF] text-xs font-semibold text-white flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-[#2CE59B]" />
              <span>Share PnL</span>
            </button>
            <button
              onClick={() => setInstantTradeOpen(!instantTradeOpen)}
              className={`h-8 px-3 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
                instantTradeOpen
                  ? 'bg-[#526FFF] text-white'
                  : 'bg-[#121521] border border-[#22273B] text-[#D1D5DB] hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Trade</span>
            </button>
          </div>
        </div>

        {/* 3-Column Terminal Workspace */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Column 1: Chart + Bottom Analytics Dock */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 border-r border-[#161823]">
            <ProTradingChart
              symbol={selectedToken.symbol}
              name={selectedToken.name}
              basePrice={selectedToken.priceUsd}
              marketCapUsd={selectedToken.marketCapUsd}
              change24h={selectedToken.change24h}
              userTradesCount={
                tradeHistory.filter((t) => t.tokenSymbol === selectedToken.symbol).length
              }
              showLimitLine={orderMode === 'LIMIT'}
              limitTargetPct={limitTargetPct}
              onLimitTargetPctChange={(pct) => {
                setLimitTargetPct(pct);
                setLimitTriggerMcap(
                  Math.round(selectedToken.marketCapUsd * (1 + pct / 100)).toString(),
                );
              }}
            />

            {/* Bottom Dock (`Trades`, `Positions`, `Orders`, `Holders`, `Top Traders`, `Dev Tokens` matching `full_terminal.webp`) */}
            <div className="h-56 border-t border-[#161823] bg-[#080A10] flex flex-col shrink-0">
              <div className="h-8 px-3 border-b border-[#161823] flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                  {(
                    [
                      { id: 'trades', label: 'Trades' },
                      {
                        id: 'positions',
                        label: `Positions (${Object.keys(tokenHoldings).length})`,
                      },
                      { id: 'orders', label: `Orders (${limitOrders.length})` },
                      { id: 'holders', label: `Holders (${selectedToken.holders})` },
                      { id: 'topTraders', label: 'Top Traders' },
                      { id: 'devTokens', label: 'Dev Tokens (3)' },
                      { id: 'bubbleMap', label: 'Bubble Map' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTerminalBottomTab(tab.id)}
                      className={`py-1.5 font-semibold border-b-2 transition whitespace-nowrap ${
                        terminalBottomTab === tab.id
                          ? 'border-[#526FFF] text-white'
                          : 'border-transparent text-[#8A91A6] hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setInstantTradeOpen(!instantTradeOpen)}
                  className="text-[11px] text-[#526FFF] hover:underline flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Instant Trade Panel
                </button>
              </div>

              {/* Bottom Dock Body */}
              <div className="flex-1 overflow-y-auto">
                {terminalBottomTab === 'devTokens' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 h-full divide-x divide-[#161823]">
                    <div className="md:col-span-4 p-3 flex flex-col justify-between bg-[#06070B]">
                      <div>
                        <div className="text-xs font-bold text-white mb-2">
                          {selectedToken.symbol} Creator Stats
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded bg-[#0D0F17] border border-[#1B1E2B]">
                            <div className="text-[10px] text-[#8A91A6]">Total Tokens</div>
                            <div className="font-bold text-white font-mono-tabular mt-0.5">3</div>
                          </div>
                          <div className="p-2 rounded bg-[#0D0F17] border border-[#1B1E2B]">
                            <div className="text-[10px] text-[#8A91A6]">Migrated</div>
                            <div className="font-bold text-[#2CE59B] font-mono-tabular mt-0.5">
                              2 / 3
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#8A91A6]">
                        Dev Hold:{' '}
                        <span className="text-[#2CE59B] font-semibold">
                          {selectedToken.security.devHoldingPct}% (
                          {selectedToken.security.devSold ? 'DS Sold' : 'Holding'})
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-8 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#090B11] text-[10px] text-[#8A91A6] border-b border-[#161823]">
                          <tr>
                            <th className="py-1.5 px-3">Pair</th>
                            <th className="py-1.5 px-3">Created</th>
                            <th className="py-1.5 px-3">Migrated</th>
                            <th className="py-1.5 px-3 text-right">Market Cap</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#141722] font-mono-tabular">
                          {[
                            {
                              symbol: selectedToken.symbol,
                              age: selectedToken.age,
                              migrated: selectedToken.category === 'graduated',
                              mcap: selectedToken.marketCapUsd,
                            },
                            { symbol: 'RHOOD-V1', age: '6d', migrated: true, mcap: 428000 },
                            { symbol: 'ORBIT-AI', age: '14d', migrated: true, mcap: 1120000 },
                          ].map((d, i) => (
                            <tr key={i} className="hover:bg-[#0D101A]">
                              <td className="py-2 px-3 font-bold text-white">{d.symbol}</td>
                              <td className="py-2 px-3 text-[#8A91A6]">{d.age}</td>
                              <td className="py-2 px-3">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    d.migrated
                                      ? 'bg-[#2CE59B]/15 text-[#2CE59B]'
                                      : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                                  }`}
                                >
                                  {d.migrated ? 'MIGRATED' : 'CURVE'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right text-white font-semibold">
                                {formatCompactUsd(d.mcap)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {terminalBottomTab === 'trades' && (
                  <table className="w-full text-left text-xs font-mono-tabular">
                    <thead className="bg-[#090B11] text-[10px] text-[#8A91A6] border-b border-[#161823]">
                      <tr>
                        <th className="py-1.5 px-3">Age</th>
                        <th className="py-1.5 px-3">Type</th>
                        <th className="py-1.5 px-3">Pair</th>
                        <th className="py-1.5 px-3">Amount ETH</th>
                        <th className="py-1.5 px-3">Total USD</th>
                        <th className="py-1.5 px-3">One Shot Fee</th>
                        <th className="py-1.5 px-3 text-right">Tx Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141722]">
                      {tradeHistory.map((tr) => (
                        <tr key={tr.id} className="hover:bg-[#0D101A]">
                          <td className="py-1.5 px-3 text-[#8A91A6]">{tr.timestamp}</td>
                          <td
                            className={`py-1.5 px-3 font-bold ${
                              tr.side === 'BUY' ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                            }`}
                          >
                            {tr.side}
                          </td>
                          <td className="py-1.5 px-3 font-bold text-white">{tr.tokenSymbol}</td>
                          <td className="py-1.5 px-3 text-white">{tr.totalEth.toFixed(3)} ETH</td>
                          <td className="py-1.5 px-3 text-white">${tr.totalUsd.toFixed(2)}</td>
                          <td className="py-1.5 px-3 text-[#2CE59B] font-bold">$0.00 (0%)</td>
                          <td className="py-1.5 px-3 text-right">
                            <a
                              href={`${ROBINHOOD_TESTNET_CONFIG.explorerUrl}/tx/${tr.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#526FFF] hover:underline inline-flex items-center gap-1"
                            >
                              {shortenAddress(tr.txHash)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {terminalBottomTab === 'positions' && (
                  <table className="w-full text-left text-xs font-mono-tabular">
                    <thead className="bg-[#090B11] text-[10px] text-[#8A91A6] border-b border-[#161823]">
                      <tr>
                        <th className="py-1.5 px-3">Token</th>
                        <th className="py-1.5 px-3">Balance</th>
                        <th className="py-1.5 px-3">Current Value</th>
                        <th className="py-1.5 px-3">Unrealized PnL</th>
                        <th className="py-1.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141722]">
                      {Object.entries(tokenHoldings).map(([sym, bal]) => {
                        const tok = tokens.find((t) => t.symbol === sym);
                        if (!tok || bal <= 0) return null;
                        const valUsd = bal * tok.priceUsd;
                        const pnl = valUsd * 0.22;
                        return (
                          <tr key={sym} className="hover:bg-[#0D101A]">
                            <td className="py-2 px-3 font-bold text-white">{tok.symbol}</td>
                            <td className="py-2 px-3 text-[#D1D5DB]">{bal.toFixed(1)}</td>
                            <td className="py-2 px-3 text-white font-semibold">
                              ${valUsd.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 font-bold text-[#2CE59B]">
                              +${pnl.toFixed(2)} (+22.0%)
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                onClick={() => handleExecuteSpotSwap(tok, 'SELL', '0.05', 100)}
                                className="px-2.5 py-1 rounded bg-[#FF4D6A]/15 text-[#FF4D6A] hover:bg-[#FF4D6A] hover:text-white font-bold text-[11px] transition"
                              >
                                Market Sell 100%
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {terminalBottomTab === 'orders' && (
                  <table className="w-full text-left text-xs font-mono-tabular">
                    <thead className="bg-[#090B11] text-[10px] text-[#8A91A6] border-b border-[#161823]">
                      <tr>
                        <th className="py-1.5 px-3">Type</th>
                        <th className="py-1.5 px-3">Token</th>
                        <th className="py-1.5 px-3">Side</th>
                        <th className="py-1.5 px-3">Trigger Market Cap</th>
                        <th className="py-1.5 px-3">Size</th>
                        <th className="py-1.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141722]">
                      {limitOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-[#0D101A]">
                          <td className="py-1.5 px-3">
                            <span className="px-1.5 py-0.5 rounded bg-[#526FFF]/15 text-[#526FFF] font-bold text-[10px]">
                              {o.orderType}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 font-bold text-white">{o.symbol}</td>
                          <td className="py-1.5 px-3 text-[#2CE59B] font-bold">{o.side}</td>
                          <td className="py-1.5 px-3 text-white">
                            {formatCompactUsd(o.triggerMcapUsd)}
                          </td>
                          <td className="py-1.5 px-3 text-white">{o.amountEth} ETH</td>
                          <td className="py-1.5 px-3 text-right">
                            <button
                              onClick={() =>
                                setLimitOrders((prev) => prev.filter((item) => item.id !== o.id))
                              }
                              className="text-[#FF4D6A] hover:underline text-[11px]"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {(terminalBottomTab === 'holders' ||
                  terminalBottomTab === 'topTraders' ||
                  terminalBottomTab === 'bubbleMap') && (
                  <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono-tabular">
                    {[
                      { rank: '#1 Bonding Curve Pool', pct: '78.40%', tag: 'LOCKED CONTRACT' },
                      { rank: '#2 H8fP...6pump', pct: '2.15%', tag: 'PRO TRADER' },
                      { rank: '#3 Erad...b7X', pct: '1.84%', tag: 'KOL WALLET' },
                      {
                        rank: '#4 Creator Wallet',
                        pct: `${selectedToken.security.devHoldingPct}%`,
                        tag: 'DEV',
                      },
                    ].map((h, i) => (
                      <div key={i} className="p-2.5 rounded bg-[#0D0F17] border border-[#1B1E2B]">
                        <div className="text-white font-bold">{h.rank}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[#2CE59B] font-bold">{h.pct}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#526FFF]/15 text-[#526FFF]">
                            {h.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2 (`265px`): Live `Trades` / `Orderbook` Column with `TraderScanPopover` (`full_terminal.webp` & `trader_scan.png`) */}
          <div className="w-[265px] border-r border-[#161823] bg-[#080A10] hidden lg:flex flex-col shrink-0 relative">
            <div className="h-8 px-2.5 border-b border-[#161823] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCenterRightTab('trades')}
                  className={`font-bold ${
                    centerRightTab === 'trades' ? 'text-white' : 'text-[#6B7280] hover:text-white'
                  }`}
                >
                  Trades
                </button>
                <button
                  onClick={() => setCenterRightTab('orderbook')}
                  className={`font-bold ${
                    centerRightTab === 'orderbook'
                      ? 'text-white'
                      : 'text-[#6B7280] hover:text-white'
                  }`}
                >
                  Orderbook
                </button>
              </div>
              {makerFilter ? (
                <button
                  onClick={() => setMakerFilter(null)}
                  className="text-[10px] text-[#FF4D6A] hover:underline"
                >
                  Clear Filter
                </button>
              ) : (
                <span className="text-[10px] text-[#8A91A6]">Click 🔍 for Scan</span>
              )}
            </div>

            {/* Column Header */}
            <div className="grid grid-cols-12 px-2.5 py-1.5 border-b border-[#141722] text-[10px] text-[#6B7280] font-medium">
              <span className="col-span-2">Age</span>
              <span className="col-span-3">MC</span>
              <span className="col-span-3 text-right">Total USD</span>
              <span className="col-span-4 text-right">Trader</span>
            </div>

            {/* Live Trades Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#11141E] font-mono-tabular text-[11px]">
              {tokenLiveTrades.map((tr, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 items-center px-2.5 py-1.5 hover:bg-[#111420] transition"
                >
                  <span className="col-span-2 text-[#8A91A6]">{tr.age}</span>
                  <span
                    className={`col-span-3 font-semibold ${
                      tr.side === 'BUY' ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                    }`}
                  >
                    {formatCompactUsd(tr.mc)}
                  </span>
                  <span
                    className={`col-span-3 text-right font-bold ${
                      tr.side === 'BUY' ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                    }`}
                  >
                    ${tr.totalUsd.toFixed(1)}
                  </span>
                  <div className="col-span-4 flex items-center justify-end gap-1">
                    <span className="text-[#D1D5DB] truncate max-w-[54px]">{tr.maker}</span>
                    <button
                      onClick={() =>
                        setActiveTraderScanWallet(
                          activeTraderScanWallet === tr.maker ? null : tr.maker,
                        )
                      }
                      className="p-0.5 rounded bg-[#151928] hover:bg-[#526FFF] text-[#8A91A6] hover:text-white transition"
                      title="Trader Scan"
                    >
                      <Search className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Trader Scan Popover (`trader_scan.png` 1:1) */}
            {activeTraderScanWallet && (
              <div className="absolute top-12 right-2 z-50">
                <TraderScanPopover
                  makerAddress={activeTraderScanWallet}
                  tokenSymbol={selectedToken.symbol}
                  onClose={() => setActiveTraderScanWallet(null)}
                  onTrackWallet={(addr) => {
                    setTrackedWallets((prev) => [
                      {
                        address: addr,
                        emoji: '🦅',
                        label: `Scanned ${addr.slice(0, 5)}`,
                        tag: 'Smart Whale',
                        winRatePct: 76.4,
                        pnl7dUsd: 18400,
                        pnl7dPct: 112.5,
                        trades7d: 42,
                        copyTradeEnabled: true,
                        lastAction: {
                          side: 'BUY',
                          symbol: selectedToken.symbol,
                          tokenAddress: selectedToken.address,
                          amountEth: 0.25,
                          valueUsd: 650,
                          marketCapUsd: selectedToken.marketCapUsd,
                          timeAgo: '1m',
                        },
                      },
                      ...prev,
                    ]);
                    triggerToast('Trader Added to Wallet Tracker', addr, 'info');
                  }}
                  onFilterByMaker={(addr) => {
                    setMakerFilter(addr);
                    setActiveTraderScanWallet(null);
                  }}
                />
              </div>
            )}
          </div>

          {/* Column 3 (`315px`): Spot Execution Ticket (`market_order.png`, `limit_orders.png`, `sniper_buy.png`) */}
          <div className="w-[315px] bg-[#080A10] flex flex-col shrink-0 overflow-y-auto">
            <div className="p-3 space-y-3">
              {/* 5m / 1h / 6h / 24h Volume + Buy/Sell Flow Bar (`full_terminal.webp` top of right sidebar) */}
              <div className="p-2.5 rounded-lg bg-[#0C0E16] border border-[#171A26]">
                <div className="flex items-center justify-between text-[11px] font-mono-tabular mb-1.5">
                  <div>
                    <span className="text-[#8A91A6]">5m Vol </span>
                    <span className="text-white font-bold">
                      {formatCompactUsd(selectedToken.vol5mUsd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#2CE59B] font-bold">Buys {selectedToken.buys24h}</span>
                    <span className="text-[#4B5563]"> / </span>
                    <span className="text-[#FF4D6A] font-bold">Sells {selectedToken.sells24h}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#FF4D6A] overflow-hidden">
                  <div
                    className="h-full bg-[#2CE59B]"
                    style={{
                      width: `${Math.round(
                        (selectedToken.buys24h / Math.max(selectedToken.txns24h, 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Buy / Sell Toggle (`#2CE59B` / `#FF4D6A`) */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-[#0C0E16] border border-[#171A26]">
                <button
                  onClick={() => setOrderSide('BUY')}
                  className={`py-2 rounded-md font-bold text-xs transition ${
                    orderSide === 'BUY'
                      ? 'bg-[#2CE59B] text-[#06070B] shadow-[0_0_12px_rgba(44,229,155,0.3)]'
                      : 'text-[#8A91A6] hover:text-white'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setOrderSide('SELL')}
                  className={`py-2 rounded-md font-bold text-xs transition ${
                    orderSide === 'SELL'
                      ? 'bg-[#FF4D6A] text-white shadow-[0_0_12px_rgba(255,77,106,0.3)]'
                      : 'text-[#8A91A6] hover:text-white'
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Market / Limit / Migration Sniper Sub-Tabs (`market_order.png`, `limit_orders.png`, `sniper_buy.png`) */}
              <div className="flex items-center justify-between border-b border-[#161823] text-xs">
                {(
                  [
                    { id: 'MARKET', label: 'Market' },
                    { id: 'LIMIT', label: 'Limit' },
                    { id: 'SNIPER', label: 'Migration Sniper' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setOrderMode(m.id)}
                    className={`pb-2 font-semibold border-b-2 transition ${
                      orderMode === m.id
                        ? 'border-[#526FFF] text-white'
                        : 'border-transparent text-[#8A91A6] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Amount Input Box */}
              <div className="p-2.5 rounded-lg bg-[#0C0E16] border border-[#1B1E2B]">
                <div className="flex items-center justify-between text-[11px] text-[#8A91A6] mb-1">
                  <span>AMOUNT</span>
                  <span className="font-mono-tabular">
                    Bal: {activeEthBalanceNum.toFixed(3)} ETH
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={orderSide === 'BUY' ? orderAmountEth : `${sellPct}%`}
                    onChange={(e) => {
                      if (orderSide === 'BUY') setOrderAmountEth(e.target.value);
                      else setSellPct(parseInt(e.target.value.replace(/\D/g, ''), 10) || 50);
                    }}
                    className="w-full bg-transparent text-[16px] font-extrabold font-mono-tabular text-white focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#526FFF]">
                    {orderSide === 'BUY' ? 'ETH' : selectedToken.symbol}
                  </span>
                </div>

                {/* Quick Amount Preset Buttons (`0.01`, `0.05`, `0.25`, `1.0` or `10%`, `25%`, `50%`, `100%`) */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {orderSide === 'BUY'
                    ? ['0.01', '0.05', '0.25', '1.0'].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setOrderAmountEth(amt)}
                          className={`py-1 rounded text-[11px] font-mono-tabular font-semibold border transition ${
                            orderAmountEth === amt
                              ? 'bg-[#526FFF]/20 border-[#526FFF] text-white'
                              : 'bg-[#121521] border-[#1E2233] text-[#9CA3AF] hover:text-white'
                          }`}
                        >
                          {amt}
                        </button>
                      ))
                    : [10, 25, 50, 100].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setSellPct(pct)}
                          className={`py-1 rounded text-[11px] font-mono-tabular font-semibold border transition ${
                            sellPct === pct
                              ? 'bg-[#FF4D6A]/20 border-[#FF4D6A] text-white'
                              : 'bg-[#121521] border-[#1E2233] text-[#9CA3AF] hover:text-white'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                </div>
              </div>

              {/* Conditional Limit Target MC or Migration Sniper Input */}
              {orderMode === 'LIMIT' && (
                <div className="p-2.5 rounded-lg bg-[#0C0E16] border border-[#526FFF]/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8A91A6]">Trigger Market Cap (Drag Chart Line)</span>
                    <span className="text-[#526FFF] font-mono-tabular font-bold">
                      {limitTargetPct >= 0 ? '+' : ''}
                      {limitTargetPct.toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-80}
                    max={150}
                    value={limitTargetPct}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setLimitTargetPct(p);
                      setLimitTriggerMcap(
                        Math.round(selectedToken.marketCapUsd * (1 + p / 100)).toString(),
                      );
                    }}
                    className="w-full accent-[#526FFF]"
                  />
                  <div className="flex items-center justify-between text-xs font-mono-tabular">
                    <span className="text-[#8A91A6]">Target MC:</span>
                    <span className="text-white font-bold">
                      {formatCompactUsd(
                        parseFloat(limitTriggerMcap) ||
                          selectedToken.marketCapUsd * (1 + limitTargetPct / 100),
                      )}
                    </span>
                  </div>
                </div>
              )}

              {orderMode === 'SNIPER' && (
                <div className="p-2.5 rounded-lg bg-[#0C0E16] border border-[#F59E0B]/40 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#F59E0B] font-semibold flex items-center gap-1">
                      <Crosshair className="w-3 h-3" /> Migration Sniper Max Market Cap
                    </span>
                    <span className="text-[#2CE59B] font-mono-tabular">0% Fee</span>
                  </div>
                  <input
                    type="text"
                    value={sniperMaxMcap}
                    onChange={(e) => setSniperMaxMcap(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-[#080A10] border border-[#1E2233] text-xs font-mono-tabular text-white"
                  />
                  <p className="text-[10px] text-[#8A91A6]">
                    Automatically executes on Block 0 when {selectedToken.symbol} migrates from
                    bonding curve to Robinhood V2 AMM.
                  </p>
                </div>
              )}

              {/* Execution Settings Strip (`20%` Slippage | `0.001` Priority | `0.001` Bribe | `MEV: Secure`) */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0C0E16] border border-[#171A26] text-[10px] font-mono-tabular text-[#9CA3AF]">
                <span>⚡ {activePreset.slippagePct}%</span>
                <span>⛽ {activePreset.priorityFeeEth}</span>
                <span>🪙 {activePreset.tipEth}</span>
                <button
                  onClick={() => {
                    const modes: Array<'Off' | 'Reduced' | 'Secure'> = ['Off', 'Reduced', 'Secure'];
                    const next = modes[(modes.indexOf(activePreset.mevMode) + 1) % modes.length];
                    setPresets((prev) => ({
                      ...prev,
                      [activePresetId]: { ...prev[activePresetId], mevMode: next },
                    }));
                  }}
                  className="text-[#2CE59B] font-bold flex items-center gap-0.5"
                  title="Click to cycle MEV Protection Mode (Off / Reduced / Secure)"
                >
                  <ShieldCheck className="w-3 h-3" /> MEV: {activePreset.mevMode}
                </button>
              </div>

              {/* Advanced Trading Strategy Checkbox (`TP / SL`) */}
              <label className="flex items-center gap-2 text-xs text-[#D1D5DB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={advStrategyEnabled}
                  onChange={(e) => setAdvStrategyEnabled(e.target.checked)}
                  className="rounded accent-[#526FFF]"
                />
                <span>Advanced Trading Strategy (Auto TP/SL)</span>
              </label>

              {advStrategyEnabled && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-[#0C0E16] border border-[#1B1E2B]">
                    <div className="text-[10px] text-[#8A91A6]">Take Profit %</div>
                    <input
                      type="text"
                      value={tpPct}
                      onChange={(e) => setTpPct(e.target.value)}
                      className="w-full bg-transparent text-xs font-mono-tabular font-bold text-[#2CE59B] focus:outline-none mt-0.5"
                    />
                  </div>
                  <div className="p-2 rounded bg-[#0C0E16] border border-[#1B1E2B]">
                    <div className="text-[10px] text-[#8A91A6]">Stop Loss %</div>
                    <input
                      type="text"
                      value={slPct}
                      onChange={(e) => setSlPct(e.target.value)}
                      className="w-full bg-transparent text-xs font-mono-tabular font-bold text-[#FF4D6A] focus:outline-none mt-0.5"
                    />
                  </div>
                </div>
              )}

              {/* Primary Action CTA Button (`Buy SYMBOL` or `Place Limit Order`) */}
              <button
                disabled={isSwapping}
                onClick={() => {
                  if (orderMode === 'MARKET') {
                    handleExecuteSpotSwap(selectedToken, orderSide, orderAmountEth);
                  } else {
                    handlePlaceConditionalOrder();
                  }
                }}
                className={`w-full py-2.5 rounded-full font-extrabold text-xs transition shadow-lg ${
                  orderSide === 'BUY'
                    ? 'bg-[#2CE59B] hover:bg-[#22C583] text-[#06070B]'
                    : 'bg-[#FF4D6A] hover:bg-[#E63E5B] text-white'
                }`}
              >
                {isSwapping
                  ? 'Executing on Robinhood Chain...'
                  : orderMode === 'MARKET'
                    ? `${orderSide === 'BUY' ? 'Buy' : 'Sell'} ${selectedToken.symbol} (0% Fee)`
                    : `Place ${orderMode === 'SNIPER' ? 'Migration Sniper' : 'Limit'} Order`}
              </button>

              {/* Bought / Sold / Holding / PnL Summary Bar (`full_terminal.webp`) */}
              <div className="grid grid-cols-4 gap-1 p-2 rounded-lg bg-[#0C0E16] border border-[#171A26] text-center font-mono-tabular">
                <div>
                  <div className="text-[10px] text-[#8A91A6]">Bought</div>
                  <div className="text-[11px] font-bold text-[#2CE59B]">
                    ${currentInvestedUsd.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8A91A6]">Sold</div>
                  <div className="text-[11px] font-bold text-[#D1D5DB]">$0</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8A91A6]">Holding</div>
                  <div className="text-[11px] font-bold text-white">
                    ${currentHoldingUsd.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8A91A6]">PnL</div>
                  <div
                    className={`text-[11px] font-bold ${
                      currentPnlUsd >= 0 ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                    }`}
                  >
                    {currentPnlUsd >= 0 ? '+' : ''}${currentPnlUsd.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Preset 1 / Preset 2 / Preset 3 Switcher */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded bg-[#0C0E16] border border-[#171A26] text-xs font-bold">
                {([1, 2, 3] as const).map((pId) => (
                  <button
                    key={pId}
                    onClick={() => setActivePresetId(pId)}
                    className={`py-1 rounded transition ${
                      activePresetId === pId
                        ? 'bg-[#526FFF]/20 text-[#526FFF] border border-[#526FFF]/40'
                        : 'text-[#8A91A6] hover:text-white'
                    }`}
                  >
                    Preset {pId}
                  </button>
                ))}
              </div>

              {/* Detailed `Token Info` Security Grid (`full_terminal.webp` bottom-right 1:1) */}
              <div className="pt-2 border-t border-[#161823]">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                  <span>Token Info</span>
                  <span className="text-[10px] text-[#2CE59B] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {selectedToken.security.auditChecks}{' '}
                    Verified
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-mono-tabular text-center">
                  <div className="p-2 rounded bg-[#0C0E16] border border-[#171A26]">
                    <div className="text-xs font-bold text-[#2CE59B]">
                      {selectedToken.security.top10HoldersPct}%
                    </div>
                    <div className="text-[10px] text-[#8A91A6]">Top 10 H.</div>
                  </div>
                  <div className="p-2 rounded bg-[#0C0E16] border border-[#171A26]">
                    <div className="text-xs font-bold text-[#2CE59B]">
                      {selectedToken.security.devHoldingPct}%
                    </div>
                    <div className="text-[10px] text-[#8A91A6]">Dev H.</div>
                  </div>
                  <div className="p-2 rounded bg-[#0C0E16] border border-[#171A26]">
                    <div className="text-xs font-bold text-[#2CE59B]">
                      {selectedToken.security.snipersPct}%
                    </div>
                    <div className="text-[10px] text-[#8A91A6]">Snipers H.</div>
                  </div>
                  <div className="p-2 rounded bg-[#0C0E16] border border-[#171A26]">
                    <div className="text-xs font-bold text-[#2CE59B]">
                      {selectedToken.security.insidersPct ?? 0}%
                    </div>
                    <div className="text-[10px] text-[#8A91A6]">Insiders</div>
                  </div>
                  <div className="p-2 rounded bg-[#0C0E16] border border-[#171A26]">
                    <div className="text-xs font-bold text-[#2CE59B]">
                      {selectedToken.security.bundlerPct}%
                    </div>
                    <div className="text-[10px] text-[#8A91A6]">Bundlers</div>
                  </div>
                  <div className="p-2 rounded bg-[#0C0E16] border border-[#171A26]">
                    <div className="text-xs font-bold text-[#2CE59B]">
                      {selectedToken.security.lpLockedPct}%
                    </div>
                    <div className="text-[10px] text-[#8A91A6]">LP Burned</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
