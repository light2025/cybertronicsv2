'use client';

import { Component, type ReactNode } from 'react';
import { useXpStore } from '@/lib/store/xpStore';

type Props = { winId: string; children: ReactNode };
type State = { error: Error | null };

export default class WindowErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('[XP app crash]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <CrashDialog
          winId={this.props.winId}
          error={this.state.error}
          reset={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}

function CrashDialog({
  winId,
  error,
  reset,
}: {
  winId: string;
  error: Error;
  reset: () => void;
}) {
  const close = useXpStore((s) => s.close);

  const BTN_STYLE = {
    background: '#ece9d8',
    border: '1px solid #777',
    boxShadow: 'inset 0 1px 0 #fff, inset 0 -1px 0 #999',
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#ece9d8] p-5 gap-4">
      <div className="flex items-start gap-3 max-w-md">
        <span
          className="w-10 h-10 rounded-full grid place-items-center text-white text-[18px] font-bold shrink-0"
          style={{ background: '#c44030', border: '2px solid #882010' }}
        >
          ×
        </span>
        <div className="text-[12px] text-gray-900 leading-relaxed">
          <p className="font-bold mb-1">This application has encountered a problem.</p>
          <p className="text-gray-700 mb-2">A guest in this window crashed unexpectedly.</p>
          <p className="text-[10px] text-gray-500 font-mono break-words">
            {error.message || 'Unknown error'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={reset} className="px-4 py-1 text-[11px] text-gray-900 rounded-sm" style={BTN_STYLE}>
          Try again
        </button>
        <button onClick={() => close(winId)} className="px-4 py-1 text-[11px] text-gray-900 rounded-sm" style={BTN_STYLE}>
          Close
        </button>
      </div>
    </div>
  );
}
