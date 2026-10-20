import React, { useEffect, useState } from 'react';
import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import apiClient from '../../api/client';
import type {
  DecisionStatus,
  ForecastEvaluationResponse,
  PolicyDecisionItem,
} from '../../types/contract';
import { getDictionary, type LanguageMode } from './studioTranslations';

export interface ValidationOutcomesViewProps {
  districtId?: string;
  occupationId?: string;
  cutoffDate?: string;
  language?: LanguageMode;
  onInspectEvidence?: (label: string, value: string, forecastId?: string) => void;
}

export const ValidationOutcomesView: React.FC<ValidationOutcomesViewProps> = ({
  districtId = 'rewa',
  occupationId = 'occ_solar_pv',
  cutoffDate = '2025-10',
  language = 'EN',
  onInspectEvidence,
}) => {
  const [lang, setLang] = useState<LanguageMode>(language);
  useEffect(() => {
    setLang(language);
  }, [language]);
  const d = getDictionary(lang);

  const [activeTab, setActiveTab] = useState<'replay' | 'governance'>('replay');
  const [evalData, setEvalData] = useState<ForecastEvaluationResponse | null>(null);
  const [decisions, setDecisions] = useState<PolicyDecisionItem[]>([]);
  const [rewindMonth, setRewindMonth] = useState<string>(cutoffDate || '2025-10');
  const [replayProgress, setReplayProgress] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(true);
  const [overrideNote, setOverrideNote] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [evRes, decRes] = await Promise.all([
          apiClient.getForecastEvaluation({
            district_id: districtId,
            occupation_id: occupationId,
            rewind_to_month: rewindMonth,
          }),
          apiClient.getDecisions(),
        ]);
        if (mounted) {
          setEvalData(evRes);
          setDecisions(decRes.decisions);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [districtId, occupationId, rewindMonth]);

  const handleDecisionAction = async (decisionId: string, nextStatus: DecisionStatus) => {
    const res = await apiClient.updateDecisionStatus({
      decision_id: decisionId,
      status: nextStatus,
      reviewer_note: overrideNote[decisionId] || 'Reviewed in Screen S08 Outcome Loop',
    });
    setDecisions(res.decisions);
  };

  if (loading || !evalData) {
    return (
      <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-900/50 text-xs text-slate-400 animate-pulse">
        Loading Walk-Forward Backtest &amp; Time-Travel Counterfactual Replay...
      </div>
    );
  }

  // Filter replay series based on replayProgress (months after 2025-10)
  const trainPoints = evalData.replay_series.filter((p) => p.phase === 'TRAIN_HISTORY');
  const testPoints = evalData.replay_series
    .filter((p) => p.phase === 'REPLAY_TEST_WINDOW')
    .slice(0, replayProgress);
  const visibleSeries = [...trainPoints, ...testPoints].map((pt) => ({
    ...pt,
    pi_band:
      pt.skillalign_p10 !== null && pt.skillalign_p90 !== null
        ? [pt.skillalign_p10, pt.skillalign_p90]
        : null,
  }));

  const m = evalData.metrics;
  const saWapePct =
    m.skillalign_wape <= 1 ? (m.skillalign_wape * 100).toFixed(1) : m.skillalign_wape.toFixed(1);
  const nvWapePct =
    m.naive_baseline_wape <= 1
      ? (m.naive_baseline_wape * 100).toFixed(1)
      : m.naive_baseline_wape.toFixed(1);

  return (
    <div className="space-y-5 text-slate-100">
      {/* Compact Studio Action Bar + 2-Tab Segmented Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            {d.s08Title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{d.s08Subtitle}</p>
        </div>

        <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('replay')}
            className={`px-3.5 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeTab === 'replay'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Time-Travel Counterfactual Replay (Oct 2025 Shock)
          </button>
          <button
            onClick={() => setActiveTab('governance')}
            className={`px-3.5 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeTab === 'governance'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            District Governance Action Queue
            <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[10px] font-mono text-slate-300">
              {decisions.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'replay' ? (
        <div className="space-y-5">
          {/* 4 Clean Backtest KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div
              onClick={() =>
                onInspectEvidence?.(
                  'SkillAlign Out-of-Sample WAPE',
                  `${saWapePct}%`,
                  `fc_${districtId}_${occupationId}_2026-10`
                )
              }
              className="cursor-pointer rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 hover:border-emerald-500/40 transition"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>SkillAlign WAPE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                  +{m.wape_improvement_pct}% vs Naive
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5">
                {saWapePct}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Naive Baseline: <span className="line-through text-rose-400">{nvWapePct}%</span>
              </div>
            </div>

            <div
              onClick={() =>
                onInspectEvidence?.(
                  'Out-of-Sample MASE',
                  String(m.mase),
                  `fc_${districtId}_${occupationId}_2026-10`
                )
              }
              className="cursor-pointer rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 hover:border-emerald-500/40 transition"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Scaled Error (MASE)</span>
                <span className="text-[10px] font-mono text-slate-500">Pinball: {m.pinball_loss_p50}</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1.5">{m.mase}</div>
              <div className="text-[11px] text-emerald-400 mt-1">&lt; 1.0 Beats Holdout Baseline</div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>80% PI Coverage</span>
                <span className="text-[10px] font-mono text-slate-500">Nominal: 80%</span>
              </div>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-1.5">
                {m.empirical_coverage_80pi}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Calibrated P10–P90 Interval</div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Directional Accuracy</span>
                <span className="text-[10px] font-mono text-amber-400">11/12 Months</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-300 mt-1.5">
                {m.action_accuracy_pct}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Post-Shock Surge Detection</div>
            </div>
          </div>

          {/* Interactive Replay Scrubber & Fan Chart */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  {evalData.shock_event_title} — Cutoff{' '}
                  <span className="font-mono text-amber-300">{rewindMonth}</span> &rarr;{' '}
                  <span className="font-mono text-emerald-400">
                    {testPoints[testPoints.length - 1]?.month || '2025-11'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
                  {evalData.shock_event_narrative}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setRewindMonth('2025-10');
                    setReplayProgress(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  +1m
                </button>
                <div className="flex items-center gap-2.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={replayProgress}
                    onChange={(e) => setReplayProgress(Number(e.target.value))}
                    className="w-28 accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono font-semibold text-emerald-400 w-10 text-right">
                    +{replayProgress}m
                  </span>
                </div>
                <button
                  onClick={() => setReplayProgress(12)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  +12m Full
                </button>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={visibleSeries} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
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
                    x="2025-10"
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: 'T-12m Shock Cutoff (2025-10)',
                      fill: '#fbbf24',
                      fontSize: 11,
                      position: 'top',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="skillalign_p90"
                    name="SkillAlign P90 Upper Bound"
                    stroke="none"
                    fill="#10b981"
                    fillOpacity={0.14}
                  />
                  <Area
                    type="monotone"
                    dataKey="skillalign_p10"
                    name="SkillAlign P10 Lower Bound"
                    stroke="none"
                    fill="#06b6d4"
                    fillOpacity={0.12}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual_ground_truth"
                    name="Observed Ground-Truth Demand"
                    stroke="#f8fafc"
                    strokeWidth={2.5}
                    dot={{ r: 2.5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="skillalign_p50"
                    name="SkillAlign P50 Forecast (From Oct 2025)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    strokeDasharray="5 3"
                  />
                  <Line
                    type="monotone"
                    dataKey="naive_flat_forecast"
                    name="Seasonal-Naive Baseline"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Counterfactual Outcome Comparison & 5-District Holdout Benchmark */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  Oct 2025 Counterfactual Audit
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">Ground-Truth Verified</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex justify-between items-center gap-2">
                  <div>
                    <div className="text-slate-400 text-[11px]">Standard 24m ITI Route at Oct 2025</div>
                    <div className="text-slate-200 font-medium mt-0.5">
                      0 Graduated by Oct 2026 (Cohort still in Year-1)
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 font-mono text-[11px] font-semibold shrink-0">
                    0% Closed
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-emerald-500/30 flex justify-between items-center gap-2">
                  <div>
                    <div className="text-emerald-400 text-[11px]">SkillAlign 90d Bridge Alert at Oct 2025</div>
                    <div className="text-white font-medium mt-0.5">
                      140 Electricians Enrolled &rarr; 120 Placed by Feb 2026
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono text-[11px] font-semibold shrink-0">
                    85.7% Retained
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  5-District Out-of-Sample Evaluation Matrix
                </h3>
                <span className="text-[10px] font-mono text-slate-400">T-12m Walk-Forward</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2 font-medium">District</th>
                      <th className="py-2 font-medium">Occupation</th>
                      <th className="py-2 font-medium">Tier</th>
                      <th className="py-2 text-right font-medium">SkillAlign WAPE</th>
                      <th className="py-2 text-right font-medium">Naive WAPE</th>
                      <th className="py-2 text-right font-medium">80% PI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {evalData.district_benchmark_table.map((row) => (
                      <tr key={`${row.district_id}_${row.occupation_id}`} className="text-slate-200">
                        <td className="py-2 font-medium">{row.district_name}</td>
                        <td className="py-2 text-slate-300">{row.occupation_name}</td>
                        <td className="py-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                            {row.confidence_tier.split(':')[0]}
                          </span>
                        </td>
                        <td className="py-2 text-right font-mono font-semibold text-emerald-400">
                          {row.skillalign_wape <= 1
                            ? `${(row.skillalign_wape * 100).toFixed(1)}%`
                            : `${row.skillalign_wape}%`}
                        </td>
                        <td className="py-2 text-right font-mono text-rose-400">
                          {row.naive_wape <= 1
                            ? `${(row.naive_wape * 100).toFixed(1)}%`
                            : `${row.naive_wape}%`}
                        </td>
                        <td className="py-2 text-right font-mono text-sky-400">
                          {row.coverage_80pi}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: District Governance Action Queue */
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-800/80">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {d.actionQueue}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review, approve, or defer district reallocations. Tier-3 Sparse cells require explicit Collector override justification.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-emerald-400">
                {decisions.filter((x) => x.status === 'APPROVED').length} Approved
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                {decisions.length} Total Orders
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {decisions.map((dec) => {
              const isTier3 = dec.confidence_tier === 'Tier 3: Advisory Only';
              return (
                <div
                  key={dec.decision_id}
                  className={`p-4 rounded-xl border transition ${
                    isTier3
                      ? 'border-amber-500/30 bg-slate-950/70'
                      : 'border-slate-800/80 bg-slate-950/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white">{dec.title}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                            dec.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : dec.status === 'LOCKED_ADVISORY'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                          }`}
                        >
                          {dec.status}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {dec.confidence_tier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{dec.rationale}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isTier3 && dec.status === 'LOCKED_ADVISORY' && (
                        <input
                          type="text"
                          placeholder="Collector Override Note..."
                          value={overrideNote[dec.decision_id] || ''}
                          onChange={(e) =>
                            setOverrideNote((prev) => ({
                              ...prev,
                              [dec.decision_id]: e.target.value,
                            }))
                          }
                          className="bg-slate-900 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white w-44"
                        />
                      )}
                      <button
                        onClick={() => handleDecisionAction(dec.decision_id, 'APPROVED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        {isTier3 ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        {isTier3 ? 'Override & Approve' : d.approve}
                      </button>
                      <button
                        onClick={() => handleDecisionAction(dec.decision_id, 'DEFERRED')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                      >
                        {d.defer}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 pt-2.5 border-t border-slate-800/70 text-[11px] font-mono text-slate-400">
                    <span>
                      District: <strong className="text-slate-200 font-sans">{dec.district_name}</strong>
                    </span>
                    <span>
                      Gap Closed: <strong className="text-emerald-400">{dec.expected_gap_closed}</strong>
                    </span>
                    <span>
                      Lead Time: <strong className="text-slate-200">{dec.time_to_impact_days}d</strong>
                    </span>
                    <span>
                      Cost: <strong className="text-slate-200">₹{(dec.estimated_cost_inr / 100000).toFixed(2)}L</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationOutcomesView;
