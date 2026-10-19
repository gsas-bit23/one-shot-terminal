import React from 'react';
import { ShieldCheck, Lock, Zap, ExternalLink, X, CheckCircle2, KeyRound, EyeOff } from 'lucide-react';
import { ROBINHOOD_TESTNET_CONFIG, TERMINAL_ROUTER_ADDRESS } from '../lib/robinhoodChain';

interface SecurityArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityArchitectureModal: React.FC<SecurityArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0B0D14] border border-[#1E2233] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#181B27] bg-[#080A10] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2CE59B]/15 border border-[#2CE59B]/40 flex items-center justify-center text-[#2CE59B]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                One Shot Institutional Security & 0.00% Fee Router Architecture
              </h2>
              <p className="text-[11px] text-[#8A91A6]">
                Engineered for Robinhood Chain Testnet (Chain ID 46630) • Zero-Knowledge Non-Custodial Design
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#121521] text-[#8A91A6] hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
          {/* 4 Security Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0E111B] border border-[#1B2032] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#2CE59B]">
                <EyeOff className="w-4 h-4" />
                <span>Zero-Employee Access (Anti-Insider Architecture)</span>
              </div>
              <p className="text-[#9CA3AF] leading-relaxed">
                Unlike legacy terminals where internal support dashboards linked user IDs to tracked wallets, One Shot stores all wallet labels, presets, and copy-trade watchlists locally with AES-GCM client encryption. Zero server-side wallet telemetry exists.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E111B] border border-[#1B2032] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#526FFF]">
                <Zap className="w-4 h-4" />
                <span>Immutable 0.00% Protocol Fee Contract</span>
              </div>
              <p className="text-[#9CA3AF] leading-relaxed">
                Competitors charge 0.75%–1.00% per swap. One Shot’s verified router contract on Robinhood Chain enforces <code className="text-[#2CE59B]">PROTOCOL_FEE_BPS = 0</code> as a compile-time constant with no admin fee setter.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E111B] border border-[#1B2032] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#F59E0B]">
                <Lock className="w-4 h-4" />
                <span>3-Mode MEV Protection (Off / Reduced / Secure)</span>
              </div>
              <p className="text-[#9CA3AF] leading-relaxed">
                Routes transactions directly to the Robinhood Arbitrum Orbit sequencer with strict <code className="text-white">minAmountOut</code> and block-deadline enforcement, eliminating public mempool sandwich attacks.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E111B] border border-[#1B2032] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white">
                <KeyRound className="w-4 h-4 text-[#2CE59B]" />
                <span>100% Non-Custodial Signer Isolation</span>
              </div>
              <p className="text-[#9CA3AF] leading-relaxed">
                Private keys never leave your browser wallet or local WebCrypto enclave. Every market, limit, and migration-sniper transaction is verified on-chain.
              </p>
            </div>
          </div>

          {/* Live Smart Contract Verification Box */}
          <div className="p-4 rounded-xl bg-[#080A10] border border-[#1E2233] space-y-2 font-mono-tabular">
            <div className="flex items-center justify-between">
              <span className="text-[#8A91A6] font-sans font-semibold">
                Verified Robinhood Chain Testnet Router V2
              </span>
              <span className="px-2 py-0.5 rounded bg-[#2CE59B]/15 text-[#2CE59B] text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> LIVE ON CHAIN 46630
              </span>
            </div>
            <div className="text-white font-bold break-all">{TERMINAL_ROUTER_ADDRESS}</div>
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-[#8A91A6]">RPC: {ROBINHOOD_TESTNET_CONFIG.rpcUrls[0]}</span>
              <a
                href={`${ROBINHOOD_TESTNET_CONFIG.explorerUrl}/address/${TERMINAL_ROUTER_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#526FFF] hover:underline inline-flex items-center gap-1"
              >
                Inspect Contract on Blockscout <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#181B27] bg-[#080A10] flex items-center justify-between">
          <span className="text-[11px] text-[#2CE59B] font-semibold">
            ✓ Audited Solidity 0.8.28 • ReentrancyGuard • 0 bps Fee Constant
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#526FFF] text-white font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
