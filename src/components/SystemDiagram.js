/**
 * SystemDiagram — custom illustrated SVG solar system schematic.
 *
 * Rules (from system-diagram skill):
 * - All shapes: SVG primitives only. No icon fonts inside SVG.
 * - All values come from props — zero calculation logic.
 * - Component silhouettes as described in SKILL.md.
 * - Hybrid layout: charge controller hidden, inverter centred.
 * - Separate layout: charge controller shown between panels and battery.
 * - Every component wrapped in Pressable for tap-to-detail.
 * - Wire label pills: #0E0E0E bg, #524534 border, Inter 10 600.
 * - viewBox: "0 0 680 620", width 100%.
 *
 * @param {{
 *   systemType: 'hybrid' | 'separate',
 *   calculatedValues: object,
 *   onComponentPress: (id: string) => void,
 * }} props
 */
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Filter,
  FeDropShadow,
  G,
  Line,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

// ─── COLOUR CONSTANTS (SVG inline — theme cannot be used in SVG attrs) ─────────
// Permitted exception: these match tokens exactly & are only used as SVG attribute strings.
const C = {
  amber: '#F5A623',
  teal: '#1D9E75',
  blue: '#9BD9FF',
  battBlue: '#378ADD',
  coral: '#D85A30',
  grey: '#888780',
  muted: '#D7C3AE',
  surfHigh: '#2A2A2A',
  surfLow: '#1C1B1B',
  surfLowest: '#0E0E0E',
  onSurface: '#E5E2E1',
  onSurfaceVar: '#D7C3AE',
  outlineVar: '#524534',
};

// ─── WIRE LABEL PILL ─────────────────────────────────────────────────────────

function WireLabel({ x, y, text, colour }) {
  const w = 68;
  const h = 16;
  return (
    <G>
      <Rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={3}
        fill={C.surfLowest} stroke={C.outlineVar} strokeWidth={0.5} strokeOpacity={0.5} />
      <SvgText x={x} y={y + 4} textAnchor="middle"
        fontSize={9} fontFamily="Inter_600SemiBold" fill={colour}>
        {text}
      </SvgText>
    </G>
  );
}

// ─── COMPONENT LABEL ─────────────────────────────────────────────────────────

function ComponentLabel({ x, y, text, colour = C.onSurfaceVar }) {
  const lines = text.split('\n');
  return (
    <G>
      {lines.map((line, i) => (
        <SvgText key={i} x={x} y={y + i * 13} textAnchor="middle"
          fontSize={9} fontFamily="Inter_700Bold"
          fill={colour} letterSpacing={1}>
          {line.toUpperCase()}
        </SvgText>
      ))}
    </G>
  );
}

// ─── ILLUSTRATED SILHOUETTES ──────────────────────────────────────────────────

/** Grid Pylon — transmission tower silhouette */
function GridPylon({ cx, cy }) {
  return (
    <G>
      {/* Vertical centre mast */}
      <Line x1={cx} y1={cy - 36} x2={cx} y2={cy + 36} stroke={C.muted} strokeWidth={1.5} strokeOpacity={0.6} />
      {/* Top crossbar */}
      <Line x1={cx - 22} y1={cy - 20} x2={cx + 22} y2={cy - 20} stroke={C.muted} strokeWidth={1.5} strokeOpacity={0.6} />
      {/* Lower crossbar */}
      <Line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} stroke={C.muted} strokeWidth={1.5} strokeOpacity={0.6} />
      {/* Diagonal bracing top */}
      <Line x1={cx - 22} y1={cy - 20} x2={cx} y2={cy + 36} stroke={C.muted} strokeWidth={1} strokeOpacity={0.5} />
      <Line x1={cx + 22} y1={cy - 20} x2={cx} y2={cy + 36} stroke={C.muted} strokeWidth={1} strokeOpacity={0.5} />
      {/* Transmission lines (dashed) */}
      <Line x1={cx - 22} y1={cy - 20} x2={cx - 22} y2={cy - 4} stroke={C.muted} strokeWidth={1} strokeOpacity={0.5} strokeDasharray="3 3" />
      <Line x1={cx} y1={cy - 20} x2={cx} y2={cy - 14} stroke={C.muted} strokeWidth={1} strokeOpacity={0.5} strokeDasharray="3 3" />
      <Line x1={cx + 22} y1={cy - 20} x2={cx + 22} y2={cy - 4} stroke={C.muted} strokeWidth={1} strokeOpacity={0.5} strokeDasharray="3 3" />
    </G>
  );
}

/** Solar Panel — cell grid silhouette */
function SolarPanel({ cx, cy }) {
  const W = 56; const H = 38;
  const x0 = cx - W / 2; const y0 = cy - H / 2;
  return (
    <G>
      <Rect x={x0} y={y0} width={W} height={H} rx={2}
        fill={C.surfHigh} stroke={C.amber} strokeWidth={1.5} />
      {/* 3 columns */}
      <Line x1={x0 + W / 3} y1={y0} x2={x0 + W / 3} y2={y0 + H} stroke={C.amber} strokeWidth={0.8} strokeOpacity={0.5} />
      <Line x1={x0 + 2 * W / 3} y1={y0} x2={x0 + 2 * W / 3} y2={y0 + H} stroke={C.amber} strokeWidth={0.8} strokeOpacity={0.5} />
      {/* 2 rows */}
      <Line x1={x0} y1={y0 + H / 2} x2={x0 + W} y2={y0 + H / 2} stroke={C.amber} strokeWidth={0.8} strokeOpacity={0.5} />
      {/* Terminal dot at bottom centre */}
      <Circle cx={cx} cy={y0 + H} r={4} fill={C.amber} />
    </G>
  );
}

/** Charge controller silhouette */
function ChargeController({ cx, cy }) {
  const W = 54; const H = 44;
  const x0 = cx - W / 2; const y0 = cy - H / 2;
  return (
    <G>
      <Rect x={x0} y={y0} width={W} height={H} rx={3}
        fill={C.surfHigh} stroke={C.teal} strokeWidth={1.5} />
      {/* LED dots */}
      <Circle cx={x0 + 10} cy={y0 + 10} r={3} fill={C.amber} />
      <Circle cx={x0 + 20} cy={y0 + 10} r={3} fill={C.amber} />
      <Circle cx={x0 + 30} cy={y0 + 10} r={3} fill="#FF6B6B" />
      {/* Display rectangle */}
      <Rect x={x0 + 6} y={y0 + 18} width={W - 12} height={16} rx={2}
        fill={C.surfLowest} stroke={C.teal} strokeWidth={0.8} strokeOpacity={0.5} />
    </G>
  );
}

/** Inverter / Hybrid Inverter silhouette */
function Inverter({ cx, cy, isHybrid }) {
  const W = isHybrid ? 68 : 58; const H = isHybrid ? 58 : 48;
  const x0 = cx - W / 2; const y0 = cy - H / 2;
  return (
    <G>
      <Rect x={x0} y={y0} width={W} height={H} rx={4}
        fill={C.surfHigh} stroke={C.blue} strokeWidth={isHybrid ? 2 : 1.5} />
      {/* Ventilation slots */}
      {[0, 1, 2, 3].map(i => (
        <Line key={i}
          x1={x0 + 6} y1={y0 + 10 + i * 10}
          x2={x0 + 16} y2={y0 + 10 + i * 10}
          stroke={C.blue} strokeWidth={1} strokeOpacity={0.5} />
      ))}
      {/* AC socket: circle */}
      <Circle cx={x0 + W - 16} cy={cy} r={10}
        fill="none" stroke={C.blue} strokeWidth={1} />
      {/* Two socket holes */}
      <Rect x={x0 + W - 20} y={cy - 6} width={3} height={6} rx={1} fill={C.blue} fillOpacity={0.7} />
      <Rect x={x0 + W - 12} y={cy - 6} width={3} height={6} rx={1} fill={C.blue} fillOpacity={0.7} />
      {/* Earth pin line */}
      <Line x1={x0 + W - 16} y1={cy + 4} x2={x0 + W - 16} y2={cy + 8}
        stroke={C.blue} strokeWidth={1} strokeOpacity={0.7} />
    </G>
  );
}

/** Battery bank silhouette */
function BatteryBank({ cx, cy, soc = 80 }) {
  const W = 56; const H = 44;
  const x0 = cx - W / 2; const y0 = cy - H / 2;
  const chargeW = Math.round(((W - 12) * soc) / 100);
  return (
    <G>
      {/* Battery body */}
      <Rect x={x0} y={y0 + 8} width={W} height={H - 8} rx={3}
        fill={C.surfHigh} stroke={C.battBlue} strokeWidth={1.5} />
      {/* Terminal nubs on top */}
      <Rect x={x0 + 6} y={y0 + 2} width={10} height={8} rx={1} fill={C.battBlue} />
      <Rect x={x0 + 23} y={y0 + 2} width={10} height={8} rx={1} fill={C.battBlue} />
      <Rect x={x0 + 40} y={y0 + 2} width={10} height={8} rx={1} fill={C.battBlue} />
      {/* + and − labels */}
      <SvgText x={x0 + 5} y={y0 + 22} fontSize={9} fill={C.battBlue} fontFamily="Inter_700Bold">+</SvgText>
      <SvgText x={x0 + W - 10} y={y0 + 22} fontSize={9} fill={C.battBlue} fontFamily="Inter_700Bold">−</SvgText>
      {/* Charge bar */}
      <Rect x={x0 + 6} y={y0 + 26} width={W - 12} height={10} rx={2}
        fill={C.surfLowest} />
      <Rect x={x0 + 6} y={y0 + 26} width={chargeW} height={10} rx={2}
        fill={C.battBlue} fillOpacity={0.6} />
    </G>
  );
}

/** House/Load silhouette */
function House({ cx, cy }) {
  const W = 52; const H = 44;
  const x0 = cx - W / 2; const y0 = cy;
  return (
    <G>
      {/* Triangular roof */}
      <Polygon
        points={`${cx},${y0 - 20} ${x0 - 2},${y0 + 2} ${x0 + W + 2},${y0 + 2}`}
        fill={C.surfHigh} stroke={C.coral} strokeWidth={1.5} />
      {/* Rectangular body */}
      <Rect x={x0} y={y0 + 2} width={W} height={H - 12} rx={0}
        fill={C.surfHigh} stroke={C.coral} strokeWidth={1.5} />
      {/* Door */}
      <Rect x={cx - 7} y={y0 + H - 24} width={14} height={20} rx={1}
        fill={C.surfLowest} stroke={C.coral} strokeWidth={0.8} />
      {/* Window */}
      <Rect x={x0 + 6} y={y0 + 8} width={14} height={12} rx={1}
        fill={C.surfLowest} stroke={C.coral} strokeWidth={0.8} />
      <Line x1={x0 + 13} y1={y0 + 8} x2={x0 + 13} y2={y0 + 20} stroke={C.coral} strokeWidth={0.6} strokeOpacity={0.6} />
      <Line x1={x0 + 6} y1={y0 + 14} x2={x0 + 20} y2={y0 + 14} stroke={C.coral} strokeWidth={0.6} strokeOpacity={0.6} />
    </G>
  );
}

/** Protection box (MCB / SPD) silhouette */
function ProtectionBox({ cx, cy }) {
  const W = 48; const H = 42;
  const x0 = cx - W / 2; const y0 = cy - H / 2;
  return (
    <G>
      <Rect x={x0} y={y0} width={W} height={H} rx={3}
        fill={C.surfHigh} stroke={C.grey} strokeWidth={1.5} />
      {/* MCB toggle rectangle */}
      <Rect x={x0 + 6} y={y0 + 6} width={10} height={16} rx={2}
        fill={C.surfLowest} stroke={C.grey} strokeWidth={0.8} />
      <Rect x={x0 + 8} y={y0 + 8} width={6} height={6} rx={1}
        fill={C.grey} fillOpacity={0.5} />
      {/* SPD triangle */}
      <Polygon
        points={`${x0 + 30},${y0 + 6} ${x0 + 22},${y0 + 22} ${x0 + 38},${y0 + 22}`}
        fill="none" stroke={C.grey} strokeWidth={1} />
      <Line x1={x0 + 30} y1={y0 + 22} x2={x0 + 30} y2={y0 + 28}
        stroke={C.grey} strokeWidth={1} />
      {/* Rating text */}
      <SvgText x={cx} y={y0 + H - 6} textAnchor="middle"
        fontSize={7} fill={C.grey} fontFamily="Inter_600SemiBold">MCB</SvgText>
    </G>
  );
}

// ─── DC/AC LEGEND ────────────────────────────────────────────────────────────

function DiagramLegend({ x, y }) {
  return (
    <G>
      <Rect x={x} y={y} width={150} height={22} rx={4}
        fill={C.surfLowest} fillOpacity={0.85}
        stroke={C.outlineVar} strokeWidth={0.5} strokeOpacity={0.4} />
      {/* DC dot */}
      <Circle cx={x + 14} cy={y + 11} r={4} fill={C.amber} />
      <SvgText x={x + 22} y={y + 15} fontSize={8}
        fontFamily="Inter_700Bold" fill={C.onSurfaceVar} letterSpacing={1}>
        DC CURRENT
      </SvgText>
      {/* AC dot */}
      <Circle cx={x + 85} cy={y + 11} r={4} fill={C.teal} />
      <SvgText x={x + 93} y={y + 15} fontSize={8}
        fontFamily="Inter_700Bold" fill={C.onSurfaceVar} letterSpacing={1}>
        AC CURRENT
      </SvgText>
    </G>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

/**
 * SystemDiagram — full SVG schematic with tappable component zones.
 * Receives all display values as props. Zero calculation logic.
 *
 * @param {{
 *   systemType: 'hybrid' | 'separate',
 *   calculatedValues: object,
 *   onComponentPress: (id: string) => void,
 * }} props
 */
export default function SystemDiagram({ systemType, calculatedValues, onComponentPress }) {
  const isHybrid = systemType === 'hybrid';
  const cv = calculatedValues;

  const press = useCallback((id) => () => onComponentPress(id), [onComponentPress]);

  // ── HYBRID LAYOUT POSITIONS
  // viewBox 680 × 620
  const pos = isHybrid ? {
    pylon:    { cx: 130, cy: 130 },
    solar:    { cx: 360, cy: 100 },
    battery:  { cx: 130, cy: 330 },
    inverter: { cx: 380, cy: 320 },
    protect:  { cx: 130, cy: 510 },
    house:    { cx: 420, cy: 490 },
  } : {
    pylon:    { cx: 100, cy: 120 },
    solar:    { cx: 340, cy: 90 },
    charge:   { cx: 340, cy: 260 },
    battery:  { cx: 130, cy: 320 },
    inverter: { cx: 520, cy: 320 },
    protect:  { cx: 130, cy: 490 },
    house:    { cx: 400, cy: 490 },
  };

  // Wire label texts
  const dcPanelLabel  = `${cv.stringCurrent ?? 0}A · ${cv.stringVoltage ?? 48}V`;
  const dcBattLabel   = `${cv.dcBatteryCurrentA ?? 0}A · ${cv.systemVoltage ?? 48}V`;
  const acLoadLabel   = `${cv.acLoadCurrentA ?? 0}A · 230V`;
  const acGridLabel   = `${cv.gridChargingCurrentA ?? 0}A · 230V`;
  const ctrlLabel     = `${cv.controllerCurrentA ?? 0}A · ${cv.systemVoltage ?? 48}V`;

  return (
    <View style={styles.svgCard}>
      <Svg width="100%" viewBox="0 0 680 620" preserveAspectRatio="xMidYMid meet">
        <Defs>
          <Filter id="glowAmber" x="-50%" y="-50%" width="200%" height="200%">
            <FeDropShadow dx={0} dy={0} stdDeviation={3} floodColor={C.amber} floodOpacity={0.7} />
          </Filter>
          <Filter id="glowTeal" x="-50%" y="-50%" width="200%" height="200%">
            <FeDropShadow dx={0} dy={0} stdDeviation={3} floodColor={C.teal} floodOpacity={0.7} />
          </Filter>
        </Defs>

        {/* ── WIRES ─────────────────────────────────────────────────────── */}
        {isHybrid ? (
          <G>
            {/* Solar → Inverter (DC amber) */}
            <Path d={`M ${pos.solar.cx} ${pos.solar.cy + 19} V ${pos.inverter.cy - 29}`}
              stroke={C.amber} strokeWidth={1.5} filter="url(#glowAmber)" />
            {/* Battery → Inverter (DC amber bidirectional) */}
            <Path d={`M ${pos.battery.cx + 28} ${pos.battery.cy} H ${pos.inverter.cx - 34}`}
              stroke={C.amber} strokeWidth={1.5} filter="url(#glowAmber)" />
            {/* Inverter → House (AC teal) */}
            <Path d={`M ${pos.inverter.cx} ${pos.inverter.cy + 29} V ${pos.house.cy - 20}`}
              stroke={C.teal} strokeWidth={1.5} filter="url(#glowTeal)" />
            {/* Grid → Inverter (AC teal) */}
            <Path d={`M ${pos.pylon.cx + 22} ${pos.pylon.cy} H ${pos.inverter.cx - 34} V ${pos.inverter.cy}`}
              stroke={C.teal} strokeWidth={1.5} filter="url(#glowTeal)" />
            {/* Grid pylon → protection (dashed grey bypass) */}
            <Path d={`M ${pos.pylon.cx} ${pos.pylon.cy + 36} V ${pos.protect.cy}`}
              stroke={C.grey} strokeWidth={1} strokeDasharray="5 4" />

            {/* Wire labels */}
            <WireLabel x={pos.solar.cx} y={(pos.solar.cy + 19 + pos.inverter.cy - 29) / 2}
              text={dcPanelLabel} colour={C.amber} />
            <WireLabel x={(pos.battery.cx + 28 + pos.inverter.cx - 34) / 2} y={pos.battery.cy}
              text={dcBattLabel} colour={C.amber} />
            <WireLabel x={pos.inverter.cx} y={(pos.inverter.cy + 29 + pos.house.cy - 20) / 2}
              text={acLoadLabel} colour={C.teal} />
          </G>
        ) : (
          <G>
            {/* Solar → Charge Controller (DC amber) */}
            <Path d={`M ${pos.solar.cx} ${pos.solar.cy + 19} V ${pos.charge.cy - 22}`}
              stroke={C.amber} strokeWidth={1.5} filter="url(#glowAmber)" />
            {/* Charge Controller → Battery (DC amber) */}
            <Path d={`M ${pos.charge.cx - 27} ${pos.charge.cy} H ${pos.battery.cx + 28}`}
              stroke={C.amber} strokeWidth={1.5} filter="url(#glowAmber)" />
            {/* Charge Controller → Inverter (DC amber) */}
            <Path d={`M ${pos.charge.cx + 27} ${pos.charge.cy} H ${pos.inverter.cx - 29}`}
              stroke={C.amber} strokeWidth={1.5} filter="url(#glowAmber)" />
            {/* Battery → Inverter (DC amber) */}
            <Path d={`M ${pos.battery.cx + 28} ${pos.battery.cy} H ${pos.inverter.cx - 29}`}
              stroke={C.amber} strokeWidth={1.5} filter="url(#glowAmber)" />
            {/* Inverter → House (AC teal) */}
            <Path d={`M ${pos.inverter.cx} ${pos.inverter.cy + 24} V ${pos.house.cy - 20}`}
              stroke={C.teal} strokeWidth={1.5} filter="url(#glowTeal)" />
            {/* Grid → Inverter (AC teal) */}
            <Path d={`M ${pos.pylon.cx + 22} ${pos.pylon.cy} H ${pos.inverter.cx - 29} V ${pos.inverter.cy}`}
              stroke={C.teal} strokeWidth={1.5} filter="url(#glowTeal)" />
            {/* Grid → Protection (dashed grey bypass) */}
            <Path d={`M ${pos.pylon.cx} ${pos.pylon.cy + 36} V ${pos.protect.cy}`}
              stroke={C.grey} strokeWidth={1} strokeDasharray="5 4" />

            {/* Wire labels */}
            <WireLabel x={pos.solar.cx} y={(pos.solar.cy + 19 + pos.charge.cy - 22) / 2}
              text={dcPanelLabel} colour={C.amber} />
            <WireLabel x={(pos.charge.cx + 27 + pos.inverter.cx - 29) / 2} y={pos.charge.cy}
              text={ctrlLabel} colour={C.amber} />
            <WireLabel x={pos.inverter.cx} y={(pos.inverter.cy + 24 + pos.house.cy - 20) / 2}
              text={acLoadLabel} colour={C.teal} />
          </G>
        )}

        {/* ── COMPONENT SILHOUETTES ─────────────────────────────────────── */}

        {/* Grid Pylon */}
        <GridPylon cx={pos.pylon.cx} cy={pos.pylon.cy} />
        <ComponentLabel x={pos.pylon.cx} y={pos.pylon.cy + 44} text="Grid" />

        {/* Solar Panels */}
        <SolarPanel cx={pos.solar.cx} cy={pos.solar.cy} />
        <ComponentLabel
          x={pos.solar.cx} y={pos.solar.cy - 30}
          text={`${cv.panelCount ?? 0}× ${cv.panelWattageW ?? 400}W\n${cv.panelConfig ?? ''}`}
          colour={C.amber}
        />

        {/* Charge Controller (separate only) */}
        {!isHybrid && pos.charge && (
          <G>
            <ChargeController cx={pos.charge.cx} cy={pos.charge.cy} />
            <ComponentLabel x={pos.charge.cx} y={pos.charge.cy + 28}
              text={`${cv.controllerCurrentA ?? 0}A MPPT`} colour={C.teal} />
          </G>
        )}

        {/* Battery Bank */}
        <BatteryBank cx={pos.battery.cx} cy={pos.battery.cy} soc={cv.batterySOC ?? 80} />
        <ComponentLabel x={pos.battery.cx} y={pos.battery.cy + 30}
          text={`${cv.batteryCount ?? 0} UNITS\n${cv.batteryConfig ?? ''}`} colour={C.battBlue} />

        {/* Inverter */}
        <Inverter cx={pos.inverter.cx} cy={pos.inverter.cy} isHybrid={isHybrid} />
        <ComponentLabel x={pos.inverter.cx} y={pos.inverter.cy + (isHybrid ? 36 : 30)}
          text={isHybrid ? 'Hybrid\nInverter' : 'Inverter'}
          colour={C.blue} />

        {/* Protection Box */}
        <ProtectionBox cx={pos.protect.cx} cy={pos.protect.cy} />
        <ComponentLabel x={pos.protect.cx} y={pos.protect.cy + 30}
          text={`${cv.mcbRatingA ?? 0}A MCB`} colour={C.grey} />

        {/* House / Load */}
        <House cx={pos.house.cx} cy={pos.house.cy} />
        <ComponentLabel x={pos.house.cx} y={pos.house.cy + 36}
          text={`${cv.loadWattsTotal ?? 0}W\n${cv.backupDurationHrs ?? 0}HRS`} colour={C.coral} />

        {/* DC/AC Legend */}
        <DiagramLegend x={490} y={580} />
      </Svg>

      {/* ── PRESSABLE HIT ZONES (absolute overlay, pointer-events transparent by default) */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        {Object.entries(isHybrid ? {
          pylon:    { top: 80,  left: 80,  width: 100, height: 80 },
          solar:    { top: 60,  left: 285, width: 150, height: 90 },
          battery:  { top: 280, left: 80,  width: 100, height: 90 },
          inverter: { top: 270, left: 310, width: 140, height: 110 },
          protect:  { top: 450, left: 80,  width: 100, height: 90 },
          house:    { top: 440, left: 340, width: 150, height: 110 },
        } : {
          pylon:    { top: 70,  left: 50,  width: 100, height: 80 },
          solar:    { top: 50,  left: 265, width: 150, height: 90 },
          charge:   { top: 215, left: 265, width: 150, height: 90 },
          battery:  { top: 270, left: 55,  width: 100, height: 90 },
          inverter: { top: 270, left: 440, width: 140, height: 100 },
          protect:  { top: 440, left: 55,  width: 100, height: 90 },
          house:    { top: 440, left: 310, width: 150, height: 110 },
        }).map(([id, zone]) => (
          <Pressable
            key={id}
            onPress={press(id)}
            style={[styles.hitZone, zone]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  svgCard: {
    backgroundColor: '#1C1B1B',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    aspectRatio: 680 / 620,
    overflow: 'hidden',
  },
  hitZone: {
    position: 'absolute',
  },
});
