'use client';

import { useState } from 'react';

type Op = '+' | '-' | '×' | '÷' | null;

const BTN_NUM = 'bg-[#3a3a3c] hover:bg-[#4a4a4c] active:bg-[#5a5a5c] text-white';
const BTN_OP  = 'bg-[#f5a623] hover:bg-[#e09614] active:bg-[#c08010] text-white font-bold';
const BTN_FN  = 'bg-[#a5a5a5] hover:bg-[#959595] active:bg-[#858585] text-black font-medium';

function compute(a: number, b: number, op: Op): number {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
    default:  return b;
  }
}

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [waitingNext, setWaitingNext] = useState(false);

  const inputDigit = (d: string) => {
    if (waitingNext) {
      setDisplay(d);
      setWaitingNext(false);
    } else {
      setDisplay(display === '0' ? d : display + d);
    }
  };

  const inputDot = () => {
    if (waitingNext) {
      setDisplay('0.');
      setWaitingNext(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const applyOp = (newOp: Op) => {
    const cur = parseFloat(display);
    if (acc === null || op === null || waitingNext) {
      setAcc(cur);
    } else {
      const result = compute(acc, cur, op);
      setAcc(result);
      setDisplay(formatResult(result));
    }
    setOp(newOp);
    setWaitingNext(true);
  };

  const equals = () => {
    if (op === null || acc === null) return;
    const cur = parseFloat(display);
    const result = compute(acc, cur, op);
    setDisplay(formatResult(result));
    setAcc(null);
    setOp(null);
    setWaitingNext(true);
  };

  const clear = () => {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setWaitingNext(false);
  };

  const toggleSign = () => setDisplay(formatResult(parseFloat(display) * -1));
  const percent = () => setDisplay(formatResult(parseFloat(display) / 100));

  return (
    <div className="flex flex-col h-full" style={{ background: '#1a1a1a' }}>
      {/* Display */}
      <div className="flex items-end justify-end p-4 shrink-0" style={{ minHeight: 96 }}>
        <div
          className="text-white font-light text-[40px] leading-none truncate w-full text-right"
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          {display}
        </div>
      </div>

      {/* Button grid */}
      <div
        className="grid gap-2 p-2 flex-1"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: '1fr' }}
      >
        <Btn cls={BTN_FN}  label="C"  onClick={clear} />
        <Btn cls={BTN_FN}  label="±"  onClick={toggleSign} />
        <Btn cls={BTN_FN}  label="%"  onClick={percent} />
        <Btn cls={BTN_OP}  label="÷"  onClick={() => applyOp('÷')} />

        <Btn cls={BTN_NUM} label="7"  onClick={() => inputDigit('7')} />
        <Btn cls={BTN_NUM} label="8"  onClick={() => inputDigit('8')} />
        <Btn cls={BTN_NUM} label="9"  onClick={() => inputDigit('9')} />
        <Btn cls={BTN_OP}  label="×"  onClick={() => applyOp('×')} />

        <Btn cls={BTN_NUM} label="4"  onClick={() => inputDigit('4')} />
        <Btn cls={BTN_NUM} label="5"  onClick={() => inputDigit('5')} />
        <Btn cls={BTN_NUM} label="6"  onClick={() => inputDigit('6')} />
        <Btn cls={BTN_OP}  label="−"  onClick={() => applyOp('-')} />

        <Btn cls={BTN_NUM} label="1"  onClick={() => inputDigit('1')} />
        <Btn cls={BTN_NUM} label="2"  onClick={() => inputDigit('2')} />
        <Btn cls={BTN_NUM} label="3"  onClick={() => inputDigit('3')} />
        <Btn cls={BTN_OP}  label="+"  onClick={() => applyOp('+')} />

        <Btn cls={BTN_NUM} label="0"  onClick={() => inputDigit('0')} span={2} />
        <Btn cls={BTN_NUM} label="."  onClick={inputDot} />
        <Btn cls={BTN_OP}  label="="  onClick={equals} />
      </div>
    </div>
  );
}

function Btn({ label, onClick, cls, span = 1 }: { label: string; onClick: () => void; cls: string; span?: number }) {
  return (
    <button
      onClick={onClick}
      className={`${cls} text-[20px] rounded-md select-none transition-colors`}
      style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}
    >
      {label}
    </button>
  );
}

function formatResult(n: number): string {
  if (!Number.isFinite(n)) return 'Error';
  // Trim long decimals, keep up to 10 significant digits, drop trailing zeros.
  const s = Math.abs(n) >= 1e10 || (n !== 0 && Math.abs(n) < 1e-6)
    ? n.toExponential(6)
    : Number(n.toFixed(10)).toString();
  return s;
}
