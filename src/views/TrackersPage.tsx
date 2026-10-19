import { Copy, Wallet, X } from 'lucide-react';
import { formatCompactUsd } from '../lib/marketData';
import { shortenAddress } from '../lib/robinhoodChain';
import { useTerminal } from '../app/TerminalContext';

export function TrackersPage() {
  const {
    tokens,
    quickBuyAmountEth,
    setWalletTrackerOpen,
    setTwitterMonitorOpen,
    trackedWallets,
    tweets,
    handleExecuteSpotSwap,
    openTokenInTerminal,
  } = useTerminal();
  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 bg-[#06070B]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Trackers & Smart Money Radar</h1>
              <p className="text-xs text-[#8A91A6]">
                Real-time Robinhood Chain wallet alerts, copy-trading, and X narrative stream
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWalletTrackerOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-[#526FFF] text-white text-xs font-bold"
              >
                Pop Out Floating Wallet Tracker
              </button>
              <button
                onClick={() => setTwitterMonitorOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-[#121521] border border-[#22273B] text-white text-xs font-bold"
              >
                Pop Out Floating Tweet Monitor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 Cols: Tracked Wallets & Live Trades */}
            <div className="lg:col-span-7 rounded-xl bg-[#0B0D14] border border-[#181B27] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#181B27] flex items-center justify-between">
                <span className="font-bold text-sm text-white">
                  Tracked Smart Wallets ({trackedWallets.length})
                </span>
                <span className="text-[11px] text-[#2CE59B]">Zero-Knowledge Client Storage</span>
              </div>
              <table className="w-full text-left text-xs font-mono-tabular">
                <thead className="bg-[#080A10] text-[10px] text-[#8A91A6] border-b border-[#181B27]">
                  <tr>
                    <th className="py-2.5 px-4">Wallet</th>
                    <th className="py-2.5 px-3">Win Rate</th>
                    <th className="py-2.5 px-3">7D PnL</th>
                    <th className="py-2.5 px-3">Last Action</th>
                    <th className="py-2.5 px-4 text-right">Copy Trade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141722]">
                  {trackedWallets.map((w) => (
                    <tr key={w.address} className="hover:bg-[#10131F]">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{w.emoji}</span>
                          <span>{w.label}</span>
                        </div>
                        <div className="text-[10px] text-[#8A91A6]">
                          {shortenAddress(w.address)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#2CE59B] font-bold">{w.winRatePct}%</td>
                      <td className="py-3 px-3 text-[#2CE59B] font-bold">
                        +{formatCompactUsd(w.pnl7dUsd)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-white font-bold">{w.lastAction.symbol}</span>{' '}
                        <span className="text-[#8A91A6]">{w.lastAction.timeAgo}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            const target =
                              tokens.find((t) => t.symbol === w.lastAction.symbol) || tokens[0];
                            handleExecuteSpotSwap(target, 'BUY', quickBuyAmountEth);
                          }}
                          className="px-3 py-1 rounded bg-[#526FFF] text-white font-bold text-[11px]"
                        >
                          Snipe {w.lastAction.symbol}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right 5 Cols: Live X / Tweet Monitor */}
            <div className="lg:col-span-5 rounded-xl bg-[#0B0D14] border border-[#181B27] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-[#181B27] flex items-center justify-between">
                <span className="font-bold text-sm text-white">Live X / Tweet Monitor</span>
                <span className="text-[11px] text-[#526FFF]">Sub-Second Feed</span>
              </div>
              <div className="p-3 space-y-2.5">
                {tweets.map((tw) => (
                  <div key={tw.id} className="p-3 rounded-lg bg-[#0E111A] border border-[#1B1E2B]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">
                        {tw.author} <span className="text-[#8A91A6] font-normal">{tw.handle}</span>
                      </span>
                      <span className="text-[10px] text-[#2CE59B] font-mono-tabular">
                        {tw.timeAgo}
                      </span>
                    </div>
                    <p className="text-xs text-[#D1D5DB] mb-2">{tw.text}</p>
                    {tw.detectedTicker && (
                      <button
                        onClick={() => {
                          const tok =
                            tokens.find((t) => t.symbol === tw.detectedTicker) || tokens[0];
                          openTokenInTerminal(tok);
                        }}
                        className="px-2.5 py-1 rounded bg-[#526FFF]/15 border border-[#526FFF]/40 text-[#526FFF] text-[11px] font-bold"
                      >
                        ⚡ Snipe ${tw.detectedTicker}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
