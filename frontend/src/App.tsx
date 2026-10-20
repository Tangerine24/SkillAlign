import React, { useState } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Database,
  Layers,
  Menu,
  Network,
  Search,
  ShieldCheck,
  Sliders,
  X,
} from 'lucide-react';
import {
  SkillWeatherView,
  EvidenceLedgerView,
  ForecastDetailView,
  SkillGenomeView,
} from './views/core';
import {
  SkillBridgeView,
  SkillClockView,
  PolicySimulatorView,
  ValidationOutcomesView,
  CurriculumAndReportView,
} from './views/studio';
import { getDictionary, type LanguageMode } from './views/studio/studioTranslations';
import {
  EvidenceXRayDrawer,
  type EvidenceXRayTarget,
} from './components/EvidenceXRayDrawer';
import { TimeTravelDock } from './components/TimeTravelDock';

export type ScreenKey =
  | 's01_weather'
  | 's02_evidence'
  | 's03_forecast'
  | 's04_genome'
  | 's05_skillbridge'
  | 's06_skillclock'
  | 's07_simulator'
  | 's08_validation'
  | 's09_curriculum';

interface NavItemConfig {
  key: ScreenKey;
  code: string;
  labelEn: string;
  labelHi: string;
  subtitleEn: string;
  subtitleHi: string;
  icon: React.ReactNode;
}

interface NavGroupConfig {
  groupId: string;
  titleEn: string;
  titleHi: string;
  items: NavItemConfig[];
}

const NAV_GROUPS: NavGroupConfig[] = [
  {
    groupId: 'intelligence',
    titleEn: 'INTELLIGENCE',
    titleHi: 'कौशल इंटेलिजेंस',
    items: [
      {
        key: 's01_weather',
        code: 'S01',
        labelEn: 'Regional Overview',
        labelHi: 'क्षेत्रीय अवलोकन',
        subtitleEn:
          'Madhya Pradesh district skill tightness, govt ITI directory & employer demand signals',
        subtitleHi:
          'मध्य प्रदेश जिला कौशल मांग-आपूर्ति, शासकीय आईटीआई निर्देशिका एवं नियोक्ता संकेत',
        icon: <Compass className="w-4 h-4" />,
      },
      {
        key: 's03_forecast',
        code: 'S03',
        labelEn: 'Demand & Supply Forecast',
        labelHi: 'मांग एवं आपूर्ति पूर्वानुमान',
        subtitleEn:
          'Probabilistic P10/P50/P90 trajectory, 6-stage pipeline & phantom capacity diagnostics',
        subtitleHi:
          'संभाव्य P10/P50/P90 पूर्वानुमान, 6-चरणीय आपूर्ति पाइपलाइन एवं फैंटम क्षमता विश्लेषण',
        icon: <Activity className="w-4 h-4" />,
      },
      {
        key: 's04_genome',
        code: 'S04',
        labelEn: 'Skill Genome & NOS',
        labelHi: 'कौशल जीनोम एवं NOS',
        subtitleEn:
          'NCO-2015 × NSQF × NOS competency topology & cosine similarity reskilling pathways',
        subtitleHi:
          'NCO-2015 × NSQF × NOS दक्षता ग्राफ एवं कौशलसेतु अंतरण मार्ग',
        icon: <Network className="w-4 h-4" />,
      },
      {
        key: 's02_evidence',
        code: 'S02',
        labelEn: 'Data Provenance',
        labelHi: 'डेटा साक्ष्य पंजिका',
        subtitleEn:
          'Vacancy deduplication waterfall, PLFS informal capture & NCO-2015 steward audit queue',
        subtitleHi:
          'रिक्ति डी-डुप्लिकेशन फ़नल, PLFS अनौपचारिक गुणक एवं NCO-2015 मानवीय समीक्षा',
        icon: <Database className="w-4 h-4" />,
      },
    ],
  },
  {
    groupId: 'policy_studio',
    titleEn: 'POLICY STUDIO',
    titleHi: 'नीति स्टूडियो',
    items: [
      {
        key: 's05_skillbridge',
        code: 'S05',
        labelEn: 'SkillBridge Reskilling',
        labelHi: 'कौशलसेतु री-स्किलिंग',
        subtitleEn:
          'Adjacent trade donor-to-target conversion modules & batch deployment planner',
        subtitleHi:
          'समीपवर्ती ट्रेड रूपांतरण मॉड्यूल एवं बैच नियोजन',
        icon: <Layers className="w-4 h-4" />,
      },
      {
        key: 's06_skillclock',
        code: 'S06',
        labelEn: 'Lead-Time Clock',
        labelHi: 'लीड-टाइम घड़ी',
        subtitleEn:
          'Training lead-time race comparing fresh ITI cohorts vs PMKVY STT & SkillBridge',
        subtitleHi:
          'नवीन आईटीआई बैच बनाम PMKVY एवं कौशलसेतु समय-सीमा तुलना',
        icon: <Clock className="w-4 h-4" />,
      },
      {
        key: 's07_simulator',
        code: 'S07',
        labelEn: 'Seat & Budget Simulator',
        labelHi: 'सीट एवं बजट सिमुलेटर',
        subtitleEn:
          'NCVT section-quantized seat reallocation & multi-constraint budget optimization',
        subtitleHi:
          'NCVT सेक्शन पुनर्वितरण एवं बजट अनुकूलन सिमुलेटर',
        icon: <Sliders className="w-4 h-4" />,
      },
    ],
  },
  {
    groupId: 'governance',
    titleEn: 'GOVERNANCE',
    titleHi: 'शासन एवं सत्यापन',
    items: [
      {
        key: 's08_validation',
        code: 'S08',
        labelEn: 'Backtest & Audit Queue',
        labelHi: 'बैकटेस्ट एवं ऑडिट कतार',
        subtitleEn:
          'Out-of-time Oct 2025 replay evaluation, empirical calibration & DSC approval workflow',
        subtitleHi:
          'अक्टूबर 2025 बैकटेस्ट सत्यापन एवं डिजिटल हस्ताक्षर अनुमोदन कतार',
        icon: <Award className="w-4 h-4" />,
      },
      {
        key: 's09_curriculum',
        code: 'S09',
        labelEn: 'Curriculum & Gazette Order',
        labelHi: 'पाठ्यक्रम एवं राजपत्र आदेश',
        subtitleEn:
          'NSQF micro-credential drift radar & bilingual MP Government Gazette order generator',
        subtitleHi:
          'NSQF पाठ्यक्रम विचलन रडार एवं द्विभाषी शासकीय आदेश जनरेटर',
        icon: <BookOpen className="w-4 h-4" />,
      },
    ],
  },
];

const ALL_NAV_ITEMS: NavItemConfig[] = NAV_GROUPS.flatMap((g) => g.items);

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('s01_weather');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('rewa');
  const [selectedOccupation, setSelectedOccupation] = useState<string>('occ_solar_pv');
  const [asOfMonth, setAsOfMonth] = useState<'2025-10' | '2026-10'>('2026-10');
  const [language, setLanguage] = useState<LanguageMode>('EN');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scen_rewa_2026');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Global Evidence X-Ray Drawer state
  const [xrayTarget, setXrayTarget] = useState<EvidenceXRayTarget | null>(null);

  const dict = getDictionary(language);
  const currentNav =
    ALL_NAV_ITEMS.find((item) => item.key === activeScreen) || ALL_NAV_ITEMS[0];

  const handleInspectEvidence = (label: string, value: string, forecastId?: string) => {
    setXrayTarget({
      label,
      value,
      forecastId: forecastId || `fc_${selectedDistrict}_${selectedOccupation}_${asOfMonth}`,
    });
  };

  const handleSelectNav = (key: ScreenKey) => {
    setActiveScreen(key);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-20 flex flex-col border-r border-slate-800/80 bg-[#0B0F19] transition-all duration-200 shrink-0 ${
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'
        } ${
          mobileMenuOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center font-extrabold text-slate-950 text-xs tracking-tight shadow-sm shrink-0">
              SA
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white tracking-tight truncate">
                    {dict.brand}
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    v2.6
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  MSDE • DGT • MPSDEGB
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupId} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-2.5 pb-1 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                  {language === 'HI' ? group.titleHi : group.titleEn}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = activeScreen === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectNav(item.key)}
                    title={`${item.code} — ${language === 'HI' ? item.labelHi : item.labelEn}`}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-indigo-500/15 text-white border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border border-transparent'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  >
                    <span
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? 'text-indigo-400'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {item.icon}
                    </span>

                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">
                          {language === 'HI' ? item.labelHi : item.labelEn}
                        </span>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                            isActive
                              ? 'bg-indigo-500/25 text-indigo-200 font-semibold'
                              : 'text-slate-500 group-hover:text-slate-400'
                          }`}
                        >
                          {item.code}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Institutional Governance & Seat Matrix Lock */}
        <div className="p-3 border-t border-slate-800/80">
          {!sidebarCollapsed ? (
            <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-mono text-amber-300 font-medium">
                  <CalendarClock className="w-3.5 h-3.5 text-amber-400" />
                  NCVT Lock: 14d
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  SIH26246
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Annual ITI section reallocation window closes in 14 days.
              </p>
            </div>
          ) : (
            <div
              className="flex justify-center py-1 text-amber-400"
              title="NCVT Seat Matrix Lock: 14 Days Remaining"
            >
              <CalendarClock className="w-4 h-4" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md px-4 lg:px-6 py-3">
          <div className="max-w-[1440px] mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
            {/* Left: Mobile Menu Button + Active View Title & Subtitle */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {currentNav.code}
                  </span>
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                    {language === 'HI' ? currentNav.labelHi : currentNav.labelEn}
                  </h1>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {language === 'HI' ? currentNav.subtitleHi : currentNav.subtitleEn}
                </p>
              </div>
            </div>

            {/* Right: Unified Global Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* District Selector */}
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setActiveScenarioId(`scen_${e.target.value}_2026`);
                }}
                aria-label="Select District"
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium focus:border-indigo-500 focus:outline-none transition"
              >
                <option value="rewa">Rewa (Vindhya Solar)</option>
                <option value="indore">Indore (Malwa EV &amp; IT)</option>
                <option value="bhopal">Bhopal (Capital ESDM)</option>
                <option value="jabalpur">Jabalpur (Mahakoshal CNC)</option>
                <option value="ujjain">Ujjain (Malwa Agro/Solar)</option>
              </select>

              {/* Occupation Selector */}
              <select
                value={selectedOccupation}
                onChange={(e) => setSelectedOccupation(e.target.value)}
                aria-label="Select Occupation"
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium focus:border-indigo-500 focus:outline-none transition"
              >
                <option value="occ_solar_pv">Solar PV Installer (7411.0101)</option>
                <option value="occ_electrician">Electrician General (7411.0100)</option>
                <option value="occ_ev_tech">EV Service Lead Tech (7231.0105)</option>
                <option value="occ_mmv">Mechanic Motor Vehicle (7231.0101)</option>
                <option value="occ_cnc_prog">CNC Programmer &amp; Setter (7223.0501)</option>
                <option value="occ_data_entry">Data Entry Operator (4132.0402)</option>
              </select>

              {/* Integrated Time-Travel Pill Switch */}
              <TimeTravelDock
                variant="inline"
                asOfMonth={asOfMonth}
                onChangeAsOfMonth={setAsOfMonth}
                onOpenValidationReplay={() => setActiveScreen('s08_validation')}
              />

              {/* Evidence X-Ray Button */}
              <button
                type="button"
                onClick={() =>
                  handleInspectEvidence(
                    `${selectedDistrict.toUpperCase()} • ${selectedOccupation} Lineage`,
                    `Cutoff ${asOfMonth}`
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 border border-indigo-500/30 font-medium transition"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span>Evidence X-Ray</span>
              </button>

              {/* Live English / Hindi Bilingual Toggle */}
              <div className="inline-flex rounded-lg bg-slate-900/90 p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLanguage('EN')}
                  className={`px-2 py-1 rounded-md font-semibold transition ${
                    language === 'EN'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('HI')}
                  className={`px-2 py-1 rounded-md font-semibold transition ${
                    language === 'HI'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Non-blocking contextual strip when Time-Travel Replay (Oct 2025) is active */}
        <TimeTravelDock
          variant="banner"
          asOfMonth={asOfMonth}
          onChangeAsOfMonth={setAsOfMonth}
          onOpenValidationReplay={() => setActiveScreen('s08_validation')}
        />

        {/* Main Workspace Container */}
        <main className="flex-1 p-4 lg:p-6 max-w-[1440px] w-full mx-auto">
          {activeScreen === 's01_weather' && (
            <SkillWeatherView
              selectedDistrictId={selectedDistrict}
              selectedOccupationId={selectedOccupation}
              asOfMonth={asOfMonth}
              language={language}
              onSelectDistrict={setSelectedDistrict}
              onSelectOccupation={setSelectedOccupation}
              onDrillDownForecast={(dId, oId) => {
                setSelectedDistrict(dId);
                setSelectedOccupation(oId);
                setActiveScreen('s03_forecast');
              }}
              onOpenSkillBridge={(dId, oId) => {
                setSelectedDistrict(dId);
                setSelectedOccupation(oId);
                setActiveScreen('s05_skillbridge');
              }}
              onInspectEvidence={handleInspectEvidence}
            />
          )}

          {activeScreen === 's02_evidence' && (
            <EvidenceLedgerView
              districtId={selectedDistrict}
              occupationId={selectedOccupation}
              asOfMonth={asOfMonth}
              language={language}
              onInspectEvidence={handleInspectEvidence}
            />
          )}

          {activeScreen === 's03_forecast' && (
            <ForecastDetailView
              districtId={selectedDistrict}
              occupationId={selectedOccupation}
              asOfMonth={asOfMonth}
              language={language}
              onInspectEvidence={handleInspectEvidence}
              onNavigateTab={(tab) => setActiveScreen(tab as ScreenKey)}
            />
          )}

          {activeScreen === 's04_genome' && (
            <SkillGenomeView
              occupationId={selectedOccupation}
              districtId={selectedDistrict}
              language={language}
              onSelectOccupation={setSelectedOccupation}
              onNavigateTab={(tab) => setActiveScreen(tab as ScreenKey)}
              onInspectEvidence={handleInspectEvidence}
            />
          )}

          {activeScreen === 's05_skillbridge' && (
            <SkillBridgeView
              districtId={selectedDistrict}
              language={language}
              onNavigateTab={(tab) => {
                if (tab === 'skillclock') setActiveScreen('s06_skillclock');
                else if (tab === 'simulator') setActiveScreen('s07_simulator');
                else setActiveScreen('s06_skillclock');
              }}
            />
          )}

          {activeScreen === 's06_skillclock' && (
            <SkillClockView
              districtId={selectedDistrict}
              occupationId={selectedOccupation}
              language={language}
            />
          )}

          {activeScreen === 's07_simulator' && (
            <PolicySimulatorView
              districtId={selectedDistrict}
              language={language}
              onDecisionRecorded={(scenId) => {
                setActiveScenarioId(scenId);
                setActiveScreen('s08_validation');
              }}
            />
          )}

          {activeScreen === 's08_validation' && (
            <ValidationOutcomesView
              districtId={selectedDistrict}
              occupationId={selectedOccupation}
              cutoffDate="2025-10"
              language={language}
              onInspectEvidence={handleInspectEvidence}
            />
          )}

          {activeScreen === 's09_curriculum' && (
            <CurriculumAndReportView
              districtId={selectedDistrict}
              occupationId={selectedOccupation}
              scenarioId={activeScenarioId}
              language={language}
              onInspectEvidence={handleInspectEvidence}
            />
          )}
        </main>

        {/* Global Slide-Out Evidence X-Ray Drawer */}
        <EvidenceXRayDrawer target={xrayTarget} onClose={() => setXrayTarget(null)} />
      </div>
    </div>
  );
};

export default App;
