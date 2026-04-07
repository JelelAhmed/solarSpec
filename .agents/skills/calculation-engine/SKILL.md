---
name: calculation-engine
description: Use when writing, modifying, testing, or debugging
any solar sizing calculation, formula, efficiency value,
or unit test related to calculations.
---

## Calculation rules

Always account for both system types in every formula:
- Separate system: standalone inverter + standalone
  charge controller
- Hybrid inverter: inverter with built-in charge controller
  (no separate charge controller component or calculation)

Always apply all efficiency multipliers:
- Inverter efficiency (default 90%, user editable)
- Battery efficiency (default per chemistry, user editable)
- Panel derating factor (default 80%, user editable)
- Charge controller efficiency: MPPT default 95%,
  PWM default 75%

Battery chemistry depth of discharge (DoD):
- Lead-acid: 50%
- AGM: 60%
- Gel: 60%
- Lithium (LiFePO4): 90%

## Core formulas

Total daily load (Wh):
= sum of (wattage × quantity × daily hours) for all appliances
Note: Fridge uses duty cycle 0.3 (runs ~30% of the time)
so effective wattage = 150W × 0.3 = 45W for calculation

Adjusted load (Wh):
= Total Wh ÷ inverter efficiency ÷ battery efficiency

Battery capacity (Ah):
= (Adjusted Wh × days autonomy) ÷ (system voltage × DoD)
Round up to nearest whole number

Inverter size (VA):
= (peak load watts ÷ inverter efficiency) × 1.25 safety factor
Round up to nearest standard:
1000, 1500, 2000, 3000, 3500, 5000, 7500, 10000

Panel wattage (W):
= (Adjusted Wh ÷ panel derating) ÷ peak sun hours
Number of panels = ceil(total watts ÷ selected panel wattage)

Charge controller (A) — separate system only, hidden for hybrid:
= (total panel watts ÷ system voltage) × 1.25
Round up to nearest standard: 10, 20, 30, 40, 60, 80, 100
Type: MPPT (default) or PWM (user selectable)

MCB rating (A):
= nearest standard above calculated current
Standards: 6, 10, 16, 20, 25, 32, 40, 63, 80, 100

Changeover switch rating = same as MCB rating
SPD: always Type 2 regardless of system

## Series/parallel configuration

### Panel configuration
Panel specs by system voltage:
  12V/24V systems: 60-cell panels, Voc ~22V, Isc ~10A
  48V systems:     72-cell panels, Voc ~37V, Isc ~10A

Panels per string = floor(system voltage ÷ panel Voc)
  e.g. 48V ÷ 22V = 2.18 → 2 panels per string (60-cell)
  e.g. 48V ÷ 37V = 1.29 → 1 panel per string (72-cell)

Number of strings = ceil(total panels ÷ panels per string)

Display format: e.g. "3S2P — 3 series × 2 parallel"
String voltage = panels per string × panel Voc
String current = panel Isc × number of strings

### Battery configuration
Target: achieve system voltage with minimum battery units.
Series raises voltage (same Ah).
Parallel raises Ah (same voltage).

Batteries in series to match system voltage:
  Series count = system voltage ÷ battery voltage
  e.g. 48V system with 12V batteries = 4S

Additional parallel strings for capacity:
  Required strings = ceil(required Ah ÷ battery Ah)

Display format: e.g. "4S2P — 4 series × 2 parallel"
Total Ah = battery Ah × parallel strings
Total voltage = battery voltage × series count

## Wire current labels for diagram

All labels derived from calculated values.
Panel → charge controller (separate system only):
  Current = (total panel watts ÷ string voltage) × 1.25
  Voltage = string voltage (V)

Charge controller → battery:
  Current = charge controller rated current (A)
  Voltage = system voltage (V)

Battery → inverter:
  Current = (inverter VA ÷ system voltage) × 1.1
  Voltage = system voltage (V)

Inverter → load:
  Current = total load watts ÷ 220
  Voltage = 220V AC

Grid → inverter:
  Current = inverter VA ÷ 220 (grid charging current)
  Voltage = 220V AC

Panel → hybrid inverter (hybrid system):
  Same as panel → charge controller above

## Preset appliance library

LED Bulb:              10W
Standing Fan:          60W
Ceiling Fan:           75W
LED Smart TV:          100W
Decoder/Set-top box:   20W
Phone Charger:         10W
Refrigerator:          150W (duty cycle 0.3 → effective 45W)
Air Conditioner 1HP:   750W
Air Conditioner 1.5HP: 1100W
Washing Machine:       500W
Water Pump:            750W
Custom:                user defined wattage

## Standard panel wattage options

200W, 250W, 300W, 350W, 400W, 450W, 500W, 550W
Default selection: 400W

## Unit tests required

Every formula must have tests covering:
- Both system types (separate and hybrid)
- All four battery chemistries
- 12V, 24V, and 48V system voltages
- Series and parallel configurations
- Fridge duty cycle calculation
- Edge cases: single appliance load, maximum load,
  single battery, single panel
- Rounding to standard component sizes
- Efficiency at minimum (50%) and maximum (99%) values