import React from 'react';
import { CalendarClock, FastForward, History, Play } from 'lucide-react';

export interface TimeTravelDockProps {
  asOfMonth: '2025-10' | '2026-10';
  onChangeAsOfMonth: (month: '2025-10' | '2026-10') => void;
  onOpenValidationReplay?: () => void;
  variant?: 'inline' | 'banner';
}

export const TimeTravelDock: React.FC<TimeTravelDockProps> = ({
  asOfMonth,
  onChangeAsOfMonth,
  onOpenValidationReplay,
  variant = 'inline',
}) => {
  const isRewound = asOfMonth === '2025-10';

  if (variant === 'inline') {
    return (
      <div
        className="inline-flex items-center rounded-lg bg-slate-900/90 p-0.5 border border-slate-800 text-xs"
        role="group"
        aria-label="Time-Travel Cutoff Switch"
      >
        <button
          type="button"
          onClick={() => onChangeAsOfMonth('2025-10')}
          title="Rewind system clock to Oct 2025 (T-12m before solar/EV shock)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
            isRewound
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span className="tabular-nums">Oct 2025 Replay</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeAsOfMonth('2026-10')}
          title="Set system clock to Oct 2026 Live Present"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
            !isRewound
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <FastForward className="w-3.5 h-3.5" />
          <span className="tabular-nums">Oct 2026 Live</span>
        </button>
      </div>
    );
  }

  // Non-blocking contextual status strip when rewound to Oct 2025 (never covers bottom content)
  if (!isRewound) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-950/25 px-4 lg:px-6 py-2 text-xs print:hidden">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <History className="w-3.5 h-3.5" />
            TIME-TRAVEL MODE: OCT 2025 (T-12m CUTOFF)
          </span>
          <span className="text-slate-300">
            Viewing historical pre-shock baseline at Rewa Solar &amp; Indore EV inflection point.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-slate-300 font-mono">
            <CalendarClock className="w-3.5 h-3.5 text-amber-400" />
            NCVT Lock: 14d
          </span>
          {onOpenValidationReplay && (
            <button
              type="button"
              onClick={onOpenValidationReplay}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 font-semibold transition"
            >
              <Play className="w-3 h-3 text-indigo-400" />
              <span>Audit Counterfactual (S08)</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onChangeAsOfMonth('2026-10')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            <FastForward className="w-3 h-3 text-emerald-400" />
            <span>Return to Oct 2026 Live</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeTravelDock;
