/* eslint-disable @next/next/no-img-element */
'use client';

import type { AppId, WindowPayload } from '@/types/xp';
import { apps } from '@/components/xp/appRegistry';
import { mobileApps } from './apps';

type Props = { appId: AppId; payload?: WindowPayload };

export default function MobileApp({ appId, payload }: Props) {
  const def = apps[appId];
  const MobileImpl = mobileApps[appId];

  if (MobileImpl) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <MobileImpl payload={payload} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
      <img src={def.icon} alt="" className="w-14 h-14 object-contain" />
      <div className="text-[14px] font-bold text-[#0a3060]">{def.title}</div>
      <div className="text-[11px] text-[#4a5878] max-w-[16rem] leading-relaxed">
        This app is being ported to Mobile Mode.
        <br />
        Check back soon.
      </div>
    </div>
  );
}
