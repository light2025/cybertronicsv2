// 'use client' required — passes <DesktopIcon> (a function ref) to client children. See COMMON_MISTAKES.md §2.
'use client';

import DesktopIcon from '@/components/xp/DesktopIcon';

export default function XPDesktop() {
  return (
    <div className="absolute inset-0 p-4 grid grid-flow-col grid-rows-[repeat(auto-fill,minmax(5rem,auto))] gap-2 content-start justify-start">
      <DesktopIcon appId="my-computer" />
      <DesktopIcon appId="lifestyle" />
      <DesktopIcon appId="gallery" />
      <DesktopIcon appId="notepad" />
      <DesktopIcon appId="terminal" />
      <DesktopIcon appId="settings" />
      <DesktopIcon appId="about" />
      <DesktopIcon appId="contact" />
    </div>
  );
}
