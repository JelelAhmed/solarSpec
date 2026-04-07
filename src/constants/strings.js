/**
 * SolarSpec User-Facing Strings
 * All strings visible to users live here. Never hardcode strings in components.
 */

// ─── APP ─────────────────────────────────────────────────────────────────────

export const APP = {
  name: 'SolarSpec',
  wordmark: 'SOLARSPEC',
  tagline: 'SIZE. DESIGN. PROPOSE.',
  subtitle: 'Technical Solar Solutions',
};

// ─── NAVIGATION ──────────────────────────────────────────────────────────────

export const NAV = {
  back: 'Back',
  settings: 'Settings',
  next: 'Next',
  viewAll: 'View All',
};

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────

export const HOME = {
  quickActionsLabel: 'QUICK ACTIONS',
  newProposalBtn: 'NEW PROPOSAL',
  portfolioLabel: 'PORTFOLIO / Recent Proposals',
  viewAll: 'View All',
  noProposals: 'No proposals yet. Tap New Proposal to get started.',
  proposalRefPrefix: 'REF:',
};

// ─── STEP LABELS ─────────────────────────────────────────────────────────────

export const STEPS = {
  step: 'STEP',
  of: 'OF',
  total: '6',
  inProgress: 'IN PROGRESS',
  finalVerification: 'FINAL VERIFICATION',
};

// ─── CLIENT DETAILS (Step 1) ─────────────────────────────────────────────────

export const CLIENT_DETAILS = {
  screenTitle: 'Client Details',
  subtitle: 'INITIAL SITE ASSESSMENT DATA',
  stepLabel: 'STEP 1 OF 6',

  clientNameLabel: 'CLIENT NAME',
  clientNamePlaceholder: 'Enter client full name',

  siteAddressLabel: 'SITE ADDRESS',
  siteAddressPlaceholder: 'Enter site address',

  assessmentDateLabel: 'ASSESSMENT DATE',
  assessmentDatePlaceholder: 'Select date',

  technicianLabel: 'ASSIGNED TECHNICIAN',
  technicianPlaceholder: 'Set in Settings',
  technicianDisabledHint: 'Pre-filled from settings',

  infoCardTitle: 'PRECISION REQUIREMENTS',
  infoCardBody:
    'Ensure the site address is accurate for your records and the client proposal.',

  nextBtn: 'NEXT STEP',
  footerNote:
    'REVIEW ALL FIELDS BEFORE PROCEEDING TO STEP 2: SYSTEM SPECIFICATIONS',
};

// ─── SYSTEM CONFIGURATION (Step 2) ───────────────────────────────────────────

export const SYSTEM_CONFIG = {
  screenTitle: 'Define Core Architecture',
  stepLabel: 'STEP 2 OF 6',
  stepRight: 'IN PROGRESS',

  inverterSectionLabel: 'INVERTER TYPE',
  separateLabel: 'Separate System',
  separateDesc: 'Independent charger and inverter units for high modularity.',
  hybridLabel: 'Hybrid Inverter',
  hybridDesc: 'All-in-one power management for streamlined efficiency.',

  chemistrySectionLabel: 'BATTERY CHEMISTRY',
  voltageSectionLabel: 'SYSTEM VOLTAGE',

  voltageNote:
    'Recommended: 48V configuration minimises current loss and supports larger expansion capacities for residential loads.',

  nextBtn: 'CONTINUE TO STEP 3',
  footerNote: 'AUTOSAVE ENABLED • ALL CONFIGURATIONS ARE REVERSIBLE',
};

// ─── LOAD INPUT (Step 3) ─────────────────────────────────────────────────────

export const LOAD_INPUT = {
  screenTitle: 'Load Input',
  stepLabel: 'SYSTEM ANALYSIS',
  stepRight: 'STEP 3 OF 6',

  estimationCardLabel: 'CURRENT ESTIMATION',
  totalLoadPrefix: 'Total Load: ',
  totalLoadSuffix: ' W',
  dailyPrefix: 'Daily: ',
  dailySuffix: ' Wh',

  appliancesLabel: 'APPLIANCES',
  unitConsumptionPrefix: 'UNIT CONSUMPTION: ',
  unitConsumptionSuffix: 'W per unit',

  quantityLabel: 'QUANTITY',
  energyRequiredLabel: 'ENERGY REQUIRED',
  dailyDurationLabel: 'DAILY DURATION',
  hoursUnit: 'hrs',

  addApplianceLabel: 'Add Appliance',

  // Bottom sheet
  sheetTitle: 'Select Appliance',
  customLabel: 'CUSTOM',
  customNamePlaceholder: 'Appliance name',
  customWattsPlaceholder: 'Wattage (W)',
  addCustomBtn: 'ADD CUSTOM',

  nextBtn: 'NEXT STEP',
};

// ─── SYSTEM SIZING (Step 4) ─────────────────────────────────────────────────

export const SYSTEM_SIZING = {
  screenTitle: 'System Sizing',
  subtitle: 'Calculated from your appliance load and system configuration.',
  stepLabel: 'STEP 4 OF 6',
  stepRight: 'SYSTEM SIZING',

  inverterLabel: 'INVERTER SIZE',
  batteryLabel: 'BATTERY CAPACITY',
  solarLabel: 'SOLAR ARRAY',
  backupLabel: 'BACKUP DURATION',
  dailyEnergyLabel: 'DAILY ENERGY',
  controllerLabel: 'CHARGE CONTROLLER',

  panelTypeMonocrystalline: 'Monocrystalline Panels',
  avgLoad: 'At',
  avgLoadSuffix: 'W Avg Load',
  avgYield: 'Avg. Yield / Day',

  wiringLabel: 'WIRING:',
  panelWiringPrefix: 'Panels:',
  batteryWiringPrefix: 'Battery:',

  efficiencyLabel: 'EFFICIENCY ASSUMPTIONS',
  inverterEffLabel: 'Inverter efficiency',
  panelDeratingLabel: 'Panel derating',
  cablingLossLabel: 'System cabling loss',
  updateConstantsBtn: 'Update Constants',

  nextBtn: 'NEXT',
};

// ─── SYSTEM DIAGRAM (Step 5) ─────────────────────────────────────────────────

export const SYSTEM_DIAGRAM = {
  screenTitle: 'System Diagram',
  subtitle: 'TAP ANY COMPONENT TO VIEW DETAILS',
  stepLabel: 'STEP 5 OF 6',

  dcLegend: 'DC CURRENT',
  acLegend: 'AC CURRENT',

  topologyLabel: 'SYSTEM TOPOLOGY',
  phaseLabel: 'PHASE CONFIGURATION',
  phaseValue: 'Single Phase',
  storageLabel: 'STORAGE CAPACITY',

  nextBtn: 'NEXT STEP →',
};

// ─── COMPONENT LIST (Step 6) ─────────────────────────────────────────────────

export const COMPONENT_LIST = {
  screenTitle: 'Component List',
  subtitle:
    'Review the technical specification manifest. Add optional pricing for accurate ROI calculations.',
  stepLabel: 'ENGINEERING STEP 6 OF 6',
  stepRight: 'FINAL VERIFICATION',

  qtyPrefix: 'QTY',
  pricePlaceholder: 'Enter price',
  currencySymbol: '₦',

  infoTitle: 'Note:',
  infoBody:
    'Prices are optional. Leave blank to omit from the final proposal document.',

  totalCardLabel: 'TECHNICAL DOSSIER SUMMARY',
  totalLabel: 'TOTAL ESTIMATED COST:',

  generateBtn: 'GENERATE PROPOSAL',
};

// ─── PROPOSAL PREVIEW ────────────────────────────────────────────────────────

export const PROPOSAL_PREVIEW = {
  headerTitle: 'Proposal Preview',
  editBtn: 'Edit',

  documentBrandName: 'SOLARSPEC',
  documentSubtitle: 'TECHNICAL SOLAR SOLUTIONS',
  proposalPrefix: 'PROPOSAL #',

  clientDetailsLabel: 'CLIENT DETAILS',
  systemRecLabel: 'SYSTEM RECOMMENDATION',
  applianceTableLabel: 'APPLIANCE TABLE & LOAD ANALYSIS',
  componentsLabel: 'SYSTEM COMPONENTS',

  tableColItem: 'ITEM',
  tableColQty: 'QTY',
  tableColWatts: 'WATTS',
  tableColDailyUsage: 'DAILY USAGE',

  totalInvestmentLabel: 'TOTAL SYSTEM INVESTMENT',

  generatedByFooter: 'Generated with SolarSpec',

  shareFabLabel: 'Share',
  saveFabLabel: 'Save PDF',
};

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export const SETTINGS = {
  screenTitle: 'Settings',
  wordmark: 'SOLARSPEC',

  profileLabel: 'PROFILE CONFIGURATION',
  profileHeading: 'Your Business',

  businessNameLabel: 'BUSINESS NAME',
  businessNamePlaceholder: 'Enter business name',
  technicianNameLabel: 'TECHNICIAN NAME',
  technicianNamePlaceholder: 'Enter technician name',
  uploadLogoLabel: 'UPLOAD LOGO',

  defaultsLabel: 'STANDARD OPERATING PARAMETERS',
  defaultsHeading: 'Defaults',

  batteryChemistryLabel: 'BATTERY CHEMISTRY',
  systemVoltageLabel: 'SYSTEM VOLTAGE',
  inverterTypeLabel: 'INVERTER TYPE',
  peakSunHoursLabel: 'PEAK SUN HOURS',
  peakSunHoursUnit: 'hrs/day',

  aboutLabel: 'PLATFORM INFORMATION',
  aboutHeading: 'About',

  appVersionLabel: 'App Version',
  rateLabel: 'Rate SolarSpec',
  privacyLabel: 'Privacy Policy',
};

// ─── ERRORS ──────────────────────────────────────────────────────────────────

export const ERRORS = {
  requiredField: 'This field is required.',
  invalidNumber: 'Please enter a valid number.',
  noAppliances: 'Add at least one appliance before proceeding.',
  pdfFailed: 'Failed to generate PDF. Please try again.',
  storageFailed: 'Failed to save data. Please check your storage.',
  loadFailed: 'Failed to load saved proposals.',
};

// ─── ADGMOB LABELS ───────────────────────────────────────────────────────────

export const ADS = {
  bannerLabel: 'ADMOB BANNER (320×50)',
};
