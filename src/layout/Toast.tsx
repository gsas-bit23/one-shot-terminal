import { ExternalLink } from 'lucide-react';
import { ROBINHOOD_TESTNET_CONFIG } from '../lib/robinhoodChain';
import { useTerminal } from '../app/TerminalContext';

export function Toast() {
  const { toast } = useTerminal();
  return (
    <>
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
    </>
  );
}
