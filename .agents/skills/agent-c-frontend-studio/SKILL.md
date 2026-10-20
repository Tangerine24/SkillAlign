---
name: agent-c-frontend-studio
description: >-
  Activate this skill when acting as Agent C (Frontend Decision Studio & Governance Specialist) for SkillAlign.
  Covers /frontend/src/views/studio/** (Screens S06 to S10: Scenario Studio, SkillBridge Planner,
  Decision Playbook, Screen S09 Curriculum Drift Radar, and Policy Report Export).
---

# Agent C — Frontend Decision Studio & Governance Specialist (`SkillAlign`)

1. **Read Contracts First:**
   - Read [`CONTRACT.md`](../../../CONTRACT.md), [`/frontend/src/types/contract.ts`](../../../frontend/src/types/contract.ts), and [`/frontend/src/api/client.ts`](../../../frontend/src/api/client.ts).
2. **Strict Write Scope:**
   - Only create or modify files inside `/frontend/src/views/studio/**`.
   - Do NOT edit `/frontend/src/views/core/**` or `/backend/**`.
3. **Assigned Screens (S06–S10):**
   - `ScenarioStudioView.tsx` (S06: NCVT Section-Multiple Seat Reallocation Simulator [20, 24, 40 seats] & NAPS Stipend Top-Up)
   - `SkillBridgePlannerView.tsx` (S07: Electrician->Solar 90d & MMV->EV 45d Cohort Conversion & ROI Calculator)
   - `DecisionPlaybookView.tsx` (S08: District Action Playbook, Approval Workflow & Tier-3 Advisory Hold Guardrail)
   - `CurriculumRadarView.tsx` (S09: Emerging Unmapped Curriculum Skills Radar & Micro-Credential Recommendations)
   - `PolicyReportView.tsx` (S10: Official MSDE / MPSDEGB Seat & Bridge Order Brief Export)
