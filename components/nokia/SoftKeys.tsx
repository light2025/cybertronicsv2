'use client';

const BAR_BG = 'linear-gradient(to bottom, #7898c0 0%, #5476a4 50%, #3a5a82 100%)';

type Key = { label: string; onClick: () => void; disabled?: boolean };

type Props = {
  left?: Key;
  right?: Key;
};

function KeyButton({ keyDef, align }: { keyDef?: Key; align: 'left' | 'right' }) {
  if (!keyDef) return <div className="flex-1" />;
  return (
    <button
      onClick={keyDef.onClick}
      disabled={keyDef.disabled}
      className="flex-1 h-full text-white text-[11px] font-bold px-4 disabled:opacity-40 active:bg-black/15"
      style={{
        textAlign: align,
        textShadow: '0 1px 1px rgba(0,0,0,0.4)',
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
        height: 32,
        background: BAR_BG,
        borderTop: '1px solid #1e3858',
      }}
    >
      <KeyButton keyDef={left} align="left" />
      <div className="w-px h-full opacity-30" style={{ background: '#1e3858' }} />
      <KeyButton keyDef={right} align="right" />
    </div>
  );
}
