import Taskbar from '@/components/xp/Taskbar';
import WindowManager from '@/components/xp/WindowManager';
import StartMenu from '@/components/xp/StartMenu';
import WallpaperLayer from '@/components/xp/WallpaperLayer';
import BootScreen from '@/components/xp/BootScreen';
import SearchOverlay from '@/components/xp/SearchOverlay';
import NokiaShell from '@/components/nokia/NokiaShell';

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

      {/* Nokia phone shell — under md */}
      <div className="md:hidden">
        <NokiaShell />
      </div>
    </main>
  );
}
