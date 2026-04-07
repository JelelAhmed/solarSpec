/**
 * SolarSpec Calculation Engine
 * All solar sizing formulas live exclusively in this file.
 * No calculation logic exists in any component, screen, or service.
 *
 * Every constant is imported from /src/constants/index.js.
 * Every function is JSDoc-documented with parameter types and return shapes.
 * All return value keys include units in their names (e.g. capacityAh, sizeVA).
 */

import {
  INVERTER_STANDARDS,
  CONTROLLER_STANDARDS,
  MCB_STANDARDS,
  PANEL_SPECS,
  AC_OUTPUT_VOLTAGE,
  INVERTER_SAFETY_FACTOR,
  CONTROLLER_SAFETY_FACTOR,
  MIN_EFFICIENCY,
  MAX_EFFICIENCY,
  PROPOSAL_REF_PREFIX,
} from '../constants/index';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Rounds a value up to the nearest entry in an ascending standards array.
 * If value exceeds all standards, returns the largest standard.
 *
 * @param {number} value - The raw calculated value to round up
 * @param {number[]} standards - Ascending array of standard sizes
 * @returns {number} The nearest standard size at or above value
 */
export function roundUpToStandard(value, standards) {
  for (let i = 0; i < standards.length; i++) {
    if (value <= standards[i]) return standards[i];
  }
  return standards[standards.length - 1];
}

/**
 * Clamps an efficiency value to the allowed [MIN_EFFICIENCY, MAX_EFFICIENCY] range.
 *
 * @param {number} efficiency - Raw efficiency fraction (0–1)
 * @returns {number} Clamped efficiency fraction
 */
export function clampEfficiency(efficiency) {
  return Math.max(MIN_EFFICIENCY, Math.min(MAX_EFFICIENCY, efficiency));
}

/**
 * Selects panel specs based on system voltage.
 * 12V and 24V → 60-cell panels (Voc ~22V, Isc ~10A)
 * 48V         → 72-cell panels (Voc ~37V, Isc ~10A)
 *
 * @param {number} systemVoltageV - System voltage (12, 24, or 48)
 * @returns {{ voc: number, isc: number, cellCount: number }}
 */
export function getPanelSpecsForVoltage(systemVoltageV) {
  if (systemVoltageV <= PANEL_SPECS.LOW_VOLTAGE.voltageThreshold) {
    return PANEL_SPECS.LOW_VOLTAGE;
  }
  return PANEL_SPECS.HIGH_VOLTAGE;
}

// ─── CORE FORMULAS ───────────────────────────────────────────────────────────

/**
 * Calculates the total daily energy load from all appliances.
 * Appliances with a dutyCycle < 1 (e.g. fridge at 0.3) have their
 * effective wattage reduced: effectiveW = watts × dutyCycle.
 *
 * @param {Array<{
 *   watts: number,
 *   quantity: number,
 *   dailyHours: number,
 *   dutyCycle?: number
 * }>} appliances - Array of appliance objects
 * @returns {{ totalDailyWh: number, peakWatts: number }}
 *   totalDailyWh: total energy consumed per day (Wh)
 *   peakWatts: sum of rated (nameplate) watts × quantity, no duty cycle (W)
 */
export function calculateTotalDailyLoad(appliances) {
  let totalDailyWh = 0;
  let peakWatts = 0;

  for (const appliance of appliances) {
    const { watts, quantity, dailyHours, dutyCycle = 1.0 } = appliance;
    const effectiveWatts = watts * dutyCycle;
    totalDailyWh += effectiveWatts * quantity * dailyHours;
    peakWatts += watts * quantity; // peak uses nameplate, not duty-cycle-adjusted
  }

  return { totalDailyWh, peakWatts };
}

/**
 * Adjusts the raw daily Wh load to account for system losses.
 * Formula: adjustedWh = totalDailyWh ÷ inverterEfficiency ÷ batteryEfficiency
 *
 * @param {number} totalDailyWh - Raw daily load (Wh) from calculateTotalDailyLoad
 * @param {number} inverterEfficiency - Inverter efficiency fraction (0.5–0.99)
 * @param {number} batteryEfficiency - Battery round-trip efficiency fraction (0.5–0.99)
 * @returns {{ adjustedWh: number }}
 */
export function calculateAdjustedLoad(totalDailyWh, inverterEfficiency, batteryEfficiency) {
  const invEff = clampEfficiency(inverterEfficiency);
  const batEff = clampEfficiency(batteryEfficiency);
  const adjustedWh = totalDailyWh / invEff / batEff;
  return { adjustedWh };
}

/**
 * Calculates the required battery bank capacity in Ah.
 * Formula: capacityAh = (adjustedWh × daysAutonomy) ÷ (systemVoltageV × dod)
 * Result is rounded up to the nearest whole number.
 *
 * @param {number} adjustedWh - Adjusted daily load (Wh)
 * @param {number} systemVoltageV - System voltage (V)
 * @param {number} dod - Depth of discharge fraction (e.g. 0.9 for Lithium)
 * @param {number} daysAutonomy - Days of battery backup required
 * @returns {{ batteryCapacityAh: number }}
 */
export function calculateBatteryCapacity(adjustedWh, systemVoltageV, dod, daysAutonomy) {
  const batteryCapacityAh = Math.ceil(
    (adjustedWh * daysAutonomy) / (systemVoltageV * dod)
  );
  return { batteryCapacityAh };
}

/**
 * Calculates the series/parallel battery bank configuration.
 * Series batteries raise voltage to match the system voltage.
 * Parallel strings add capacity (Ah).
 *
 * @param {number} requiredCapacityAh - Battery bank total Ah needed
 * @param {number} systemVoltageV - Target system voltage (V)
 * @param {number} batteryVoltageV - Individual battery unit voltage (V)
 * @param {number} batteryUnitAh - Individual battery unit capacity (Ah)
 * @returns {{
 *   seriesCount: number,
 *   parallelCount: number,
 *   totalBankAh: number,
 *   totalBankV: number,
 *   totalUnits: number,
 *   configLabel: string
 * }}
 */
export function calculateBatteryConfig(
  requiredCapacityAh,
  systemVoltageV,
  batteryVoltageV,
  batteryUnitAh
) {
  const seriesCount = Math.round(systemVoltageV / batteryVoltageV);
  const parallelCount = Math.ceil(requiredCapacityAh / batteryUnitAh);
  const totalBankAh = batteryUnitAh * parallelCount;
  const totalBankV = batteryVoltageV * seriesCount;
  const totalUnits = seriesCount * parallelCount;
  const configLabel =
    parallelCount > 1
      ? `${seriesCount}S${parallelCount}P`
      : `${seriesCount}S`;

  return { seriesCount, parallelCount, totalBankAh, totalBankV, totalUnits, configLabel };
}

/**
 * Calculates the required inverter size and rounds up to the nearest standard VA.
 * Formula: rawVA = (peakWatts ÷ inverterEfficiency) × safetyFactor
 *
 * @param {number} peakWatts - Peak connected load in watts (nameplate, not duty-cycle)
 * @param {number} inverterEfficiency - Inverter efficiency fraction (0.5–0.99)
 * @returns {{ inverterSizeVA: number, rawVA: number }}
 *   inverterSizeVA: rounded up to a standard size
 *   rawVA: the unrounded calculated size
 */
export function calculateInverterSize(peakWatts, inverterEfficiency) {
  const invEff = clampEfficiency(inverterEfficiency);
  const rawVA = (peakWatts / invEff) * INVERTER_SAFETY_FACTOR;
  const inverterSizeVA = roundUpToStandard(rawVA, INVERTER_STANDARDS);
  return { inverterSizeVA, rawVA };
}

/**
 * Calculates the solar panel array size and series/parallel configuration.
 *
 * Total panel watts: (adjustedWh ÷ panelDeratingFactor) ÷ peakSunHours
 * Panel count: ceil(totalPanelWatts ÷ selectedPanelW)
 * Panels per string: floor(systemVoltageV ÷ panel Voc)
 * Number of strings (parallel): ceil(panelCount ÷ panelsPerString)
 *
 * @param {number} adjustedWh - System-loss-adjusted daily load (Wh)
 * @param {number} panelDeratingFactor - Panel efficiency derating (0.5–0.99)
 * @param {number} peakSunHoursPerDay - Average peak sun hours per day
 * @param {number} selectedPanelW - Chosen panel wattage (W)
 * @param {number} systemVoltageV - System voltage (V), used to pick panel spec
 * @returns {{
 *   totalPanelWattsW: number,
 *   panelCount: number,
 *   panelsPerString: number,
 *   stringCount: number,
 *   configLabel: string,
 *   stringVoltageV: number,
 *   stringCurrentA: number,
 *   panelVoc: number,
 *   panelIsc: number
 * }}
 */
export function calculatePanelArray(
  adjustedWh,
  panelDeratingFactor,
  peakSunHoursPerDay,
  selectedPanelW,
  systemVoltageV
) {
  const derating = clampEfficiency(panelDeratingFactor);
  const totalPanelWattsW = (adjustedWh / derating) / peakSunHoursPerDay;
  const panelCount = Math.ceil(totalPanelWattsW / selectedPanelW);

  const spec = getPanelSpecsForVoltage(systemVoltageV);
  const panelsPerString = Math.floor(systemVoltageV / spec.voc);
  const stringCount = Math.ceil(panelCount / panelsPerString);

  const actualPanelCount = panelsPerString * stringCount;
  const configLabel =
    stringCount > 1
      ? `${panelsPerString}S${stringCount}P`
      : `${panelsPerString}S`;

  const stringVoltageV = panelsPerString * spec.voc;
  const stringCurrentA = spec.isc * stringCount;

  return {
    totalPanelWattsW,
    panelCount: actualPanelCount, // actual count after rounding to full strings
    panelsPerString,
    stringCount,
    configLabel,
    stringVoltageV,
    stringCurrentA,
    panelVoc: spec.voc,
    panelIsc: spec.isc,
  };
}

/**
 * Calculates the required charge controller current rating (separate system only).
 * Not used for hybrid inverter systems.
 * Formula: rawCurrentA = (totalPanelWattsW ÷ systemVoltageV) × safetyFactor
 * Rounds up to nearest standard controller rating.
 *
 * @param {number} totalPanelWattsW - Total installed panel power (W)
 * @param {number} systemVoltageV - System voltage (V)
 * @returns {{ controllerCurrentA: number, rawCurrentA: number }}
 */
export function calculateChargeController(totalPanelWattsW, systemVoltageV) {
  const rawCurrentA = (totalPanelWattsW / systemVoltageV) * CONTROLLER_SAFETY_FACTOR;
  const controllerCurrentA = roundUpToStandard(rawCurrentA, CONTROLLER_STANDARDS);
  return { controllerCurrentA, rawCurrentA };
}

/**
 * Calculates the appropriate MCB (miniature circuit breaker) rating.
 * Also used for changeover switch rating.
 * Rounds up to nearest standard MCB rating.
 *
 * @param {number} currentA - The circuit current to protect (A)
 * @returns {{ mcbRatingA: number }}
 */
export function calculateMCBRating(currentA) {
  const mcbRatingA = roundUpToStandard(currentA, MCB_STANDARDS);
  return { mcbRatingA };
}

/**
 * Calculates all wire current and voltage labels for the system diagram.
 * All results are used as labels on diagram wires.
 *
 * @param {{
 *   totalPanelWattsW: number,
 *   stringVoltageV: number,
 *   controllerCurrentA: number,
 *   systemVoltageV: number,
 *   inverterSizeVA: number,
 *   totalLoadWatts: number,
 *   isHybrid: boolean
 * }} config
 * @returns {{
 *   panelToController: { currentA: number, voltageV: number },
 *   controllerToBattery: { currentA: number, voltageV: number } | null,
 *   batteryToInverter: { currentA: number, voltageV: number },
 *   inverterToLoad: { currentA: number, voltageV: number },
 *   gridToInverter: { currentA: number, voltageV: number }
 * }}
 */
export function calculateWireCurrents({
  totalPanelWattsW,
  stringVoltageV,
  controllerCurrentA,
  systemVoltageV,
  inverterSizeVA,
  totalLoadWatts,
  isHybrid,
}) {
  const panelToControllerCurrentA = (totalPanelWattsW / stringVoltageV) * CONTROLLER_SAFETY_FACTOR;
  const batteryToInverterCurrentA = (inverterSizeVA / systemVoltageV) * 1.1;
  const inverterToLoadCurrentA = totalLoadWatts / AC_OUTPUT_VOLTAGE;
  const gridToInverterCurrentA = inverterSizeVA / AC_OUTPUT_VOLTAGE;

  return {
    panelToController: {
      currentA: Math.round(panelToControllerCurrentA * 10) / 10,
      voltageV: stringVoltageV,
    },
    controllerToBattery: isHybrid
      ? null
      : {
          currentA: controllerCurrentA,
          voltageV: systemVoltageV,
        },
    batteryToInverter: {
      currentA: Math.round(batteryToInverterCurrentA * 10) / 10,
      voltageV: systemVoltageV,
    },
    inverterToLoad: {
      currentA: Math.round(inverterToLoadCurrentA * 10) / 10,
      voltageV: AC_OUTPUT_VOLTAGE,
    },
    gridToInverter: {
      currentA: Math.round(gridToInverterCurrentA * 10) / 10,
      voltageV: AC_OUTPUT_VOLTAGE,
    },
  };
}

/**
 * Calculates how long the battery bank can power the load without solar input.
 * Formula: backupHours = (batteryCapacityAh × systemVoltageV) ÷ averageLoadW
 *
 * @param {number} batteryCapacityAh - Total usable battery bank capacity (Ah)
 * @param {number} systemVoltageV - System voltage (V)
 * @param {number} dod - Depth of discharge fraction
 * @param {number} averageLoadW - Average continuous load (W)
 * @returns {{ backupHours: number }}
 */
export function calculateBackupDuration(
  batteryCapacityAh,
  systemVoltageV,
  dod,
  averageLoadW
) {
  if (averageLoadW === 0) return { backupHours: 0 };
  const usableWh = batteryCapacityAh * systemVoltageV * dod;
  const backupHours = Math.round((usableWh / averageLoadW) * 10) / 10;
  return { backupHours };
}

/**
 * Estimates daily solar energy yield from the installed panel array.
 * Formula: dailyYieldKwh = (totalPanelWattsW × panelDeratingFactor × peakSunHours) ÷ 1000
 *
 * @param {number} totalPanelWattsW - Total installed panel power (W)
 * @param {number} panelDeratingFactor - Panel derating fraction (0.5–0.99)
 * @param {number} peakSunHoursPerDay - Average peak sun hours per day
 * @returns {{ dailyYieldKwh: number }}
 */
export function calculateDailyYield(
  totalPanelWattsW,
  panelDeratingFactor,
  peakSunHoursPerDay
) {
  const derating = clampEfficiency(panelDeratingFactor);
  const dailyYieldKwh =
    Math.round(((totalPanelWattsW * derating * peakSunHoursPerDay) / 1000) * 10) / 10;
  return { dailyYieldKwh };
}

/**
 * Generates a proposal reference number in the format SS-YYYY-NNN.
 * lastIndex is the count of proposals already stored (0-based next index).
 *
 * @param {number} lastIndex - Zero-based index of the next proposal
 * @returns {string} e.g. "SS-2026-001"
 */
export function generateProposalReference(lastIndex) {
  const year = new Date().getFullYear();
  const seq = String(lastIndex + 1).padStart(3, '0');
  return `${PROPOSAL_REF_PREFIX}-${year}-${seq}`;
}

/**
 * Runs the full sizing calculation pipeline from appliances to component specs.
 * This is the primary entry point used by SystemRecommendationScreen.
 *
 * @param {{
 *   appliances: Array<{ watts: number, quantity: number, dailyHours: number, dutyCycle?: number }>,
 *   systemVoltageV: number,
 *   batteryVoltageV: number,
 *   batteryUnitAh: number,
 *   batteryChemistry: { dod: number, efficiency: number, label: string },
 *   inverterEfficiency: number,
 *   panelDeratingFactor: number,
 *   peakSunHoursPerDay: number,
 *   selectedPanelW: number,
 *   daysAutonomy: number,
 *   isHybrid: boolean
 * }} inputs
 * @returns {{
 *   totalDailyWh: number,
 *   peakWatts: number,
 *   adjustedWh: number,
 *   batteryCapacityAh: number,
 *   batteryConfig: object,
 *   inverterSizeVA: number,
 *   panelArray: object,
 *   chargeController: object | null,
 *   wireCurrents: object,
 *   backupHours: number,
 *   dailyYieldKwh: number
 * }}
 */
export function runFullSizingCalculation(inputs) {
  const {
    appliances,
    systemVoltageV,
    batteryVoltageV,
    batteryUnitAh,
    batteryChemistry,
    inverterEfficiency,
    panelDeratingFactor,
    peakSunHoursPerDay,
    selectedPanelW,
    daysAutonomy,
    isHybrid,
  } = inputs;

  const { totalDailyWh, peakWatts } = calculateTotalDailyLoad(appliances);
  const { adjustedWh } = calculateAdjustedLoad(
    totalDailyWh,
    inverterEfficiency,
    batteryChemistry.efficiency
  );
  const { batteryCapacityAh } = calculateBatteryCapacity(
    adjustedWh,
    systemVoltageV,
    batteryChemistry.dod,
    daysAutonomy
  );
  const batteryConfig = calculateBatteryConfig(
    batteryCapacityAh,
    systemVoltageV,
    batteryVoltageV,
    batteryUnitAh
  );
  const { inverterSizeVA } = calculateInverterSize(peakWatts, inverterEfficiency);
  const panelArray = calculatePanelArray(
    adjustedWh,
    panelDeratingFactor,
    peakSunHoursPerDay,
    selectedPanelW,
    systemVoltageV
  );
  const chargeController = isHybrid
    ? null
    : calculateChargeController(panelArray.totalPanelWattsW, systemVoltageV);

  const wireCurrents = calculateWireCurrents({
    totalPanelWattsW: panelArray.totalPanelWattsW,
    stringVoltageV: panelArray.stringVoltageV,
    controllerCurrentA: chargeController ? chargeController.controllerCurrentA : 0,
    systemVoltageV,
    inverterSizeVA,
    totalLoadWatts: peakWatts,
    isHybrid,
  });

  const averageLoadW = totalDailyWh / 24;
  const { backupHours } = calculateBackupDuration(
    batteryCapacityAh,
    systemVoltageV,
    batteryChemistry.dod,
    averageLoadW
  );
  const { dailyYieldKwh } = calculateDailyYield(
    panelArray.totalPanelWattsW,
    panelDeratingFactor,
    peakSunHoursPerDay
  );

  return {
    totalDailyWh,
    peakWatts,
    adjustedWh,
    batteryCapacityAh,
    batteryConfig,
    inverterSizeVA,
    panelArray,
    chargeController,
    wireCurrents,
    backupHours,
    dailyYieldKwh,
  };

}

// ─── PROPOSAL REFERENCE ───────────────────────────────────────────────────────

/**
 * Generates a unique proposal reference string using the current year and a
 * sequential counter based on the total number of stored proposals.
 *
 * Format: SS-YYYY-NNN  (e.g. "SS-2024-007")
 *
 * @param {number} [existingCount=0] - Number of proposals already stored
 * @returns {string} Formatted proposal reference
 */
export function generateProposalReference(existingCount = 0) {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(3, '0');
  return `${PROPOSAL_REF_PREFIX}-${year}-${seq}`;
}

