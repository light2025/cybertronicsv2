'use client';

const BAR_BG = 'linear-gradient(to bottom, #4a5058 0%, #2a3038 60%, #1a2028 100%)';

type Key = { label: string; onClick: () => void; disabled?: boolean };
type Props = { left?: Key; right?: Key };

function KeyButton({ keyDef, align }: { keyDef?: Key; align: 'left' | 'right' }) {
  if (!keyDef) return <div className="flex-1" />;
  return (
    <button
      onClick={keyDef.onClick}
      disabled={keyDef.disabled}
      className="flex-1 h-full text-white text-[11px] font-bold px-4 disabled:opacity-40 active:bg-black/30"
      style={{
        textAlign: align,
        textShadow: '0 1px 1px rgba(0,0,0,0.6)',
        letterSpacing: '0.05em',
      }}
    >
      {keyDef.label}
    </button>
  );
}

export default function SoftKeys({ left, right }: Props) {
  return (
    <div
      className="flex items-stretch shrink-0 select-none"
      style={{
        height: 36,
        background: BAR_BG,
        borderTop: '1px solid #1a2028',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
      }}
    >
      <KeyButton keyDef={left} align="left" />
      <div className="w-px h-full" style={{ background: '#000', opacity: 0.4 }} />
      <KeyButton keyDef={right} align="right" />
    </div>
  );
}
