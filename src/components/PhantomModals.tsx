import React, { useState } from 'react';
import {
  X,
  Search,
  Shield,
  Zap,
  ArrowLeft,
  Copy,
  Check,
  CreditCard,
  ArrowDownLeft,
  Sliders,
  Fuel,
  Coins,
  ExternalLink,
} from 'lucide-react';
import {
  ExecutionPreset,
  LAUNCHPAD_PLATFORMS,
  PerpMarket,
  TokenMarket,
  formatCompactUsd,
  formatTokenPrice,
} from '../lib/marketData';
import { RobinhoodFeatherLogo } from './RobinhoodLogo';
import { TokenAvatar } from './TokenAvatar';

/* ============================================================================
   1. GET STARTED (LOGIN) MODAL — frame_001.jpg
============================================================================ */
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectWallet: () => void;
  onRelayerLogin: (providerName: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onConnectWallet,
  onRelayerLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-[360px] rounded-2xl bg-[#14141B] border border-[#252532] shadow-2xl p-6 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-[#848895] hover:text-white hover:bg-[#20202B] transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mx-auto w-11 h-11 rounded-xl bg-[#00C805]/15 border border-[#00C805]/30 flex items-center justify-center mb-3">
          <RobinhoodFeatherLogo className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-semibold text-white mb-1">Get Started</h2>
        <p className="text-[11px] text-[#848895] mb-5">
          Connect to Robinhood Chain Testnet (Chain ID: 46630)
        </p>

        {/* Primary Robinhood Wallet / Browser Extension Button */}
        <button
          onClick={() => {
            onConnectWallet();
            onClose();
          }}
          className="w-full h-11 rounded-xl bg-[#00C805] hover:bg-[#00E606] text-[#080A0C] font-semibold text-sm flex items-center justify-center gap-2.5 transition shadow-lg shadow-[#00C805]/15"
        >
          <RobinhoodFeatherLogo className="w-4 h-4" />
          <span>Continue with Robinhood Wallet</span>
        </button>

        {/* OR Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-[1px] flex-1 bg-[#23232F]" />
          <span className="text-[11px] font-medium text-[#6E727F] uppercase">OR</span>
          <div className="h-[1px] flex-1 bg-[#23232F]" />
        </div>

        {/* Continue with Google (Activates Live Robinhood Testnet On-Chain Relayer Account) */}
        <button
          onClick={() => {
            onRelayerLogin('Google (Robinhood Chain Testnet Signer)');
            onClose();
          }}
          className="w-full h-10 rounded-xl bg-[#1D1D27] hover:bg-[#252532] border border-[#2A2A38] text-white font-medium text-sm flex items-center justify-center gap-2.5 transition mb-2.5"
        >
          <span className="font-bold text-sm text-[#EA4335]">G</span>
          <span>Continue with Google</span>
        </button>

        {/* Continue with Apple */}
        <button
          onClick={() => {
            onRelayerLogin('Apple (Robinhood Chain Testnet Signer)');
            onClose();
          }}
          className="w-full h-10 rounded-xl bg-[#1D1D27] hover:bg-[#252532] border border-[#2A2A38] text-white font-medium text-sm flex items-center justify-center gap-2.5 transition"
        >
          <span className="text-base leading-none"></span>
          <span>Continue with Apple</span>
        </button>

        <button
          onClick={() => {
            onConnectWallet();
            onClose();
          }}
          className="mt-4 text-xs text-[#848895] hover:text-white transition"
        >
          Connect with extension wallet (MetaMask / Phantom / Rabby)
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
   2. SEARCH MODAL — frame_036.jpg
============================================================================ */
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: TokenMarket[];
  perps: PerpMarket[];
  onSelectToken: (token: TokenMarket) => void;
  onSelectPerp: (perp: PerpMarket) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  tokens,
  perps,
  onSelectToken,
  onSelectPerp,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const filteredTokens = tokens.filter(
    (t) =>
      !q ||
      t.symbol.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.address.toLowerCase().includes(q)
  );
  const filteredPerps = perps.filter(
    (p) => !q || p.ticker.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm pt-16 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[680px] rounded-2xl bg-[#121218] border border-[#252532] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Input */}
        <div className="h-13 px-4 border-b border-[#1E1E28] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#848895]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for tokens, perps, and 0x contract addresses on Robinhood Chain"
            className="flex-1 bg-transparent text-sm text-white placeholder-[#6E727F] focus:outline-none py-3.5"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#848895] hover:text-white hover:bg-[#1E1E28]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* History / Results Table */}
        <div className="max-h-[440px] overflow-y-auto p-3">
          <div className="text-xs font-medium text-[#848895] px-2 mb-2">
            {q ? 'Robinhood Chain Testnet Results' : 'History'}
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] text-[#6E727F] border-b border-[#1C1C25]">
                <th className="py-2 px-2 font-medium">Symbol</th>
                <th className="py-2 px-2 font-medium text-right">Price</th>
                <th className="py-2 px-2 font-medium text-right">Market Cap</th>
                <th className="py-2 px-2 font-medium text-right">24h %</th>
                <th className="py-2 px-2 font-medium text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171720] text-xs">
              {/* Perps matches */}
              {filteredPerps.slice(0, 4).map((p) => (
                <tr
                  key={p.symbol}
                  onClick={() => {
                    onSelectPerp(p);
                    onClose();
                  }}
                  className="hover:bg-[#1A1A24] cursor-pointer transition"
                >
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2.5">
                      <TokenAvatar symbol={p.ticker} name={p.name} size="sm" rounded="full" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">{p.ticker}</span>
                          <span className="px-1.5 py-0.2 rounded bg-[#232332] text-[10px] font-mono-tabular text-[#B4F65E]">
                            {p.maxLeverage}x
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6E727F]">{p.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono-tabular text-white">
                    {formatTokenPrice(p.markPrice)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono-tabular text-[#6E727F]">-</td>
                  <td
                    className={`py-2.5 px-2 text-right font-mono-tabular font-medium ${
                      p.change24h >= 0 ? 'text-[#16C784]' : 'text-[#EA3943]'
                    }`}
                  >
                    {p.change24h >= 0 ? `+${p.change24h.toFixed(2)}%` : `${p.change24h.toFixed(2)}%`}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono-tabular text-white">
                    {formatCompactUsd(p.volume24hUsd)}
                  </td>
                </tr>
              ))}

              {/* Spot Token matches */}
              {filteredTokens.map((t) => (
                <tr
                  key={t.address}
                  onClick={() => {
                    onSelectToken(t);
                    onClose();
                  }}
                  className="hover:bg-[#1A1A24] cursor-pointer transition"
                >
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2.5">
                      <TokenAvatar
                        symbol={t.symbol}
                        name={t.name}
                        address={t.address}
                        iconUrl={t.iconUrl}
                        size="sm"
                        rounded="lg"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">{t.symbol}</span>
                          <span className="px-1 py-0.2 rounded bg-[#00C805]/15 text-[#00C805] text-[9px] font-mono-tabular">
                            {t.address.slice(0, 6)}...{t.address.slice(-4)}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6E727F]">{t.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono-tabular text-white">
                    {formatTokenPrice(t.priceUsd)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono-tabular text-white">
                    {formatCompactUsd(t.marketCapUsd)}
                  </td>
                  <td
                    className={`py-2.5 px-2 text-right font-mono-tabular font-medium ${
                      t.change24h >= 0 ? 'text-[#16C784]' : 'text-[#EA3943]'
                    }`}
                  >
                    {t.change24h >= 0 ? `+${t.change24h.toFixed(2)}%` : `${t.change24h.toFixed(2)}%`}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono-tabular text-white">
                    {formatCompactUsd(t.volume24hUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   3. TOKEN TRADE SETTINGS MODAL — frame_106.jpg
============================================================================ */
interface TradeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Record<1 | 2 | 3, ExecutionPreset>;
  activePreset: 1 | 2 | 3;
  onSelectPreset: (id: 1 | 2 | 3) => void;
  onUpdatePreset: (id: 1 | 2 | 3, updated: ExecutionPreset) => void;
}

export const TradeSettingsModal: React.FC<TradeSettingsModalProps> = ({
  isOpen,
  onClose,
  presets,
  activePreset,
  onSelectPreset,
  onUpdatePreset,
}) => {
  const [sideTab, setSideTab] = useState<'buy' | 'sell'>('buy');

  if (!isOpen) return null;

  const current = presets[activePreset];

  const updateField = <K extends keyof ExecutionPreset>(field: K, value: ExecutionPreset[K]) => {
    onUpdatePreset(activePreset, {
      ...current,
      [field]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-[380px] rounded-2xl bg-[#14141C] border border-[#262635] shadow-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Token Trade Settings</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#848895] hover:text-white hover:bg-[#22222F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Row: S1 / S2 / S3 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#848895]">Presets</span>
          <div className="flex items-center bg-[#0E0E14] p-0.5 rounded-lg border border-[#22222F]">
            {([1, 2, 3] as const).map((id) => (
              <button
                key={id}
                onClick={() => onSelectPreset(id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  activePreset === id
                    ? 'bg-[#252534] text-white shadow'
                    : 'text-[#848895] hover:text-white'
                }`}
              >
                S{id}
              </button>
            ))}
          </div>
        </div>

        {/* Buy Settings / Sell Settings Segmented Tabs */}
        <div className="grid grid-cols-2 bg-[#0E0E14] p-0.5 rounded-lg border border-[#22222F] mb-4">
          <button
            onClick={() => setSideTab('buy')}
            className={`py-1.5 rounded-md text-xs font-medium transition ${
              sideTab === 'buy'
                ? 'bg-[#222230] text-[#00C805]'
                : 'text-[#848895] hover:text-white'
            }`}
          >
            Buy Settings
          </button>
          <button
            onClick={() => setSideTab('sell')}
            className={`py-1.5 rounded-md text-xs font-medium transition ${
              sideTab === 'sell'
                ? 'bg-[#222230] text-[#EA3943]'
                : 'text-[#848895] hover:text-white'
            }`}
          >
            Sell Settings
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="text-white font-medium">Auto Slippage & Fees</span>
            <button
              onClick={() => updateField('autoSlippage', !current.autoSlippage)}
              className={`w-9 h-5 rounded-full transition relative ${
                current.autoSlippage ? 'bg-[#00C805]' : 'bg-[#2A2A38]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                  current.autoSlippage ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 text-[#848895]">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Slippage
            </span>
            {current.autoSlippage ? (
              <span className="text-white font-mono-tabular">Auto ({current.slippagePct}%)</span>
            ) : (
              <input
                type="number"
                step="0.1"
                value={current.slippagePct}
                onChange={(e) => updateField('slippagePct', parseFloat(e.target.value) || 0.5)}
                className="w-20 bg-[#0E0E14] border border-[#262635] rounded px-2 py-1 text-right text-white font-mono-tabular"
              />
            )}
          </div>

          <div className="flex items-center justify-between py-1 text-[#848895]">
            <span className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5" /> Priority Fee
            </span>
            <span className="text-white font-mono-tabular">{current.priorityFeeEth}</span>
          </div>

          <div className="flex items-center justify-between py-1 text-[#848895]">
            <span className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" /> Tips
            </span>
            <span className="text-white font-mono-tabular">{current.tipEth}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-t border-[#1F1F2B]">
            <div>
              <div className="text-white font-medium flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00C805]" />
                <span>MEV Protection</span>
              </div>
              <div className="text-[10px] text-[#00C805]">Robinhood Sequencer Sandwich Guard</div>
            </div>
            <button
              onClick={() => updateField('mevShield', !current.mevShield)}
              className={`w-9 h-5 rounded-full transition relative ${
                current.mevShield ? 'bg-[#00C805]' : 'bg-[#2A2A38]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                  current.mevShield ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 border-t border-[#1F1F2B]">
            <div className="text-xs text-[#848895] mb-2">
              {sideTab === 'buy' ? 'Buy Amounts (ETH)' : 'Sell Amounts (%)'}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(sideTab === 'buy' ? current.buyAmountsEth : current.sellAmountsPct).map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={val}
                  onChange={(e) => {
                    const arr = [...(sideTab === 'buy' ? current.buyAmountsEth : current.sellAmountsPct)];
                    arr[idx] = e.target.value;
                    if (sideTab === 'buy') {
                      updateField('buyAmountsEth', arr);
                    } else {
                      updateField('sellAmountsPct', arr);
                    }
                  }}
                  className="h-8 rounded-lg bg-[#0E0E14] border border-[#252534] text-center font-mono-tabular text-xs text-white focus:border-[#00C805] focus:outline-none"
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full h-9 rounded-xl bg-[#00C805] hover:bg-[#00E606] text-[#080A0C] font-semibold text-xs transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
   4. ADD FUNDS & ON-CHAIN FAUCET MODAL — frame_093.jpg & frame_094.jpg
============================================================================ */
interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
  onClaimRealTestnetEth: () => Promise<void>;
}

export const AddFundsModal: React.FC<AddFundsModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
  onClaimRealTestnetEth,
}) => {
  const [step, setStep] = useState<'select' | 'deposit' | 'buy'>('select');
  const [usdAmount, setUsdAmount] = useState('50');
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);

  if (!isOpen) return null;

  const displayAddress = walletAddress || '0xF5dcF5ED313D37bD456B20b78e6697794Fd37cC8';
  const ethEquivalent = (parseFloat(usdAmount || '0') / 3042.85).toFixed(4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-[380px] rounded-2xl bg-[#14141C] border border-[#262635] shadow-2xl p-5">
        {step === 'select' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Add Funds (Robinhood Chain Testnet 46630)
              </h3>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[#848895] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Deposit / On-Chain Testnet Faucet Card */}
              <button
                onClick={() => setStep('deposit')}
                className="w-full p-3.5 rounded-xl bg-[#1B1B26] hover:bg-[#222230] border border-[#282838] text-left flex items-center gap-3.5 transition"
              >
                <div className="w-9 h-9 rounded-lg bg-[#252534] flex items-center justify-center text-[#00C805]">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-white">
                    Deposit / Claim On-Chain Testnet ETH
                  </div>
                  <div className="text-[11px] text-[#848895]">
                    Send tokens or drip real ETH on Robinhood Chain Testnet (46630)
                  </div>
                </div>
              </button>

              {/* Buy Card */}
              <button
                onClick={() => setStep('buy')}
                className="w-full p-3.5 rounded-xl bg-[#1B1B26] hover:bg-[#222230] border border-[#282838] text-left flex items-center gap-3.5 transition"
              >
                <div className="w-9 h-9 rounded-lg bg-[#252534] flex items-center justify-center text-[#00C805]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Buy</span>
                    <div className="flex items-center gap-1 text-[9px] text-[#848895]">
                      <span className="px-1.5 py-0.5 rounded bg-[#262636] text-white">Pay</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#262636] text-white">VISA</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#848895]">
                    Bridge / On-Ramp ETH to Robinhood Chain (0% Fee)
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {step === 'deposit' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep('select')}
                className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#00C805]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Deposit ETH (Robinhood Chain 46630)</span>
              </button>
              <button onClick={onClose} className="text-[#848895] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#0E0E14] border border-[#222230] mb-3">
              <div className="text-[11px] text-[#848895] mb-1">
                Your Robinhood Chain Testnet Address
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono-tabular text-white truncate">
                  {displayAddress}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(displayAddress);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="px-2 py-1 rounded bg-[#1E1E2B] hover:bg-[#282838] text-xs text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-[#00C805]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <a
                href={`https://explorer.testnet.chain.robinhood.com/address/${displayAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-[#00C805] hover:underline mt-2"
              >
                <span>View Address on Robinhood Testnet Explorer</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <button
              disabled={claiming}
              onClick={async () => {
                setClaiming(true);
                try {
                  await onClaimRealTestnetEth();
                  onClose();
                } finally {
                  setClaiming(false);
                }
              }}
              className="w-full h-9 rounded-xl bg-[#00C805] hover:bg-[#00E606] text-[#080A0C] font-semibold text-xs transition"
            >
              {claiming
                ? 'Broadcasting On-Chain Faucet Tx...'
                : 'Drip Real On-Chain Testnet ETH (46630)'}
            </button>
          </>
        )}

        {step === 'buy' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setStep('select')}
                className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#00C805]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Buy ETH</span>
              </button>
              <button onClick={onClose} className="text-[#848895] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-[#848895] text-center mb-4">
              Powered by Robinhood Connect • 0% Fee On-Chain Settlement
            </div>

            <div className="text-center my-5">
              <div className="flex items-center justify-center text-4xl font-bold text-white font-mono-tabular">
                <span>$</span>
                <input
                  type="number"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
                  className="w-32 bg-transparent text-center focus:outline-none"
                />
              </div>
              <div className="text-xs text-[#848895] font-mono-tabular mt-1">
                ≈ {ethEquivalent} ETH
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {['25', '50', '100'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setUsdAmount(amt)}
                  className={`h-8 rounded-lg border text-xs font-mono-tabular transition ${
                    usdAmount === amt
                      ? 'bg-[#00C805]/15 border-[#00C805] text-[#00C805]'
                      : 'bg-[#1A1A24] border-[#262635] text-white hover:bg-[#222230]'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button
              disabled={claiming}
              onClick={async () => {
                setClaiming(true);
                try {
                  await onClaimRealTestnetEth();
                  onClose();
                } finally {
                  setClaiming(false);
                }
              }}
              className="w-full h-10 rounded-xl bg-[#00C805] hover:bg-[#00E606] text-[#080A0C] font-semibold text-xs transition"
            >
              {claiming ? 'Broadcasting to Robinhood Chain...' : 'Buy ETH on Robinhood Testnet (0% Fee)'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   5. LAUNCHES FILTERS MODAL — frame_085.jpg
============================================================================ */
interface LaunchesFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  minMcap: string;
  setMinMcap: (v: string) => void;
}

export const LaunchesFilterModal: React.FC<LaunchesFilterModalProps> = ({
  isOpen,
  onClose,
  minMcap,
  setMinMcap,
}) => {
  const [platforms, setPlatforms] = useState(LAUNCHPAD_PLATFORMS);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minBonding, setMinBonding] = useState('');
  const [maxBonding, setMaxBonding] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-[#14141C] border border-[#262635] shadow-2xl p-5 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#00C805]" />
            <h3 className="text-sm font-semibold text-white">Launches</h3>
          </div>
          <button onClick={onClose} className="text-[#848895] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#848895]">Platforms (Robinhood Chain Testnet)</span>
            <button
              onClick={() =>
                setPlatforms((prev) => prev.map((p) => ({ ...p, checked: !prev[0].checked })))
              }
              className="text-[#00C805] hover:underline text-[11px]"
            >
              Unselect All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {platforms.map((p, idx) => (
              <button
                key={p.id}
                onClick={() =>
                  setPlatforms((prev) =>
                    prev.map((item, i) => (i === idx ? { ...item, checked: !item.checked } : item))
                  )
                }
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[#0E0E14] border border-[#222230] text-left text-xs text-white hover:border-[#343446]"
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                    p.checked
                      ? 'bg-[#00C805] border-[#00C805] text-black'
                      : 'border-[#454854]'
                  }`}
                >
                  {p.checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="text-[#848895] mb-1">Token Age in Minutes</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-[#0E0E14] border border-[#222230] text-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-[#0E0E14] border border-[#222230] text-white"
              />
            </div>
          </div>

          <div>
            <div className="text-[#848895] mb-1">Bonding Curve %</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minBonding}
                onChange={(e) => setMinBonding(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-[#0E0E14] border border-[#222230] text-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxBonding}
                onChange={(e) => setMaxBonding(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-[#0E0E14] border border-[#222230] text-white"
              />
            </div>
          </div>

          <div>
            <div className="text-[#848895] mb-1">Market Cap ($)</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minMcap}
                onChange={(e) => setMinMcap(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-[#0E0E14] border border-[#222230] text-white"
              />
              <input
                type="number"
                placeholder="Max"
                className="h-8 px-2.5 rounded-lg bg-[#0E0E14] border border-[#222230] text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-5">
          <button
            onClick={() => {
              setMinMcap('');
              setMinAge('');
              setMaxAge('');
            }}
            className="h-9 rounded-xl bg-[#1E1E2A] hover:bg-[#272736] text-white font-medium text-xs"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="h-9 rounded-xl bg-[#00C805] hover:bg-[#00E606] text-[#080A0C] font-semibold text-xs"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
