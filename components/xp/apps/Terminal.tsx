'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useXpStore } from '@/lib/store/xpStore';
import { apps } from '../appRegistry';
import type { AppId } from '@/types/xp';

type Line = { kind: 'in' | 'out' | 'err'; text: string };

const HELP = [
  'Available commands:',
  '  help                  show this menu',
  '  ls                    list available apps',
  '  open <app>            open an app window (e.g. open lifestyle)',
  '  about                 show about info',
  '  whoami                show current user',
  '  date                  current date/time',
  '  echo <text>           print text',
  '  clear                 clear screen',
  '  exit                  close this terminal',
];

export default function Terminal({ winId }: { winId: string }) {
  const open = useXpStore((s) => s.open);
  const closeWin = useXpStore((s) => s.close);

  const [lines, setLines] = useState<Line[]>([
    { kind: 'out', text: 'Cybertronics OS [Version 1.0.0]' },
    { kind: 'out', text: '(c) Cybertronics Corp. Type `help` for commands.' },
    { kind: 'out', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const appendOut = (text: string) =>
    setLines((l) => [...l, { kind: 'out', text }]);
  const appendErr = (text: string) =>
    setLines((l) => [...l, { kind: 'err', text }]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    setLines((l) => [...l, { kind: 'in', text: `C:\\> ${raw}` }]);
    if (!cmd) return;
    setHistory((h) => [...h, cmd]);
    setHIdx(-1);

    const [head, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(' ');

    switch (head) {
      case 'help':
        HELP.forEach(appendOut);
        break;
      case 'ls': {
        const ids = Object.keys(apps).filter((id) => apps[id as AppId].showInStartMenu);
        ids.forEach((id) => appendOut(`  ${id.padEnd(16)} ${apps[id as AppId].title}`));
        break;
      }
      case 'open': {
        const id = arg.trim() as AppId;
        if (!id || !(id in apps)) {
          appendErr(`Unknown app: ${arg}. Try \`ls\`.`);
          break;
        }
        const a = apps[id];
        open(id, { title: a.title, w: a.defaultSize.w, h: a.defaultSize.h });
        appendOut(`Opening ${a.title}...`);
        break;
      }
      case 'about':
        appendOut('Cybertronics — XP-themed t-shirt store.');
        appendOut('Built with Next.js 16, React 19, Tailwind CSS 4.');
        break;
      case 'whoami':
        appendOut('cybertronics\\guest');
        break;
      case 'date':
        appendOut(new Date().toString());
        break;
      case 'echo':
        appendOut(arg);
        break;
      case 'clear':
        setLines([]);
        break;
      case 'exit':
        closeWin(winId);
        break;
      default:
        appendErr(`'${head}' is not recognized. Type \`help\`.`);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const next = hIdx < 0 ? history.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(next);
      setInput(history[next] ?? '');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIdx < 0) return;
      const next = hIdx + 1;
      if (next >= history.length) {
        setHIdx(-1);
        setInput('');
      } else {
        setHIdx(next);
        setInput(history[next] ?? '');
      }
    }
  };

  return (
    <div
      className="h-full w-full font-mono text-[12px] leading-tight cursor-text"
      style={{ background: '#000', color: '#dde7ff' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="h-full overflow-y-auto p-2">
        {lines.map((l, i) => (
          <div
            key={i}
            className="whitespace-pre-wrap break-words"
            style={{
              color: l.kind === 'err' ? '#ff8080' : l.kind === 'in' ? '#9bd9ff' : '#dde7ff',
            }}
          >
            {l.text || ' '}
          </div>
        ))}
        <div className="flex items-center">
          <span style={{ color: '#9bd9ff' }}>C:\&gt;&nbsp;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent outline-none border-0 text-[#dde7ff] caret-[#dde7ff]"
            style={{ font: 'inherit' }}
          />
        </div>
      </div>
    </div>
  );
}
