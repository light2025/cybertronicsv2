'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_MS = 4500;
const WORD = 'CYBERTRONICS';
const TAGLINE = 'RETRO. RELOADED.';
const ACCENT = '#00d4ff';

export default function BootSequence() {
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
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-0 z-[100] flex items-center justify-center select-none"
          style={{ background: '#000' }}
          onClick={() => setVisible(false)}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 0.55, 0], scale: [0.4, 1.4, 1.9] }}
              transition={{ duration: 1.0, times: [0, 0.45, 1], ease: 'easeOut' }}
              style={{
                width: 280,
                height: 280,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(0,212,255,0.55) 0%, rgba(0,212,255,0) 70%)',
                filter: 'blur(2px)',
              }}
            />
          </div>

          <motion.div
            animate={{ opacity: [1, 1, 0] }}
            transition={{
              duration: 4.5,
              times: [0, 4.0 / 4.5, 4.4 / 4.5],
              ease: 'easeInOut',
            }}
            className="relative flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 0.75, 0.4], scale: [0.6, 1.3, 1.5] }}
              transition={{
                delay: 1.8,
                duration: 0.9,
                times: [0, 0.55, 1],
                ease: 'easeOut',
              }}
              className="absolute pointer-events-none"
              style={{
                width: 360,
                height: 70,
                top: 2,
                borderRadius: '50%',
                background:
                  'radial-gradient(ellipse, rgba(0,212,255,0.5) 0%, rgba(0,212,255,0) 70%)',
                filter: 'blur(10px)',
                zIndex: 0,
              }}
            />

            <div
              className="relative z-10 flex font-bold text-white"
              style={{
                fontSize: 22,
                letterSpacing: '0.35em',
                paddingLeft: '0.35em',
                fontFamily: 'Tahoma, sans-serif',
              }}
            >
              {WORD.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.0 + i * 0.045,
                    duration: 0.32,
                    ease: 'easeOut',
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 mt-5"
              style={{
                height: 2,
                background: `linear-gradient(to right, transparent, ${ACCENT} 50%, transparent)`,
                boxShadow: '0 0 12px rgba(0,212,255,0.55)',
                borderRadius: 1,
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 0.6, ease: 'easeOut' }}
              className="relative z-10 mt-5 text-white/55 text-[10px]"
              style={{ letterSpacing: '0.4em', fontFamily: 'Tahoma, sans-serif' }}
            >
              {TAGLINE}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.55 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 4.0, duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none font-bold text-white"
            style={{
              fontSize: 56,
              fontFamily: 'Tahoma, sans-serif',
              filter: 'drop-shadow(0 0 14px rgba(0,212,255,0.7))',
            }}
          >
            C
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.5 }}
            className="absolute bottom-4 text-white/25 text-[9px] tracking-[0.25em]"
          >
            TAP TO SKIP
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
