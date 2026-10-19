import React, { useState } from 'react';

interface TokenAvatarProps {
  symbol: string;
  name?: string;
  address?: string;
  iconUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'full' | 'xl' | 'lg' | 'md';
  showChainBadge?: boolean;
  bondingProgress?: number; // 0-100 for Pulse border ring
}

const KNOWN_REMOTE_LOGOS: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  WETH: 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  TUSDC: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  USDG: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  TUSDG: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  MUSD: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  RUSD: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  HYPE: 'https://assets.coingecko.com/coins/images/50882/small/hyperliquid.jpg',
  ZEC: 'https://assets.coingecko.com/coins/images/486/small/circle-zcash-color.png',
  NEAR: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg',
};

export function buildDeterministicTokenArtworkSvg(symbol: string, address = '0x00000000'): string {
  const cleanSym = (symbol || 'OS').toUpperCase().replace(/[^A-Z0-9]/g, '');
  let hash = 0;
  const seedStr = `${cleanSym}:${address.toLowerCase()}`;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const palettes = [
    ['#526FFF', '#172554', '#93C5FD'],
    ['#2CE59B', '#064E3B', '#A7F3D0'],
    ['#38BDF8', '#0C2D48', '#BAE6FD'],
    ['#A855F7', '#2E1065', '#E9D5FF'],
    ['#F59E0B', '#451A03', '#FDE68A'],
    ['#EC4899', '#500724', '#FBCFE8'],
  ];
  const [c1, c2, accent] = palettes[absHash % palettes.length];
  const label = cleanSym.slice(0, 4);
  const p1 = 12 + (absHash % 18);
  const p2 = 34 + ((absHash >> 3) % 20);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="10" fill="url(#bg)"/>
    <circle cx="${p2}" cy="${p1}" r="18" fill="${accent}" fill-opacity="0.18"/>
    <path d="M0 ${48 - (absHash % 12)} Q32 ${26 + (absHash % 16)} 64 ${44 - (absHash % 10)} L64 64 L0 64 Z" fill="#000000" fill-opacity="0.28"/>
    <text x="32" y="37" text-anchor="middle" fill="#FFFFFF" font-family="JetBrains Mono, Inter, monospace" font-weight="800" font-size="${
      label.length >= 4 ? '14' : '17'
    }" letter-spacing="-0.5">${label}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const TokenAvatar: React.FC<TokenAvatarProps> = ({
  symbol,
  address,
  iconUrl,
  size = 'md',
  rounded = 'lg',
  showChainBadge = false,
  bondingProgress,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const cleanSym = (symbol || 'OS').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const primarySrc =
    !imgFailed && (iconUrl || KNOWN_REMOTE_LOGOS[cleanSym])
      ? iconUrl || KNOWN_REMOTE_LOGOS[cleanSym]
      : buildDeterministicTokenArtworkSvg(symbol, address);

  const fallbackSvg = buildDeterministicTokenArtworkSvg(symbol, address);

  const sizeClass =
    size === 'xs'
      ? 'w-5 h-5'
      : size === 'sm'
        ? 'w-7 h-7'
        : size === 'lg'
          ? 'w-11 h-11'
          : size === 'xl'
            ? 'w-[54px] h-[54px]'
            : 'w-9 h-9';

  const radiusClass =
    rounded === 'full'
      ? 'rounded-full'
      : rounded === 'md'
        ? 'rounded-md'
        : rounded === 'lg'
          ? 'rounded-lg'
          : 'rounded-xl';

  // Pulse border ring color based on bonding progress
  const ringBorderClass =
    bondingProgress !== undefined
      ? bondingProgress >= 100
        ? 'border-[1.5px] border-[#526FFF] p-[1.5px]'
        : bondingProgress >= 85
          ? 'border-[1.5px] border-[#38BDF8] p-[1.5px]'
          : 'border-[1.5px] border-[#2CE59B] p-[1.5px]'
      : 'border border-[#222838]';

  return (
    <div className={`relative shrink-0 ${sizeClass}`}>
      <div className={`w-full h-full ${radiusClass} ${ringBorderClass} bg-[#0D1017] overflow-hidden`}>
        <img
          src={primarySrc}
          alt={symbol}
          onError={(e) => {
            if (!imgFailed) {
              setImgFailed(true);
              e.currentTarget.src = fallbackSvg;
            }
          }}
          className={`w-full h-full object-cover ${radiusClass}`}
        />
      </div>
      {showChainBadge && (
        <div
          className="w-4 h-4 rounded-full bg-[#06070B] border border-[#2CE59B] flex items-center justify-center absolute -bottom-1 -right-1 shadow"
          title="Verified Launchpad / Chain"
        >
          {/* green/white pill icon */}
          <svg viewBox="0 0 16 16" className="w-2.5 h-2.5">
            <g transform="rotate(-45 8 8)">
              <rect x="4" y="2" width="8" height="6" rx="3" fill="#2CE59B" />
              <rect x="4" y="8" width="8" height="6" rx="3" fill="#FFFFFF" />
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};
