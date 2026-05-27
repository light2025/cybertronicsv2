'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

const COLS = 18;
const ROWS = 18;
const TICK_MS = 140;

type Cell = [number, number];
type Dir = 'up' | 'down' | 'left' | 'right';

const center = (): Cell => [Math.floor(COLS / 2), Math.floor(ROWS / 2)];
const initialSnake = (): Cell[] => [center()];

function spawnFood(snake: Cell[]): Cell {
  // Bounded retry — a 18×18 board has 324 cells; collision risk is tiny
  // until the snake nearly fills the board. Then random becomes pathological.
  for (let attempts = 0; attempts < 500; attempts++) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    if (!snake.some(([sx, sy]) => sx === x && sy === y)) return [x, y];
  }
  // Fallback: scan deterministically for the first free cell.
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!snake.some(([sx, sy]) => sx === x && sy === y)) return [x, y];
    }
  }
  return [0, 0];
}

function opposite(a: Dir, b: Dir): boolean {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  );
}

export default function Snake() {
  const [snake, setSnake] = useState<Cell[]>(initialSnake);
  const [dir, setDir] = useState<Dir>('right');
  const [food, setFood] = useState<Cell>(() => spawnFood(initialSnake()));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);

  // Refs so the setInterval callback reads current state, not stale closures.
  // Updated in a separate effect (not during render — React 19 disallows).
  const snakeRef = useRef(snake);
  const dirRef = useRef(dir);
  const foodRef = useRef(food);

  useEffect(() => {
    snakeRef.current = snake;
    dirRef.current = dir;
    foodRef.current = food;
  }, [snake, dir, food]);

  useEffect(() => {
    if (!running || gameOver) return;
    const id = setInterval(() => {
      const cur = snakeRef.current;
      const head = cur[cur.length - 1];
      const d = dirRef.current;
      const next: Cell = [
        head[0] + (d === 'left' ? -1 : d === 'right' ? 1 : 0),
        head[1] + (d === 'up' ? -1 : d === 'down' ? 1 : 0),
      ];
      const hitWall = next[0] < 0 || next[0] >= COLS || next[1] < 0 || next[1] >= ROWS;
      const hitSelf = cur.some(([sx, sy]) => sx === next[0] && sy === next[1]);
      if (hitWall || hitSelf) {
        setGameOver(true);
        return;
      }
      const ate = next[0] === foodRef.current[0] && next[1] === foodRef.current[1];
      const newSnake: Cell[] = [...cur, next];
      if (!ate) newSnake.shift();
      setSnake(newSnake);
      if (ate) {
        setFood(spawnFood(newSnake));
        setScore((s) => s + 1);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, gameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cur = dirRef.current;
      let next: Dir | null = null;
      if (e.key === 'ArrowUp')    next = 'up';
      if (e.key === 'ArrowDown')  next = 'down';
      if (e.key === 'ArrowLeft')  next = 'left';
      if (e.key === 'ArrowRight') next = 'right';
      if (next && !opposite(cur, next)) setDir(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const restart = () => {
    const fresh = initialSnake();
    setSnake(fresh);
    setDir('right');
    setFood(spawnFood(fresh));
    setScore(0);
    setGameOver(false);
    setRunning(true);
  };

  const tryDir = (d: Dir) => {
    if (!opposite(dirRef.current, d)) setDir(d);
  };

  const headPos = snake[snake.length - 1];

  return (
    <div className="flex flex-col h-full p-2 select-none" style={{ background: '#a8c8a8' }}>
      {/* Score */}
      <div
        className="flex justify-between items-center px-2 py-1 mb-2 text-white text-[12px] font-bold"
        style={{ background: '#88a888', border: '1px solid #4a7048' }}
      >
        <span style={{ letterSpacing: '0.15em' }}>SCORE</span>
        <span className="font-mono">{String(score).padStart(4, '0')}</span>
      </div>

      {/* Board */}
      <div className="relative mx-auto" style={{ background: '#4a7048', border: '2px solid #2a5028', padding: 2 }}>
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 12px)`,
            gridTemplateRows: `repeat(${ROWS}, 12px)`,
          }}
        >
          {Array.from({ length: COLS * ROWS }).map((_, i) => {
            const x = i % COLS;
            const y = Math.floor(i / COLS);
            const isHead = headPos[0] === x && headPos[1] === y;
            const isBody = !isHead && snake.some(([sx, sy]) => sx === x && sy === y);
            const isFood = food[0] === x && food[1] === y;
            return (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  background: isHead ? '#1e2818' : isBody ? '#2a4828' : isFood ? '#cc4030' : 'transparent',
                }}
              />
            );
          })}
        </div>

        {gameOver && (
          <Overlay>
            <div className="text-[16px] font-bold mb-1">GAME OVER</div>
            <div className="text-[12px] mb-3">Score: {score}</div>
            <button
              onClick={restart}
              className="px-4 py-1.5 bg-white text-black text-[12px] font-bold rounded"
            >
              Play again
            </button>
          </Overlay>
        )}

        {!running && !gameOver && (
          <Overlay>
            <button
              onClick={() => setRunning(true)}
              className="px-5 py-2 bg-white text-black text-[13px] font-bold rounded"
            >
              ▶ Start
            </button>
            <div className="text-white/70 text-[10px] mt-2">Arrow keys or D-pad</div>
          </Overlay>
        )}
      </div>

      {/* D-pad */}
      <div className="mt-3 grid grid-cols-3 grid-rows-3 gap-1 w-32 mx-auto">
        <div />
        <DPadBtn onClick={() => tryDir('up')}><ArrowUp className="w-5 h-5" strokeWidth={3} /></DPadBtn>
        <div />
        <DPadBtn onClick={() => tryDir('left')}><ArrowLeft className="w-5 h-5" strokeWidth={3} /></DPadBtn>
        <DPadBtn onClick={restart} title="Restart"><RotateCcw className="w-4 h-4" /></DPadBtn>
        <DPadBtn onClick={() => tryDir('right')}><ArrowRight className="w-5 h-5" strokeWidth={3} /></DPadBtn>
        <div />
        <DPadBtn onClick={() => tryDir('down')}><ArrowDown className="w-5 h-5" strokeWidth={3} /></DPadBtn>
        <div />
      </div>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center text-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="text-white px-4">{children}</div>
    </div>
  );
}

function DPadBtn({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="aspect-square text-white grid place-items-center active:bg-[#688868]"
      style={{ background: '#88a888', border: '1px solid #4a7048' }}
    >
      {children}
    </button>
  );
}
