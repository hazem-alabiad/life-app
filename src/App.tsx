import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DesktopSidebar } from './components/DesktopSidebar';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { MoveScreen } from './screens/MoveScreen';
import { FocusScreen } from './screens/FocusScreen';
import { NourishScreen } from './screens/NourishScreen';
import { WorkoutSessionModal } from './components/WorkoutSessionModal';
import { MicroRecoveryModal } from './components/MicroRecoveryModal';
import { SnapMealModal } from './components/SnapMealModal';
import { ManualMealModal } from './components/ManualMealModal';
import { BuildWorkoutModal } from './components/BuildWorkoutModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { FocusSettingsModal } from './components/FocusSettingsModal';
import { GitHubAuthModal } from './components/GitHubAuthModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { SupabaseConnectModal } from './components/SupabaseConnectModal';

const MainContent: React.FC = () => {
  const { activeTab, showSupabaseModal, setShowSupabaseModal } = useApp();

  return (
    <div className="min-h-screen w-full bg-[#080a0f] text-[#f3f4f6] flex flex-row overflow-x-hidden antialiased selection:bg-[#34d399]/20 selection:text-white">
      {/* Desktop Left Sidebar Navigation */}
      <DesktopSidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#090b10]">
        {/* Sticky Desktop & Mobile Top Header */}
        <TopHeader />

        {/* Full-width Screen Content Body */}
        <main className="flex-1 px-4 sm:px-8 py-6 overflow-y-auto no-scrollbar scroll-smooth">
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'move' && <MoveScreen />}
          {activeTab === 'focus' && <FocusScreen />}
          {activeTab === 'nourish' && <NourishScreen />}
        </main>

        {/* Mobile-Only Bottom Navigation */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>

      {/* Interactive Application Modals */}
      <WorkoutSessionModal />
      <MicroRecoveryModal />
      <SnapMealModal />
      <ManualMealModal />
      <BuildWorkoutModal />
      <ProfileModal />
      <SettingsModal />
      <FocusSettingsModal />
      <GitHubAuthModal />
      <CommandPaletteModal />
      <SupabaseConnectModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
