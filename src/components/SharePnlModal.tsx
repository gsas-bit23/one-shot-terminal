import React, { useRef } from 'react';
import { Download, X, Award, Zap } from 'lucide-react';
import { OneShotLogo } from './OneShotLogo';

interface SharePnlModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  name: string;
  pnlPct: number;
  pnlUsd: number;
  investedUsd: number;
  currentValueUsd: number;
  entryPrice: string;
  markPrice: string;
}

export const SharePnlModal: React.FC<SharePnlModalProps> = ({
  isOpen,
  onClose,
  symbol,
  name,
  pnlPct,
  pnlUsd,
  investedUsd,
  currentValueUsd,
  entryPrice,
  markPrice,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const isPos = pnlPct >= 0;

  const handleDownloadCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 900, 500);
    grad.addColorStop(0, '#06070B');
    grad.addColorStop(0.6, '#0E1324');
    grad.addColorStop(1, '#121D38');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 500);

    // Border
    ctx.strokeStyle = '#526FFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, 868, 468);

    // Brand Header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('ONE SHOT Pro • Robinhood Chain', 48, 72);

    ctx.fillStyle = '#2CE59B';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillText('0.00% PLATFORM FEE', 48, 102);

    // Token Pair
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px Inter, sans-serif';
    ctx.fillText(`$${symbol}`, 48, 178);

    // Big PnL %
    ctx.fillStyle = isPos ? '#2CE59B' : '#FF4D6A';
    ctx.font = 'bold 78px "JetBrains Mono", monospace';
    ctx.fillText(`${isPos ? '+' : ''}${pnlPct.toFixed(2)}%`, 48, 275);

    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.fillText(
      `${isPos ? '+' : ''}$${pnlUsd.toFixed(2)} USD`,
      48,
      325
    );

    // Stats Footer
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '20px "JetBrains Mono", monospace';
    ctx.fillText(`Entry: ${entryPrice}   |   Mark: ${markPrice}   |   oneshot.trade`, 48, 430);

    const link = document.createElement('a');
    link.download = `oneshot-pnl-${symbol.toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md rounded-2xl bg-[#0B0D14] border border-[#22273B] shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#181B27] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#2CE59B]" />
            <span className="font-bold text-xs text-white">Share Verified One Shot PnL Card</span>
          </div>
          <button onClick={onClose} className="text-[#8A91A6] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Card Preview */}
        <div className="p-5">
          <div className="rounded-xl p-5 bg-gradient-to-br from-[#080A12] via-[#10162B] to-[#172142] border border-[#526FFF]/50 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <OneShotLogo className="w-6 h-6" />
                <span className="font-extrabold text-sm text-white tracking-tight">ONE SHOT Pro</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#2CE59B]/15 border border-[#2CE59B]/40 text-[#2CE59B] text-[10px] font-bold">
                0.00% FEE TERMINAL
              </span>
            </div>

            <div>
              <div className="text-xs text-[#8A91A6]">{name}</div>
              <div className="text-2xl font-extrabold text-white">${symbol} / ETH</div>
            </div>

            <div className="py-1">
              <div
                className={`text-4xl font-extrabold font-mono-tabular ${
                  isPos ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                }`}
              >
                {isPos ? '+' : ''}
                {pnlPct.toFixed(2)}%
              </div>
              <div
                className={`text-sm font-bold font-mono-tabular mt-0.5 ${
                  isPos ? 'text-[#2CE59B]' : 'text-[#FF4D6A]'
                }`}
              >
                {isPos ? '+' : ''}${pnlUsd.toFixed(2)} USD
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs font-mono-tabular">
              <div>
                <div className="text-[10px] text-[#8A91A6]">Invested / Current</div>
                <div className="text-white font-bold">
                  ${investedUsd.toFixed(0)} → ${currentValueUsd.toFixed(0)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8A91A6]">Entry / Mark</div>
                <div className="text-white font-bold">
                  {entryPrice} / {markPrice}
                </div>
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#141826] text-xs font-semibold text-[#9CA3AF] hover:text-white"
            >
              Close
            </button>
            <button
              onClick={handleDownloadCard}
              className="px-4 py-2 rounded-lg bg-[#526FFF] hover:bg-[#425FEF] text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
