/**
 * SystemRecommendationScreen — Step 4 of 6.
 * Runs the full sizing calculation pipeline and displays results in a
 * bento-style 2-column metric card grid.
 *
 * Reads inputs from route.params and calls runFullSizingCalculation().
 * Passes full sizing result forward to SystemDiagramScreen.
 *
 * Layout:
 *   - Metric cards: 2-col bento grid. Solar Array card spans full width.
 *   - Wiring pills below the grid.
 *   - Efficiency Assumptions accordion (collapsible).
 *   - Fixed bottom CTA bar.
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  Colors,
  ColorAlpha,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Borders,
  Gradients,
  Shadows,
} from '../theme/index';
import { SYSTEM_SIZING, APP } from '../constants/strings';
import {
  DEFAULT_INVERTER_EFFICIENCY,
  DEFAULT_PANEL_DERATING,
  DEFAULT_PANEL_WATTAGE,
  PEAK_SUN_HOURS_DEFAULT,
  DAYS_AUTONOMY_DEFAULT,
  DEFAULT_BATTERY_VOLTAGE,
  DEFAULT_BATTERY_AH,
} from '../constants/index';
import { runFullSizingCalculation } from '../utils/calculations';
import ProgressBar from '../components/ProgressBar';

// ─── METRIC CARD ─────────────────────────────────────────────────────────────

/**
 * A single bento metric card with blue icon, amber value, teal sub-label.
 * Optional badge displayed top-right alongside the pencil edit icon.
 * Optional fullWidth to span 2 columns.
 *
 * @param {{
 *   icon: string,
 *   label: string,
 *   value: string,
 *   subValue: string,
 *   badge?: string,
 *   fullWidth?: boolean,
 * }} props
 */
function MetricCard({ icon, label, value, subValue, badge, fullWidth }) {
  return (
    <View style={[styles.metricCard, fullWidth && styles.metricCardFull]}>
      {/* Top row: icon + (badge +) edit icon */}
      <View style={styles.metricCardTopRow}>
        <MaterialCommunityIcons name={icon} size={24} color={Colors.tertiary} />
        <View style={styles.metricCardTopRight}>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
          <MaterialCommunityIcons
            name="pencil-outline"
            size={18}
            color={Colors.onSurfaceVariant}
          />
        </View>
      </View>

      {/* Label + value + sub-value */}
      <View>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricSubValue}>{subValue}</Text>
      </View>
    </View>
  );
}

// ─── WIRING PILLS ────────────────────────────────────────────────────────────

/**
 * Horizontal pill row showing panel and battery wiring configurations.
 * @param {{ panelConfig: string, batteryConfig: string }} props
 */
function WiringPills({ panelConfig, batteryConfig }) {
  return (
    <View style={styles.wiringPill}>
      <Text style={styles.wiringLabel}>{SYSTEM_SIZING.wiringLabel}</Text>
      <View style={styles.wiringChip}>
        <Text style={styles.wiringChipText}>
          {SYSTEM_SIZING.panelWiringPrefix} {panelConfig}
        </Text>
      </View>
      <View style={styles.wiringChip}>
        <Text style={styles.wiringChipText}>
          {SYSTEM_SIZING.batteryWiringPrefix} {batteryConfig}
        </Text>
      </View>
    </View>
  );
}

// ─── EFFICIENCY BAR ───────────────────────────────────────────────────────────

/**
 * Single efficiency assumption row: label + percentage readout + amber fill bar.
 * @param {{ label: string, value: number }} props  value: 0–1 fraction
 */
function EfficiencyBar({ label, value }) {
  const pct = Math.round(value * 100);
  return (
    <View style={styles.efficiencyRow}>
      <View style={styles.efficiencyLabelRow}>
        <View style={styles.efficiencyLabelLeft}>
          <Text style={styles.efficiencyLabel}>{label}</Text>
          <MaterialCommunityIcons
            name="information-outline"
            size={13}
            color={ColorAlpha.onSurfaceVariant60}
          />
        </View>
        <Text style={styles.efficiencyPct}>{pct}%</Text>
      </View>
      {/* Fill bar */}
      <View style={styles.efficiencyTrack}>
        <View style={[styles.efficiencyFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

// ─── EFFICIENCY ACCORDION ─────────────────────────────────────────────────────

/**
 * Collapsible accordion section for efficiency assumption bars.
 * @param {{
 *   inverterEff: number,
 *   panelDerating: number,
 *   cablingLoss: number,
 *   onUpdateConstants: Function,
 * }} props
 */
function EfficiencyAccordion({ inverterEff, panelDerating, cablingLoss, onUpdateConstants }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <View style={styles.accordion}>
      {/* Header */}
      <TouchableOpacity
        onPress={toggle}
        style={styles.accordionHeader}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.accordionTitle}>{SYSTEM_SIZING.efficiencyLabel}</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.primaryContainer}
        />
      </TouchableOpacity>

      {/* Body — shown when expanded */}
      {open && (
        <View style={styles.accordionBody}>
          <EfficiencyBar label={SYSTEM_SIZING.inverterEffLabel} value={inverterEff} />
          <EfficiencyBar label={SYSTEM_SIZING.panelDeratingLabel} value={panelDerating} />
          <EfficiencyBar label={SYSTEM_SIZING.cablingLossLabel} value={cablingLoss} />

          <TouchableOpacity
            onPress={onUpdateConstants}
            style={styles.updateConstantsBtn}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.updateConstantsBtnText}>
              {SYSTEM_SIZING.updateConstantsBtn}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── SYSTEM RECOMMENDATION SCREEN ────────────────────────────────────────────

/**
 * SystemRecommendationScreen — Step 4 of 6.
 * Runs calculation pipeline and renders bento metric grid + wiring + accordion.
 * @param {{ navigation: object, route: object }} props
 */
export default function SystemRecommendationScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const clientInfo = route.params?.clientInfo ?? {};
  const systemConfig = route.params?.systemConfig ?? {};
  const appliances = route.params?.appliances ?? [];

  // ── Efficiency values (could be overridden from settings in future)
  const inverterEfficiency = DEFAULT_INVERTER_EFFICIENCY;
  const panelDerating = DEFAULT_PANEL_DERATING;
  const CABLING_LOSS = 0.035;

  // ── Run the calculation pipeline
  const sizing = useMemo(() => {
    try {
      return runFullSizingCalculation({
        appliances,
        systemVoltageV: systemConfig.systemVoltageV ?? 48,
        batteryVoltageV: DEFAULT_BATTERY_VOLTAGE,
        batteryUnitAh: DEFAULT_BATTERY_AH,
        batteryChemistry: systemConfig.batteryChemistry ?? {
          dod: 0.9,
          efficiency: 0.95,
          label: 'Lithium (LiFePO4)',
        },
        inverterEfficiency,
        panelDeratingFactor: panelDerating,
        peakSunHoursPerDay: PEAK_SUN_HOURS_DEFAULT,
        selectedPanelW: DEFAULT_PANEL_WATTAGE,
        daysAutonomy: DAYS_AUTONOMY_DEFAULT,
        isHybrid: systemConfig.isHybrid ?? true,
      });
    } catch (e) {
      console.error('SystemRecommendationScreen sizing error:', e);
      return null;
    }
  }, [appliances, systemConfig, inverterEfficiency, panelDerating]);

  // ── Derived display values
  const inverterKva = sizing
    ? (sizing.inverterSizeVA / 1000).toFixed(1) + ' kVA'
    : '—';
  const batteryKwh = sizing
    ? ((sizing.batteryCapacityAh * (systemConfig.systemVoltageV ?? 48)) / 1000).toFixed(1) + ' kWh'
    : '—';
  const solarKwp = sizing
    ? ((sizing.panelArray.totalPanelWattsW) / 1000).toFixed(1) + ' kWp'
    : '—';
  const solarPanelDesc = sizing
    ? `${sizing.panelArray.panelCount}× ${DEFAULT_PANEL_WATTAGE}W ${SYSTEM_SIZING.panelTypeMonocrystalline}`
    : '—';
  const backupHrs = sizing ? sizing.backupHours.toFixed(1) + ' hrs' : '—';
  const avgLoadW = sizing ? Math.round(sizing.totalDailyWh / 24) : 0;
  const dailyKwh = sizing ? sizing.dailyYieldKwh.toFixed(1) + ' kWh' : '—';
  const panelConfigLabel = sizing?.panelArray?.configLabel ?? '—';
  const batteryConfigLabel = sizing?.batteryConfig?.configLabel ?? '—';

  const voltLabel = `${systemConfig.systemVoltageV ?? 48}V DC input`;
  const chemLabel = systemConfig.batteryChemistry?.label ?? 'Lithium (LiFePO4)';

  // ── Handlers
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);
  const handleUpdateConstants = useCallback(() => navigation.navigate('Settings'), [navigation]);

  const handleNext = useCallback(() => {
    navigation.navigate('SystemDiagram', {
      clientInfo,
      systemConfig,
      appliances,
      sizing,
    });
  }, [navigation, clientInfo, systemConfig, appliances, sizing]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ── NAV HEADER ─────────────────────────────────────────────────── */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.navIconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.primaryContainer} />
          </TouchableOpacity>
          <Text style={styles.navWordmark}>{APP.wordmark}</Text>
        </View>
        <TouchableOpacity
          onPress={handleSettings}
          style={styles.navIconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="cog" size={24} color={ColorAlpha.onSurfaceVariant60} />
        </TouchableOpacity>
      </View>

      {/* ── SCROLL BODY ────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 80 + insets.bottom + Spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress row */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabelLeft}>{SYSTEM_SIZING.stepLabel}</Text>
          <Text style={styles.progressLabelRight}>{SYSTEM_SIZING.stepRight}</Text>
        </View>
        <ProgressBar currentStep={4} />

        {/* Screen title */}
        <View style={styles.titleBlock}>
          <Text style={styles.screenTitle}>{SYSTEM_SIZING.screenTitle}</Text>
          <Text style={styles.screenSubtitle}>{SYSTEM_SIZING.subtitle}</Text>
        </View>

        {/* ── BENTO METRIC GRID ─────────────────────────────────────── */}
        <View style={styles.bentoGrid}>
          {/* Row 1: Inverter + Battery (half each) */}
          <View style={styles.bentoRow}>
            <MetricCard
              icon="lightning-bolt"
              label={SYSTEM_SIZING.inverterLabel}
              value={inverterKva}
              subValue={voltLabel}
            />
            <MetricCard
              icon="battery-charging"
              label={SYSTEM_SIZING.batteryLabel}
              value={batteryKwh}
              subValue={chemLabel}
            />
          </View>

          {/* Row 2: Solar Array (full width) */}
          <MetricCard
            icon="solar-panel-large"
            label={SYSTEM_SIZING.solarLabel}
            value={solarKwp}
            subValue={solarPanelDesc}
            badge={panelConfigLabel}
            fullWidth
          />

          {/* Row 3: Backup + Daily Energy (half each) */}
          <View style={styles.bentoRow}>
            <MetricCard
              icon="timer-outline"
              label={SYSTEM_SIZING.backupLabel}
              value={backupHrs}
              subValue={`${SYSTEM_SIZING.avgLoad} ${avgLoadW}W ${SYSTEM_SIZING.avgLoadSuffix}`}
            />
            <MetricCard
              icon="white-balance-sunny"
              label={SYSTEM_SIZING.dailyEnergyLabel}
              value={dailyKwh}
              subValue={SYSTEM_SIZING.avgYield}
            />
          </View>
        </View>

        {/* ── WIRING PILLS ──────────────────────────────────────────── */}
        <View style={styles.wiringSection}>
          <WiringPills
            panelConfig={panelConfigLabel}
            batteryConfig={batteryConfigLabel}
          />
        </View>

        {/* ── EFFICIENCY ACCORDION ──────────────────────────────────── */}
        <View style={styles.accordionSection}>
          <EfficiencyAccordion
            inverterEff={inverterEfficiency}
            panelDerating={panelDerating}
            cablingLoss={CABLING_LOSS}
            onUpdateConstants={handleUpdateConstants}
          />
        </View>
      </ScrollView>

      {/* ── FIXED CTA BAR ──────────────────────────────────────────────── */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => pressed && styles.ctaPressed}
        >
          <LinearGradient
            colors={Gradients.cta.colors}
            start={Gradients.cta.start}
            end={Gradients.cta.end}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaLabel}>{SYSTEM_SIZING.nextBtn}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── NAV
  navBar: {
    height: 64,
    backgroundColor: Colors.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPaddingH,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  navIconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navWordmark: {
    fontFamily: FontFamily.manropeBlack,
    fontSize: FontSize.xl,
    color: Colors.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },

  // ── SCROLL
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.xxl,
  },

  // ── PROGRESS
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLabelLeft: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
  },
  progressLabelRight: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.primary,
  },

  // ── TITLE
  titleBlock: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.sectionGap,
  },
  screenTitle: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.display,
    letterSpacing: -0.5,
    color: Colors.onSurface,
  },
  screenSubtitle: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },

  // ── BENTO GRID
  bentoGrid: {
    gap: Spacing.gridGap,
    marginBottom: Spacing.section,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: Spacing.gridGap,
  },

  // ── METRIC CARD
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    minHeight: 140,
    justifyContent: 'space-between',
    ...Borders.card,
  },
  metricCardFull: {
    flex: 0,
    width: '100%',
  },
  metricCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  metricCardTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metricLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xxl,
    color: Colors.primaryContainer,
    letterSpacing: -0.3,
  },
  metricSubValue: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.caption,
    color: Colors.secondary,
    marginTop: 2,
  },

  // ── BADGE (e.g. panel config "3S2P")
  badge: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: ColorAlpha.outlineVariant20,
  },
  badgeText: {
    fontFamily: FontFamily.interBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.secondary,
  },

  // ── WIRING PILLS
  wiringSection: {
    marginBottom: Spacing.section,
  },
  wiringPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Borders.card,
  },
  wiringLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
  },
  wiringChip: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  wiringChipText: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.caption,
    color: Colors.onSurface,
  },

  // ── EFFICIENCY ACCORDION
  accordionSection: {
    marginBottom: Spacing.section,
  },
  accordion: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Borders.card,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  accordionTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.body,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
  },
  accordionBody: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xxl,
  },

  // ── EFFICIENCY ROW + BAR
  efficiencyRow: {
    gap: Spacing.sm,
  },
  efficiencyLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  efficiencyLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  efficiencyLabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.caption,
    color: Colors.onSurfaceVariant,
  },
  efficiencyPct: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.caption,
    color: Colors.onSurface,
  },
  efficiencyTrack: {
    height: 4,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  efficiencyFill: {
    height: '100%',
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.full,
  },

  // ── UPDATE CONSTANTS BUTTON
  updateConstantsBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: ColorAlpha.outlineVariant30,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  updateConstantsBtnText: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurface,
  },

  // ── CTA BAR
  ctaBar: {
    backgroundColor: ColorAlpha.ctaBarBackground,
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: ColorAlpha.outlineVariant10,
  },
  ctaButton: {
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.fab,
  },
  ctaPressed: {
    transform: [{ scale: 0.98 }],
  },
  ctaLabel: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.lg,
    color: Colors.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
});
