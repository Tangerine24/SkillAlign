import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Shield,
  Zap,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Layers,
  Briefcase,
} from 'lucide-react';
import apiClient from '../../api/client';
import type {
  SkillBridgePathway,
  OccupationGenomeRecord,
  NOSCompetencyNode,
} from '../../types/contract';
import { getDictionary, type LanguageMode } from './studioTranslations';

export interface SkillBridgeViewProps {
  districtId?: string;
  language?: LanguageMode;
  onSendToSkillClock?: (pathway: SkillBridgePathway, batchSize: number) => void;
  onNavigateTab?: (tabKey: string) => void;
}

export const SkillBridgeView: React.FC<SkillBridgeViewProps> = ({
  districtId = 'rewa',
  language = 'EN',
  onSendToSkillClock,
  onNavigateTab,
}) => {
  const [lang, setLang] = useState<LanguageMode>(language);
  useEffect(() => {
    setLang(language);
  }, [language]);
  const d = getDictionary(lang);

  const [pathways, setPathways] = useState<SkillBridgePathway[]>([]);
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>('sb_elec_to_solar');
  const [loading, setLoading] = useState<boolean>(true);
  const [blueprintTab, setBlueprintTab] = useState<'diff' | 'nos'>('diff');

  // Donor Conservation Meter state
  const [batchSize, setBatchSize] = useState<number>(140);
  const [safetyFloorPct, setSafetyFloorPct] = useState<number>(55);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Full occupation genome cache for source & target
  const [sourceGenome, setSourceGenome] = useState<OccupationGenomeRecord | null>(null);
  const [targetGenome, setTargetGenome] = useState<OccupationGenomeRecord | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await apiClient.getSkillBridgePathways({ district_id: districtId });
        setPathways(res.pathways);
        if (res.pathways.length > 0 && !res.pathways.find((p) => p.pathway_id === selectedPathwayId)) {
          setSelectedPathwayId(res.pathways[0].pathway_id);
        }
      } catch (err) {
        console.error('Failed to load pathways', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [districtId]);

  const activePathway = useMemo(() => {
    return pathways.find((p) => p.pathway_id === selectedPathwayId) || pathways[0];
  }, [pathways, selectedPathwayId]);

  useEffect(() => {
    if (!activePathway) return;
    async function loadGenomes() {
      try {
        const [srcRes, tgtRes] = await Promise.all([
          apiClient.getSkillGenome(activePathway.source_occupation_id),
          apiClient.getSkillGenome(activePathway.target_occupation_id),
        ]);
        setSourceGenome(srcRes.occupation);
        setTargetGenome(tgtRes.occupation);
      } catch (err) {
        console.error('Failed to load genome records', err);
      }
    }
    loadGenomes();
  }, [activePathway]);

  // Calculations for Donor Pool Conservation Meter
  const donorPoolTotal = activePathway ? activePathway.available_donor_pool : 600;
  const minimumSafetyFloorCount = Math.round(donorPoolTotal * (safetyFloorPct / 100));
  const remainingDonorPool = Math.max(0, donorPoolTotal - batchSize);
  const isFloorViolated = remainingDonorPool < minimumSafetyFloorCount;
  const remainingBufferPct = donorPoolTotal > 0
    ? Math.round(((remainingDonorPool - minimumSafetyFloorCount) / donorPoolTotal) * 100)
    : 0;

  const handleSendToSimulator = (targetTab: 'skillclock' | 'simulator' = 'skillclock') => {
    if (activePathway) {
      if (onSendToSkillClock) {
        onSendToSkillClock(activePathway, batchSize);
      }
      setToastMessage(
        `Pathway '${activePathway.bridge_module_code}' (${batchSize} candidates) dispatched to ${
          targetTab === 'simulator' ? 'Policy Simulator (S07)' : 'SkillClock Race (S06)'
        }.`
      );
      setTimeout(() => setToastMessage(null), 3500);
      if (onNavigateTab) {
        setTimeout(() => onNavigateTab(targetTab), 750);
      }
    }
  };

  return (
    <div className="space-y-5 text-slate-100">
      {/* Compact Studio Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            {d.s05Title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{d.s05Subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900 text-emerald-400 border border-slate-800 animate-pulse">
              Syncing...
            </span>
          )}
          <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setBlueprintTab('diff')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                blueprintTab === 'diff'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Competency Blueprint
            </button>
            <button
              onClick={() => setBlueprintTab('nos')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                blueprintTab === 'nos'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              NOS Node Matrix
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="px-3.5 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Horizontal Pathway Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {pathways.map((p) => {
          const isActive = p.pathway_id === selectedPathwayId;
          return (
            <button
              key={p.pathway_id}
              onClick={() => setSelectedPathwayId(p.pathway_id)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                isActive
                  ? 'bg-slate-900 border-emerald-500/50 ring-1 ring-emerald-500/20'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white truncate">
                  <span className="truncate">{p.source_occupation_name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-emerald-400 truncate">{p.target_occupation_name}</span>
                </div>
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded shrink-0 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {p.skill_overlap_pct}% Overlap
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                <span>{p.bridge_duration_days}d Bridge ({p.bridge_hours}h)</span>
                <span>₹{p.bridge_cost_per_candidate_inr.toLocaleString()}/trainee</span>
                <span className="text-slate-300">Pool: {p.available_donor_pool}</span>
              </div>
            </button>
          );
        })}
      </div>

      {activePathway && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Competency Bridge Blueprint (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Compact 4-KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">NOS Overlap</span>
                <span className="text-lg font-semibold font-mono text-emerald-400 mt-0.5 block">
                  {activePathway.skill_overlap_pct}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">{d.leadTimeSaved}</span>
                <span className="text-lg font-semibold font-mono text-white mt-0.5 block">
                  {activePathway.lead_time_saved_months} mos
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">{d.placementRate}</span>
                <span className="text-lg font-semibold font-mono text-slate-200 mt-0.5 block">
                  {Math.round(activePathway.projected_placement_rate * 100)}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">{d.wageUplift}</span>
                <span className="text-lg font-semibold font-mono text-amber-400 mt-0.5 block">
                  +₹{activePathway.expected_wage_uplift_inr.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Competency Bridge Card */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    {activePathway.source_occupation_name} &rarr; {activePathway.target_occupation_name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    NCO {activePathway.source_nco_code} to NCO {activePathway.target_nco_code} • NSQF Level {activePathway.target_nsqf_level}
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                  {activePathway.bridge_module_code}
                </span>
              </div>

              {blueprintTab === 'diff' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Shared NOS Foundation */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {d.sharedCompetencies}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        RPL Credited
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Prior competencies verified from donor ITI certification; waived from bridge hours.
                    </p>
                    <div className="space-y-2 pt-1">
                      {activePathway.shared_skills.map((skill, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Target Modules */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        {d.missingCompetencies}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                        {activePathway.bridge_hours}h Focus
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Targeted practical modules required to pass NSQF Level {activePathway.target_nsqf_level} assessment.
                    </p>
                    <div className="space-y-2 pt-1">
                      {activePathway.missing_skills.map((skill, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source Trade NOS Nodes */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">{d.donorTrade}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        NCO {activePathway.source_nco_code}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">{activePathway.source_occupation_name}</div>
                    <div className="space-y-2 pt-1">
                      {sourceGenome?.nos_nodes.slice(0, 4).map((node: NOSCompetencyNode) => (
                        <div
                          key={node.nos_code}
                          className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-[11px]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-semibold text-emerald-400">{node.nos_code}</span>
                            <span className="font-mono text-[10px] text-slate-500">{node.hours}h</span>
                          </div>
                          <div className="text-slate-200 mt-0.5">{node.nos_title}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target Trade NOS Nodes */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">{d.targetTrade}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        NCO {activePathway.target_nco_code}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">{activePathway.target_occupation_name}</div>
                    <div className="space-y-2 pt-1">
                      {targetGenome?.nos_nodes.slice(0, 4).map((node: NOSCompetencyNode) => (
                        <div
                          key={node.nos_code}
                          className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-[11px]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-semibold text-sky-400">{node.nos_code}</span>
                            <span className="font-mono text-[10px] text-slate-500">{node.hours}h</span>
                          </div>
                          <div className="text-slate-200 mt-0.5">{node.nos_title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Curated Bridge Module Footer Strip */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">{activePathway.bridge_module_name}</span>
                    <span className="text-slate-400 block text-[11px]">
                      {activePathway.bridge_duration_days} Days ({activePathway.bridge_hours} hrs) • ₹{activePathway.bridge_cost_per_candidate_inr.toLocaleString()}/candidate
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                  ROI Payback: {activePathway.roi_payback_months} mos
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Donor Pool Conservation Meter & Batch Dispatch (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">{d.safetyFloorMeter}</h3>
                </div>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    isFloorViolated
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : remainingBufferPct < 15
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {isFloorViolated
                    ? 'FLOOR BREACH'
                    : remainingBufferPct < 15
                    ? 'TIGHT BUFFER'
                    : 'SAFE CONSERVATION'}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Ensures reskilling cohorts in <strong className="text-slate-200">{districtId.toUpperCase()}</strong> never deplete baseline local trade maintenance capacity below the statutory retention floor.
              </p>

              {/* Slider for Batch Size in 20-seat NCVT steps */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Target Bridge Batch (20-seat steps)</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {batchSize} Seats
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max={Math.min(400, donorPoolTotal)}
                  step="20"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>20 (1 Sec)</span>
                  <span>NCVT 20-Seat Step</span>
                  <span>{Math.min(400, donorPoolTotal)} Max</span>
                </div>
              </div>

              {/* Slider for Safety Floor Percentage */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Mandatory Trade Retention Floor</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {safetyFloorPct}% ({minimumSafetyFloorCount} reserved)
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  step="5"
                  value={safetyFloorPct}
                  onChange={(e) => setSafetyFloorPct(Number(e.target.value))}
                  className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Clean Stacked Conservation Bar */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
                  <div
                    style={{ width: `${(batchSize / donorPoolTotal) * 100}%` }}
                    className="bg-emerald-500 h-full transition-all duration-300"
                    title={`Converted: ${batchSize}`}
                  />
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        ((remainingDonorPool - minimumSafetyFloorCount) / donorPoolTotal) * 100
                      )}%`,
                    }}
                    className="bg-sky-500/60 h-full transition-all duration-300"
                    title="Available Buffer"
                  />
                  <div
                    style={{ width: `${(minimumSafetyFloorCount / donorPoolTotal) * 100}%` }}
                    className="bg-slate-700 h-full transition-all duration-300"
                    title={`Safety Floor: ${minimumSafetyFloorCount}`}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70">
                    <span className="text-slate-500 block text-[10px]">Pool</span>
                    <span className="text-slate-200 font-semibold">{donorPoolTotal}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70">
                    <span className="text-slate-500 block text-[10px]">Batch</span>
                    <span className="text-emerald-400 font-semibold">{batchSize}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70">
                    <span className="text-slate-500 block text-[10px]">Remaining</span>
                    <span className="text-sky-400 font-semibold">{remainingDonorPool}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70">
                    <span className="text-slate-500 block text-[10px]">Floor</span>
                    <span className="text-slate-300 font-semibold">{minimumSafetyFloorCount}</span>
                  </div>
                </div>
              </div>

              {isFloorViolated && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    Batch of {batchSize} leaves {remainingDonorPool} active technicians, breaching the {minimumSafetyFloorCount} retention floor. Reduce batch size to proceed.
                  </div>
                </div>
              )}

              {/* Dispatch Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => handleSendToSimulator('skillclock')}
                  disabled={isFloorViolated}
                  className={`w-full py-2.5 px-3.5 rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1.5 ${
                    isFloorViolated
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Dispatch to SkillClock (S06)
                </button>
                <button
                  onClick={() => handleSendToSimulator('simulator')}
                  disabled={isFloorViolated}
                  className={`w-full py-2.5 px-3.5 rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1.5 border ${
                    isFloorViolated
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Open in Simulator (S07)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SkillBridgePlannerView = SkillBridgeView;
export default SkillBridgeView;
