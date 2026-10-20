import React from 'react';

export interface ForecastEngineViewProps {
  districtId?: string;
  occupationId?: string;
  asOfMonth?: string;
  onOpenEvidence?: (forecastId: string) => void;
}

export const ForecastEngineView: React.FC<ForecastEngineViewProps> = ({
  districtId = 'rewa',
  occupationId = 'occ_solar_pv',
  asOfMonth = '2026-10',
}) => {
  return (
    <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60">
      <h2 className="text-lg font-semibold text-white">
        S02: Demand-Supply Forecast & SkillClock Lead-Time Engine (Agent B Stub)
      </h2>
      <p className="text-sm text-slate-400 mt-1">
        P10/P50/P90 Uncertainty Fan, PLFS pi_tier adjustment, Empirical Bayes Confidence Tier, and
        SkillClock Lead-Time Horizon for {districtId} / {occupationId} as of {asOfMonth}.
      </p>
    </div>
  );
};

export default ForecastEngineView;
