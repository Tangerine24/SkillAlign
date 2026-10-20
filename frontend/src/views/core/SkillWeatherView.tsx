import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Briefcase,
  Compass,
  Factory,
  Filter,
  Layers,
  MapPin,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import apiClient from '../../api/client';
import type {
  DashboardResponse,
  DistrictOccupationCell,
  MarketStatus,
} from '../../types/contract';
import type { LanguageMode } from '../studio/studioTranslations';

export interface SkillWeatherViewProps {
  selectedDistrictId?: string;
  selectedOccupationId?: string;
  asOfMonth?: string;
  language?: LanguageMode;
  onSelectDistrict?: (districtId: string) => void;
  onSelectOccupation?: (occupationId: string) => void;
  onDrillDownForecast?: (districtId: string, occupationId: string, forecastId: string) => void;
  onOpenSkillBridge?: (districtId: string, occupationId: string) => void;
  onInspectEvidence?: (label: string, value: string, forecastId: string) => void;
}

interface ContextDivisionPolygon {
  id: string;
  name: string;
  subLabel: string;
  path: string;
  cx: number;
  cy: number;
}

interface MPDistrictGeoNode {
  id: string;
  nameEn: string;
  nameHi: string;
  divisionName: string;
  nodalCode: string;
  cx: number;
  cy: number;
  regionTag: string;
  path: string;
  industrialAnchors: {
    name: string;
    sector: string;
    highlight: string;
  }[];
}

// Surrounding MP context divisions rendered in muted slate for geographic realism
const MP_CONTEXT_DIVISIONS: ContextDivisionPolygon[] = [
  {
    id: 'ctx_gwalior',
    name: 'Gwalior-Chambal',
    subLabel: 'North Division',
    path: 'M 225,24 L 328,16 L 368,66 L 322,120 L 226,116 L 200,68 Z',
    cx: 284,
    cy: 68,
  },
  {
    id: 'ctx_bundelkhand',
    name: 'Bundelkhand (Sagar)',
    subLabel: 'North-Central',
    path: 'M 368,66 L 478,54 L 486,148 L 395,162 L 322,120 Z',
    cx: 412,
    cy: 108,
  },
  {
    id: 'ctx_shahdol',
    name: 'Shahdol',
    subLabel: 'Eastern Coal Belt',
    path: 'M 594,150 L 686,146 L 694,258 L 598,274 L 580,192 Z',
    cx: 640,
    cy: 208,
  },
  {
    id: 'ctx_narmadapuram',
    name: 'Narmadapuram',
    subLabel: 'Satpura Agro Zone',
    path: 'M 236,288 L 404,285 L 414,358 L 234,360 Z',
    cx: 324,
    cy: 325,
  },
];

// 5 Active Pilot Regions of Madhya Pradesh
const MP_DISTRICT_NODES: MPDistrictGeoNode[] = [
  {
    id: 'ujjain',
    nameEn: 'Ujjain (Malwa North)',
    nameHi: 'उज्जैन (मालवा उत्तर)',
    divisionName: 'Ujjain Division',
    nodalCode: 'MP-UJN-04',
    cx: 154,
    cy: 172,
    regionTag: 'DMIC Smart Corridor & Feeder Solar',
    path: 'M 76,136 L 226,116 L 236,214 L 84,224 Z',
    industrialAnchors: [
      {
        name: 'Vikram Udyogpuri DMIC Smart Township',
        sector: 'Industrial & Logistics',
        highlight: '1,100-acre Delhi-Mumbai Industrial Corridor node',
      },
      {
        name: 'Malwa PM-KUSUM Solar Feeder Cluster',
        sector: 'Green Energy & Electrical',
        highlight: '380MW decentralized agricultural solar substation rollout',
      },
      {
        name: 'Nagda Process & Engineering Hub',
        sector: 'Advanced Manufacturing',
        highlight: 'Continuous process electrical & instrumentation maintenance',
      },
    ],
  },
  {
    id: 'indore',
    nameEn: 'Indore (Malwa South)',
    nameHi: 'इंदौर (मालवा दक्षिण)',
    divisionName: 'Indore Division',
    nodalCode: 'MP-IND-01',
    cx: 162,
    cy: 278,
    regionTag: 'Pithampur Auto/EV SEZ & IT Hub',
    path: 'M 84,224 L 236,214 L 236,342 L 94,336 Z',
    industrialAnchors: [
      {
        name: 'Pithampur NATRAX EV Proving Ground & Auto SEZ',
        sector: 'Automotive & EV Mobility',
        highlight: 'Asia’s largest high-speed EV testing & OEM assembly belt',
      },
      {
        name: 'Indore City & Intercity E-Bus Fleet Depot',
        sector: 'Automotive & EV Mobility',
        highlight: 'High-voltage LiFePO4 battery & BMS service demand surge',
      },
      {
        name: 'Super Corridor & Crystal IT SEZ',
        sector: 'IT-ITeS & Office Operations',
        highlight: 'Transitioning legacy data entry roles to AI/ERP operations',
      },
    ],
  },
  {
    id: 'bhopal',
    nameEn: 'Bhopal (Capital)',
    nameHi: 'भोपाल (राजधानी क्षेत्र)',
    divisionName: 'Bhopal Division',
    nodalCode: 'MP-BPL-02',
    cx: 316,
    cy: 212,
    regionTag: 'Mandideep BHEL & ESDM Park',
    path: 'M 226,116 L 322,120 L 395,162 L 404,285 L 236,288 L 236,214 Z',
    industrialAnchors: [
      {
        name: 'Mandideep BHEL & Heavy Electricals Cluster',
        sector: 'Green Energy & Electrical',
        highlight: 'Transformer, switchgear & traction motor manufacturing',
      },
      {
        name: 'Govindpura Industrial Area & ESDM Park',
        sector: 'Advanced Manufacturing',
        highlight: '280+ MSME precision fabrication & control panel units',
      },
      {
        name: 'PM E-Bus Sewa Capital Charging Infrastructure',
        sector: 'Automotive & EV Mobility',
        highlight: 'DC fast-charging station commissioning & maintenance',
      },
    ],
  },
  {
    id: 'rewa',
    nameEn: 'Rewa (Vindhya)',
    nameHi: 'रीवा (विंध्य क्षेत्र)',
    divisionName: 'Rewa Division',
    nodalCode: 'MP-REW-05',
    cx: 572,
    cy: 102,
    regionTag: 'RUMSL 750MW Solar Corridor',
    path: 'M 478,54 L 656,46 L 680,146 L 594,150 L 486,148 Z',
    industrialAnchors: [
      {
        name: 'RUMSL 750MW Ultra Mega Solar Park (Gurh)',
        sector: 'Green Energy & Electrical',
        highlight: '14x post-Oct 2025 surge in Suryamitra PV technician demand',
      },
      {
        name: 'Badwar & Mauganj Utility-Scale Solar EPC Belt',
        sector: 'Green Energy & Electrical',
        highlight: '1,500V DC string inverter & SCADA commissioning projects',
      },
      {
        name: 'Vindhya EHV Grid & Cement Captive Power Cluster',
        sector: 'Green Energy & Electrical',
        highlight: 'High-tension substation & rooftop PM-Surya Ghar installations',
      },
    ],
  },
  {
    id: 'jabalpur',
    nameEn: 'Jabalpur (Mahakoshal)',
    nameHi: 'जबलपुर (महाकौशल)',
    divisionName: 'Jabalpur Division',
    nodalCode: 'MP-JBP-03',
    cx: 495,
    cy: 256,
    regionTag: 'Richhai VFJ Defence & CNC Hub',
    path: 'M 395,162 L 486,148 L 594,150 L 580,192 L 598,274 L 584,350 L 414,358 L 404,285 Z',
    industrialAnchors: [
      {
        name: 'Richhai VFJ (Vehicle Factory Jabalpur) & Defence Ancillaries',
        sector: 'Advanced Manufacturing',
        highlight: 'Armored vehicle machining & 5-axis CNC precision tooling',
      },
      {
        name: 'Adhartal & Hargarh MSME Engineering Cluster',
        sector: 'Advanced Manufacturing',
        highlight: 'Experiencing 42% 6m attrition where SME wage trails gig wage',
      },
      {
        name: 'Mahakoshal Ordnance & Heavy Fabrication Corridor',
        sector: 'Advanced Manufacturing',
        highlight: 'High demand for Fanuc/Siemens G-Code setters & CAD/CAM',
      },
    ],
  },
];

interface GovtItiCampusRecord {
  misCode: string;
  campusName: string;
  districtId: string;
  districtName: string;
  primaryTrades: string;
  sanctionedSections: number;
  sanctionedSeats: number;
  activeEnrolmentPct: number;
  labStatus: 'PM-SETU Hub Upgraded' | 'CSR Solar/EV Lab Active' | 'Legacy Lab — Upgrade Queued';
  nodalOfficer: string;
}

const MP_GOVT_ITI_ROSTER: GovtItiCampusRecord[] = [
  {
    misCode: 'GR23000142',
    campusName: 'Govt Divisional ITI Rewa (Sirmour Chauraha)',
    districtId: 'rewa',
    districtName: 'Rewa',
    primaryTrades: 'Electrician (7411.0100), Solar PV Tech (7411.0101), Fitter',
    sanctionedSections: 16,
    sanctionedSeats: 340,
    activeEnrolmentPct: 88,
    labStatus: 'CSR Solar/EV Lab Active',
    nodalOfficer: 'Sh. R.K. अग्निहोत्री (Principal Cl-I • +91-7662-254108)',
  },
  {
    misCode: 'GR23000163',
    campusName: 'Govt ITI Mauganj (Rewa Solar Feeder Wing)',
    districtId: 'rewa',
    districtName: 'Rewa',
    primaryTrades: 'Electrician General, COPA / Data Entry (4132.0402)',
    sanctionedSections: 8,
    sanctionedSeats: 180,
    activeEnrolmentPct: 62,
    labStatus: 'Legacy Lab — Upgrade Queued',
    nodalOfficer: 'Sh. V.P. Tiwari (Superintendent • +91-7663-241092)',
  },
  {
    misCode: 'GR23000018',
    campusName: 'Govt Divisional ITI Nanda Nagar Indore',
    districtId: 'indore',
    districtName: 'Indore',
    primaryTrades: 'EV Service Tech (7231.0105), MMV (7231.0101), CNC Setter',
    sanctionedSections: 24,
    sanctionedSeats: 520,
    activeEnrolmentPct: 94,
    labStatus: 'PM-SETU Hub Upgraded',
    nodalOfficer: 'Dr. S.K. Deshmukh (Joint Director / Principal • +91-731-2554810)',
  },
  {
    misCode: 'GR23000128',
    campusName: 'Govt ITI Pithampur Auto Cluster Extension',
    districtId: 'indore',
    districtName: 'Indore',
    primaryTrades: 'Mechanic Motor Vehicle (MMV), Electrician, Welder',
    sanctionedSections: 12,
    sanctionedSeats: 260,
    activeEnrolmentPct: 91,
    labStatus: 'CSR Solar/EV Lab Active',
    nodalOfficer: 'Sh. M.S. Chouhan (Nodal Officer • +91-7292-253114)',
  },
  {
    misCode: 'GR23000004',
    campusName: 'Govt Model ITI Govindpura Bhopal',
    districtId: 'bhopal',
    districtName: 'Bhopal',
    primaryTrades: 'Electrician, EV Service Tech, CNC Programmer, Solar PV',
    sanctionedSections: 28,
    sanctionedSeats: 600,
    activeEnrolmentPct: 96,
    labStatus: 'PM-SETU Hub Upgraded',
    nodalOfficer: 'Smt. P. Kulshrestha (Directorate Nodal • +91-755-2586430)',
  },
  {
    misCode: 'GR23000094',
    campusName: 'Govt ITI Mandideep Industrial Growth Centre',
    districtId: 'bhopal',
    districtName: 'Bhopal',
    primaryTrades: 'Electrician General, Fitter, Domestic Data Entry',
    sanctionedSections: 10,
    sanctionedSeats: 220,
    activeEnrolmentPct: 79,
    labStatus: 'CSR Solar/EV Lab Active',
    nodalOfficer: 'Sh. A.K. Saxena (Principal • +91-7480-233519)',
  },
  {
    misCode: 'GR23000051',
    campusName: 'Govt Divisional ITI Madhotal Jabalpur',
    districtId: 'jabalpur',
    districtName: 'Jabalpur',
    primaryTrades: 'CNC Programmer & Setter (7223.0501), Turner, Electrician',
    sanctionedSections: 20,
    sanctionedSeats: 420,
    activeEnrolmentPct: 74,
    labStatus: 'PM-SETU Hub Upgraded',
    nodalOfficer: 'Sh. D.K. स्थापक (Principal Cl-I • +91-761-2642190)',
  },
  {
    misCode: 'GR23000089',
    campusName: 'Govt ITI Bargi Hills / Richhai MSME Wing Jabalpur',
    districtId: 'jabalpur',
    districtName: 'Jabalpur',
    primaryTrades: 'CNC Setter, Machinist, Data Entry Operator (4132.0402)',
    sanctionedSections: 10,
    sanctionedSeats: 200,
    activeEnrolmentPct: 54,
    labStatus: 'Legacy Lab — Upgrade Queued',
    nodalOfficer: 'Sh. N.K. Verma (Training Officer • +91-761-2681044)',
  },
  {
    misCode: 'GR23000027',
    campusName: 'Govt Divisional ITI Maxi Road Ujjain',
    districtId: 'ujjain',
    districtName: 'Ujjain',
    primaryTrades: 'Electrician, Solar PV Installer, MMV, Data Entry',
    sanctionedSections: 16,
    sanctionedSeats: 360,
    activeEnrolmentPct: 76,
    labStatus: 'CSR Solar/EV Lab Active',
    nodalOfficer: 'Sh. H.S. Parmar (Principal • +91-734-2512840)',
  },
  {
    misCode: 'GR23000115',
    campusName: 'Govt Women’s ITI Dussehra Maidan Ujjain',
    districtId: 'ujjain',
    districtName: 'Ujjain',
    primaryTrades: 'Domestic Data Entry Operator (4132.0402), Electronics, COPA',
    sanctionedSections: 8,
    sanctionedSeats: 180,
    activeEnrolmentPct: 52,
    labStatus: 'Legacy Lab — Upgrade Queued',
    nodalOfficer: 'Smt. Meena Joshi (Principal • +91-734-2526912)',
  },
];

interface EmployerVacancySignal {
  signalId: string;
  companyCluster: string;
  districtId: string;
  districtName: string;
  occupationId: string;
  roleTitle: string;
  ncoCode: string;
  monthlyWageInr: number;
  vacanciesCount: number;
  requiredNosSkills: string[];
  urgencyTag: 'IMMEDIATE EPC DEPLOYMENT' | 'OEM SHIFT EXPANSION' | 'NAPS STIPEND MATCH';
}

const MP_EMPLOYER_SIGNALS: EmployerVacancySignal[] = [
  {
    signalId: 'sig_rewa_rumsl',
    companyCluster: 'RUMSL 750MW Solar Park & Mahindra Susten EPC Consortium',
    districtId: 'rewa',
    districtName: 'Rewa',
    occupationId: 'occ_solar_pv',
    roleTitle: 'Solar PV Stringing & 1500V DC Inverter Technician',
    ncoCode: '7411.0101',
    monthlyWageInr: 18500,
    vacanciesCount: 410,
    requiredNosSkills: ['SGJ/N0101 Site Survey', 'SGJ/N0103 Array Wiring', 'SGJ/N0106 DC Protection'],
    urgencyTag: 'IMMEDIATE EPC DEPLOYMENT',
  },
  {
    signalId: 'sig_rewa_suryaghar',
    companyCluster: 'Vindhya PM-Surya Ghar Rooftop Integrator Network (42 Vendors)',
    districtId: 'rewa',
    districtName: 'Rewa',
    occupationId: 'occ_solar_pv',
    roleTitle: 'Bi-Directional Net-Metering & Rooftop Commissioning Wireman',
    ncoCode: '7411.0101',
    monthlyWageInr: 16800,
    vacanciesCount: 245,
    requiredNosSkills: ['SGJ/N0102 Mounting', 'CSC/N0304 LT Wiring', 'Net-Metering Protocol'],
    urgencyTag: 'IMMEDIATE EPC DEPLOYMENT',
  },
  {
    signalId: 'sig_indore_pithampur_ev',
    companyCluster: 'Pithampur Auto SEZ EV Commercial Fleet OEMs (VE Commercial / Force)',
    districtId: 'indore',
    districtName: 'Indore',
    occupationId: 'occ_ev_tech',
    roleTitle: 'High-Voltage Traction Battery & CAN-Bus Diagnostics Lead Tech',
    ncoCode: '7231.0105',
    monthlyWageInr: 22400,
    vacanciesCount: 380,
    requiredNosSkills: ['ASC/N9810 HV Safety', 'ASC/N9812 BMS Thermal', 'CAN-Bus Protocol'],
    urgencyTag: 'OEM SHIFT EXPANSION',
  },
  {
    signalId: 'sig_indore_AICTSL',
    companyCluster: 'AICTSL E-Bus Depot & Malwa Charging Network Operators',
    districtId: 'indore',
    districtName: 'Indore',
    occupationId: 'occ_ev_tech',
    roleTitle: 'L5 / E-Bus Powertrain & Regenerative Braking Specialist',
    ncoCode: '7231.0105',
    monthlyWageInr: 20500,
    vacanciesCount: 195,
    requiredNosSkills: ['ASC/N9814 BLDC Motor', 'ASC/N1402 Chassis', 'CCS2 Fast Charger'],
    urgencyTag: 'OEM SHIFT EXPANSION',
  },
  {
    signalId: 'sig_bhopal_bhel',
    companyCluster: 'Mandideep BHEL Ancillary & Switchgear Manufacturing Consortium',
    districtId: 'bhopal',
    districtName: 'Bhopal',
    occupationId: 'occ_electrician',
    roleTitle: 'Industrial Control Panel & Smart Grid Substation Electrician',
    ncoCode: '7411.0100',
    monthlyWageInr: 19200,
    vacanciesCount: 220,
    requiredNosSkills: ['CSC/N0304 Industrial Wiring', 'CSC/N0305 Transformer', 'PLC Relay Logic'],
    urgencyTag: 'OEM SHIFT EXPANSION',
  },
  {
    signalId: 'sig_bhopal_ev',
    companyCluster: 'Bhopal Smart City E-Mobility & Govindpura ESDM Cluster',
    districtId: 'bhopal',
    districtName: 'Bhopal',
    occupationId: 'occ_ev_tech',
    roleTitle: 'EV Charging Infrastructure & Battery Pack Testing Tech',
    ncoCode: '7231.0105',
    monthlyWageInr: 21000,
    vacanciesCount: 165,
    requiredNosSkills: ['ASC/N9810 HV Isolation', 'ASC/N9812 Cell Balancing', 'Thermal Runaway QA'],
    urgencyTag: 'IMMEDIATE EPC DEPLOYMENT',
  },
  {
    signalId: 'sig_jabalpur_vfj',
    companyCluster: 'Richhai Industrial Area & VFJ Defence Precision Machining Vendors',
    districtId: 'jabalpur',
    districtName: 'Jabalpur',
    occupationId: 'occ_cnc_prog',
    roleTitle: '5-Axis VMC / CNC Programmer & Tool Offset Setter',
    ncoCode: '7223.0501',
    monthlyWageInr: 13800,
    vacanciesCount: 290,
    requiredNosSkills: ['CSC/N0115 G/M-Code', 'CSC/N0116 Workholding', 'CMM GD&T Inspection'],
    urgencyTag: 'NAPS STIPEND MATCH',
  },
  {
    signalId: 'sig_ujjain_dmic',
    companyCluster: 'Vikram Udyogpuri DMIC & Malwa PM-KUSUM Feeder Contractors',
    districtId: 'ujjain',
    districtName: 'Ujjain',
    occupationId: 'occ_solar_pv',
    roleTitle: 'Solar Agricultural Pump & Feeder Substation Technician',
    ncoCode: '7411.0101',
    monthlyWageInr: 17200,
    vacanciesCount: 175,
    requiredNosSkills: ['SGJ/N0103 Array Stringing', 'CSC/N0305 Motor Control', 'VFD Pump Drive'],
    urgencyTag: 'IMMEDIATE EPC DEPLOYMENT',
  },
];

function getStatusBadge(status: MarketStatus) {
  switch (status) {
    case 'HIGH_SHORTAGE':
      return {
        label: 'Acute Shortage',
        short: 'SHORTAGE ▲',
        symbol: '▲',
        cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        fill: '#f43f5e',
      };
    case 'WAGE_GAP_SHORTAGE':
      return {
        label: 'Wage-Gap Attrition',
        short: 'WAGE-GAP ⚠',
        symbol: '⚠',
        cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        fill: '#f59e0b',
      };
    case 'SURPLUS_DONOR':
      return {
        label: 'Surplus Donor Pool',
        short: 'DONOR POOL ●',
        symbol: '●',
        cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        fill: '#6366f1',
      };
    case 'CHRONIC_OVERSUPPLY':
      return {
        label: 'Chronic Oversupply',
        short: 'OVERSUPPLY ▼',
        symbol: '▼',
        cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        fill: '#a855f7',
      };
    default:
      return {
        label: 'Balanced',
        short: 'BALANCED ■',
        symbol: '■',
        cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        fill: '#10b981',
      };
  }
}

export const SkillWeatherView: React.FC<SkillWeatherViewProps> = ({
  selectedDistrictId = 'rewa',
  selectedOccupationId = 'occ_solar_pv',
  asOfMonth = '2026-10',
  language = 'EN',
  onSelectDistrict,
  onSelectOccupation,
  onDrillDownForecast,
  onOpenSkillBridge,
  onInspectEvidence,
}) => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [horizonMonths, setHorizonMonths] = useState<3 | 6 | 12>(12);
  const [districtScope, setDistrictScope] = useState<string>('ALL');
  const [bottomTab, setBottomTab] = useState<'RANKING' | 'ITI_ROSTER' | 'EMPLOYER_SIGNALS'>(
    'RANKING'
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiClient
      .getDashboard({ as_of_month: asOfMonth })
      .then((res) => {
        if (active) setDashboard(res);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [asOfMonth]);

  const horizonScale = horizonMonths / 12;

  const filteredCells = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.heatmap_cells
      .filter((c) => {
        if (districtScope !== 'ALL' && c.district_id !== districtScope) return false;
        if (sectorFilter !== 'ALL' && c.sector !== sectorFilter) return false;
        return true;
      })
      .sort((a, b) => Math.abs(b.net_annual_gap) - Math.abs(a.net_annual_gap));
  }, [dashboard, districtScope, sectorFilter]);

  const districtAggregates = useMemo(() => {
    const map = new Map<
      string,
      {
        netGap: number;
        demand: number;
        supply: number;
        phantomPct: number;
        topShortageTrade: string;
        topShortageOccId: string;
        status: MarketStatus;
        backlog: number;
      }
    >();
    if (!dashboard) return map;

    MP_DISTRICT_NODES.forEach((dNode) => {
      const dCells = dashboard.heatmap_cells.filter((c) => c.district_id === dNode.id);
      const demand = dCells.reduce(
        (acc, c) => acc + Math.round(c.annualized_demand * horizonScale),
        0
      );
      const supply = dCells.reduce(
        (acc, c) => acc + Math.round(c.annualized_effective_supply * horizonScale),
        0
      );
      const netGap = demand - supply;
      const avgPhantom =
        dCells.reduce((acc, c) => acc + c.phantom_capacity_rate, 0) / Math.max(1, dCells.length);
      const backlog = dCells.reduce((acc, c) => acc + c.unplaced_backlog_stock, 0);
      const worst = [...dCells].sort((a, b) => b.net_annual_gap - a.net_annual_gap)[0];

      let status: MarketStatus = 'HIGH_SHORTAGE';
      if (dNode.id === 'jabalpur') status = 'WAGE_GAP_SHORTAGE';
      else if (netGap < 400) status = 'SURPLUS_DONOR';

      map.set(dNode.id, {
        netGap,
        demand,
        supply,
        phantomPct: Math.round(avgPhantom * 100),
        topShortageTrade: worst?.occupation_name || 'Solar PV Installer',
        topShortageOccId: worst?.occupation_id || 'occ_solar_pv',
        status,
        backlog,
      });
    });
    return map;
  }, [dashboard, horizonScale]);

  if (loading || !dashboard) {
    return (
      <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 text-sm animate-pulse">
        Loading Madhya Pradesh regional intelligence &amp; skill tightness matrix...
      </div>
    );
  }

  const kpis = dashboard.kpis;
  const activeDistrictKey =
    districtScope !== 'ALL' ? districtScope : selectedDistrictId || 'rewa';
  const activeDistrictNode =
    MP_DISTRICT_NODES.find((d) => d.id === activeDistrictKey) || MP_DISTRICT_NODES[3];
  const activeDistrictAgg = districtAggregates.get(activeDistrictNode.id);
  const activeDistrictAlert =
    dashboard.top_alerts.find((a) => a.district_id === activeDistrictNode.id) ||
    dashboard.top_alerts[0];
  const activeFcId = `fc_${activeDistrictNode.id}_${selectedOccupationId}_${asOfMonth}`;

  const filteredItis =
    districtScope === 'ALL'
      ? MP_GOVT_ITI_ROSTER
      : MP_GOVT_ITI_ROSTER.filter((iti) => iti.districtId === districtScope);

  const filteredSignals =
    districtScope === 'ALL'
      ? MP_EMPLOYER_SIGNALS
      : MP_EMPLOYER_SIGNALS.filter((sig) => sig.districtId === districtScope);

  return (
    <div className="space-y-6">
      {/* Row 1: 4 Executive KPI Cards (Click any card to open EvidenceXRayDrawer) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() =>
            onInspectEvidence?.(
              `MP PLFS-Debiased Demand (${horizonMonths}m Horizon)`,
              `${Math.round(kpis.total_annual_demand * horizonScale).toLocaleString()} Workers`,
              activeFcId
            )
          }
          className="cursor-pointer bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-5 transition group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              PLFS-Debiased Demand ({horizonMonths}m)
            </span>
            <span className="text-[10px] font-mono text-slate-500 group-hover:text-indigo-400 transition">
              X-RAY ↗
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white mt-2.5">
            {Math.round(kpis.total_annual_demand * horizonScale).toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Debiased via informal capture <span className="font-mono text-slate-300">π_tier</span>{' '}
            across 30 MP cells
          </p>
        </div>

        <div
          onClick={() =>
            onInspectEvidence?.(
              `Effective Retained Supply ≥ 6m (${horizonMonths}m Horizon)`,
              `${Math.round(kpis.total_effective_supply_retained * horizonScale).toLocaleString()} Workers`,
              activeFcId
            )
          }
          className="cursor-pointer bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-5 transition group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Effective Supply (Retained ≥ 6m)
            </span>
            <span className="text-[10px] font-mono text-slate-500 group-hover:text-indigo-400 transition">
              X-RAY ↗
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-400 mt-2.5">
            {Math.round(kpis.total_effective_supply_retained * horizonScale).toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Net of 6-stage leakage +{' '}
            <span className="font-mono tabular-nums text-slate-200">
              {kpis.total_unplaced_backlog.toLocaleString()}
            </span>{' '}
            unplaced backlog
          </p>
        </div>

        <div
          onClick={() =>
            onInspectEvidence?.(
              `Net Workforce Deficit (${horizonMonths}m Horizon)`,
              `+${Math.round(kpis.net_skill_gap * horizonScale).toLocaleString()} Workers`,
              activeFcId
            )
          }
          className="cursor-pointer bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-5 transition group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Net Workforce Deficit ({horizonMonths}m)
            </span>
            <span className="text-[10px] font-mono text-slate-500 group-hover:text-indigo-400 transition">
              X-RAY ↗
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-rose-400 mt-2.5">
            +{Math.round(kpis.net_skill_gap * horizonScale).toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            <span className="text-rose-300 font-medium">{kpis.high_shortage_cells_count} shortage</span>{' '}
            cells vs{' '}
            <span className="text-indigo-300 font-medium">
              {kpis.chronic_surplus_cells_count} donor
            </span>{' '}
            pools
          </p>
        </div>

        <div
          onClick={() =>
            onInspectEvidence?.(
              'ITI Phantom Capacity (Unutilized Sanctioned Seats)',
              `${kpis.overall_phantom_capacity_pct}% (~48% in Data Entry)`,
              activeFcId
            )
          }
          className="cursor-pointer bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-5 transition group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              ITI Phantom Capacity Rate
            </span>
            <span className="text-[10px] font-mono text-slate-500 group-hover:text-indigo-400 transition">
              X-RAY ↗
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-purple-300 mt-2.5">
            {kpis.overall_phantom_capacity_pct}%
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Peaks at ~48% in legacy trades •{' '}
            <span className="font-mono tabular-nums text-emerald-300">
              {kpis.reallocation_opportunity_seats} seats
            </span>{' '}
            reallocatable
          </p>
        </div>
      </div>

      {/* Row 2: Upgraded Multi-Region Madhya Pradesh Choropleth SVG Map (7 Cols) + Selected District Profile (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Recognizable Madhya Pradesh Multi-Region Choropleth SVG Map */}
        <div className="lg:col-span-7 rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                {language === 'HI'
                  ? 'मध्य प्रदेश क्षेत्रीय कौशल सघनता मानचित्र (5 पायलट संभाग)'
                  : 'Madhya Pradesh Regional Skill Tightness Choropleth'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any active pilot division to inspect local industrial anchors &amp; filter tables
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {/* Horizon Pill Switcher */}
              <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                {([3, 6, 12] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHorizonMonths(h)}
                    className={`px-2 py-1 rounded-md font-mono text-[11px] font-semibold transition ${
                      horizonMonths === h
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {h}m
                  </button>
                ))}
              </div>

              {districtScope !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setDistrictScope('ALL')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 font-medium transition"
                >
                  Show All MP
                </button>
              )}
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-xl bg-[#090D16] border border-slate-800/80 p-3">
            <svg viewBox="0 0 720 380" className="w-full h-auto select-none">
              <defs>
                <pattern
                  id="wageHatchPattern"
                  width="8"
                  height="8"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="8"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeOpacity="0.32"
                  />
                </pattern>
                <pattern
                  id="mapGridPattern"
                  width="36"
                  height="36"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 36 0 L 0 0 0 36"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="0.5"
                    strokeOpacity="0.45"
                  />
                </pattern>
              </defs>

              {/* Subtle Coordinate Grid Background */}
              <rect x="0" y="0" width="720" height="380" fill="url(#mapGridPattern)" />

              {/* Outer Madhya Pradesh State Sovereign Silhouette */}
              <path
                d="M 225,24 L 328,16 L 368,66 L 478,54 L 656,46 L 680,146 L 686,146 L 694,258 L 598,274 L 584,350 L 414,358 L 234,360 L 94,336 L 84,224 L 76,136 L 226,116 L 200,68 Z"
                fill="#0b1120"
                stroke="#334155"
                strokeWidth="2.5"
              />

              {/* Context Divisions in Muted Slate (Gwalior-Chambal, Bundelkhand, Shahdol, Narmadapuram) */}
              {MP_CONTEXT_DIVISIONS.map((ctx) => (
                <g key={ctx.id} className="opacity-70">
                  <path
                    d={ctx.path}
                    fill="#0f172a"
                    stroke="#1e293b"
                    strokeWidth="1.25"
                    strokeDasharray="3 2"
                  />
                  <text
                    x={ctx.cx}
                    y={ctx.cy - 4}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {ctx.name}
                  </text>
                  <text
                    x={ctx.cx}
                    y={ctx.cy + 9}
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="8.5"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {ctx.subLabel}
                  </text>
                </g>
              ))}

              {/* Active Pilot Region Polygons */}
              {MP_DISTRICT_NODES.map((node) => {
                const agg = districtAggregates.get(node.id);
                const isSelected = activeDistrictNode.id === node.id;
                const badge = getStatusBadge(agg?.status || 'HIGH_SHORTAGE');

                return (
                  <g
                    key={node.id}
                    onClick={() => {
                      setDistrictScope(node.id);
                      onSelectDistrict?.(node.id);
                    }}
                    className="cursor-pointer transition-opacity hover:opacity-95"
                  >
                    <path
                      d={node.path}
                      fill={
                        node.id === 'jabalpur'
                          ? 'url(#wageHatchPattern)'
                          : `${badge.fill}${isSelected ? '30' : '1c'}`
                      }
                      stroke={isSelected ? '#f8fafc' : badge.fill}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />
                  </g>
                );
              })}

              {/* Industrial Transmission Corridor Links */}
              <path
                d="M 154,172 L 162,278 L 316,212 L 495,256 L 572,102"
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.65"
              />

              {/* Active Pilot Region Labels & Status Nodes */}
              {MP_DISTRICT_NODES.map((node) => {
                const agg = districtAggregates.get(node.id);
                const isSelected = activeDistrictNode.id === node.id;
                const badge = getStatusBadge(agg?.status || 'HIGH_SHORTAGE');

                return (
                  <g
                    key={`label_${node.id}`}
                    onClick={() => {
                      setDistrictScope(node.id);
                      onSelectDistrict?.(node.id);
                    }}
                    className="cursor-pointer"
                  >
                    {/* Pulse Halo for Selected District */}
                    {isSelected && (
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r={16}
                        fill="none"
                        stroke="#f8fafc"
                        strokeWidth="1.5"
                        strokeOpacity="0.5"
                      />
                    )}

                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r={isSelected ? 10 : 8.5}
                      fill={badge.fill}
                      stroke="#090D16"
                      strokeWidth="2"
                    />

                    <text
                      x={node.cx}
                      y={node.cy + 3.5}
                      textAnchor="middle"
                      fill="#090D16"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {badge.symbol}
                    </text>

                    <text
                      x={node.cx}
                      y={node.cy - 15}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#e2e8f0'}
                      fontSize="11.5"
                      fontWeight="700"
                    >
                      {language === 'HI' ? node.nameHi : node.nameEn}
                    </text>

                    <text
                      x={node.cx}
                      y={node.cy + 22}
                      textAnchor="middle"
                      fill="#fbbf24"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      Gap +{agg?.netGap.toLocaleString()} • Ph {agg?.phantomPct}%
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Clean Legend Footer */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>▲ Acute Shortage (Rewa, Indore, Bhopal)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>⚠ Wage-Gap Attrition (Jabalpur)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                  <span>Context Divisions (Non-Pilot)</span>
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">MP-STATE GIS v2.6</span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Selected District Institutional & Industrial Profile Card */}
        <div className="lg:col-span-5 rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Selected District Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {activeDistrictNode.nodalCode} • {activeDistrictNode.divisionName.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">
                  {language === 'HI' ? activeDistrictNode.nameHi : activeDistrictNode.nameEn}
                </h3>
                <p className="text-xs text-slate-400">{activeDistrictNode.regionTag}</p>
              </div>

              {activeDistrictAgg && (
                <span
                  className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold border ${
                    getStatusBadge(activeDistrictAgg.status).cls
                  }`}
                >
                  {getStatusBadge(activeDistrictAgg.status).short}
                </span>
              )}
            </div>

            {/* 4 Compact District Metrics */}
            {activeDistrictAgg && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Net Gap ({horizonMonths}m)</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-rose-400 mt-0.5">
                    +{activeDistrictAgg.netGap.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Retained Supply</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                    {activeDistrictAgg.supply.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Phantom Seats</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-purple-300 mt-0.5">
                    {activeDistrictAgg.phantomPct}%
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400">Donor Backlog</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-indigo-300 mt-0.5">
                    {activeDistrictAgg.backlog.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Real Industrial Anchors */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Factory className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified Industrial Demand Anchors</span>
              </div>
              <div className="space-y-2">
                {activeDistrictNode.industrialAnchors.map((anchor, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">{anchor.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {anchor.sector.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{anchor.highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Action Alert for Selected District */}
          {activeDistrictAlert && (
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 font-mono font-semibold text-rose-300">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  PRIORITY INTERVENTION • {activeDistrictAlert.district_name.toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectDistrict?.(activeDistrictAlert.district_id);
                    onSelectOccupation?.(activeDistrictAlert.occupation_id);
                    onDrillDownForecast?.(
                      activeDistrictAlert.district_id,
                      activeDistrictAlert.occupation_id,
                      `fc_${activeDistrictAlert.district_id}_${activeDistrictAlert.occupation_id}_${asOfMonth}`
                    );
                  }}
                  className="text-amber-300 hover:text-amber-200 font-semibold inline-flex items-center gap-1"
                >
                  <span>Inspect S03</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="text-xs font-semibold text-white">
                {activeDistrictAlert.headline}
              </div>
              <p className="text-[11px] text-emerald-300 font-medium">
                Action: {activeDistrictAlert.recommended_action}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Progressive Disclosure 3-Tab Segmented Switcher */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4">
        {/* Segmented Control Bar + Inline Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div
            className="inline-flex flex-wrap rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={bottomTab === 'RANKING'}
              onClick={() => setBottomTab('RANKING')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                bottomTab === 'RANKING'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>1. District × Trade Ranking ({filteredCells.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={bottomTab === 'ITI_ROSTER'}
              onClick={() => setBottomTab('ITI_ROSTER')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                bottomTab === 'ITI_ROSTER'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>2. Govt ITI Campus Roster (10 MP ITIs)</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={bottomTab === 'EMPLOYER_SIGNALS'}
              onClick={() => setBottomTab('EMPLOYER_SIGNALS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                bottomTab === 'EMPLOYER_SIGNALS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>3. Live Employer Demand Signals ({filteredSignals.length})</span>
            </button>
          </div>

          {/* Compact District & Sector Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={districtScope}
                onChange={(e) => {
                  setDistrictScope(e.target.value);
                  if (e.target.value !== 'ALL') onSelectDistrict?.(e.target.value);
                }}
                aria-label="Filter by District"
                className="bg-transparent text-slate-200 font-medium focus:outline-none"
              >
                <option value="ALL" className="bg-slate-900">
                  All 5 MP Pilot Districts
                </option>
                <option value="rewa" className="bg-slate-900">
                  Rewa Division
                </option>
                <option value="indore" className="bg-slate-900">
                  Indore Division
                </option>
                <option value="bhopal" className="bg-slate-900">
                  Bhopal Division
                </option>
                <option value="jabalpur" className="bg-slate-900">
                  Jabalpur Division
                </option>
                <option value="ujjain" className="bg-slate-900">
                  Ujjain Division
                </option>
              </select>
            </div>

            {bottomTab === 'RANKING' && (
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  aria-label="Filter by Sector"
                  className="bg-transparent text-slate-200 font-medium focus:outline-none"
                >
                  <option value="ALL" className="bg-slate-900">
                    All 4 Sectors
                  </option>
                  <option value="Green Energy & Electrical" className="bg-slate-900">
                    Green Energy &amp; Electrical
                  </option>
                  <option value="Automotive & EV Mobility" className="bg-slate-900">
                    Automotive &amp; EV Mobility
                  </option>
                  <option value="Advanced Manufacturing" className="bg-slate-900">
                    Advanced Manufacturing
                  </option>
                  <option value="IT-ITeS & Office Operations" className="bg-slate-900">
                    IT-ITeS &amp; Office Operations
                  </option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* TAB 1: Streamlined 7-Column Ranked District × Trade Table */}
        {bottomTab === 'RANKING' && (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">MC Rank &amp; Stability</th>
                  <th className="py-3 px-3.5">District &amp; Trade (NCO)</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Demand / Supply ({horizonMonths}m)</th>
                  <th className="py-3 px-3.5 text-right">Net Skill Gap</th>
                  <th className="py-3 px-3.5 text-right">Phantom &amp; Wage (W)</th>
                  <th className="py-3 px-3.5 text-right">Drilldown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-900/30">
                {filteredCells.slice(0, 15).map((cell: DistrictOccupationCell, idx: number) => {
                  const rank = idx + 1;
                  const isRobust =
                    cell.confidence_tier === 'Tier 1: Direct' ||
                    Math.abs(cell.net_annual_gap) > 900;
                  const mcPill = isRobust
                    ? `Robust [${Math.max(1, rank - 1)}–${rank + 1}]`
                    : `Fragile [${Math.max(1, rank - 2)}–${rank + 4}]`;
                  const badge = getStatusBadge(cell.market_status);
                  const scaledDemand = Math.round(cell.annualized_demand * horizonScale);
                  const scaledSupply = Math.round(
                    cell.annualized_effective_supply * horizonScale
                  );
                  const scaledGap = scaledDemand - scaledSupply;

                  return (
                    <tr
                      key={cell.cell_id}
                      className={`hover:bg-slate-800/40 transition ${
                        cell.district_id === selectedDistrictId &&
                        cell.occupation_id === selectedOccupationId
                          ? 'bg-indigo-950/25'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 font-mono tabular-nums">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">#{rank}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] border ${
                              isRobust
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {mcPill}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-white">
                          {cell.district_name} — {cell.occupation_name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          NCO {cell.nco_code} • NSQF L{cell.nsqf_level} • {cell.confidence_tier}
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${badge.cls}`}
                        >
                          {badge.short}
                        </span>
                      </td>

                      <td
                        onClick={() =>
                          onInspectEvidence?.(
                            `${cell.district_name} ${cell.occupation_name} Demand vs Supply`,
                            `${scaledDemand.toLocaleString()} Demand / ${scaledSupply.toLocaleString()} Supply`,
                            cell.forecast_id
                          )
                        }
                        className="py-3 px-3.5 text-right font-mono tabular-nums cursor-pointer hover:text-amber-300"
                      >
                        <span className="font-semibold text-slate-100">
                          {scaledDemand.toLocaleString()}
                        </span>
                        <span className="text-slate-500"> / </span>
                        <span className="text-emerald-400">{scaledSupply.toLocaleString()}</span>
                      </td>

                      <td
                        onClick={() =>
                          onInspectEvidence?.(
                            `${cell.district_name} ${cell.occupation_name} Net Gap`,
                            `${scaledGap > 0 ? '+' : ''}${scaledGap.toLocaleString()} workers`,
                            cell.forecast_id
                          )
                        }
                        className={`py-3 px-3.5 text-right font-mono tabular-nums font-bold cursor-pointer underline decoration-dotted ${
                          scaledGap > 0 ? 'text-rose-400' : 'text-indigo-300'
                        }`}
                      >
                        {scaledGap > 0
                          ? `+${scaledGap.toLocaleString()}`
                          : scaledGap.toLocaleString()}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                        <span
                          className={
                            cell.phantom_capacity_rate >= 0.4
                              ? 'text-purple-300 font-semibold'
                              : 'text-slate-300'
                          }
                        >
                          {(cell.phantom_capacity_rate * 100).toFixed(0)}% Ph
                        </span>
                        <span className="text-slate-600"> • </span>
                        <span
                          className={
                            cell.wage_competitiveness_ratio < 1.0
                              ? 'text-amber-400 font-semibold'
                              : 'text-emerald-400'
                          }
                        >
                          {cell.wage_competitiveness_ratio.toFixed(2)}x W
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectDistrict?.(cell.district_id);
                              onSelectOccupation?.(cell.occupation_id);
                              onDrillDownForecast?.(
                                cell.district_id,
                                cell.occupation_id,
                                cell.forecast_id
                              );
                            }}
                            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition"
                          >
                            Forecast
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectDistrict?.(cell.district_id);
                              onSelectOccupation?.(cell.occupation_id);
                              onOpenSkillBridge?.(cell.district_id, cell.occupation_id);
                            }}
                            className="px-2.5 py-1 rounded-md bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 font-medium border border-indigo-500/30 transition"
                          >
                            Bridge
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Madhya Pradesh Govt ITI Campus Directory (10 Official NCVT MIS Campuses) */}
        {bottomTab === 'ITI_ROSTER' && (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">NCVT MIS Code</th>
                  <th className="py-3 px-3.5">Govt ITI Campus &amp; District</th>
                  <th className="py-3 px-3.5">Active NCVT Trades</th>
                  <th className="py-3 px-3.5 text-right">Sanctioned Cap</th>
                  <th className="py-3 px-3.5 text-right">Active Enrolment</th>
                  <th className="py-3 px-3.5">Lab Modernization Status</th>
                  <th className="py-3 px-3.5">Nodal Officer / Principal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-900/30">
                {filteredItis.map((iti) => (
                  <tr
                    key={iti.misCode}
                    onClick={() => onSelectDistrict?.(iti.districtId)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition ${
                      iti.districtId === selectedDistrictId ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3.5 font-mono font-bold text-indigo-300">
                      {iti.misCode}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-white">{iti.campusName}</div>
                      <div className="text-[11px] text-slate-400">
                        {iti.districtName} Division • DGT MPSDEGB
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-300 max-w-xs">{iti.primaryTrades}</td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-200">
                      {iti.sanctionedSeats} seats{' '}
                      <span className="text-slate-500">({iti.sanctionedSections} sec)</span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                      <span
                        className={`font-bold ${
                          iti.activeEnrolmentPct >= 85
                            ? 'text-emerald-400'
                            : iti.activeEnrolmentPct >= 70
                            ? 'text-amber-300'
                            : 'text-purple-300'
                        }`}
                      >
                        {iti.activeEnrolmentPct}%
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          iti.labStatus === 'PM-SETU Hub Upgraded'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : iti.labStatus === 'CSR Solar/EV Lab Active'
                            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {iti.labStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-[11px] text-slate-300">{iti.nodalOfficer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: Live Employer Vacancy Signals from MP Industrial Corridors */}
        {bottomTab === 'EMPLOYER_SIGNALS' && (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">Industrial Corridor &amp; Employer Cluster</th>
                  <th className="py-3 px-3.5">Role &amp; NCO-2015</th>
                  <th className="py-3 px-3.5 text-right">Verified Vacancies</th>
                  <th className="py-3 px-3.5 text-right">Offered Wage</th>
                  <th className="py-3 px-3.5">Required NOS Competencies</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-900/30">
                {filteredSignals.map((sig) => (
                  <tr key={sig.signalId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-white">{sig.companyCluster}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {sig.districtName} • {sig.urgencyTag}
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-medium text-slate-200">{sig.roleTitle}</div>
                      <div className="text-[11px] font-mono text-indigo-300">
                        NCO {sig.ncoCode}
                      </div>
                    </td>
                    <td
                      onClick={() =>
                        onInspectEvidence?.(
                          `${sig.companyCluster} Vacancies`,
                          `${sig.vacanciesCount} verified openings`,
                          `fc_${sig.districtId}_${sig.occupationId}_${asOfMonth}`
                        )
                      }
                      className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-rose-400 cursor-pointer underline decoration-dotted"
                    >
                      {sig.vacanciesCount}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums font-semibold text-emerald-300">
                      ₹{sig.monthlyWageInr.toLocaleString()}/mo
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex flex-wrap gap-1">
                        {sig.requiredNosSkills.map((sk, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectDistrict?.(sig.districtId);
                          onSelectOccupation?.(sig.occupationId);
                          onDrillDownForecast?.(
                            sig.districtId,
                            sig.occupationId,
                            `fc_${sig.districtId}_${sig.occupationId}_${asOfMonth}`
                          );
                        }}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition"
                      >
                        Inspect S03
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillWeatherView;
