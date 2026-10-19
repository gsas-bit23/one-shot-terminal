import { Search } from 'lucide-react';
import { TokenAvatar } from '../components/TokenAvatar';
import { SecurityArchitectureModal } from '../components/SecurityArchitectureModal';
import { SharePnlModal } from '../components/SharePnlModal';
import { formatCompactUsd } from '../lib/marketData';
import { useTerminal } from '../app/TerminalContext';

export function CommandPalette() {
  const {
    searchQuery,
    setSearchQuery,
    searchModalOpen,
    setSearchModalOpen,
    quickBuyAmountEth,
    securityModalOpen,
    setSecurityModalOpen,
    sharePnlData,
    setSharePnlData,
    handleExecuteSpotSwap,
    openTokenInTerminal,
    filteredTokens,
  } = useTerminal();
  return (
    <>
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
        <SharePnlModal isOpen={true} onClose={() => setSharePnlData(null)} {...sharePnlData} />
      )}

      {/* Toast Notification Banner */}
    </>
  );
}
