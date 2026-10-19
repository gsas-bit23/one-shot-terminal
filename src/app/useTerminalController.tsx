import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Copy, Check, Wallet } from 'lucide-react';
import { useRouteTab } from '../routes/useRouteTab';
import { useTerminalStore } from '../store/terminalStore';
import { useQuery } from '@tanstack/react-query';
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
} from '../lib/marketData';
import {
  connectBrowserWallet,
  executeZeroFeeSwap,
  fetchChainTelemetry,
  fetchWalletEthBalance,
  shortenAddress,
} from '../lib/robinhoodChain';
import {
  DiscoverSubTab,
  TimeWindow,
  OrderSide,
  OrderMode,
  PerpSide,
  LimitOrderRecord,
  PerpPosition,
  PulseFilterState,
} from '../app/types';

/** All terminal state and handlers (formerly the body of App). */
export function useTerminalController() {
  // Primary Navigation State
  const { activeTab, setActiveTab } = useRouteTab();
  const [discoverSubTab, setDiscoverSubTab] = useState<DiscoverSubTab>('dex_screener');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('1h');

  // Market State
  const [tokens, setTokens] = useState<TokenMarket[]>(INITIAL_TOKEN_MARKETS);
  const [perpMarkets, setPerpMarkets] = useState<PerpMarket[]>(PERP_MARKETS);
  const selectedTokenAddress = useTerminalStore((s) => s.selectedTokenAddress);
  const setSelectedTokenAddress = useTerminalStore((s) => s.setSelectedTokenAddress);
  const [selectedPerpSymbol, setSelectedPerpSymbol] = useState<string>(PERP_MARKETS[0].symbol);

  // Search & Watchlist
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [watchlistAddresses, setWatchlistAddresses] = useState<string[]>(
    INITIAL_TOKEN_MARKETS.slice(0, 5).map((t) => t.address),
  );
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Wallet & Robinhood Chain Telemetry
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalanceEth, setWalletBalanceEth] = useState<string>('0.0000');
  const [paperBalanceEth, setPaperBalanceEth] = useState<number>(2.5);
  const paperMode = useTerminalStore((s) => s.paperMode);
  const setPaperMode = useTerminalStore((s) => s.setPaperMode);
  const [blockNumber, setBlockNumber] = useState<number>(138249120);
  const [gasGwei, setGasGwei] = useState<string>('0.010');
  const [rpcLatencyMs, setRpcLatencyMs] = useState<number>(34);

  // Staking State (`Yield` tab)
  const [stakedEth, setStakedEth] = useState<number>(1.25);
  const [stakedUsdc, setStakedUsdc] = useState<number>(2400);

  // P1 / P2 / P3 Presets & Security
  const [presets, setPresets] = useState<Record<1 | 2 | 3, ExecutionPreset>>(DEFAULT_PRESETS);
  const [activePresetId, setActivePresetId] = useState<1 | 2 | 3>(1);
  const activePreset = presets[activePresetId];

  const [quickBuyAmountEth, setQuickBuyAmountEth] = useState<string>('0.05');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [securityModalOpen, setSecurityModalOpen] = useState<boolean>(false);

  // Floating Panels (`Instant Trade`, `Wallet Tracker`, `Twitter Monitor`, `Pulse Filters`, `Share PnL`)
  const [instantTradeOpen, setInstantTradeOpen] = useState<boolean>(false);
  const [walletTrackerOpen, setWalletTrackerOpen] = useState<boolean>(false);
  const [twitterMonitorOpen, setTwitterMonitorOpen] = useState<boolean>(false);
  const [pulseFiltersOpen, setPulseFiltersOpen] = useState<boolean>(false);
  const [pulseFilterTab, setPulseFilterTab] = useState<'keywords' | 'metrics' | 'socials'>(
    'keywords',
  );
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
    VOLT: 12.5,
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
    [tokens, selectedTokenAddress],
  );

  const selectedPerp = useMemo(
    () => perpMarkets.find((p) => p.symbol === selectedPerpSymbol) || perpMarkets[0],
    [perpMarkets, selectedPerpSymbol],
  );

  const ethPriceUsd = 2615.4;

  // Synthesize realistic sound effects for 1-click fills
  const playFillBeep = (isBuy = true) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
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
    txHash?: string,
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

  // Live chain telemetry + wallet balance (TanStack Query polling)
  const telemetryQuery = useQuery({
    queryKey: ['chainTelemetry'],
    queryFn: async () => {
      const t0 = performance.now();
      const tel = await fetchChainTelemetry();
      return { ...tel, latencyMs: Math.max(1, Math.round(performance.now() - t0)) };
    },
    refetchInterval: 7000,
  });
  useEffect(() => {
    const tel = telemetryQuery.data;
    if (!tel) return;
    if (tel.blockNumber > 0) setBlockNumber(tel.blockNumber);
    setGasGwei(tel.gasPriceGwei);
    setRpcLatencyMs(tel.latencyMs);
  }, [telemetryQuery.data]);

  const balanceQuery = useQuery({
    queryKey: ['walletBalance', walletAddress],
    queryFn: () => fetchWalletEthBalance(walletAddress as string),
    enabled: Boolean(walletAddress),
    refetchInterval: 7000,
  });
  useEffect(() => {
    if (balanceQuery.data) setWalletBalanceEth(balanceQuery.data);
  }, [balanceQuery.data]);

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
        }),
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
        }),
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
          'success',
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
    customSellRatio?: number,
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
        maker: walletAddress ? shortenAddress(walletAddress) : 'You (paper)',
        txHash: res.txHash ?? '',
        mevProtected: true,
      };
      setTradeHistory((prev) => [newRecord, ...prev]);
      playFillBeep(side === 'BUY');

      triggerToast(
        `${side} ${token.symbol} Filled (${activePreset.shortLabel} • 0% Fee)`,
        `${ethAmt} ETH ($${usdValue.toFixed(2)}) • Saved $${(usdValue * 0.01).toFixed(2)} vs a typical 1% fee`,
        'success',
        res.txHash ?? undefined,
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
        prev.includes(selectedToken.address) ? prev : [...prev, selectedToken.address],
      );
    }
    playFillBeep(true);
    triggerToast(
      `${orderMode === 'SNIPER' ? 'Migration Sniper' : 'Limit Order'} Armed`,
      `${orderSide} ${selectedToken.symbol} @ ${formatCompactUsd(newOrder.triggerMcapUsd)} MC • 0.00% Fee`,
      'info',
    );
  };

  // Open Perpetual Position (`perps.png`)
  const handleOpenPerpPosition = () => {
    const coll = Math.max(10, parseFloat(perpCollateralUsd) || 100);
    const size = coll * perpLeverage;
    const entry = selectedPerp.markPrice;
    const liq =
      perpSide === 'LONG' ? entry * (1 - 0.92 / perpLeverage) : entry * (1 + 0.92 / perpLeverage);

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
      'success',
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
        if (!t.symbol.toLowerCase().includes(kw) && !t.name.toLowerCase().includes(kw))
          return false;
      }
      if (pulseFilters.excludeKeywords.trim()) {
        const ex = pulseFilters.excludeKeywords.toLowerCase();
        if (t.symbol.toLowerCase().includes(ex) || t.name.toLowerCase().includes(ex)) return false;
      }
      if (pulseFilters.minMcap && t.marketCapUsd < parseFloat(pulseFilters.minMcap)) return false;
      if (pulseFilters.maxMcap && t.marketCapUsd > parseFloat(pulseFilters.maxMcap)) return false;
      if (pulseFilters.minVolume && t.volume24hUsd < parseFloat(pulseFilters.minVolume))
        return false;
      if (pulseFilters.minLiquidity && t.liquidityUsd < parseFloat(pulseFilters.minLiquidity))
        return false;
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
      if (pulseFilters.minHolders && t.holders < parseInt(pulseFilters.minHolders, 10))
        return false;
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
    [filteredTokens],
  );
  const pulseFinalStretch = useMemo(
    () => filteredTokens.filter((t) => t.category === 'graduating'),
    [filteredTokens],
  );
  const pulseMigrated = useMemo(
    () => filteredTokens.filter((t) => t.category === 'graduated'),
    [filteredTokens],
  );

  // Live Trades Stream for Center-Right column in Token Terminal (`full_terminal.webp` & `trader_scan.png`)
  const tokenLiveTrades = useMemo(() => {
    const baseMc = selectedToken.marketCapUsd;
    const rows = [
      {
        age: '1s',
        side: 'BUY' as const,
        mc: baseMc * 1.002,
        totalUsd: 412.5,
        maker: 'H8fP...6pump',
      },
      { age: '3s', side: 'BUY' as const, mc: baseMc * 0.998, totalUsd: 185.2, maker: 'Erad...b7X' },
      { age: '5s', side: 'SELL' as const, mc: baseMc * 0.994, totalUsd: 94.8, maker: 'Biee...33A' },
      {
        age: '8s',
        side: 'BUY' as const,
        mc: baseMc * 0.991,
        totalUsd: 1240.0,
        maker: '7xQp...91K',
      },
      { age: '12s', side: 'BUY' as const, mc: baseMc * 0.986, totalUsd: 62.4, maker: '4vLm...88P' },
      {
        age: '15s',
        side: 'SELL' as const,
        mc: baseMc * 0.989,
        totalUsd: 310.0,
        maker: '9aXz...14Q',
      },
      {
        age: '19s',
        side: 'BUY' as const,
        mc: baseMc * 0.981,
        totalUsd: 540.6,
        maker: 'C9kR...22W',
      },
      { age: '24s', side: 'BUY' as const, mc: baseMc * 0.975, totalUsd: 88.0, maker: '3mNp...55T' },
      {
        age: '29s',
        side: 'SELL' as const,
        mc: baseMc * 0.978,
        totalUsd: 142.3,
        maker: '6zVb...09L',
      },
      {
        age: '34s',
        side: 'BUY' as const,
        mc: baseMc * 0.972,
        totalUsd: 890.0,
        maker: 'H8fP...6pump',
      },
      {
        age: '41s',
        side: 'BUY' as const,
        mc: baseMc * 0.968,
        totalUsd: 215.0,
        maker: '5tYu...77M',
      },
    ];
    return makerFilter ? rows.filter((r) => r.maker === makerFilter) : rows;
  }, [selectedToken, makerFilter]);

  const currentHoldingTokens = tokenHoldings[selectedToken.symbol] || 0;
  const currentHoldingUsd = currentHoldingTokens * selectedToken.priceUsd;
  const currentInvestedUsd = currentHoldingUsd * 0.78;
  const currentPnlUsd = currentHoldingUsd - currentInvestedUsd;
  const activeEthBalanceNum = paperMode ? paperBalanceEth : parseFloat(walletBalanceEth) || 0;

  return {
    activeTab,
    setActiveTab,
    discoverSubTab,
    setDiscoverSubTab,
    timeWindow,
    setTimeWindow,
    tokens,
    setTokens,
    perpMarkets,
    setPerpMarkets,
    selectedTokenAddress,
    setSelectedTokenAddress,
    selectedPerpSymbol,
    setSelectedPerpSymbol,
    searchQuery,
    setSearchQuery,
    searchModalOpen,
    setSearchModalOpen,
    watchlistAddresses,
    setWatchlistAddresses,
    searchInputRef,
    walletAddress,
    setWalletAddress,
    walletBalanceEth,
    setWalletBalanceEth,
    paperBalanceEth,
    setPaperBalanceEth,
    paperMode,
    setPaperMode,
    blockNumber,
    setBlockNumber,
    gasGwei,
    setGasGwei,
    rpcLatencyMs,
    setRpcLatencyMs,
    stakedEth,
    setStakedEth,
    stakedUsdc,
    setStakedUsdc,
    presets,
    setPresets,
    activePresetId,
    setActivePresetId,
    activePreset,
    quickBuyAmountEth,
    setQuickBuyAmountEth,
    soundEnabled,
    setSoundEnabled,
    securityModalOpen,
    setSecurityModalOpen,
    instantTradeOpen,
    setInstantTradeOpen,
    walletTrackerOpen,
    setWalletTrackerOpen,
    twitterMonitorOpen,
    setTwitterMonitorOpen,
    pulseFiltersOpen,
    setPulseFiltersOpen,
    pulseFilterTab,
    setPulseFilterTab,
    activeTraderScanWallet,
    setActiveTraderScanWallet,
    makerFilter,
    setMakerFilter,
    sharePnlData,
    setSharePnlData,
    pulseFilters,
    setPulseFilters,
    trackedWallets,
    setTrackedWallets,
    subWallets,
    setSubWallets,
    tweets,
    setTweets,
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
    armedSnipes,
    setArmedSnipes,
    isSwapping,
    setIsSwapping,
    terminalBottomTab,
    setTerminalBottomTab,
    centerRightTab,
    setCenterRightTab,
    tokenHoldings,
    setTokenHoldings,
    tradeHistory,
    setTradeHistory,
    limitOrders,
    setLimitOrders,
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
    copiedId,
    setCopiedId,
    toast,
    setToast,
    selectedToken,
    selectedPerp,
    ethPriceUsd,
    playFillBeep,
    triggerToast,
    telemetryQuery,
    balanceQuery,
    handleConnectWallet,
    handleExecuteSpotSwap,
    handlePlaceConditionalOrder,
    handleOpenPerpPosition,
    handleCopy,
    openTokenInTerminal,
    filteredTokens,
    pulseNewPairs,
    pulseFinalStretch,
    pulseMigrated,
    tokenLiveTrades,
    currentHoldingTokens,
    currentHoldingUsd,
    currentInvestedUsd,
    currentPnlUsd,
    activeEthBalanceNum,
  };
}

export type TerminalController = ReturnType<typeof useTerminalController>;
