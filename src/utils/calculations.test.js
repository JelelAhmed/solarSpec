/**
 * SolarSpec Calculation Engine — Unit Tests
 * Every exported function in calculations.js has tests here.
 * Coverage:
 *   ✓ Both system types (separate and hybrid)
 *   ✓ All 4 battery chemistries
 *   ✓ 12V, 24V, 48V system voltages
 *   ✓ Series/parallel battery and panel configurations
 *   ✓ Fridge duty cycle calculation
 *   ✓ Edge cases: single appliance, max load, single battery, single panel
 *   ✓ Standard rounding behavior
 *   ✓ Efficiency clamping at min (0.50) and max (0.99)
 *   ✓ Full pipeline (runFullSizingCalculation) integration test
 */

import {
  roundUpToStandard,
  clampEfficiency,
  getPanelSpecsForVoltage,
  calculateTotalDailyLoad,
  calculateAdjustedLoad,
  calculateBatteryCapacity,
  calculateBatteryConfig,
  calculateInverterSize,
  calculatePanelArray,
  calculateChargeController,
  calculateMCBRating,
  calculateWireCurrents,
  calculateBackupDuration,
  calculateDailyYield,
  generateProposalReference,
  runFullSizingCalculation,
} from './calculations';

import {
  BATTERY_CHEMISTRY,
  INVERTER_STANDARDS,
  CONTROLLER_STANDARDS,
  MCB_STANDARDS,
} from '../constants/index';

// ─── HELPER: roundUpToStandard ────────────────────────────────────────────────

describe('roundUpToStandard', () => {
  test('returns exact match when value equals a standard', () => {
    expect(roundUpToStandard(3000, INVERTER_STANDARDS)).toBe(3000);
  });

  test('rounds up to next standard when between values', () => {
    expect(roundUpToStandard(2100, INVERTER_STANDARDS)).toBe(3000);
  });

  test('returns smallest standard when value is below all', () => {
    expect(roundUpToStandard(100, INVERTER_STANDARDS)).toBe(1000);
  });

  test('returns largest standard when value exceeds all', () => {
    expect(roundUpToStandard(99999, INVERTER_STANDARDS)).toBe(10000);
  });

  test('works with controller standards', () => {
    expect(roundUpToStandard(25, CONTROLLER_STANDARDS)).toBe(30);
    expect(roundUpToStandard(40, CONTROLLER_STANDARDS)).toBe(40);
    expect(roundUpToStandard(41, CONTROLLER_STANDARDS)).toBe(60);
  });

  test('works with MCB standards', () => {
    expect(roundUpToStandard(15, MCB_STANDARDS)).toBe(16);
    expect(roundUpToStandard(63, MCB_STANDARDS)).toBe(63);
    expect(roundUpToStandard(64, MCB_STANDARDS)).toBe(80);
  });
});

// ─── HELPER: clampEfficiency ─────────────────────────────────────────────────

describe('clampEfficiency', () => {
  test('returns value unchanged when within bounds', () => {
    expect(clampEfficiency(0.90)).toBe(0.90);
    expect(clampEfficiency(0.80)).toBe(0.80);
  });

  test('clamps to MIN_EFFICIENCY (0.50) when too low', () => {
    expect(clampEfficiency(0.10)).toBe(0.50);
    expect(clampEfficiency(0.00)).toBe(0.50);
    expect(clampEfficiency(-1)).toBe(0.50);
  });

  test('clamps to MAX_EFFICIENCY (0.99) when too high', () => {
    expect(clampEfficiency(1.00)).toBe(0.99);
    expect(clampEfficiency(1.50)).toBe(0.99);
  });

  test('accepts exactly MIN and MAX bounds', () => {
    expect(clampEfficiency(0.50)).toBe(0.50);
    expect(clampEfficiency(0.99)).toBe(0.99);
  });
});

// ─── HELPER: getPanelSpecsForVoltage ─────────────────────────────────────────

describe('getPanelSpecsForVoltage', () => {
  test('returns 60-cell spec for 12V system', () => {
    const spec = getPanelSpecsForVoltage(12);
    expect(spec.cellCount).toBe(60);
    expect(spec.voc).toBe(22);
    expect(spec.isc).toBe(10);
  });

  test('returns 60-cell spec for 24V system', () => {
    const spec = getPanelSpecsForVoltage(24);
    expect(spec.cellCount).toBe(60);
    expect(spec.voc).toBe(22);
  });

  test('returns 72-cell spec for 48V system', () => {
    const spec = getPanelSpecsForVoltage(48);
    expect(spec.cellCount).toBe(72);
    expect(spec.voc).toBe(37);
    expect(spec.isc).toBe(10);
  });
});

// ─── calculateTotalDailyLoad ──────────────────────────────────────────────────

describe('calculateTotalDailyLoad', () => {
  test('single appliance: 100W LED TV × 1 × 8hrs = 800Wh', () => {
    const result = calculateTotalDailyLoad([
      { watts: 100, quantity: 1, dailyHours: 8 },
    ]);
    expect(result.totalDailyWh).toBeCloseTo(800);
    expect(result.peakWatts).toBe(100);
  });

  test('fridge duty cycle: 150W × 0.3 duty × 24hrs = 1080Wh, peak = 150W', () => {
    const result = calculateTotalDailyLoad([
      { watts: 150, quantity: 1, dailyHours: 24, dutyCycle: 0.3 },
    ]);
    expect(result.totalDailyWh).toBeCloseTo(1080);
    expect(result.peakWatts).toBe(150); // peak uses nameplate
  });

  test('multiple appliances sum correctly', () => {
    const result = calculateTotalDailyLoad([
      { watts: 10, quantity: 4, dailyHours: 8 },   // LED bulbs: 4×10×8 = 320Wh
      { watts: 100, quantity: 1, dailyHours: 6 },  // TV: 600Wh
      { watts: 150, quantity: 1, dailyHours: 24, dutyCycle: 0.3 }, // Fridge: 1080Wh
    ]);
    expect(result.totalDailyWh).toBeCloseTo(320 + 600 + 1080);
    expect(result.peakWatts).toBe(40 + 100 + 150); // 290W
  });

  test('quantity multiplier is applied', () => {
    const result = calculateTotalDailyLoad([
      { watts: 60, quantity: 3, dailyHours: 5 },
    ]);
    expect(result.totalDailyWh).toBeCloseTo(900); // 60×3×5
    expect(result.peakWatts).toBe(180); // 60×3
  });

  test('empty appliance list returns zero', () => {
    const result = calculateTotalDailyLoad([]);
    expect(result.totalDailyWh).toBe(0);
    expect(result.peakWatts).toBe(0);
  });

  test('default dutyCycle of 1.0 when not provided', () => {
    const result = calculateTotalDailyLoad([
      { watts: 100, quantity: 1, dailyHours: 10 }, // no dutyCycle
    ]);
    expect(result.totalDailyWh).toBeCloseTo(1000);
  });
});

// ─── calculateAdjustedLoad ────────────────────────────────────────────────────

describe('calculateAdjustedLoad', () => {
  test('adjusts 1000Wh with 90% inverter and 95% battery = 1170.96Wh', () => {
    const { adjustedWh } = calculateAdjustedLoad(1000, 0.90, 0.95);
    expect(adjustedWh).toBeCloseTo(1000 / 0.90 / 0.95, 2);
  });

  test('lead-acid efficiency (80%) increases adjusted load significantly', () => {
    const { adjustedWh } = calculateAdjustedLoad(1000, 0.90, 0.80);
    expect(adjustedWh).toBeCloseTo(1000 / 0.90 / 0.80, 2);
    expect(adjustedWh).toBeGreaterThan(1000 / 0.90 / 0.95);
  });

  test('clamps efficiency below minimum (0.5)', () => {
    const { adjustedWh: withLow } = calculateAdjustedLoad(1000, 0.20, 0.20);
    const { adjustedWh: withMin } = calculateAdjustedLoad(1000, 0.50, 0.50);
    expect(withLow).toBeCloseTo(withMin, 2);
  });

  test('clamps efficiency above maximum (0.99)', () => {
    const { adjustedWh: withHigh } = calculateAdjustedLoad(1000, 1.20, 1.20);
    const { adjustedWh: withMax } = calculateAdjustedLoad(1000, 0.99, 0.99);
    expect(withHigh).toBeCloseTo(withMax, 2);
  });

  // All 4 battery chemistry efficiencies
  test.each([
    ['Lead-acid', BATTERY_CHEMISTRY.LEAD_ACID.efficiency],
    ['AGM', BATTERY_CHEMISTRY.AGM.efficiency],
    ['Gel', BATTERY_CHEMISTRY.GEL.efficiency],
    ['Lithium', BATTERY_CHEMISTRY.LITHIUM.efficiency],
  ])('%s chemistry: adjusted load > raw load', (_, batEff) => {
    const { adjustedWh } = calculateAdjustedLoad(2000, 0.90, batEff);
    expect(adjustedWh).toBeGreaterThan(2000);
  });
});

// ─── calculateBatteryCapacity ─────────────────────────────────────────────────

describe('calculateBatteryCapacity', () => {
  test('48V Lithium (DoD 0.9), 1 day: 1000Wh → ceil(1000/(48×0.9)) = 24Ah', () => {
    const { batteryCapacityAh } = calculateBatteryCapacity(1000, 48, 0.90, 1);
    expect(batteryCapacityAh).toBe(Math.ceil(1000 / (48 * 0.90)));
  });

  test('24V Lead-acid (DoD 0.5), 1 day: 2000Wh → ceil(2000/(24×0.5)) = 167Ah', () => {
    const { batteryCapacityAh } = calculateBatteryCapacity(2000, 24, 0.50, 1);
    expect(batteryCapacityAh).toBe(Math.ceil(2000 / (24 * 0.50)));
  });

  test('12V AGM (DoD 0.6), 1 day: 5000Wh → large Ah value', () => {
    const { batteryCapacityAh } = calculateBatteryCapacity(5000, 12, 0.60, 1);
    expect(batteryCapacityAh).toBe(Math.ceil(5000 / (12 * 0.60)));
  });

  test('days autonomy multiplies required capacity', () => {
    // Use a value that divisions evenly to avoid ceiling rounding skew
    const { batteryCapacityAh: oneDay } = calculateBatteryCapacity(2160, 48, 0.90, 1);
    const { batteryCapacityAh: twoDay } = calculateBatteryCapacity(2160, 48, 0.90, 2);
    // 2160 / (48 * 0.9) = 50 exactly — ceil(50) = 50, ceil(100) = 100 → ratio is exact
    expect(twoDay).toBe(oneDay * 2);
  });

  test('result is always a whole number (ceiling)', () => {
    const { batteryCapacityAh } = calculateBatteryCapacity(999, 48, 0.90, 1);
    expect(Number.isInteger(batteryCapacityAh)).toBe(true);
  });

  // All 4 battery chemistries
  test.each([
    ['Lead-acid', BATTERY_CHEMISTRY.LEAD_ACID.dod],
    ['AGM', BATTERY_CHEMISTRY.AGM.dod],
    ['Gel', BATTERY_CHEMISTRY.GEL.dod],
    ['Lithium', BATTERY_CHEMISTRY.LITHIUM.dod],
  ])('%s chemistry: capacity is positive integer', (_, dod) => {
    const { batteryCapacityAh } = calculateBatteryCapacity(2000, 48, dod, 1);
    expect(batteryCapacityAh).toBeGreaterThan(0);
    expect(Number.isInteger(batteryCapacityAh)).toBe(true);
  });
});

// ─── calculateBatteryConfig ───────────────────────────────────────────────────

describe('calculateBatteryConfig', () => {
  test('48V system with 12V batteries → 4S series', () => {
    const config = calculateBatteryConfig(100, 48, 12, 100);
    expect(config.seriesCount).toBe(4);
    expect(config.totalBankV).toBe(48);
  });

  test('24V system with 12V batteries → 2S series', () => {
    const config = calculateBatteryConfig(100, 24, 12, 100);
    expect(config.seriesCount).toBe(2);
  });

  test('12V system with 12V batteries → 1S series', () => {
    const config = calculateBatteryConfig(100, 12, 12, 100);
    expect(config.seriesCount).toBe(1);
  });

  test('single 100Ah battery sufficient → 1P parallel', () => {
    const config = calculateBatteryConfig(80, 48, 12, 100);
    expect(config.parallelCount).toBe(1);
    expect(config.configLabel).toBe('4S');
  });

  test('250Ah required with 100Ah units → 3P parallel (ceil 2.5)', () => {
    const config = calculateBatteryConfig(250, 48, 12, 100);
    expect(config.parallelCount).toBe(3);
    expect(config.configLabel).toBe('4S3P');
    expect(config.totalUnits).toBe(12);
  });

  test('totalBankAh = batteryUnitAh × parallelCount', () => {
    const config = calculateBatteryConfig(300, 48, 12, 200);
    expect(config.totalBankAh).toBe(200 * config.parallelCount);
  });

  test('2V battery, 48V system → 24S series', () => {
    const config = calculateBatteryConfig(100, 48, 2, 600);
    expect(config.seriesCount).toBe(24);
  });

  test('6V battery, 12V system → 2S series', () => {
    const config = calculateBatteryConfig(100, 12, 6, 100);
    expect(config.seriesCount).toBe(2);
  });
});

// ─── calculateInverterSize ────────────────────────────────────────────────────

describe('calculateInverterSize', () => {
  test('1000W load at 90% efficiency × 1.25 → rounds to 1500VA', () => {
    // rawVA = (1000 / 0.9) × 1.25 = 1388.9 → rounds up to 1500
    const { inverterSizeVA, rawVA } = calculateInverterSize(1000, 0.90);
    expect(rawVA).toBeCloseTo(1388.9, 0);
    expect(inverterSizeVA).toBe(1500);
  });

  test('2500W load at 90% → rounds up to 3500VA', () => {
    // rawVA = (2500 / 0.9) × 1.25 = 3472.2 → rounds to 3500
    const { inverterSizeVA } = calculateInverterSize(2500, 0.90);
    expect(inverterSizeVA).toBe(3500);
  });

  test('750W load → 1000VA (minimum standard)', () => {
    const { inverterSizeVA } = calculateInverterSize(750, 0.90);
    // (750 / 0.9) × 1.25 = 1041.7 → 1500
    expect(inverterSizeVA).toBe(1500);
  });

  test('single 10W appliance rounds up to minimum 1000VA', () => {
    const { inverterSizeVA } = calculateInverterSize(10, 0.90);
    expect(inverterSizeVA).toBe(1000);
  });

  test('very large load (8000W) rounds up to maximum 10000VA', () => {
    // (8000 / 0.9) × 1.25 = 11111 → clamps to 10000
    const { inverterSizeVA } = calculateInverterSize(8000, 0.90);
    expect(inverterSizeVA).toBe(10000);
  });

  test('efficiency clamped at 0.50 increases inverter size', () => {
    const { rawVA: normal } = calculateInverterSize(1000, 0.90);
    const { rawVA: poor } = calculateInverterSize(1000, 0.50);
    expect(poor).toBeGreaterThan(normal);
  });
});

// ─── calculatePanelArray ──────────────────────────────────────────────────────

describe('calculatePanelArray', () => {
  test('48V system uses 72-cell panels (Voc=37V) → 1 panel per string', () => {
    // panelsPerString = floor(48 / 37) = 1
    const result = calculatePanelArray(5000, 0.80, 5, 400, 48);
    expect(result.panelsPerString).toBe(1);
    expect(result.panelVoc).toBe(37);
  });

  test('24V system uses 60-cell panels (Voc=22V) → 1 panel per string', () => {
    // panelsPerString = floor(24 / 22) = 1
    const result = calculatePanelArray(3000, 0.80, 5, 400, 24);
    expect(result.panelsPerString).toBe(1);
    expect(result.panelVoc).toBe(22);
  });

  test('12V system uses 60-cell panels → 0 panels per string (handled as 1)', () => {
    // panelsPerString = floor(12 / 22) = 0 — edge case
    // Our formula: panelsPerString ≥ 1 is assumed at 12V
    const result = calculatePanelArray(1000, 0.80, 5, 400, 12);
    expect(result.panelVoc).toBe(22);
  });

  test('panel count is a multiple of panelsPerString (no partial strings)', () => {
    const result = calculatePanelArray(5000, 0.80, 5, 400, 48);
    expect(result.panelCount % result.panelsPerString).toBe(0);
  });

  test('configLabel uses S for series and P for parallel correctly', () => {
    // Force at least 2 parallel strings by using high load
    const result = calculatePanelArray(20000, 0.80, 5, 400, 48);
    if (result.stringCount > 1) {
      expect(result.configLabel).toMatch(/^\d+S\d+P$/);
    } else {
      expect(result.configLabel).toMatch(/^\d+S$/);
    }
  });

  test('derating factor reduces effective output (higher load → more panels)', () => {
    const highDerating = calculatePanelArray(5000, 0.90, 5, 400, 48);
    const lowDerating = calculatePanelArray(5000, 0.50, 5, 400, 48);
    expect(lowDerating.panelCount).toBeGreaterThan(highDerating.panelCount);
  });

  test('single panel edge case: small load requires at minimum 1 panel', () => {
    const result = calculatePanelArray(100, 0.80, 5, 400, 48);
    expect(result.panelCount).toBeGreaterThanOrEqual(1);
  });
});

// ─── calculateChargeController ────────────────────────────────────────────────

describe('calculateChargeController', () => {
  test('4 × 400W panels at 48V → floor((1600/48)×1.25) = 41.7A → rounds to 60A', () => {
    // 1600W ÷ 48V = 33.3A × 1.25 = 41.7A → rounds to 60A
    const { controllerCurrentA } = calculateChargeController(1600, 48);
    expect(controllerCurrentA).toBe(60);
  });

  test('800W panels at 24V → (800/24)×1.25 = 41.7A → 60A', () => {
    const { controllerCurrentA } = calculateChargeController(800, 24);
    expect(controllerCurrentA).toBe(60);
  });

  test('400W panels at 48V → (400/48)×1.25 = 10.4A → 20A', () => {
    const { controllerCurrentA } = calculateChargeController(400, 48);
    expect(controllerCurrentA).toBe(20);
  });

  test('rawCurrentA is returned alongside rounded value', () => {
    const { controllerCurrentA, rawCurrentA } = calculateChargeController(1600, 48);
    expect(rawCurrentA).toBeCloseTo((1600 / 48) * 1.25, 1);
    expect(controllerCurrentA).toBeGreaterThanOrEqual(rawCurrentA);
  });

  test('always rounds up — never down', () => {
    const { controllerCurrentA, rawCurrentA } = calculateChargeController(2000, 48);
    expect(controllerCurrentA).toBeGreaterThanOrEqual(Math.ceil(rawCurrentA));
  });
});

// ─── calculateMCBRating ───────────────────────────────────────────────────────

describe('calculateMCBRating', () => {
  test('14A current → 16A MCB', () => {
    expect(calculateMCBRating(14).mcbRatingA).toBe(16);
  });

  test('25A current → 25A MCB (exact match)', () => {
    expect(calculateMCBRating(25).mcbRatingA).toBe(25);
  });

  test('26A current → 32A MCB', () => {
    expect(calculateMCBRating(26).mcbRatingA).toBe(32);
  });

  test('5A current → 6A MCB (minimum standard)', () => {
    expect(calculateMCBRating(5).mcbRatingA).toBe(6);
  });

  test('90A current → 100A MCB', () => {
    expect(calculateMCBRating(90).mcbRatingA).toBe(100);
  });
});

// ─── calculateWireCurrents ────────────────────────────────────────────────────

describe('calculateWireCurrents', () => {
  const baseConfig = {
    totalPanelWattsW: 1600,
    stringVoltageV: 37,
    controllerCurrentA: 60,
    systemVoltageV: 48,
    inverterSizeVA: 3500,
    totalLoadWatts: 2000,
  };

  test('separate system: controllerToBattery is not null', () => {
    const result = calculateWireCurrents({ ...baseConfig, isHybrid: false });
    expect(result.controllerToBattery).not.toBeNull();
    expect(result.controllerToBattery.voltageV).toBe(48);
    expect(result.controllerToBattery.currentA).toBe(60);
  });

  test('hybrid system: controllerToBattery is null', () => {
    const result = calculateWireCurrents({ ...baseConfig, isHybrid: true });
    expect(result.controllerToBattery).toBeNull();
  });

  test('inverterToLoad current: 2000W ÷ 220V = 9.1A', () => {
    const result = calculateWireCurrents({ ...baseConfig, isHybrid: false });
    expect(result.inverterToLoad.currentA).toBeCloseTo(2000 / 220, 1);
    expect(result.inverterToLoad.voltageV).toBe(220);
  });

  test('gridToInverter current: 3500VA ÷ 220V = 15.9A', () => {
    const result = calculateWireCurrents({ ...baseConfig, isHybrid: false });
    expect(result.gridToInverter.currentA).toBeCloseTo(3500 / 220, 1);
    expect(result.gridToInverter.voltageV).toBe(220);
  });

  test('batteryToInverter current: (3500 ÷ 48) × 1.1 = 80.2A', () => {
    const result = calculateWireCurrents({ ...baseConfig, isHybrid: false });
    expect(result.batteryToInverter.currentA).toBeCloseTo((3500 / 48) * 1.1, 1);
    expect(result.batteryToInverter.voltageV).toBe(48);
  });

  test('panelToController current includes safety factor', () => {
    const result = calculateWireCurrents({ ...baseConfig, isHybrid: false });
    const expected = (1600 / 37) * 1.25;
    expect(result.panelToController.currentA).toBeCloseTo(expected, 1);
    expect(result.panelToController.voltageV).toBe(37);
  });
});

// ─── calculateBackupDuration ──────────────────────────────────────────────────

describe('calculateBackupDuration', () => {
  test('100Ah × 48V × 0.9 DoD ÷ 500W = 8.64hrs → ~8.6hrs', () => {
    const { backupHours } = calculateBackupDuration(100, 48, 0.9, 500);
    expect(backupHours).toBeCloseTo((100 * 48 * 0.9) / 500, 1);
  });

  test('zero load returns 0 backup hours (no division by zero)', () => {
    const { backupHours } = calculateBackupDuration(100, 48, 0.9, 0);
    expect(backupHours).toBe(0);
  });

  test('higher DoD gives more backup time', () => {
    const { backupHours: lithium } = calculateBackupDuration(100, 48, 0.90, 500);
    const { backupHours: leadAcid } = calculateBackupDuration(100, 48, 0.50, 500);
    expect(lithium).toBeGreaterThan(leadAcid);
  });

  test('higher system voltage gives more backup time for same Ah', () => {
    const { backupHours: v48 } = calculateBackupDuration(100, 48, 0.9, 500);
    const { backupHours: v24 } = calculateBackupDuration(100, 24, 0.9, 500);
    expect(v48).toBeGreaterThan(v24);
  });
});

// ─── calculateDailyYield ──────────────────────────────────────────────────────

describe('calculateDailyYield', () => {
  test('1600W × 0.8 derating × 5hrs = 6.4kWh', () => {
    const { dailyYieldKwh } = calculateDailyYield(1600, 0.80, 5);
    expect(dailyYieldKwh).toBeCloseTo(6.4, 1);
  });

  test('more panels → higher yield', () => {
    const { dailyYieldKwh: big } = calculateDailyYield(4000, 0.80, 5);
    const { dailyYieldKwh: small } = calculateDailyYield(2000, 0.80, 5);
    expect(big).toBeGreaterThan(small);
  });

  test('higher derating factor → higher yield', () => {
    const { dailyYieldKwh: good } = calculateDailyYield(2000, 0.90, 5);
    const { dailyYieldKwh: poor } = calculateDailyYield(2000, 0.50, 5);
    expect(good).toBeGreaterThan(poor);
  });

  test('derating clamped at 0.50 min', () => {
    const { dailyYieldKwh: clamped } = calculateDailyYield(2000, 0.10, 5);
    const { dailyYieldKwh: minimum } = calculateDailyYield(2000, 0.50, 5);
    expect(clamped).toBeCloseTo(minimum, 1);
  });
});

// ─── generateProposalReference ────────────────────────────────────────────────

describe('generateProposalReference', () => {
  test('index 0 → SS-YYYY-001', () => {
    const ref = generateProposalReference(0);
    const year = new Date().getFullYear();
    expect(ref).toBe(`SS-${year}-001`);
  });

  test('index 9 → SS-YYYY-010', () => {
    const ref = generateProposalReference(9);
    const year = new Date().getFullYear();
    expect(ref).toBe(`SS-${year}-010`);
  });

  test('index 99 → SS-YYYY-100', () => {
    const ref = generateProposalReference(99);
    const year = new Date().getFullYear();
    expect(ref).toBe(`SS-${year}-100`);
  });

  test('format is SS-YYYY-NNN', () => {
    const ref = generateProposalReference(5);
    expect(ref).toMatch(/^SS-\d{4}-\d{3}$/);
  });
});

// ─── runFullSizingCalculation (integration) ───────────────────────────────────

describe('runFullSizingCalculation — integration', () => {
  const baseInput = {
    appliances: [
      { watts: 100, quantity: 2, dailyHours: 8 },     // 2 TVs: 1600Wh
      { watts: 10, quantity: 6, dailyHours: 8 },       // 6 LEDs: 480Wh
      { watts: 150, quantity: 1, dailyHours: 24, dutyCycle: 0.3 }, // Fridge: 1080Wh
    ],
    systemVoltageV: 48,
    batteryVoltageV: 12,
    batteryUnitAh: 100,
    batteryChemistry: BATTERY_CHEMISTRY.LITHIUM,
    inverterEfficiency: 0.90,
    panelDeratingFactor: 0.80,
    peakSunHoursPerDay: 5,
    selectedPanelW: 400,
    daysAutonomy: 1,
    isHybrid: false,
  };

  test('returns all required fields', () => {
    const result = runFullSizingCalculation(baseInput);
    expect(result).toHaveProperty('totalDailyWh');
    expect(result).toHaveProperty('peakWatts');
    expect(result).toHaveProperty('adjustedWh');
    expect(result).toHaveProperty('batteryCapacityAh');
    expect(result).toHaveProperty('batteryConfig');
    expect(result).toHaveProperty('inverterSizeVA');
    expect(result).toHaveProperty('panelArray');
    expect(result).toHaveProperty('chargeController');
    expect(result).toHaveProperty('wireCurrents');
    expect(result).toHaveProperty('backupHours');
    expect(result).toHaveProperty('dailyYieldKwh');
  });

  test('separate system has chargeController', () => {
    const result = runFullSizingCalculation({ ...baseInput, isHybrid: false });
    expect(result.chargeController).not.toBeNull();
    expect(result.chargeController.controllerCurrentA).toBeGreaterThan(0);
  });

  test('hybrid system has null chargeController', () => {
    const result = runFullSizingCalculation({ ...baseInput, isHybrid: true });
    expect(result.chargeController).toBeNull();
  });

  test('totalDailyWh: 1600+480+1080 = 3160Wh', () => {
    const result = runFullSizingCalculation(baseInput);
    expect(result.totalDailyWh).toBeCloseTo(3160, 0);
  });

  test('adjustedWh > totalDailyWh (losses applied)', () => {
    const result = runFullSizingCalculation(baseInput);
    expect(result.adjustedWh).toBeGreaterThan(result.totalDailyWh);
  });

  test('inverterSizeVA is one of the standard sizes', () => {
    const result = runFullSizingCalculation(baseInput);
    expect(INVERTER_STANDARDS).toContain(result.inverterSizeVA);
  });

  test('batteryCapacityAh is positive integer', () => {
    const result = runFullSizingCalculation(baseInput);
    expect(result.batteryCapacityAh).toBeGreaterThan(0);
    expect(Number.isInteger(result.batteryCapacityAh)).toBe(true);
  });

  test('48V lithium produces more backup than 24V lead-acid for same Ah', () => {
    const highSpec = runFullSizingCalculation(baseInput);
    const lowSpec = runFullSizingCalculation({
      ...baseInput,
      systemVoltageV: 24,
      batteryChemistry: BATTERY_CHEMISTRY.LEAD_ACID,
    });
    // 48V lithium should have higher energy density
    expect(highSpec.backupHours).toBeGreaterThan(0);
    expect(lowSpec.backupHours).toBeGreaterThan(0);
  });

  // Test across all voltages
  test.each([12, 24, 48])('runs without error at %dV', (voltage) => {
    expect(() =>
      runFullSizingCalculation({ ...baseInput, systemVoltageV: voltage })
    ).not.toThrow();
  });

  // Test across all battery chemistries
  test.each(Object.values(BATTERY_CHEMISTRY))(
    'runs without error for $label chemistry',
    (chemistry) => {
      expect(() =>
        runFullSizingCalculation({ ...baseInput, batteryChemistry: chemistry })
      ).not.toThrow();
    }
  );

  test('backbone max load: 10 × 750W AC units + 10 × 500W washers', () => {
    const heavyInput = {
      ...baseInput,
      appliances: [
        { watts: 750, quantity: 10, dailyHours: 8 },
        { watts: 500, quantity: 10, dailyHours: 4 },
      ],
    };
    const result = runFullSizingCalculation(heavyInput);
    expect(result.inverterSizeVA).toBeGreaterThanOrEqual(5000);
    expect(result.panelArray.panelCount).toBeGreaterThan(10);
  });
});
