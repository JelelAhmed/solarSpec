/**
 * ClientInfoScreen — Step 1 of 6.
 * Collects client name, site address, assessment date, and technician name.
 * Technician name is pre-filled (read-only) from saved settings.
 * Passes clientInfo object to SystemConfigScreen via navigation params.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Gradients,
  Shadows,
} from '../theme/index';
import { CLIENT_DETAILS, APP } from '../constants/strings';
import ProgressBar from '../components/ProgressBar';
import { loadSettings } from '../services/storage';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Formats a Date object to DD/MM/YYYY for display */
function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

// ─── FOCUSED INPUT ────────────────────────────────────────────────────────────

/**
 * A labelled text input with bottom-border-only style and focus highlight.
 * Renders an optional right-side icon.
 *
 * @param {{
 *   label: string,
 *   value: string,
 *   onChangeText: Function,
 *   placeholder: string,
 *   rightIcon?: string,
 *   disabled?: boolean,
 *   keyboardType?: string,
 *   onSubmitEditing?: Function,
 *   inputRef?: object,
 * }} props
 */
function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  rightIcon,
  disabled = false,
  keyboardType = 'default',
  onSubmitEditing,
  inputRef,
}) {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  return (
    <View style={styles.fieldContainer}>
      <Text
        style={[
          styles.fieldLabel,
          focused && !disabled && styles.fieldLabelFocused,
        ]}
      >
        {label}
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            focused && !disabled ? styles.textInputFocused : styles.textInputBlurred,
            disabled && styles.textInputDisabled,
            rightIcon && styles.textInputWithIcon,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.surfaceContainerHighest}
          editable={!disabled}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={onSubmitEditing ? 'next' : 'done'}
          autoCorrect={false}
        />
        {rightIcon && (
          <MaterialCommunityIcons
            name={rightIcon}
            size={20}
            color={Colors.onSurfaceVariant}
            style={styles.inputIcon}
          />
        )}
      </View>
    </View>
  );
}

// ─── DATE FIELD ───────────────────────────────────────────────────────────────

/**
 * Date picker field — tapping opens the native date picker.
 * @param {{ date: Date, onChange: Function }} props
 */
function DateField({ date, onChange }) {
  const [focused, setFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handlePress = useCallback(() => {
    setFocused(true);
    setShowPicker(true);
  }, []);

  const handleChange = useCallback(
    (event, selectedDate) => {
      // Android dismisses automatically; iOS keeps open
      if (Platform.OS === 'android') {
        setShowPicker(false);
        setFocused(false);
      }
      if (event.type !== 'dismissed' && selectedDate) {
        onChange(selectedDate);
      } else if (event.type === 'dismissed') {
        setShowPicker(false);
        setFocused(false);
      }
    },
    [onChange]
  );

  const handleIOSConfirm = useCallback(() => {
    setShowPicker(false);
    setFocused(false);
  }, []);

  return (
    <View style={styles.fieldContainer}>
      <Text
        style={[styles.fieldLabel, focused && styles.fieldLabelFocused]}
      >
        {CLIENT_DETAILS.assessmentDateLabel}
      </Text>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View
          style={[
            styles.inputWrapper,
            focused ? styles.textInputFocused : styles.textInputBlurred,
          ]}
        >
          <Text style={styles.dateText}>{formatDate(date)}</Text>
          <MaterialCommunityIcons
            name="calendar"
            size={20}
            color={Colors.onSurfaceVariant}
            style={styles.inputIcon}
          />
        </View>
      </TouchableOpacity>

      {showPicker && (
        <>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            maximumDate={new Date()}
            style={styles.datePicker}
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              onPress={handleIOSConfirm}
              style={styles.iosDateConfirm}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.iosDateConfirmText}>Done</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

// ─── INFO CARD ────────────────────────────────────────────────────────────────

function InfoCard() {
  return (
    <View style={styles.infoCard}>
      <MaterialCommunityIcons
        name="information"
        size={20}
        color={Colors.tertiary}
        style={styles.infoIcon}
      />
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoTitle}>{CLIENT_DETAILS.infoCardTitle}</Text>
        <Text style={styles.infoBody}>{CLIENT_DETAILS.infoCardBody}</Text>
      </View>
    </View>
  );
}

// ─── CLIENT INFO SCREEN ───────────────────────────────────────────────────────

/**
 * ClientInfoScreen — Step 1 of the proposal creation flow.
 * @param {{ navigation: object, route: object }} props
 */
export default function ClientInfoScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // Form state
  const [clientName, setClientName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [assessmentDate, setAssessmentDate] = useState(new Date());
  const [technicianName, setTechnicianName] = useState('');

  // Input refs for focus chaining
  const addressRef = useRef(null);

  // Load technician name from settings
  useEffect(() => {
    let mounted = true;
    async function fetchTechnician() {
      try {
        const settings = await loadSettings();
        if (mounted && settings.technicianName) {
          setTechnicianName(settings.technicianName);
        }
      } catch (e) {
        console.error('ClientInfoScreen fetchTechnician:', e);
      }
    }
    fetchTechnician();
    return () => { mounted = false; };
  }, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleNext = useCallback(() => {
    navigation.navigate('SystemConfig', {
      clientInfo: {
        clientName: clientName.trim(),
        siteAddress: siteAddress.trim(),
        assessmentDate: assessmentDate.toISOString(),
        technicianName: technicianName.trim(),
      },
    });
  }, [navigation, clientName, siteAddress, assessmentDate, technicianName]);

  const handleDateChange = useCallback((date) => {
    setAssessmentDate(date);
  }, []);

  const focusAddress = useCallback(() => {
    addressRef.current?.focus();
  }, []);

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
          <Text style={styles.navWordmark}>{APP.wordmark}</Text>
        </View>

        <View style={styles.navRight}>
          <Text style={styles.navStepLabel}>STEP 01 / 06</Text>
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

      {/* ── KEYBOARD AVOIDING ──────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* ── SCROLL BODY ────────────────────────────────────────────── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 56 + 24 + 48 + insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress bar — own row below header */}
          <ProgressBar currentStep={1} />

          {/* Screen title */}
          <View style={styles.titleBlock}>
            <Text style={styles.screenTitle}>{CLIENT_DETAILS.screenTitle}</Text>
            <Text style={styles.screenSubtitle}>{CLIENT_DETAILS.subtitle}</Text>
          </View>

          {/* Form fields */}
          <View style={styles.formSection}>
            <FormField
              label={CLIENT_DETAILS.clientNameLabel}
              value={clientName}
              onChangeText={setClientName}
              placeholder={CLIENT_DETAILS.clientNamePlaceholder}
              onSubmitEditing={focusAddress}
            />
            <FormField
              inputRef={addressRef}
              label={CLIENT_DETAILS.siteAddressLabel}
              value={siteAddress}
              onChangeText={setSiteAddress}
              placeholder={CLIENT_DETAILS.siteAddressPlaceholder}
              rightIcon="map-marker"
            />
            <DateField date={assessmentDate} onChange={handleDateChange} />
            <View style={styles.disabledWrapper}>
              <FormField
                label={CLIENT_DETAILS.technicianLabel}
                value={technicianName || CLIENT_DETAILS.technicianPlaceholder}
                onChangeText={() => {}}
                placeholder={CLIENT_DETAILS.technicianPlaceholder}
                disabled
              />
            </View>
          </View>

          {/* Info card */}
          <InfoCard />
        </ScrollView>

        {/* ── FIXED BOTTOM CTA ───────────────────────────────────────── */}
        <View
          style={[
            styles.ctaBar,
            { paddingBottom: insets.bottom + Spacing.xxl },
          ]}
        >
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
              <Text style={styles.ctaLabel}>{CLIENT_DETAILS.nextBtn}</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.ctaFooter}>{CLIENT_DETAILS.footerNote}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
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
  navWordmark: {
    fontFamily: FontFamily.manropeBlack,
    fontSize: FontSize.lg,
    color: Colors.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  navStepLabel: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.caption,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.onSurfaceVariant,
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
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.body,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.sm,
  },

  // ── FORM
  formSection: {
    gap: Spacing.section,
    marginBottom: Spacing.sectionGap,
  },
  fieldContainer: {
    position: 'relative',
  },
  fieldLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xs,
  },
  fieldLabelFocused: {
    color: Colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
  },
  textInput: {
    flex: 1,
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  textInputBlurred: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  textInputFocused: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  textInputDisabled: {
    color: Colors.onSurfaceVariant,
  },
  textInputWithIcon: {
    paddingRight: Spacing.xxxl,
  },
  inputIcon: {
    position: 'absolute',
    right: 0,
  },

  // ── DISABLED WRAPPER (technician field at 60% opacity)
  disabledWrapper: {
    opacity: 0.6,
  },

  // ── DATE TEXT (inside the date field Pressable)
  dateText: {
    flex: 1,
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
    paddingVertical: Spacing.md,
  },
  datePicker: {
    marginTop: Spacing.sm,
  },
  iosDateConfirm: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
  },
  iosDateConfirmText: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.body,
    color: Colors.primaryContainer,
  },

  // ── INFO CARD
  infoCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoTextBlock: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurface,
  },
  infoBody: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: Colors.onSurfaceVariant,
    marginTop: 6,
    lineHeight: 22,
  },

  // ── FIXED CTA BAR
  ctaBar: {
    backgroundColor: 'rgba(19,19,19,0.95)',
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(82,69,52,0.10)',
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
  ctaFooter: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.footnote,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
