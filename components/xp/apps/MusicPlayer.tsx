'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

type Track = { id: number; title: string; artist: string; duration: string; src: string };

const TRACKS: Track[] = [
  { id: 1, title: 'Cyber Dawn', artist: 'Tron Orchestra', duration: '3:24', src: '' },
  { id: 2, title: 'Luna Loop', artist: 'XP Sessions', duration: '4:12', src: '' },
  { id: 3, title: 'Bliss Field', artist: 'Cybertronics OST', duration: '2:58', src: '' },
  { id: 4, title: 'Boot Sequence', artist: 'System 32', duration: '1:44', src: '' },
  { id: 5, title: 'Registry Walk', artist: 'Shell Sessions', duration: '5:01', src: '' },
  { id: 6, title: 'Firewall Lullaby', artist: 'Tron Orchestra', duration: '3:37', src: '' },
];

const PLAYER_BG = 'linear-gradient(to bottom, #2a2a3e 0%, #1a1a2a 100%)';
const HEADER_BG = 'linear-gradient(to bottom, #4a86d8 0%, #2060c0 100%)';

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement>(null);

  const track = TRACKS[trackIdx];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing, trackIdx]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const selectTrack = (i: number) => {
    setTrackIdx(i);
    setProgress(0);
    setPlaying(true);
  };

  const prev = () => selectTrack((trackIdx - 1 + TRACKS.length) % TRACKS.length);
  const next = () => selectTrack((trackIdx + 1) % TRACKS.length);

  return (
    <div className="flex flex-col h-full" style={{ background: '#1a1a2a' }}>
      {/* Title bar area */}
      <div
        className="px-3 py-1.5 shrink-0 text-white text-[11px] font-bold"
        style={{ background: HEADER_BG, borderBottom: '1px solid #1448a8' }}
      >
        🎵 Music Player
      </div>

      {/* Now playing */}
      <div className="flex flex-col items-center px-4 py-4 shrink-0" style={{ background: PLAYER_BG }}>
        <div
          className="w-16 h-16 rounded flex items-center justify-center text-4xl mb-3"
          style={{ background: '#2a2a4a', border: '1px solid #3a3a5a' }}
        >
          🎵
        </div>
        <div className="text-white font-bold text-[13px] text-center">{track.title}</div>
        <div className="text-white/60 text-[11px] text-center">{track.artist}</div>

        {/* Progress bar */}
        <div className="w-full mt-3 px-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setProgress(v);
              if (audioRef.current) audioRef.current.currentTime = v;
            }}
            className="w-full accent-[#00d4ff]"
            style={{ height: 4 }}
          />
          <div className="flex justify-between text-[10px] text-white/50 mt-0.5">
            <span>{fmtTime(progress)}</span>
            <span>{duration ? fmtTime(duration) : track.duration}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-2">
          <button onClick={prev} className="text-white/70 hover:text-white">
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPlaying((v) => !v)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#00d4ff', color: '#000' }}
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button onClick={next} className="text-white/70 hover:text-white">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1.5 mt-2 w-full px-2">
          <Volume2 className="w-3.5 h-3.5 text-white/50 shrink-0" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 accent-[#00d4ff]"
            style={{ height: 3 }}
          />
        </div>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-auto" style={{ background: '#141420' }}>
        {TRACKS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => selectTrack(i)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left group"
            style={{
              background: i === trackIdx ? '#2a3a5a' : 'transparent',
              borderBottom: '1px solid #2a2a3a',
            }}
          >
            <span
              className="text-[10px] w-4 text-right shrink-0"
              style={{ color: i === trackIdx ? '#00d4ff' : '#555' }}
            >
              {i === trackIdx && playing ? '▶' : (i + 1)}
            </span>
            <div className="flex-1 min-w-0">
              <div
                className="text-[11px] font-medium truncate"
                style={{ color: i === trackIdx ? '#fff' : '#aaa' }}
              >
                {t.title}
              </div>
              <div className="text-[10px] truncate" style={{ color: '#555' }}>{t.artist}</div>
            </div>
            <span className="text-[10px] text-[#555] shrink-0">{t.duration}</span>
          </button>
        ))}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={track.src || undefined}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={next}
      />
    </div>
  );
}
