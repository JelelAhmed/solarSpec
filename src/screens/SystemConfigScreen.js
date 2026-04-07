/**
 * SystemConfigScreen — Step 2 of 6.
 * User selects inverter type, battery chemistry, and system voltage.
 * Passes systemConfig object to LoadInputScreen via navigation params.
 *
 * Design notes:
 * - Inverter type: 2 tall selectable cards (stacked).
 *   Selected card: surfaceContainerHigh bg, 2px amber border, amber check + title.
 *   Unselected card: surfaceContainerLow bg, transparent border.
 * - Battery chemistry: 2x2 chip grid.
 *   Selected: amber-filled (primaryContainer). Unselected: surfaceContainerLow.
 * - System voltage: 3 equal flex chips in a row.
 *   Selected: surfaceContainerHigh bg + 2px amber border + amber text.
 * - CTA in scrollable footer (not fixed).
 */
import React, { useCallback, useState } from 'react';
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
  Gradients,
  Shadows,
} from '../theme/index';
import { SYSTEM_CONFIG, APP } from '../constants/strings';
import {
  BATTERY_CHEMISTRY,
  SYSTEM_VOLTAGE_OPTIONS,
  INVERTER_TYPE,
  DEFAULT_BATTERY_CHEMISTRY,
  DEFAULT_SYSTEM_VOLTAGE,
} from '../constants/index';
import ProgressBar from '../components/ProgressBar';

// ─── INVERTER OPTION DATA ────────────────────────────────────────────────────

const INVERTER_OPTIONS = [
  {
    id: INVERTER_TYPE.SEPARATE,
    label: SYSTEM_CONFIG.separateLabel,
    description: SYSTEM_CONFIG.separateDesc,
    icon: 'tune-vertical',
  },
  {
    id: INVERTER_TYPE.HYBRID,
    label: SYSTEM_CONFIG.hybridLabel,
    description: SYSTEM_CONFIG.hybridDesc,
    icon: 'lightning-bolt',
  },
];

// ─── CHEMISTRY CHIP DATA ─────────────────────────────────────────────────────

const CHEMISTRY_OPTIONS = [
  BATTERY_CHEMISTRY.LEAD_ACID,
  BATTERY_CHEMISTRY.AGM,
  BATTERY_CHEMISTRY.GEL,
  BATTERY_CHEMISTRY.LITHIUM,
];

// ─── INVERTER CARD ────────────────────────────────────────────────────────────

/**
 * Tall selectable card for inverter type selection.
 * @param {{ option: object, selected: boolean, onPress: Function }} props
 */
function InverterCard({ option, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.inverterCard,
        selected ? styles.inverterCardSelected : styles.inverterCardUnselected,
      ]}
    >
      {/* Amber check circle top-right when selected */}
      {selected && (
        <View style={styles.checkMark}>
          <MaterialCommunityIcons
            name="check-circle"
            size={22}
            color={Colors.primary}
          />
        </View>
      )}

      {/* Icon box */}
      <View
        style={[
          styles.inverterIconBox,
          selected ? styles.inverterIconBoxSelected : styles.inverterIconBoxUnselected,
        ]}
      >
        <MaterialCommunityIcons
          name={option.icon}
          size={22}
          color={selected ? Colors.primaryContainer : Colors.onSurfaceVariant}
        />
      </View>

      {/* Title + description */}
      <Text
        style={[
          styles.inverterCardTitle,
          selected && styles.inverterCardTitleSelected,
        ]}
      >
        {option.label}
      </Text>
      <Text style={styles.inverterCardDesc}>{option.description}</Text>
    </TouchableOpacity>
  );
}

// ─── CHEMISTRY CHIP ───────────────────────────────────────────────────────────

/**
 * Chemistry selection chip — 2×2 grid.
 * @param {{ label: string, selected: boolean, onPress: Function }} props
 */
function ChemistryChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.chemistryChip,
        selected ? styles.chemistryChipSelected : styles.chemistryChipUnselected,
      ]}
    >
      <Text
        style={[
          styles.chemistryChipText,
          selected ? styles.chemistryChipTextSelected : styles.chemistryChipTextUnselected,
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── VOLTAGE CHIP ─────────────────────────────────────────────────────────────

/**
 * System voltage selection chip — horizontal row of 3.
 * @param {{ voltage: number, selected: boolean, onPress: Function }} props
 */
function VoltageChip({ voltage, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.voltageChip,
        selected ? styles.voltageChipSelected : styles.voltageChipUnselected,
      ]}
    >
      <Text
        style={[
          styles.voltageChipText,
          selected ? styles.voltageChipTextSelected : styles.voltageChipTextUnselected,
        ]}
      >
        {voltage}V
      </Text>
    </TouchableOpacity>
  );
}

// ─── SYSTEM CONFIG SCREEN ─────────────────────────────────────────────────────

/**
 * SystemConfigScreen — Step 2 of the proposal creation flow.
 * @param {{ navigation: object, route: object }} props
 */
export default function SystemConfigScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const clientInfo = route.params?.clientInfo ?? {};

  // Selection state — defaults from constants
  const [inverterType, setInverterType] = useState(INVERTER_TYPE.HYBRID);
  const [chemistry, setChemistry] = useState(DEFAULT_BATTERY_CHEMISTRY.id);
  const [voltageV, setVoltageV] = useState(DEFAULT_SYSTEM_VOLTAGE);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);

  const handleSelectInverter = useCallback((id) => setInverterType(id), []);
  const handleSelectChemistry = useCallback((id) => setChemistry(id), []);
  const handleSelectVoltage = useCallback((v) => setVoltageV(v), []);

  const handleNext = useCallback(() => {
    // Resolve full chemistry object from id
    const chemObj = Object.values(BATTERY_CHEMISTRY).find((c) => c.id === chemistry)
      ?? DEFAULT_BATTERY_CHEMISTRY;

    navigation.navigate('LoadInput', {
      clientInfo,
      systemConfig: {
        inverterType,
        batteryChemistry: chemObj,
        systemVoltageV: voltageV,
        isHybrid: inverterType === INVERTER_TYPE.HYBRID,
      },
    });
  }, [navigation, clientInfo, inverterType, chemistry, voltageV]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ── NAV HEADER ─────────────────────────────────────────────────── */}
      <View style={styles.navBar}>
        {/* Left: back + screen title */}
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
          <Text style={styles.navScreenTitle}>System Configuration</Text>
        </View>

        {/* Right: wordmark + settings */}
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

      {/* ── SCROLL BODY ────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress bar row — label above bar */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabelLeft}>STEP 2 OF 6</Text>
          <Text style={styles.progressLabelRight}>IN PROGRESS</Text>
        </View>
        <ProgressBar currentStep={2} />

        {/* Screen title */}
        <Text style={styles.screenTitle}>{SYSTEM_CONFIG.screenTitle}</Text>

        {/* ── INVERTER TYPE SECTION ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>{SYSTEM_CONFIG.inverterSectionLabel}</Text>
          <View style={styles.inverterCardsColumn}>
            {INVERTER_OPTIONS.map((opt) => (
              <InverterCard
                key={opt.id}
                option={opt}
                selected={inverterType === opt.id}
                onPress={() => handleSelectInverter(opt.id)}
              />
            ))}
          </View>
        </View>

        {/* ── BATTERY CHEMISTRY SECTION ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>{SYSTEM_CONFIG.chemistrySectionLabel}</Text>
          <View style={styles.chemistryGrid}>
            {CHEMISTRY_OPTIONS.map((c) => (
              <ChemistryChip
                key={c.id}
                label={c.label}
                selected={chemistry === c.id}
                onPress={() => handleSelectChemistry(c.id)}
              />
            ))}
          </View>
        </View>

        {/* ── SYSTEM VOLTAGE SECTION ────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>{SYSTEM_CONFIG.voltageSectionLabel}</Text>
          <View style={styles.voltageRow}>
            {SYSTEM_VOLTAGE_OPTIONS.map((v) => (
              <VoltageChip
                key={v}
                voltage={v}
                selected={voltageV === v}
                onPress={() => handleSelectVoltage(v)}
              />
            ))}
          </View>

          {/* Voltage recommendation note */}
          <View style={styles.voltageNote}>
            <MaterialCommunityIcons
              name="information"
              size={16}
              color={Colors.tertiary}
              style={styles.voltageNoteIcon}
            />
            <Text style={styles.voltageNoteText}>{SYSTEM_CONFIG.voltageNote}</Text>
          </View>
        </View>

        {/* ── CTA FOOTER ───────────────────────────────────────────── */}
        <View style={styles.ctaFooterSection}>
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
              <Text style={styles.ctaLabel}>{SYSTEM_CONFIG.nextBtn}</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.ctaFooterNote}>{SYSTEM_CONFIG.footerNote}</Text>
        </View>
      </ScrollView>
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
    color: Colors.onSurface,
    flexShrink: 1,
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
    backgroundColor: Colors.background,
  },
  scrollContent: {
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

  // ── SCREEN TITLE
  screenTitle: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.display,
    color: Colors.onSurface,
    letterSpacing: -0.5,
    lineHeight: 42,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.sectionGap,
  },

  // ── SECTIONS
  section: {
    marginBottom: Spacing.sectionGap,
  },
  sectionHeading: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xl,
    color: Colors.onSurface,
    marginBottom: Spacing.xxl,
  },

  // ── INVERTER CARDS
  inverterCardsColumn: {
    gap: Spacing.lg,
  },
  inverterCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xxl,
    position: 'relative',
  },
  inverterCardUnselected: {
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inverterCardSelected: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
  },
  checkMark: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },
  inverterIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  inverterIconBoxUnselected: {
    backgroundColor: Colors.surfaceContainerHighest,
  },
  inverterIconBoxSelected: {
    backgroundColor: ColorAlpha.primaryContainer20,
  },
  inverterCardTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  inverterCardTitleSelected: {
    color: Colors.primary,
  },
  inverterCardDesc: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },

  // ── CHEMISTRY CHIPS (2×2 grid)
  chemistryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  chemistryChip: {
    width: '47%',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  chemistryChipUnselected: {
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(82,69,52,0.10)',
  },
  chemistryChipSelected: {
    backgroundColor: Colors.primaryContainer,
    borderWidth: 0,
  },
  chemistryChipText: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.body,
    textAlign: 'center',
  },
  chemistryChipTextUnselected: {
    color: Colors.onSurfaceVariant,
  },
  chemistryChipTextSelected: {
    fontFamily: FontFamily.interBold,
    color: Colors.onPrimaryContainer,
  },

  // ── VOLTAGE CHIPS (row of 3)
  voltageRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  voltageChip: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voltageChipUnselected: {
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(82,69,52,0.15)',
  },
  voltageChipSelected: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
  },
  voltageChipText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.body,
  },
  voltageChipTextUnselected: {
    color: Colors.onSurfaceVariant,
  },
  voltageChipTextSelected: {
    fontFamily: FontFamily.interBold,
    color: Colors.primary,
  },

  // ── VOLTAGE NOTE
  voltageNote: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  voltageNoteIcon: {
    marginTop: 2,
  },
  voltageNoteText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.caption,
    color: 'rgba(215,195,174,0.80)',
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 20,
  },

  // ── CTA FOOTER
  ctaFooterSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  ctaButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.xl,
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
  ctaFooterNote: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.label,
    color: Colors.onSurfaceVariant,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
});
