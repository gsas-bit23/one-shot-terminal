import { X } from 'lucide-react';

export type DiscoverSubTab = 'dex_screener' | 'trending' | 'pump_live';
export type TimeWindow = '5m' | '1h' | '6h' | '24h';
export type OrderSide = 'BUY' | 'SELL';
export type OrderMode = 'MARKET' | 'LIMIT' | 'SNIPER';
export type PerpSide = 'LONG' | 'SHORT';

export interface LimitOrderRecord {
  id: string;
  symbol: string;
  side: OrderSide;
  orderType: 'LIMIT' | 'SNIPER';
  triggerMcapUsd: number;
  amountEth: string;
  createdAt: number;
  status: 'OPEN' | 'FILLED';
}

export interface PerpPosition {
  id: string;
  symbol: string;
  side: PerpSide;
  sizeUsd: number;
  collateralUsd: number;
  leverage: number;
  entryPrice: number;
  markPrice: number;
  liqPrice: number;
  tpPrice?: number;
  slPrice?: number;
}

export interface PulseFilterState {
  protocols: string[];
  includeKeywords: string;
  excludeKeywords: string;
  minMcap: string;
  maxMcap: string;
  minVolume: string;
  minLiquidity: string;
  maxTop10Pct: string;
  maxDevPct: string;
  maxSnipersPct: string;
  maxInsidersPct: string;
  maxBundlePct: string;
  minHolders: string;
  minProTraders: string;
  dexPaidOnly: boolean;
}

export const DEMO_NOTES: Record<string, string> = {
  pulse: 'Pulse feed, audit scores and X previews are simulated demo data.',
  discover: 'Discover table metrics are simulated demo data.',
  terminal: 'Chart, trades and stats are simulated. Only wallet-signed testnet trades are real.',
  trackers: 'Tracked wallets, copy-trade and X monitor are simulated demo data.',
  perps: 'Perpetuals are a UI demo: no oracle, PnL or liquidation engine exists yet.',
  yield: 'Yield vaults and APYs are demo values. No real staking happens.',
  vision: 'KOL, smart-money and bundle data are simulated demo data.',
  portfolio: 'Positions and PnL are partially simulated demo data.',
  rewards: 'Referral tiers and rewards are a demo. Nothing is tracked or paid out yet.',
};
