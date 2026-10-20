import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Clock,
  Layers,
  Search,
  Sparkles,
  Users,
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
import type { ForecastResponse } from '../../types/contract';
import type { LanguageMode } from '../studio/studioTranslations';

export interface ForecastDetailViewProps {
  districtId?: string;
  occupationId?: string;
  asOfMonth?: string;
  language?: LanguageMode;
  onInspectEvidence?: (label: string, value: string, forecastId: string) => void;
  onNavigateTab?: (tabKey: string) => void;
}

export const ForecastDetailView: React.FC<ForecastDetailViewProps> = ({
  districtId = 'rewa',
  occupationId = 'occ_solar_pv',
  asOfMonth = '2026-10',
  language = 'EN',
  onInspectEvidence,
  onNavigateTab,
}) => {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scaleMode, setScaleMode] = useState<'HEADCOUNT' | 'INDEX_100'>('HEADCOUNT');
  const [horizonMonths, setHorizonMonths] = useState<number>(12);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiClient
      .getForecast({
        district_id: districtId,
        occupation_id: occupationId,
        as_of_month: asOfMonth,
        horizon_months: horizonMonths,
      })
      .then((res) => {
        if (active) setForecast(res);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [districtId, occupationId, asOfMonth, horizonMonths]);

  const chartData = useMemo(() => {
    if (!forecast) return [];
    const combined = [...forecast.historical_series.slice(-18), ...forecast.forecast_series];
    const maxP90 = Math.max(1, ...combined.map((p) => p.demand_p90));

    return combined.map((pt) => {
      const factor = scaleMode === 'INDEX_100' ? 100 / maxP90 : 1;
      return {
        month: pt.month,
        phase: pt.is_historical ? 'Historical' : 'Forecast',
        demandP10: Math.round(pt.demand_p10 * factor),
        demandP50: Math.round(pt.demand_p50 * factor),
        demandP90: Math.round(pt.demand_p90 * factor),
        sanctionedMonthly: Math.round(pt.supply_sanctioned_monthly * factor),
        retainedSupply: Math.round(pt.supply_retained_6m * factor),
        netGap: Math.round(pt.net_gap_p50 * factor),
      };
    });
  }, [forecast, scaleMode]);

  if (loading || !forecast) {
    return (
      <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 text-sm animate-pulse">
        Loading S03 Probabilistic Demand-Supply Forecast &amp; Phantom Capacity Pipeline...
      </div>
    );
  }

  const sp = forecast.supply_pipeline_breakdown;
  const wd = forecast.wage_dynamics;
  const phantomSeats = Math.max(0, sp.sanctioned_seats - sp.actual_enrolments);
  const phantomPct = (sp.phantom_capacity_rate * 100).toFixed(1);

  const pipelineStages = [
    {
      step: '1. Sanctioned Seats (NCVT Multiples)',
      count: sp.sanctioned_seats,
      pctOfSanctioned: 100,
      note: `${sp.sanctioned_sections} sections × ${sp.section_size} seats/section`,
      color: 'bg-slate-600',
    },
    {
      step: '2. Actual Active Enrolments',
      count: sp.actual_enrolments,
      pctOfSanctioned: Math.round((sp.actual_enrolments * 100) / Math.max(1, sp.sanctioned_seats)),
      note: `${phantomSeats} empty Phantom Seats (${phantomPct}% ghost capacity)`,
      color: 'bg-indigo-500',
    },
    {
      step: '3. Course Completions',
      count: sp.completions,
      pctOfSanctioned: Math.round((sp.completions * 100) / Math.max(1, sp.sanctioned_seats)),
      note: 'Net of mid-course opportunity-cost dropouts',
      color: 'bg-blue-500',
    },
    {
      step: '4. NCVT / NSQF Certified',
      count: sp.certifications,
      pctOfSanctioned: Math.round((sp.certifications * 100) / Math.max(1, sp.sanctioned_seats)),
      note: 'Cleared practical & theory trade assessment',
      color: 'bg-cyan-500',
    },
    {
      step: '5. Entered Trade Employment',
      count: sp.entered_employment,
      pctOfSanctioned: Math.round((sp.entered_employment * 100) / Math.max(1, sp.sanctioned_seats)),
      note: 'Initial placement via campus / Rojgar Mela / NAPS',
      color: 'bg-teal-500',
    },
    {
      step: '6. Retained ≥ 6 Months (Effective Supply)',
      count: sp.retained_6m,
      pctOfSanctioned: Math.round((sp.retained_6m * 100) / Math.max(1, sp.sanctioned_seats)),
      note: 'True retained industrial supply entering district workforce',
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Clean Control Bar */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-bold text-white">
              {forecast.district_name} — {forecast.occupation_name}
            </span>
            <span className="font-mono text-slate-400">(NCO {forecast.nco_code})</span>
          </div>

          <span className="px-2 py-0.5 rounded-md font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            {forecast.confidence_tier} • α = {forecast.eb_shrinkage_weight}
          </span>

          <span className="px-2 py-0.5 rounded-md font-mono bg-slate-950 text-slate-300 border border-slate-800">
            NSQF L{forecast.nsqf_level} • π_tier ={' '}
            <strong className="text-amber-300">{forecast.plfs_capture_rate_pi_tier}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Scale Toggle */}
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setScaleMode('HEADCOUNT')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                scaleMode === 'HEADCOUNT'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Headcount
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('INDEX_100')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                scaleMode === 'INDEX_100'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Index 0–100
            </button>
          </div>

          {/* Horizon Selector */}
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            {[6, 12, 18].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHorizonMonths(h)}
                className={`px-2.5 py-1 rounded-md font-mono font-semibold transition ${
                  horizonMonths === h
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                +{h}m
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              onInspectEvidence?.(
                `${forecast.district_name} ${forecast.occupation_name} P50 Forecast`,
                `${forecast.forecast_series[0]?.demand_p50 || 0} workers/mo`,
                forecast.forecast_id
              )
            }
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono border border-slate-700 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>X-Ray</span>
          </button>
        </div>
      </div>

      {/* Section 1: Probabilistic P10/P50/P90 Fan Chart vs Effective Retained Supply */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              {scaleMode === 'HEADCOUNT'
                ? language === 'HI'
                  ? 'मासिक मांग पूर्वानुमान (P10 / P50 / P90) बनाम वास्तविक 6-माह प्रतिधारित आपूर्ति'
                  : 'Monthly PLFS-Debiased Worker Demand (P10 / P50 / P90) vs Retained Supply'
                : 'Normalized Demand Velocity Index (0–100 Scale) with P10–P90 Uncertainty Fan'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Includes Oct 2025 structural regime shift marker &amp; +{horizonMonths}m forward
              quantile fan
            </p>
          </div>

          <span className="text-xs font-mono text-slate-500">ID: {forecast.forecast_id}</span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '10px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine
                x="2025-10"
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: 'Oct 2025 Shock',
                  fill: '#fbbf24',
                  fontSize: 11,
                  position: 'insideTopLeft',
                }}
              />
              <ReferenceLine
                x={asOfMonth}
                stroke="#6366f1"
                strokeWidth={2}
                label={{
                  value: `Cutoff (${asOfMonth})`,
                  fill: '#818cf8',
                  fontSize: 11,
                  position: 'insideTopRight',
                }}
              />
              <Area
                type="monotone"
                dataKey="demandP90"
                name="Demand P90 (Upper Bound)"
                stroke="none"
                fill="#f43f5e"
                fillOpacity={0.16}
              />
              <Area
                type="monotone"
                dataKey="demandP10"
                name="Demand P10 (Lower Bound)"
                stroke="none"
                fill="#38bdf8"
                fillOpacity={0.12}
              />
              <Line
                type="monotone"
                dataKey="demandP50"
                name="Demand P50 (Median Forecast)"
                stroke="#f43f5e"
                strokeWidth={2.75}
                dot={{ r: 2 }}
              />
              <Line
                type="stepAfter"
                dataKey="sanctionedMonthly"
                name="Paper Sanctioned Seats (Monthly Eq)"
                stroke="#a855f7"
                strokeWidth={1.75}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="retainedSupply"
                name="Effective Retained Supply (≥6m)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 2: Clean 2-Column Split (6-Stage Supply Pipeline & Phantom Capacity vs Wage & Lead-Time Root Cause) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: 6-Stage Supply Pipeline & Phantom Capacity Bar */}
        <div className="lg:col-span-7 rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                6-Stage Supply Pipeline &amp; Phantom Capacity Bar
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exposes why paper NCVT sanctioned seats ≠ real skilled workers retained at 6 months
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-mono font-semibold">
              Phantom Rate: {phantomPct}%
            </span>
          </div>

          {/* Hatched Phantom Capacity Visual Callout Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-slate-300">
                Paper Sanctioned Capacity ({sp.sanctioned_seats} Seats in {sp.sanctioned_sections}{' '}
                Sections of {sp.section_size})
              </span>
              <span className="font-mono tabular-nums text-purple-300 font-semibold">
                {phantomSeats} Empty Ghost Seats ({phantomPct}%)
              </span>
            </div>

            <div className="w-full h-6 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex">
              <div
                style={{
                  width: `${Math.round(
                    (sp.actual_enrolments * 100) / Math.max(1, sp.sanctioned_seats)
                  )}%`,
                }}
                className="h-full bg-indigo-600 flex items-center justify-center text-[10px] font-mono font-bold text-white"
              >
                Enrolled: {sp.actual_enrolments}
              </div>
              <div
                style={{
                  width: `${Math.round((phantomSeats * 100) / Math.max(1, sp.sanctioned_seats))}%`,
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(168,85,247,0.28) 0px, rgba(168,85,247,0.28) 8px, rgba(15,23,42,0.9) 8px, rgba(15,23,42,0.9) 16px)',
                }}
                className="h-full flex items-center justify-center text-[10px] font-mono font-semibold text-purple-200 border-l border-purple-500/40"
              >
                PHANTOM GHOST ZONE ({phantomPct}%)
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>
                Unutilized ITI seats (reaches ~48.0% Phantom Capacity in legacy Data Entry trades).
              </span>
              <span className="font-mono tabular-nums text-emerald-300">
                6m Yield: {Math.round((sp.retained_6m * 100) / Math.max(1, sp.sanctioned_seats))}%
              </span>
            </div>
          </div>

          {/* 6-Stage Horizontal Bars */}
          <div className="space-y-2">
            {pipelineStages.map((stg, idx) => (
              <div
                key={idx}
                onClick={() =>
                  onInspectEvidence?.(
                    stg.step,
                    `${stg.count} Candidates (${stg.pctOfSanctioned}% of Sanctioned)`,
                    forecast.forecast_id
                  )
                }
                className="cursor-pointer p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">{stg.step}</span>
                  <span className="font-mono tabular-nums font-bold text-slate-200">
                    {stg.count} <span className="text-slate-500">({stg.pctOfSanctioned}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stg.color}`}
                    style={{ width: `${Math.min(100, stg.pctOfSanctioned)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400">{stg.note}</div>
              </div>
            ))}
          </div>

          {/* Unplaced Prior-Cohort Backlog Stock */}
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-indigo-300">
                Unplaced Prior-Cohort Backlog Stock (Fast-Track Donor Pool)
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Certified graduates from prior batches available for 45–90 day SkillBridge
                reactivation.
              </p>
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-indigo-300 shrink-0">
              {sp.unplaced_backlog_stock}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Wage Competitiveness & Lead-Time Root Cause */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4">
            <div className="border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Wage Competitiveness &amp; Lead-Time Root Cause
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Structural diagnostics explaining local attrition and training lag
              </p>
            </div>

            {/* Diagnostic 1: Wage Competitiveness vs Local Gig Economy */}
            <div
              className={`p-4 rounded-xl border space-y-2.5 ${
                wd.wage_competitiveness_ratio < 1.0
                  ? 'bg-amber-950/15 border-amber-500/35'
                  : 'bg-emerald-950/15 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  1. Wage Competitiveness Ratio (W)
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-mono tabular-nums font-bold ${
                    wd.wage_competitiveness_ratio < 1.0
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-emerald-500/15 text-emerald-300'
                  }`}
                >
                  {wd.wage_competitiveness_ratio.toFixed(2)}x ({wd.attrition_risk_level} RISK)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono tabular-nums">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">Offered Trade Wage</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    ₹{wd.offered_trade_wage_inr.toLocaleString()}/mo
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">Local Gig / Alt Wage</div>
                  <div className="text-sm font-bold text-amber-300 mt-0.5">
                    ₹{wd.local_alternative_gig_wage_inr.toLocaleString()}/mo
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{wd.explanation}</p>
            </div>

            {/* Diagnostic 2: Training Lead-Time vs Demand Window */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-300">
                  2. SkillClock Lead-Time Mismatch
                </span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Standard DGT CTS batch duration is{' '}
                <strong className="text-white">{forecast.training_duration_months} months</strong>.
                {forecast.bridge_duration_days ? (
                  <>
                    {' '}
                    Deploying a PMKVY 4.0 SkillBridge module reskills adjacent donor graduates in{' '}
                    <strong className="text-emerald-300">{forecast.bridge_duration_days} days</strong>,
                    meeting the current 12-month demand surge on time.
                  </>
                ) : (
                  ' Direct seat reallocation or NAPS stipend alignment recommended.'
                )}
              </p>
            </div>

            {/* Diagnostic 3: AI Recommended Intervention */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-1.5">
              <div className="text-xs font-semibold text-amber-300">
                3. Recommended District Policy Action
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {forecast.recommended_intervention}
              </p>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab?.('s06_skillclock')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition"
            >
              <Clock className="w-4 h-4" />
              <span>Lead-Time Clock (S06)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab?.('s05_skillbridge')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition"
            >
              <Users className="w-4 h-4" />
              <span>SkillBridge (S05)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastDetailView;
