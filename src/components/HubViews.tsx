import React, { useState } from 'react';
import {
  TrendingUp,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Download,
  Upload,
  Wallet,
  ShieldCheck,
  Zap,
  Award,
  Users,
  Share2,
  Eye,
  EyeOff,
  ArrowDown,
  Flame,
  Sparkles,
  Search,
  CheckCircle2,
  Boxes,
  Crown,
} from 'lucide-react';
import {
  TokenMarket,
  TrackedWallet,
  TradePrint,
  SubWalletItem,
  formatCompactUsd,
} from '../lib/marketData';
import { TokenAvatar } from './TokenAvatar';

// ============================================================================
// 1. YIELD / STAKING VIEW (Matches staking.png 1:1)
// ============================================================================
interface YieldViewProps {
  ethBalance: number;
  stakedEth: number;
  stakedUsdc: number;
  onStakeEth: (amount: number) => void;
  onUnstakeEth: (amount: number) => void;
  onStakeUsdc: (amount: number) => void;
}

export const YieldView: React.FC<YieldViewProps> = ({
  ethBalance,
  stakedEth,
  stakedUsdc,
  onStakeEth,
  onUnstakeEth,
  onStakeUsdc,
}) => {
  const [assetTab, setAssetTab] = useState<'native' | 'usdc'>('native');
  const [amountInput, setAmountInput] = useState('0.25');

  return (
    <div className="flex-1 overflow-y-auto ax-ambient-canvas relative flex flex-col items-center justify-center p-6 min-h-[calc(100vh-88px)]">
      {/* Decorative Floating Geometric Outlines matching staking.png */}
      <div className="pointer-events-none absolute left-[18%] top-[16%] w-40 h-40 rounded-3xl border border-[#526FFF]/25 rotate-[28deg]" />
      <div className="pointer-events-none absolute left-[15%] bottom-[16%] w-24 h-24 rounded-2xl border border-[#526FFF]/20 rotate-[6deg]" />
      <div className="pointer-events-none absolute right-[16%] bottom-[14%] w-36 h-36 rounded-full border border-[#2CE59B]/20" />

      {/* Center Staking Card (Matches staking.png 1:1) */}
      <div className="w-full max-w-[460px] rounded-2xl bg-[#0B0D13]/95 border border-[#1B202E] p-5 shadow-2xl backdrop-blur-xl z-10">
        {/* Top Asset Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#07090D] border border-[#161A26] mb-5">
          <button
            onClick={() => setAssetTab('native')}
            className={`py-2 rounded-lg text-[12.5px] font-bold transition-all ${
              assetTab === 'native'
                ? 'bg-[#222738] text-white shadow'
                : 'text-[#7C8496] hover:text-white'
            }`}
          >
            Native ETH / SOL
          </button>
          <button
            onClick={() => setAssetTab('usdc')}
            className={`py-2 rounded-lg text-[12.5px] font-bold transition-all ${
              assetTab === 'usdc'
                ? 'bg-[#222738] text-white shadow'
                : 'text-[#7C8496] hover:text-white'
            }`}
          >
            USDC Vault
          </button>
        </div>

        {/* Inner Vault Box */}
        <div className="p-4 rounded-xl bg-[#0E1118] border border-[#181D2A]">
          <div className="flex items-center gap-3.5 mb-5">
            <TokenAvatar
              symbol={assetTab === 'native' ? 'ETH' : 'USDC'}
              size="lg"
              rounded="full"
            />
            <div>
              <div className="text-[22px] font-extrabold text-white leading-tight">
                {assetTab === 'native' ? 'ETH (osETH)' : 'USDC (Marginfi / HLP)'}
              </div>
              <div className="text-[13.5px] font-bold text-[#2CE59B] font-mono-tabular">
                {assetTab === 'native' ? '6.71% APY' : '11.84% APY'}
              </div>
            </div>
          </div>

          {/* Staked vs Available Boxes */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-[#090B10] border border-[#171C28]">
              <div className="text-[11px] text-[#7C8496] mb-1">Staked Balance</div>
              <div className="text-[15px] font-bold font-mono-tabular text-white">
                {assetTab === 'native'
                  ? `${stakedEth.toFixed(4)} osETH`
                  : `${stakedUsdc.toFixed(2)} osUSDC`}
              </div>
              <div className="text-[10.5px] text-[#7C8496] font-mono-tabular mt-0.5">
                ≈ {assetTab === 'native' ? `${stakedEth.toFixed(4)} ETH` : `$${stakedUsdc.toFixed(2)}`}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#090B10] border border-[#171C28]">
              <div className="text-[11px] text-[#7C8496] mb-1">Available Balance</div>
              <div className="text-[15px] font-bold font-mono-tabular text-white">
                {assetTab === 'native'
                  ? `${ethBalance.toFixed(4)} ETH`
                  : `$${(ethBalance * 3042.85).toFixed(2)}`}
              </div>
              <div className="text-[10.5px] text-[#2CE59B] font-mono-tabular mt-0.5">
                0% Validator Commission
              </div>
            </div>
          </div>

          {/* Stake Amount Input */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] text-[#7C8496] mb-1">
              <span>Amount to Stake / Unstake</span>
              <button
                onClick={() =>
                  setAmountInput(
                    assetTab === 'native'
                      ? Math.max(0.01, ethBalance * 0.5).toFixed(3)
                      : '500'
                  )
                }
                className="text-[#526FFF] hover:underline font-semibold"
              >
                50% Max
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full bg-[#07090D] border border-[#1E2433] rounded-lg px-3 py-2 text-[13px] font-mono-tabular font-bold text-white focus:outline-none focus:border-[#526FFF]"
            />
          </div>

          {/* Harmonic MEV Info Box matching staking.png */}
          <div className="p-3.5 rounded-xl bg-[#526FFF]/10 border border-[#526FFF]/30 mb-5">
            <div className="flex items-center gap-2 text-[12.5px] font-bold text-white mb-1">
              <TrendingUp className="w-4 h-4 text-[#526FFF]" />
              <span>
                Earn Staking Yield on {assetTab === 'native' ? 'ETH / SOL' : 'USDC'}
              </span>
            </div>
            <p className="text-[11.5px] text-[#94A3B8] leading-relaxed">
              Stake natively with One Shot&apos;s high-performance validator to receive 100% of MEV
              and staking rewards with <strong className="text-[#2CE59B]">0% commission</strong>!
              Now running on Harmonic orderflow for increased yield.
            </p>
          </div>

          {/* Unstake & Stake Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUnstakeEth(Number(amountInput) || 0.1)}
              className="py-2.5 rounded-full bg-[#222736] hover:bg-[#2C3347] text-white font-bold text-[13px] transition-all active:scale-95"
            >
              Unstake
            </button>
            <button
              onClick={() =>
                assetTab === 'native'
                  ? onStakeEth(Number(amountInput) || 0.1)
                  : onStakeUsdc(Number(amountInput) || 100)
              }
              className="py-2.5 rounded-full bg-[#526FFF] hover:bg-[#647EFF] text-white font-bold text-[13px] transition-all active:scale-95 shadow-lg shadow-[#526FFF]/25"
            >
              Stake
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. VISION VIEW (KOL Screener, Smart Money Cards & Bundle Checker)
// ============================================================================
interface VisionViewProps {
  wallets: TrackedWallet[];
  tokens: TokenMarket[];
  onTrackWallet: (emoji: string, label: string, address: string) => void;
  onToggleCopyTrade: (address: string) => void;
  onSelectToken: (token: TokenMarket) => void;
  onQuickBuy: (token: TokenMarket, e: React.MouseEvent) => void;
}

export const VisionView: React.FC<VisionViewProps> = ({
  wallets,
  tokens,
  onTrackWallet,
  onToggleCopyTrade,
  onSelectToken,
  onQuickBuy,
}) => {
  const [timeframe, setTimeframe] = useState<'1d' | '3d' | '7d' | '30d'>('7d');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'KOL' | 'SNIPER' | 'BUNDLES'>('ALL');

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-[#06070B]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-extrabold text-white tracking-tight">Vision</h1>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#526FFF]/15 text-[#526FFF] border border-[#526FFF]/30">
              KOL & Smart Money Screener
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#2CE59B]/15 text-[#2CE59B] border border-[#2CE59B]/30">
              Live Bundle Checker Active
            </span>
          </div>
          <p className="text-[12px] text-[#7C8496] mt-0.5">
            Real-time on-chain performance cards for top KOLs, high-win-rate migration snipers, and block-level bundle detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0B0D13] border border-[#1B202E] rounded-lg p-0.5">
            {(['ALL', 'KOL', 'SNIPER', 'BUNDLES'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-md text-[11.5px] font-bold transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#526FFF] text-white'
                    : 'text-[#7C8496] hover:text-white'
                }`}
              >
                {cat === 'ALL'
                  ? 'All Traders'
                  : cat === 'KOL'
                    ? '👑 KOL Wallets'
                    : cat === 'SNIPER'
                      ? '🎯 Migration Snipers'
                      : '品 Bundle Scanner'}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#0B0D13] border border-[#1B202E] rounded-lg p-0.5">
            {(['1d', '3d', '7d', '30d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md text-[11.5px] font-bold font-mono-tabular transition-colors ${
                  timeframe === tf
                    ? 'bg-[#171C29] text-[#526FFF]'
                    : 'text-[#7C8496] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KOL & Smart Money Trader Cards Grid */}
      {categoryFilter !== 'BUNDLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {wallets
            .filter((w) => {
              if (categoryFilter === 'KOL') return w.tag === 'KOL';
              if (categoryFilter === 'SNIPER') return w.tag === 'Zero-Fee Sniper';
              return true;
            })
            .map((w) => (
              <div
                key={w.address}
                className="rounded-xl bg-[#0B0D13] border border-[#1B202E] hover:border-[#2C344B] p-4 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#141824] border border-[#262D40] flex items-center justify-center text-lg">
                        {w.emoji || '🦅'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[14px] text-white">{w.label}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-[#526FFF]/15 text-[#526FFF]">
                            {w.tag}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7C8496] font-mono-tabular mt-0.5">
                          {w.address.slice(0, 8)}...{w.address.slice(-6)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[15px] font-extrabold font-mono-tabular text-[#2CE59B]">
                        +{formatCompactUsd(w.pnl7dUsd)}
                      </div>
                      <div className="text-[11px] font-mono-tabular text-[#2CE59B]">
                        +{w.pnl7dPct.toFixed(1)}% ({timeframe})
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#080A0F] border border-[#151924] mb-3 text-center">
                    <div>
                      <div className="text-[10px] text-[#7C8496]">Win Rate</div>
                      <div className="text-[12.5px] font-bold font-mono-tabular text-[#2CE59B]">
                        {w.winRatePct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#7C8496]">Trades ({timeframe})</div>
                      <div className="text-[12.5px] font-bold font-mono-tabular text-white">
                        {w.trades7d}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#7C8496]">Avg Hold</div>
                      <div className="text-[12.5px] font-bold font-mono-tabular text-[#38BDF8]">
                        {w.avgHoldTime || '22m'}
                      </div>
                    </div>
                  </div>

                  {/* Latest Trade Signal */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#10141E] border border-[#1B202E] mb-3 text-[11.5px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2CE59B]/15 text-[#2CE59B]">
                        {w.lastAction.side}
                      </span>
                      <TokenAvatar symbol={w.lastAction.symbol} size="xs" rounded="md" />
                      <span className="font-bold text-white">{w.lastAction.symbol}</span>
                    </div>
                    <div className="font-mono-tabular text-[#D1D5DB]">
                      {w.lastAction.amountEth} ETH ·{' '}
                      <span className="text-[#2CE59B]">{w.lastAction.timeAgo}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleCopyTrade(w.address)}
                    className={`flex-1 py-1.5 rounded-lg text-[11.5px] font-bold border transition-all ${
                      w.copyTradeEnabled
                        ? 'bg-[#2CE59B]/15 text-[#2CE59B] border-[#2CE59B]/40'
                        : 'bg-[#141824] hover:bg-[#1C2233] text-white border-[#262D40]'
                    }`}
                  >
                    {w.copyTradeEnabled ? '✓ Auto-Copy Active' : 'Enable Copy Trade'}
                  </button>
                  <button
                    onClick={(e) => {
                      const found = tokens.find((t) => t.symbol === w.lastAction.symbol) || tokens[0];
                      onQuickBuy(found, e);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#526FFF] hover:bg-[#647EFF] text-white text-[11.5px] font-bold flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    Mirror {w.lastAction.symbol}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Bundle Checker & Block-Pattern Scanner */}
      <div className="rounded-xl bg-[#0B0D13] border border-[#1B202E] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1B202E] bg-[#080A0F]">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[#526FFF]" />
            <span className="font-bold text-[13.5px] text-white">
              Bundle Checker — Live Block-Signature Scanner
            </span>
          </div>
          <span className="text-[11px] text-[#7C8496]">
            Flags when 4+ coordinated transactions land in the same block
          </span>
        </div>

        <div className="divide-y divide-[#151924]">
          {tokens.slice(0, 6).map((t) => {
            const isClean = t.security.bundlerPct <= 5;
            return (
              <div
                key={t.address}
                onClick={() => onSelectToken(t)}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-[#10141F] cursor-pointer transition-colors text-[12px]"
              >
                <div className="flex items-center gap-3">
                  <TokenAvatar symbol={t.symbol} address={t.address} size="sm" rounded="md" />
                  <div>
                    <div className="font-bold text-white">
                      {t.symbol}{' '}
                      <span className="text-[#7C8496] font-normal text-[11px]">{t.name}</span>
                    </div>
                    <div className="text-[10.5px] text-[#7C8496] font-mono-tabular">
                      Dev: {t.security.devSold ? 'DS (0%)' : `${t.security.devHoldingPct}%`} · Snipers:{' '}
                      {t.security.snipersPct}% · Insiders: {t.security.insidersPct ?? 0}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono-tabular font-bold border ${
                      isClean
                        ? 'bg-[#2CE59B]/10 text-[#2CE59B] border-[#2CE59B]/30'
                        : 'bg-[#FF4D6A]/10 text-[#FF4D6A] border-[#FF4D6A]/30'
                    }`}
                  >
                    Bundle: {t.security.bundlerPct}% ({isClean ? 'Organic Flow' : 'Cluster Detected'})
                  </span>
                  <button
                    onClick={(e) => onQuickBuy(t, e)}
                    className="px-3 py-1 rounded-full bg-[#526FFF] hover:bg-[#647EFF] text-white font-bold text-[11px]"
                  >
                    Trade
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. PORTFOLIO & MULTI-WALLET VIEW (Matches portfolio_spot.png, portfolio_perp.png, multi_wallet.png)
// ============================================================================
interface PortfolioViewProps {
  ethBalance: number;
  ethPriceUsd: number;
  tokenHoldings: Record<string, number>;
  tokens: TokenMarket[];
  trades: TradePrint[];
  subWallets: SubWalletItem[];
  onCreateSubWallet: (name: string) => void;
  onDistributeEth: (amountPerWallet: number) => void;
  onSelectToken: (token: TokenMarket) => void;
  onQuickSellFull: (token: TokenMarket) => void;
  onOpenSharePnl: (token: TokenMarket) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  ethBalance,
  ethPriceUsd,
  tokenHoldings,
  tokens,
  trades,
  subWallets,
  onCreateSubWallet,
  onDistributeEth,
  onSelectToken,
  onQuickSellFull,
  onOpenSharePnl,
}) => {
  const [subTab, setSubTab] = useState<'spot' | 'perps' | 'wallets'>('spot');
  const [tf, setTf] = useState<'7d' | '30d' | 'Max'>('Max');
  const [walletSearch, setWalletSearch] = useState('');
  const [newWalletName, setNewWalletName] = useState('');

  // Compute holdings value
  const activePositions = tokens
    .map((t) => {
      const bal = tokenHoldings[t.symbol] || 0;
      const valUsd = bal * t.priceUsd;
      return { token: t, balance: bal, valueUsd: valUsd };
    })
    .filter((p) => p.balance > 0);

  const holdingsUsd = activePositions.reduce((acc, p) => acc + p.valueUsd, 0);
  const availableUsd = ethBalance * ethPriceUsd;
  const totalValueUsd = holdingsUsd + availableUsd;

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-[#06070B]">
      {/* Top Sub-Navigation matching portfolio_spot.png & portfolio_perp.png */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSubTab('spot')}
            className={`text-[18px] font-bold transition-colors ${
              subTab === 'spot' ? 'text-white' : 'text-[#646D80] hover:text-white'
            }`}
          >
            Spot
          </button>
          <button
            onClick={() => setSubTab('perps')}
            className={`text-[18px] font-bold transition-colors ${
              subTab === 'perps' ? 'text-white' : 'text-[#646D80] hover:text-white'
            }`}
          >
            Perpetuals
          </button>
          <button
            onClick={() => setSubTab('wallets')}
            className={`text-[18px] font-bold transition-colors flex items-center gap-1.5 ${
              subTab === 'wallets' ? 'text-white' : 'text-[#646D80] hover:text-white'
            }`}
          >
            <span>Multi-Wallet</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#526FFF]/20 text-[#526FFF] font-mono-tabular">
              {subWallets.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#7C8496] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={walletSearch}
              onChange={(e) => setWalletSearch(e.target.value)}
              placeholder="Search for other wallets..."
              className="w-60 bg-[#0B0D13] border border-[#1B202E] rounded-full pl-8 pr-3 py-1 text-[12px] text-white focus:outline-none focus:border-[#526FFF]"
            />
          </div>

          <div className="flex items-center gap-2 text-[12px] font-bold">
            {(['7d', '30d', 'Max'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setTf(item)}
                className={
                  tf === item ? 'text-[#526FFF]' : 'text-[#7C8496] hover:text-white'
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {subTab === 'spot' && (
        <>
          {/* Top 3-Column Dashboard (Balance | PNL Chart | Performance) matching portfolio_spot.png */}
          <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#1B202E] rounded-xl bg-[#0B0D13] overflow-hidden mb-5">
            {/* Left: Balance */}
            <div className="lg:col-span-3 p-4 border-b lg:border-b-0 lg:border-r border-[#1B202E] flex flex-col justify-between">
              <div>
                <div className="text-[12px] font-semibold text-white mb-4">Balance</div>
                <div className="text-[11px] text-[#7C8496]">Total Value</div>
                <div className="text-[22px] font-extrabold font-mono-tabular text-white mt-0.5 mb-3">
                  {formatCompactUsd(totalValueUsd)}
                </div>

                <div className="text-[11px] text-[#7C8496]">Unrealized PNL</div>
                <div className="text-[16px] font-bold font-mono-tabular text-[#2CE59B] mt-0.5 pb-4 border-b border-[#161A26]">
                  +${(holdingsUsd * 0.24).toFixed(2)}
                </div>
              </div>

              <div className="pt-3">
                <div className="text-[11px] text-[#7C8496]">Available Balance</div>
                <div className="text-[16px] font-bold font-mono-tabular text-white mt-0.5">
                  {formatCompactUsd(availableUsd)} ({ethBalance.toFixed(4)} ETH)
                </div>
              </div>
            </div>

            {/* Center: PNL Area Chart */}
            <div className="lg:col-span-6 p-4 border-b lg:border-b-0 lg:border-r border-[#1B202E] flex flex-col justify-between">
              <div className="text-[12px] font-semibold text-white mb-2">PNL</div>
              <div className="h-44 w-full relative">
                <svg viewBox="0 0 600 160" className="w-full h-full preserve-3d">
                  <defs>
                    <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2CE59B" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#2CE59B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 145 L 55 145 L 85 112 L 120 120 L 145 42 L 195 62 L 240 65 L 275 44 L 325 48 L 365 25 L 405 55 L 445 20 L 495 45 L 545 52 L 580 32 L 600 38 L 600 160 L 0 160 Z"
                    fill="url(#pnlGrad)"
                  />
                  <path
                    d="M 0 145 L 55 145 L 85 112 L 120 120 L 145 42 L 195 62 L 240 65 L 275 44 L 325 48 L 365 25 L 405 55 L 445 20 L 495 45 L 545 52 L 580 32 L 600 38"
                    fill="none"
                    stroke="#2CE59B"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            {/* Right: Performance Breakdown matching portfolio_spot.png */}
            <div className="lg:col-span-3 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[12px] font-semibold text-white mb-3">
                  <span>Performance</span>
                  <Share2 className="w-3.5 h-3.5 text-[#7C8496] cursor-pointer hover:text-white" />
                </div>

                <div className="flex items-center justify-between text-[11.5px] mb-1.5">
                  <span className="text-[#7C8496]">Total PNL</span>
                  <span className="font-mono-tabular font-bold text-[#2CE59B]">+$4.13K</span>
                </div>
                <div className="flex items-center justify-between text-[11.5px] mb-4">
                  <span className="text-[#7C8496]">Total TXNS</span>
                  <span className="font-mono-tabular font-bold text-white">
                    252 <span className="text-[#2CE59B]">144</span> /{' '}
                    <span className="text-[#FF4D6A]">108</span>
                  </span>
                </div>

                {/* 5 Profitability Buckets */}
                <div className="space-y-1.5 text-[11px] font-mono-tabular">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#94A3B8]">
                      <span className="w-2 h-2 rounded-full bg-[#2CE59B]" /> &gt;500%
                    </span>
                    <span className="text-white">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#94A3B8]">
                      <span className="w-2 h-2 rounded-full bg-[#2CE59B]" /> 200% ~ 500%
                    </span>
                    <span className="text-white">6</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#94A3B8]">
                      <span className="w-2 h-2 rounded-full bg-[#2CE59B]" /> 0% ~ 200%
                    </span>
                    <span className="text-white">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#94A3B8]">
                      <span className="w-2 h-2 rounded-full bg-[#FF4D6A]" /> 0% ~ -50%
                    </span>
                    <span className="text-white">19</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#94A3B8]">
                      <span className="w-2 h-2 rounded-full bg-[#FF4D6A]" /> &lt; -50%
                    </span>
                    <span className="text-white">3</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-[#FF4D6A] overflow-hidden flex mt-3">
                <div className="h-full bg-[#2CE59B]" style={{ width: '72%' }} />
              </div>
            </div>
          </div>

          {/* Bottom Split: Active Positions (Left) | Activity Log (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Active Positions */}
            <div className="lg:col-span-6 rounded-xl bg-[#0B0D13] border border-[#1B202E] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1B202E]">
                <div className="flex items-center gap-4 text-[12.5px] font-bold">
                  <span className="text-white border-b-2 border-white pb-2 -mb-2.5">
                    Active Positions
                  </span>
                  <span className="text-[#7C8496]">History</span>
                </div>
                <span className="text-[11px] text-[#7C8496] font-mono-tabular">⇅ USD</span>
              </div>

              <div className="grid grid-cols-12 px-4 py-2 text-[10.5px] text-[#7C8496] border-b border-[#151924]">
                <div className="col-span-4">Token</div>
                <div className="col-span-2">Bought</div>
                <div className="col-span-2">Remaining</div>
                <div className="col-span-2">PnL ↓</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              <div className="divide-y divide-[#151924] max-h-[320px] overflow-y-auto">
                {activePositions.map(({ token, balance, valueUsd }) => (
                  <div
                    key={token.symbol}
                    onClick={() => onSelectToken(token)}
                    className="grid grid-cols-12 items-center px-4 py-2.5 hover:bg-[#10141F] cursor-pointer text-[11.5px]"
                  >
                    <div className="col-span-4 flex items-center gap-2 min-w-0">
                      <TokenAvatar symbol={token.symbol} address={token.address} size="sm" rounded="md" />
                      <div className="truncate">
                        <div className="font-bold text-white">{token.symbol}</div>
                        <div className="text-[10px] text-[#7C8496] truncate">{token.name}</div>
                      </div>
                    </div>
                    <div className="col-span-2 font-mono-tabular text-[#2CE59B]">
                      ${(valueUsd * 0.82).toFixed(2)}
                    </div>
                    <div className="col-span-2 font-mono-tabular text-white">
                      ${valueUsd.toFixed(2)}
                      <div className="text-[9.5px] text-[#7C8496]">{balance.toFixed(1)}</div>
                    </div>
                    <div className="col-span-2 font-mono-tabular text-[#2CE59B] font-bold">
                      +$
                      {(valueUsd * 0.18).toFixed(2)} (+21.9%)
                    </div>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="col-span-2 flex items-center justify-end gap-1.5"
                    >
                      <button
                        onClick={() => onQuickSellFull(token)}
                        className="px-2 py-0.5 rounded bg-[#FF4D6A]/15 hover:bg-[#FF4D6A]/25 text-[#FF4D6A] text-[10px] font-bold"
                      >
                        Sell 100%
                      </button>
                      <button
                        onClick={() => onOpenSharePnl(token)}
                        className="text-[#7C8496] hover:text-white"
                        title="Share PnL Card"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="lg:col-span-6 rounded-xl bg-[#0B0D13] border border-[#1B202E] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1B202E]">
                <span className="text-[12.5px] font-bold text-white">Activity</span>
                <span className="text-[11px] text-[#7C8496] font-mono-tabular">⇅ USD</span>
              </div>

              <div className="grid grid-cols-12 px-4 py-2 text-[10.5px] text-[#7C8496] border-b border-[#151924]">
                <div className="col-span-2">Type</div>
                <div className="col-span-4">Token</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Market Cap</div>
                <div className="col-span-2 text-right">Explorer</div>
              </div>

              <div className="divide-y divide-[#151924] max-h-[320px] overflow-y-auto">
                {trades.slice(0, 12).map((tr) => (
                  <div
                    key={tr.id}
                    className="grid grid-cols-12 items-center px-4 py-2.5 hover:bg-[#10141F] text-[11.5px]"
                  >
                    <div
                      className={`col-span-2 font-bold ${
                        tr.side === 'BUY' ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                      }`}
                    >
                      {tr.side === 'BUY' ? 'Buy' : 'Sell'}
                    </div>
                    <div className="col-span-4 flex items-center gap-2 min-w-0">
                      <TokenAvatar symbol={tr.tokenSymbol} size="xs" rounded="md" />
                      <span className="font-bold text-white truncate">{tr.tokenSymbol}</span>
                    </div>
                    <div className="col-span-2 font-mono-tabular text-white">
                      ${tr.totalUsd.toFixed(2)}
                    </div>
                    <div className="col-span-2 font-mono-tabular text-[#D1D5DB]">
                      {formatCompactUsd(tr.marketCapUsd)}
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2 text-[#7C8496]">
                      <span className="font-mono-tabular text-[10.5px]">{tr.timestamp}</span>
                      <a
                        href={`https://explorer.testnet.chain.robinhood.com/tx/${tr.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {subTab === 'perps' && (
        /* Matches portfolio_perp.png 1:1 */
        <div className="border border-[#1B202E] rounded-xl bg-[#0B0D13] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#1B202E]">
            <div className="lg:col-span-3 p-4 border-b lg:border-b-0 lg:border-r border-[#1B202E]">
              <div className="text-[12px] font-semibold text-white mb-4">Performance</div>
              <div className="text-[11px] text-[#7C8496]">All Time Volume</div>
              <div className="text-[20px] font-extrabold font-mono-tabular text-white mb-3">
                $34.4K
              </div>
              <div className="grid grid-cols-2 gap-2 pb-4 border-b border-[#161A26]">
                <div>
                  <div className="text-[11px] text-[#7C8496]">All Time PNL</div>
                  <div className="text-[15px] font-bold font-mono-tabular text-[#2CE59B]">
                    +$564.95
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#7C8496]">Number of Trades</div>
                  <div className="text-[15px] font-bold font-mono-tabular text-white">14</div>
                </div>
              </div>
              <div className="pt-3">
                <div className="text-[11px] text-[#7C8496]">Account Value</div>
                <div className="text-[16px] font-bold font-mono-tabular text-white">
                  {formatCompactUsd(availableUsd)}
                </div>
              </div>
            </div>
            <div className="lg:col-span-9 p-4">
              <div className="text-[12px] font-semibold text-white mb-2">PNL</div>
              <div className="h-44 w-full">
                <svg viewBox="0 0 600 160" className="w-full h-full">
                  <path
                    d="M 0 140 L 80 140 L 110 25 L 600 25 L 600 160 L 0 160 Z"
                    fill="#2CE59B"
                    fillOpacity="0.15"
                  />
                  <path
                    d="M 0 140 L 80 140 L 110 25 L 600 25"
                    fill="none"
                    stroke="#2CE59B"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-4 text-[12.5px] font-bold border-b border-[#1B202E] pb-2 mb-4">
              <span className="text-white">Open Positions</span>
              <span className="text-[#7C8496]">Trade History</span>
            </div>
            <div className="py-12 text-center text-[12.5px] text-[#7C8496]">
              Switch to the <strong className="text-white">Perpetuals</strong> tab to open or manage 50x zero-fee leveraged positions.
            </div>
          </div>
        </div>
      )}

      {subTab === 'wallets' && (
        /* Matches multi_wallet.png 1:1 */
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#1B202E] rounded-xl bg-[#0B0D13] overflow-hidden">
          <div className="lg:col-span-6 p-4 border-b lg:border-b-0 lg:border-r border-[#1B202E]">
            <div className="flex items-center justify-between gap-2 mb-4">
              <input
                type="text"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                placeholder="New wallet name (e.g. Flipping Wallet)..."
                className="flex-1 bg-[#07090D] border border-[#1E2433] rounded-full px-3 py-1.5 text-[12px] text-white"
              />
              <button
                onClick={() => {
                  onCreateSubWallet(newWalletName.trim() || `One Shot Sub #${subWallets.length + 1}`);
                  setNewWalletName('');
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#526FFF] hover:bg-[#647EFF] text-white text-[12px] font-bold"
              >
                Create Wallet
              </button>
            </div>

            <div className="grid grid-cols-12 px-2 py-1.5 text-[11px] text-[#7C8496] border-b border-[#161A26]">
              <div className="col-span-5">Wallet</div>
              <div className="col-span-3">Balance</div>
              <div className="col-span-2">Holdings</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            <div className="divide-y divide-[#161A26]">
              {subWallets.map((sw) => (
                <div
                  key={sw.id}
                  className="grid grid-cols-12 items-center px-2 py-3 text-[12px] hover:bg-[#10141F]"
                >
                  <div className="col-span-5 flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded border border-[#F59E0B] bg-[#F59E0B] inline-block" />
                    <div>
                      <div className="font-bold text-[#F59E0B]">{sw.name}</div>
                      <div className="text-[10.5px] text-[#7C8496] font-mono-tabular">
                        {sw.address.slice(0, 6)}...{sw.address.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 font-mono-tabular font-bold text-white">
                    {sw.balanceEth.toFixed(3)} ETH
                  </div>
                  <div className="col-span-2 font-mono-tabular text-[#D1D5DB]">
                    {sw.holdingsCount}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#2CE59B]/15 text-[#2CE59B] font-bold">
                      {sw.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 p-4 flex flex-col justify-between">
            <div>
              <div className="text-[13px] font-bold text-white mb-2">
                Source wallets → Multi-Wallet Splitter
              </div>
              <div className="h-44 rounded-xl border border-dashed border-[#232838] bg-[#080A0F] flex flex-col items-center justify-center text-center p-4">
                <ArrowDown className="w-6 h-6 text-[#7C8496] mb-2" />
                <div className="text-[12.5px] font-semibold text-[#94A3B8]">
                  Distribute ETH / SOL across Sub-Wallets for Anti-Bubble Privacy
                </div>
                <p className="text-[11px] text-[#646D80] mt-1 max-w-sm">
                  Disperse your trading balance across multiple non-custodial addresses to prevent copy-traders from tracking your size.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#1B202E]">
              <span className="text-[12px] text-[#7C8496]">
                Destination: <strong className="text-white">All {subWallets.length} Wallets</strong>
              </span>
              <button
                onClick={() => onDistributeEth(0.1)}
                className="px-4 py-2 rounded-full bg-[#526FFF] hover:bg-[#647EFF] text-white font-bold text-[12px]"
              >
                Start Transfer (0.1 ETH each)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. REWARDS & 0% FEE MULTIPLIER VIEW
// ============================================================================
interface RewardsViewProps {
  totalTradesCount: number;
  onClaimRewards: () => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  totalTradesCount,
  onClaimRewards,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const referralUrl = 'https://oneshot.trade/@oneshot';

  const tiers = [
    { icon: '🌲', name: 'Wood', mult: '1X', typicalFee: '0.95%', oneShotFee: '0.00%', rebate: '0.05%' },
    { icon: '🥉', name: 'Bronze', mult: '2X', typicalFee: '0.90%', oneShotFee: '0.00%', rebate: '0.10%' },
    { icon: '🥈', name: 'Silver', mult: '2.5X', typicalFee: '0.875%', oneShotFee: '0.00%', rebate: '0.125%' },
    { icon: '🥇', name: 'Gold', mult: '3X', typicalFee: '0.85%', oneShotFee: '0.00%', rebate: '0.15%' },
    { icon: '💿', name: 'Platinum', mult: '3.5X', typicalFee: '0.825%', oneShotFee: '0.00%', rebate: '0.175%' },
    { icon: '💎', name: 'Diamond', mult: '4X', typicalFee: '0.80%', oneShotFee: '0.00%', rebate: '0.20%' },
    { icon: '🏆', name: 'Champion', mult: '5X', typicalFee: '0.75%', oneShotFee: '0.00%', rebate: '0.25%' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 ax-ambient-canvas">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Hero: 3-Tier Referral Tree matching rewards.png */}
        <div className="rounded-2xl bg-[#080A10]/95 border border-[#1E2436] p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2CE59B]/15 text-[#2CE59B] text-[11px] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> 0.00% Platform Fees + 35% Sequencer Rebate Tree
              </div>
              <h1 className="text-[24px] font-extrabold text-white tracking-tight">
                One Shot Rewards, Points & 3-Tier Revenue Share
              </h1>
              <p className="text-[12.5px] text-[#94A3B8] mt-0.5">
                Unlike typical terminals (around 1.00% fee per trade), One Shot is 100% free and shares sequencer/LP rebates across 3 referral levels.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-xl bg-[#0D1018] border border-[#222838] font-mono-tabular text-[12px] text-white flex items-center gap-2">
                <span>{referralUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralUrl);
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 1500);
                  }}
                  className="text-[#526FFF] hover:text-white"
                >
                  {copiedRef ? <Check className="w-4 h-4 text-[#2CE59B]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={onClaimRewards}
                className="px-4 py-2 rounded-xl bg-[#526FFF] hover:bg-[#647EFF] text-white font-bold text-[12.5px] shadow-lg shadow-[#526FFF]/25"
              >
                Claim {(0.042 + totalTradesCount * 0.005).toFixed(3)} ETH Rebate
              </button>
            </div>
          </div>

          {/* Visual 3-Tier Pyramid Diagram matching rewards.png 1:1 */}
          <div className="py-6 px-4 rounded-xl bg-[#06070B] border border-[#171C29] text-center">
            {/* Level 0: You */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#526FFF]/20 border border-[#526FFF] flex items-center justify-center text-white mb-1 shadow-lg shadow-[#526FFF]/30">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[15px] font-bold text-white">You</span>
              <div className="w-px h-6 bg-[#526FFF]/50 my-1" />
            </div>

            {/* Level 1: 30% Direct */}
            <div className="relative py-3 border-t border-b border-[#526FFF]/30 bg-gradient-to-b from-[#526FFF]/15 to-transparent">
              <div className="text-[20px] font-extrabold text-white font-mono-tabular mb-2">
                30%
              </div>
              <div className="flex justify-around max-w-md mx-auto text-[12px] text-[#D1D5DB]">
                <span>👤 Direct (L1)</span>
                <span>👤 Direct (L1)</span>
              </div>
            </div>

            {/* Level 2: 3% Indirect */}
            <div className="relative py-3 border-b border-[#526FFF]/20 bg-gradient-to-b from-[#526FFF]/10 to-transparent">
              <div className="text-[18px] font-extrabold text-white font-mono-tabular mb-2">
                3%
              </div>
              <div className="grid grid-cols-4 max-w-2xl mx-auto text-[11.5px] text-[#94A3B8]">
                <span>👤 Indirect (L2)</span>
                <span>👤 Indirect (L2)</span>
                <span>👤 Indirect (L2)</span>
                <span>👤 Indirect (L2)</span>
              </div>
            </div>

            {/* Level 3: 2% Extended */}
            <div className="relative pt-3">
              <div className="text-[17px] font-extrabold text-white font-mono-tabular mb-2">
                2%
              </div>
              <div className="grid grid-cols-6 max-w-3xl mx-auto text-[11px] text-[#7C8496]">
                <span>👤 Third-Tier (L3)</span>
                <span>👤 Third-Tier (L3)</span>
                <span>👤 Third-Tier (L3)</span>
                <span>👤 Third-Tier (L3)</span>
                <span>👤 Third-Tier (L3)</span>
                <span>👤 Third-Tier (L3)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multiplier & Cashback Tier Table */}
        <div className="rounded-2xl bg-[#0B0D13] border border-[#1B202E] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1B202E] flex items-center justify-between">
            <span className="font-bold text-[14px] text-white">
              Multiplier Tiers & Cashback Schedule (One Shot 0% vs typical 1%)
            </span>
            <span className="text-[11.5px] text-[#2CE59B] font-mono-tabular font-bold">
              Your Active Points: {(1420 + totalTradesCount * 250).toLocaleString()} PTS
            </span>
          </div>
          <div className="grid grid-cols-5 px-5 py-2.5 text-[11px] font-semibold text-[#7C8496] bg-[#080A0F] border-b border-[#151924]">
            <div>Tier</div>
            <div>Multiplier</div>
            <div>Typical Net Fee</div>
            <div>One Shot Net Fee</div>
            <div className="text-right">Gas & LP Cashback</div>
          </div>
          <div className="divide-y divide-[#151924]">
            {tiers.map((t, idx) => (
              <div
                key={t.name}
                className={`grid grid-cols-5 items-center px-5 py-3 text-[12.5px] ${
                  idx === 6 ? 'bg-[#526FFF]/10' : 'hover:bg-[#10141F]'
                }`}
              >
                <div className="font-bold text-white flex items-center gap-2">
                  <span>{t.icon}</span>
                  <span>{t.name}</span>
                </div>
                <div className="font-mono-tabular font-bold text-[#526FFF]">{t.mult}</div>
                <div className="font-mono-tabular text-[#FF4D6A] line-through">{t.typicalFee}</div>
                <div className="font-mono-tabular font-extrabold text-[#2CE59B]">
                  {t.oneShotFee} (FREE)
                </div>
                <div className="text-right font-mono-tabular font-bold text-white">
                  +{t.rebate} ETH/SOL
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
