import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  FileSearch,
  Filter,
  Layers,
  Lock,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import apiClient from '../../api/client';
import type {
  DashboardResponse,
  EvidenceResponse,
  RealOrSyntheticFlag,
} from '../../types/contract';
import type { LanguageMode } from '../studio/studioTranslations';

export interface EvidenceLedgerViewProps {
  districtId?: string;
  occupationId?: string;
  asOfMonth?: string;
  language?: LanguageMode;
  onInspectEvidence?: (label: string, value: string, forecastId: string) => void;
}

interface AmbiguousMappingItem {
  id: string;
  rawJobTitle: string;
  district: string;
  sourcePortal: string;
  suggestedNco: string;
  suggestedTrade: string;
  cosineConfidence: number;
  alternativeNco: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const INITIAL_AMBIGUOUS_QUEUE: AmbiguousMappingItem[] = [
  {
    id: 'amb_01',
    rawJobTitle: 'Bijli Karigar & Rooftop Stringing Wireman (Suryaghar EPC)',
    district: 'Rewa',
    sourcePortal: 'NCS Portal + MP Rozgar',
    suggestedNco: '7411.0101',
    suggestedTrade: 'Solar PV Installer (Suryamitra)',
    cosineConfidence: 0.78,
    alternativeNco: '7411.0100 (Electrician General)',
    status: 'PENDING',
  },
  {
    id: 'amb_02',
    rawJobTitle: 'L5 Electric Auto BMS & Traction Motor Troubleshooter',
    district: 'Indore',
    sourcePortal: 'NCS Partner Board Feed',
    suggestedNco: '7231.0105',
    suggestedTrade: 'EV Service Lead Technician',
    cosineConfidence: 0.81,
    alternativeNco: '7231.0101 (Mechanic Motor Vehicle)',
    status: 'PENDING',
  },
  {
    id: 'amb_03',
    rawJobTitle: 'Fanuc VMC Setter cum Offset Operator (Richhai MSME)',
    district: 'Jabalpur',
    sourcePortal: 'NCS + DistrictDIC Survey',
    suggestedNco: '7223.0501',
    suggestedTrade: 'CNC Programmer & Setter',
    cosineConfidence: 0.74,
    alternativeNco: '7223.0100 (Turner / Machinist)',
    status: 'APPROVED',
  },
  {
    id: 'amb_04',
    rawJobTitle: 'MIS Back-Office Tally & Excel Operator',
    district: 'Ujjain',
    sourcePortal: 'MP Rozgar Portal',
    suggestedNco: '4132.0402',
    suggestedTrade: 'Domestic Data Entry Operator',
    cosineConfidence: 0.69,
    alternativeNco: '4110.0100 (General Office Clerk)',
    status: 'PENDING',
  },
];

function getProvenanceBadge(flag: RealOrSyntheticFlag) {
  switch (flag) {
    case 'OBSERVED_PUBLIC_ANCHOR':
      return {
        label: 'OBSERVED PUBLIC DATA',
        cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };
    case 'DERIVED_ESTIMATE':
      return {
        label: 'TIER-2 CLUSTER-POOLED',
        cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      };
    default:
      return {
        label: 'PILOT FEED',
        cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
  }
}

export const EvidenceLedgerView: React.FC<EvidenceLedgerViewProps> = ({
  districtId = 'rewa',
  occupationId = 'occ_solar_pv',
  asOfMonth = '2026-10',
  language = 'EN',
  onInspectEvidence,
}) => {
  const forecastId = `fc_${districtId}_${occupationId}_${asOfMonth}`;
  const [evidence, setEvidence] = useState<EvidenceResponse | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mappingQueue, setMappingQueue] = useState<AmbiguousMappingItem[]>(INITIAL_AMBIGUOUS_QUEUE);
  const [activeTab, setActiveTab] = useState<'WATERFALL' | 'SOURCES' | 'STEWARD_QUEUE'>(
    'WATERFALL'
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      apiClient.getEvidence(forecastId),
      apiClient.getDashboard({ as_of_month: asOfMonth }),
    ])
      .then(([evRes, dbRes]) => {
        if (!active) return;
        setEvidence(evRes);
        setDashboard(dbRes);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [forecastId, asOfMonth]);

  const handleMappingDecision = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setMappingQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  if (loading || !evidence || !dashboard) {
    return (
      <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 text-sm animate-pulse">
        Loading S02 Data Provenance &amp; Evidence Ledger...
      </div>
    );
  }

  const pendingCount = mappingQueue.filter((m) => m.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Compact Context & Governance Strip */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="font-bold text-white text-sm">
              {evidence.district_name} — {evidence.occupation_name}
            </span>
            <span className="font-mono text-slate-400">(NCO {evidence.nco_code})</span>
          </div>

          <span className="px-2 py-0.5 rounded-md font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            {evidence.confidence_tier} • α = {evidence.eb_shrinkage_weight.toFixed(2)}
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-semibold border ${
              evidence.AutomatedActionAllowed
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
          >
            {evidence.AutomatedActionAllowed ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Auto-Action Eligible
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Requires DSC Override
              </>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            onInspectEvidence?.(
              `${evidence.district_name} ${evidence.occupation_name} Full Lineage`,
              `${evidence.confidence_tier} (α=${evidence.eb_shrinkage_weight})`,
              forecastId
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition self-start lg:self-auto"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Open Slide-Out X-Ray ({forecastId})</span>
        </button>
      </div>

      {/* 3-Tab Segmented Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex flex-wrap rounded-xl bg-slate-900/80 p-1 border border-slate-800/80 gap-1"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'WATERFALL'}
            onClick={() => setActiveTab('WATERFALL')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'WATERFALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>
              {language === 'HI'
                ? '1. डी-डुप्लिकेशन एवं PLFS फ़नल'
                : '1. Deduplication & PLFS Waterfall'}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'SOURCES'}
            onClick={() => setActiveTab('SOURCES')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'SOURCES'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {language === 'HI'
                ? '2. आधिकारिक डेटा स्रोत पंजिका'
                : '2. Official Data Source Register'}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'STEWARD_QUEUE'}
            onClick={() => setActiveTab('STEWARD_QUEUE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'STEWARD_QUEUE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>
              {language === 'HI'
                ? `3. NCO-2015 मानवीय समीक्षा (${pendingCount})`
                : `3. NCO-2015 Steward Review Queue (${pendingCount})`}
            </span>
          </button>
        </div>

        <span className="text-xs font-mono text-slate-500">
          Zero Black-Box Provenance • Cutoff {evidence.as_of_month}
        </span>
      </div>

      {/* TAB 1: Deduplication & PLFS Waterfall + Empirical Bayes Attribution */}
      {activeTab === 'WATERFALL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left 7 Cols: 4-Stage Cleaning & PLFS Expansion Waterfall */}
          <div className="lg:col-span-7 rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-400" />
                  4-Step Vacancy Deduplication &amp; PLFS Debiasing Waterfall
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Corrects online portal white-collar bias using MoSPI PLFS informal capture rate (π_tier)
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">{evidence.as_of_month}</span>
            </div>

            <div className="space-y-2.5">
              {evidence.cleaning_waterfall.map((step) => {
                const badge = getProvenanceBadge(step.real_or_synthetic);
                return (
                  <div
                    key={step.step_order}
                    onClick={() =>
                      onInspectEvidence?.(
                        step.step_name,
                        `${step.output_count} Workers (${step.delta_pct > 0 ? '+' : ''}${step.delta_pct}%)`,
                        forecastId
                      )
                    }
                    className="cursor-pointer p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">
                        Step {step.step_order}: {step.step_name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs font-mono tabular-nums">
                      <span className="text-slate-400">
                        Input: <strong className="text-slate-200">{step.input_count}</strong> → Output:{' '}
                        <strong className="text-emerald-300 text-sm">{step.output_count}</strong>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-semibold ${
                          step.delta_pct > 0
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : step.delta_pct < 0
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {step.delta_pct > 0 ? `+${step.delta_pct}%` : `${step.delta_pct}%`}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">{step.rule_applied}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols: Empirical Bayes Shrinkage & Feature Attribution */}
          <div className="lg:col-span-5 rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Empirical Bayes Small-Area Shrinkage &amp; Drivers
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stabilizes sparse district estimates by pooling with {evidence.neighbor_cluster_name}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Shrinkage Estimator:</span>
                  <span className="font-mono text-indigo-300 font-semibold">
                    D̂ = α·D_local + (1-α)·D_cluster
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Weight (α):</span>
                  <span className="font-mono tabular-nums text-white font-semibold">
                    α = {evidence.eb_shrinkage_weight.toFixed(2)} ({evidence.confidence_tier})
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {evidence.feature_drivers.map((drv, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{drv.driver_name}</span>
                      <span className="font-mono tabular-nums font-bold text-amber-300">
                        {drv.contribution_pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          drv.direction === 'POSITIVE'
                            ? 'bg-emerald-500'
                            : drv.direction === 'NEGATIVE'
                            ? 'bg-rose-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, drv.contribution_pct * 2)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">{drv.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 space-y-1.5">
              {evidence.audit_notes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Official 5-Source Data Provenance Register */}
      {activeTab === 'SOURCES' && (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Official 5-Source National &amp; State Data Provenance Register
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Explicitly distinguishes Observed Public Anchors (MoSPI PLFS, DGT NCVT, SIDH) from
                Pilot Feeds
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">Source Name &amp; ID</th>
                  <th className="py-3 px-3.5">Issuing Publisher</th>
                  <th className="py-3 px-3.5">Refresh Cadence</th>
                  <th className="py-3 px-3.5 text-right">Duplicate Purge</th>
                  <th className="py-3 px-3.5 text-right">Stale Purge</th>
                  <th className="py-3 px-3.5 text-right">NCO Mapping Conf</th>
                  <th className="py-3 px-3.5">Provenance Tier</th>
                  <th className="py-3 px-3.5">Coverage Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-900/30">
                {evidence.data_sources.map((src) => {
                  const badge = getProvenanceBadge(src.real_or_synthetic);
                  return (
                    <tr key={src.source_id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-white">{src.source_name}</div>
                        <div className="font-mono text-[10px] text-slate-500">{src.source_id}</div>
                      </td>
                      <td className="py-3 px-3.5 text-slate-300">{src.publisher}</td>
                      <td className="py-3 px-3.5 font-mono text-slate-300">{src.refresh_cadence}</td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-amber-300">
                        {(src.duplicate_rate * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-amber-300">
                        {(src.stale_rate * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-emerald-300">
                        {(src.mapping_confidence * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-400 max-w-xs">{src.coverage_notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: NCO-2015 Steward Review Queue */}
      {activeTab === 'STEWARD_QUEUE' && (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-amber-400" />
                Ambiguous Job Posting → NCO-2015 Steward Review Queue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Vacancies with NLP cosine similarity between 0.65 and 0.82 require human steward
                sign-off before entering Tier-1 demand counts
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 self-start sm:self-auto">
              {pendingCount} Pending Steward Review
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mappingQueue.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition ${
                  item.status === 'APPROVED'
                    ? 'bg-emerald-950/15 border-emerald-500/35'
                    : item.status === 'REJECTED'
                    ? 'bg-rose-950/15 border-rose-500/30 opacity-75'
                    : 'bg-slate-950/70 border-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.district} • {item.sourcePortal}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      &ldquo;{item.rawJobTitle}&rdquo;
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      item.status === 'APPROVED'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'REJECTED'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Primary NLP Match:</span>
                    <span className="font-mono font-semibold text-emerald-300">
                      {item.suggestedTrade} ({item.suggestedNco})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cosine Similarity / Fallback:</span>
                    <span className="font-mono tabular-nums text-slate-300">
                      {(item.cosineConfidence * 100).toFixed(0)}% • Alt: {item.alternativeNco}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMappingDecision(item.id, 'APPROVED')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve NCO {item.suggestedNco}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMappingDecision(item.id, 'REJECTED')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Route to Fallback NCO</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceLedgerView;
