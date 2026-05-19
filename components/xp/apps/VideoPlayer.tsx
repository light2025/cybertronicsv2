/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

type VideoItem = { id: number; title: string; desc: string; src: string; thumb: string };

const VIDEOS: VideoItem[] = [
  {
    id: 1,
    title: 'Cybertronics Drop 001',
    desc: 'First drop reveal — limited release.',
    src: '',
    thumb: 'https://picsum.photos/seed/vid-001/320/180',
  },
  {
    id: 2,
    title: 'Lifestyle Collection',
    desc: 'Behind the scenes lookbook shoot.',
    src: '',
    thumb: 'https://picsum.photos/seed/vid-002/320/180',
  },
  {
    id: 3,
    title: 'Cyber XP Essentials',
    desc: 'Daily basics for the cyber commute.',
    src: '',
    thumb: 'https://picsum.photos/seed/vid-003/320/180',
  },
];

const HEADER_BG = 'linear-gradient(to bottom, #4a86d8 0%, #2060c0 100%)';

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoPlayer() {
  const [videoIdx, setVideoIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const video = VIDEOS[videoIdx];

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play().catch(() => setPlaying(false)); setPlaying(true); }
  };

  const selectVideo = (i: number) => {
    setVideoIdx(i);
    setPlaying(false);
    setProgress(0);
    setDuration(0);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#111' }}>
      <div
        className="px-3 py-1.5 shrink-0 text-white text-[11px] font-bold"
        style={{ background: HEADER_BG, borderBottom: '1px solid #1448a8' }}
      >
        🎬 Video Player
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main player */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video */}
          <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
            <video
              ref={videoRef}
              src={video.src || undefined}
              muted={muted}
              className="max-w-full max-h-full object-contain"
              onTimeUpdate={() => setProgress(videoRef.current?.currentTime ?? 0)}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
              onEnded={() => setPlaying(false)}
              style={{ display: video.src ? 'block' : 'none' }}
            />
            {!video.src && (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={video.thumb}
                  alt={video.title}
                  className="max-w-[80%] max-h-[60%] object-contain rounded opacity-70"
                />
                <div className="text-white/50 text-[11px]">No video file — demo only</div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div
            className="shrink-0 px-3 py-2 flex flex-col gap-1.5"
            style={{ background: '#1a1a1a', borderTop: '1px solid #333' }}
          >
            {/* Progress */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setProgress(v);
                if (videoRef.current) videoRef.current.currentTime = v;
              }}
              className="w-full accent-[#00d4ff]"
              style={{ height: 4 }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={togglePlay} className="text-white hover:text-[#00d4ff]">
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <span className="text-[10px] text-white/50">
                  {fmtTime(progress)} / {fmtTime(duration)}
                </span>
              </div>
              <button onClick={() => setMuted((m) => !m)} className="text-white/50 hover:text-white">
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-white/80 text-[11px] font-medium">{video.title}</div>
          </div>
        </div>

        {/* Playlist */}
        <div
          className="w-36 shrink-0 overflow-y-auto flex flex-col"
          style={{ background: '#0d0d15', borderLeft: '1px solid #2a2a3a' }}
        >
          <div className="text-[10px] text-white/40 px-2 py-1.5 font-bold uppercase tracking-wide">
            Playlist
          </div>
          {VIDEOS.map((v, i) => (
            <button
              key={v.id}
              onClick={() => selectVideo(i)}
              className="flex flex-col text-left px-2 py-2 group"
              style={{
                background: i === videoIdx ? '#1a2a4a' : 'transparent',
                borderBottom: '1px solid #1a1a2a',
              }}
            >
              <img
                src={v.thumb}
                alt={v.title}
                className="w-full rounded mb-1"
                style={{ aspectRatio: '16/9', objectFit: 'cover', opacity: i === videoIdx ? 1 : 0.6 }}
              />
              <div
                className="text-[10px] font-medium leading-tight"
                style={{ color: i === videoIdx ? '#00d4ff' : '#888' }}
              >
                {v.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
