import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Bell,
  Volume2,
  VolumeX,
  Crosshair,
  Settings,
  Star,
  Flame,
  Activity,
  Users,
  Wallet,
  X,
  ChevronDown,
  Award,
  Globe,
  Send,
  Crown,
  BadgeCheck,
} from 'lucide-react';
import { OneShotLogo } from './components/OneShotLogo';
import { TokenAvatar } from './components/TokenAvatar';
import { ProTradingChart } from './components/ProTradingChart';
import { LaunchTokenCard } from './components/LaunchTokenCard';
import { SecurityArchitectureModal } from './components/SecurityArchitectureModal';
import { SharePnlModal } from './components/SharePnlModal';
import {
  InstantTradeFloatingPanel,
  TraderScanPopover,
  FloatingWalletTrackerModal,
  FloatingTwitterMonitorModal,
} from './components/AxiomFloatingWidgets';
import {
  AxiomYieldView,
  AxiomVisionView,
  AxiomPortfolioView,
  AxiomRewardsView,
} from './components/AxiomHubViews';
import {
  INITIAL_TOKEN_MARKETS,
  PERP_MARKETS,
  INITIAL_TWEETS,
  INITIAL_TRACKED_WALLETS,
  INITIAL_SUB_WALLETS,
  DEFAULT_PRESETS,
  TokenMarket,
  PerpMarket,
  TradePrint,
  TrackedWallet,
  SubWalletItem,
  ExecutionPreset,
  TweetAlertItem,
  formatCompactUsd,
  formatTokenPrice,
} from './lib/marketData';
import {
  ROBINHOOD_TESTNET_CONFIG,
  connectBrowserWallet,
  executeZeroFeeSwap,
  fetchChainTelemetry,
  fetchWalletEthBalance,
  shortenAddress,
} from './lib/robinhoodChain';

type PrimaryTab =
  | 'discover'
  | 'pulse'
  | 'trackers'
  | 'perps'
  | 'yield'
  | 'vision'
  | 'portfolio'
  | 'rewards'
  | 'terminal';

type DiscoverSubTab = 'dex_screener' | 'trending' | 'pump_live';
type TimeWindow = '5m' | '1h' | '6h' | '24h';
type OrderSide = 'BUY' | 'SELL';
type OrderMode = 'MARKET' | 'LIMIT' | 'SNIPER';
type PerpSide = 'LONG' | 'SHORT';

interface LimitOrderRecord {
  id: string;
  symbol: string;
  side: OrderSide;
  orderType: 'LIMIT' | 'SNIPER';
  triggerMcapUsd: number;
  amountEth: string;
  createdAt: number;
  status: 'OPEN' | 'FILLED';
}

interface PerpPosition {
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

interface PulseFilterState {
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

export function App() {
  // Primary Axiom Navigation State
  const [activeTab, setActiveTab] = useState<PrimaryTab>('pulse');
  const [discoverSubTab, setDiscoverSubTab] = useState<DiscoverSubTab>('dex_screener');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('1h');

  // Market State
  const [tokens, setTokens] = useState<TokenMarket[]>(INITIAL_TOKEN_MARKETS);
  const [perpMarkets, setPerpMarkets] = useState<PerpMarket[]>(PERP_MARKETS);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>(
    INITIAL_TOKEN_MARKETS[0].address
  );
  const [selectedPerpSymbol, setSelectedPerpSymbol] = useState<string>(PERP_MARKETS[0].symbol);

  // Search & Watchlist
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [watchlistAddresses, setWatchlistAddresses] = useState<string[]>(
    INITIAL_TOKEN_MARKETS.slice(0, 5).map((t) => t.address)
  );
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Wallet & Robinhood Chain Telemetry
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalanceEth, setWalletBalanceEth] = useState<string>('0.4500');
  const [paperBalanceEth, setPaperBalanceEth] = useState<number>(2.5);
  const [paperMode, setPaperMode] = useState<boolean>(false); // Default to LIVE Robinhood Chain Testnet
  const [blockNumber, setBlockNumber] = useState<number>(138249120);
  const [gasGwei, setGasGwei] = useState<string>('0.010');
  const [rpcLatencyMs, setRpcLatencyMs] = useState<number>(34);

  // Staking State (`Yield` tab)
  const [stakedEth, setStakedEth] = useState<number>(1.25);
  const [stakedUsdc, setStakedUsdc] = useState<number>(2400);

  // Axiom P1 / P2 / P3 Presets & Security
  const [presets, setPresets] = useState<Record<1 | 2 | 3, ExecutionPreset>>(DEFAULT_PRESETS);
  const [activePresetId, setActivePresetId] = useState<1 | 2 | 3>(1);
  const activePreset = presets[activePresetId];

  const [quickBuyAmountEth, setQuickBuyAmountEth] = useState<string>('0.05');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [securityModalOpen, setSecurityModalOpen] = useState<boolean>(false);

  // Axiom Floating Panels (`Instant Trade`, `Wallet Tracker`, `Twitter Monitor`, `Pulse Filters`, `Share PnL`)
  const [instantTradeOpen, setInstantTradeOpen] = useState<boolean>(false);
  const [walletTrackerOpen, setWalletTrackerOpen] = useState<boolean>(false);
  const [twitterMonitorOpen, setTwitterMonitorOpen] = useState<boolean>(false);
  const [pulseFiltersOpen, setPulseFiltersOpen] = useState<boolean>(false);
  const [pulseFilterTab, setPulseFilterTab] = useState<'keywords' | 'metrics' | 'socials'>('keywords');
  const [activeTraderScanWallet, setActiveTraderScanWallet] = useState<string | null>(null);
  const [makerFilter, setMakerFilter] = useState<string | null>(null);
  const [sharePnlData, setSharePnlData] = useState<{
    symbol: string;
    name: string;
    pnlPct: number;
    pnlUsd: number;
    investedUsd: number;
    currentValueUsd: number;
    entryPrice: string;
    markPrice: string;
  } | null>(null);

  // Pulse 14-Filter Configuration (`pulse_filters.png`)
  const [pulseFilters, setPulseFilters] = useState<PulseFilterState>({
    protocols: [
      'Robinhood Bonding Curve',
      'Pump V2',
      'GitPump',
      'Sherwood DBC',
      'Uniswap V4 Pool',
      'Raydium AMM',
    ],
    includeKeywords: '',
    excludeKeywords: '',
    minMcap: '',
    maxMcap: '',
    minVolume: '',
    minLiquidity: '',
    maxTop10Pct: '',
    maxDevPct: '',
    maxSnipersPct: '',
    maxInsidersPct: '',
    maxBundlePct: '',
    minHolders: '',
    minProTraders: '',
    dexPaidOnly: false,
  });

  // Tracked Wallets, Sub-Wallets, Tweets
  const [trackedWallets, setTrackedWallets] = useState<TrackedWallet[]>(INITIAL_TRACKED_WALLETS);
  const [subWallets, setSubWallets] = useState<SubWalletItem[]>(INITIAL_SUB_WALLETS);
  const [tweets, setTweets] = useState<TweetAlertItem[]>(INITIAL_TWEETS);

  // Spot Order Ticket State (`market_order.png`, `limit_orders.png`, `sniper_buy.png`)
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderMode, setOrderMode] = useState<OrderMode>('MARKET');
  const [orderAmountEth, setOrderAmountEth] = useState<string>('0.05');
  const [sellPct, setSellPct] = useState<number>(50);
  const [limitTriggerMcap, setLimitTriggerMcap] = useState<string>('194280');
  const [limitTargetPct, setLimitTargetPct] = useState<number>(-25);
  const [advStrategyEnabled, setAdvStrategyEnabled] = useState<boolean>(false);
  const [tpPct, setTpPct] = useState<string>('100');
  const [slPct, setSlPct] = useState<string>('30');
  const [sniperMaxMcap, setSniperMaxMcap] = useState<string>('85000');
  const [armedSnipes, setArmedSnipes] = useState<string[]>([]);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  // Token Terminal Bottom Dock
  const [terminalBottomTab, setTerminalBottomTab] = useState<
    'trades' | 'positions' | 'orders' | 'holders' | 'topTraders' | 'devTokens' | 'bubbleMap'
  >('trades');
  const [centerRightTab, setCenterRightTab] = useState<'trades' | 'orderbook'>('trades');

  // Spot Holdings (keyed by symbol), Trade History & Active Limit/Sniper Orders
  const [tokenHoldings, setTokenHoldings] = useState<Record<string, number>>({
    FEATHER: 14500,
    SHERWOOD: 48200,
    TSLA: 12.5,
  });
  const [tradeHistory, setTradeHistory] = useState<TradePrint[]>([
    {
      id: 'tx-init-1',
      timestamp: '12s',
      tokenSymbol: 'FEATHER',
      side: 'BUY',
      priceUsd: 0.0418,
      marketCapUsd: 41800000,
      amountTokens: 9380,
      totalUsd: 392.31,
      totalEth: 0.15,
      protocolFeeUsd: 0,
      maker: 'H8fP...6pump',
      txHash: '0x94d2f81b39e2b7a1290f45c67a89012bcdef1234567890abcdef12345678a19c',
      mevProtected: true,
    },
    {
      id: 'tx-init-2',
      timestamp: '38s',
      tokenSymbol: 'SHERWOOD',
      side: 'BUY',
      priceUsd: 0.0000842,
      marketCapUsd: 84200,
      amountTokens: 2484000,
      totalUsd: 209.23,
      totalEth: 0.08,
      protocolFeeUsd: 0,
      maker: 'Erad...b7X',
      txHash: '0x71e4c92a18f3d6b0189e34b56a78901bcdef1234567890abcdef12345678c40b',
      mevProtected: true,
    },
  ]);

  const [limitOrders, setLimitOrders] = useState<LimitOrderRecord[]>([
    {
      id: 'lim-1',
      symbol: 'FEATHER',
      side: 'BUY',
      orderType: 'LIMIT',
      triggerMcapUsd: 29500000,
      amountEth: '0.25',
      createdAt: Date.now() - 320000,
      status: 'OPEN',
    },
    {
      id: 'lim-2',
      symbol: 'SHERWOOD',
      side: 'BUY',
      orderType: 'SNIPER',
      triggerMcapUsd: 95000,
      amountEth: '0.15',
      createdAt: Date.now() - 120000,
      status: 'OPEN',
    },
  ]);

  // Perpetuals State (`perps.png`)
  const [perpSide, setPerpSide] = useState<PerpSide>('LONG');
  const [perpOrderType, setPerpOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [perpLeverage, setPerpLeverage] = useState<number>(20);
  const [perpCollateralUsd, setPerpCollateralUsd] = useState<string>('250');
  const [perpLimitPrice, setPerpLimitPrice] = useState<string>('');
  const [perpTpSlEnabled, setPerpTpSlEnabled] = useState<boolean>(true);
  const [perpTpPrice, setPerpTpPrice] = useState<string>('');
  const [perpSlPrice, setPerpSlPrice] = useState<string>('');
  const [perpPositions, setPerpPositions] = useState<PerpPosition[]>([
    {
      id: 'perp-pos-1',
      symbol: PERP_MARKETS[0].symbol,
      side: 'LONG',
      sizeUsd: 5000,
      collateralUsd: 250,
      leverage: 20,
      entryPrice: PERP_MARKETS[0].markPrice * 0.985,
      markPrice: PERP_MARKETS[0].markPrice,
      liqPrice: Number((PERP_MARKETS[0].markPrice * 0.94).toFixed(2)),
      tpPrice: Number((PERP_MARKETS[0].markPrice * 1.12).toFixed(2)),
      slPrice: Number((PERP_MARKETS[0].markPrice * 0.96).toFixed(2)),
    },
  ]);

  // UI Notifications & Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    subtitle: string;
    txHash?: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const selectedToken = useMemo(
    () => tokens.find((t) => t.address === selectedTokenAddress) || tokens[0],
    [tokens, selectedTokenAddress]
  );

  const selectedPerp = useMemo(
    () => perpMarkets.find((p) => p.symbol === selectedPerpSymbol) || perpMarkets[0],
    [perpMarkets, selectedPerpSymbol]
  );

  const ethPriceUsd = 2615.4;

  // Synthesize realistic sound effects for 1-click fills
  const playFillBeep = (isBuy = true) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isBuy ? 740 : 520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isBuy ? 1080 : 390, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Ignore audio errors
    }
  };

  const triggerToast = (
    title: string,
    subtitle: string,
    type: 'success' | 'info' | 'warning' = 'success',
    txHash?: string
  ) => {
    setToast({ title, subtitle, type, txHash });
    setTimeout(() => {
      setToast((prev) => (prev?.title === title ? null : prev));
    }, 5500);
  };

  // Global `/` shortcut to focus search bar
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setPulseFiltersOpen(false);
        setActiveTraderScanWallet(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Poll live Robinhood Chain Testnet telemetry (Chain ID 46630)
  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      const t0 = performance.now();
      const tel = await fetchChainTelemetry();
      const dt = Math.max(18, Math.round(performance.now() - t0));
      if (!mounted) return;
      if (tel.blockNumber > 0) setBlockNumber(tel.blockNumber);
      setGasGwei(tel.gasPriceGwei);
      setRpcLatencyMs(dt);

      if (walletAddress) {
        const bal = await fetchWalletEthBalance(walletAddress);
        if (mounted) setWalletBalanceEth(bal);
      }
    };
    poll();
    const timer = setInterval(poll, 7000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [walletAddress]);

  // Real-time sub-second market ticker simulation across all tokens & perps
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((prev) =>
        prev.map((t) => {
          const drift = (Math.random() - 0.482) * 0.015;
          const newPrice = Math.max(0.0000001, t.priceUsd * (1 + drift));
          const newMcap = Math.max(4000, t.marketCapUsd * (1 + drift));
          const isBuy = Math.random() > 0.42;
          return {
            ...t,
            priceUsd: newPrice,
            marketCapUsd: newMcap,
            volume24hUsd: t.volume24hUsd + Math.random() * 680,
            txns24h: t.txns24h + 1,
            buys24h: isBuy ? t.buys24h + 1 : t.buys24h,
            sells24h: !isBuy ? t.sells24h + 1 : t.sells24h,
            change5m: Number((t.change5m + drift * 55).toFixed(2)),
            change1h: Number((t.change1h + drift * 35).toFixed(2)),
          };
        })
      );

      setPerpMarkets((prev) =>
        prev.map((m) => {
          const drift = (Math.random() - 0.492) * 0.0025;
          const nextMark = Number((m.markPrice * (1 + drift)).toFixed(m.markPrice > 100 ? 2 : 4));
          return {
            ...m,
            markPrice: nextMark,
            indexPrice: Number((nextMark * 0.9997).toFixed(m.markPrice > 100 ? 2 : 4)),
          };
        })
      );
    }, 1250);
    return () => clearInterval(interval);
  }, []);

  // Connect MetaMask / Rabby / Phantom EVM to Robinhood Chain Testnet (46630)
  const handleConnectWallet = async () => {
    try {
      const addr = await connectBrowserWallet();
      if (addr) {
        setWalletAddress(addr);
        const bal = await fetchWalletEthBalance(addr);
        setWalletBalanceEth(bal);
        setPaperMode(false);
        triggerToast(
          'Robinhood Chain Testnet Connected',
          `Active signer ${shortenAddress(addr)} • 0.00% Fee Router Verified`,
          'success'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Check browser wallet extension';
      triggerToast('Wallet Connection Notice', msg, 'warning');
    }
  };

  // Core 0% Fee Execution Handler (Used by Quick Buy, Order Ticket, Instant Trade Hotkeys, and Twitter Snipe)
  const handleExecuteSpotSwap = async (
    token: TokenMarket,
    side: OrderSide,
    ethAmountInput: string,
    customSellRatio?: number
  ) => {
    if (isSwapping) return;
    const ethAmt = Math.max(0.001, parseFloat(ethAmountInput) || 0.05);
    const usdValue = ethAmt * ethPriceUsd;

    setIsSwapping(true);
    try {
      const res = await executeZeroFeeSwap({
        walletAddress,
        tokenSymbol: token.symbol,
        tokenAddress: token.address,
        side,
        amountEth: String(ethAmt),
        expectedTokens: usdValue / Math.max(token.priceUsd, 0.0000001),
        slippageBps: Math.round(activePreset.slippagePct * 100),
        forcePaperMode: paperMode,
      });

      const tokenDelta = usdValue / Math.max(token.priceUsd, 0.0000001);

      setTokenHoldings((prev) => {
        const cur = prev[token.symbol] || 0;
        if (side === 'BUY') {
          return { ...prev, [token.symbol]: cur + tokenDelta };
        } else {
          const ratio = customSellRatio ? customSellRatio / 100 : sellPct / 100;
          return { ...prev, [token.symbol]: Math.max(0, cur * (1 - ratio)) };
        }
      });

      if (res.mode === 'PAPER') {
        setPaperBalanceEth((b) => (side === 'BUY' ? Math.max(0, b - ethAmt) : b + ethAmt));
      } else if (walletAddress) {
        fetchWalletEthBalance(walletAddress).then(setWalletBalanceEth);
      }

      const newRecord: TradePrint = {
        id: `tx-${Date.now()}`,
        timestamp: '1s',
        tokenSymbol: token.symbol,
        side,
        priceUsd: token.priceUsd,
        marketCapUsd: token.marketCapUsd,
        amountTokens: tokenDelta,
        totalUsd: usdValue,
        totalEth: ethAmt,
        protocolFeeUsd: 0,
        maker: walletAddress ? shortenAddress(walletAddress) : 'You (0% Fee)',
        txHash: res.txHash,
        mevProtected: true,
      };
      setTradeHistory((prev) => [newRecord, ...prev]);
      playFillBeep(side === 'BUY');

      triggerToast(
        `${side} ${token.symbol} Filled (${activePreset.shortLabel} • 0% Fee)`,
        `${ethAmt} ETH ($${usdValue.toFixed(2)}) • Saved $${(usdValue * 0.01).toFixed(2)} vs Axiom 1% Fee`,
        'success',
        res.txHash
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction rejected';
      triggerToast('Swap Cancelled', msg, 'warning');
    } finally {
      setIsSwapping(false);
    }
  };

  // Place Limit or Migration Sniper Order
  const handlePlaceConditionalOrder = () => {
    const newOrder: LimitOrderRecord = {
      id: `ord-${Date.now()}`,
      symbol: selectedToken.symbol,
      side: orderSide,
      orderType: orderMode === 'SNIPER' ? 'SNIPER' : 'LIMIT',
      triggerMcapUsd:
        orderMode === 'SNIPER'
          ? parseFloat(sniperMaxMcap) || 85000
          : selectedToken.marketCapUsd * (1 + limitTargetPct / 100),
      amountEth: orderAmountEth,
      createdAt: Date.now(),
      status: 'OPEN',
    };
    setLimitOrders((prev) => [newOrder, ...prev]);
    if (orderMode === 'SNIPER') {
      setArmedSnipes((prev) =>
        prev.includes(selectedToken.address) ? prev : [...prev, selectedToken.address]
      );
    }
    playFillBeep(true);
    triggerToast(
      `${orderMode === 'SNIPER' ? 'Migration Sniper' : 'Limit Order'} Armed`,
      `${orderSide} ${selectedToken.symbol} @ ${formatCompactUsd(newOrder.triggerMcapUsd)} MC • 0.00% Fee`,
      'info'
    );
  };

  // Open Perpetual Position (`perps.png`)
  const handleOpenPerpPosition = () => {
    const coll = Math.max(10, parseFloat(perpCollateralUsd) || 100);
    const size = coll * perpLeverage;
    const entry = selectedPerp.markPrice;
    const liq =
      perpSide === 'LONG'
        ? entry * (1 - 0.92 / perpLeverage)
        : entry * (1 + 0.92 / perpLeverage);

    const newPos: PerpPosition = {
      id: `perp-${Date.now()}`,
      symbol: selectedPerp.symbol,
      side: perpSide,
      sizeUsd: size,
      collateralUsd: coll,
      leverage: perpLeverage,
      entryPrice: entry,
      markPrice: entry,
      liqPrice: Number(liq.toFixed(2)),
      tpPrice: perpTpPrice ? parseFloat(perpTpPrice) : undefined,
      slPrice: perpSlPrice ? parseFloat(perpSlPrice) : undefined,
    };

    setPerpPositions((prev) => [newPos, ...prev]);
    playFillBeep(perpSide === 'LONG');
    triggerToast(
      `${perpSide} ${selectedPerp.symbol} ${perpLeverage}x Opened`,
      `Size ${formatCompactUsd(size)} @ $${entry.toLocaleString()} • 0.00% One Shot Fee`,
      'success'
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const openTokenInTerminal = (token: TokenMarket) => {
    setSelectedTokenAddress(token.address);
    setActiveTab('terminal');
  };

  // Filtered Tokens for Pulse & Discover
  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          t.symbol.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.address.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (pulseFilters.includeKeywords.trim()) {
        const kw = pulseFilters.includeKeywords.toLowerCase();
        if (!t.symbol.toLowerCase().includes(kw) && !t.name.toLowerCase().includes(kw)) return false;
      }
      if (pulseFilters.excludeKeywords.trim()) {
        const ex = pulseFilters.excludeKeywords.toLowerCase();
        if (t.symbol.toLowerCase().includes(ex) || t.name.toLowerCase().includes(ex)) return false;
      }
      if (pulseFilters.minMcap && t.marketCapUsd < parseFloat(pulseFilters.minMcap)) return false;
      if (pulseFilters.maxMcap && t.marketCapUsd > parseFloat(pulseFilters.maxMcap)) return false;
      if (pulseFilters.minVolume && t.volume24hUsd < parseFloat(pulseFilters.minVolume)) return false;
      if (pulseFilters.minLiquidity && t.liquidityUsd < parseFloat(pulseFilters.minLiquidity)) return false;
      if (
        pulseFilters.maxTop10Pct &&
        t.security.top10HoldersPct > parseFloat(pulseFilters.maxTop10Pct)
      )
        return false;
      if (pulseFilters.maxDevPct && t.security.devHoldingPct > parseFloat(pulseFilters.maxDevPct))
        return false;
      if (
        pulseFilters.maxSnipersPct &&
        t.security.snipersPct > parseFloat(pulseFilters.maxSnipersPct)
      )
        return false;
      if (
        pulseFilters.maxInsidersPct &&
        (t.security.insidersPct ?? 0) > parseFloat(pulseFilters.maxInsidersPct)
      )
        return false;
      if (
        pulseFilters.maxBundlePct &&
        t.security.bundlerPct > parseFloat(pulseFilters.maxBundlePct)
      )
        return false;
      if (pulseFilters.minHolders && t.holders < parseInt(pulseFilters.minHolders, 10)) return false;
      if (
        pulseFilters.minProTraders &&
        (t.proTraders ?? 0) < parseInt(pulseFilters.minProTraders, 10)
      )
        return false;
      if (pulseFilters.dexPaidOnly && !t.security.dexPaid) return false;
      return true;
    });
  }, [tokens, searchQuery, pulseFilters]);

  const pulseNewPairs = useMemo(
    () => filteredTokens.filter((t) => t.category === 'new'),
    [filteredTokens]
  );
  const pulseFinalStretch = useMemo(
    () => filteredTokens.filter((t) => t.category === 'graduating'),
    [filteredTokens]
  );
  const pulseMigrated = useMemo(
    () => filteredTokens.filter((t) => t.category === 'graduated'),
    [filteredTokens]
  );

  // Live Trades Stream for Center-Right column in Token Terminal (`full_terminal.webp` & `trader_scan.png`)
  const tokenLiveTrades = useMemo(() => {
    const baseMc = selectedToken.marketCapUsd;
    const rows = [
      { age: '1s', side: 'BUY' as const, mc: baseMc * 1.002, totalUsd: 412.5, maker: 'H8fP...6pump' },
      { age: '3s', side: 'BUY' as const, mc: baseMc * 0.998, totalUsd: 185.2, maker: 'Erad...b7X' },
      { age: '5s', side: 'SELL' as const, mc: baseMc * 0.994, totalUsd: 94.8, maker: 'Biee...33A' },
      { age: '8s', side: 'BUY' as const, mc: baseMc * 0.991, totalUsd: 1240.0, maker: '7xQp...91K' },
      { age: '12s', side: 'BUY' as const, mc: baseMc * 0.986, totalUsd: 62.4, maker: '4vLm...88P' },
      { age: '15s', side: 'SELL' as const, mc: baseMc * 0.989, totalUsd: 310.0, maker: '9aXz...14Q' },
      { age: '19s', side: 'BUY' as const, mc: baseMc * 0.981, totalUsd: 540.6, maker: 'C9kR...22W' },
      { age: '24s', side: 'BUY' as const, mc: baseMc * 0.975, totalUsd: 88.0, maker: '3mNp...55T' },
      { age: '29s', side: 'SELL' as const, mc: baseMc * 0.978, totalUsd: 142.3, maker: '6zVb...09L' },
      { age: '34s', side: 'BUY' as const, mc: baseMc * 0.972, totalUsd: 890.0, maker: 'H8fP...6pump' },
      { age: '41s', side: 'BUY' as const, mc: baseMc * 0.968, totalUsd: 215.0, maker: '5tYu...77M' },
    ];
    return makerFilter ? rows.filter((r) => r.maker === makerFilter) : rows;
  }, [selectedToken, makerFilter]);

  const currentHoldingTokens = tokenHoldings[selectedToken.symbol] || 0;
  const currentHoldingUsd = currentHoldingTokens * selectedToken.priceUsd;
  const currentInvestedUsd = currentHoldingUsd * 0.78;
  const currentPnlUsd = currentHoldingUsd - currentInvestedUsd;
  const activeEthBalanceNum = paperMode ? paperBalanceEth : parseFloat(walletBalanceEth) || 0.45;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#06070B] text-[#F3F4F6] select-none font-sans">
      {/* =====================================================================
          1. TOP AXIOM NAVIGATION BAR (`full_terminal.webp`, `explore.png`)
      ===================================================================== */}
      <header className="h-[50px] px-3 border-b border-[#161823] bg-[#06070B] flex items-center justify-between gap-2 shrink-0 z-30">
        {/* Left: Brand + 8 Primary Axiom Navigation Tabs */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => setActiveTab('pulse')}
            className="flex items-center gap-2 text-left group shrink-0"
          >
            <OneShotLogo className="w-7 h-7" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold tracking-tight text-[16px] text-white group-hover:text-[#526FFF] transition">
                ONE SHOT
              </span>
              <span className="text-[11px] font-medium text-[#8A91A6]">Pro</span>
            </div>
          </button>

          <nav className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'discover', label: 'Discover' },
                { id: 'pulse', label: 'Pulse' },
                { id: 'trackers', label: 'Trackers' },
                { id: 'perps', label: 'Perpetuals' },
                { id: 'yield', label: 'Yield' },
                { id: 'vision', label: 'Vision' },
                { id: 'portfolio', label: 'Portfolio' },
                { id: 'rewards', label: 'Rewards' },
              ] as const
            ).map((item) => {
              const isActive =
                activeTab === item.id || (activeTab === 'terminal' && item.id === 'discover');
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 py-1.5 rounded-md text-[13px] font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'text-[#526FFF] font-semibold bg-[#526FFF]/10'
                      : 'text-[#9CA3AF] hover:text-white hover:bg-[#10131D]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search (`/`) + Network Pill (`Robinhood`) + `Deposit` (`#526FFF`) + Watchlist/Bell/Wallet */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Trigger */}
          <div className="relative hidden md:flex items-center">
            <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchModalOpen(true)}
              placeholder="Search by token or LP contract"
              className="w-56 lg:w-64 h-8 pl-8 pr-7 rounded-full bg-[#0D0F17] border border-[#1B1E2B] text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#526FFF]"
            />
            <span className="absolute right-2.5 px-1.5 py-0.2 rounded bg-[#161926] border border-[#252A3D] text-[10px] text-[#8A91A6] font-mono-tabular">
              /
            </span>
          </div>

          {/* Chain Selector Pill (Robinhood Chain Testnet 46630) */}
          <button
            onClick={() => setSecurityModalOpen(true)}
            className="h-8 px-2.5 rounded-full bg-[#0D1412] border border-[#1E382D] flex items-center gap-1.5 text-xs font-semibold text-white hover:border-[#2CE59B]/60 transition"
            title="Robinhood Chain Testnet (Chain ID 46630) • Zero-Trust Security Architecture"
          >
            <span className="w-2 h-2 rounded-full bg-[#2CE59B] animate-pulse" />
            <span>Robinhood</span>
            <span className="px-1 py-0.2 rounded bg-[#2CE59B]/15 text-[#2CE59B] text-[9px] font-bold">
              0% FEE
            </span>
            <ChevronDown className="w-3 h-3 text-[#8A91A6]" />
          </button>

          {/* Axiom Electric Blue `Deposit` / Connect Button */}
          <button
            onClick={handleConnectWallet}
            className="h-8 px-3.5 rounded-full bg-[#526FFF] hover:bg-[#425FEF] text-white font-semibold text-xs transition shadow-[0_0_15px_rgba(82,111,255,0.35)]"
          >
            {walletAddress ? 'Deposit' : 'Connect'}
          </button>

          {/* Star Watchlist */}
          <button
            onClick={() => setActiveTab('discover')}
            className="w-8 h-8 rounded-full bg-[#0D0F17] border border-[#1B1E2B] flex items-center justify-center text-[#9CA3AF] hover:text-white transition"
            title="Watchlist"
          >
            <Star className="w-3.5 h-3.5" />
          </button>

          {/* Bell Alerts */}
          <button
            onClick={() => setTwitterMonitorOpen(!twitterMonitorOpen)}
            className="w-8 h-8 rounded-full bg-[#0D0F17] border border-[#1B1E2B] flex items-center justify-center text-[#9CA3AF] hover:text-white transition relative"
            title="Live Narrative & Tweet Monitor"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#526FFF] absolute top-1.5 right-1.5" />
          </button>

          {/* Wallet Balance Pill (`full_terminal.webp` top right) */}
          <button
            onClick={() => setActiveTab('portfolio')}
            className="h-8 px-3 rounded-full bg-[#0D0F17] border border-[#1B1E2B] hover:border-[#2B3044] flex items-center gap-2 text-xs font-mono-tabular transition"
          >
            <Wallet className="w-3.5 h-3.5 text-[#8A91A6]" />
            <span className="text-white font-semibold">{activeEthBalanceNum.toFixed(3)} ETH</span>
            <span className="text-[#6B7280]">|</span>
            <span className="text-[#2CE59B] font-semibold">3,810 USDC</span>
            <ChevronDown className="w-3 h-3 text-[#8A91A6]" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          2. SECONDARY AXIOM WATCHLIST & QUICK-TAPE SUB-HEADER (`full_terminal.webp`)
      ===================================================================== */}
      <div className="h-7 px-3 border-b border-[#161823] bg-[#080A10] flex items-center justify-between text-[11px] shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSecurityModalOpen(true)}
            className="text-[#6B7280] hover:text-white p-0.5 flex items-center gap-1"
            title="Zero-Trust Security Settings"
          >
            <Settings className="w-3 h-3" />
          </button>
          <button className="text-[#F59E0B] p-0.5" title="Favorite Tokens">
            <Star className="w-3 h-3 fill-[#F59E0B]" />
          </button>
          <div className="h-3 w-[1px] bg-[#161823]" />

          {tokens
            .filter((t) => watchlistAddresses.includes(t.address))
            .map((t) => (
              <button
                key={t.address}
                onClick={() => openTokenInTerminal(t)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#121521] transition whitespace-nowrap ${
                  selectedTokenAddress === t.address && activeTab === 'terminal'
                    ? 'bg-[#121521] border border-[#22273B]'
                    : ''
                }`}
              >
                <span className="font-semibold text-[#D1D5DB]">{t.symbol}</span>
                <span className="font-mono-tabular text-[#8A91A6]">
                  {formatCompactUsd(t.marketCapUsd)}
                </span>
                <span
                  className={`font-mono-tabular font-semibold ${
                    t.change1h >= 0 ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                  }`}
                >
                  {t.change1h >= 0 ? '+' : ''}
                  {t.change1h}%
                </span>
              </button>
            ))}
        </div>

        {/* Right side of sub-header: Active Multi-Wallet & Instant Trade Hotkey toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setInstantTradeOpen(!instantTradeOpen)}
            className={`px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-semibold transition border ${
              instantTradeOpen
                ? 'bg-[#526FFF]/20 text-[#526FFF] border-[#526FFF]/40'
                : 'bg-[#10131E] text-[#9CA3AF] border-[#1E2233] hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 text-[#526FFF]" />
            <span>Instant Trade (Hotkeys)</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className="px-2 py-0.5 rounded bg-[#10131E] border border-[#1E2233] flex items-center gap-1.5 text-[11px] text-[#D1D5DB] font-mono-tabular"
          >
            <Wallet className="w-3 h-3 text-[#526FFF]" />
            <span>{subWallets.length} Wallets</span>
            <span className="text-[#2CE59B] font-semibold">{activeEthBalanceNum.toFixed(3)} ETH</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          3. MAIN WORKSPACE CONTENT AREA (8 AXIOM TABS + TOKEN TERMINAL)
      ===================================================================== */}
      <main className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* -------------------------------------------------------------------
            VIEW A: PULSE (3-Column Launchpad Feed: `pulse_new.png` & `pulse_filters.png`)
        ------------------------------------------------------------------- */}
        {activeTab === 'pulse' && (
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
                <span className="px-2 py-0.5 rounded bg-[#2CE59B]/10 border border-[#2CE59B]/30 text-[#2CE59B] text-[10px] font-semibold">
                  Robinhood Bonding Curve + V4 AMM • 0% Fee Sniping
                </span>
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

            {/* 3-Column Axiom Pulse Grid (`New Pairs`, `Final Stretch`, `Migrated`) */}
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
                            prev.includes(t.address) ? prev : [...prev, t.address]
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
        )}

        {/* -------------------------------------------------------------------
            VIEW B: DISCOVER (Axiom DEX Screener / Trending Table: `explore.png` 1:1)
        ------------------------------------------------------------------- */}
        {activeTab === 'discover' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#06070B]">
            {/* Discover Sub-Header (`DEX Screener`, `Trending`, `Robinhood Live`, Timeframe buttons, `Filter`) */}
            <div className="h-12 px-5 border-b border-[#161823] bg-[#080A10] flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-5">
                {(
                  [
                    { id: 'dex_screener', label: 'DEX Screener' },
                    { id: 'trending', label: 'Trending' },
                    { id: 'pump_live', label: 'Robinhood Live' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setDiscoverSubTab(st.id)}
                    className={`text-[15px] font-bold transition ${
                      discoverSubTab === st.id ? 'text-white' : 'text-[#6B7280] hover:text-[#D1D5DB]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5">
                {/* Timeframe selector (`5m`, `1h`, `6h`, `24h`) */}
                <div className="flex items-center bg-[#0D0F17] border border-[#1B1E2B] rounded-md p-0.5 text-xs">
                  {(['5m', '1h', '6h', '24h'] as const).map((tw) => (
                    <button
                      key={tw}
                      onClick={() => setTimeWindow(tw)}
                      className={`px-2.5 py-1 rounded font-semibold transition ${
                        timeWindow === tw
                          ? 'bg-[#191D2C] text-[#526FFF]'
                          : 'text-[#8A91A6] hover:text-white'
                      }`}
                    >
                      {tw}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPulseFiltersOpen(true)}
                  className="h-8 px-3 rounded-md bg-[#10131D] border border-[#1E2233] hover:border-[#526FFF] text-xs text-white flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#526FFF]" />
                  <span>Filter</span>
                </button>

                {/* Quick Buy Amount Input + P1/P2/P3 */}
                <div className="h-8 px-2.5 rounded-md bg-[#0D0F17] border border-[#1E2233] flex items-center gap-2">
                  <span className="text-xs text-[#8A91A6]">Quick Buy</span>
                  <input
                    type="text"
                    value={quickBuyAmountEth}
                    onChange={(e) => setQuickBuyAmountEth(e.target.value)}
                    className="w-12 bg-transparent text-right text-xs font-mono-tabular font-bold text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-[#526FFF] font-bold">ETH</span>
                  <div className="flex items-center gap-1 ml-1">
                    {([1, 2, 3] as const).map((pId) => (
                      <button
                        key={pId}
                        onClick={() => setActivePresetId(pId)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          activePresetId === pId ? 'bg-[#526FFF] text-white' : 'text-[#6B7280]'
                        }`}
                      >
                        P{pId}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Axiom Discover Table (`explore.png` 1:1 columns: `Pair Info`, `Market Cap`, `Liquidity`, `Volume`, `TXNS`, `Audit Log`, `Action`) */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#090B11] border-b border-[#161823] text-[11px] text-[#8A91A6] font-medium">
                  <tr>
                    <th className="py-2.5 px-5">Pair Info</th>
                    <th className="py-2.5 px-3">Market Cap ↓</th>
                    <th className="py-2.5 px-3">Liquidity</th>
                    <th className="py-2.5 px-3">Volume</th>
                    <th className="py-2.5 px-3">TXNS</th>
                    <th className="py-2.5 px-3">Audit Log</th>
                    <th className="py-2.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121520] text-xs">
                  {filteredTokens.map((t) => {
                    const changeVal =
                      timeWindow === '5m'
                        ? t.change5m
                        : timeWindow === '1h'
                          ? t.change1h
                          : timeWindow === '6h'
                            ? t.change6h
                            : t.change24h;
                    const watched = watchlistAddresses.includes(t.address);
                    return (
                      <tr
                        key={t.address}
                        onClick={() => openTokenInTerminal(t)}
                        className="hover:bg-[#0D101A] cursor-pointer transition group"
                      >
                        {/* Pair Info */}
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setWatchlistAddresses((prev) =>
                                  prev.includes(t.address)
                                    ? prev.filter((x) => x !== t.address)
                                    : [...prev, t.address]
                                );
                              }}
                              className="text-[#4B5563] hover:text-[#F59E0B]"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  watched ? 'fill-[#F59E0B] text-[#F59E0B]' : ''
                                }`}
                              />
                            </button>
                            <TokenAvatar
                              symbol={t.symbol}
                              name={t.name}
                              address={t.address}
                              iconUrl={t.iconUrl}
                              size="lg"
                              bondingProgress={t.bondingProgress}
                              showChainBadge
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-[14px] group-hover:text-[#526FFF] transition">
                                  {t.symbol}
                                </span>
                                <span className="text-[#8A91A6] text-xs">{t.name}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(t.address, t.address);
                                  }}
                                  className="text-[#6B7280] hover:text-white"
                                >
                                  {copiedId === t.address ? (
                                    <Check className="w-3 h-3 text-[#2CE59B]" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8A91A6]">
                                <span className="text-[#2CE59B] font-mono-tabular font-semibold">
                                  {t.age}
                                </span>
                                <Globe className="w-3 h-3 hover:text-white" />
                                <Send className="w-3 h-3 hover:text-white" />
                                <span className="flex items-center gap-0.5 font-mono-tabular">
                                  <Users className="w-3 h-3" /> {t.holders}
                                </span>
                                <span className="flex items-center gap-0.5 text-[#F59E0B] font-mono-tabular">
                                  <Crown className="w-3 h-3" /> {t.kolCount ?? 2}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Market Cap */}
                        <td className="py-3 px-3 font-mono-tabular">
                          <div className="font-bold text-white text-[13px]">
                            {formatCompactUsd(t.marketCapUsd)}
                          </div>
                          <div
                            className={`text-[11px] font-semibold ${
                              changeVal >= 0 ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                            }`}
                          >
                            {changeVal >= 0 ? '+' : ''}
                            {changeVal}%
                          </div>
                        </td>

                        {/* Liquidity */}
                        <td className="py-3 px-3 font-mono-tabular text-white font-semibold">
                          {formatCompactUsd(t.liquidityUsd)}
                        </td>

                        {/* Volume */}
                        <td className="py-3 px-3 font-mono-tabular text-white font-semibold">
                          {formatCompactUsd(t.volume24hUsd)}
                        </td>

                        {/* TXNS */}
                        <td className="py-3 px-3 font-mono-tabular">
                          <div className="font-bold text-white">{t.txns24h.toLocaleString()}</div>
                          <div className="text-[11px]">
                            <span className="text-[#2CE59B]">{t.buys24h}</span>
                            <span className="text-[#4B5563]"> / </span>
                            <span className="text-[#FF4D6A]">{t.sells24h}</span>
                          </div>
                        </td>

                        {/* Audit Log (`explore.png` vertical stack: Top 10 %, LP Burned 99.98%, Paid) */}
                        <td className="py-3 px-3 font-mono-tabular text-[11px]">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3 h-3 text-[#2CE59B]" />
                              <span
                                className={
                                  t.security.top10HoldersPct > 25
                                    ? 'text-[#FF4D6A] font-semibold'
                                    : 'text-[#2CE59B]'
                                }
                              >
                                {t.security.top10HoldersPct.toFixed(2)}%
                              </span>
                              <span className="text-[#6B7280] text-[10px]">Top 10</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#2CE59B]">
                              <Flame className="w-3 h-3 text-[#F59E0B]" />
                              <span>{t.security.lpLockedPct >= 99 ? '99.98%' : `${t.bondingProgress}% Curve`}</span>
                            </div>
                            {t.security.dexPaid && (
                              <div className="flex items-center gap-1 text-[#2CE59B] font-semibold">
                                <BadgeCheck className="w-3 h-3" />
                                <span>Paid</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Action (`Buy X ETH` in `#526FFF`) */}
                        <td className="py-3 px-5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteSpotSwap(t, 'BUY', quickBuyAmountEth);
                            }}
                            className="px-4 py-1.5 rounded-full bg-[#526FFF] hover:bg-[#425FEF] text-white font-bold text-xs transition shadow-[0_0_12px_rgba(82,111,255,0.3)]"
                          >
                            Buy {quickBuyAmountEth} ETH
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            VIEW C: TOKEN TERMINAL VIEW (`full_terminal.webp`, `trader_scan.png`, `market_order.png`, `limit_orders.png`, `sniper_buy.png`)
        ------------------------------------------------------------------- */}
        {activeTab === 'terminal' && (
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

            {/* 3-Column Axiom Terminal Workspace */}
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
                      Math.round(selectedToken.marketCapUsd * (1 + pct / 100)).toString()
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
                        centerRightTab === 'trades'
                          ? 'text-white'
                          : 'text-[#6B7280] hover:text-white'
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
                              activeTraderScanWallet === tr.maker ? null : tr.maker
                            )
                          }
                          className="p-0.5 rounded bg-[#151928] hover:bg-[#526FFF] text-[#8A91A6] hover:text-white transition"
                          title="Axiom Trader Scan"
                        >
                          <Search className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Axiom Trader Scan Popover (`trader_scan.png` 1:1) */}
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

              {/* Column 3 (`315px`): Axiom Spot Execution Ticket (`market_order.png`, `limit_orders.png`, `sniper_buy.png`) */}
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
                            (selectedToken.buys24h / Math.max(selectedToken.txns24h, 1)) * 100
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
                            Math.round(selectedToken.marketCapUsd * (1 + p / 100)).toString()
                          );
                        }}
                        className="w-full accent-[#526FFF]"
                      />
                      <div className="flex items-center justify-between text-xs font-mono-tabular">
                        <span className="text-[#8A91A6]">Target MC:</span>
                        <span className="text-white font-bold">
                          {formatCompactUsd(
                            parseFloat(limitTriggerMcap) ||
                              selectedToken.marketCapUsd * (1 + limitTargetPct / 100)
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
                        Automatically executes on Block 0 when {selectedToken.symbol} migrates from bonding curve to Robinhood V2 AMM.
                      </p>
                    </div>
                  )}

                  {/* Axiom Execution Settings Strip (`20%` Slippage | `0.001` Priority | `0.001` Bribe | `MEV: Secure`) */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0C0E16] border border-[#171A26] text-[10px] font-mono-tabular text-[#9CA3AF]">
                    <span>⚡ {activePreset.slippagePct}%</span>
                    <span>⛽ {activePreset.priorityFeeEth}</span>
                    <span>🪙 {activePreset.tipEth}</span>
                    <button
                      onClick={() => {
                        const modes: Array<'Off' | 'Reduced' | 'Secure'> = [
                          'Off',
                          'Reduced',
                          'Secure',
                        ];
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
                        <ShieldCheck className="w-3 h-3" /> {selectedToken.security.auditChecks} Verified
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
        )}

        {/* -------------------------------------------------------------------
            VIEW D: PERPETUALS (Axiom Hyperliquid Perps Terminal: `perps.png` 1:1)
        ------------------------------------------------------------------- */}
        {activeTab === 'perps' && (
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
                              <td className="py-2.5 px-3 text-white">
                                ${liveMkt.toLocaleString()}
                              </td>
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
                    <span className="font-mono-tabular font-bold text-[#526FFF]">
                      {perpLeverage}x
                    </span>
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
                  {perpSide === 'LONG' ? 'Buy / Long' : 'Sell / Short'} {selectedPerp.baseAsset} (0% Fee)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            VIEW E: TRACKERS (Dedicated Wallet Tracker + Live Trades + X Monitor Hub)
        ------------------------------------------------------------------- */}
        {activeTab === 'trackers' && (
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
                    <span className="text-[11px] text-[#2CE59B]">
                      Zero-Knowledge Client Storage
                    </span>
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
                            {tw.author}{' '}
                            <span className="text-[#8A91A6] font-normal">{tw.handle}</span>
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
        )}

        {/* -------------------------------------------------------------------
            VIEW F: YIELD (`AxiomYieldView` matching `staking.png` 1:1)
        ------------------------------------------------------------------- */}
        {activeTab === 'yield' && (
          <AxiomYieldView
            ethBalance={activeEthBalanceNum}
            stakedEth={stakedEth}
            stakedUsdc={stakedUsdc}
            onStakeEth={(amt) => {
              setStakedEth((s) => s + amt);
              triggerToast('ETH Yield Vault Staked', `Staked ${amt} ETH @ 14.8% APY • 0% Fee`, 'success');
            }}
            onUnstakeEth={(amt) => {
              setStakedEth((s) => Math.max(0, s - amt));
              triggerToast('ETH Unstaked Instantly', `Withdrew ${amt} ETH • 0% Fee`, 'info');
            }}
            onStakeUsdc={(amt) => {
              setStakedUsdc((s) => s + amt);
              triggerToast('USDC Margin Vault Supplied', `Supplied ${amt} USDC @ 15.05% APY`, 'success');
            }}
          />
        )}

        {/* -------------------------------------------------------------------
            VIEW G: VISION (`AxiomVisionView` KOL Screener + Bundle Checker)
        ------------------------------------------------------------------- */}
        {activeTab === 'vision' && (
          <AxiomVisionView
            wallets={trackedWallets}
            tokens={tokens}
            onToggleCopyTrade={(addr) =>
              setTrackedWallets((prev) =>
                prev.map((w) =>
                  w.address === addr ? { ...w, copyTradeEnabled: !w.copyTradeEnabled } : w
                )
              )
            }
            onSelectToken={openTokenInTerminal}
            onQuickBuy={(tok, e) => {
              e.stopPropagation();
              handleExecuteSpotSwap(tok, 'BUY', quickBuyAmountEth);
            }}
          />
        )}

        {/* -------------------------------------------------------------------
            VIEW H: PORTFOLIO (`AxiomPortfolioView` matching `portfolio_spot.png`, `portfolio_perp.png`, `multi_wallet.png`)
        ------------------------------------------------------------------- */}
        {activeTab === 'portfolio' && (
          <AxiomPortfolioView
            ethBalance={activeEthBalanceNum}
            ethPriceUsd={ethPriceUsd}
            tokenHoldings={tokenHoldings}
            tokens={tokens}
            trades={tradeHistory}
            subWallets={subWallets}
            onCreateSubWallet={(name) =>
              setSubWallets((prev) => [
                ...prev,
                {
                  id: `sw-${Date.now()}`,
                  name,
                  address: `0x${Math.random().toString(16).slice(2, 10)}92A87cD3190f88721bC00192837465Fe`,
                  balanceEth: 0.25,
                  balanceUsdc: 100,
                  holdingsCount: 0,
                  isPrimary: false,
                  selectedForMultiBuy: true,
                  tag: 'Sub-Wallet',
                },
              ])
            }
            onDistributeEth={(amt) =>
              triggerToast(
                'Multi-Wallet Splitter Executed',
                `Distributed ${amt} ETH across ${subWallets.length} sub-wallets with 0% fee`,
                'success'
              )
            }
            onSelectToken={openTokenInTerminal}
            onQuickSellFull={(tok) => handleExecuteSpotSwap(tok, 'SELL', '0.05', 100)}
            onOpenSharePnl={(tok) =>
              setSharePnlData({
                symbol: tok.symbol,
                name: tok.name,
                pnlPct: 142.8,
                pnlUsd: 384.2,
                investedUsd: 269.0,
                currentValueUsd: 653.2,
                entryPrice: formatTokenPrice(tok.priceUsd * 0.65),
                markPrice: formatTokenPrice(tok.priceUsd),
              })
            }
          />
        )}

        {/* -------------------------------------------------------------------
            VIEW I: REWARDS (`AxiomRewardsView` matching `rewards.png` 1:1)
        ------------------------------------------------------------------- */}
        {activeTab === 'rewards' && (
          <AxiomRewardsView
            totalTradesCount={tradeHistory.length}
            onClaimRewards={() =>
              triggerToast(
                'Cashback Rebate Claimed',
                '0.062 ETH credited directly to your wallet with 0% fee',
                'success'
              )
            }
          />
        )}

        {/* ===================================================================
            FLOATING AXIOM OVERLAYS (`Instant Trade`, `Wallet Tracker`, `Tweet Monitor`)
        =================================================================== */}
        <InstantTradeFloatingPanel
          open={instantTradeOpen}
          onClose={() => setInstantTradeOpen(false)}
          token={selectedToken}
          activePreset={activePresetId}
          onSelectPreset={setActivePresetId}
          presetConfig={activePreset}
          ethBalance={activeEthBalanceNum}
          tokenHoldingAmount={currentHoldingTokens}
          tokenHoldingUsd={currentHoldingUsd}
          onExecuteBuy={(ethAmt) => handleExecuteSpotSwap(selectedToken, 'BUY', ethAmt)}
          onExecuteSellPct={(pct) => handleExecuteSpotSwap(selectedToken, 'SELL', '0.05', pct)}
          onOpenPresetSettings={() => setSecurityModalOpen(true)}
        />

        <FloatingWalletTrackerModal
          open={walletTrackerOpen}
          onClose={() => setWalletTrackerOpen(false)}
          wallets={trackedWallets}
          onAddWallet={(emoji, label, address) =>
            setTrackedWallets((prev) => [
              {
                address,
                emoji,
                label,
                tag: 'Smart Whale',
                winRatePct: 74.5,
                pnl7dUsd: 14200,
                pnl7dPct: 88.4,
                trades7d: 31,
                copyTradeEnabled: true,
                lastAction: {
                  side: 'BUY',
                  symbol: 'FEATHER',
                  tokenAddress: INITIAL_TOKEN_MARKETS[0].address,
                  amountEth: 0.25,
                  valueUsd: 650,
                  marketCapUsd: 41800000,
                  timeAgo: '1m',
                },
              },
              ...prev,
            ])
          }
          onRemoveWallet={(addr) =>
            setTrackedWallets((prev) => prev.filter((w) => w.address !== addr))
          }
          onToggleCopyTrade={(addr) =>
            setTrackedWallets((prev) =>
              prev.map((w) =>
                w.address === addr ? { ...w, copyTradeEnabled: !w.copyTradeEnabled } : w
              )
            )
          }
          quickBuyEth={quickBuyAmountEth}
          onQuickCopyBuy={(symbol, amtEth) => {
            const target = tokens.find((t) => t.symbol === symbol) || tokens[0];
            handleExecuteSpotSwap(target, 'BUY', amtEth);
          }}
        />

        <FloatingTwitterMonitorModal
          open={twitterMonitorOpen}
          onClose={() => setTwitterMonitorOpen(false)}
          tweets={tweets}
          onAddCustomTweetHandle={(handle) =>
            setTweets((prev) => [
              {
                id: `tw-${Date.now()}`,
                author: handle.replace('@', ''),
                handle: handle.startsWith('@') ? handle : `@${handle}`,
                avatarUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
                verified: true,
                timeAgo: 'now',
                timestamp: 'Live',
                text: `Tracking live Robinhood Chain alerts for ${handle} on One Shot Pro ($FEATHER)`,
                detectedTicker: 'FEATHER',
                category: 'KOL',
              },
              ...prev,
            ])
          }
          onQuickBuyDetectedToken={(sym) => {
            const target = tokens.find((t) => t.symbol === sym) || tokens[0];
            openTokenInTerminal(target);
            handleExecuteSpotSwap(target, 'BUY', quickBuyAmountEth);
          }}
        />
      </main>

      {/* =====================================================================
          4. BOTTOM PERSISTENT AXIOM STATUS BAR (`bottom_bar.png` & `full_terminal.webp`)
      ===================================================================== */}
      <footer className="h-7 px-3 border-t border-[#161823] bg-[#06070B] flex items-center justify-between text-[11px] text-[#8A91A6] shrink-0 z-30">
        {/* Left: PRESET 1 + Wallet Counter + Wallet Tracker + Twitter + Pulse + PnL + ETH Price */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              const next: Record<1 | 2 | 3, 1 | 2 | 3> = { 1: 2, 2: 3, 3: 1 };
              setActivePresetId(next[activePresetId]);
            }}
            className="px-2 py-0.5 rounded bg-[#526FFF]/20 text-[#526FFF] font-bold text-[10px] flex items-center gap-1"
          >
            <SlidersHorizontal className="w-2.5 h-2.5" />
            <span>PRESET {activePresetId}</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className="px-2 py-0.5 rounded bg-[#0D0F17] border border-[#1B1E2B] text-white font-mono-tabular text-[10px] flex items-center gap-1"
          >
            <Wallet className="w-2.5 h-2.5 text-[#526FFF]" />
            <span>{subWallets.length}</span>
            <span className="text-[#2CE59B]">{activeEthBalanceNum.toFixed(2)}</span>
          </button>

          <div className="h-3 w-[1px] bg-[#161823]" />

          <button
            onClick={() => setWalletTrackerOpen(!walletTrackerOpen)}
            className={`flex items-center gap-1 hover:text-white transition ${
              walletTrackerOpen ? 'text-white font-semibold' : ''
            }`}
          >
            <Wallet className="w-3 h-3" />
            <span>Wallet</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6A]" />
          </button>

          <button
            onClick={() => setTwitterMonitorOpen(!twitterMonitorOpen)}
            className={`flex items-center gap-1 hover:text-white transition ${
              twitterMonitorOpen ? 'text-white font-semibold' : ''
            }`}
          >
            <span>𝕏 Twitter</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6A]" />
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <Globe className="w-3 h-3" />
            <span>Discover</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6A]" />
          </button>

          <button
            onClick={() => setActiveTab('pulse')}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <Activity className="w-3 h-3" />
            <span>Pulse</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6A]" />
          </button>

          <button
            onClick={() =>
              setSharePnlData({
                symbol: selectedToken.symbol,
                name: selectedToken.name,
                pnlPct: 167.4,
                pnlUsd: 418.5,
                investedUsd: 250,
                currentValueUsd: 668.5,
                entryPrice: formatTokenPrice(selectedToken.priceUsd * 0.6),
                markPrice: formatTokenPrice(selectedToken.priceUsd),
              })
            }
            className="flex items-center gap-1 hover:text-white transition"
          >
            <span>PnL</span>
          </button>

          <div className="h-3 w-[1px] bg-[#161823]" />

          <span className="font-mono-tabular text-[#2CE59B] font-semibold">
            ETH ${ethPriceUsd.toLocaleString()}
          </span>
        </div>

        {/* Right: Connection is stable + Block # + GLOBAL + Docs */}
        <div className="flex items-center gap-3 shrink-0 font-mono-tabular">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0C1D17] border border-[#193B2D] text-[#2CE59B] text-[10px] font-sans font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2CE59B]" />
            <span>Connection is stable</span>
          </div>

          <span className="hidden md:inline text-[10px] text-[#8A91A6]">
            Block #{blockNumber.toLocaleString()} • {gasGwei} Gwei • {rpcLatencyMs}ms
          </span>

          <button
            onClick={() => setPaperMode(!paperMode)}
            className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
              !paperMode
                ? 'bg-[#2CE59B]/15 text-[#2CE59B] border-[#2CE59B]/30'
                : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
            }`}
            title="Toggle between Live Robinhood Chain Testnet (46630) and Instant Paper Sim"
          >
            {!paperMode ? 'ON-CHAIN 46630' : 'SIM MODE'}
          </button>

          <span className="text-[10px] text-[#D1D5DB] font-sans">GLOBAL ▾</span>

          <button
            onClick={() => setSecurityModalOpen(true)}
            className="text-[#8A91A6] hover:text-white font-sans text-[11px]"
          >
            Docs & Audit
          </button>
        </div>
      </footer>

      {/* =====================================================================
          5. AXIOM 14-FILTER PULSE MODAL (`pulse_filters.png` 1:1)
      ===================================================================== */}
      {pulseFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#0B0D14] border border-[#1E2233] shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#181B27] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#526FFF]" />
                <span className="font-bold text-sm text-white">
                  Pulse Filters (14 Axiom Parameters)
                </span>
              </div>
              <button
                onClick={() => setPulseFiltersOpen(false)}
                className="text-[#8A91A6] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Protocols Pills (`pulse_filters.png`) */}
              <div>
                <div className="text-xs font-semibold text-[#8A91A6] mb-2">Protocols</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Robinhood Bonding Curve',
                    'Pump V2',
                    'GitPump',
                    'Sherwood DBC',
                    'Uniswap V4 Pool',
                    'Raydium AMM',
                    'Moonshot',
                    'Bonk',
                    'LaunchLab',
                    'Meteora',
                  ].map((proto) => {
                    const active = pulseFilters.protocols.includes(proto);
                    return (
                      <button
                        key={proto}
                        onClick={() =>
                          setPulseFilters((prev) => ({
                            ...prev,
                            protocols: active
                              ? prev.protocols.filter((p) => p !== proto)
                              : [...prev.protocols, proto],
                          }))
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                          active
                            ? 'bg-[#2CE59B]/15 border-[#2CE59B] text-[#2CE59B]'
                            : 'bg-[#10131E] border-[#1E2233] text-[#8A91A6]'
                        }`}
                      >
                        {proto}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Keywords */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#8A91A6]">Search Keywords</label>
                  <input
                    type="text"
                    value={pulseFilters.includeKeywords}
                    onChange={(e) =>
                      setPulseFilters((prev) => ({ ...prev, includeKeywords: e.target.value }))
                    }
                    placeholder="keyword1, keyword2..."
                    className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#8A91A6]">Exclude Keywords</label>
                  <input
                    type="text"
                    value={pulseFilters.excludeKeywords}
                    onChange={(e) =>
                      setPulseFilters((prev) => ({ ...prev, excludeKeywords: e.target.value }))
                    }
                    placeholder="scam, test..."
                    className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-xs text-white"
                  />
                </div>
              </div>

              {/* Sub-tabs: Metrics / Audit / Socials */}
              <div className="flex items-center gap-2 border-b border-[#181B27] pb-2 text-xs font-bold">
                {(
                  [
                    { id: 'keywords', label: 'Market Cap & Volume' },
                    { id: 'metrics', label: 'Security & Holders (Top 10 / Dev / Snipers / Bundle)' },
                    { id: 'socials', label: 'Socials & DEX Paid' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPulseFilterTab(t.id)}
                    className={`px-2.5 py-1 rounded ${
                      pulseFilterTab === t.id ? 'bg-[#526FFF] text-white' : 'text-[#8A91A6]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {pulseFilterTab === 'keywords' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[#8A91A6]">Min Market Cap ($)</label>
                    <input
                      type="text"
                      value={pulseFilters.minMcap}
                      onChange={(e) => setPulseFilters((p) => ({ ...p, minMcap: e.target.value }))}
                      placeholder="e.g. 10000"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Max Market Cap ($)</label>
                    <input
                      type="text"
                      value={pulseFilters.maxMcap}
                      onChange={(e) => setPulseFilters((p) => ({ ...p, maxMcap: e.target.value }))}
                      placeholder="e.g. 5000000"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Min Volume ($)</label>
                    <input
                      type="text"
                      value={pulseFilters.minVolume}
                      onChange={(e) => setPulseFilters((p) => ({ ...p, minVolume: e.target.value }))}
                      placeholder="e.g. 5000"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Min Liquidity ($)</label>
                    <input
                      type="text"
                      value={pulseFilters.minLiquidity}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, minLiquidity: e.target.value }))
                      }
                      placeholder="e.g. 8000"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                </div>
              )}

              {pulseFilterTab === 'metrics' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[#8A91A6]">Max Top 10 Holders (%)</label>
                    <input
                      type="text"
                      value={pulseFilters.maxTop10Pct}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, maxTop10Pct: e.target.value }))
                      }
                      placeholder="e.g. 25"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Max Dev Holding (%)</label>
                    <input
                      type="text"
                      value={pulseFilters.maxDevPct}
                      onChange={(e) => setPulseFilters((p) => ({ ...p, maxDevPct: e.target.value }))}
                      placeholder="e.g. 5"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Max Snipers (%)</label>
                    <input
                      type="text"
                      value={pulseFilters.maxSnipersPct}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, maxSnipersPct: e.target.value }))
                      }
                      placeholder="e.g. 10"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Max Bundle (%)</label>
                    <input
                      type="text"
                      value={pulseFilters.maxBundlePct}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, maxBundlePct: e.target.value }))
                      }
                      placeholder="e.g. 15"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Min Holders Count</label>
                    <input
                      type="text"
                      value={pulseFilters.minHolders}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, minHolders: e.target.value }))
                      }
                      placeholder="e.g. 100"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A91A6]">Min Pro Traders</label>
                    <input
                      type="text"
                      value={pulseFilters.minProTraders}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, minProTraders: e.target.value }))
                      }
                      placeholder="e.g. 5"
                      className="w-full mt-1 px-2.5 py-1.5 rounded bg-[#080A10] border border-[#1E2233] text-white font-mono-tabular"
                    />
                  </div>
                </div>
              )}

              {pulseFilterTab === 'socials' && (
                <div className="space-y-2.5 text-xs">
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pulseFilters.dexPaidOnly}
                      onChange={(e) =>
                        setPulseFilters((p) => ({ ...p, dexPaidOnly: e.target.checked }))
                      }
                      className="accent-[#526FFF]"
                    />
                    <span>DEX Paid Only (Verified Enhanced Token Info)</span>
                  </label>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-[#181B27] bg-[#080A10] flex items-center justify-between">
              <button
                onClick={() =>
                  setPulseFilters({
                    protocols: [
                      'Robinhood Bonding Curve',
                      'Pump V2',
                      'GitPump',
                      'Sherwood DBC',
                      'Uniswap V4 Pool',
                      'Raydium AMM',
                    ],
                    includeKeywords: '',
                    excludeKeywords: '',
                    minMcap: '',
                    maxMcap: '',
                    minVolume: '',
                    minLiquidity: '',
                    maxTop10Pct: '',
                    maxDevPct: '',
                    maxSnipersPct: '',
                    maxInsidersPct: '',
                    maxBundlePct: '',
                    minHolders: '',
                    minProTraders: '',
                    dexPaidOnly: false,
                  })
                }
                className="text-xs text-[#8A91A6] hover:text-white"
              >
                Reset All
              </button>
              <button
                onClick={() => setPulseFiltersOpen(false)}
                className="px-5 py-1.5 rounded-full bg-[#526FFF] text-white font-bold text-xs"
              >
                Apply All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. GLOBAL `/` COMMAND PALETTE MODAL
      ===================================================================== */}
      {searchModalOpen && (
        <div
          onClick={() => setSearchModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-xl bg-[#0B0D14] border border-[#22273B] shadow-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-[#181B27] flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#526FFF]" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token ticker, name, or Robinhood Chain contract address..."
                className="w-full bg-transparent text-sm text-white focus:outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-xs text-[#8A91A6] hover:text-white"
              >
                ESC
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-[#141722]">
              {filteredTokens.map((t) => (
                <div
                  key={t.address}
                  onClick={() => {
                    openTokenInTerminal(t);
                    setSearchModalOpen(false);
                  }}
                  className="p-3 hover:bg-[#111522] flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <TokenAvatar
                      symbol={t.symbol}
                      name={t.name}
                      address={t.address}
                      iconUrl={t.iconUrl}
                      size="md"
                      bondingProgress={t.bondingProgress}
                    />
                    <div>
                      <div className="font-bold text-white text-sm">
                        {t.symbol}{' '}
                        <span className="text-xs text-[#8A91A6] font-normal">{t.name}</span>
                      </div>
                      <div className="text-[11px] text-[#8A91A6] font-mono-tabular">
                        MC {formatCompactUsd(t.marketCapUsd)} • Vol{' '}
                        {formatCompactUsd(t.volume24hUsd)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExecuteSpotSwap(t, 'BUY', quickBuyAmountEth);
                      setSearchModalOpen(false);
                    }}
                    className="px-3 py-1 rounded-full bg-[#526FFF] text-white font-bold text-xs"
                  >
                    ⚡ {quickBuyAmountEth} ETH
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Architecture Modal & Share PnL Modal */}
      <SecurityArchitectureModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

      {sharePnlData && (
        <SharePnlModal
          isOpen={true}
          onClose={() => setSharePnlData(null)}
          {...sharePnlData}
        />
      )}

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-10 right-4 z-50 max-w-sm rounded-xl bg-[#0D101A] border border-[#526FFF]/50 p-3.5 shadow-2xl flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-[#2CE59B] mt-1.5 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-white">{toast.title}</div>
            <div className="text-[#9CA3AF] mt-0.5">{toast.subtitle}</div>
            {toast.txHash && (
              <a
                href={`${ROBINHOOD_TESTNET_CONFIG.explorerUrl}/tx/${toast.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#526FFF] hover:underline inline-flex items-center gap-1 mt-1 font-mono-tabular"
              >
                View on Blockscout Explorer <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
