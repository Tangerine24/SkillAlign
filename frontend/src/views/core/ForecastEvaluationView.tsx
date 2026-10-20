import React from 'react';

export interface ForecastEvaluationViewProps {
  districtId?: string;
  occupationId?: string;
}

export const ForecastEvaluationView: React.FC<ForecastEvaluationViewProps> = ({
  districtId = 'rewa',
  occupationId = 'occ_solar_pv',
}) => {
  return (
    <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60">
      <h2 className="text-lg font-semibold text-white">
        S05: Time-Travel Replay & Forecast Backtest Evaluation (Agent B Stub)
      </h2>
      <p className="text-sm text-slate-400 mt-1">
        Rewinds to T-12m (2025-10) demand shock in {districtId} ({occupationId}) and verifies
        predicted P10/P50/P90 intervals against ground-truth observations through 2026-10.
      </p>
    </div>
  );
};

export default ForecastEvaluationView;
