import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Lock,
  Rocket,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { ExecutionPreset } from '../lib/marketData';
import { TERMINAL_ROUTER_ADDRESS } from '../lib/robinhoodChain';

interface SecurityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Record<1 | 2 | 3, ExecutionPreset>;
  activePreset: 1 | 2 | 3;
  onUpdatePreset: (id: 1 | 2 | 3, updated: ExecutionPreset) => void;
  sessionKeyActive: boolean;
  onToggleSessionKey: (val: boolean) => void;
  mevShieldGlobal: boolean;
  onToggleMevShield: (val: boolean) => void;
  onEmergencyRevoke: () => void;
}

export const SecurityCenterModal: React.FC<SecurityCenterModalProps> = ({
  isOpen,
  onClose,
  presets,
  activePreset,
  onUpdatePreset,
  sessionKeyActive,
  onToggleSessionKey,
  mevShieldGlobal,
  onToggleMevShield,
  onEmergencyRevoke,
}) => {
  const [editingPreset, setEditingPreset] = useState<1 | 2 | 3>(activePreset);

  if (!isOpen) return null;
  const current = presets[editingPreset];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0E1116] border border-[#1C222B] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C222B] bg-[#090B0E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00C805]/15 border border-[#00C805]/30 flex items-center justify-center text-[#00C805]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Robinhood Chain Security Vault & Execution Presets
                <span className="text-[11px] font-mono-tabular px-2 py-0.5 rounded-full bg-[#00C805]/15 text-[#00C805] border border-[#00C805]/30">
                  0.00% FEES VERIFIED
                </span>
              </h2>
              <p className="text-xs text-[#8A939E]">
                Self-custody guardrails, MEV protection, and instant execution presets (Chain ID 46630)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A939E] hover:text-white hover:bg-[#141920]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* On-Chain Router Verification Card */}
          <div className="p-4 rounded-xl bg-[#090B0E] border border-[#00C805]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00C805]">
                <Lock className="w-3.5 h-3.5" />
                IMMUTABLE ZERO-FEE ROUTER CONTRACT (ROBINHOOD TESTNET)
              </div>
              <div className="text-xs font-mono-tabular text-[#F3F5F7] break-all">
                {TERMINAL_ROUTER_ADDRESS}
              </div>
              <div className="text-[11px] text-[#8A939E]">
                Hardcoded <code className="text-[#00C805]">PROTOCOL_FEE_BPS = 0</code> •{' '}
                <code className="text-[#00C805]">nonReentrant</code> Mutex • No Admin Fee Switch
              </div>
            </div>
            <a
              href={`https://explorer.testnet.chain.robinhood.com/address/${TERMINAL_ROUTER_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141920] hover:bg-[#1C222B] text-xs font-semibold text-[#00C805] border border-[#1C222B] shrink-0"
            >
              Verify on Explorer <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Core Security Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#12161D] border border-[#1C222B] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#00C805]" />
                  MEV & Sandwich Shield
                </div>
                <p className="text-[11px] text-[#8A939E] mt-1">
                  Routes orders via Robinhood Chain private sequencer with strict block deadline & slippage guards.
                </p>
              </div>
              <button
                onClick={() => onToggleMevShield(!mevShieldGlobal)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  mevShieldGlobal
                    ? 'bg-[#00C805] text-[#050805]'
                    : 'bg-[#1C222B] text-[#8A939E]'
                }`}
              >
                {mevShieldGlobal ? 'ACTIVE' : 'OFF'}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#12161D] border border-[#1C222B] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#B4F65E]" />
                  1-Click Session Key Relayer
                </div>
                <p className="text-[11px] text-[#8A939E] mt-1">
                  Execute sub-second 0%-fee trades without repetitive wallet popups, bounded by your max spend cap.
                </p>
              </div>
              <button
                onClick={() => onToggleSessionKey(!sessionKeyActive)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  sessionKeyActive
                    ? 'bg-[#00C805] text-[#050805]'
                    : 'bg-[#1C222B] text-[#8A939E]'
                }`}
              >
                {sessionKeyActive ? 'ENABLED' : 'MANUAL'}
              </button>
            </div>
          </div>

          {/* Preset 1 / Preset 2 / Preset 3 Editor (Exact trade.phantom.com feature) */}
          <div className="rounded-xl bg-[#12161D] border border-[#1C222B] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#00C805]" />
                Customize Trading Presets (Preset 1 • Preset 2 • Preset 3)
              </div>
              <div className="flex items-center gap-1 bg-[#090B0E] p-1 rounded-lg border border-[#1C222B]">
                {([1, 2, 3] as const).map((id) => (
                  <button
                    key={id}
                    onClick={() => setEditingPreset(id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                      editingPreset === id
                        ? 'bg-[#00C805] text-[#050805]'
                        : 'text-[#8A939E] hover:text-white'
                    }`}
                  >
                    Preset {id}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#8A939E] mb-1">
                  Quick-Buy Size (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={current.quickBuyEth}
                  onChange={(e) =>
                    onUpdatePreset(editingPreset, {
                      ...current,
                      quickBuyEth: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#090B0E] border border-[#1C222B] text-sm font-mono-tabular text-white focus:outline-none focus:border-[#00C805]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#8A939E] mb-1">
                  Max Slippage Guard (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={current.slippagePct}
                  onChange={(e) =>
                    onUpdatePreset(editingPreset, {
                      ...current,
                      slippagePct: Number(e.target.value) || 0.5,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#090B0E] border border-[#1C222B] text-sm font-mono-tabular text-white focus:outline-none focus:border-[#00C805]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#8A939E] mb-1">
                  Per-Tx Security Cap (ETH)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={current.maxSpendCapEth}
                  onChange={(e) =>
                    onUpdatePreset(editingPreset, {
                      ...current,
                      maxSpendCapEth: Number(e.target.value) || 1.0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#090B0E] border border-[#1C222B] text-sm font-mono-tabular text-white focus:outline-none focus:border-[#00C805]"
                />
              </div>
            </div>
          </div>

          {/* Emergency Security Kill-Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#EA3943]/10 border border-[#EA3943]/30">
            <div>
              <div className="text-xs font-bold text-[#EA3943] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Emergency Session & Allowance Kill-Switch
              </div>
              <p className="text-[11px] text-[#8A939E] mt-0.5">
                Immediately revokes active session delegates and resets nonces.
              </p>
            </div>
            <button
              onClick={onEmergencyRevoke}
              className="px-3 py-1.5 rounded-lg bg-[#EA3943] hover:bg-[#ff4d57] text-white text-xs font-bold transition shrink-0"
            >
              Revoke Session Now
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#1C222B] bg-[#090B0E] text-xs">
          <span className="text-[#8A939E] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00C805]" />
            All trades pre-simulated for 0% honeypot & 0% protocol fee
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#00C805] hover:bg-[#00E606] text-[#050805] font-bold transition"
          >
            Save & Return
          </button>
        </div>
      </div>
    </div>
  );
};

interface LaunchTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchSuccess: (token: {
    address: string;
    name: string;
    symbol: string;
    txHash: string;
    initialBuyEth: string;
  }) => void;
}

export const LaunchTokenModal: React.FC<LaunchTokenModalProps> = ({
  isOpen,
  onClose,
  onLaunchSuccess,
}) => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [initialBuyEth, setInitialBuyEth] = useState('0.05');
  const [isDeploying, setIsDeploying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !symbol.trim()) return;
    setIsDeploying(true);
    setErrorMsg(null);

    try {
      const resp = await fetch('/api/relayer-launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          symbol: symbol.trim().toUpperCase(),
          metadataUri: description.trim() || `robinhood://${symbol.trim().toLowerCase()}`,
          initialBuyEth,
        }),
      });
      const data = await resp.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to launch on Robinhood Chain');
      }
      onLaunchSuccess({
        address: data.tokenAddress,
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        txHash: data.txHash,
        initialBuyEth,
      });
      setName('');
      setSymbol('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error launching token');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0E1116] border border-[#1C222B] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C222B] bg-[#090B0E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00C805]/15 border border-[#00C805]/30 flex items-center justify-center text-[#00C805]">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Launch 0%-Fee Token on Robinhood Chain
              </h2>
              <p className="text-xs text-[#8A939E]">
                Immutable ERC-20 • 0% Launch Fee • 99/100 Security Verified
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A939E] hover:text-white hover:bg-[#141920]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLaunch} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8A939E] mb-1">
              Token Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sherwood Alpha AI"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#090B0E] border border-[#1C222B] text-sm text-white focus:outline-none focus:border-[#00C805]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8A939E] mb-1">
                Ticker Symbol
              </label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="e.g. ALPHA"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-lg bg-[#090B0E] border border-[#1C222B] text-sm font-mono-tabular text-white focus:outline-none focus:border-[#00C805]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8A939E] mb-1">
                Initial Dev Buy (ETH)
              </label>
              <input
                type="number"
                step="0.01"
                value={initialBuyEth}
                onChange={(e) => setInitialBuyEth(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#090B0E] border border-[#1C222B] text-sm font-mono-tabular text-white focus:outline-none focus:border-[#00C805]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A939E] mb-1">
              Thesis / Metadata Description
            </label>
            <textarea
              rows={2}
              placeholder="Zero-fee community asset on Robinhood Chain Testnet..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#090B0E] border border-[#1C222B] text-sm text-white focus:outline-none focus:border-[#00C805]"
            />
          </div>

          {/* Security Attestations Box */}
          <div className="p-3 rounded-xl bg-[#00C805]/8 border border-[#00C805]/25 space-y-1.5 text-xs">
            <div className="font-bold text-[#00C805] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Automatic Security Hardening Included:
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-[#F3F5F7]">
              <span>✓ 0.00% Launch & Swap Fee</span>
              <span>✓ Mint Authority Renounced</span>
              <span>✓ 0% Buy / 0% Sell Tax</span>
              <span>✓ Reentrancy Guarded LP</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-[#EA3943]/15 border border-[#EA3943]/40 text-xs text-[#EA3943]">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isDeploying}
            className="w-full py-2.5 rounded-xl bg-[#00C805] hover:bg-[#00E606] disabled:opacity-50 text-[#050805] font-extrabold text-sm flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            {isDeploying
              ? 'Deploying to Robinhood Chain (46630)...'
              : 'Deploy Token on Robinhood Chain (0% Fee)'}
          </button>
        </form>
      </div>
    </div>
  );
};
