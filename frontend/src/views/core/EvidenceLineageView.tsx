import React from 'react';

export interface EvidenceLineageViewProps {
  forecastId?: string;
}

export const EvidenceLineageView: React.FC<EvidenceLineageViewProps> = ({
  forecastId = 'fc_rewa_occ_solar_pv_2026-10',
}) => {
  return (
    <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60">
      <h2 className="text-lg font-semibold text-white">
        S03: Evidence Drawer & Data Lineage Audit (Agent B Stub)
      </h2>
      <p className="text-sm text-slate-400 mt-1">
        Source Register (OBSERVED_PUBLIC_ANCHOR, DERIVED_ESTIMATE, SYNTHETIC_PILOT_FEED) and
        Deduplication/PLFS Waterfall for {forecastId}.
      </p>
    </div>
  );
};

export default EvidenceLineageView;
