import Taskbar from '@/components/xp/Taskbar';
import WindowManager from '@/components/xp/WindowManager';
import StartMenu from '@/components/xp/StartMenu';
import WallpaperLayer from '@/components/xp/WallpaperLayer';
import BootScreen from '@/components/xp/BootScreen';
import SearchOverlay from '@/components/xp/SearchOverlay';
import MotoShell from '@/components/motorola/MotoShell';

export default function XPLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative h-screen w-screen bg-xp-desktop overflow-hidden font-xp">
      {/* XP desktop shell — md and up */}
      <div className="hidden md:contents">
        <WallpaperLayer />
        {children}
        <WindowManager />
        <StartMenu />
        <Taskbar />
        <SearchOverlay />
        <BootScreen />
      </div>

      {/* Motorola A1000 shell — under md */}
      <div className="md:hidden">
        <MotoShell />
      </div>
    </main>
  );
}
