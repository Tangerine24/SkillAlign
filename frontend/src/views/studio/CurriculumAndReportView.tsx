import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Edit3,
  FileSpreadsheet,
  FileText,
  Printer,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import apiClient from '../../api/client';
import type {
  EmergingSkillNode,
  PolicyReportResponse,
  SkillGenomeResponse,
} from '../../types/contract';
import { getDictionary, type LanguageMode } from './studioTranslations';

export interface CurriculumAndReportViewProps {
  districtId?: string;
  occupationId?: string;
  scenarioId?: string;
  language?: LanguageMode;
  onInspectEvidence?: (label: string, value: string, forecastId?: string) => void;
}

type SSCReviewState = 'PENDING_SSC' | 'APPROVED_MICRO_CRED' | 'EDITED_NOS' | 'REJECTED_NOISE';
type S09Tab = 'gazette' | 'drift' | 'api';

export const CurriculumAndReportView: React.FC<CurriculumAndReportViewProps> = ({
  districtId = 'rewa',
  occupationId = 'occ_solar_pv',
  scenarioId,
  language = 'EN',
  onInspectEvidence,
}) => {
  const [lang, setLang] = useState<LanguageMode>(language);
  useEffect(() => {
    setLang(language);
  }, [language]);
  const d = getDictionary(lang);

  const effectiveScenarioId = scenarioId || `scen_${districtId}_2026`;

  const [activeTab, setActiveTab] = useState<S09Tab>('gazette');
  const [genomeData, setGenomeData] = useState<SkillGenomeResponse | null>(null);
  const [reportData, setReportData] = useState<PolicyReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // SSC Review workflow state keyed by skill_id
  const [sscStatus, setSscStatus] = useState<Record<string, SSCReviewState>>({});
  const [customHours, setCustomHours] = useState<Record<string, number>>({});
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  // API Inspector copy state
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [gRes, rRes] = await Promise.all([
          apiClient.getSkillGenome(occupationId),
          apiClient.getPolicyReport(effectiveScenarioId),
        ]);
        if (!active) return;
        setGenomeData(gRes);
        setReportData(rRes);

        const initialStatus: Record<string, SSCReviewState> = {};
        const initialHours: Record<string, number> = {};
        gRes.occupation.emerging_unmapped_skills.forEach((sk, idx) => {
          initialStatus[sk.skill_id] = idx === 0 ? 'APPROVED_MICRO_CRED' : 'PENDING_SSC';
          initialHours[sk.skill_id] = sk.estimated_upskill_hours;
        });
        setSscStatus((prev) => ({ ...initialStatus, ...prev }));
        setCustomHours((prev) => ({ ...initialHours, ...prev }));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [occupationId, effectiveScenarioId]);

  const handleDownloadCsv = () => {
    if (!reportData) return;
    const headers = [
      'Order_Category',
      'District',
      'Source_Or_Pathway',
      'Target_Or_Module_Code',
      'Section_Size_Or_Days',
      'Sections_Or_Batch_Headcount',
      'Total_Seats_Or_Placements',
      'Total_Cost_INR',
      'Implementation_Window',
    ];

    const seatRows = reportData.ncvt_seat_orders.map((s) => [
      'NCVT_SEAT_REALLOCATION',
      s.district_name,
      `${s.from_trade} (${s.from_nco})`,
      `${s.to_trade} (${s.to_nco})`,
      String(s.section_size),
      String(s.sections_reallocated),
      String(s.seats_reallocated),
      String(
        Math.round(
          reportData.budget_summary.seat_conversion_capex_inr /
            Math.max(1, reportData.ncvt_seat_orders.length)
        )
      ),
      s.implementation_window,
    ]);

    const bridgeRows = reportData.pmkvy_bridge_orders.map((b) => [
      'PMKVY_SKILLBRIDGE_BATCH',
      b.district_name,
      b.pathway_name,
      b.module_code,
      `${b.duration_days} Days`,
      String(b.batch_headcount),
      String(b.expected_placements),
      String(b.total_cost_inr),
      'Immediate 45-90 Day Fast-Track',
    ]);

    const csvLines = [
      headers.join(','),
      ...seatRows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')),
      ...bridgeRows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')),
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SkillAlign_Policy_Order_${effectiveScenarioId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    if (!reportData) return;
    navigator.clipboard.writeText(
      JSON.stringify(
        {
          endpoint: `/api/v1/reports/${effectiveScenarioId}`,
          report: reportData,
          curriculum_drift: genomeData?.curriculum_drift_summary,
        },
        null,
        2
      )
    );
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  if (loading || !genomeData || !reportData) {
    return (
      <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 animate-pulse">
        Loading S09 Curriculum Drift Radar &amp; Sovereign Policy Order Brief...
      </div>
    );
  }

  const occ = genomeData.occupation;
  const drift = genomeData.curriculum_drift_summary;

  return (
    <div className="space-y-5 text-slate-100">
      {/* Compact Studio Action Bar + 3-Tab Segmented Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            {d.s09Title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{d.s09Subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 3-Tab Segmented Switcher */}
          <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('gazette')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === 'gazette'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Official Gazette Policy Brief
            </button>
            <button
              onClick={() => setActiveTab('drift')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === 'drift'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              NSQF Curriculum Drift &amp; SSC Review
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === 'api'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              Live API Payload
            </button>
          </div>

          {/* Export Action Buttons */}
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Download CSV
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Gazette Brief
          </button>
        </div>
      </div>

      {/* TAB 1: Official Gazette Policy Brief (Print-Ready) */}
      {activeTab === 'gazette' && (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-6 lg:p-8 shadow-xl print:bg-white print:text-black print:border-black space-y-6">
          <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono font-semibold tracking-wider uppercase text-amber-400">
                {d.sovereignHeader}
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{reportData.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Issuing Authority: {reportData.issuing_authority} • Report ID:{' '}
                <span className="font-mono text-slate-300">{reportData.report_id}</span>
              </p>
            </div>
            <div className="text-left md:text-right text-xs font-mono text-slate-400 space-y-0.5">
              <div>STATE: {reportData.target_state.toUpperCase()}</div>
              <div>SCENARIO: {reportData.scenario_id}</div>
              <div>DATE: {reportData.generated_at.slice(0, 10)}</div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Executive Policy Directive Summary
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{reportData.executive_summary}</p>
            <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
              {reportData.key_findings.map((kf, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{kf}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Schedule A: NCVT Seat Reallocation Orders */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Schedule A — NCVT ITI Section Conversion Orders (Strict 20/24/40 Seat Multiples)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">District</th>
                    <th className="py-2.5 px-3 font-medium">Donor Trade (From)</th>
                    <th className="py-2.5 px-3 font-medium">Target Trade (To)</th>
                    <th className="py-2.5 px-3 text-right font-medium">Section Size</th>
                    <th className="py-2.5 px-3 text-right font-medium">Sections</th>
                    <th className="py-2.5 px-3 text-right font-medium">Total Seats</th>
                    <th className="py-2.5 px-3 font-medium">Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                  {reportData.ncvt_seat_orders.map((ord, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-medium text-white">{ord.district_name}</td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {ord.from_trade}{' '}
                        <span className="font-mono text-slate-500">({ord.from_nco})</span>
                      </td>
                      <td className="py-2.5 px-3 text-emerald-300 font-medium">
                        {ord.to_trade}{' '}
                        <span className="font-mono text-slate-400">({ord.to_nco})</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        {ord.section_size} seats
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-amber-300">
                        {ord.sections_reallocated}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400">
                        {ord.seats_reallocated}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{ord.implementation_window}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schedule B: PMKVY 4.0 SkillBridge Orders */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Schedule B — PMKVY 4.0 SkillBridge Fast-Track Conversion Batches
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">District</th>
                    <th className="py-2.5 px-3 font-medium">Transition Pathway</th>
                    <th className="py-2.5 px-3 font-medium">Module Code</th>
                    <th className="py-2.5 px-3 text-right font-medium">Duration</th>
                    <th className="py-2.5 px-3 text-right font-medium">Headcount</th>
                    <th className="py-2.5 px-3 text-right font-medium">Total Cost</th>
                    <th className="py-2.5 px-3 text-right font-medium">Expected Placements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                  {reportData.pmkvy_bridge_orders.map((br, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-medium text-white">{br.district_name}</td>
                      <td className="py-2.5 px-3 text-slate-200">{br.pathway_name}</td>
                      <td className="py-2.5 px-3 font-mono text-sky-400">{br.module_code}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-300">
                        {br.duration_days}d
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-white">
                        {br.batch_headcount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                        ₹{(br.total_cost_inr / 100000).toFixed(2)}L
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400">
                        {br.expected_placements}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Budget & Impact Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Total Sanctioned Outlay</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                ₹{(reportData.budget_summary.total_allocation_inr / 100000).toFixed(2)}L
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400">SkillBridge Training OPEX</div>
              <div className="text-lg font-bold font-mono text-sky-400 mt-0.5">
                ₹{(reportData.budget_summary.skillbridge_training_opex_inr / 100000).toFixed(2)}L
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Projected 12m Placements</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {reportData.budget_summary.projected_12m_placements} Workers
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Effective Cost / Placement</div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                ₹{reportData.budget_summary.effective_cost_per_placement_inr.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Governance Footnotes */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[11px] text-slate-400">
            <div className="space-y-1">
              {reportData.governance_disclaimers.map((disc, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{disc}</span>
                </div>
              ))}
            </div>
            <div className="font-mono text-slate-500 shrink-0">
              SIGNED BY: DISTRICT SKILL COMMITTEE • MP PILOT
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NSQF Curriculum Drift & SSC Review */}
      {activeTab === 'drift' && (
        <div className="space-y-5">
          {/* 3 Drift KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() =>
                onInspectEvidence?.(
                  `${occ.occupation_name} Curriculum Drift Score`,
                  `${drift.overall_drift_score}/100`,
                  `fc_${districtId}_${occupationId}_2026-10`
                )
              }
              className="cursor-pointer rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-amber-500/40 p-4 transition"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{d.curriculumDrift}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400 mt-1.5 font-mono">
                {drift.overall_drift_score}
                <span className="text-sm text-slate-500 font-normal"> / 100</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                QP <span className="font-mono text-slate-200">{occ.qp_code}</span> • Last Revision:{' '}
                <strong className="text-slate-200">{drift.last_nsqf_revision_year}</strong>
              </p>
            </div>

            <div
              onClick={() =>
                onInspectEvidence?.(
                  'Unmapped Employer Demand Share',
                  `${drift.unmapped_demand_share_pct}%`,
                  `fc_${districtId}_${occupationId}_2026-10`
                )
              }
              className="cursor-pointer rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-sky-500/40 p-4 transition"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{d.unmappedDemand}</span>
                <AlertTriangle className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-sky-400 mt-1.5 font-mono">
                {drift.unmapped_demand_share_pct}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Live district job postings requiring tools missing from legacy DGT CTS syllabus.
              </p>
            </div>

            <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{d.sscWorkflow}</span>
                <Award className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1.5 font-mono">
                {
                  Object.values(sscStatus).filter(
                    (st) => st === 'APPROVED_MICRO_CRED' || st === 'EDITED_NOS'
                  ).length
                }{' '}
                / {occ.emerging_unmapped_skills.length} Approved
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Approved micro-credentials attach directly to PMKVY 4.0 RPL &amp; NCVT addendums.
              </p>
            </div>
          </div>

          {/* SSC Interactive Review Cards */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-800/80">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  {d.emergingSkills} — {occ.occupation_name} (NCO {occ.nco_code})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sector Skill Council (SSC) Human-in-the-Loop review of emerging employer skill requirements.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                {occ.sector} • NSQF Level {occ.nsqf_level}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {occ.emerging_unmapped_skills.map((sk: EmergingSkillNode) => {
                const st = sscStatus[sk.skill_id] || 'PENDING_SSC';
                const hrs = customHours[sk.skill_id] ?? sk.estimated_upskill_hours;
                const isEditing = editingSkillId === sk.skill_id;

                return (
                  <div
                    key={sk.skill_id}
                    className={`rounded-xl p-4 border transition flex flex-col justify-between gap-3 ${
                      st === 'APPROVED_MICRO_CRED' || st === 'EDITED_NOS'
                        ? 'bg-slate-950/70 border-emerald-500/40'
                        : st === 'REJECTED_NOISE'
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-950/60 border-slate-800/80'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              +{sk.posting_mention_growth_yoy_pct}% YoY
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400">
                              {sk.current_nsqf_coverage}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white mt-2">{sk.skill_name}</h4>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border shrink-0 ${
                            st === 'APPROVED_MICRO_CRED'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : st === 'EDITED_NOS'
                              ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                              : st === 'REJECTED_NOISE'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {st === 'APPROVED_MICRO_CRED'
                            ? 'APPROVED'
                            : st === 'EDITED_NOS'
                            ? 'CUSTOM HOURS'
                            : st === 'REJECTED_NOISE'
                            ? 'REJECTED'
                            : 'PENDING'}
                        </span>
                      </div>

                      {/* Snippets */}
                      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">
                          Vacancy Evidence ({sk.employer_demand_share_pct}% Share):
                        </div>
                        {sk.sample_job_snippets.map((snip, i) => (
                          <p key={i} className="italic text-slate-300 text-[11px]">
                            &ldquo;{snip}&rdquo;
                          </p>
                        ))}
                      </div>

                      {/* Plug-In Micro-Credential */}
                      <div className="flex items-center justify-between gap-2 text-xs bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800/80">
                        <div className="truncate">
                          <span className="text-slate-400">Micro-Credential: </span>
                          <span className="font-medium text-emerald-300">
                            {sk.recommended_micro_credential}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-slate-400 text-[11px]">Hours:</span>
                          {isEditing ? (
                            <input
                              type="number"
                              min={10}
                              max={120}
                              step={5}
                              value={hrs}
                              onChange={(e) =>
                                setCustomHours((prev) => ({
                                  ...prev,
                                  [sk.skill_id]: Number(e.target.value) || 30,
                                }))
                              }
                              className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-sky-500 text-white font-mono text-xs"
                            />
                          ) : (
                            <span className="font-mono font-semibold text-white">{hrs}h</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SSC Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/70">
                      <button
                        onClick={() => {
                          setSscStatus((prev) => ({ ...prev, [sk.skill_id]: 'APPROVED_MICRO_CRED' }));
                          setEditingSkillId(null);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>

                      {isEditing ? (
                        <button
                          onClick={() => {
                            setSscStatus((prev) => ({ ...prev, [sk.skill_id]: 'EDITED_NOS' }));
                            setEditingSkillId(null);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Save Hours
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingSkillId(sk.skill_id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                          Edit Hours
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSscStatus((prev) => ({ ...prev, [sk.skill_id]: 'REJECTED_NOISE' }));
                          setEditingSkillId(null);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Live API Payload (/api/v1/reports) */}
      {activeTab === 'api' && (
        <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
              <Code2 className="w-4 h-4" />
              <span>GET /api/v1/reports/{effectiveScenarioId} • HTTP 200 OK</span>
            </div>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              {copiedJson ? 'Copied JSON!' : 'Copy Payload'}
            </button>
          </div>
          <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-4 rounded-xl overflow-x-auto max-h-[540px] border border-slate-800/80">
            {JSON.stringify(
              {
                endpoint: `/api/v1/reports/${effectiveScenarioId}`,
                report: reportData,
                curriculum_drift: drift,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CurriculumAndReportView;
