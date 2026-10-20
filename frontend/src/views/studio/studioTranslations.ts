/**
 * SkillAlign — Bilingual (English/Hindi) Policy Dictionary & Sovereign Badges
 * SIH26246: AI-Enabled Labour Market Intelligence for MSDE / DGT / MPSDEGB
 */

export type LanguageMode = 'EN' | 'HI' | 'BILINGUAL';

export interface TranslationDictionary {
  brand: string;
  subTitle: string;
  sovereignHeader: string;
  governanceBanner: string;
  pilotState: string;
  
  // S05 SkillBridge
  s05Title: string;
  s05Subtitle: string;
  donorTrade: string;
  targetTrade: string;
  sharedCompetencies: string;
  missingCompetencies: string;
  bridgeModule: string;
  bridgeDuration: string;
  bridgeCost: string;
  safetyFloor: string;
  safetyFloorMeter: string;
  sendToSkillClock: string;
  qualificationCriteria: string;
  placementRate: string;
  leadTimeSaved: string;
  wageUplift: string;
  
  // S06 SkillClock
  s06Title: string;
  s06Subtitle: string;
  demandSurgeWindow: string;
  trackA: string;
  trackB: string;
  leadTimeMismatch: string;
  onTimeResolution: string;
  annualAdmissionCycle: string;
  completionRate: string;
  batchDelay: string;
  ojtDuration: string;
  sensitivityControls: string;
  
  // S07 Policy Simulator
  s07Title: string;
  s07Subtitle: string;
  districtBudget: string;
  availableTrainers: string;
  labCapacity: string;
  ncvtSectionMultiples: string;
  scenarioBaseline: string;
  scenarioPlanA: string;
  scenarioPlanB: string;
  scenarioPlanC: string;
  recordDecision: string;
  gapReduction: string;
  budgetUtilization: string;
  constraintCompliant: string;
  
  // S08 Validation & Time Travel
  s08Title: string;
  s08Subtitle: string;
  backtestScorecard: string;
  naiveBenchmark: string;
  timeTravelReplay: string;
  rewindOct2025: string;
  forwardOct2026: string;
  groundTruth: string;
  actionQueue: string;
  approve: string;
  defer: string;
  lockedAdvisory: string;
  
  // S09 Curriculum & Planning Brief
  s09Title: string;
  s09Subtitle: string;
  curriculumDrift: string;
  emergingSkills: string;
  unmappedDemand: string;
  sscWorkflow: string;
  planningBrief: string;
  printOrder: string;
  apiInspector: string;
  downloadCsv: string;
  syntheticBanner: string;
  observedBanner: string;
}

export const DICTIONARY: Record<'EN' | 'HI', TranslationDictionary> = {
  EN: {
    brand: 'SkillAlign',
    subTitle: 'AI-Enabled Labour Market Intelligence & Skill Forecasting Engine',
    sovereignHeader: 'Ministry of Skill Development & Entrepreneurship (MSDE) • Government of India',
    governanceBanner: 'Madhya Pradesh State Skill Development & Employment Generation Board (MPSDEGB)',
    pilotState: 'Madhya Pradesh (MP Pilot: 5 Districts x 4 Sectors x 6 Occupations)',
    
    // S05
    s05Title: 'SkillBridge Cross-Occupation Transition Planner',
    s05Subtitle: 'NOS Competency Overlap, Fast-Track Reskilling Modules & Donor Pool Conservation',
    donorTrade: 'Surplus Donor Trade',
    targetTrade: 'Shortage Target Trade',
    sharedCompetencies: 'Shared NOS Competencies',
    missingCompetencies: 'Missing Target Competencies (Bridge Curriculum)',
    bridgeModule: 'PMKVY 4.0 RPL / Short-Term Bridge Module',
    bridgeDuration: 'Bridge Duration',
    bridgeCost: 'Cost per Trainee',
    safetyFloor: 'Donor Safety Floor',
    safetyFloorMeter: 'Live Donor-Pool Conservation Meter',
    sendToSkillClock: 'Send Pathway to SkillClock & Simulator',
    qualificationCriteria: 'Eligibility & Entry Gate',
    placementRate: 'Projected Placement Rate',
    leadTimeSaved: 'Lead Time Saved',
    wageUplift: 'Expected Wage Uplift',
    
    // S06
    s06Title: 'SkillClock Lead-Time & Demand Persistence Race',
    s06Subtitle: 'Dual-Track Timeline Race: Standard DGT ITI 24m vs PMKVY 45-90d SkillBridge Route',
    demandSurgeWindow: 'Forecasted Demand Surge Window (T-12m to T+12m)',
    trackA: 'Track A: Standard DGT/ITI Fresh Batch (Annual Cycle + 12-24m)',
    trackB: 'Track B: SkillBridge PMKVY Fast-Track Route (30-90 Days)',
    leadTimeMismatch: 'LEAD-TIME MISMATCH WARNING',
    onTimeResolution: 'ON-TIME DEFICIT RESOLUTION',
    annualAdmissionCycle: 'Annual Admission Gate (August)',
    completionRate: 'Completion & Retention Yield',
    batchDelay: 'Administrative Mobilization Delay',
    ojtDuration: 'On-the-Job Training (OJT)',
    sensitivityControls: 'Simulation Sensitivity Controls',
    
    // S07
    s07Title: 'Constrained Policy Simulator & What-If Studio',
    s07Subtitle: 'Optimizing Reallocation under NCVT Section Multiples (20/24/40), Budget & Lab Limits',
    districtBudget: 'District Budget Allocation',
    availableTrainers: 'Master Certified Trainers',
    labCapacity: 'Lab Workstation Capacity',
    ncvtSectionMultiples: 'NCVT Section Multiples (Strict Quantization)',
    scenarioBaseline: 'Scenario 0: Baseline (Do Nothing)',
    scenarioPlanA: 'Plan A: Freeze Phantom Capacity & Add ITI Sections',
    scenarioPlanB: 'Plan B: Targeted SkillBridge Transition Cohorts',
    scenarioPlanC: 'Plan C: AI-Suggested Optimal Hybrid Realignment',
    recordDecision: 'Record Official Planner Decision (Human-in-the-Loop)',
    gapReduction: 'Net Skill Gap Reduction',
    budgetUtilization: 'Budget Utilization',
    constraintCompliant: 'All NCVT & Safety Floor Constraints Respected',
    
    // S08
    s08Title: 'Model Validation, Saved Decisions & Time-Travel Outcome Loop',
    s08Subtitle: 'Walk-Forward Backtesting Scorecard & Oct 2025 Counterfactual Ground-Truth Replay',
    backtestScorecard: 'Walk-Forward Backtest Scorecard (T-12m to T0)',
    naiveBenchmark: 'Seasonal-Naive Baseline Outperformed',
    timeTravelReplay: 'Time-Travel Counterfactual Replay (Oct 2025 Shock)',
    rewindOct2025: 'Rewind to Oct 2025 (T-12m)',
    forwardOct2026: 'Ground-Truth Oct 2026 (T0)',
    groundTruth: 'Actual Ground Truth Postings',
    actionQueue: 'District Action Playbook & Governance Queue',
    approve: 'Approve & Issue Order',
    defer: 'Defer / Request Field Audit',
    lockedAdvisory: 'Locked Advisory (Tier 3 Empirical Bayes)',
    
    // S09
    s09Title: 'Curriculum Drift Radar & Sovereign Policy Order Export',
    s09Subtitle: 'Emerging Unmapped Skill Detection, Sector Skill Council Workflow & Official Gazette Brief',
    curriculumDrift: 'NSQF Curriculum Drift Score',
    emergingSkills: 'High-Frequency Emerging Unmapped Skills',
    unmappedDemand: 'Unmapped Employer Demand Share',
    sscWorkflow: 'Sector Skill Council (SSC) Review Workflow',
    planningBrief: 'Official MSDE / MPSDEGB Planning Brief',
    printOrder: 'Print Official Executive Brief (PDF)',
    apiInspector: 'Live API Inspector (/api/v1/reports)',
    downloadCsv: 'Download Order Schedule (CSV)',
    syntheticBanner: 'SYNTHETIC PILOT DEMO FEED • FOR POLICY EVALUATION ONLY',
    observedBanner: 'OBSERVED PUBLIC ANCHOR • OFFICIAL MSDE / DGT / PLFS BENCHMARK',
  },
  HI: {
    brand: 'स्किलअलाइन (SkillAlign)',
    subTitle: 'एआई-सक्षम श्रम बाजार आसूचना एवं कौशल मांग-आपूर्ति पूर्वानुमान इंजन',
    sovereignHeader: 'कौशल विकास एवं उद्यमशीलता मंत्रालय (MSDE) • भारत सरकार',
    governanceBanner: 'मध्य प्रदेश राज्य कौशल विकास एवं रोजगार निर्माण बोर्ड (MPSDEGB)',
    pilotState: 'मध्य प्रदेश पायलट (5 जिले x 4 क्षेत्र x 6 व्यवसाय)',
    
    // S05
    s05Title: 'कौशलसेतु व्यवसाय संक्रमण योजनाकार (SkillBridge Planner)',
    s05Subtitle: 'राष्ट्रीय व्यावसायिक मानक (NOS) अतिव्यापन, त्वरित पुनर्प्रशिक्षण एवं दाता संवर्ग संरक्षण',
    donorTrade: 'अधिशेष दाता व्यवसाय (Surplus Donor Trade)',
    targetTrade: 'मांग-आधिक्य लक्षित व्यवसाय (Target Shortage Trade)',
    sharedCompetencies: 'साझा राष्ट्रीय व्यावसायिक मानक (Shared NOS)',
    missingCompetencies: 'पूरक आवश्यक दक्षताएं (Bridge Curriculum)',
    bridgeModule: 'पीएमकेवीवाई 4.0 ब्रिज मॉड्यूल (PMKVY 4.0 STT/RPL)',
    bridgeDuration: 'ब्रिज प्रशिक्षण अवधि',
    bridgeCost: 'प्रति अभ्यर्थी व्यय',
    safetyFloor: 'दाता न्यूनतम सुरक्षा सीमा (Safety Floor)',
    safetyFloorMeter: 'दाता संवर्ग संरक्षण मीटर (Conservation Meter)',
    sendToSkillClock: 'कौशल-घड़ी एवं सिमुलेटर को प्रेषित करें',
    qualificationCriteria: 'पात्रता एवं प्रवेश मानदंड',
    placementRate: 'अनुमानित नियोजन दर',
    leadTimeSaved: 'बचत हुआ पूर्वता समय (Lead Time Saved)',
    wageUplift: 'अपेक्षित वेतन वृद्धि',
    
    // S06
    s06Title: 'कौशल-घड़ी (SkillClock) पूर्वता समय एवं मांग स्थायित्व तुलना',
    s06Subtitle: 'द्वि-पथ समयरेखा दौड़: मानक आईटीआई 24 माह बनाम पीएमकेवीवाई 45-90 दिवस कौशलसेतु',
    demandSurgeWindow: 'पूर्वानुमानित मांग उछाल कालखंड (Demand Surge Window)',
    trackA: 'पथ क: मानक डीजीटी/आईटीआई नया बैच (वार्षिक चक्र + 12-24 माह)',
    trackB: 'पथ ख: कौशलसेतु पीएमकेवीवाई त्वरित पथ (30-90 दिवस)',
    leadTimeMismatch: 'पूर्वता समय बेमेल चेतावनी (LEAD-TIME MISMATCH)',
    onTimeResolution: 'समयबद्ध समाधान (ON-TIME RESOLUTION)',
    annualAdmissionCycle: 'वार्षिक प्रवेश चक्र (अगस्त)',
    completionRate: 'सफलता एवं प्रतिधारण दर',
    batchDelay: 'प्रशासनिक प्रारंभ विलंब',
    ojtDuration: 'कार्यस्थल प्रशिक्षण (OJT)',
    sensitivityControls: 'संवेदनशीलता नियंत्रण स्लाइडर्स',
    
    // S07
    s07Title: 'सीमित नीति अनुकारक एवं परिदृश्य स्टूडियो (Policy Simulator)',
    s07Subtitle: 'एनसीवीटी अनुभाग गुणक (20/24/40 सीटें), बजट एवं लैब क्षमता सीमाबद्ध इष्टतम पुनरावंटन',
    districtBudget: 'जिला बजट आवंटन',
    availableTrainers: 'उपलब्ध प्रमाणित मास्टर प्रशिक्षक',
    labCapacity: 'कार्यशाला लैब क्षमता',
    ncvtSectionMultiples: 'एनसीवीटी अनुभाग गुणक (Strict Multiples of 20/24/40)',
    scenarioBaseline: 'परिदृश्य 0: यथास्थिति (कोई कार्रवाई नहीं)',
    scenarioPlanA: 'योजना क: अप्रयुक्त सीटें निरस्त कर नई आईटीआई सीटें जोड़ें',
    scenarioPlanB: 'योजना ख: लक्षित कौशलसेतु संक्रमण दल',
    scenarioPlanC: 'योजना ग: एआई-सुझावित इष्टतम मिश्रित योजना',
    recordDecision: 'आधिकारिक योजनाकार निर्णय दर्ज करें (मानव-सत्यापित)',
    gapReduction: 'शुद्ध कौशल अंतराल में कमी',
    budgetUtilization: 'बजट उपयोगिता',
    constraintCompliant: 'सभी एनसीवीटी एवं सुरक्षा सीमा शर्तें संतुष्ट',
    
    // S08
    s08Title: 'मॉडल सत्यापन, सहेजे गए निर्णय एवं समय-यात्रा प्रति-तथ्यात्मक परिणाम',
    s08Subtitle: 'बैकटेस्ट स्कोरकार्ड एवं अक्टूबर 2025 ऐतिहासिक मांग उछाल का सत्यता सत्यापन',
    backtestScorecard: 'वॉक-फॉरवर्ड बैकटेस्ट स्कोरकार्ड (T-12m से T0)',
    naiveBenchmark: 'मौसमी-नैव आधार रेखा से बेहतर प्रदर्शन',
    timeTravelReplay: 'समय-यात्रा प्रति-तथ्यात्मक पुनरावलोकन (Oct 2025)',
    rewindOct2025: 'अक्टूबर 2025 पर रिवाइंड करें (T-12m)',
    forwardOct2026: 'अक्टूबर 2026 वास्तविक परिणाम (T0)',
    groundTruth: 'वास्तविक दर्ज की गई मांग (Ground Truth)',
    actionQueue: 'जिला कार्य योजना एवं प्रशासनिक कतार',
    approve: 'स्वीकृत करें एवं आदेश जारी करें',
    defer: 'स्थगित / क्षेत्रीय जांच अनुशंसित',
    lockedAdvisory: 'अवरुद्ध परामर्श (टियर 3 एम्पिरिकल बेयस)',
    
    // S09
    s09Title: 'पाठ्यक्रम विचलन राडार एवं आधिकारिक नीति आदेश संक्षेप',
    s09Subtitle: 'नवीन अपंजीकृत कौशल खोज, सेक्टर स्किल काउंसिल अनुमोदन एवं आधिकारिक गजट संक्षेप',
    curriculumDrift: 'एनएसक्यूएफ पाठ्यक्रम विचलन स्कोर',
    emergingSkills: 'उच्च-आवृत्ति उभरते हुए अपंजीकृत कौशल',
    unmappedDemand: 'अपंजीकृत नियोक्ता मांग हिस्सा',
    sscWorkflow: 'सेक्टर स्किल काउंसिल (SSC) समीक्षा प्रक्रिया',
    planningBrief: 'आधिकारिक एमएसडीई / एमपीएसडीईजीबी नीति आदेश',
    printOrder: 'आधिकारिक कार्यकारी संक्षेप प्रिंट करें (PDF)',
    apiInspector: 'लाइव एपीआई दर्शक (/api/v1/reports)',
    downloadCsv: 'आदेश अनुसूची डाउनलोड करें (CSV)',
    syntheticBanner: 'सिंथेटिक पायलट डेमो फीड • केवल नीति मूल्यांकन हेतु',
    observedBanner: 'अवलोकित सार्वजनिक आधार • आधिकारिक एमएसडीई / डीजीटी / पीएलएफएस मानक',
  },
};

export function getDictionary(lang: LanguageMode): TranslationDictionary {
  if (lang === 'HI') return DICTIONARY.HI;
  return DICTIONARY.EN;
}
