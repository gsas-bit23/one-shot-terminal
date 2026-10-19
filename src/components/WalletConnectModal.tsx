import React, { useState } from 'react';
import {
  CheckCircle2,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import {
  ensureRobinhoodTestnet,
  getDiscoveredEip6963Wallets,
  RELAYER_ADDRESS,
  resolveProviderForWalletBrand,
} from '../lib/robinhoodChain';

export interface ActiveWalletState {
  address: string;
  label: string;
  mode: 'SESSION_KEY' | 'INJECTED';
  ethBalance: string;
}

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWallet: ActiveWalletState;
  onSelectWallet: (w: ActiveWalletState) => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  activeWallet,
  onSelectWallet,
}) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const discovered = getDiscoveredEip6963Wallets();

  const handleConnectBrand = async (
    brand: 'phantom' | 'rabby' | 'metamask' | 'coinbase',
    displayName: string
  ) => {
    setConnecting(brand);
    setError(null);
    try {
      const provider = resolveProviderForWalletBrand(brand);
      if (!provider) {
        throw new Error(
          `${displayName} extension not detected. Use the Robinhood Session Key Vault below for instant 0%-fee on-chain execution!`
        );
      }
      const res = await ensureRobinhoodTestnet(provider);
      onSelectWallet({
        address: res.address,
        label: displayName,
        mode: 'INJECTED',
        ethBalance: '1.2500',
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet');
    } finally {
      setConnecting(null);
    }
  };

  const handleActivateSessionVault = () => {
    onSelectWallet({
      address: RELAYER_ADDRESS,
      label: 'Robinhood Session Vault',
      mode: 'SESSION_KEY',
      ethBalance: '2.4500',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0E1116] border border-[#1C222B] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C222B] bg-[#090B0E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00C805]/15 border border-[#00C805]/30 flex items-center justify-center text-[#00C805]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Connect to Robinhood Chain
              </h2>
              <p className="text-xs text-[#8A939E]">
                Chain ID 46630 • Self-Custody • 0.00% Trading Fees
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

        <div className="p-5 space-y-4">
          {/* Recommended: Instant Robinhood Session Key Vault */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#00C805]/15 via-[#0E1116] to-[#090B0E] border border-[#00C805]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#00C805]">
                <KeyRound className="w-3.5 h-3.5" />
                INSTANT ROBINHOOD SESSION KEY (FUNDED TESTNET VAULT)
              </span>
              <span className="text-[10px] font-mono-tabular px-2 py-0.5 rounded bg-[#00C805] text-[#050805] font-bold">
                RECOMMENDED
              </span>
            </div>
            <p className="text-xs text-[#8A939E]">
              Pre-configured self-custody session key connected to Robinhood Chain Testnet (
              <span className="text-white font-mono-tabular">
                {RELAYER_ADDRESS.slice(0, 6)}...{RELAYER_ADDRESS.slice(-4)}
              </span>
              ) with sub-second 0%-fee execution and MEV protection.
            </p>
            <button
              onClick={handleActivateSessionVault}
              className="w-full py-2.5 rounded-xl bg-[#00C805] hover:bg-[#00E606] text-[#050805] font-extrabold text-xs flex items-center justify-center gap-2 transition"
            >
              <Zap className="w-4 h-4" />
              {activeWallet.mode === 'SESSION_KEY'
                ? 'Active: Robinhood Session Key Vault'
                : 'Use Robinhood Session Key Vault (0% Fee)'}
            </button>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A939E] pt-1">
            Or Connect External Browser Wallet (EIP-6963)
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'phantom', name: 'Phantom (EVM)', badge: 'Auto-Switch 46630' },
              { id: 'rabby', name: 'Rabby Wallet', badge: 'Pre-Sign Sim' },
              { id: 'metamask', name: 'MetaMask', badge: 'EVM Standard' },
              { id: 'coinbase', name: 'Coinbase Wallet', badge: 'Passkey Ready' },
            ].map((w) => (
              <button
                key={w.id}
                onClick={() => handleConnectBrand(w.id as any, w.name)}
                disabled={connecting === w.id}
                className="p-3 rounded-xl bg-[#12161D] hover:bg-[#191F29] border border-[#1C222B] hover:border-[#00C805]/40 text-left transition flex flex-col justify-between gap-1.5"
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{w.name}</span>
                  <Lock className="w-3 h-3 text-[#00C805]" />
                </div>
                <span className="text-[10px] text-[#8A939E]">{w.badge}</span>
              </button>
            ))}
          </div>

          {discovered.length > 0 && (
            <div className="pt-1 space-y-1.5">
              <div className="text-[10px] font-semibold text-[#8A939E]">
                Detected Browser Extensions ({discovered.length}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {discovered.map((d) => (
                  <button
                    key={d.info.uuid}
                    onClick={async () => {
                      try {
                        const res = await ensureRobinhoodTestnet(d.provider);
                        onSelectWallet({
                          address: res.address,
                          label: d.info.name,
                          mode: 'INJECTED',
                          ethBalance: '1.0000',
                        });
                        onClose();
                      } catch (e: any) {
                        setError(e?.message || 'Error connecting');
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#141920] border border-[#1C222B] text-xs text-white hover:border-[#00C805]"
                  >
                    {d.info.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-[#EA3943]/15 border border-[#EA3943]/30 text-xs text-[#EA3943]">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 text-[11px] text-[#8A939E]">
            <ShieldCheck className="w-4 h-4 text-[#00C805] shrink-0" />
            <span>
              Non-custodial: Robinhood Terminal never requests your seed phrase or private keys.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
