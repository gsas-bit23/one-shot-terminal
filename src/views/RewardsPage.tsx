import { RewardsView } from '../components/HubViews';
import { useTerminal } from '../app/TerminalContext';

export function RewardsPage() {
  const { tradeHistory, triggerToast } = useTerminal();
  return (
    <>
      <RewardsView
        totalTradesCount={tradeHistory.length}
        onClaimRewards={() =>
          triggerToast(
            'Cashback Rebate Claimed',
            '0.062 ETH credited directly to your wallet with 0% fee',
            'success',
          )
        }
      />
    </>
  );
}
