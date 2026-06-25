'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LCD_BG = '#7BA226';
const LCD_DARK = '#324C0D';
const LOADING_DURATION = 6000;

export default function BootSequence() {
  const [visible, setVisible] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      setShowVideo(true);
    }, 300);

    const endTimer = setTimeout(() => {
      setVisible(false);
    }, LOADING_DURATION);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(endTimer);
    };
  }, []);

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [showVideo]);

  const skip = () => setVisible(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 z-[200] flex flex-col items-center justify-center select-none cursor-pointer"
          style={{
            background: LCD_BG,
            fontFamily: 'var(--font-pixel)',
            color: LCD_DARK,
          }}
          onClick={skip}
        >
          {!showVideo && (
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-[30px] font-bold">SYSTEM STANDBY</h2>
              <button
                className="px-8 py-3 text-[22px] font-bold uppercase"
                style={{
                  background: 'transparent',
                  border: `3px solid ${LCD_DARK}`,
                }}
              >
                BOOT SYSTEM
              </button>
            </div>
          )}

          {showVideo && (
            <video
              ref={videoRef}
              src="/mobile/videos/loading.webm"
              className="w-[62vw] max-w-[520px] h-auto object-contain"
              muted
              playsInline
              loop
            />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-[20%] text-[12px] opacity-60"
          >
            TAP TO SKIP
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
