import { YieldView } from '../components/HubViews';
import { useTerminal } from '../app/TerminalContext';

export function YieldPage() {
  const { stakedEth, setStakedEth, stakedUsdc, setStakedUsdc, triggerToast, activeEthBalanceNum } =
    useTerminal();
  return (
    <>
      <YieldView
        ethBalance={activeEthBalanceNum}
        stakedEth={stakedEth}
        stakedUsdc={stakedUsdc}
        onStakeEth={(amt) => {
          setStakedEth((s) => s + amt);
          triggerToast(
            'ETH Yield Vault Staked',
            `Staked ${amt} ETH @ 14.8% APY • 0% Fee`,
            'success',
          );
        }}
        onUnstakeEth={(amt) => {
          setStakedEth((s) => Math.max(0, s - amt));
          triggerToast('ETH Unstaked Instantly', `Withdrew ${amt} ETH • 0% Fee`, 'info');
        }}
        onStakeUsdc={(amt) => {
          setStakedUsdc((s) => s + amt);
          triggerToast(
            'USDC Margin Vault Supplied',
            `Supplied ${amt} USDC @ 15.05% APY`,
            'success',
          );
        }}
      />
    </>
  );
}
