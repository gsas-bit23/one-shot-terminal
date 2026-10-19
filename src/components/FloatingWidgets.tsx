import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Bell,
  Plus,
  Trash2,
  Copy,
  Check,
  Keyboard,
  Edit3,
  ExternalLink,
  Shield,
  Clock,
  Wallet,
  TrendingUp,
  Download,
  Upload,
  Filter,
} from 'lucide-react';
import {
  TokenMarket,
  TrackedWallet,
  TweetAlertItem,
  ExecutionPreset,
  formatCompactUsd,
} from '../lib/marketData';
import { TokenAvatar } from './TokenAvatar';

// ============================================================================
// 1. INSTANT TRADE FLOATING PANEL (Matches instant_trade.png 1:1)
// ============================================================================
interface InstantTradePanelProps {
  open: boolean;
  onClose: () => void;
  token: TokenMarket;
  activePreset: 1 | 2 | 3;
  onSelectPreset: (id: 1 | 2 | 3) => void;
  presetConfig: ExecutionPreset;
  ethBalance: number;
  tokenHoldingAmount: number;
  tokenHoldingUsd: number;
  onExecuteBuy: (amountEth: string) => void;
  onExecuteSellPct: (pct: number) => void;
  onOpenPresetSettings: () => void;
}

export const InstantTradeFloatingPanel: React.FC<InstantTradePanelProps> = ({
  open,
  onClose,
  token,
  activePreset,
  onSelectPreset,
  presetConfig,
  ethBalance,
  tokenHoldingAmount,
  tokenHoldingUsd,
  onExecuteBuy,
  onExecuteSellPct,
  onOpenPresetSettings,
}) => {
  const [hotkeysEnabled, setHotkeysEnabled] = useState(true);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [advStrategy, setAdvStrategy] = useState(false);

  // Space + Key Hotkey execution (Instant Trade spec)
  useEffect(() => {
    if (!open || !hotkeysEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.code === 'Space') {
        setSpaceHeld(true);
      }
      if (e.shiftKey || spaceHeld) {
        const buyAmts = presetConfig.buyAmountsEth.slice(0, 4);
        if (e.key === '1' && buyAmts[0]) onExecuteBuy(buyAmts[0]);
        if (e.key === '2' && buyAmts[1]) onExecuteBuy(buyAmts[1]);
        if (e.key === '3' && buyAmts[2]) onExecuteBuy(buyAmts[2]);
        if (e.key === '4' && buyAmts[3]) onExecuteBuy(buyAmts[3]);
        if (e.key.toLowerCase() === 'q') onExecuteSellPct(10);
        if (e.key.toLowerCase() === 'w') onExecuteSellPct(25);
        if (e.key.toLowerCase() === 'e') onExecuteSellPct(50);
        if (e.key.toLowerCase() === 'r') onExecuteSellPct(100);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [open, hotkeysEnabled, spaceHeld, presetConfig, onExecuteBuy, onExecuteSellPct]);

  if (!open) return null;

  const buyBtns = presetConfig.buyAmountsEth.slice(0, 4);
  const sellBtns = [10, 25, 50, 100];

  return (
    <div className="fixed bottom-12 right-80 z-40 w-[330px] rounded-xl bg-[#0D0F17]/98 border border-[#232838] shadow-2xl backdrop-blur-xl select-none overflow-hidden">
      {/* Top Bar: Hotkeys | P1 P2 P3 | Edit | Wallet 1 | Close */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1B202E] bg-[#090B10]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setHotkeysEnabled(!hotkeysEnabled)}
            className={`p-1 rounded transition-colors ${
              hotkeysEnabled
                ? 'bg-[#526FFF]/20 text-[#526FFF] border border-[#526FFF]/40'
                : 'text-[#7C8496] hover:text-white'
            }`}
            title="Toggle Space + Key Hotkeys (Space+1/2/3/4 Buy, Space+Q/W/E/R Sell)"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          {([1, 2, 3] as const).map((id) => (
            <button
              key={id}
              onClick={() => onSelectPreset(id)}
              className={`text-[12px] font-bold transition-colors ${
                activePreset === id
                  ? 'text-[#526FFF]'
                  : 'text-[#7C8496] hover:text-white'
              }`}
            >
              P{id}
            </button>
          ))}

          <button
            onClick={onOpenPresetSettings}
            className="text-[#7C8496] hover:text-white transition-colors"
            title="Edit Instant Trade Preset Amounts & MEV Settings"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6-dot drag handle */}
        <div className="grid grid-cols-3 gap-0.5 opacity-40">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="w-1 h-1 rounded-full bg-[#7C8496]" />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#141824] border border-[#262D40] text-[11px] font-mono-tabular text-white">
            <Wallet className="w-3 h-3 text-[#7C8496]" /> 1
          </span>
          <button
            onClick={onClose}
            className="text-[#7C8496] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Buy Section */}
      <div className="p-3 border-b border-[#161A26]">
        <div className="flex items-center justify-between text-[12px] mb-2">
          <span className="text-[#94A3B8] font-semibold">
            Buy <span className="text-white font-bold">{token.symbol}</span>
          </span>
          <span className="font-mono-tabular text-[#D1D5DB] text-[11.5px]">
            Ξ {ethBalance.toFixed(3)}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {buyBtns.map((amt, idx) => (
            <button
              key={idx}
              onClick={() => onExecuteBuy(amt)}
              className="py-1.5 rounded-full bg-[#2CE59B]/10 hover:bg-[#2CE59B]/20 border border-[#2CE59B]/40 text-[#2CE59B] font-mono-tabular font-bold text-[11.5px] transition-all active:scale-95 relative"
            >
              {amt}
              {hotkeysEnabled && (
                <span className="block text-[8.5px] text-[#7C8496] font-normal leading-none mt-0.5">
                  [Spc+{idx + 1}]
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Execution Parameters Micro-Strip */}
        <div className="flex items-center justify-between mt-2.5 text-[10.5px] text-[#94A3B8] font-mono-tabular">
          <div className="flex items-center gap-2">
            <span title="Slippage Tolerance">🏃 {presetConfig.slippagePct}%</span>
            <span className="text-[#262D40]">|</span>
            <span title="Priority Gas">⛽ {presetConfig.priorityFeeEth}</span>
            <span className="text-[#262D40]">|</span>
            <span className="text-[#F59E0B]" title="Validator Bribe">
              🪙 {presetConfig.tipEth}
            </span>
            <span className="text-[#262D40]">|</span>
            <span className="text-[#2CE59B]" title="MEV Protection Mode">
              🤖 {presetConfig.mevMode}
            </span>
          </div>
          <label className="inline-flex items-center gap-1 cursor-pointer text-[#7C8496] hover:text-white">
            <input
              type="checkbox"
              checked={advStrategy}
              onChange={(e) => setAdvStrategy(e.target.checked)}
              className="rounded border-[#262D40] bg-[#0D1017] accent-[#526FFF] w-3 h-3"
            />
            <span>Adv.</span>
          </label>
        </div>
      </div>

      {/* Sell Section */}
      <div className="p-3">
        <div className="flex items-center justify-between text-[12px] mb-2">
          <span className="text-[#94A3B8] font-semibold">Sell %</span>
          <span className="font-mono-tabular text-[#848E9C] text-[11px]">
            {tokenHoldingAmount > 0 ? tokenHoldingAmount.toFixed(1) : '0'} ${token.symbol} •{' '}
            <span className="text-white">${tokenHoldingUsd.toFixed(2)}</span>
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {sellBtns.map((pct, idx) => {
            const keys = ['Q', 'W', 'E', 'R'];
            return (
              <button
                key={pct}
                onClick={() => onExecuteSellPct(pct)}
                className="py-1.5 rounded-full bg-[#FF4D6A]/10 hover:bg-[#FF4D6A]/20 border border-[#FF4D6A]/40 text-[#FF4D6A] font-mono-tabular font-bold text-[11.5px] transition-all active:scale-95"
              >
                {pct}%
                {hotkeysEnabled && (
                  <span className="block text-[8.5px] text-[#7C8496] font-normal leading-none mt-0.5">
                    [Spc+{keys[idx]}]
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-2.5 text-[10.5px] text-[#94A3B8] font-mono-tabular">
          <div className="flex items-center gap-2">
            <span>🏃 {presetConfig.slippagePct}%</span>
            <span className="text-[#262D40]">|</span>
            <span>⛽ {presetConfig.priorityFeeEth}</span>
            <span className="text-[#262D40]">|</span>
            <span className="text-[#2CE59B]">0% Fee</span>
          </div>
          <button
            onClick={() => onExecuteSellPct(50)}
            className="text-[#FF4D6A] hover:underline font-sans font-bold text-[11px]"
            title="Sell Initial Principal Investment"
          >
            Sell Init.
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. TRADER SCAN POPOVER (Matches trader_scan.png 1:1)
// ============================================================================
interface TraderScanPopoverProps {
  makerAddress: string;
  tokenSymbol: string;
  onClose: () => void;
  onTrackWallet: (address: string) => void;
  onFilterByMaker: (address: string) => void;
}

export const TraderScanPopover: React.FC<TraderScanPopoverProps> = ({
  makerAddress,
  tokenSymbol,
  onClose,
  onTrackWallet,
  onFilterByMaker,
}) => {
  const [copied, setCopied] = useState(false);

  // Deterministic wallet stats from address hash so every wallet has realistic consistent scan data
  let h = 0;
  for (let i = 0; i < makerAddress.length; i++) {
    h = (h << 5) - h + makerAddress.charCodeAt(i);
    h |= 0;
  }
  const abs = Math.abs(h);
  const boughtUsd = 420 + (abs % 8400);
  const buysCount = 1 + (abs % 9);
  const soldUsd = abs % 2 === 0 ? Math.round(boughtUsd * 1.42) : Math.round(boughtUsd * 0.65);
  const sellsCount = abs % 6;
  const pnlUsd = soldUsd - boughtUsd + Math.round((abs % 1800) - 400);
  const remainingUsd = Math.max(0, Math.round((boughtUsd + pnlUsd - soldUsd) * 1.1));
  const supplyPct = ((remainingUsd / 450000) * 100).toFixed(2);
  const holdMins = 2 + (abs % 55);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-72 p-3 rounded-xl bg-[#0B0D13] border border-[#232838] shadow-2xl text-left z-50 animate-in fade-in duration-150"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono-tabular text-[12px] font-bold text-[#E2E8F0]">
            {makerAddress}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(makerAddress);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="text-[#7C8496] hover:text-white"
          >
            {copied ? <Check className="w-3 h-3 text-[#2CE59B]" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-[#2CE59B] bg-[#2CE59B]/10 px-1.5 py-0.5 rounded">
            Trader Scan
          </span>
          <button onClick={onClose} className="text-[#7C8496] hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 3 boxes: Bought | Sold | PnL */}
      <div className="grid grid-cols-3 gap-1.5 mb-1.5">
        <div className="p-2 rounded-lg bg-[#10131C] border border-[#1B202E] text-center">
          <div className="text-[12px] font-bold font-mono-tabular text-[#2CE59B]">
            ↓ {formatCompactUsd(boughtUsd)}
          </div>
          <div className="text-[10px] text-[#7C8496] mt-0.5">
            <span className="text-[#2CE59B] font-semibold">{buysCount}</span> Buys
          </div>
        </div>
        <div className="p-2 rounded-lg bg-[#10131C] border border-[#1B202E] text-center">
          <div className="text-[12px] font-bold font-mono-tabular text-[#FF4D6A]">
            ↑ {formatCompactUsd(soldUsd)}
          </div>
          <div className="text-[10px] text-[#7C8496] mt-0.5">
            <span className="text-[#FF4D6A] font-semibold">{sellsCount}</span> Sells
          </div>
        </div>
        <div className="p-2 rounded-lg bg-[#10131C] border border-[#1B202E] text-center">
          <div
            className={`text-[12px] font-bold font-mono-tabular ${
              pnlUsd >= 0 ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
            }`}
          >
            {pnlUsd >= 0 ? '+' : ''}
            {formatCompactUsd(pnlUsd)}
          </div>
          <div className="text-[10px] text-[#7C8496] mt-0.5">PnL</div>
        </div>
      </div>

      {/* Bottom 2 boxes: Remaining Balance | Holder Since */}
      <div className="grid grid-cols-2 gap-1.5 mb-2.5">
        <div className="p-2 rounded-lg bg-[#10131C] border border-[#1B202E] text-center">
          <div className="text-[12px] font-bold font-mono-tabular text-white flex items-center justify-center gap-1">
            <Wallet className="w-3 h-3 text-[#7C8496]" />
            {formatCompactUsd(remainingUsd)}
          </div>
          <div className="text-[10px] text-[#7C8496] mt-0.5 font-mono-tabular">
            {supplyPct}% ({tokenSymbol})
          </div>
        </div>
        <div className="p-2 rounded-lg bg-[#10131C] border border-[#1B202E] text-center">
          <div className="text-[12px] font-bold font-mono-tabular text-white flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-[#7C8496]" />
            {holdMins}m
          </div>
          <div className="text-[10px] text-[#7C8496] mt-0.5">Holder Since</div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1B202E]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFilterByMaker(makerAddress)}
            className="p-1.5 rounded bg-[#141824] hover:bg-[#1E2436] text-[#94A3B8] hover:text-white transition-colors"
            title="Filter Orderbook by this Trader"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
          <a
            href={`https://explorer.testnet.chain.robinhood.com/address/${makerAddress}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded bg-[#141824] hover:bg-[#1E2436] text-[#94A3B8] hover:text-white transition-colors"
            title="View on Blockscout Explorer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <button
          onClick={() => {
            onTrackWallet(makerAddress);
            onClose();
          }}
          className="px-2.5 py-1 rounded-lg bg-[#526FFF] hover:bg-[#647EFF] text-white text-[11px] font-bold transition-colors"
        >
          + Track Wallet
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 3. FLOATING WALLET TRACKER / LIVE TRADES DRAWER (Matches wallet_tracker.png)
// ============================================================================
interface FloatingWalletTrackerProps {
  open: boolean;
  onClose: () => void;
  wallets: TrackedWallet[];
  onAddWallet: (emoji: string, label: string, address: string) => void;
  onRemoveWallet: (address: string) => void;
  onToggleCopyTrade: (address: string) => void;
  quickBuyEth: string;
  onQuickCopyBuy: (tokenSymbol: string, amountEth: string) => void;
}

export const FloatingWalletTrackerModal: React.FC<FloatingWalletTrackerProps> = ({
  open,
  onClose,
  wallets,
  onAddWallet,
  onRemoveWallet,
  onToggleCopyTrade,
  quickBuyEth,
  onQuickCopyBuy,
}) => {
  const [subTab, setSubTab] = useState<'manager' | 'live'>('live');
  const [newEmoji, setNewEmoji] = useState('🐋');
  const [newName, setNewName] = useState('');
  const [newAddr, setNewAddr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!open) return null;

  const filteredWallets = wallets.filter(
    (w) =>
      w.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed bottom-11 left-6 z-40 w-[540px] rounded-xl bg-[#0B0D13]/98 border border-[#222838] shadow-2xl backdrop-blur-xl overflow-hidden select-none">
      {/* Header matching wallet_tracker.png */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#1B202E] bg-[#080A0F]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('manager')}
            className={`px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors ${
              subTab === 'manager'
                ? 'bg-[#171C29] text-white'
                : 'text-[#7C8496] hover:text-white'
            }`}
          >
            Wallet Manager
          </button>
          <button
            onClick={() => setSubTab('live')}
            className={`px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors flex items-center gap-1.5 ${
              subTab === 'live'
                ? 'bg-[#171C29] text-white'
                : 'text-[#7C8496] hover:text-white'
            }`}
          >
            <span>Live Trades</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6A] animate-pulse" />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <Bell className="w-3.5 h-3.5 text-[#7C8496] hover:text-white cursor-pointer" />
          <span className="text-[11px] font-bold text-[#526FFF]">P1</span>
          <div className="px-2.5 py-0.5 rounded-full bg-[#141824] border border-[#262D40] text-[11px] font-mono-tabular text-white flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#526FFF] fill-current" />
            <span>{quickBuyEth} ETH</span>
          </div>
          <button onClick={onClose} className="text-[#7C8496] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {subTab === 'live' ? (
        <div className="max-h-[300px] overflow-y-auto divide-y divide-[#151924]">
          <div className="grid grid-cols-12 px-3.5 py-1.5 text-[10px] font-semibold text-[#7C8496] bg-[#090B10]">
            <div className="col-span-4">Time / Wallet</div>
            <div className="col-span-4">Token</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">MC / Action</div>
          </div>
          {wallets.map((w) => (
            <div
              key={w.address}
              className="grid grid-cols-12 items-center px-3.5 py-2 hover:bg-[#10141F] transition-colors text-[12px]"
            >
              <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                <span className="text-[10.5px] text-[#7C8496] font-mono-tabular w-7 shrink-0">
                  {w.lastAction.timeAgo}
                </span>
                <span>{w.emoji || '🐋'}</span>
                <span className="font-semibold text-[#F3F5F8] truncate">{w.label}</span>
              </div>
              <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                <TokenAvatar symbol={w.lastAction.symbol} size="xs" rounded="md" />
                <span className="font-bold text-white truncate">{w.lastAction.symbol}</span>
                <span className="text-[10.5px] text-[#2CE59B] font-mono-tabular">
                  {w.lastAction.side}
                </span>
              </div>
              <div className="col-span-2 text-right font-mono-tabular">
                <span
                  className={
                    w.lastAction.side === 'BUY' ? 'text-[#2CE59B] font-bold' : 'text-[#FF4D6A] font-bold'
                  }
                >
                  {w.lastAction.amountEth} ETH
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1.5">
                <span className="text-[11px] font-mono-tabular text-[#D1D5DB]">
                  {formatCompactUsd(w.lastAction.marketCapUsd)}
                </span>
                <button
                  onClick={() => onQuickCopyBuy(w.lastAction.symbol, quickBuyEth)}
                  className="p-1 rounded bg-[#526FFF] hover:bg-[#647EFF] text-white transition-colors"
                  title={`Instant Copy Buy ${w.lastAction.symbol}`}
                >
                  <Zap className="w-3 h-3 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or address..."
              className="flex-1 bg-[#090B10] border border-[#1E2433] rounded-lg px-2.5 py-1 text-[11.5px] text-white focus:outline-none focus:border-[#526FFF]"
            />
          </div>

          <div className="max-h-[200px] overflow-y-auto divide-y divide-[#151924] mb-3">
            {filteredWallets.map((w) => (
              <div
                key={w.address}
                className="flex items-center justify-between py-2 px-1 text-[12px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span>{w.emoji || '🐋'}</span>
                  <span className="font-bold text-white truncate">{w.label}</span>
                  <span className="text-[11px] text-[#7C8496] font-mono-tabular">
                    {w.address.slice(0, 6)}...{w.address.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleCopyTrade(w.address)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      w.copyTradeEnabled
                        ? 'bg-[#2CE59B]/15 text-[#2CE59B] border-[#2CE59B]/40'
                        : 'bg-[#141824] text-[#7C8496] border-[#262D40]'
                    }`}
                  >
                    {w.copyTradeEnabled ? 'Auto-Copy ON' : 'Copy OFF'}
                  </button>
                  <Bell className="w-3.5 h-3.5 text-[#FF4D6A]" />
                  <button
                    onClick={() => onRemoveWallet(w.address)}
                    className="text-[#7C8496] hover:text-[#FF4D6A]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Wallet Row matching bottom_bar.png */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-[#1B202E]">
            <input
              type="text"
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              className="w-9 text-center bg-[#090B10] border border-[#1E2433] rounded-lg py-1 text-[12px]"
              title="Emoji"
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Wallet Name (e.g. Frank)"
              className="w-32 bg-[#090B10] border border-[#1E2433] rounded-lg px-2 py-1 text-[11.5px] text-white"
            />
            <input
              type="text"
              value={newAddr}
              onChange={(e) => setNewAddr(e.target.value)}
              placeholder="0x... or Solana Address"
              className="flex-1 bg-[#090B10] border border-[#1E2433] rounded-lg px-2 py-1 text-[11.5px] text-white font-mono-tabular"
            />
            <button
              onClick={() => {
                if (!newName.trim() || !newAddr.trim()) return;
                onAddWallet(newEmoji, newName.trim(), newAddr.trim());
                setNewName('');
                setNewAddr('');
              }}
              className="px-3 py-1 rounded-full bg-[#526FFF] hover:bg-[#647EFF] text-white font-bold text-[11.5px]"
            >
              Add Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. FLOATING TWITTER ALERTS MONITOR (Matches tweet_monitor.png 1:1)
// ============================================================================
interface FloatingTwitterMonitorProps {
  open: boolean;
  onClose: () => void;
  tweets: TweetAlertItem[];
  onAddCustomTweetHandle: (handle: string) => void;
  onQuickBuyDetectedToken: (symbol: string) => void;
}

export const FloatingTwitterMonitorModal: React.FC<FloatingTwitterMonitorProps> = ({
  open,
  onClose,
  tweets,
  onAddCustomTweetHandle,
  onQuickBuyDetectedToken,
}) => {
  const [newHandle, setNewHandle] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed bottom-11 left-[560px] z-40 w-[390px] rounded-xl bg-[#0B0D13]/98 border border-[#222838] shadow-2xl backdrop-blur-xl overflow-hidden select-none">
      {/* Header matching tweet_monitor.png */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#1B202E] bg-[#080A0F]">
        <div className="flex items-center gap-1.5">
          <span className="text-[12.5px] font-bold text-white">Twitter Alerts</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6A] animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddInput(!showAddInput)}
            className="px-2 py-0.5 rounded bg-[#141824] hover:bg-[#1E2436] text-[10.5px] font-semibold text-[#94A3B8] hover:text-white flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Handle
          </button>
          <button onClick={onClose} className="text-[#7C8496] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showAddInput && (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0E111A] border-b border-[#1B202E]">
          <input
            type="text"
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
            placeholder="@handle or keyword (e.g. @elonmusk)"
            className="flex-1 bg-[#06070B] border border-[#222838] rounded px-2 py-1 text-[11.5px] text-white"
          />
          <button
            onClick={() => {
              if (!newHandle.trim()) return;
              onAddCustomTweetHandle(newHandle.trim());
              setNewHandle('');
              setShowAddInput(false);
            }}
            className="px-2.5 py-1 rounded bg-[#526FFF] text-white text-[11px] font-bold"
          >
            Track
          </button>
        </div>
      )}

      <div className="max-h-[380px] overflow-y-auto divide-y divide-[#161A26]">
        {tweets.map((tw) => (
          <div key={tw.id} className="p-3.5 hover:bg-[#0E111A] transition-colors">
            <div className="flex items-start gap-2.5">
              <img
                src={tw.avatarUrl}
                alt={tw.author}
                className="w-8 h-8 rounded-full object-cover border border-[#222838] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 truncate">
                    <span className="font-bold text-[12.5px] text-white truncate">
                      {tw.author}
                    </span>
                    {tw.verified && (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#38BDF8] text-[#06070B] flex items-center justify-center text-[9px] font-black shrink-0">
                        ✓
                      </span>
                    )}
                    <span className="text-[11px] text-[#7C8496] truncate">
                      {tw.handle} · {tw.timeAgo} · {tw.timestamp}
                    </span>
                  </div>
                </div>

                <p className="text-[12.5px] text-[#F3F5F8] mt-1 leading-relaxed">{tw.text}</p>

                {/* Quoted Tweet Box (matches tweet_monitor.png) */}
                {tw.quoteAuthor && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#080A0F] border border-[#1E2433]">
                    <div className="flex items-center gap-1 text-[11px] mb-1">
                      <span className="font-bold text-white">{tw.quoteAuthor}</span>
                      <span className="w-3 h-3 rounded-full bg-[#38BDF8] text-[#06070B] flex items-center justify-center text-[8px] font-black">
                        ✓
                      </span>
                      <span className="text-[#7C8496]">{tw.quoteHandle}</span>
                    </div>
                    <p className="text-[11.5px] text-[#D1D5DB]">{tw.quoteText}</p>
                    {tw.imageBannerText && (
                      <div className="mt-2 py-4 px-3 rounded-lg bg-[#050608] border border-[#1B202E] text-center font-extrabold text-[14px] text-white tracking-tight">
                        {tw.imageBannerText}
                      </div>
                    )}
                  </div>
                )}

                {/* Instant Snipe Detected Ticker Button */}
                {tw.detectedTicker && (
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#161A26]">
                    <span className="text-[10.5px] text-[#7C8496]">
                      Narrative Catalyst:{' '}
                      <strong className="text-[#2CE59B]">${tw.detectedTicker}</strong>
                    </span>
                    <button
                      onClick={() => onQuickBuyDetectedToken(tw.detectedTicker!)}
                      className="px-2.5 py-1 rounded-full bg-[#526FFF] hover:bg-[#647EFF] text-white text-[10.5px] font-bold flex items-center gap-1"
                    >
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      Quick Buy ${tw.detectedTicker}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
