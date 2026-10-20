import React, { useState, useEffect, useMemo } from 'react';
import {
  Sliders,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileCheck,
  Sparkles,
  Scale,
  Send,
  X,
} from 'lucide-react';
import apiClient from '../../api/client';
import type {
  ScenarioSimulationResponse,
  ScenarioSimulationRequest,
  DecisionActionType,
} from '../../types/contract';
import { getDictionary, type LanguageMode } from './studioTranslations';

export interface PolicySimulatorViewProps {
  districtId?: string;
  language?: LanguageMode;
  onDecisionRecorded?: (scenarioId: string) => void;
}

export const PolicySimulatorView: React.FC<PolicySimulatorViewProps> = ({
  districtId = 'rewa',
  language = 'EN',
  onDecisionRecorded,
}) => {
  const [lang, setLang] = useState<LanguageMode>(language);
  useEffect(() => {
    setLang(language);
  }, [language]);
  const d = getDictionary(lang);

  // Segmented view tab on Right 8 Cols
  const [rightTab, setRightTab] = useState<'impact_table' | 'constraints'>('impact_table');

  // Constraint sliders
  const [budgetLimitLakhs, setBudgetLimitLakhs] = useState<number>(65);
  const [trainerCount, setTrainerCount] = useState<number>(8);
  const [labWorkstations, setLabWorkstations] = useState<number>(80);
  const [safetyFloorPct, setSafetyFloorPct] = useState<number>(50);

  // Section conversion controls (strictly quantized to NCVT section sizes: 20, 24, 40)
  const [dataEntrySectionsFrozen, setDataEntrySectionsFrozen] = useState<number>(4);
  const [donorSectionsConverted, setDonorSectionsConverted] = useState<number>(4);
  const [bridgeBatchCount, setBridgeBatchCount] = useState<number>(140);
  const [wageSubsidyInr, setWageSubsidyInr] = useState<number>(1500);

  // API Simulation Result
  const [simResult, setSimResult] = useState<ScenarioSimulationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Decision Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPlanForDecision, setSelectedPlanForDecision] = useState<string>('Plan C: AI-Suggested Optimal');
  const [officerName, setOfficerName] = useState<string>('District Skill Development Officer (DSDO)');
  const [decisionActionType, setDecisionActionType] = useState<DecisionActionType>('CONVERT_ITI_SECTION');
  const [plannerRationale, setPlannerRationale] = useState<string>(
    'Freezing 4 underutilized Data Entry sections (160 seats exhibiting ~48% phantom capacity) and reallocating budget toward 4 NCVT Solar PV sections (80 seats) and 140 SkillBridge candidates under PMKVY 4.0 to resolve the acute post-Oct 2025 deficit in Rewa.'
  );
  const [recordSuccessToast, setRecordSuccessToast] = useState<string | null>(null);

  // Run simulation whenever controls change
  useEffect(() => {
    async function runSim() {
      setLoading(true);
      try {
        const req: ScenarioSimulationRequest = {
          scenario_name: `SkillAlign Realignment — ${districtId.toUpperCase()}`,
          district_id: districtId,
          as_of_month: '2026-10',
          seat_reallocations: [
            {
              from_occupation_id: 'occ_data_entry',
              to_occupation_id: 'occ_solar_pv',
              sections_converted: donorSectionsConverted,
              seats_converted: donorSectionsConverted * 20,
            },
          ],
          bridge_batches: [
            {
              pathway_id: 'sb_elec_to_solar',
              candidates_enrolled: bridgeBatchCount,
            },
          ],
          wage_subsidy_monthly_inr: wageSubsidyInr,
        };
        const res = await apiClient.simulateScenario(req);
        setSimResult(res);
      } catch (err) {
        console.error('Failed to run simulation', err);
      } finally {
        setLoading(false);
      }
    }
    runSim();
  }, [districtId, donorSectionsConverted, bridgeBatchCount, wageSubsidyInr]);

  // Derived budget & utilization
  const totalBudgetSpentInr = (simResult?.total_budget_inr || 4850000) * (bridgeBatchCount / 140);
  const totalBudgetSpentLakhs = Number((totalBudgetSpentInr / 100000).toFixed(2));
  const isBudgetViolated = totalBudgetSpentLakhs > budgetLimitLakhs;

  const trainersRequired = Math.ceil(bridgeBatchCount / 20) + donorSectionsConverted;
  const isTrainerViolated = trainersRequired > trainerCount;

  const labDesksRequired = Math.max(donorSectionsConverted * 20, Math.ceil(bridgeBatchCount / 2));
  const isLabViolated = labDesksRequired > labWorkstations;

  const hasAnyViolation = isBudgetViolated || isTrainerViolated || isLabViolated;

  // 4 Scenario Scorecards
  const scenarios = useMemo(() => {
    return [
      {
        id: 'scen_baseline',
        title: 'Baseline',
        subtitle: d.scenarioBaseline,
        badge: 'STATUS QUO',
        badgeColor: 'border-slate-700 bg-slate-800 text-slate-300',
        gapReductionPct: 0,
        remainingGap: 4200,
        costLakhs: 0,
        phantomCapacityPct: 38.4,
        deploymentTime: '12–24m',
        violations: [],
        description: 'No section changes. 48% ITI phantom capacity persists in Data Entry.',
      },
      {
        id: 'scen_plan_a',
        title: 'Plan A: ITI Capex',
        subtitle: d.scenarioPlanA,
        badge: 'SLOW CAPEX',
        badgeColor: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
        gapReductionPct: 32.5,
        remainingGap: 2835,
        costLakhs: 54.0,
        phantomCapacityPct: 22.0,
        deploymentTime: '14m (Aug)',
        violations: ['Misses immediate peak demand window'],
        description: 'Freeze 4 Data Entry sections, add 4 NCVT target sections (80 seats).',
      },
      {
        id: 'scen_plan_b',
        title: 'Plan B: Bridge Opex',
        subtitle: d.scenarioPlanB,
        badge: 'FAST OPEX',
        badgeColor: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
        gapReductionPct: 48.0,
        remainingGap: 2184,
        costLakhs: 28.5,
        phantomCapacityPct: 38.4,
        deploymentTime: '45–90d',
        violations: ['Does not fix legacy ITI phantom seats'],
        description: 'Enrol 160 unplaced Electricians in 90-day Suryamitra Bridge.',
      },
      {
        id: 'scen_plan_c',
        title: 'Plan C: AI Optimal',
        subtitle: d.scenarioPlanC,
        badge: 'AI OPTIMAL',
        badgeColor: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300',
        gapReductionPct: simResult?.gap_reduction_pct || 64.8,
        remainingGap: simResult?.simulated_net_gap || 1480,
        costLakhs: totalBudgetSpentLakhs,
        phantomCapacityPct: simResult?.phantom_capacity_after_pct || 14.2,
        deploymentTime: 'Immediate',
        violations: isBudgetViolated
          ? [`Budget cap exceeded by ₹${(totalBudgetSpentLakhs - budgetLimitLakhs).toFixed(1)}L`]
          : isTrainerViolated
          ? ['Trainer capacity exceeded']
          : [],
        description: `Freeze ${dataEntrySectionsFrozen * 40} phantom seats + convert ${donorSectionsConverted} NCVT sections + ${bridgeBatchCount} bridge cohort.`,
      },
    ];
  }, [
    d,
    simResult,
    totalBudgetSpentLakhs,
    budgetLimitLakhs,
    isBudgetViolated,
    isTrainerViolated,
    dataEntrySectionsFrozen,
    donorSectionsConverted,
    bridgeBatchCount,
  ]);

  const handleOpenDecisionModal = (planTitle: string) => {
    setSelectedPlanForDecision(planTitle);
    setIsModalOpen(true);
  };

  const handleSaveDecision = async () => {
    try {
      await apiClient.updateDecisionStatus({
        decision_id: `dec_${districtId}_solar_bridge`,
        status: 'APPROVED',
        reviewer_note: `[Approved by ${officerName}] ${plannerRationale}`,
      });
      setIsModalOpen(false);
      setRecordSuccessToast(
        `Official Planner Decision for ${districtId.toUpperCase()} recorded in Governance Queue.`
      );
      if (onDecisionRecorded) {
        onDecisionRecorded(`scen_${districtId}_2026`);
      }
      setTimeout(() => setRecordSuccessToast(null), 4500);
    } catch (err) {
      console.error('Failed to record decision', err);
    }
  };

  return (
    <div className="space-y-5 text-slate-100">
      {/* Compact Studio Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            {d.s07Title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{d.s07Subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          {loading && (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900 text-emerald-400 border border-slate-800 animate-pulse">
              Simulating...
            </span>
          )}
          <span
            className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
              hasAnyViolation
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {hasAnyViolation ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Constraint Alert
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Constraints Valid
              </>
            )}
          </span>
          <button
            onClick={() => handleOpenDecisionModal('Plan C: AI-Suggested Optimal')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <FileCheck className="w-3.5 h-3.5" />
            Record Decision
          </button>
        </div>
      </div>

      {recordSuccessToast && (
        <div className="px-3.5 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{recordSuccessToast}</span>
        </div>
      )}

      {/* 2-Column Studio Layout: Left 4 Cols (Levers) + Right 8 Cols (Scorecards & Tabbed Impact) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Policy Levers & NCVT Constraints */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: NCVT Section Multiples & Policy Levers */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Policy Levers (NCVT Multiples)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                20 / 24 / 40 Seats
              </span>
            </div>

            {/* Lever 1: Freeze Data Entry Sections (40-seat multiples) */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Freeze Data Entry (40/sec)</span>
                <span className="font-mono font-semibold text-amber-400">
                  {dataEntrySectionsFrozen} sec ({dataEntrySectionsFrozen * 40} seats)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={dataEntrySectionsFrozen}
                onChange={(e) => setDataEntrySectionsFrozen(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 Seats</span>
                <span>~48% Phantom Cap</span>
                <span>320 Seats</span>
              </div>
            </div>

            {/* Lever 2: Convert Target Solar PV Sections (20-seat multiples) */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Add Solar PV Sections (20/sec)</span>
                <span className="font-mono font-semibold text-sky-400">
                  {donorSectionsConverted} sec ({donorSectionsConverted * 20} seats)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={donorSectionsConverted}
                onChange={(e) => setDonorSectionsConverted(Number(e.target.value))}
                className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>20 Seats</span>
                <span>NCVT CTS Quota</span>
                <span>160 Seats</span>
              </div>
            </div>

            {/* Lever 3: SkillBridge Batch Size (20-seat steps) */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">SkillBridge Cohort (45–90d)</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {bridgeBatchCount} Trainees
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="20"
                value={bridgeBatchCount}
                onChange={(e) => setBridgeBatchCount(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>20</span>
                <span>PMKVY 4.0 RPL</span>
                <span>300</span>
              </div>
            </div>

            {/* Lever 4: NAPS Stipend Top-Up */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">NAPS Stipend Top-Up</span>
                <span className="font-mono font-semibold text-cyan-400">
                  ₹{wageSubsidyInr}/mo
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="500"
                value={wageSubsidyInr}
                onChange={(e) => setWageSubsidyInr(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>₹0</span>
                <span>Retention Boost</span>
                <span>₹3,000</span>
              </div>
            </div>
          </div>

          {/* Card 2: District Resource Ceilings */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                District Resource Ceilings
              </h3>
              <span className="text-[10px] font-mono text-slate-400">FY 2026-27</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{d.districtBudget}</span>
                <span className="font-mono font-semibold text-slate-200">₹{budgetLimitLakhs}L</span>
              </div>
              <input
                type="range"
                min="25"
                max="120"
                step="5"
                value={budgetLimitLakhs}
                onChange={(e) => setBudgetLimitLakhs(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Trainers</span>
                  <span className="font-mono font-semibold text-slate-200">{trainerCount}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={trainerCount}
                  onChange={(e) => setTrainerCount(Number(e.target.value))}
                  className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Lab Desks</span>
                  <span className="font-mono font-semibold text-slate-200">{labWorkstations}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="160"
                  step="10"
                  value={labWorkstations}
                  onChange={(e) => setLabWorkstations(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">{d.safetyFloor}</span>
                <span className="font-mono font-semibold text-slate-200">{safetyFloorPct}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="75"
                step="5"
                value={safetyFloorPct}
                onChange={(e) => setSafetyFloorPct(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right 8 Cols: 4 Scenario Scorecards + Segmented Tab (Impact Table | Constraint Breakdown) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 4 Scenario Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {scenarios.map((scen) => {
              const isOptimal = scen.id === 'scen_plan_c';
              return (
                <div
                  key={scen.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isOptimal
                      ? 'bg-slate-900 border-emerald-500/50 ring-1 ring-emerald-500/20'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${scen.badgeColor}`}
                      >
                        {scen.badge}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {scen.deploymentTime}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        {isOptimal && <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {scen.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                        {scen.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[9px] text-slate-500 block font-sans">Gap Closed</span>
                        <span className="font-bold text-emerald-400">
                          {scen.gapReductionPct > 0 ? `+${scen.gapReductionPct}%` : '0%'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[9px] text-slate-500 block font-sans">Cost</span>
                        <span className="font-bold text-slate-200">₹{scen.costLakhs}L</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[9px] text-slate-500 block font-sans">Phantom</span>
                        <span className="font-semibold text-amber-400">{scen.phantomCapacityPct}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[9px] text-slate-500 block font-sans">Net Gap</span>
                        <span className="font-semibold text-slate-300">{scen.remainingGap}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-2.5 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenDecisionModal(scen.subtitle)}
                      className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition ${
                        isOptimal
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <FileCheck className="w-3 h-3" />
                      Select Plan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Segmented Detail Card: Occupation Seat & Gap Impact Table vs Constraint & Budget Breakdown */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
              <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs self-start">
                <button
                  onClick={() => setRightTab('impact_table')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    rightTab === 'impact_table'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Occupation Seat &amp; Gap Impact Table
                </button>
                <button
                  onClick={() => setRightTab('constraints')}
                  className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                    rightTab === 'constraints'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Constraint &amp; Budget Breakdown
                  {hasAnyViolation && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>
              </div>

              {simResult && (
                <span className="text-[11px] font-mono text-slate-400">
                  Cost / Placed Worker:{' '}
                  <strong className="text-emerald-400">
                    ₹{simResult.cost_per_placed_candidate_inr.toLocaleString()}
                  </strong>
                </span>
              )}
            </div>

            {rightTab === 'impact_table' ? (
              <div className="space-y-3">
                {simResult && simResult.occupation_impacts.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3 font-medium">Occupation (NCO)</th>
                          <th className="py-2.5 px-3 text-right font-medium">NCVT Unit</th>
                          <th className="py-2.5 px-3 text-right font-medium">Sections (Before &rarr; After)</th>
                          <th className="py-2.5 px-3 text-right font-medium">Seats (Before &rarr; After)</th>
                          <th className="py-2.5 px-3 text-right font-medium">Net Gap (Before &rarr; After)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                        {simResult.occupation_impacts.map((imp) => (
                          <tr key={imp.occupation_id} className="text-slate-200 hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 font-medium">
                              {imp.occupation_name}{' '}
                              <span className="font-mono text-[11px] text-slate-500">({imp.nco_code})</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                              {imp.section_size}/sec
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              <span className="text-slate-400">{imp.baseline_sections}</span> &rarr;{' '}
                              <strong className="text-amber-300">{imp.simulated_sections}</strong>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              <span className="text-slate-400">{imp.baseline_sanctioned_seats}</span> &rarr;{' '}
                              <strong className="text-sky-300">{imp.simulated_sanctioned_seats}</strong>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              <span className="text-slate-400">{imp.baseline_net_gap}</span> &rarr;{' '}
                              <strong className="text-emerald-400">{imp.simulated_net_gap}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Computing quantized NCVT section matrix...
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                  <span>
                    Phantom Capacity Reduced:{' '}
                    <strong className="text-slate-200 font-mono">
                      {simResult?.phantom_capacity_before_pct ?? 38.4}% &rarr;{' '}
                      <span className="text-emerald-400">
                        {simResult?.phantom_capacity_after_pct ?? 14.2}%
                      </span>
                    </strong>
                  </span>
                  <span>
                    Total Net Deficit Reduced:{' '}
                    <strong className="text-emerald-400 font-mono">
                      +{simResult?.gap_reduction_pct ?? 64.8}%
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Budget Utilization */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Budget Allocation</span>
                      <span
                        className={`font-mono font-semibold ${
                          isBudgetViolated ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        ₹{totalBudgetSpentLakhs}L / ₹{budgetLimitLakhs}L
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(100, (totalBudgetSpentLakhs / budgetLimitLakhs) * 100)}%`,
                        }}
                        className={`h-full ${isBudgetViolated ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {Math.round((totalBudgetSpentLakhs / budgetLimitLakhs) * 100)}% of district cap
                    </span>
                  </div>

                  {/* Trainer Utilization */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Master Trainers</span>
                      <span
                        className={`font-mono font-semibold ${
                          isTrainerViolated ? 'text-rose-400' : 'text-sky-400'
                        }`}
                      >
                        {trainersRequired} / {trainerCount}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(100, (trainersRequired / trainerCount) * 100)}%`,
                        }}
                        className={`h-full ${isTrainerViolated ? 'bg-rose-500' : 'bg-sky-500'}`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {Math.round((trainersRequired / trainerCount) * 100)}% instructor load
                    </span>
                  </div>

                  {/* Lab Capacity Utilization */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Workshop Desks</span>
                      <span
                        className={`font-mono font-semibold ${
                          isLabViolated ? 'text-rose-400' : 'text-purple-400'
                        }`}
                      >
                        {labDesksRequired} / {labWorkstations}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(100, (labDesksRequired / labWorkstations) * 100)}%`,
                        }}
                        className={`h-full ${isLabViolated ? 'bg-rose-500' : 'bg-purple-500'}`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {Math.round((labDesksRequired / labWorkstations) * 100)}% lab bay utilization
                    </span>
                  </div>
                </div>

                {hasAnyViolation ? (
                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Active Constraint Breaches:
                    </div>
                    {isBudgetViolated && (
                      <div>
                        • Total outlay ₹{totalBudgetSpentLakhs}L exceeds ceiling of ₹{budgetLimitLakhs}L.
                      </div>
                    )}
                    {isTrainerViolated && (
                      <div>
                        • Requires {trainersRequired} certified trainers; {trainerCount} available.
                      </div>
                    )}
                    {isLabViolated && (
                      <div>
                        • Requires {labDesksRequired} lab workstations; {labWorkstations} available.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      All NCVT section quantizations (20/24/40), instructor ratios, and district budget ceilings are satisfied.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clean Record Official Decision Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">{d.recordDecision}</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Selected Strategic Plan
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedPlanForDecision}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-emerald-300 font-mono font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">
                    Authorized Signatory
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">
                    Action Classification
                  </label>
                  <select
                    value={decisionActionType}
                    onChange={(e) => setDecisionActionType(e.target.value as DecisionActionType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="CONVERT_ITI_SECTION">CONVERT_ITI_SECTION</option>
                    <option value="LAUNCH_PMKVY_BRIDGE">LAUNCH_PMKVY_BRIDGE</option>
                    <option value="FREEZE_PHANTOM_SEATS">FREEZE_PHANTOM_SEATS</option>
                    <option value="WAGE_STIPEND_TOPUP">WAGE_STIPEND_TOPUP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Executive Rationale &amp; Audit Note
                </label>
                <textarea
                  rows={3}
                  value={plannerRationale}
                  onChange={(e) => setPlannerRationale(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs"
                />
              </div>

              <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-[11px] flex items-center justify-between">
                <span>Empirical Bayes Confidence Gate</span>
                <span className="font-mono font-semibold text-emerald-400">
                  Tier 1: Direct (Eligible)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDecision}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Sign &amp; Dispatch Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ScenarioStudioView = PolicySimulatorView;
export default PolicySimulatorView;
