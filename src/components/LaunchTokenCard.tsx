import React, { useState } from 'react';
import {
  Copy,
  Check,
  Globe,
  Send,
  Search,
  Users,
  Crown,
  Crosshair,
  Ghost,
  Boxes,
  Zap,
  ShieldCheck,
  ChefHat,
  UserCheck,
  BarChart2,
} from 'lucide-react';
import { TokenMarket, formatCompactUsd } from '../lib/marketData';
import { TokenAvatar } from './TokenAvatar';

interface LaunchTokenCardProps {
  token: TokenMarket;
  selected: boolean;
  quickBuyEth: string;
  onSelect: (token: TokenMarket) => void;
  onQuickBuy: (token: TokenMarket, e: React.MouseEvent) => void;
  onInspectAudit: (token: TokenMarket, e: React.MouseEvent) => void;
  onSnipeMigration?: (token: TokenMarket, e: React.MouseEvent) => void;
  snipeArmed?: boolean;
}

export const LaunchTokenCard: React.FC<LaunchTokenCardProps> = ({
  token,
  selected,
  quickBuyEth,
  onSelect,
  onQuickBuy,
  onInspectAudit,
  onSnipeMigration,
  snipeArmed = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTweetPopup, setShowTweetPopup] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const totalTx5m = Math.max(1, token.buys5mCount + token.sells5mCount);
  const buyRatioPct = Math.min(95, Math.max(10, Math.round((token.buys5mCount / totalTx5m) * 100)));

  const top10Pct = Math.round(token.security.top10HoldersPct);
  const devSold = token.security.devSold ?? token.security.devHoldingPct === 0;
  const devPct = Math.round(token.security.devHoldingPct);
  const snipersPct = Math.round(token.security.snipersPct);
  const insidersPct = Math.round(token.security.insidersPct ?? 0);
  const bundlerPct = Math.round(token.security.bundlerPct);

  // Axiom Market Cap color coding: Cyan for early ($10K-$100K), Emerald for <$25K or >$1M, Gold for mid-cap
  const mcColorClass =
    token.marketCapUsd >= 1_000_000
      ? 'text-[#2CE59B]'
      : token.marketCapUsd >= 30_000
        ? 'text-[#38BDF8]'
        : 'text-[#2CE59B]';

  return (
    <div
      onClick={() => onSelect(token)}
      className={`group relative px-3 py-2.5 border-b border-[#161A24] transition-all cursor-pointer select-none ${
        selected
          ? 'bg-[#121622] border-l-2 border-l-[#526FFF]'
          : 'bg-[#090B10] hover:bg-[#0E121B]'
      }`}
    >
      {/* Twitter Narrative Preview Popup (Axiom Twitter Preview Popup feature) */}
      {showTweetPopup && token.tweetPreview && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-12 top-10 z-50 w-72 p-3 rounded-xl bg-[#0D1017]/98 border border-[#262D40] shadow-2xl backdrop-blur-xl animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-bold text-white">{token.tweetPreview.author}</span>
              {token.tweetPreview.verified && (
                <span className="w-3.5 h-3.5 rounded-full bg-[#38BDF8] text-[#06070B] flex items-center justify-center text-[9px] font-black">
                  ✓
                </span>
              )}
              <span className="text-[11px] text-[#7C8496]">{token.tweetPreview.handle}</span>
            </div>
            <span className="text-[10px] text-[#2CE59B] font-mono-tabular">
              {token.tweetPreview.timeAgo}
            </span>
          </div>
          <p className="text-[11.5px] text-[#E2E8F0] leading-snug mb-2">
            {token.tweetPreview.text}
          </p>
          <div className="flex items-center justify-between text-[10px] text-[#7C8496] pt-1.5 border-t border-[#1B202D]">
            <span>💬 Narrative Catalyst</span>
            <span>🔁 {token.tweetPreview.retweets}</span>
            <span>❤️ {token.tweetPreview.likes}</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-2.5">
        {/* Left: Square Avatar with Bonding Curve Ring + Launchpad Pill Badge */}
        <TokenAvatar
          symbol={token.symbol}
          name={token.name}
          address={token.address}
          iconUrl={token.iconUrl}
          size="xl"
          rounded="md"
          showChainBadge={true}
          bondingProgress={token.bondingProgress}
        />

        {/* Center: 3-Row Axiom Pulse Metadata */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Ticker + Full Name + Copy Icon */}
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-bold text-[13.5px] text-[#F3F5F8] tracking-tight truncate max-w-[95px]">
              {token.symbol}
            </span>
            <span className="text-[12px] text-[#7C8496] truncate max-w-[115px] font-medium">
              {token.name}
            </span>
            <button
              onClick={handleCopy}
              className="text-[#646D80] hover:text-white transition-colors shrink-0"
              title={`Copy CA: ${token.address}`}
            >
              {copied ? (
                <Check className="w-3 h-3 text-[#2CE59B]" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Row 2: Age + Social Icons + Holders + Pro Traders + KOL Crown */}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#848E9C]">
            <span className="text-[#2CE59B] font-semibold font-mono-tabular">{token.age}</span>

            {/* X / Twitter icon with Narrative Preview Hover */}
            <span
              onMouseEnter={() => setShowTweetPopup(true)}
              onMouseLeave={() => setShowTweetPopup(false)}
              className="text-[#94A3B8] hover:text-white transition-colors cursor-pointer font-bold text-[11px]"
              title="Hover for Twitter Narrative Preview"
            >
              𝕏
            </span>

            <Globe className="w-3 h-3 text-[#7C8496] hover:text-white transition-colors" />
            <Send className="w-3 h-3 text-[#7C8496] hover:text-white transition-colors" />
            <Search className="w-3 h-3 text-[#7C8496] hover:text-white transition-colors" />

            {/* Holders count */}
            <span className="inline-flex items-center gap-0.5 text-[#D1D5DB] font-mono-tabular">
              <Users className="w-3 h-3 text-[#7C8496]" />
              {token.holders >= 1000
                ? `${(token.holders / 1000).toFixed(1)}K`
                : token.holders}
            </span>

            {/* Pro Traders count */}
            <span
              className="inline-flex items-center gap-0.5 text-[#D1D5DB] font-mono-tabular"
              title="Pro Traders holding/trading"
            >
              <BarChart2 className="w-3 h-3 text-[#7C8496]" />
              {token.proTraders ?? 12}
            </span>

            {/* KOL / Crown count */}
            <span
              className="inline-flex items-center gap-0.5 text-[#D1D5DB] font-mono-tabular"
              title="Tracked KOLs holding"
            >
              <Crown className="w-3 h-3 text-[#F59E0B]/80" />
              {token.kolCount ?? 0}
            </span>
          </div>

          {/* Row 3: The 5 Axiom Security & Distribution Micro-Pills */}
          <div
            onClick={(e) => onInspectAudit(token, e)}
            className="flex items-center flex-wrap gap-1 mt-1.5"
          >
            {/* 1. Top 10 Holders % */}
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[10px] font-mono-tabular font-medium border ${
                top10Pct <= 15
                  ? 'bg-[#2CE59B]/10 text-[#2CE59B] border-[#2CE59B]/25'
                  : 'bg-[#FF4D6A]/10 text-[#FF4D6A] border-[#FF4D6A]/25'
              }`}
              title={`Top 10 Holders: ${top10Pct}%`}
            >
              <UserCheck className="w-2.5 h-2.5" />
              {top10Pct}%
            </span>

            {/* 2. Dev Holding % or DS (Dev Sold) */}
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[10px] font-mono-tabular font-medium border ${
                devSold
                  ? 'bg-[#3B82F6]/15 text-[#60A5FA] border-[#3B82F6]/30'
                  : devPct <= 5
                    ? 'bg-[#2CE59B]/10 text-[#2CE59B] border-[#2CE59B]/25'
                    : 'bg-[#FF4D6A]/10 text-[#FF4D6A] border-[#FF4D6A]/25'
              }`}
              title={devSold ? 'Developer Sold / 0% Dev Holding (DS)' : `Dev Holding: ${devPct}%`}
            >
              <ChefHat className="w-2.5 h-2.5" />
              {devSold ? 'DS' : `${devPct}%`}
            </span>

            {/* 3. Snipers % */}
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[10px] font-mono-tabular font-medium border ${
                snipersPct <= 5
                  ? 'bg-[#2CE59B]/10 text-[#2CE59B] border-[#2CE59B]/25'
                  : 'bg-[#FF4D6A]/10 text-[#FF4D6A] border-[#FF4D6A]/25'
              }`}
              title={`Snipers Holding: ${snipersPct}%`}
            >
              <Crosshair className="w-2.5 h-2.5" />
              {snipersPct}%
            </span>

            {/* 4. Insiders % */}
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[10px] font-mono-tabular font-medium border ${
                insidersPct <= 2
                  ? 'bg-[#2CE59B]/10 text-[#2CE59B] border-[#2CE59B]/25'
                  : 'bg-[#FF4D6A]/10 text-[#FF4D6A] border-[#FF4D6A]/25'
              }`}
              title={`Insiders Holding: ${insidersPct}%`}
            >
              <Ghost className="w-2.5 h-2.5" />
              {insidersPct}%
            </span>

            {/* 5. Bundle % */}
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[10px] font-mono-tabular font-medium border ${
                bundlerPct <= 5
                  ? 'bg-[#2CE59B]/10 text-[#2CE59B] border-[#2CE59B]/25'
                  : 'bg-[#FF4D6A]/10 text-[#FF4D6A] border-[#FF4D6A]/25'
              }`}
              title={`Bundlers Holding: ${bundlerPct}%`}
            >
              <Boxes className="w-2.5 h-2.5" />
              {bundlerPct}%
            </span>

            {/* Optional DEX Paid badge */}
            {token.security.dexPaid && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[10px] font-medium bg-[#2CE59B]/10 text-[#2CE59B] border border-[#2CE59B]/25"
                title="DEX Listing Paid & Verified"
              >
                <ShieldCheck className="w-2.5 h-2.5" />
                Paid
              </span>
            )}
          </div>
        </div>

        {/* Right: MC, Volume, TX Bar & Axiom Indigo Quick-Buy Button */}
        <div className="flex flex-col items-end justify-between shrink-0 text-right">
          <div className="flex items-baseline gap-1 leading-none">
            <span className="text-[10px] text-[#7C8496] font-medium">MC</span>
            <span className={`text-[13.5px] font-bold font-mono-tabular ${mcColorClass}`}>
              {formatCompactUsd(token.marketCapUsd)}
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-0.5 leading-none">
            <span className="text-[10px] text-[#7C8496] font-medium">V</span>
            <span className="text-[12px] font-bold text-[#F3F5F8] font-mono-tabular">
              {formatCompactUsd(token.volume24hUsd)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[9.5px] text-[#7C8496] font-mono-tabular">
              TX <span className="text-[#D1D5DB] font-semibold">{token.txns24h}</span>
            </span>
            <div className="w-11 h-[3px] rounded-full bg-[#FF4D6A] overflow-hidden flex">
              <div
                className="h-full bg-[#2CE59B]"
                style={{ width: `${buyRatioPct}%` }}
              />
            </div>
          </div>

          {/* Bottom-Right Action Pill: Quick Buy + Optional Migration Snipe Icon */}
          <div className="flex items-center gap-1 mt-1.5">
            {token.category === 'graduating' && onSnipeMigration && (
              <button
                onClick={(e) => onSnipeMigration(token, e)}
                className={`px-1.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-0.5 ${
                  snipeArmed
                    ? 'bg-[#2CE59B]/20 text-[#2CE59B] border-[#2CE59B]'
                    : 'bg-[#141824] text-[#94A3B8] hover:text-white border-[#262D40]'
                }`}
                title="Axiom Migration Sniper: Auto-buy the instant bonding curve reaches 100%"
              >
                <Crosshair className="w-2.5 h-2.5" />
                {snipeArmed ? 'Armed' : 'Snipe'}
              </button>
            )}
            <button
              onClick={(e) => onQuickBuy(token, e)}
              className="px-2.5 py-1 rounded-full bg-[#526FFF] hover:bg-[#647EFF] active:scale-95 text-white font-mono-tabular font-bold text-[10.5px] flex items-center gap-1 shadow-sm transition-all"
              title="1-Click Instant Buy (0% Platform Fee)"
            >
              <Zap className="w-2.5 h-2.5 fill-current" />
              <span>{Number(quickBuyEth || '0.01').toFixed(2)} ETH</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
