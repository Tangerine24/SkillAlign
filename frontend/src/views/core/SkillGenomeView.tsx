import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  GitBranch,
  Network,
  Sparkles,
} from 'lucide-react';
import apiClient from '../../api/client';
import type {
  NOSCompetencyNode,
  OccupationSummary,
  SkillGenomeResponse,
} from '../../types/contract';
import type { LanguageMode } from '../studio/studioTranslations';

export interface SkillGenomeViewProps {
  occupationId?: string;
  districtId?: string;
  language?: LanguageMode;
  onSelectOccupation?: (occupationId: string) => void;
  onNavigateTab?: (tabKey: string) => void;
  onInspectEvidence?: (label: string, value: string, forecastId: string) => void;
}

export const SkillGenomeView: React.FC<SkillGenomeViewProps> = ({
  occupationId = 'occ_solar_pv',
  districtId = 'rewa',
  language = 'EN',
  onSelectOccupation,
  onNavigateTab,
  onInspectEvidence,
}) => {
  const [genome, setGenome] = useState<SkillGenomeResponse | null>(null);
  const [allOccupations, setAllOccupations] = useState<OccupationSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNosCode, setSelectedNosCode] = useState<string | null>(null);
  const [bottomTab, setBottomTab] = useState<'NOS_SYLLABUS' | 'UNMAPPED_DRIFT'>('NOS_SYLLABUS');

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([apiClient.getSkillGenome(occupationId), apiClient.getOccupations()])
      .then(([gRes, oRes]) => {
        if (!active) return;
        setGenome(gRes);
        setAllOccupations(oRes.occupations);
        if (gRes.occupation.nos_nodes.length > 0) {
          setSelectedNosCode(gRes.occupation.nos_nodes[0].nos_code);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [occupationId]);

  if (loading || !genome) {
    return (
      <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 text-sm animate-pulse">
        Loading S04 Skill Genome &amp; NOS Competency Topology...
      </div>
    );
  }

  const occ = genome.occupation;
  const activeNos =
    occ.nos_nodes.find((n) => n.nos_code === selectedNosCode) || occ.nos_nodes[0];

  return (
    <div className="space-y-6">
      {/* Clean Occupation Pill Selector + Compact Metadata Bar */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {allOccupations.map((o) => {
              const isSelected = o.occupation_id === occ.occupation_id;
              return (
                <button
                  key={o.occupation_id}
                  type="button"
                  onClick={() => onSelectOccupation?.(o.occupation_id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>{o.occupation_name}</span>{' '}
                  <span className="font-mono text-[10px] opacity-75">({o.nco_code})</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab?.('s05_skillbridge')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition shrink-0"
          >
            <span>Open SkillBridge Planner (S05)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-3 font-mono">
            <span className="text-slate-200 font-semibold">
              QP: <strong className="text-indigo-300">{occ.qp_code}</strong>
            </span>
            <span>•</span>
            <span>NSQF Level {occ.nsqf_level}</span>
            <span>•</span>
            <span>
              {occ.training_duration_months}m ({occ.training_hours} hrs)
            </span>
            <span>•</span>
            <span>NCVT Section: {occ.section_size} seats</span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
              Drift Score: {occ.curriculum_drift_score}/100 ({occ.unmapped_demand_share_pct}% Unmapped)
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Interactive SVG NOS Competency Graph (Left 7) + Selected NOS Details & SkillBridge Pathways (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive SVG Node-Link Skill Genome Graph */}
        <div className="lg:col-span-7 rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-400" />
                {language === 'HI'
                  ? 'इंटरएक्टिव NOS दक्षता एवं समीपवर्ती ट्रेड ग्राफ'
                  : 'Interactive NOS Competency & Adjacent Trade Topology'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any satellite NOS unit to inspect notional hours &amp; employer mention share
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {occ.nos_nodes.length} NOS Units
            </span>
          </div>

          <div className="rounded-xl bg-[#090D16] border border-slate-800/80 p-3 overflow-hidden">
            <svg viewBox="0 0 680 350" className="w-full h-auto select-none">
              {/* Subtle Radial Rings */}
              <circle
                cx={340}
                cy={175}
                r={120}
                fill="none"
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Connecting Spokes from Center (340, 175) to NOS Nodes */}
              {occ.nos_nodes.map((node, i) => {
                const angle = (i / Math.max(1, occ.nos_nodes.length)) * Math.PI * 2 - Math.PI / 2;
                const nx = 340 + Math.cos(angle) * 135;
                const ny = 175 + Math.sin(angle) * 112;
                const isSelected = activeNos?.nos_code === node.nos_code;
                const strokeColor =
                  node.category === 'DOMAIN_CORE'
                    ? '#10b981'
                    : node.category === 'SHARED_FOUNDATION'
                    ? '#6366f1'
                    : '#f59e0b';

                return (
                  <g
                    key={node.nos_code}
                    onClick={() => setSelectedNosCode(node.nos_code)}
                    className="cursor-pointer"
                  >
                    <line
                      x1={340}
                      y1={175}
                      x2={nx}
                      y2={ny}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      strokeDasharray={node.category === 'SHARED_FOUNDATION' ? '4 3' : undefined}
                    />
                    <circle
                      cx={nx}
                      cy={ny}
                      r={isSelected ? 23 : 19}
                      fill="#0f172a"
                      stroke={isSelected ? '#f8fafc' : strokeColor}
                      strokeWidth={isSelected ? '2.5' : '1.75'}
                    />
                    <text
                      x={nx}
                      y={ny - 2}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="700"
                    >
                      {node.nos_code}
                    </text>
                    <text
                      x={nx}
                      y={ny + 10}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="8.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {node.hours}h
                    </text>
                    <text
                      x={nx}
                      y={ny + 33}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#cbd5e1'}
                      fontSize="10"
                      fontWeight="600"
                    >
                      {node.nos_title.length > 26
                        ? `${node.nos_title.slice(0, 26)}…`
                        : node.nos_title}
                    </text>
                  </g>
                );
              })}

              {/* Central Occupation Hub */}
              <circle
                cx={340}
                cy={175}
                r={46}
                fill="#1e1b4b"
                stroke="#818cf8"
                strokeWidth="2.5"
              />
              <text
                x={340}
                y={167}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="700"
              >
                NCO {occ.nco_code}
              </text>
              <text
                x={340}
                y={182}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                NSQF L{occ.nsqf_level}
              </text>
              <text
                x={340}
                y={196}
                textAnchor="middle"
                fill="#a5b4fc"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                {occ.qp_code}
              </text>
            </svg>

            <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Domain Core NOS
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Shared Foundation NOS (Transferable)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Safety &amp; Compliance NOS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Selected NOS Details & Adjacent SkillBridge Pathways */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Active NOS Card */}
          {activeNos && (
            <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  NOS UNIT • {activeNos.nos_code}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onInspectEvidence?.(
                      `NOS ${activeNos.nos_code} Employer Mention Share`,
                      `${activeNos.demand_frequency_pct}% of district postings`,
                      `fc_${districtId}_${occupationId}_2026-10`
                    )
                  }
                  className="font-mono tabular-nums text-emerald-300 font-semibold hover:underline"
                >
                  {activeNos.demand_frequency_pct}% Employer Share ↗
                </button>
              </div>
              <h3 className="text-base font-bold text-white">{activeNos.nos_title}</h3>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Category</div>
                  <div className="text-slate-200 font-semibold mt-0.5 truncate">
                    {activeNos.category.replace('_', ' ')}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Notional Hours</div>
                  <div className="text-amber-300 font-bold mt-0.5">{activeNos.hours} hrs</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">NSQF Level</div>
                  <div className="text-emerald-300 font-bold mt-0.5">
                    Level {activeNos.nsqf_level}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Adjacent SkillBridge Transition Pathways */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-3 flex-1">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-amber-400" />
                Adjacent Trade Cosine Similarity &amp; SkillBridge Links
              </h3>
            </div>

            {genome.adjacent_transitions.length === 0 ? (
              <p className="text-xs text-slate-400">
                Select Electrician, Solar PV, MMV, EV Tech, or CNC to view direct SkillBridge
                pathways.
              </p>
            ) : (
              <div className="space-y-2.5">
                {genome.adjacent_transitions.map((pw) => (
                  <div
                    key={pw.pathway_id}
                    className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-white">
                        {pw.source_occupation_name} → {pw.target_occupation_name}
                      </span>
                      <span className="px-2 py-0.5 rounded font-mono tabular-nums font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {pw.skill_overlap_pct}% Overlap
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      Bridge: <strong className="text-indigo-300">{pw.bridge_module_name}</strong> (
                      {pw.bridge_duration_days}d / {pw.bridge_hours}h • ₹
                      {pw.bridge_cost_per_candidate_inr.toLocaleString()})
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400">
                      <span>Saves {pw.lead_time_saved_months}m vs Fresh ITI</span>
                      <button
                        type="button"
                        onClick={() => onNavigateTab?.('s05_skillbridge')}
                        className="text-amber-300 hover:text-amber-200 font-semibold inline-flex items-center gap-1"
                      >
                        <span>Simulate in S05</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Tabbed NOS Syllabus & Emerging Unmapped Employer Skills Section */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-3.5">
          <div className="inline-flex flex-wrap rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setBottomTab('NOS_SYLLABUS')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                bottomTab === 'NOS_SYLLABUS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. NOS Competency Syllabus ({occ.nos_nodes.length} Units)</span>
            </button>

            <button
              type="button"
              onClick={() => setBottomTab('UNMAPPED_DRIFT')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                bottomTab === 'UNMAPPED_DRIFT'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                2. Emerging Unmapped Employer Skills ({occ.emerging_unmapped_skills?.length || 0})
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab?.('s09_curriculum')}
            className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Curriculum &amp; Gazette Order (S09)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {bottomTab === 'NOS_SYLLABUS' && (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3.5">NOS Code</th>
                  <th className="py-2.5 px-3.5">Competency Title</th>
                  <th className="py-2.5 px-3.5">Category</th>
                  <th className="py-2.5 px-3.5 text-right">NSQF Level</th>
                  <th className="py-2.5 px-3.5 text-right">Syllabus Hours</th>
                  <th className="py-2.5 px-3.5 text-right">Employer Demand Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-900/30">
                {occ.nos_nodes.map((node: NOSCompetencyNode) => (
                  <tr
                    key={node.nos_code}
                    onClick={() => setSelectedNosCode(node.nos_code)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition ${
                      activeNos?.nos_code === node.nos_code ? 'bg-indigo-950/25' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3.5 font-mono font-bold text-indigo-300">
                      {node.nos_code}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-white">{node.nos_title}</td>
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          node.category === 'DOMAIN_CORE'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : node.category === 'SHARED_FOUNDATION'
                            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {node.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-slate-300">
                      L{node.nsqf_level}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-amber-300">
                      {node.hours} hrs
                    </td>
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectEvidence?.(
                          `NOS ${node.nos_code} Employer Frequency`,
                          `${node.demand_frequency_pct}% of district postings`,
                          `fc_${districtId}_${occupationId}_2026-10`
                        );
                      }}
                      className="py-2.5 px-3.5 text-right font-mono tabular-nums font-bold text-emerald-300 underline decoration-dotted"
                    >
                      {node.demand_frequency_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {bottomTab === 'UNMAPPED_DRIFT' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
            {occ.emerging_unmapped_skills && occ.emerging_unmapped_skills.length > 0 ? (
              occ.emerging_unmapped_skills.map((esk) => (
                <div
                  key={esk.skill_id}
                  className="p-4 rounded-xl bg-slate-950/75 border border-slate-800/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">{esk.skill_name}</span>
                    <span className="px-2 py-0.5 rounded font-mono tabular-nums font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      +{esk.posting_mention_growth_yoy_pct}% YoY • {esk.current_nsqf_coverage}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    Recommended Micro-Credential:{' '}
                    <strong className="text-emerald-300">{esk.recommended_micro_credential}</strong>{' '}
                    ({esk.estimated_upskill_hours} hrs • {esk.employer_demand_share_pct}% postings)
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 p-4">
                No unmapped employer skill drift detected for this trade.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGenomeView;
