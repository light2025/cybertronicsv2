'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_MS = 2400;

export default function BootScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), BOOT_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center select-none"
          onClick={() => setVisible(false)}
        >
          {/* Logo / brand */}
          <div className="flex flex-col items-center gap-1 mb-10">
            <div className="text-[44px] font-bold tracking-tight bg-gradient-to-b from-white via-blue-200 to-blue-500 bg-clip-text text-transparent">
              CYBERTRONICS
            </div>
            <div className="text-[11px] text-blue-200/70 tracking-[0.3em] uppercase">
              Operating System · XP Edition
            </div>
          </div>

          {/* XP-style scrolling boot bar */}
          <div
            className="relative h-[14px] w-[180px] overflow-hidden border border-[#2255aa]"
            style={{
              background: '#000',
              boxShadow: 'inset 0 0 4px rgba(80, 140, 255, 0.4)',
              borderRadius: 2,
            }}
          >
            <motion.div
              initial={{ x: -60 }}
              animate={{ x: 200 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-y-0 flex gap-[2px]"
            >
              <div className="w-[14px] h-full" style={{ background: 'linear-gradient(to bottom, #6caaf8, #2868c8, #1a4fa8)' }} />
              <div className="w-[14px] h-full" style={{ background: 'linear-gradient(to bottom, #6caaf8, #2868c8, #1a4fa8)' }} />
              <div className="w-[14px] h-full" style={{ background: 'linear-gradient(to bottom, #6caaf8, #2868c8, #1a4fa8)' }} />
            </motion.div>
          </div>

          <div className="mt-8 text-[10px] text-blue-300/50">
            Click anywhere to skip
          </div>

          {/* Footer copyright strip */}
          <div className="absolute bottom-6 text-[10px] text-blue-200/40 tracking-wider">
            Copyright © Cybertronics — Loading workspace...
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
