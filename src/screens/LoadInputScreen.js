/**
 * LoadInputScreen — Step 3 of 6.
 * Allows user to add appliances, adjust quantity and daily duration,
 * then calculates total and daily load in real time.
 *
 * Sub-components (all defined in this file, each under 200 lines):
 *   TotalLoadCard     — live load summary with amber left border
 *   ApplianceCard     — single appliance row with stepper + slider + energy result
 *   PresetGrid        — 4×2 grid inside the bottom sheet
 *   BottomSheetHandle — top handle + heading row
 *
 * Architecture rules:
 * - @gorhom/bottom-sheet for Add Appliance sheet
 * - @react-native-community/slider for duration sliders
 * - FlatList for appliance list (rule 33)
 * - Position:absolute FAB with useSafeAreaInsets (no position:fixed)
 */
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Slider from '@react-native-community/slider';

import {
  Colors,
  ColorAlpha,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Gradients,
  Shadows,
  Dimensions,
} from '../theme/index';
import { LOAD_INPUT, APP } from '../constants/strings';
import {
  PRESET_APPLIANCES,
  BOTTOM_SHEET_SNAP_POINTS,
} from '../constants/index';
import { calculateTotalDailyLoad } from '../utils/calculations';
import ProgressBar from '../components/ProgressBar';
import AdBanner from '../components/AdBanner';

// ─── TOTAL LOAD CARD ─────────────────────────────────────────────────────────

/**
 * Hero card showing live total peak Watts and daily Wh.
 * Has a 4px amber left border accent.
 * @param {{ totalW: number, dailyWh: number }} props
 */
function TotalLoadCard({ totalW, dailyWh }) {
  const wFormatted = totalW.toLocaleString();
  const whFormatted = dailyWh.toLocaleString();

  return (
    <View style={styles.totalCard}>
      <Text style={styles.totalCardLabel}>{LOAD_INPUT.estimationCardLabel}</Text>
      <View style={styles.totalCardRow}>
        <Text style={styles.totalCardMain}>
          {LOAD_INPUT.totalLoadPrefix}
          <Text style={styles.totalCardAmber}>{wFormatted} W</Text>
        </Text>
        <Text style={styles.totalCardDot}> · </Text>
        <Text style={styles.totalCardDaily}>
          {LOAD_INPUT.dailyPrefix}
          <Text style={styles.totalCardTeal}>{whFormatted} Wh</Text>
        </Text>
      </View>
    </View>
  );
}

// ─── ENERGY RESULT BOX ────────────────────────────────────────────────────────

function EnergyResultBox({ whValue }) {
  return (
    <View style={styles.energyBox}>
      <Text style={styles.energyBoxLabel}>{LOAD_INPUT.energyRequiredLabel}</Text>
      <Text style={styles.energyBoxValue}>{whValue.toLocaleString()} Wh</Text>
    </View>
  );
}

// ─── APPLIANCE CARD ───────────────────────────────────────────────────────────

/**
 * Single appliance card with icon, name, wattage label, qty stepper,
 * energy result box, daily duration slider, and delete button.
 * @param {{
 *   item: object,
 *   onDelete: Function,
 *   onQtyChange: Function,
 *   onHoursChange: Function,
 * }} props
 */
function ApplianceCard({ item, onDelete, onQtyChange, onHoursChange }) {
  const { id, label, icon, watts, quantity, dailyHours, dutyCycle = 1 } = item;

  const energyWh = useMemo(
    () => Math.round(watts * quantity * dailyHours * dutyCycle),
    [watts, quantity, dailyHours, dutyCycle]
  );

  const handleDecrement = useCallback(() => {
    if (quantity > 1) onQtyChange(id, quantity - 1);
  }, [id, quantity, onQtyChange]);

  const handleIncrement = useCallback(() => {
    onQtyChange(id, quantity + 1);
  }, [id, quantity, onQtyChange]);

  const handleSlider = useCallback(
    (val) => onHoursChange(id, Math.round(val)),
    [id, onHoursChange]
  );

  const handleDelete = useCallback(() => onDelete(id), [id, onDelete]);

  return (
    <View style={styles.applianceCard}>
      {/* Top row: icon + name/watts + delete */}
      <View style={styles.applianceTopRow}>
        <View style={styles.applianceLeft}>
          <View style={styles.applianceIconBox}>
            <MaterialCommunityIcons
              name={icon || 'lightning-bolt'}
              size={24}
              color={Colors.primaryContainer}
            />
          </View>
          <View>
            <Text style={styles.applianceName}>{label}</Text>
            <Text style={styles.applianceWatts}>
              {LOAD_INPUT.unitConsumptionPrefix}{watts}{LOAD_INPUT.unitConsumptionSuffix}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
          style={styles.deleteBtn}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={22}
            color={Colors.error}
          />
        </TouchableOpacity>
      </View>

      {/* Qty + Energy row */}
      <View style={styles.applianceMidRow}>
        {/* Quantity stepper */}
        <View style={styles.qtyBlock}>
          <Text style={styles.fieldLabel}>{LOAD_INPUT.quantityLabel}</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={handleDecrement}
              style={[styles.stepperBtn, quantity <= 1 && styles.stepperBtnDisabled]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
              disabled={quantity <= 1}
            >
              <MaterialCommunityIcons
                name="minus"
                size={18}
                color={quantity <= 1 ? Colors.onSurfaceVariant : Colors.onSurface}
              />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <TouchableOpacity
              onPress={handleIncrement}
              style={styles.stepperBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="plus" size={18} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Energy result */}
        <EnergyResultBox whValue={energyWh} />
      </View>

      {/* Duration slider */}
      <View style={styles.sliderSection}>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.fieldLabel}>{LOAD_INPUT.dailyDurationLabel}</Text>
          <Text style={styles.sliderValue}>
            {dailyHours} {LOAD_INPUT.hoursUnit}
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={24}
          step={1}
          value={dailyHours}
          onValueChange={handleSlider}
          minimumTrackTintColor={Colors.primaryContainer}
          maximumTrackTintColor={Colors.surfaceContainerHighest}
          thumbTintColor={Colors.primaryContainer}
        />
      </View>
    </View>
  );
}

// ─── PRESET GRID ─────────────────────────────────────────────────────────────

/**
 * 4-wide grid of preset appliance tiles inside the bottom sheet.
 * Custom tile has a dashed border style.
 * @param {{ onSelect: Function }} props
 */
function PresetGrid({ onSelect }) {
  return (
    <View style={styles.presetGrid}>
      {PRESET_APPLIANCES.map((preset) => {
        const isCustom = preset.id === 'custom';
        return (
          <TouchableOpacity
            key={preset.id}
            onPress={() => onSelect(preset)}
            style={styles.presetItem}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            activeOpacity={0.75}
          >
            <View style={[styles.presetIconBox, isCustom && styles.presetIconBoxCustom]}>
              <MaterialCommunityIcons
                name={preset.icon || 'lightning-bolt'}
                size={24}
                color={Colors.onSurfaceVariant}
              />
            </View>
            <Text style={styles.presetLabel} numberOfLines={1}>
              {preset.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── LOAD INPUT SCREEN ────────────────────────────────────────────────────────

/**
 * LoadInputScreen — Step 3 of the proposal creation flow.
 * @param {{ navigation: object, route: object }} props
 */
export default function LoadInputScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const clientInfo = route.params?.clientInfo ?? {};
  const systemConfig = route.params?.systemConfig ?? {};

  const [appliances, setAppliances] = useState([]);
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => BOTTOM_SHEET_SNAP_POINTS, []);

  // Live load totals — recalculated whenever appliances change
  const loadResult = useMemo(
    () => calculateTotalDailyLoad(appliances),
    [appliances]
  );

  // ── NAV HANDLERS
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);

  const handleOpenSheet = useCallback(() => {
    sheetRef.current?.expand();
  }, []);

  // ── APPLIANCE MUTATIONS
  const handleAddPreset = useCallback((preset) => {
    sheetRef.current?.collapse();
    setAppliances((prev) => {
      // If preset already exists, just increment quantity
      const existing = prev.find((a) => a.id === preset.id);
      if (existing) {
        return prev.map((a) =>
          a.id === preset.id ? { ...a, quantity: a.quantity + 1 } : a
        );
      }
      return [
        ...prev,
        {
          ...preset,
          quantity: 1,
          dailyHours: 8,
        },
      ];
    });
  }, []);

  const handleDeleteAppliance = useCallback((id) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleQtyChange = useCallback((id, qty) => {
    setAppliances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, quantity: qty } : a))
    );
  }, []);

  const handleHoursChange = useCallback((id, hours) => {
    setAppliances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dailyHours: hours } : a))
    );
  }, []);

  const handleNext = useCallback(() => {
    navigation.navigate('SystemRecommendation', {
      clientInfo,
      systemConfig,
      appliances,
      loadResult,
    });
  }, [navigation, clientInfo, systemConfig, appliances, loadResult]);

  const renderAppliance = useCallback(
    ({ item }) => (
      <ApplianceCard
        item={item}
        onDelete={handleDeleteAppliance}
        onQtyChange={handleQtyChange}
        onHoursChange={handleHoursChange}
      />
    ),
    [handleDeleteAppliance, handleQtyChange, handleHoursChange]
  );

  const keyExtractor = useCallback((item) => item.id + (item._key || ''), []);

  const ListHeader = useMemo(
    () => (
      <>
        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabelLeft}>{LOAD_INPUT.stepLabel}</Text>
          <Text style={styles.progressLabelRight}>{LOAD_INPUT.stepRight}</Text>
        </View>
        <ProgressBar currentStep={3} />

        {/* Total load card */}
        <View style={styles.totalCardWrapper}>
          <TotalLoadCard
            totalW={loadResult.peakWatts}
            dailyWh={loadResult.totalDailyWh}
          />
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>{LOAD_INPUT.appliancesLabel}</Text>
      </>
    ),
    [loadResult]
  );

  const ListFooter = useMemo(
    () => (
      <View style={styles.adSection}>
        <AdBanner />
      </View>
    ),
    []
  );

  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="lightning-bolt-outline"
          size={36}
          color={Colors.onSurfaceVariant}
        />
        <Text style={styles.emptyText}>
          Tap the + button to add appliances
        </Text>
      </View>
    ),
    []
  );

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
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={Colors.primaryContainer}
            />
          </TouchableOpacity>
          <Text style={styles.navScreenTitle}>{LOAD_INPUT.screenTitle}</Text>
        </View>
        <View style={styles.navRight}>
          <Text style={styles.navWordmark}>{APP.wordmark}</Text>
          <TouchableOpacity
            onPress={handleSettings}
            style={styles.navIconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="cog"
              size={24}
              color="rgba(229,226,225,0.60)"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── APPLIANCE LIST ──────────────────────────────────────────────── */}
      <FlatList
        data={appliances}
        renderItem={renderAppliance}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 80 + Spacing.xxl + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.cardGap} />}
      />

      {/* ── AMBER FAB ──────────────────────────────────────────────────── */}
      <Pressable
        onPress={handleOpenSheet}
        style={[
          styles.fab,
          { bottom: 80 + Spacing.xxl + insets.bottom + Spacing.xxl },
        ]}
      >
        <LinearGradient
          colors={Gradients.cta.colors}
          start={Gradients.cta.start}
          end={Gradients.cta.end}
          style={styles.fabGradient}
        >
          <MaterialCommunityIcons name="plus" size={30} color={Colors.onPrimary} />
        </LinearGradient>
      </Pressable>

      {/* ── FIXED CTA BAR ──────────────────────────────────────────────── */}
      <View
        style={[
          styles.ctaBar,
          { paddingBottom: insets.bottom + Spacing.lg },
        ]}
      >
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
        >
          <LinearGradient
            colors={Gradients.cta.colors}
            start={Gradients.cta.start}
            end={Gradients.cta.end}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaLabel}>{LOAD_INPUT.nextBtn}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.onPrimary}
            />
          </LinearGradient>
        </Pressable>
      </View>

      {/* ── BOTTOM SHEET ───────────────────────────────────────────────── */}
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetView style={styles.sheetContent}>
          {/* Sheet heading row */}
          <View style={styles.sheetHeadingRow}>
            <Text style={styles.sheetHeading}>{LOAD_INPUT.addApplianceLabel}</Text>
            <Text style={styles.sheetPresetsLabel}>PRESETS</Text>
          </View>

          {/* Preset grid */}
          <PresetGrid onSelect={handleAddPreset} />
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

  // ── NAV BAR
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
    flex: 1,
    flexShrink: 1,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  navIconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navScreenTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.lg,
    color: Colors.primaryContainer,
    flexShrink: 1,
  },
  navWordmark: {
    fontFamily: FontFamily.manropeBlack,
    fontSize: FontSize.xl,
    color: Colors.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },

  // ── LIST
  listContent: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.xxl,
  },

  // ── PROGRESS ROW
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLabelLeft: {
    fontFamily: FontFamily.interBold,
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

  // ── TOTAL LOAD CARD
  totalCardWrapper: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.sectionGap,
  },
  totalCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    padding: Spacing.xxl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryContainer,
    ...Shadows.card,
  },
  totalCardLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  totalCardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 4,
  },
  totalCardMain: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.xxl,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  totalCardAmber: {
    color: Colors.primary,
  },
  totalCardDot: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.body,
    color: Colors.onSurfaceVariant,
  },
  totalCardDaily: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xl,
    color: Colors.secondary,
  },
  totalCardTeal: {
    color: Colors.secondary,
  },

  // ── SECTION LABEL
  sectionLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.lg,
  },

  // ── APPLIANCE CARD
  applianceCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    gap: Spacing.xxl,
  },
  applianceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  applianceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    flex: 1,
  },
  applianceIconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  applianceName: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
  },
  applianceWatts: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── QTY + ENERGY ROW
  applianceMidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  qtyBlock: {
    gap: Spacing.md,
  },
  fieldLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  stepperBtn: {
    width: Dimensions.stepperSize,
    height: Dimensions.stepperSize,
    borderWidth: 1,
    borderColor: 'rgba(82,69,52,0.30)',
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.5,
  },
  stepperValue: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xl,
    color: Colors.onSurface,
    minWidth: 28,
    textAlign: 'center',
  },

  // ── ENERGY BOX
  energyBox: {
    flex: 1,
    backgroundColor: ColorAlpha.surfaceHighest50,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: 'flex-end',
  },
  energyBoxLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  energyBoxValue: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xl,
    color: Colors.secondary,
  },

  // ── SLIDER SECTION
  sliderSection: {
    gap: Spacing.sm,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderValue: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.body,
    color: Colors.primaryContainer,
  },
  slider: {
    height: 6,
    width: '100%',
  },

  // ── CARD GAP
  cardGap: {
    height: Spacing.lg,
  },

  // ── EMPTY STATE
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // ── AD SECTION
  adSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },

  // ── AMBER FAB
  fab: {
    position: 'absolute',
    right: Spacing.xxl,
    width: Dimensions.fabSize,
    height: Dimensions.fabSize,
    borderRadius: BorderRadius.fab,
    overflow: 'hidden',
    ...Shadows.fab,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── CTA BAR
  ctaBar: {
    backgroundColor: 'rgba(19,19,19,0.92)',
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(82,69,52,0.08)',
  },
  ctaButton: {
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  ctaPressed: {
    transform: [{ scale: 0.98 }],
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
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
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.xxl,
  },
  sheetHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  sheetHeading: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
  },
  sheetPresetsLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
  },

  // ── PRESET GRID (4 per row)
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  presetItem: {
    width: '22%',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  presetIconBox: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetIconBoxCustom: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(82,69,52,0.30)',
  },
  presetLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.onSurface,
    textAlign: 'center',
  },
});
