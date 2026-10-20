import React, { useEffect, useState } from 'react';
import {
  Activity,
  Database,
  Filter,
  Lock,
  ShieldCheck,
  X,
} from 'lucide-react';
import apiClient from '../api/client';
import type { EvidenceResponse, RealOrSyntheticFlag } from '../types/contract';

export interface EvidenceXRayTarget {
  label: string;
  value: string;
  forecastId: string;
}

export interface EvidenceXRayDrawerProps {
  target: EvidenceXRayTarget | null;
  onClose: () => void;
}

function getFlagBadge(flag: RealOrSyntheticFlag) {
  switch (flag) {
    case 'OBSERVED_PUBLIC_ANCHOR':
      return {
        text: 'OBSERVED PUBLIC',
        cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };
    case 'DERIVED_ESTIMATE':
      return {
        text: 'CLUSTER-POOLED',
        cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      };
    default:
      return {
        text: 'PILOT FEED',
        cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
  }
}

export const EvidenceXRayDrawer: React.FC<EvidenceXRayDrawerProps> = ({ target, onClose }) => {
  const [evidence, setEvidence] = useState<EvidenceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!target) return;
    let active = true;
    setLoading(true);
    apiClient
      .getEvidence(target.forecastId)
      .then((res) => {
        if (active) setEvidence(res);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [target, onClose]);

  if (!target) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="relative w-full max-w-xl bg-[#0B0F19] border-l border-slate-800/90 h-full overflow-y-auto p-6 text-slate-100 shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-5">
          {/* Drawer Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  Evidence X-Ray • Lineage Inspector
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">{target.label}</h3>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                  {target.value}
                </span>
                <span className="text-xs font-mono text-slate-500">ID: {target.forecastId}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
              aria-label="Close Evidence X-Ray Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {loading || !evidence ? (
            <div className="py-12 text-center text-sm text-slate-400 animate-pulse">
              Inspecting provenance waterfall &amp; NCO-2015 mapping lineage...
            </div>
          ) : (
            <>
              {/* Confidence & Empirical Bayes Guardrail Card */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Statistical Governance &amp; Provenance Tier
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold border ${
                      evidence.confidence_tier === 'Tier 1: Direct'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : evidence.confidence_tier === 'Tier 2: Cluster-Pooled'
                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {evidence.confidence_tier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>EB Shrinkage (α)</span>
                      <span className="font-mono text-[10px] text-indigo-300">
                        D̂ = α·D_loc + (1-α)·D_cl
                      </span>
                    </div>
                    <div className="text-base font-mono tabular-nums font-bold text-white">
                      α = {evidence.eb_shrinkage_weight.toFixed(2)}
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.round(evidence.eb_shrinkage_weight * 100)}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {evidence.neighbor_cluster_name}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                    <div className="text-slate-400">Automated Action Gate</div>
                    <div className="flex items-center gap-1.5 mt-1 font-semibold">
                      {evidence.AutomatedActionAllowed ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-emerald-300">Auto-Order Eligible</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="text-rose-300">Locked (DSC Sign-Off)</span>
                        </>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-1">
                      NCO {evidence.nco_code} • {evidence.district_name}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Step Deduplication & PLFS Debiasing Waterfall */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  4-Step Deduplication &amp; PLFS Debiasing Waterfall
                </div>

                <div className="space-y-2">
                  {evidence.cleaning_waterfall.map((step) => {
                    const badge = getFlagBadge(step.real_or_synthetic);
                    return (
                      <div
                        key={step.step_order}
                        className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white">
                            {step.step_order}. {step.step_name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badge.cls}`}
                          >
                            {badge.text}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                          <span className="text-slate-400">
                            In: <strong className="text-slate-200">{step.input_count}</strong> → Out:{' '}
                            <strong className="text-emerald-300">{step.output_count}</strong>
                          </span>
                          <span
                            className={`font-semibold ${
                              step.delta_pct > 0
                                ? 'text-emerald-400'
                                : step.delta_pct < 0
                                ? 'text-amber-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.delta_pct > 0 ? `+${step.delta_pct}%` : `${step.delta_pct}%`}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{step.rule_applied}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feature Drivers */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Model Attribution &amp; Feature Drivers
                </div>
                <div className="space-y-2">
                  {evidence.feature_drivers.map((drv, i) => {
                    const badge = getFlagBadge(drv.real_or_synthetic);
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-slate-200">
                            {drv.driver_name}
                          </span>
                          <span className="text-xs font-mono tabular-nums font-semibold text-indigo-300">
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
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <span className="text-[11px] text-slate-400">{drv.explanation}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono border shrink-0 ${badge.cls}`}
                          >
                            {badge.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Primary Data Sources Register */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Ingested National &amp; State Data Sources
                </div>
                <div className="space-y-2">
                  {evidence.data_sources.map((src) => {
                    const badge = getFlagBadge(src.real_or_synthetic);
                    return (
                      <div
                        key={src.source_id}
                        className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-white">{src.source_name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badge.cls}`}
                          >
                            {badge.text}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono tabular-nums">
                          <span>{src.refresh_cadence}</span>
                          <span>Dup: {(src.duplicate_rate * 100).toFixed(1)}%</span>
                          <span>Stale: {(src.stale_rate * 100).toFixed(1)}%</span>
                          <span className="text-emerald-300">
                            NCO Conf: {(src.mapping_confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>MSDE / DGT Auditable Provenance Standard v2.6</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close X-Ray
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceXRayDrawer;
