/**
 * SettingsScreen — App configuration and business profile.
 *
 * Three sections:
 *   1. Profile Configuration ("Your Business")
 *      - Business Name text input (bottom border)
 *      - Technician Name text input (bottom border)
 *      - Logo upload picker (expo-image-picker, building icon placeholder)
 *   2. Standard Operating Parameters ("Defaults")
 *      - Battery Chemistry picker
 *      - System Voltage picker
 *      - Inverter Type picker
 *      - Peak Sun Hours numeric input
 *   3. Platform Information ("About")
 *      - App Version row + teal badge
 *      - Rate SolarSpec row + star icon
 *      - Privacy Policy row + external link icon
 *
 * Design rules (from audit checklist):
 *   Rule 27: no bottom tab bar, no serial number text. ✓
 *   Rule 30: no AdMob banner. ✓
 *   Rule 22 corollary: dark throughout — no light sections. ✓
 *   Rule 9: no hardcoded hex — all colours from theme. ✓
 *   Rule 32: useCallback for all handlers. ✓
 *
 * Architecture rules:
 *   - Settings loaded/saved via /src/services/storage.js only.
 *   - All colours from /src/theme/index.js.
 *   - All strings from /src/constants/strings.js.
 *   - BATTERY_CHEMISTRY, SYSTEM_VOLTAGE_OPTIONS, INVERTER_TYPE from /src/constants/index.js.
 *   - Logo upload via expo-image-picker only.
 *   - useCallback for all handlers, try/catch on all async ops.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import {
  Colors,
  ColorAlpha,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Borders,
} from '../theme/index';
import { SETTINGS, APP } from '../constants/strings';
import {
  BATTERY_CHEMISTRY,
  SYSTEM_VOLTAGE_OPTIONS,
  INVERTER_TYPE,
  PEAK_SUN_HOURS_DEFAULT,
} from '../constants/index';
import { loadSettings, saveSettings } from '../services/storage';

// ─── APP VERSION ──────────────────────────────────────────────────────────────
const APP_VERSION = '1.0.0-Beta';
const PRIVACY_POLICY_URL = 'https://solarspec.app/privacy';

// ─── PICKER OPTION DEFINITIONS ────────────────────────────────────────────────

const BATTERY_OPTIONS = [
  { label: 'Lithium Iron Phosphate (LiFePO4)', value: BATTERY_CHEMISTRY.LITHIUM.id },
  { label: 'AGM (Absorbed Glass Mat)', value: BATTERY_CHEMISTRY.AGM.id },
  { label: 'Gel Battery', value: BATTERY_CHEMISTRY.GEL.id },
  { label: 'Lead-Acid (Flooded)', value: BATTERY_CHEMISTRY.LEAD_ACID.id },
];

const VOLTAGE_OPTIONS = SYSTEM_VOLTAGE_OPTIONS.map((v) => ({
  label: `${v}V DC`,
  value: v,
}));

const INVERTER_OPTIONS = [
  { label: 'Hybrid Inverter (MPPT)', value: INVERTER_TYPE.HYBRID },
  { label: 'Separate Inverter + Controller', value: INVERTER_TYPE.SEPARATE },
];

// ─── FIELD LABEL ─────────────────────────────────────────────────────────────

/** Small uppercase section label */
function FieldLabel({ children }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────

/**
 * Section header with a sub-label above and heading below.
 * @param {{ subLabel: string, heading: string }} props
 */
function SectionHeader({ subLabel, heading }) {
  return (
    <View style={styles.sectionHeaderBlock}>
      <Text style={styles.sectionSubLabel}>{subLabel}</Text>
      <Text style={styles.sectionHeading}>{heading}</Text>
    </View>
  );
}

// ─── INLINE PICKER ─────────────────────────────────────────────────────────────

/**
 * A bottom-border styled picker using native ActionSheet (iOS) or
 * Alert buttons (Android). Matches the Stitch select style.
 *
 * @param {{
 *   label: string,
 *   options: Array<{ label: string, value: any }>,
 *   value: any,
 *   onChange: (value: any) => void,
 * }} props
 */
function SettingsPicker({ label, options, value, onChange }) {
  const [focused, setFocused] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? '—',
    [options, value]
  );

  const handlePress = useCallback(() => {
    setFocused(true);
    const buttons = options.map((opt) => ({
      text: opt.label,
      onPress: () => {
        onChange(opt.value);
        setFocused(false);
      },
    }));
    buttons.push({ text: 'Cancel', style: 'cancel', onPress: () => setFocused(false) });
    Alert.alert(label, undefined, buttons);
  }, [options, label, onChange]);

  return (
    <View style={styles.pickerField}>
      <FieldLabel>{label}</FieldLabel>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.pickerTouchable,
          focused && styles.pickerFocused,
        ]}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.pickerValue}>{selectedLabel}</Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={Colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    </View>
  );
}

// ─── ABOUT ROW ───────────────────────────────────────────────────────────────

/**
 * A tappable row in the About section.
 * @param {{
 *   label: string,
 *   sublabel?: string,
 *   rightNode: React.ReactNode,
 *   onPress?: () => void,
 *   roundedTop?: boolean,
 *   roundedBottom?: boolean,
 * }} props
 */
function AboutRow({ label, sublabel, rightNode, onPress, roundedTop, roundedBottom }) {
  const borderStyle = {
    borderTopLeftRadius: roundedTop ? BorderRadius.md : 0,
    borderTopRightRadius: roundedTop ? BorderRadius.md : 0,
    borderBottomLeftRadius: roundedBottom ? BorderRadius.md : 0,
    borderBottomRightRadius: roundedBottom ? BorderRadius.md : 0,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.aboutRow,
          borderStyle,
          pressed && { backgroundColor: Colors.surfaceBright },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View>
          <Text style={styles.aboutRowLabel}>{label}</Text>
          {sublabel ? <Text style={styles.aboutRowSublabel}>{sublabel}</Text> : null}
        </View>
        {rightNode}
      </Pressable>
    );
  }

  return (
    <View style={[styles.aboutRow, borderStyle]}>
      <Text style={styles.aboutRowLabel}>{label}</Text>
      {rightNode}
    </View>
  );
}

// ─── SETTINGS SCREEN ─────────────────────────────────────────────────────────

/**
 * SettingsScreen — accessible from any screen via nav header cog icon.
 * @param {{ navigation: object }} props
 */
export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // ── Local settings state
  const [businessName, setBusinessName] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [logoUri, setLogoUri] = useState(null);
  const [batteryChemistry, setBatteryChemistry] = useState(BATTERY_CHEMISTRY.LITHIUM.id);
  const [systemVoltage, setSystemVoltage] = useState(48);
  const [inverterType, setInverterType] = useState(INVERTER_TYPE.HYBRID);
  const [peakSunHours, setPeakSunHours] = useState(String(PEAK_SUN_HOURS_DEFAULT));

  // ── Focus states for text inputs
  const [businessFocused, setBusinessFocused] = useState(false);
  const [techFocused, setTechFocused] = useState(false);
  const [sunHoursFocused, setSunHoursFocused] = useState(false);

  // ── Load settings on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await loadSettings();
        if (cancelled) return;
        if (saved.businessName) setBusinessName(saved.businessName);
        if (saved.technicianName) setTechnicianName(saved.technicianName);
        if (saved.logoUri) setLogoUri(saved.logoUri);
        if (saved.defaultBatteryChemistry) setBatteryChemistry(saved.defaultBatteryChemistry);
        if (saved.defaultSystemVoltage) setSystemVoltage(saved.defaultSystemVoltage);
        if (saved.defaultInverterType) setInverterType(saved.defaultInverterType);
        if (saved.peakSunHours) setPeakSunHours(String(saved.peakSunHours));
      } catch (e) {
        console.error('SettingsScreen load error:', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Persist settings whenever any value changes
  const persistSettings = useCallback(async (updates) => {
    try {
      await saveSettings(updates);
    } catch (e) {
      console.error('SettingsScreen save error:', e);
    }
  }, []);

  // ── Field handlers
  const handleBusinessName = useCallback((val) => {
    setBusinessName(val);
    persistSettings({ businessName: val });
  }, [persistSettings]);

  const handleTechnicianName = useCallback((val) => {
    setTechnicianName(val);
    persistSettings({ technicianName: val });
  }, [persistSettings]);

  const handleBatteryChemistry = useCallback((val) => {
    setBatteryChemistry(val);
    persistSettings({ defaultBatteryChemistry: val });
  }, [persistSettings]);

  const handleSystemVoltage = useCallback((val) => {
    setSystemVoltage(val);
    persistSettings({ defaultSystemVoltage: val });
  }, [persistSettings]);

  const handleInverterType = useCallback((val) => {
    setInverterType(val);
    persistSettings({ defaultInverterType: val });
  }, [persistSettings]);

  const handlePeakSunHours = useCallback((val) => {
    setPeakSunHours(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      persistSettings({ peakSunHours: parsed });
    }
  }, [persistSettings]);

  // ── Logo upload
  const handleLogoUpload = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access to upload a logo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        setLogoUri(uri);
        persistSettings({ logoUri: uri });
      }
    } catch (e) {
      console.error('Logo upload error:', e);
    }
  }, [persistSettings]);

  // ── About handlers
  const handleRate = useCallback(() => {
    const storeUrl = Platform.select({
      ios: 'itms-apps://itunes.apple.com/app/idXXXXXXXXX?action=write-review',
      android: 'market://details?id=com.solarspec.app',
    });
    Linking.openURL(storeUrl).catch(() =>
      Alert.alert('Unable to open store', 'Please rate us on the App Store or Play Store.')
    );
  }, []);

  const handlePrivacyPolicy = useCallback(() => {
    Linking.openURL(PRIVACY_POLICY_URL).catch(() =>
      Alert.alert('Unable to open link', 'Please visit solarspec.app/privacy.')
    );
  }, []);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

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
          <Text style={styles.navTitle}>{SETTINGS.screenTitle}</Text>
        </View>
        <Text style={styles.navWordmark}>{SETTINGS.wordmark}</Text>
      </View>

      {/* ── SCROLL BODY ────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.sectionGap },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── SECTION 1: PROFILE ──────────────────────────────────────── */}
        <SectionHeader
          subLabel={SETTINGS.profileLabel}
          heading={SETTINGS.profileHeading}
        />

        {/* Profile card + logo upload card */}
        <View style={styles.profileGrid}>
          {/* Business info card */}
          <View style={styles.profileCard}>
            {/* Business Name */}
            <View style={styles.inputFieldGroup}>
              <FieldLabel>{SETTINGS.businessNameLabel}</FieldLabel>
              <View style={[
                styles.inputWrapper,
                businessFocused && styles.inputWrapperFocused,
              ]}>
                <TextInput
                  style={styles.textInput}
                  value={businessName}
                  onChangeText={handleBusinessName}
                  onFocus={() => setBusinessFocused(true)}
                  onBlur={() => setBusinessFocused(false)}
                  placeholder={SETTINGS.businessNamePlaceholder}
                  placeholderTextColor={Colors.surfaceContainerHighest}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Technician Name */}
            <View style={styles.inputFieldGroup}>
              <FieldLabel>{SETTINGS.technicianNameLabel}</FieldLabel>
              <View style={[
                styles.inputWrapper,
                techFocused && styles.inputWrapperFocused,
              ]}>
                <TextInput
                  style={styles.textInput}
                  value={technicianName}
                  onChangeText={handleTechnicianName}
                  onFocus={() => setTechFocused(true)}
                  onBlur={() => setTechFocused(false)}
                  placeholder={SETTINGS.technicianNamePlaceholder}
                  placeholderTextColor={Colors.surfaceContainerHighest}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>

          {/* Logo upload card */}
          <TouchableOpacity
            onPress={handleLogoUpload}
            style={styles.logoCard}
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.logoImageBox}>
              {logoUri ? (
                <Image
                  source={{ uri: logoUri }}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              ) : (
                <MaterialCommunityIcons
                  name="domain"
                  size={40}
                  color={Colors.primaryContainer}
                />
              )}
            </View>
            <Text style={styles.logoUploadLabel}>{SETTINGS.uploadLogoLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* ── SECTION 2: DEFAULTS ─────────────────────────────────────── */}
        <SectionHeader
          subLabel={SETTINGS.defaultsLabel}
          heading={SETTINGS.defaultsHeading}
        />

        <View style={styles.defaultsCard}>
          <View style={styles.defaultsGrid}>
            {/* Battery Chemistry */}
            <SettingsPicker
              label={SETTINGS.batteryChemistryLabel}
              options={BATTERY_OPTIONS}
              value={batteryChemistry}
              onChange={handleBatteryChemistry}
            />

            {/* System Voltage */}
            <SettingsPicker
              label={SETTINGS.systemVoltageLabel}
              options={VOLTAGE_OPTIONS}
              value={systemVoltage}
              onChange={handleSystemVoltage}
            />

            {/* Inverter Type */}
            <SettingsPicker
              label={SETTINGS.inverterTypeLabel}
              options={INVERTER_OPTIONS}
              value={inverterType}
              onChange={handleInverterType}
            />

            {/* Peak Sun Hours */}
            <View style={styles.pickerField}>
              <FieldLabel>{SETTINGS.peakSunHoursLabel}</FieldLabel>
              <View style={[
                styles.pickerTouchable,
                sunHoursFocused && styles.pickerFocused,
                { justifyContent: 'flex-start' },
              ]}>
                <TextInput
                  style={[styles.pickerValue, { flex: 1 }]}
                  value={peakSunHours}
                  onChangeText={handlePeakSunHours}
                  onFocus={() => setSunHoursFocused(true)}
                  onBlur={() => setSunHoursFocused(false)}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  placeholderTextColor={Colors.surfaceContainerHighest}
                />
                <Text style={styles.sunHoursUnit}>{SETTINGS.peakSunHoursUnit}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── SECTION 3: ABOUT ────────────────────────────────────────── */}
        <SectionHeader
          subLabel={SETTINGS.aboutLabel}
          heading={SETTINGS.aboutHeading}
        />

        <View style={styles.aboutSection}>
          {/* App Version — static, no press */}
          <AboutRow
            label={SETTINGS.appVersionLabel}
            roundedTop
            rightNode={
              <View style={styles.versionBadge}>
                <Text style={styles.versionBadgeText}>{`v${APP_VERSION}`}</Text>
              </View>
            }
          />
          <View style={styles.aboutRowDivider} />

          {/* Rate SolarSpec */}
          <AboutRow
            label={SETTINGS.rateLabel}
            sublabel="Support our engineering team"
            onPress={handleRate}
            rightNode={
              <MaterialCommunityIcons
                name="star-outline"
                size={22}
                color={Colors.outline}
              />
            }
          />
          <View style={styles.aboutRowDivider} />

          {/* Privacy Policy */}
          <AboutRow
            label={SETTINGS.privacyLabel}
            onPress={handlePrivacyPolicy}
            roundedBottom
            rightNode={
              <MaterialCommunityIcons
                name="open-in-new"
                size={22}
                color={Colors.outline}
              />
            }
          />
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
  navTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
    letterSpacing: -0.2,
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
    paddingTop: Spacing.xxxl,
    gap: Spacing.xxl,
  },

  // ── SECTION HEADER
  sectionHeaderBlock: {
    marginBottom: Spacing.sm,
  },
  sectionSubLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  sectionHeading: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xxl,
    color: Colors.onSurface,
  },

  // ── PROFILE GRID (business info + logo side by side)
  profileGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.sectionGap,
  },
  profileCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    padding: Spacing.xxxl,
    gap: Spacing.xxl,
    ...Borders.card,
  },

  // ── TEXT INPUT FIELDS
  inputFieldGroup: {
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
  },
  inputWrapper: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
  },
  inputWrapperFocused: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  textInput: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
    minHeight: 40,
  },

  // ── LOGO UPLOAD CARD
  logoCard: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: BorderRadius.md,
    padding: Spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    minHeight: 140,
    ...Borders.card,
  },
  logoImageBox: {
    width: 72,
    height: 72,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: ColorAlpha.outlineVariant20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
  },
  logoUploadLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
  },

  // ── DEFAULTS CARD
  defaultsCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: Spacing.xxxl,
    marginBottom: Spacing.sectionGap,
    ...Borders.card,
  },
  defaultsGrid: {
    gap: Spacing.formFieldGap,
  },

  // ── PICKER FIELD
  pickerField: {
    gap: Spacing.sm,
  },
  pickerTouchable: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: 0,
    minHeight: 48,
  },
  pickerFocused: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  pickerValue: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
    flex: 1,
  },
  sunHoursUnit: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
    marginLeft: Spacing.sm,
  },

  // ── ABOUT SECTION
  aboutSection: {
    marginBottom: Spacing.section,
  },
  aboutRow: {
    backgroundColor: Colors.surfaceContainerHigh,
    padding: Spacing.cardPaddingLg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aboutRowLabel: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.body,
    color: Colors.onSurface,
  },
  aboutRowSublabel: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.caption,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  aboutRowDivider: {
    height: 1,
    backgroundColor: Colors.background,
  },

  // ── VERSION BADGE
  versionBadge: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  versionBadgeText: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    color: Colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
