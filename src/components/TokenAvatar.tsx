import React, { useState } from 'react';

interface TokenAvatarProps {
  symbol: string;
  name?: string;
  address?: string;
  iconUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'full' | 'xl' | 'lg' | 'md';
  showChainBadge?: boolean;
  bondingProgress?: number; // 0-100 for Axiom Pulse border ring
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
  TSLA: 'https://logo.clearbit.com/tesla.com',
  ETSLA: 'https://logo.clearbit.com/tesla.com',
  MTSLA: 'https://logo.clearbit.com/tesla.com',
  AMZN: 'https://logo.clearbit.com/amazon.com',
  EAMZN: 'https://logo.clearbit.com/amazon.com',
  MAMZN: 'https://logo.clearbit.com/amazon.com',
  NVDA: 'https://logo.clearbit.com/nvidia.com',
  MNVDA: 'https://logo.clearbit.com/nvidia.com',
  NVIDIA: 'https://logo.clearbit.com/nvidia.com',
  AMD: 'https://logo.clearbit.com/amd.com',
  PLTR: 'https://logo.clearbit.com/palantir.com',
  EPLTR: 'https://logo.clearbit.com/palantir.com',
  NFLX: 'https://logo.clearbit.com/netflix.com',
  AAPL: 'https://logo.clearbit.com/apple.com',
  MAAPL: 'https://logo.clearbit.com/apple.com',
  META: 'https://logo.clearbit.com/meta.com',
  MMETA: 'https://logo.clearbit.com/meta.com',
  MSFT: 'https://logo.clearbit.com/microsoft.com',
  MMSFT: 'https://logo.clearbit.com/microsoft.com',
  COIN: 'https://logo.clearbit.com/coinbase.com',
  MCOIN: 'https://logo.clearbit.com/coinbase.com',
  HOOD: 'https://logo.clearbit.com/robinhood.com',
  MHOOD: 'https://logo.clearbit.com/robinhood.com',
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

  if (cleanSym === 'TSLA' || cleanSym === 'ETSLA' || cleanSym === 'MTSLA') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E82127"/><stop offset="100%" stop-color="#8A0E13"/></linearGradient></defs>
      <rect width="64" height="64" rx="10" fill="url(#g)"/>
      <path d="M14 19C22 15.5 42 15.5 50 19L47.5 22.5C40 20 24 20 16.5 22.5L14 19ZM18 25.5C24.5 24 28.5 24.5 32 28.5C35.5 24.5 39.5 24 46 25.5L43.5 29.5H35.5L32 50L28.5 29.5H20.5L18 25.5Z" fill="#FFFFFF"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (cleanSym === 'AMZN' || cleanSym === 'EAMZN' || cleanSym === 'MAMZN') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="10" fill="#FFFFFF"/>
      <text x="32" y="38" text-anchor="middle" fill="#131A22" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="30">a</text>
      <path d="M16 45 Q32 54 48 44" stroke="#FF9900" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M44 41 L49 44 L46 49" stroke="#FF9900" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (cleanSym === 'AMD') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="10" fill="#0B0D10"/>
      <path d="M18 18H46V46L37 37V27H27L18 18Z" fill="#2CE59B"/>
      <path d="M18 31L27 27V37H37L33 46H18V31Z" fill="#FFFFFF"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (cleanSym === 'PLTR' || cleanSym === 'EPLTR') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="10" fill="#101216"/>
      <circle cx="32" cy="26" r="11" stroke="#F4F5F8" stroke-width="4" fill="none"/>
      <path d="M19 44L32 50L45 44" stroke="#38BDF8" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (cleanSym === 'NFLX') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="10" fill="#0A0A0C"/>
      <path d="M21 14H28V50H21V14ZM36 14H43V50H36V14Z" fill="#B1060F"/>
      <path d="M21 14H28L43 50H36L21 14Z" fill="#E50914"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (cleanSym === 'NVDA' || cleanSym === 'MNVDA' || cleanSym === 'NVIDIA') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="10" fill="#11190C"/>
      <circle cx="32" cy="32" r="18" stroke="#76B900" stroke-width="3.5" fill="none"/>
      <path d="M20 32C24 23 36 22 43 32C36 42 24 41 20 32Z" fill="#76B900"/>
      <circle cx="32" cy="32" r="4.5" fill="#0B0E08"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (cleanSym === 'FINAGENT') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="10" fill="#F8FAFC"/>
      <path d="M32 12V52M12 32H52M18 18L46 46M46 18L18 46" stroke="#6366F1" stroke-width="6" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="8" fill="#F8FAFC"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (cleanSym === 'SEEKEN') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="10" fill="#FFFFFF"/>
      <ellipse cx="32" cy="34" rx="16" ry="13" fill="#4F8BFF"/>
      <circle cx="27" cy="31" r="2.5" fill="#FFFFFF"/>
      <path d="M29 18L32 23L36 18" stroke="#4F8BFF" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (cleanSym === 'CYRENE') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="10" fill="#061224"/>
      <circle cx="32" cy="32" r="21" stroke="#38BDF8" stroke-width="2.5" fill="none"/>
      <circle cx="32" cy="32" r="14" stroke="#60A5FA" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/>
      <path d="M32 18L42 42H22L32 18Z" fill="#38BDF8" fill-opacity="0.85"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (cleanSym === 'SHIELD') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><linearGradient id="sh" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E293B"/><stop offset="100%" stop-color="#090D16"/></linearGradient></defs>
      <rect width="64" height="64" rx="10" fill="url(#sh)"/>
      <path d="M32 12L48 18V31C48 42 41 49.5 32 53C23 49.5 16 42 16 31V18L32 12Z" stroke="#2CE59B" stroke-width="3" fill="#2CE59B" fill-opacity="0.18"/>
      <path d="M25 32L30 37L40 26" stroke="#2CE59B" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (cleanSym === 'SHERWOOD') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><linearGradient id="sw" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#526FFF"/><stop offset="100%" stop-color="#1E1B4B"/></linearGradient></defs>
      <rect width="64" height="64" rx="10" fill="url(#sw)"/>
      <path d="M32 12L50 46H14L32 12ZM32 26L24 41H40L32 26Z" fill="#FFFFFF"/>
      <circle cx="32" cy="36" r="3.5" fill="#2CE59B"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (
    cleanSym === 'HOOD' ||
    cleanSym === 'MHOOD' ||
    cleanSym === 'FEATHER' ||
    cleanSym === 'HH' ||
    cleanSym === 'GMH'
  ) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><linearGradient id="rh" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2CE59B"/><stop offset="100%" stop-color="#063F24"/></linearGradient></defs>
      <rect width="64" height="64" rx="10" fill="url(#rh)"/>
      <path d="M48 14C40 15 30 22 22 30L14 48L17 50L35 42C43 34 47 24 48 14Z" fill="#FFFFFF"/>
      <path d="M16 49L44 21" stroke="#063F24" stroke-width="2.8" stroke-linecap="round"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

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

  // Axiom Pulse border ring color based on bonding progress
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
          {/* Axiom-style green/white pill icon */}
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
