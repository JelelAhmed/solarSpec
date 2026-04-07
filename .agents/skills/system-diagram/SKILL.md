---
name: system-diagram
description: Use when building, modifying, or debugging the SVG
system diagram component, its layout, wire labels,
or component interactions.
---

## Overview

The diagram is a custom illustrated SVG built with React Native SVG.
It is NOT a generic flowchart with rounded rectangles.
Every component has an illustrated silhouette.

The Stitch source at /design/stitch-code/06-system-diagram.html
is a LAYOUT REFERENCE ONLY for component positions.
The actual SVG component shapes are custom illustrated
(not Material Symbols icons).

## Component layout and silhouettes

Grid pylon (top left):
  Silhouette: transmission tower — vertical centre mast,
  horizontal crossbars at two heights, diagonal bracing lines,
  3 dashed lines descending from crossbar ends.
  Colour: #D7C3AE (on-surface-variant) at 60% opacity.
  Label: "Grid" (not NEPA, not Grid Pylon)

Solar panels (top centre):
  Silhouette: rectangular frame divided into a cell grid
  by horizontal and vertical internal lines.
  Colour: #F5A623 (amber) stroke, surface-container-high fill.
  Terminal dot at bottom centre: circle r=4 fill=#F5A623.
  Label: panel count + wattage + wiring config e.g. "3S2P"

Charge controller (middle centre — SEPARATE SYSTEM ONLY):
  Silhouette: rectangular unit with 3 small status LED dots
  (circles, amber/amber/red), small display rectangle
  showing controller type and rated current.
  Colour: #68DBAE (teal) stroke.
  COMPLETELY HIDDEN for hybrid inverter system type.
  Layout adjusts to fill space when hidden.

Inverter / Hybrid Inverter (right of centre):
  Silhouette: rectangular box with vertical ventilation slot
  lines on one side, AC socket symbol (circle with two
  rectangular holes and earth pin line) on other side.
  Colour: #9BD9FF (tertiary/blue) stroke.
  Label: "Inverter" or "Hybrid Inverter" based on system type.

Battery bank (left of centre):
  Silhouette: battery body rectangle, 3 small terminal nubs
  on top (separate rectangles), horizontal charge percentage
  bar inside body, + symbol top left area, − top right area.
  Colour: #378ADD (blue) stroke.
  Charge bar fill: #378ADD at 60% opacity showing SOC.

House/Load (bottom centre):
  Silhouette: triangular roof (polygon), rectangular body,
  small door rectangle, small window rectangle with cross lines.
  Colour: #D85A30 (coral) stroke.
  Label: calculated load watts + backup hours

Grid/Protection box (bottom left):
  Silhouette: small rectangular box containing simplified
  MCB toggle symbol, SPD triangle symbol,
  changeover switch symbol.
  Colour: #888780 (grey) stroke.
  Label: MCB rating + SPD type

## Wire connections

Wires connect components at terminal dot points.
All values come from props — never calculated inside component.

Wire colours:
  DC wires: #F5A623 (amber) strokeWidth:1.5
  AC wires: #1D9E75 (teal) strokeWidth:1.5
  Grid bypass: #888780 (grey) strokeWidth:1 strokeDasharray:"5 4"

Glow effect on wires:
  Apply SVG filter drop-shadow for amber and teal wires.
  filter: drop-shadow(0 0 4px colour)
  Note: test on Android — skip if performance issue on older devices.

Every wire segment shows a label pill:
  Background: #0E0E0E (surface-container-lowest)
  Border: #524534 (outline-variant) at 50% opacity
  borderRadius: 3
  Text: Inter 10 weight:600 colour matching wire colour
  Content: "25 A · 48 V" format

DC/AC legend (bottom of diagram card):
  Two indicators side by side
  Each: circle w:8 h:8 borderRadius:4 + label text
  Amber circle + "DC Current" label
  Teal circle + "AC Current" label

## System type variations

### Separate system layout
All 7 components visible:
  Grid pylon    → top left
  Solar panels  → top centre
  Charge ctrl   → middle centre
  Battery       → middle left
  Inverter      → middle right
  Protection    → bottom left
  House/Load    → bottom centre/right

Wire flow:
  Solar panels → charge controller (DC amber)
  Charge controller → battery (DC amber)
  Charge controller → inverter (DC amber)
  Battery → inverter (DC amber, horizontal)
  Inverter → house (AC teal)
  Grid → inverter (AC teal)
  Grid pylon → protection box (dashed grey bypass)

### Hybrid inverter layout
Charge controller HIDDEN. Layout adjusts:
  Grid pylon    → top left
  Solar panels  → top centre
  Battery       → middle left
  Hybrid inv    → centre (slightly larger, more prominent)
  Protection    → bottom left
  House/Load    → bottom centre/right

Wire flow:
  Solar panels → hybrid inverter (DC amber, direct)
  Battery → hybrid inverter (DC amber, bidirectional arrow)
  Hybrid inverter → house (AC teal)
  Grid → hybrid inverter (AC teal)
  Grid pylon → protection box (dashed grey bypass)

## Tappable interaction

Every component wrapped in Pressable.
On press: opens bottom sheet (use @gorhom/bottom-sheet).
Bottom sheet content per component:
  - Component name and full specification
  - Calculated electrical values for that node
  - Battery only: "Add another battery unit" button
    which calls onAddBattery prop callback

## Props interface

SystemDiagram receives:
  systemType: 'separate' | 'hybrid'
  batteryChemistry: 'lead-acid' | 'agm' | 'gel' | 'lithium'
  calculatedValues: {
    panelWattageW: number,
    panelCount: number,
    panelConfig: string,        // e.g. "3S2P"
    stringVoltage: number,
    stringCurrent: number,
    controllerCurrentA: number, // 0 if hybrid
    controllerVoltage: number,
    batteryCount: number,
    batteryConfig: string,      // e.g. "4S2P"
    batterySOC: number,         // 0-100
    inverterSizeVA: number,
    systemVoltage: number,
    dcBatteryCurrentA: number,
    loadWattsTotal: number,
    acLoadCurrentA: number,
    gridChargingCurrentA: number,
    backupDurationHrs: number,
    mcbRatingA: number,
  }
  onComponentPress: (componentId: string) => void
  onAddBattery: () => void

## SVG specifications

viewBox: "0 0 680 620"
width="100%"
All shapes: SVG primitives only (rect, line, polygon, circle, path, text)
No external icon fonts inside the SVG
Dark background card: backgroundColor '#1C1B1B' borderRadius:12
Card padding: 16px all sides
