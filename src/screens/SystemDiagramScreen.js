/**
 * SystemDiagramScreen — Step 5 of 6.
 *
 * Displays the custom illustrated SVG system diagram and three
 * technical metadata info cards below it. Tapping a component
 * opens a bottom sheet with component-specific details.
 *
 * Layout:
 *   Nav → Progress (own row, Step 5) → "System Diagram" title
 *   → SVG diagram card → 3 metadata info cards stacked
 *   → fixed amber gradient CTA bar "NEXT STEP"
 *   + @gorhom/bottom-sheet for component detail panel
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

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
import { SYSTEM_DIAGRAM, APP } from '../constants/strings';
import { calculateMCBRating } from '../utils/calculations';
import ProgressBar from '../components/ProgressBar';
import SystemDiagram from '../components/SystemDiagram';

// ─── COMPONENT DETAIL CONTENT ─────────────────────────────────────────────────

/**
 * Returns a title + detail items array for the bottom sheet based on the
 * tapped component ID and the full sizing result.
 *
 * @param {string} componentId
 * @param {object} sizing
 * @param {object} systemConfig
 * @returns {{ title: string, subtitle: string, items: Array<{label, value}> }}
 */
function getComponentDetail(componentId, sizing, systemConfig) {
  const isHybrid = systemConfig?.isHybrid ?? true;
  const sysV = systemConfig?.systemVoltageV ?? 48;

  switch (componentId) {
    case 'solar':
      return {
        title: SYSTEM_DIAGRAM.solarDetailTitle,
        subtitle: `${sizing?.panelArray?.panelCount ?? 0}× ${sizing?.panelArray?.panelsPerString ?? 0} Panels/String`,
        items: [
          { label: 'Total Power', value: `${Math.round((sizing?.panelArray?.totalPanelWattsW ?? 0))} W` },
          { label: 'Config', value: sizing?.panelArray?.configLabel ?? '—' },
          { label: 'String Voltage', value: `${sizing?.panelArray?.stringVoltageV ?? 0} V` },
          { label: 'String Current', value: `${sizing?.panelArray?.stringCurrentA?.toFixed(1) ?? 0} A` },
          { label: 'Panel Voc', value: `${sizing?.panelArray?.panelVoc ?? 0} V` },
        ],
      };
    case 'battery':
      return {
        title: SYSTEM_DIAGRAM.batteryDetailTitle,
        subtitle: `${systemConfig?.batteryChemistry?.label ?? 'Lithium'}`,
        items: [
          { label: 'Capacity', value: `${sizing?.batteryCapacityAh ?? 0} Ah` },
          { label: 'Config', value: sizing?.batteryConfig?.configLabel ?? '—' },
          { label: 'Total Units', value: `${sizing?.batteryConfig?.totalUnits ?? 1}` },
          { label: 'Bank Voltage', value: `${sizing?.batteryConfig?.totalBankV ?? sysV} V` },
          { label: 'DOD', value: `${Math.round((systemConfig?.batteryChemistry?.dod ?? 0.9) * 100)}%` },
        ],
      };
    case 'inverter':
      return {
        title: isHybrid ? SYSTEM_DIAGRAM.hybridDetailTitle : SYSTEM_DIAGRAM.inverterDetailTitle,
        subtitle: `${(sizing?.inverterSizeVA ?? 0) / 1000} kVA Rating`,
        items: [
          { label: 'Rated Power', value: `${sizing?.inverterSizeVA ?? 0} VA` },
          { label: 'DC Input', value: `${sysV} V` },
          { label: 'AC Output', value: '230 V / 50 Hz' },
          { label: 'Type', value: isHybrid ? 'Hybrid MPPT' : 'Off-Grid' },
        ],
      };
    case 'protect':
      return {
        title: SYSTEM_DIAGRAM.protectDetailTitle,
        subtitle: 'MCB + SPD Assembly',
        items: [
          { label: 'MCB Rating', value: `${sizing ? calculateMCBRating(sizing.wireCurrents?.inverterToLoad?.currentA ?? 0).mcbRatingA : 0} A` },
          { label: 'SPD Type', value: 'Type II (IEC 61643-11)' },
          { label: 'Changeover', value: 'Automatic Transfer Switch' },
        ],
      };
    case 'house':
      return {
        title: SYSTEM_DIAGRAM.houseDetailTitle,
        subtitle: 'Total Electrical Load',
        items: [
          { label: 'Peak Load', value: `${sizing?.peakWatts ?? 0} W` },
          { label: 'Daily Energy', value: `${Math.round((sizing?.totalDailyWh ?? 0))} Wh` },
          { label: 'Backup Time', value: `${sizing?.backupHours ?? 0} hrs` },
        ],
      };
    case 'pylon':
      return {
        title: SYSTEM_DIAGRAM.gridDetailTitle,
        subtitle: 'Utility Grid Connection',
        items: [
          { label: 'Grid Voltage', value: '230 V AC' },
          { label: 'Frequency', value: '50 Hz' },
          { label: 'Role', value: isHybrid ? 'Supplementary / Charging' : 'Bypass Only' },
        ],
      };
    case 'charge':
      return {
        title: SYSTEM_DIAGRAM.chargeDetailTitle,
        subtitle: 'MPPT Charge Controller',
        items: [
          { label: 'Rated Current', value: `${sizing?.chargeController?.controllerCurrentA ?? 0} A` },
          { label: 'System Voltage', value: `${sysV} V` },
          { label: 'Type', value: 'MPPT (Maximum Power Point Tracking)' },
        ],
      };
    default:
      return { title: 'Component', subtitle: '', items: [] };
  }
}

// ─── INFO CARD ────────────────────────────────────────────────────────────────

/**
 * Technical metadata info card — label + value stacked.
 * @param {{ label: string, value: string, valueColour?: string }} props
 */
function InfoCard({ label, value, valueColour }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardLabel}>{label}</Text>
      <Text style={[styles.infoCardValue, valueColour && { color: valueColour }]}>
        {value}
      </Text>
    </View>
  );
}

// ─── DETAIL ROW ───────────────────────────────────────────────────────────────

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowLabel}>{label}</Text>
      <Text style={styles.detailRowValue}>{value}</Text>
    </View>
  );
}

// ─── SYSTEM DIAGRAM SCREEN ────────────────────────────────────────────────────

/**
 * SystemDiagramScreen — Step 5 of 6.
 * @param {{ navigation: object, route: object }} props
 */
export default function SystemDiagramScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const clientInfo = route.params?.clientInfo ?? {};
  const systemConfig = route.params?.systemConfig ?? {};
  const appliances = route.params?.appliances ?? [];
  const sizing = route.params?.sizing ?? null;

  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ['10%', '55%'], []);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const systemType = systemConfig.isHybrid ? 'hybrid' : 'separate';

  // Build calculatedValues object for SystemDiagram component
  const calculatedValues = useMemo(() => ({
    panelWattageW: 400,
    panelCount: sizing?.panelArray?.panelCount ?? 0,
    panelConfig: sizing?.panelArray?.configLabel ?? '',
    stringVoltage: sizing?.panelArray?.stringVoltageV ?? 0,
    stringCurrent: sizing?.panelArray?.stringCurrentA?.toFixed(1) ?? 0,
    controllerCurrentA: sizing?.chargeController?.controllerCurrentA ?? 0,
    controllerVoltage: systemConfig.systemVoltageV ?? 48,
    batteryCount: sizing?.batteryConfig?.totalUnits ?? 0,
    batteryConfig: sizing?.batteryConfig?.configLabel ?? '',
    batterySOC: 80,
    inverterSizeVA: sizing?.inverterSizeVA ?? 0,
    systemVoltage: systemConfig.systemVoltageV ?? 48,
    dcBatteryCurrentA: sizing?.wireCurrents?.batteryToInverter?.currentA?.toFixed(1) ?? 0,
    loadWattsTotal: sizing?.peakWatts ?? 0,
    acLoadCurrentA: sizing?.wireCurrents?.inverterToLoad?.currentA?.toFixed(1) ?? 0,
    gridChargingCurrentA: sizing?.wireCurrents?.gridToInverter?.currentA?.toFixed(1) ?? 0,
    backupDurationHrs: sizing?.backupHours ?? 0,
    mcbRatingA: sizing ? calculateMCBRating(sizing.wireCurrents?.inverterToLoad?.currentA ?? 0).mcbRatingA : 0,
  }), [sizing, systemConfig]);

  // Metadata info card values
  const topology = systemConfig.isHybrid ? 'Hybrid String' : 'Separate System';
  const phase = 'Single Phase';
  const storageKwh = sizing
    ? ((sizing.batteryCapacityAh * (systemConfig.systemVoltageV ?? 48)) / 1000).toFixed(1) + ' kWh'
    : '—';

  // Component detail for bottom sheet
  const detail = useMemo(
    () => selectedComponent ? getComponentDetail(selectedComponent, sizing, systemConfig) : null,
    [selectedComponent, sizing, systemConfig]
  );

  // ── Handlers
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);

  const handleComponentPress = useCallback((id) => {
    setSelectedComponent(id);
    sheetRef.current?.expand();
  }, []);

  const handleNext = useCallback(() => {
    navigation.navigate('ComponentList', {
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
        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabelLeft}>{SYSTEM_DIAGRAM.stepLabel}</Text>
          <Text style={styles.progressLabelRight}>{SYSTEM_DIAGRAM.stepRight}</Text>
        </View>
        <ProgressBar currentStep={5} />

        {/* Screen title */}
        <View style={styles.titleBlock}>
          <Text style={styles.screenTitle}>{SYSTEM_DIAGRAM.screenTitle}</Text>
          <Text style={styles.screenSubtitle}>{SYSTEM_DIAGRAM.subtitle}</Text>
        </View>

        {/* SVG Diagram Card */}
        <View style={styles.diagramWrapper}>
          <SystemDiagram
            systemType={systemType}
            calculatedValues={calculatedValues}
            onComponentPress={handleComponentPress}
          />
        </View>

        {/* Technical metadata info cards */}
        <View style={styles.infoCardsSection}>
          <InfoCard label={SYSTEM_DIAGRAM.topologyLabel} value={topology} />
          <InfoCard label={SYSTEM_DIAGRAM.phaseLabel} value={phase} />
          <InfoCard label={SYSTEM_DIAGRAM.storageLabel} value={storageKwh} valueColour={Colors.secondary} />
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
            <Text style={styles.ctaLabel}>{SYSTEM_DIAGRAM.nextBtn}</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.onPrimary} />
          </LinearGradient>
        </Pressable>
      </View>

      {/* ── BOTTOM SHEET — Component detail ────────────────────────────── */}
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetView style={styles.sheetContent}>
          {detail ? (
            <>
              <View style={styles.sheetHeaderRow}>
                <View>
                  <Text style={styles.sheetTitle}>{detail.title}</Text>
                  <Text style={styles.sheetSubtitle}>{detail.subtitle}</Text>
                </View>
                <TouchableOpacity
                  style={styles.sheetUpdateBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sheetUpdateBtnText}>{SYSTEM_DIAGRAM.updateSpecsBtn}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.detailGrid}>
                {detail.items.map((item) => (
                  <DetailRow key={item.label} label={item.label} value={item.value} />
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.sheetEmpty}>{SYSTEM_DIAGRAM.tapHint}</Text>
          )}
        </BottomSheetView>
      </BottomSheet>
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
  scroll: { flex: 1 },
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
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.sm,
  },

  // ── DIAGRAM
  diagramWrapper: {
    marginBottom: Spacing.xxl,
    ...Shadows.card,
  },

  // ── INFO CARDS
  infoCardsSection: {
    gap: Spacing.lg,
    marginBottom: Spacing.section,
  },
  infoCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: ColorAlpha.outlineVariant20,
    ...Borders.card,
  },
  infoCardLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.footnote,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
  },
  infoCardValue: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xl,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.fab,
  },
  ctaPressed: { transform: [{ scale: 0.98 }] },
  ctaLabel: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.lg,
    color: Colors.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },

  // ── BOTTOM SHEET
  sheetBackground: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHandle: {
    width: 48,
    height: 4,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 99,
    alignSelf: 'center',
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xxl,
  },
  sheetTitle: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.xxl,
    color: Colors.onSurface,
  },
  sheetSubtitle: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  sheetUpdateBtn: {
    backgroundColor: ColorAlpha.primaryContainer10,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  sheetUpdateBtnText: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.primaryContainer,
  },
  sheetEmpty: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.xxxl,
  },

  // ── DETAIL GRID
  detailGrid: {
    gap: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ColorAlpha.outlineVariant10,
  },
  detailRowLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
  },
  detailRowValue: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.body,
    color: Colors.onSurface,
  },
});
