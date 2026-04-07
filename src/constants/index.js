/**
 * SolarSpec Constants
 * All app-wide constants. No calculation logic here.
 * Every constant referenced by calculations.js comes from this file.
 */

// ─── SYSTEM CONFIGURATION ────────────────────────────────────────────────────

/** Supported system voltage options (V) */
export const SYSTEM_VOLTAGE_OPTIONS = [12, 24, 48];

/** Supported battery unit voltage options (V) */
export const BATTERY_VOLTAGE_OPTIONS = [2, 6, 12];

/** Default system voltage (V) */
export const DEFAULT_SYSTEM_VOLTAGE = 48;

/** Default battery unit voltage (V) */
export const DEFAULT_BATTERY_VOLTAGE = 12;

/** Default battery unit capacity (Ah) */
export const DEFAULT_BATTERY_AH = 100;

/** Default days of battery autonomy */
export const DAYS_AUTONOMY_DEFAULT = 1;

/** Default peak sun hours per day */
export const PEAK_SUN_HOURS_DEFAULT = 5;

// ─── INVERTER TYPES ──────────────────────────────────────────────────────────

/** Inverter type identifiers */
export const INVERTER_TYPE = {
  SEPARATE: 'separate',
  HYBRID: 'hybrid',
};

// ─── BATTERY CHEMISTRY ───────────────────────────────────────────────────────

/**
 * Battery chemistry identifiers, display labels, depth of discharge
 * and round-trip efficiency values.
 * DoD: fraction of usable capacity (e.g. 0.5 = 50%)
 * Efficiency: round-trip efficiency (e.g. 0.80 = 80%)
 */
export const BATTERY_CHEMISTRY = {
  LEAD_ACID: {
    id: 'lead_acid',
    label: 'Lead-acid',
    dod: 0.50,
    efficiency: 0.80,
  },
  AGM: {
    id: 'agm',
    label: 'AGM',
    dod: 0.60,
    efficiency: 0.85,
  },
  GEL: {
    id: 'gel',
    label: 'Gel',
    dod: 0.60,
    efficiency: 0.85,
  },
  LITHIUM: {
    id: 'lithium',
    label: 'Lithium (LiFePO4)',
    dod: 0.90,
    efficiency: 0.95,
  },
};

/** Default battery chemistry */
export const DEFAULT_BATTERY_CHEMISTRY = BATTERY_CHEMISTRY.LITHIUM;

// ─── EFFICIENCY DEFAULTS ─────────────────────────────────────────────────────

/** Default inverter efficiency (fraction, e.g. 0.90 = 90%) */
export const DEFAULT_INVERTER_EFFICIENCY = 0.90;

/** Default panel derating factor for temperature/dust/wiring losses */
export const DEFAULT_PANEL_DERATING = 0.80;

/** MPPT charge controller efficiency */
export const MPPT_EFFICIENCY = 0.95;

/** PWM charge controller efficiency */
export const PWM_EFFICIENCY = 0.75;

/** Inverter safety factor for sizing (1.25 = 25% headroom) */
export const INVERTER_SAFETY_FACTOR = 1.25;

/** Charge controller safety factor for sizing */
export const CONTROLLER_SAFETY_FACTOR = 1.25;

// ─── STANDARD COMPONENT SIZES ────────────────────────────────────────────────

/** Standard inverter sizes (VA) — round up to nearest */
export const INVERTER_STANDARDS = [1000, 1500, 2000, 3000, 3500, 5000, 7500, 10000];

/** Standard charge controller current ratings (A) — round up to nearest */
export const CONTROLLER_STANDARDS = [10, 20, 30, 40, 60, 80, 100];

/** Standard MCB / changeover switch current ratings (A) */
export const MCB_STANDARDS = [6, 10, 16, 20, 25, 32, 40, 63, 80, 100];

// ─── PANEL LIBRARY ───────────────────────────────────────────────────────────

/** Available panel wattages (W) */
export const PANEL_WATTAGES = [200, 250, 300, 350, 400, 450, 500, 550];

/** Default selected panel wattage (W) */
export const DEFAULT_PANEL_WATTAGE = 400;

/**
 * Panel electrical specs by voltage tier.
 * 12V/24V systems → 60-cell panels (Voc ~22V, Isc ~10A)
 * 48V systems     → 72-cell panels (Voc ~37V, Isc ~10A)
 */
export const PANEL_SPECS = {
  LOW_VOLTAGE: {
    // Used for 12V and 24V systems
    cellCount: 60,
    voc: 22,   // Open-circuit voltage (V)
    isc: 10,   // Short-circuit current (A)
    voltageThreshold: 24, // Max system voltage for this spec
  },
  HIGH_VOLTAGE: {
    // Used for 48V systems
    cellCount: 72,
    voc: 37,   // Open-circuit voltage (V)
    isc: 10,   // Short-circuit current (A)
    voltageThreshold: 48,
  },
};

/** AC output voltage used for load calculations (V) */
export const AC_OUTPUT_VOLTAGE = 220;

// ─── PRESET APPLIANCE LIBRARY ────────────────────────────────────────────────

/**
 * Preset appliance definitions.
 * dutyCycle: fraction of time appliance actually draws rated power
 *   (e.g. fridge runs ~30% of the time, so effective load = watts × 0.3)
 * icon: MaterialCommunityIcons name
 */
export const PRESET_APPLIANCES = [
  {
    id: 'led_bulb',
    label: 'LED Bulb',
    watts: 10,
    dutyCycle: 1.0,
    icon: 'lightbulb-outline',
  },
  {
    id: 'standing_fan',
    label: 'Standing Fan',
    watts: 60,
    dutyCycle: 1.0,
    icon: 'fan',
  },
  {
    id: 'ceiling_fan',
    label: 'Ceiling Fan',
    watts: 75,
    dutyCycle: 1.0,
    icon: 'ceiling-fan',
  },
  {
    id: 'led_tv',
    label: 'LED Smart TV',
    watts: 100,
    dutyCycle: 1.0,
    icon: 'television',
  },
  {
    id: 'decoder',
    label: 'Decoder',
    watts: 20,
    dutyCycle: 1.0,
    icon: 'set-top-box',
  },
  {
    id: 'phone_charger',
    label: 'Phone Charger',
    watts: 10,
    dutyCycle: 1.0,
    icon: 'cellphone-charging',
  },
  {
    id: 'refrigerator',
    label: 'Refrigerator',
    watts: 150,
    dutyCycle: 0.30, // Compressor duty cycle — effective load = 45W
    icon: 'fridge-outline',
  },
  {
    id: 'ac_1hp',
    label: 'AC Unit (1HP)',
    watts: 750,
    dutyCycle: 1.0,
    icon: 'air-conditioner',
  },
  {
    id: 'ac_1_5hp',
    label: 'AC Unit (1.5HP)',
    watts: 1100,
    dutyCycle: 1.0,
    icon: 'air-conditioner',
  },
  {
    id: 'washing_machine',
    label: 'Washing Machine',
    watts: 500,
    dutyCycle: 1.0,
    icon: 'washing-machine',
  },
  {
    id: 'water_pump',
    label: 'Water Pump',
    watts: 750,
    dutyCycle: 1.0,
    icon: 'water-pump',
  },
  {
    id: 'custom',
    label: 'Custom',
    watts: null, // User-defined
    dutyCycle: 1.0,
    icon: 'pencil-outline',
  },
];

// ─── BOTTOM SHEET ────────────────────────────────────────────────────────────

/** @gorhom/bottom-sheet snap points */
export const BOTTOM_SHEET_SNAP_POINTS = ['10%', '55%'];

// ─── PROPOSAL ────────────────────────────────────────────────────────────────

/** Max proposals stored in local storage */
export const MAX_STORED_PROPOSALS = 10;

/** Proposal reference prefix */
export const PROPOSAL_REF_PREFIX = 'SS';

// ─── EFFICIENCY BOUNDS ───────────────────────────────────────────────────────

/** Minimum allowable efficiency value (fraction) for any efficiency input */
export const MIN_EFFICIENCY = 0.50;

/** Maximum allowable efficiency value (fraction) for any efficiency input */
export const MAX_EFFICIENCY = 0.99;


