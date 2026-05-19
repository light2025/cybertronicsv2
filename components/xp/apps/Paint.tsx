'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Trash2, Undo2, Redo2 } from 'lucide-react';

const PALETTE = [
  '#000000', '#808080', '#800000', '#808000',
  '#008000', '#008080', '#000080', '#800080',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00',
  '#00ff00', '#00ffff', '#0000ff', '#ff00ff',
  '#ff8040', '#804000', '#80ff00', '#004040',
  '#0080ff', '#8080ff', '#ff0080', '#ff8080',
];

const SIZES = [1, 3, 7, 12, 20];
type Tool = 'pencil' | 'fill' | 'eraser';

const UNDO_CAP = 20;

export default function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(3);
  const [tool, setTool] = useState<Tool>('pencil');
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const undoStack = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);
  const [undoLen, setUndoLen] = useState(0);
  const [redoLen, setRedoLen] = useState(0);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

  const captureSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.current.push(snap);
    if (undoStack.current.length > UNDO_CAP) undoStack.current.shift();
    redoStack.current = [];
    setUndoLen(undoStack.current.length);
    setRedoLen(0);
  }, []);

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || undoStack.current.length === 0) return;
    const cur = ctx.getImageData(0, 0, canvas.width, canvas.height);
    redoStack.current.push(cur);
    if (redoStack.current.length > UNDO_CAP) redoStack.current.shift();
    const snap = undoStack.current.pop()!;
    ctx.putImageData(snap, 0, 0);
    setUndoLen(undoStack.current.length);
    setRedoLen(redoStack.current.length);
  };

  const redo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || redoStack.current.length === 0) return;
    const cur = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.current.push(cur);
    if (undoStack.current.length > UNDO_CAP) undoStack.current.shift();
    const snap = redoStack.current.pop()!;
    ctx.putImageData(snap, 0, 0);
    setUndoLen(undoStack.current.length);
    setRedoLen(redoStack.current.length);
  };

  // Fill canvas white on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // Flood fill (BFS)
  const floodFill = useCallback(
    (startX: number, startY: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const { width, height } = canvas;
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      const idx = (x: number, y: number) => (y * width + x) * 4;
      const sx = Math.floor(startX);
      const sy = Math.floor(startY);
      const base = idx(sx, sy);
      const targetR = data[base], targetG = data[base + 1], targetB = data[base + 2], targetA = data[base + 3];

      // Parse fill color
      const tmp = document.createElement('canvas').getContext('2d')!;
      tmp.fillStyle = color;
      tmp.fillRect(0, 0, 1, 1);
      const [fR, fG, fB] = Array.from(tmp.getImageData(0, 0, 1, 1).data);
      if (fR === targetR && fG === targetG && fB === targetB && targetA === 255) return;

      const stack = [[sx, sy]];
      const visited = new Uint8Array(width * height);
      const match = (x: number, y: number) => {
        const i = idx(x, y);
        return data[i] === targetR && data[i + 1] === targetG && data[i + 2] === targetB && data[i + 3] === targetA;
      };

      while (stack.length) {
        const [x, y] = stack.pop()!;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        if (visited[y * width + x]) continue;
        if (!match(x, y)) continue;
        visited[y * width + x] = 1;
        const i = idx(x, y);
        data[i] = fR; data[i + 1] = fG; data[i + 2] = fB; data[i + 3] = 255;
        stack.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
      }
      ctx.putImageData(imgData, 0, 0);
    },
    [color]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = getPos(e);
    captureSnapshot();
    if (tool === 'fill') {
      floodFill(pos.x, pos.y);
      return;
    }
    drawing.current = true;
    lastPos.current = pos;
    const ctx = getCtx();
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (tool === 'eraser' ? size * 2 : size) / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.fill();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    const prev = lastPos.current ?? pos;
    const drawSize = tool === 'eraser' ? size * 2 : size;

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = drawSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const onPointerUp = () => {
    drawing.current = false;
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    captureSnapshot();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const TOOL_BTN = (t: Tool) =>
    `px-2 py-0.5 text-[11px] rounded border ${tool === t ? 'bg-[#316ac5] text-white border-[#1a4a9a]' : 'bg-[#ece9d8] text-gray-800 border-[#aaa] hover:bg-[#d0dff5]'}`;

  return (
    <div className="flex flex-col h-full" style={{ background: '#ece9d8' }}>
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-1.5 px-2 py-1 shrink-0"
        style={{ background: '#ece9d8', borderBottom: '1px solid #aaa' }}
      >
        {/* Tools */}
        <div className="flex gap-0.5">
          <button className={TOOL_BTN('pencil')} onClick={() => setTool('pencil')}>✏️ Pencil</button>
          <button className={TOOL_BTN('fill')} onClick={() => setTool('fill')}>🪣 Fill</button>
          <button className={TOOL_BTN('eraser')} onClick={() => setTool('eraser')}>🧹 Eraser</button>
        </div>

        {/* Sizes */}
        <div className="flex gap-0.5 items-center">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className="flex items-center justify-center rounded"
              style={{
                width: 20, height: 20,
                background: size === s ? '#316ac5' : '#ece9d8',
                border: `1px solid ${size === s ? '#1a4a9a' : '#aaa'}`,
              }}
              title={`${s}px`}
            >
              <span
                className="rounded-full bg-black"
                style={{
                  width: Math.min(s * 1.2, 14),
                  height: Math.min(s * 1.2, 14),
                  background: size === s ? '#fff' : '#000',
                }}
              />
            </button>
          ))}
        </div>

        {/* Undo / Redo */}
        <div className="flex gap-0.5">
          <button
            onClick={undo}
            disabled={undoLen === 0}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded border border-[#aaa] bg-[#ece9d8] hover:bg-[#d0dff5] text-gray-800 disabled:opacity-40 disabled:hover:bg-[#ece9d8]"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3 h-3" /> Undo
          </button>
          <button
            onClick={redo}
            disabled={redoLen === 0}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded border border-[#aaa] bg-[#ece9d8] hover:bg-[#d0dff5] text-gray-800 disabled:opacity-40 disabled:hover:bg-[#ece9d8]"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3 h-3" /> Redo
          </button>
        </div>

        <div className="flex-1" />
        <button
          onClick={clearCanvas}
          className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded border border-[#aaa] bg-[#ece9d8] hover:bg-[#d0dff5] text-gray-800"
        >
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      {/* Palette + canvas row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Palette sidebar */}
        <div
          className="w-12 shrink-0 flex flex-col p-1 gap-0.5 overflow-y-auto"
          style={{ background: '#ece9d8', borderRight: '1px solid #aaa' }}
        >
          {/* Current color preview */}
          <div
            className="w-8 h-8 mx-auto rounded mb-1"
            style={{ background: color, border: '2px solid #000', boxShadow: '1px 1px 0 #fff inset' }}
          />
          {/* Swatches */}
          <div className="grid grid-cols-2 gap-0.5">
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-4 h-4 rounded-sm"
                style={{
                  background: c,
                  border: color === c ? '2px solid #000' : '1px solid #888',
                }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto flex items-start justify-start p-1">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="touch-none"
            style={{ cursor: tool === 'fill' ? 'crosshair' : 'default', border: '1px solid #888', background: '#fff', display: 'block' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
        </div>
      </div>
    </div>
  );
}
