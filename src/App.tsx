import { TerminalContext } from './app/TerminalContext';
import { useTerminalController } from './app/useTerminalController';
import { TopNav } from './layout/TopNav';
import { SubHeader } from './layout/SubHeader';
import { BottomBar } from './layout/BottomBar';
import { PulseFiltersModal } from './layout/PulseFiltersModal';
import { CommandPalette } from './layout/CommandPalette';
import { FloatingOverlays } from './layout/FloatingOverlays';
import { Toast } from './layout/Toast';
import { PulsePage } from './views/PulsePage';
import { DiscoverPage } from './views/DiscoverPage';
import { TokenTerminalPage } from './views/TokenTerminalPage';
import { PerpsPage } from './views/PerpsPage';
import { TrackersPage } from './views/TrackersPage';
import { YieldPage } from './views/YieldPage';
import { VisionPage } from './views/VisionPage';
import { PortfolioPage } from './views/PortfolioPage';
import { RewardsPage } from './views/RewardsPage';

/** Terminal shell: state lives in useTerminalController; each page/view is its own file. */
export function App() {
  const terminal = useTerminalController();
  return (
    <TerminalContext.Provider value={terminal}>
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#06070B] text-[#F3F4F6] select-none font-sans">
        <TopNav />
        <SubHeader />
        <main className="flex-1 min-h-0 flex overflow-hidden relative">
          {terminal.activeTab === 'pulse' && <PulsePage />}
          {terminal.activeTab === 'discover' && <DiscoverPage />}
          {terminal.activeTab === 'terminal' && <TokenTerminalPage />}
          {terminal.activeTab === 'perps' && <PerpsPage />}
          {terminal.activeTab === 'trackers' && <TrackersPage />}
          {terminal.activeTab === 'yield' && <YieldPage />}
          {terminal.activeTab === 'vision' && <VisionPage />}
          {terminal.activeTab === 'portfolio' && <PortfolioPage />}
          {terminal.activeTab === 'rewards' && <RewardsPage />}
          <FloatingOverlays />
        </main>
        <BottomBar />
        <PulseFiltersModal />
        <CommandPalette />
        <Toast />
      </div>
    </TerminalContext.Provider>
  );
}

export default App;
