/**
 * ComponentListScreen — Step 6 of 6 (Final Verification).
 *
 * Displays a generated list of system components derived from sizing results.
 * Each row shows icon + name + QTY chip + SKU label + optional price input.
 * Prices are optional (leave blank to omit from proposal).
 * Total cost is summed live from entered prices.
 *
 * Also renders the amber gradient "Technical Dossier Summary" total card,
 * the AdMob banner placeholder (required on this screen), and CTA
 * "GENERATE PROPOSAL" button that navigates to ProposalPreviewScreen.
 *
 * Architecture rules:
 * - Zero calculation logic: item list built purely from sizing props.
 * - All strings from /src/constants/strings.js.
 * - All colours from /src/theme/index.js.
 * - FlatList for the component rows.
 * - useCallback for all handlers.
 * - try/catch on any async/storage operations.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
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
import { COMPONENT_LIST, ADS, APP } from '../constants/strings';
import { DEFAULT_PANEL_WATTAGE } from '../constants/index';
import ProgressBar from '../components/ProgressBar';

// ─── SKU HELPERS ─────────────────────────────────────────────────────────────

/**
 * Returns a display-friendly component item list derived from the
 * full sizing result. No calculation logic — only formats known values.
 *
 * @param {object} sizing - Output of runFullSizingCalculation()
 * @param {object} systemConfig - System configuration from route params
 * @returns {Array<{ id, icon, name, qty, sku }>}
 */
function buildComponentItems(sizing, systemConfig) {
  if (!sizing) return [];

  const isHybrid = systemConfig?.isHybrid ?? true;
  const chemLabel = systemConfig?.batteryChemistry?.label ?? 'Lithium (LiFePO4)';
  const sysV = systemConfig?.systemVoltageV ?? 48;

  const inverterKva = (sizing.inverterSizeVA / 1000).toFixed(1);
  const inverterType = isHybrid ? 'Hybrid' : 'Off-Grid';

  const panelW = DEFAULT_PANEL_WATTAGE;
  const panelCount = sizing.panelArray?.panelCount ?? 0;

  const battCount = sizing.batteryConfig?.totalUnits ?? 0;
  const battAh = 100; // from DEFAULT_BATTERY_AH (100Ah units)

  const items = [
    {
      id: 'inverter',
      icon: 'lightning-bolt',
      name: `${inverterKva}kVA ${inverterType} Inverter`,
      qty: 1,
      sku: `SS-INV-${Math.round(sizing.inverterSizeVA / 100) * 100}`,
    },
    {
      id: 'panels',
      icon: 'solar-panel-large',
      name: `${panelW}W Mono Crystalline Panel`,
      qty: panelCount,
      sku: `SS-PNL-${panelW}M`,
    },
    {
      id: 'batteries',
      icon: 'battery-charging',
      name: `${battAh}Ah ${chemLabel} Battery`,
      qty: battCount,
      sku: `SS-BAT-${chemLabel.includes('Lithium') ? 'LFP' : 'AGM'}${battAh}`,
    },
  ];

  // Add charge controller for separate (non-hybrid) systems
  if (!isHybrid && sizing.chargeController) {
    const ctrlA = sizing.chargeController.controllerCurrentA;
    items.push({
      id: 'controller',
      icon: 'chip',
      name: `${ctrlA}A MPPT Charge Controller`,
      qty: 1,
      sku: `SS-CTRL-${ctrlA}A`,
    });
  }

  // MCB + protection always included
  if (sizing.wireCurrents?.inverterToLoad) {
    items.push({
      id: 'mcb',
      icon: 'shield-outline',
      name: `MCB + SPD Protection Assembly`,
      qty: 1,
      sku: `SS-PROT-${sysV}V`,
    });
  }

  // Wiring loom
  items.push({
    id: 'wiring',
    icon: 'cable-data',
    name: 'DC/AC Wiring Loom & Connectors',
    qty: 1,
    sku: 'SS-WIRE-STD',
  });

  return items;
}

// ─── COMPONENT CARD ───────────────────────────────────────────────────────────

/**
 * A single component card row: icon + name/qty/sku + price input.
 *
 * @param {{
 *   item: { id, icon, name, qty, sku },
 *   price: string,
 *   onPriceChange: (id: string, value: string) => void,
 *   currencySymbol: string,
 * }} props
 */
function ComponentCard({ item, price, onPriceChange, currencySymbol }) {
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback(
    (val) => onPriceChange(item.id, val),
    [item.id, onPriceChange]
  );

  return (
    <View style={styles.card}>
      {/* Top row: icon + name */}
      <View style={styles.cardTopRow}>
        <MaterialCommunityIcons
          name={item.icon}
          size={18}
          color={Colors.primaryContainer}
        />
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>

      {/* Meta row: QTY chip + SKU */}
      <View style={styles.cardMetaRow}>
        <View style={styles.qtyChip}>
          <Text style={styles.qtyChipText}>
            {COMPONENT_LIST.qtyPrefix}: {item.qty}
          </Text>
        </View>
        <Text style={styles.skuText}>{item.sku}</Text>
      </View>

      {/* Price input */}
      <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
        <Text style={styles.currencyPrefix}>{currencySymbol}</Text>
        <TextInput
          style={styles.priceInput}
          value={price}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={COMPONENT_LIST.pricePlaceholder}
          placeholderTextColor={Colors.surfaceContainerHighest}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        />
      </View>
    </View>
  );
}

// ─── ADMOB PLACEHOLDER ────────────────────────────────────────────────────────

function AdBannerPlaceholder() {
  return (
    <View style={styles.adBanner}>
      <Text style={styles.adBannerText}>{ADS.bannerLabel}</Text>
    </View>
  );
}

// ─── COMPONENT LIST SCREEN ────────────────────────────────────────────────────

/**
 * ComponentListScreen — Step 6 of 6.
 * @param {{ navigation: object, route: object }} props
 */
export default function ComponentListScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const clientInfo = route.params?.clientInfo ?? {};
  const systemConfig = route.params?.systemConfig ?? {};
  const appliances = route.params?.appliances ?? [];
  const sizing = route.params?.sizing ?? null;

  // Build component item list from sizing result
  const componentItems = useMemo(
    () => buildComponentItems(sizing, systemConfig),
    [sizing, systemConfig]
  );

  // Prices keyed by item.id — empty string = not entered
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(componentItems.map((c) => [c.id, '']))
  );

  const handlePriceChange = useCallback((id, value) => {
    setPrices((prev) => ({ ...prev, [id]: value }));
  }, []);

  // Live total cost calculation (display only, not in calculations.js)
  const totalCost = useMemo(() => {
    return componentItems.reduce((sum, item) => {
      const raw = prices[item.id];
      const parsed = parseFloat(raw.replace(/,/g, ''));
      return sum + (isNaN(parsed) ? 0 : parsed * item.qty);
    }, 0);
  }, [prices, componentItems]);

  const formattedTotal = useMemo(() => {
    if (totalCost === 0) return '—';
    return totalCost.toLocaleString('en-NG');
  }, [totalCost]);

  // ── Handlers
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);
  const handleSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);

  const handleGenerate = useCallback(() => {
    navigation.navigate('ProposalPreview', {
      clientInfo,
      systemConfig,
      appliances,
      sizing,
      componentPrices: prices,
      totalCost,
    });
  }, [navigation, clientInfo, systemConfig, appliances, sizing, prices, totalCost]);

  // FlatList keyExtractor + renderItem
  const keyExtractor = useCallback((item) => item.id, []);

  const renderItem = useCallback(
    ({ item }) => (
      <ComponentCard
        item={item}
        price={prices[item.id] ?? ''}
        onPriceChange={handlePriceChange}
        currencySymbol={COMPONENT_LIST.currencySymbol}
      />
    ),
    [prices, handlePriceChange]
  );

  // Note card + Total card + AdMob + footer (rendered as ListFooterComponent)
  const ListFooter = useMemo(
    () => (
      <View>
        {/* Note info card */}
        <View style={styles.noteCard}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={Colors.primaryContainer}
          />
          <Text style={styles.noteText}>
            <Text style={styles.noteBold}>{COMPONENT_LIST.infoTitle} </Text>
            {COMPONENT_LIST.infoBody}
          </Text>
        </View>

        {/* Amber gradient total summary card */}
        <LinearGradient
          colors={Gradients.summaryCard.colors}
          start={Gradients.summaryCard.start}
          end={Gradients.summaryCard.end}
          style={styles.totalCard}
        >
          <Text style={styles.totalCardLabel}>{COMPONENT_LIST.totalCardLabel}</Text>
          <Text style={styles.totalCostSubLabel}>{COMPONENT_LIST.totalLabel}</Text>
          <Text style={styles.totalCostValue}>
            {COMPONENT_LIST.currencySymbol} {formattedTotal}
          </Text>
        </LinearGradient>

        {/* AdMob Banner (required on Component List — rule 29) */}
        <AdBannerPlaceholder />

        {/* Footer caption */}
        <Text style={styles.footerCaption}>
          © 2024 SolarSpec Technical Systems • Precision Engineering Framework
        </Text>
      </View>
    ),
    [formattedTotal]
  );

  // ListHeaderComponent: progress + title block
  const ListHeader = useMemo(
    () => (
      <View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabelLeft}>{COMPONENT_LIST.stepLabel}</Text>
          <Text style={styles.progressLabelRight}>{COMPONENT_LIST.stepRight}</Text>
        </View>
        <ProgressBar currentStep={6} />

        <View style={styles.titleBlock}>
          <Text style={styles.screenTitle}>{COMPONENT_LIST.screenTitle}</Text>
          <Text style={styles.screenSubtitle}>{COMPONENT_LIST.subtitle}</Text>
        </View>
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

      {/* ── FLAT LIST (component rows + header + footer) ────────────────── */}
      <FlatList
        data={componentItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 96 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* ── FIXED CTA BAR ──────────────────────────────────────────────── */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable
          onPress={handleGenerate}
          style={({ pressed }) => pressed && styles.ctaPressed}
        >
          <LinearGradient
            colors={Gradients.cta.colors}
            start={Gradients.cta.start}
            end={Gradients.cta.end}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaLabel}>{COMPONENT_LIST.generateBtn}</Text>
            <MaterialCommunityIcons name="file-document-outline" size={20} color={Colors.onPrimary} />
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

  // ── LIST
  listContent: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.xxl,
  },
  separator: {
    height: Spacing.lg,
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
    color: Colors.primaryContainer,
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

  // ── COMPONENT CARD
  card: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    ...Borders.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
    flex: 1,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  qtyChip: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  qtyChipText: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
  },
  skuText: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.tertiary,
  },

  // ── PRICE INPUT
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  inputWrapperFocused: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  currencyPrefix: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.lg,
    color: Colors.onSurfaceVariant,
    paddingLeft: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  priceInput: {
    flex: 1,
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0,
  },

  // ── NOTE CARD
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 2,
    borderLeftColor: ColorAlpha.primaryContainer30,
    padding: Spacing.xl,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xxl,
  },
  noteText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: Colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 20,
  },
  noteBold: {
    fontFamily: FontFamily.interBold,
    color: Colors.onSurface,
  },

  // ── TOTAL SUMMARY CARD (amber gradient)
  totalCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xxxl,
    marginBottom: Spacing.xxl,
    ...Shadows.fab,
  },
  totalCardLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.caption,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.onPrimary,
    marginBottom: Spacing.sm,
    opacity: 0.8,
  },
  totalCostSubLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.body,
    textTransform: 'uppercase',
    color: Colors.onPrimary,
    opacity: 0.8,
    marginBottom: 4,
  },
  totalCostValue: {
    fontFamily: FontFamily.manropeBlack,
    fontSize: 48,
    letterSpacing: -1,
    color: Colors.onPrimary,
    lineHeight: 56,
  },

  // ── ADMOB BANNER (required on Component List — rule 29)
  adBanner: {
    width: 320,
    height: 50,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: ColorAlpha.outlineVariant20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  adBannerText: {
    fontFamily: FontFamily.interBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: ColorAlpha.onSurfaceVariant60,
  },

  // ── FOOTER CAPTION
  footerCaption: {
    fontFamily: FontFamily.interRegular,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    opacity: 0.4,
    marginBottom: Spacing.xxxl,
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
    gap: Spacing.md,
    minHeight: 56,
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
