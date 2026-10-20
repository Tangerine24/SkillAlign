import React from 'react';
import type { DashboardResponse } from '../../types/contract';

export interface CommandDashboardViewProps {
  selectedDistrictId?: string;
  selectedOccupationId?: string;
  onSelectCell?: (districtId: string, occupationId: string, forecastId: string) => void;
  initialData?: DashboardResponse | null;
}

export const CommandDashboardView: React.FC<CommandDashboardViewProps> = ({
  selectedDistrictId = 'rewa',
  selectedOccupationId = 'occ_solar_pv',
}) => {
  return (
    <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60">
      <h2 className="text-lg font-semibold text-white">
        S01: Executive Command Dashboard (Agent B Stub)
      </h2>
      <p className="text-sm text-slate-400 mt-1">
        Madhya Pradesh District x Occupation Heatmap, 6-Stage Supply Pipeline (~48% ITI Phantom
        Capacity), and Wage-Gap Intelligence. Active selection: {selectedDistrictId} /{' '}
        {selectedOccupationId}.
      </p>
    </div>
  );
};

export default CommandDashboardView;
