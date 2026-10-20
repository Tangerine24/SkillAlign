import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  TrendingUp,
  Zap,
  Calendar,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
} from 'recharts';
import apiClient from '../../api/client';
import type { SkillClockEstimateResponse } from '../../types/contract';
import { getDictionary, type LanguageMode } from './studioTranslations';

export interface SkillClockViewProps {
  districtId?: string;
  occupationId?: string;
  language?: LanguageMode;
}

export const SkillClockView: React.FC<SkillClockViewProps> = ({
  districtId = 'rewa',
  occupationId = 'occ_solar_pv',
  language = 'EN',
}) => {
  const [lang, setLang] = useState<LanguageMode>(language);
  useEffect(() => {
    setLang(language);
  }, [language]);
  const d = getDictionary(lang);

  const [loading, setLoading] = useState<boolean>(true);
  const [estimateData, setEstimateData] = useState<SkillClockEstimateResponse | null>(null);

  // Interactive sensitivity sliders
  const [targetGap, setTargetGap] = useState<number>(180);
  const [completionYieldPct, setCompletionYieldPct] = useState<number>(85);
  const [batchDelayMonths, setBatchDelayMonths] = useState<number>(0);
  const [ojtDays, setOjtDays] = useState<number>(15);
  const [wageStipendTopup, setWageStipendTopup] = useState<number>(1500);

  useEffect(() => {
    async function fetchEstimate() {
      setLoading(true);
      try {
        const res = await apiClient.estimateSkillClock({
          district_id: districtId,
          target_occupation_id: occupationId,
          target_gap_headcount: targetGap,
          wage_stipend_topup_inr: wageStipendTopup,
        });
        setEstimateData(res);
      } catch (err) {
        console.error('Failed to estimate skill clock', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEstimate();
  }, [districtId, occupationId, targetGap, wageStipendTopup]);

  // Dynamic calculations accounting for interactive sliders
  const sensitivityCurve = useMemo(() => {
    if (!estimateData) return [];
    const base = estimateData.monthly_readiness_curve;
    const yieldFactor = completionYieldPct / 85.0;
    const ojtMonths = Math.ceil(ojtDays / 30);

    return base.map((pt, idx) => {
      const currentOffset = idx + 1;
      const freshReadyOffset = 12 + batchDelayMonths;
      const freshSupply =
        currentOffset >= freshReadyOffset ? Math.round(targetGap * 0.62 * yieldFactor) : 0;

      const bridgeReadyOffset = 2 + batchDelayMonths + ojtMonths;
      const bridgeSupply =
        currentOffset >= bridgeReadyOffset
          ? Math.min(targetGap, Math.round(targetGap * 0.9 * yieldFactor))
          : 0;

      const sttReadyOffset = 3 + batchDelayMonths + ojtMonths;
      const sttSupply =
        currentOffset >= sttReadyOffset
          ? Math.min(targetGap, Math.round(targetGap * 0.74 * yieldFactor))
          : 0;

      return {
        month: pt.month_label,
        month_offset: currentOffset,
        target_demand_curve: pt.cumulative_demand_target,
        track_a_fresh_iti: freshSupply,
        pmkvy_stt: sttSupply,
        track_c_skillbridge: bridgeSupply,
      };
    });
  }, [estimateData, completionYieldPct, batchDelayMonths, ojtDays, targetGap]);

  const freshPath = estimateData?.fresh_iti_pathway;
  const sttPath = estimateData?.pmkvy_stt_pathway;
  const bridgePath = estimateData?.skillbridge_conversion_pathway;

  return (
    <div className="space-y-5 text-slate-100">
      {/* Compact Studio Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            {d.s06Title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{d.s06Subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900 text-emerald-400 border border-slate-800 animate-pulse">
              Recalculating...
            </span>
          )}
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Target Deficit: <strong className="text-amber-400">{targetGap}</strong> Workers
          </span>
        </div>
      </div>

      {/* Top: 3 Crisp Pathway Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Track A: Fresh 12-24m ITI */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3.5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                Track A: Fresh 12-24m ITI
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                MISSES WINDOW
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white">
              {freshPath?.scheme_name || 'DGT NCVT Craftsmen Training (CTS)'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {freshPath?.bottleneck_note ||
                'Bound to annual August admission gate + 12–24m syllabus; graduates arrive after peak EPC demand window.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Lead Time</span>
              <span className="font-semibold text-rose-400">
                {freshPath ? `${freshPath.duration_months}m` : '12–24m'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Ready By</span>
              <span className="font-semibold text-slate-200">
                {freshPath?.ready_by_month || '2027-10'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Cost/Retained</span>
              <span className="font-semibold text-slate-200">
                ₹{(freshPath?.cost_per_retained_worker_inr || 67740).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Track B: 90d PMKVY STT */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3.5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-sky-400" />
                Track B: 90d PMKVY STT
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                  batchDelayMonths <= 2
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {batchDelayMonths <= 2 ? 'ON-TIME (PARTIAL)' : 'MISSES WINDOW'}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white">
              {sttPath?.scheme_name || 'PMKVY 4.0 Short-Term Training (STT)'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {sttPath?.bottleneck_note ||
                '90-day ab-initio skilling for fresh entrants; faster than ITI but lower field retention than experienced bridge technicians.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Lead Time</span>
              <span className="font-semibold text-sky-400">
                {sttPath ? `${sttPath.duration_days}d` : '90d (3m)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Ready By</span>
              <span className="font-semibold text-slate-200">
                {sttPath?.ready_by_month || '2026-01'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Cost/Retained</span>
              <span className="font-semibold text-slate-200">
                ₹{(sttPath?.cost_per_retained_worker_inr || 22400).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Track C: 45-90d SkillBridge Conversion */}
        <div className="bg-slate-900/80 border border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3.5 ring-1 ring-emerald-500/15">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Track C: 45-90d SkillBridge Conversion
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ON-TIME
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white">
              {bridgePath?.scheme_name || 'PMKVY 4.0 RPL + SkillBridge Addendum'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {bridgePath?.bottleneck_note ||
                'Converts unplaced donor ITI graduates with 72–76% NOS overlap; deploys certified workers directly inside the peak surge window.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Lead Time</span>
              <span className="font-semibold text-emerald-400">
                {bridgePath ? `${bridgePath.duration_days}d` : '45–90d'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Ready By</span>
              <span className="font-semibold text-emerald-300">
                {bridgePath?.ready_by_month || '2025-12'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Cost/Retained</span>
              <span className="font-semibold text-emerald-300">
                ₹{(bridgePath?.cost_per_retained_worker_inr || 13410).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Spacious Cumulative Workforce Readiness Curve */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Cumulative Workforce Readiness Curve (12-Month Horizon)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative demand target vs field-ready certified supply across Track A (ITI), Track B (PMKVY STT), and Track C (SkillBridge).
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Yield: <strong className="text-emerald-400">{completionYieldPct}%</strong></span>
            <span>Delay: <strong className="text-sky-400">+{batchDelayMonths}m</strong></span>
            <span>OJT: <strong className="text-slate-200">{ojtDays}d</strong></span>
          </div>
        </div>

        <div className="h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sensitivityCurve} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <ReferenceLine
                y={targetGap}
                label={{ value: 'Target Deficit', fill: '#f59e0b', fontSize: 11, position: 'top' }}
                stroke="#f59e0b"
                strokeDasharray="4 4"
              />
              <Area
                type="monotone"
                dataKey="target_demand_curve"
                name="Cumulative Demand Target"
                fill="#f59e0b"
                fillOpacity={0.1}
                stroke="#f59e0b"
                strokeWidth={2}
              />
              <Line
                type="stepAfter"
                dataKey="track_c_skillbridge"
                name="Track C: SkillBridge Conversion (45-90d)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#10b981' }}
              />
              <Line
                type="stepAfter"
                dataKey="pmkvy_stt"
                name="Track B: PMKVY Fresh STT (90d)"
                stroke="#38bdf8"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Line
                type="stepAfter"
                dataKey="track_a_fresh_iti"
                name="Track A: Fresh ITI Cohort (12-24m)"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#f43f5e' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom: Compact, Well-Aligned Sensitivity Controls Card */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-400" />
            {d.sensitivityControls}
          </h3>
          <span className="text-xs text-slate-400">
            Interactive operational stress-test parameters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Slider 1: Target Gap */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Target Deficit</span>
              <span className="font-mono font-semibold text-amber-400">{targetGap}</span>
            </div>
            <input
              type="range"
              min="40"
              max="400"
              step="20"
              value={targetGap}
              onChange={(e) => setTargetGap(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>40</span>
              <span>20-seat step</span>
              <span>400</span>
            </div>
          </div>

          {/* Slider 2: Completion Yield */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Retention Yield</span>
              <span className="font-mono font-semibold text-emerald-400">{completionYieldPct}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="98"
              step="2"
              value={completionYieldPct}
              onChange={(e) => setCompletionYieldPct(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>50%</span>
              <span>6m Retained</span>
              <span>98%</span>
            </div>
          </div>

          {/* Slider 3: Batch Delay */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Mobilization Lag</span>
              <span className="font-mono font-semibold text-sky-400">+{batchDelayMonths}m</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={batchDelayMonths}
              onChange={(e) => setBatchDelayMonths(Number(e.target.value))}
              className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0m</span>
              <span>RFP / Tender</span>
              <span>5m</span>
            </div>
          </div>

          {/* Slider 4: OJT Duration */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Shopfloor OJT</span>
              <span className="font-mono font-semibold text-purple-400">{ojtDays}d</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="15"
              value={ojtDays}
              onChange={(e) => setOjtDays(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0d</span>
              <span>Immersion</span>
              <span>60d</span>
            </div>
          </div>

          {/* Slider 5: NAPS Stipend Top-Up */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">NAPS Top-Up</span>
              <span className="font-mono font-semibold text-cyan-400">₹{wageStipendTopup}</span>
            </div>
            <input
              type="range"
              min="0"
              max="3000"
              step="500"
              value={wageStipendTopup}
              onChange={(e) => setWageStipendTopup(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹0</span>
              <span>Monthly</span>
              <span>₹3,000</span>
            </div>
          </div>
        </div>

        {estimateData?.verdict_summary && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Lead-Time Verdict:</strong>{' '}
              {estimateData.verdict_summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillClockView;
