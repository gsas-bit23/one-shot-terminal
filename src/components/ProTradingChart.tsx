import React, { useEffect, useRef, useState } from 'react';
import {
  Crosshair,
  TrendingUp,
  Sliders,
  Brush,
  Type,
  Smile,
  Ruler,
  ZoomIn,
  Magnet,
  Lock,
  Eye,
  Trash2,
  Camera,
  ChevronDown,
  BarChart2,
  Maximize2,
  Check,
  Calendar,
} from 'lucide-react';
import { formatCompactUsd, formatTokenPrice } from '../lib/marketData';

interface ProTradingChartProps {
  symbol: string;
  name: string;
  basePrice: number;
  marketCapUsd: number;
  change24h: number;
  isPerp?: boolean;
  userTradesCount?: number;
  showLimitLine?: boolean;
  limitTargetPct?: number;
  onLimitTargetPctChange?: (newPct: number) => void;
}

interface CandlePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  marker?: 'DB' | 'DS' | 'B' | 'S';
}

export const ProTradingChart: React.FC<ProTradingChartProps> = ({
  symbol,
  basePrice,
  marketCapUsd,
  isPerp = false,
  userTradesCount = 0,
  showLimitLine = false,
  limitTargetPct = -25,
  onLimitTargetPctChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [timeframe, setTimeframe] = useState<'1s' | '1m' | '5m' | '15m' | '1h' | '4h' | 'D'>('1s');
  const [chartMetric, setChartMetric] = useState<'price' | 'mcap'>(isPerp ? 'price' : 'mcap');
  const [quoteUnit, setQuoteUnit] = useState<'USD' | 'ETH'>('USD');
  const [hideBubbles, setHideBubbles] = useState(false);
  const [activeTool, setActiveTool] = useState<string>('crosshair');
  const [markersOpen, setMarkersOpen] = useState(false);
  const [markers, setMarkers] = useState({
    myTrades: true,
    devTrades: true,
    trackedTrades: true,
    kolTrades: true,
  });
  const [logScale, setLogScale] = useState(false);
  const [autoScale, setAutoScale] = useState(true);
  const [pctScale, setPctScale] = useState(false);
  const [activeRange, setActiveRange] = useState('1d');
  const [utcTime, setUtcTime] = useState('');
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [drawnLines, setDrawnLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);
  const [draftLine, setDraftLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [draggingLimitLine, setDraggingLimitLine] = useState(false);

  const candlesRef = useRef<CandlePoint[]>([]);

  // Live UTC clock matching bottom chart bar
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, '0');
      const mm = String(now.getUTCMinutes()).padStart(2, '0');
      const ss = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hh}:${mm}:${ss} (UTC)`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate realistic 72 candles whenever symbol, timeframe, or metric changes
  useEffect(() => {
    const count = 72;
    const ethDiv = quoteUnit === 'ETH' && !isPerp ? 1 / 2615.4 : 1;
    const mult =
      chartMetric === 'mcap' && !isPerp
        ? (marketCapUsd * ethDiv) / Math.max(basePrice, 0.0000001)
        : ethDiv;
    const targetEnd = basePrice * mult;
    const generated: CandlePoint[] = [];

    let cursor = targetEnd * 0.86;
    const now = Math.floor(Date.now() / 1000);
    const stepSec = timeframe === '1s' ? 1 : timeframe === '1m' ? 60 : timeframe === '5m' ? 300 : 900;

    for (let i = count; i >= 1; i--) {
      const volatility = targetEnd * 0.022;
      const delta = (Math.sin(i * 0.45) * 0.45 + (Math.random() - 0.46)) * volatility;
      const open = cursor;
      const close = i === 1 ? targetEnd : Math.max(targetEnd * 0.1, open + delta);
      const high = Math.max(open, close) + Math.random() * volatility * 0.85;
      const low = Math.min(open, close) - Math.random() * volatility * 0.75;
      const volume = Math.abs(close - open) * (1200 + Math.random() * 4500);

      let marker: CandlePoint['marker'] = undefined;
      if (i === 52) marker = 'DB';
      else if (i === 34) marker = 'DS';
      else if (i === 19) marker = 'B';
      else if (i === 8 && userTradesCount > 0) marker = 'B';

      generated.push({
        time: now - i * stepSec,
        open,
        high,
        low,
        close,
        volume,
        marker,
      });
      cursor = close;
    }

    candlesRef.current = generated;
  }, [symbol, timeframe, chartMetric, quoteUnit, isPerp, basePrice, marketCapUsd, userTradesCount]);

  // Real-time sub-second tick on latest candle
  useEffect(() => {
    const interval = setInterval(() => {
      const list = candlesRef.current;
      if (!list.length) return;
      const last = { ...list[list.length - 1] };
      const jitter = last.close * (Math.random() - 0.488) * 0.0035;
      last.close = Math.max(last.close * 0.5, last.close + jitter);
      last.high = Math.max(last.high, last.close);
      last.low = Math.min(last.low, last.close);
      last.volume += Math.abs(jitter) * 900;
      candlesRef.current = [...list.slice(0, -1), last];
    }, 900);
    return () => clearInterval(interval);
  }, []);

  // Render Canvas loop
  useEffect(() => {
    let animId: number;
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }
      ctx.save();
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const rightAxisWidth = 82;
      const bottomAxisHeight = 24;
      const plotW = Math.max(100, width - rightAxisWidth);
      const plotH = Math.max(80, height - bottomAxisHeight);

      // Clear background (#06070B deep obsidian)
      ctx.fillStyle = '#06070B';
      ctx.fillRect(0, 0, width, height);

      const candles = candlesRef.current;
      if (!candles.length) {
        ctx.restore();
        return;
      }

      let minP = Infinity;
      let maxP = -Infinity;
      let maxVol = 0;
      for (const c of candles) {
        if (c.low < minP) minP = c.low;
        if (c.high > maxP) maxP = c.high;
        if (c.volume > maxVol) maxVol = c.volume;
      }

      const latest = candles[candles.length - 1];
      if (showLimitLine) {
        const targetVal = latest.close * (1 + limitTargetPct / 100);
        if (targetVal < minP) minP = targetVal;
        if (targetVal > maxP) maxP = targetVal;
      }

      const pad = (maxP - minP) * 0.14 || 1;
      minP -= pad;
      maxP += pad;

      const priceToY = (p: number) => {
        const ratio = (p - minP) / Math.max(maxP - minP, 0.0000001);
        return plotH - ratio * (plotH - 28) - 14;
      };

      const yToPrice = (y: number) => {
        const ratio = (plotH - 14 - y) / Math.max(plotH - 28, 1);
        return minP + ratio * (maxP - minP);
      };

      // Grid lines
      ctx.strokeStyle = '#11131C';
      ctx.lineWidth = 1;
      const hRows = 6;
      for (let i = 1; i < hRows; i++) {
        const y = Math.round((plotH / hRows) * i) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(plotW, y);
        ctx.stroke();

        // Price label on right axis
        const pVal = yToPrice(y);
        ctx.fillStyle = '#6B7280';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        const label =
          chartMetric === 'mcap' && !isPerp
            ? formatCompactUsd(pVal)
            : pVal >= 100
              ? pVal.toFixed(1)
              : pVal >= 1
                ? pVal.toFixed(4)
                : pVal.toFixed(6);
        ctx.fillText(label, plotW + 8, y + 3);
      }

      const vCols = 7;
      for (let i = 1; i < vCols; i++) {
        const x = Math.round((plotW / vCols) * i) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, plotH);
        ctx.stroke();

        const cIdx = Math.min(candles.length - 1, Math.floor((i / vCols) * candles.length));
        const d = new Date(candles[cIdx].time * 1000);
        const tStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(
          d.getSeconds()
        ).padStart(2, '0')}`;
        ctx.fillStyle = '#6B7280';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tStr, x, plotH + 16);
      }

      // Right & Bottom axis borders
      ctx.strokeStyle = '#181B26';
      ctx.beginPath();
      ctx.moveTo(plotW + 0.5, 0);
      ctx.lineTo(plotW + 0.5, height);
      ctx.moveTo(0, plotH + 0.5);
      ctx.lineTo(width, plotH + 0.5);
      ctx.stroke();

      // Candlesticks + Volume Histogram
      const step = plotW / candles.length;
      const candleW = Math.max(3, Math.min(11, step * 0.68));

      candles.forEach((c, idx) => {
        const cx = idx * step + step * 0.5;
        const isBull = c.close >= c.open;
        const color = isBull ? '#2CE59B' : '#FF4D6A';

        // Volume bar at bottom 22% of plot
        const volH = (c.volume / Math.max(maxVol, 1)) * (plotH * 0.2);
        ctx.fillStyle = isBull ? 'rgba(44, 229, 155, 0.16)' : 'rgba(255, 77, 106, 0.16)';
        ctx.fillRect(cx - candleW / 2, plotH - volH, candleW, volH);

        // Wick
        const highY = priceToY(c.high);
        const lowY = priceToY(c.low);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, highY);
        ctx.lineTo(cx, lowY);
        ctx.stroke();

        // Body
        const openY = priceToY(c.open);
        const closeY = priceToY(c.close);
        const topY = Math.min(openY, closeY);
        const bodyH = Math.max(2, Math.abs(closeY - openY));
        ctx.fillStyle = color;
        ctx.fillRect(cx - candleW / 2, topY, candleW, bodyH);

        // Trade Markers (DB / DS / B / S bubbles on chart like full_terminal.webp)
        if (c.marker && !hideBubbles) {
          const showDev = (c.marker === 'DB' || c.marker === 'DS') && markers.devTrades;
          const showMy = (c.marker === 'B' || c.marker === 'S') && (markers.myTrades || markers.trackedTrades);
          if (showDev || showMy) {
            const bubbleY = c.marker === 'DB' || c.marker === 'B' ? lowY + 12 : highY - 12;
            ctx.beginPath();
            ctx.arc(cx, bubbleY, 9, 0, Math.PI * 2);
            ctx.fillStyle =
              c.marker === 'DB'
                ? '#2CE59B'
                : c.marker === 'DS'
                  ? '#F59E0B'
                  : c.marker === 'B'
                    ? '#526FFF'
                    : '#FF4D6A';
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#06070B';
            ctx.stroke();

            ctx.fillStyle = c.marker === 'B' ? '#FFFFFF' : '#06070B';
            ctx.font = 'bold 8px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(c.marker, cx, bubbleY + 3);
          }
        }
      });

      // Current price dashed line & axis tag
      const latestY = priceToY(latest.close);
      const isLastBull = latest.close >= latest.open;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isLastBull ? '#2CE59B' : '#FF4D6A';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, latestY);
      ctx.lineTo(plotW, latestY);
      ctx.stroke();
      ctx.restore();

      // Axis price pill
      ctx.fillStyle = isLastBull ? '#2CE59B' : '#FF4D6A';
      ctx.fillRect(plotW + 1, latestY - 10, rightAxisWidth - 2, 20);
      ctx.fillStyle = '#06070B';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      const latestLabel =
        chartMetric === 'mcap' && !isPerp
          ? formatCompactUsd(latest.close)
          : latest.close >= 100
            ? latest.close.toFixed(1)
            : latest.close >= 1
              ? latest.close.toFixed(4)
              : latest.close.toFixed(6);
      ctx.fillText(latestLabel, plotW + 6, latestY + 3.5);

      // Interactive Limit Order Target Line (`limit_orders.png` 1:1)
      if (showLimitLine) {
        const targetVal = latest.close * (1 + limitTargetPct / 100);
        const targetY = Math.max(18, Math.min(plotH - 18, priceToY(targetVal)));

        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#526FFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, targetY);
        ctx.lineTo(plotW, targetY);
        ctx.stroke();
        ctx.restore();

        // Right axis blue pill for Limit Target
        ctx.fillStyle = '#526FFF';
        ctx.fillRect(plotW + 1, targetY - 10, rightAxisWidth - 2, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        const targetAxisText =
          chartMetric === 'mcap' && !isPerp ? formatCompactUsd(targetVal) : targetVal.toFixed(5);
        ctx.fillText(targetAxisText, plotW + 6, targetY + 3.5);

        // Center-right draggable pill on the line (`Buy Target Line -31.83% | $194.28K | ↕`)
        const pillW = 248;
        const pillH = 22;
        const pillX = Math.max(20, plotW - pillW - 24);
        const pillY = targetY - pillH / 2;

        ctx.fillStyle = '#12172B';
        ctx.strokeStyle = '#526FFF';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        const sign = limitTargetPct >= 0 ? '+' : '';
        ctx.fillText(
          `${limitTargetPct <= 0 ? 'Buy' : 'TP'} Target Line ${sign}${limitTargetPct.toFixed(2)}%   ${targetAxisText}   ↕`,
          pillX + 8,
          targetY + 3.5
        );
      }

      // User drawn trendlines
      const allLines = draftLine ? [...drawnLines, draftLine] : drawnLines;
      for (const ln of allLines) {
        ctx.strokeStyle = '#526FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ln.x1, ln.y1);
        ctx.lineTo(ln.x2, ln.y2);
        ctx.stroke();
      }

      // Crosshair
      if (mousePos && mousePos.x < plotW && mousePos.y < plotH) {
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.beginPath();
        ctx.moveTo(mousePos.x, 0);
        ctx.lineTo(mousePos.x, plotH);
        ctx.moveTo(0, mousePos.y);
        ctx.lineTo(plotW, mousePos.y);
        ctx.stroke();
        ctx.restore();

        const hoverPrice = yToPrice(mousePos.y);
        ctx.fillStyle = '#1E2233';
        ctx.fillRect(plotW + 1, mousePos.y - 9, rightAxisWidth - 2, 18);
        ctx.fillStyle = '#F3F4F6';
        ctx.font = '10px "JetBrains Mono", monospace';
        const hLabel =
          chartMetric === 'mcap' && !isPerp
            ? formatCompactUsd(hoverPrice)
            : hoverPrice >= 100
              ? hoverPrice.toFixed(1)
              : hoverPrice.toFixed(5);
        ctx.fillText(hLabel, plotW + 6, mousePos.y + 3);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [chartMetric, quoteUnit, isPerp, markers, hideBubbles, mousePos, drawnLines, draftLine, showLimitLine, limitTargetPct]);

  const latestCandle = candlesRef.current[candlesRef.current.length - 1];
  const isBull = latestCandle ? latestCandle.close >= latestCandle.open : true;

  const drawingTools = [
    { id: 'crosshair', icon: Crosshair, title: 'Crosshair' },
    { id: 'trendline', icon: TrendingUp, title: 'Trend Line (Click & Drag on Chart)' },
    { id: 'fib', icon: Sliders, title: 'Fib Retracement' },
    { id: 'brush', icon: Brush, title: 'Brush' },
    { id: 'text', icon: Type, title: 'Annotation Text' },
    { id: 'emoji', icon: Smile, title: 'Sticker / Marker' },
    { id: 'ruler', icon: Ruler, title: 'Price Range Measure' },
    { id: 'zoom', icon: ZoomIn, title: 'Zoom In' },
    { id: 'magnet', icon: Magnet, title: 'Weak Magnet' },
    { id: 'lock', icon: Lock, title: 'Lock All Drawing Tools' },
    { id: 'hide', icon: Eye, title: 'Hide All Marks' },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#06070B] select-none">
      {/* Top Chart Toolbar (1:1 with full_terminal.webp) */}
      <div className="h-8 px-2.5 border-b border-[#161823] flex items-center justify-between text-[11px] text-[#8A91A6] bg-[#090B11]">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(['1s', '1m', '5m', '15m', '1h', '4h', 'D'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-1.5 py-0.5 rounded font-semibold transition ${
                timeframe === tf
                  ? 'text-[#526FFF] bg-[#526FFF]/15'
                  : 'text-[#8A91A6] hover:text-white hover:bg-[#141722]'
              }`}
            >
              {tf}
            </button>
          ))}

          <div className="h-3.5 w-[1px] bg-[#161823] mx-1" />

          <button className="p-1 rounded hover:bg-[#141722] text-[#D4D6DF]" title="Candles">
            <BarChart2 className="w-3.5 h-3.5" />
          </button>

          <button className="px-2 py-0.5 rounded hover:bg-[#141722] text-[#D4D6DF] flex items-center gap-1">
            <span className="italic font-serif text-xs text-[#8A91A6]">fx</span>
            <span>Indicators</span>
          </button>

          {!isPerp && (
            <div className="relative">
              <button
                onClick={() => setMarkersOpen(!markersOpen)}
                className="px-2 py-0.5 rounded hover:bg-[#141722] text-[#D4D6DF] flex items-center gap-1"
              >
                <span>Display Options</span>
                <ChevronDown className="w-3 h-3 text-[#8A91A6]" />
              </button>

              {markersOpen && (
                <div className="absolute left-0 top-7 z-40 w-44 bg-[#0D0F17] border border-[#1E2233] rounded-lg shadow-2xl p-1.5 space-y-1">
                  {[
                    { key: 'myTrades', label: 'My Trades (B/S)' },
                    { key: 'devTrades', label: 'Dev Trades (DB/DS)' },
                    { key: 'trackedTrades', label: 'Tracked Wallets' },
                    { key: 'kolTrades', label: 'KOL Bubbles' },
                  ].map((item) => {
                    const checked = markers[item.key as keyof typeof markers];
                    return (
                      <button
                        key={item.key}
                        onClick={() =>
                          setMarkers((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key as keyof typeof markers],
                          }))
                        }
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#161926] text-left text-xs text-white"
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                            checked
                              ? 'bg-[#526FFF] border-[#526FFF] text-white'
                              : 'border-[#454854] bg-transparent'
                          }`}
                        >
                          {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setHideBubbles(!hideBubbles)}
            className={`px-2 py-0.5 rounded transition ${
              hideBubbles ? 'text-[#526FFF] bg-[#526FFF]/15 font-semibold' : 'text-[#8A91A6] hover:text-white'
            }`}
          >
            {hideBubbles ? 'Show All Bubbles' : 'Hide All Bubbles'}
          </button>

          {!isPerp && (
            <>
              <div className="h-3.5 w-[1px] bg-[#161823] mx-1" />
              <button
                onClick={() => setQuoteUnit(quoteUnit === 'USD' ? 'ETH' : 'USD')}
                className="px-1.5 py-0.5 rounded hover:bg-[#141722] text-xs font-medium"
              >
                <span className={quoteUnit === 'USD' ? 'text-[#526FFF] font-semibold' : 'text-[#8A91A6]'}>USD</span>
                <span className="text-[#454854]">/</span>
                <span className={quoteUnit === 'ETH' ? 'text-[#526FFF] font-semibold' : 'text-[#8A91A6]'}>ETH</span>
              </button>

              <div className="h-3.5 w-[1px] bg-[#161823] mx-1" />
              <button
                onClick={() => setChartMetric(chartMetric === 'mcap' ? 'price' : 'mcap')}
                className="px-1.5 py-0.5 rounded hover:bg-[#141722] text-xs font-medium"
              >
                <span className={chartMetric === 'mcap' ? 'text-[#526FFF] font-semibold' : 'text-[#8A91A6]'}>
                  MarketCap
                </span>
                <span className="text-[#454854]">/</span>
                <span className={chartMetric === 'price' ? 'text-[#526FFF] font-semibold' : 'text-[#8A91A6]'}>
                  Price
                </span>
              </button>
            </>
          )}
        </div>

        {/* Right Side of Chart Top Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              const link = document.createElement('a');
              link.download = `${symbol}-oneshot-chart.png`;
              link.href = canvas.toDataURL();
              link.click();
            }}
            className="p-1 rounded hover:bg-[#141722] text-[#8A91A6] hover:text-white"
            title="Save Chart Snapshot"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-[#141722] text-[#8A91A6] hover:text-white" title="Fullscreen">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chart Body: Left Vertical Drawing Sidebar + Right Canvas */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Vertical Drawing Toolbar */}
        <div className="w-9 border-r border-[#161823] bg-[#090B11] flex flex-col items-center py-1.5 gap-1 z-10">
          {drawingTools.map((tool) => {
            const Icon = tool.icon;
            const active = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.title}
                className={`w-6 h-6 rounded flex items-center justify-center transition ${
                  active
                    ? 'bg-[#526FFF]/20 text-[#526FFF]'
                    : 'text-[#8A91A6] hover:text-white hover:bg-[#141722]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
          <div className="w-5 h-[1px] bg-[#161823] my-0.5" />
          <button
            onClick={() => setDrawnLines([])}
            title="Clear Drawings"
            className="w-6 h-6 rounded flex items-center justify-center text-[#8A91A6] hover:text-[#FF4D6A] hover:bg-[#141722]"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 relative min-h-0">
          {/* Top-Left OHLCV Overlay Legend */}
          <div className="absolute top-2 left-3 z-10 pointer-events-none flex flex-col gap-0.5 text-[11px]">
            <div className="flex items-center gap-2 font-mono-tabular">
              <span className="font-semibold text-[#D4D6DF]">
                {symbol}/{quoteUnit} on Robinhood V2 • {timeframe} • oneshot.trade
              </span>
              <span className="w-2 h-2 rounded-full bg-[#2CE59B] inline-block" />
              <span className={isBull ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'}>
                O<span className="ml-0.5">{formatCompactUsd(latestCandle?.open || basePrice)}</span>{' '}
                H<span className="ml-0.5">{formatCompactUsd(latestCandle?.high || basePrice)}</span>{' '}
                L<span className="ml-0.5">{formatCompactUsd(latestCandle?.low || basePrice)}</span>{' '}
                C<span className="ml-0.5">{formatCompactUsd(latestCandle?.close || basePrice)}</span>
              </span>
            </div>
            <div className="text-[10px] text-[#8A91A6] font-mono-tabular">
              Volume <span className="text-[#2CE59B]">{formatCompactUsd(latestCandle?.volume || 24500)}</span> • 0.00% Fee Router
            </div>
          </div>

          <canvas
            ref={canvasRef}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setMousePos({ x, y });
              if (draggingLimitLine && onLimitTargetPctChange) {
                const plotH = Math.max(80, rect.height - 24);
                const centerRatio = (plotH * 0.5 - y) / (plotH * 0.4);
                const clampedPct = Math.max(-85, Math.min(200, Number((centerRatio * 45).toFixed(2))));
                onLimitTargetPctChange(clampedPct);
              } else if (draftLine) {
                setDraftLine({ ...draftLine, x2: x, y2: y });
              }
            }}
            onMouseLeave={() => {
              setMousePos(null);
              setDraggingLimitLine(false);
            }}
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              if (showLimitLine) {
                setDraggingLimitLine(true);
                return;
              }
              if (activeTool === 'trendline') {
                setDraftLine({ x1: x, y1: y, x2: x, y2: y });
              }
            }}
            onMouseUp={() => {
              setDraggingLimitLine(false);
              if (draftLine) {
                setDrawnLines((prev) => [...prev, draftLine]);
                setDraftLine(null);
              }
            }}
            className={`w-full h-full block ${showLimitLine ? 'cursor-ns-resize' : 'cursor-crosshair'}`}
          />
        </div>
      </div>

      {/* Bottom Chart Range & Clock Bar */}
      <div className="h-7 px-3 border-t border-[#161823] bg-[#090B11] flex items-center justify-between text-[11px] text-[#8A91A6]">
        <div className="flex items-center gap-1.5">
          {['3m', '1m', '5d', '1d'].map((r) => (
            <button
              key={r}
              onClick={() => setActiveRange(r)}
              className={`px-1.5 py-0.5 rounded transition ${
                activeRange === r ? 'text-white bg-[#171A26] font-medium' : 'hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
          <div className="h-3 w-[1px] bg-[#161823] mx-1" />
          <button className="p-0.5 hover:text-white" title="Go to Date">
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 font-mono-tabular">
          <span className="text-[#8A91A6]">{utcTime}</span>
          <div className="h-3 w-[1px] bg-[#161823]" />
          <button
            onClick={() => setPctScale(!pctScale)}
            className={pctScale ? 'text-[#526FFF] font-semibold' : 'hover:text-white'}
          >
            %
          </button>
          <button
            onClick={() => setLogScale(!logScale)}
            className={logScale ? 'text-[#526FFF] font-semibold' : 'hover:text-white'}
          >
            log
          </button>
          <button
            onClick={() => setAutoScale(!autoScale)}
            className={autoScale ? 'text-[#526FFF] font-semibold' : 'hover:text-white'}
          >
            auto
          </button>
        </div>
      </div>
    </div>
  );
};
