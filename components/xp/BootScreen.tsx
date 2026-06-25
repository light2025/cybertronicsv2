'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useXpStore } from '@/lib/store/xpStore';
import { apps } from './appRegistry';
import { playSound } from '@/lib/utils/soundManager';
import type { AppId } from '@/types/xp';

type BootPhase = 'boot-video' | 'loading-video' | 'done';

export default function BootScreen() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<BootPhase>('boot-video');
  const bootVideoRef = useRef<HTMLVideoElement>(null);
  const loadingVideoRef = useRef<HTMLVideoElement>(null);

  const skipBoot = () => {
    setVisible(false);
    openWindows();
  };

  const openWindows = () => {
    const xp = useXpStore.getState();
    const alreadyOpen = (id: AppId) => xp.windows.some((w) => w.appId === id);

    playSound('startup');

    setTimeout(() => {
      if (!alreadyOpen('about')) {
        const def = apps.about;
        xp.open('about', {
          title: def.title,
          w: def.defaultSize.w,
          h: def.defaultSize.h,
          x: 620,
          y: 40,
        });
      }
      if (!alreadyOpen('ie')) {
        const def = apps.ie;
        xp.open('ie', {
          title: def.title,
          w: def.defaultSize.w,
          h: def.defaultSize.h,
          x: 40,
          y: 30,
        });
      }
      playSound('error');
    }, 2000);
  };

  useEffect(() => {
    if (phase === 'boot-video' && bootVideoRef.current) {
      bootVideoRef.current.play().catch(() => {
        setPhase('loading-video');
      });
    }
    if (phase === 'loading-video' && loadingVideoRef.current) {
      loadingVideoRef.current.play().catch(() => {
        setVisible(false);
        openWindows();
      });
    }
  }, [phase]);

  const handleBootVideoEnd = () => {
    setPhase('loading-video');
  };

  const handleLoadingVideoEnd = () => {
    setPhase('done');
    setVisible(false);
    openWindows();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-[100] bg-black flex items-center justify-center select-none cursor-pointer"
          onClick={skipBoot}
        >
          {phase === 'boot-video' && (
            <video
              ref={bootVideoRef}
              src="/xp/videos/boot.webm"
              className="w-full h-full object-contain"
              muted
              playsInline
              onEnded={handleBootVideoEnd}
              onError={() => setPhase('loading-video')}
            />
          )}

          {phase === 'loading-video' && (
            <div className="flex flex-col items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-1">
                <div className="text-[44px] font-bold tracking-tight bg-gradient-to-b from-white via-blue-200 to-blue-500 bg-clip-text text-transparent">
                  CYBERTRONICS
                </div>
                <div className="text-[11px] text-blue-200/70 tracking-[0.3em] uppercase">
                  Operating System · XP Edition
                </div>
              </div>

              <video
                ref={loadingVideoRef}
                src="/xp/videos/loading.webm"
                className="w-[200px] h-auto"
                muted
                playsInline
                onEnded={handleLoadingVideoEnd}
                onError={() => { setVisible(false); openWindows(); }}
              />

              <div className="text-[10px] text-blue-300/50">
                Click anywhere to skip
              </div>

              <div className="absolute bottom-6 text-[10px] text-blue-200/40 tracking-wider">
                Copyright © Cybertronics — Loading workspace...
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
