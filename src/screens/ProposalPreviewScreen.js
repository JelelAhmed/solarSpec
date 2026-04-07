/**
 * ProposalPreviewScreen — End of flow.
 *
 * Shows a white "paper" proposal document on a dark background.
 * The document faithfully mirrors the PDF template layout:
 *   - Brand header + Proposal # + Date
 *   - Client details + System recommendation summary
 *   - Appliance table
 *   - System component pricing list
 *   - Total investment
 *   - Footer with brand watermark + colour chips
 *
 * Two floating action buttons (FABs) in the bottom-right:
 *   - Share FAB: amber (#FFC880) → generates + shares PDF
 *   - Save PDF FAB: dark with amber border → generates + saves PDF only
 *
 * Design rules (from audit checklist):
 *   - Rule 28: white document on dark background. ✓
 *     Share FAB amber. Save FAB dark with amber border. ✓
 *   - Rule 26: NO "Export PDF" progress bar — this is NOT a step screen. ✓
 *   - Rule 30: NO AdMob banner on this screen. ✓
 *   - Rule 32: useCallback for all handlers. ✓
 *
 * Architecture rules:
 *   - PDF generation via /src/services/pdf.js only.
 *   - Template HTML from /src/templates/proposal.js only.
 *   - All colours from /src/theme/index.js.
 *   - All strings from /src/constants/strings.js.
 *   - Zero calculation logic.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  Colors,
  ColorAlpha,
  FontFamily,
  FontSize,
  Spacing,
  BorderRadius,
  Shadows,
} from '../theme/index';
import { PROPOSAL_PREVIEW } from '../constants/strings';
import { generateAndShare, generatePDF } from '../services/pdf.js';

// ─── DOCUMENT COLOURS ─────────────────────────────────────────────────────────
// These are hard-coded white-paper document colours, intentionally NOT dark-theme
// tokens. The proposal is a light document — the only screen with white content.
const DOC = {
  paper: '#FFFFFF',
  ink: '#131313',
  muted: '#524534',
  divider: '#E5E2E1',
  sectionLabel: '#9f8e7a',
  accentAmber: '#F5A623',
  accentTeal: '#26A37A',
  accentBlue: '#3AC2FF',
  metricBorder: 'rgba(82,69,52,0.12)',
};

// ─── DOCUMENT SUB-COMPONENTS ─────────────────────────────────────────────────

/** Small uppercase section label in document muted colour */
function DocLabel({ children }) {
  return <Text style={docStyles.sectionLabel}>{children}</Text>;
}

/** Divider line between document sections */
function DocDivider({ thick = false }) {
  return (
    <View
      style={[
        docStyles.divider,
        thick && docStyles.dividerThick,
      ]}
    />
  );
}

/** Key metric cell in the metrics row */
function MetricCell({ label, value, sub, noBorder }) {
  return (
    <View style={[docStyles.metricCell, noBorder && { borderRightWidth: 0 }]}>
      <Text style={docStyles.metricLabel}>{label}</Text>
      <Text style={docStyles.metricValue}>{value}</Text>
      {sub ? <Text style={docStyles.metricSub}>{sub}</Text> : null}
    </View>
  );
}

/** Single appliance table row — alternating background */
function ApplianceRow({ item, index }) {
  const bg = index % 2 === 0 ? DOC.paper : '#FAFAFA';
  return (
    <View style={[docStyles.tableRow, { backgroundColor: bg }]}>
      <Text style={[docStyles.tableCell, docStyles.tableCellFlex, docStyles.tableCellBold]}>
        {item.label || item.name || '—'}
      </Text>
      <Text style={docStyles.tableCell}>{item.quantity || 1}</Text>
      <Text style={docStyles.tableCell}>{item.watts || 0}W</Text>
      <Text style={[docStyles.tableCell, docStyles.tableCellRight]}>
        {item.dailyHours || 0} hrs
      </Text>
    </View>
  );
}

/** Single component pricing row */
function ComponentRow({ item, prices }) {
  const unitPrice = parseFloat((prices?.[item.id] || '0').replace(/[^0-9.]/g, '')) || 0;
  const totalPrice = unitPrice * (item.qty || 1);
  const priceStr = unitPrice > 0
    ? '₦' + totalPrice.toLocaleString('en-NG', { minimumFractionDigits: 2 })
    : '—';

  return (
    <View style={docStyles.componentRow}>
      <View style={{ flex: 1 }}>
        <Text style={docStyles.componentName}>{item.name || '—'} × {item.qty || 1}</Text>
        <Text style={docStyles.componentSku}>{item.sku || ''}</Text>
      </View>
      <Text style={docStyles.componentPrice}>{priceStr}</Text>
    </View>
  );
}

// ─── PROPOSAL PREVIEW SCREEN ─────────────────────────────────────────────────

/**
 * ProposalPreviewScreen — final screen at the end of the proposal flow.
 * @param {{ navigation: object, route: object }} props
 */
export default function ProposalPreviewScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const clientInfo = route.params?.clientInfo ?? {};
  const systemConfig = route.params?.systemConfig ?? {};
  const appliances = route.params?.appliances ?? [];
  const sizing = route.params?.sizing ?? null;
  const componentPrices = route.params?.componentPrices ?? {};
  const componentItems = route.params?.componentItems ?? [];
  const totalCost = route.params?.totalCost ?? 0;

  const [generating, setGenerating] = useState(false);

  // Build display values
  const isHybrid = systemConfig.isHybrid ?? true;
  const inverterKva = sizing?.inverterSizeVA
    ? (sizing.inverterSizeVA / 1000).toFixed(1)
    : '—';
  const solarKwp = sizing?.panelArray?.totalPanelWattsW
    ? (sizing.panelArray.totalPanelWattsW / 1000).toFixed(1)
    : '—';
  const batteryKwh = sizing?.batteryCapacityAh && systemConfig.systemVoltageV
    ? ((sizing.batteryCapacityAh * systemConfig.systemVoltageV) / 1000).toFixed(1)
    : '—';
  const systemLabel = `${inverterKva}kVA ${isHybrid ? 'Hybrid' : 'Off-Grid'} Solar System`;

  const today = useMemo(() => new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }), []);

  const totalStr = useMemo(() => {
    if (!totalCost || totalCost === 0) return '—';
    return '₦' + Number(totalCost).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
    });
  }, [totalCost]);

  // Shared proposal data shape for PDF service
  const proposalData = useMemo(() => ({
    clientInfo,
    systemConfig,
    sizing,
    appliances,
    componentItems,
    componentPrices,
    totalCost,
  }), [clientInfo, systemConfig, sizing, appliances, componentItems, componentPrices, totalCost]);

  // ── Handlers
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleShare = useCallback(async () => {
    await generateAndShare(proposalData, setGenerating);
  }, [proposalData]);

  const handleSavePDF = useCallback(async () => {
    setGenerating(true);
    try {
      await generatePDF(proposalData);
    } finally {
      setGenerating(false);
    }
  }, [proposalData]);

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
          <Text style={styles.navTitle}>{PROPOSAL_PREVIEW.headerTitle}</Text>
        </View>
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Text style={styles.editBtn}>{PROPOSAL_PREVIEW.editBtn}</Text>
        </TouchableOpacity>
      </View>

      {/* ── SCROLLABLE DOCUMENT ─────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* White paper document */}
        <View style={styles.document}>
          {/* ── DOCUMENT HEADER ────────────────────────────────── */}
          <View style={docStyles.header}>
            <View>
              <View style={docStyles.brandRow}>
                <View style={docStyles.brandIcon}>
                  <MaterialCommunityIcons name="solar-power" size={18} color={DOC.ink} />
                </View>
                <Text style={docStyles.brandName}>{PROPOSAL_PREVIEW.documentBrandName}</Text>
              </View>
              <Text style={docStyles.brandSubtitle}>{PROPOSAL_PREVIEW.documentSubtitle}</Text>
            </View>
            <View style={docStyles.docMeta}>
              <Text style={docStyles.docRefText}>
                {PROPOSAL_PREVIEW.proposalPrefix}SS-{new Date().getFullYear()}-001
              </Text>
              <Text style={docStyles.docDateText}>{today}</Text>
            </View>
          </View>
          <DocDivider />

          {/* ── CLIENT + SYSTEM REC ─────────────────────────────── */}
          <View style={docStyles.twoCol}>
            {/* Client details */}
            <View style={docStyles.colHalf}>
              <DocLabel>{PROPOSAL_PREVIEW.clientDetailsLabel}</DocLabel>
              <Text style={docStyles.clientName}>{clientInfo.name || '—'}</Text>
              <Text style={docStyles.clientDetail}>
                {clientInfo.address || ''}
              </Text>
              {clientInfo.phone ? (
                <Text style={docStyles.clientDetail}>{clientInfo.phone}</Text>
              ) : null}
              {clientInfo.email ? (
                <Text style={docStyles.clientDetail}>{clientInfo.email}</Text>
              ) : null}
            </View>
            {/* System recommendation */}
            <View style={docStyles.colHalf}>
              <DocLabel>{PROPOSAL_PREVIEW.systemRecLabel}</DocLabel>
              <View style={docStyles.systemRecBox}>
                <Text style={docStyles.systemRecTitle}>{systemLabel}</Text>
                <Text style={docStyles.systemRecBody}>
                  Designed for maximum energy independence with peak efficiency.
                </Text>
              </View>
            </View>
          </View>

          {/* ── KEY METRICS ROW ─────────────────────────────────── */}
          <View style={docStyles.metricsRow}>
            <MetricCell
              label="Inverter"
              value={`${inverterKva} kVA`}
              sub={isHybrid ? 'Hybrid MPPT' : 'Off-Grid'}
            />
            <MetricCell
              label="Solar Array"
              value={`${solarKwp} kWp`}
              sub={`${sizing?.panelArray?.panelCount ?? 0}× panels`}
            />
            <MetricCell
              label="Battery"
              value={`${batteryKwh} kWh`}
              sub={systemConfig.batteryChemistry?.label?.split(' ')[0] ?? 'Li'}
            />
            <MetricCell
              label="Backup"
              value={`${sizing?.backupHours?.toFixed(1) ?? '—'} hrs`}
              sub="at avg load"
              noBorder
            />
          </View>

          {/* ── APPLIANCE TABLE ─────────────────────────────────── */}
          <View style={docStyles.section}>
            <DocLabel>{PROPOSAL_PREVIEW.applianceTableLabel}</DocLabel>
            {/* Table header */}
            <View style={docStyles.tableHeader}>
              <Text style={[docStyles.tableHeaderCell, docStyles.tableCellFlex]}>
                {PROPOSAL_PREVIEW.tableColItem}
              </Text>
              <Text style={docStyles.tableHeaderCell}>{PROPOSAL_PREVIEW.tableColQty}</Text>
              <Text style={docStyles.tableHeaderCell}>{PROPOSAL_PREVIEW.tableColWatts}</Text>
              <Text style={[docStyles.tableHeaderCell, docStyles.tableCellRight]}>
                {PROPOSAL_PREVIEW.tableColDailyUsage}
              </Text>
            </View>
            {(appliances.length > 0 ? appliances : []).map((item, index) => (
              <ApplianceRow key={item.id ?? index} item={item} index={index} />
            ))}
            {appliances.length === 0 && (
              <Text style={docStyles.emptyMsg}>No appliances added.</Text>
            )}
          </View>

          {/* ── SYSTEM COMPONENTS ───────────────────────────────── */}
          <View style={docStyles.section}>
            <DocLabel>{PROPOSAL_PREVIEW.componentsLabel}</DocLabel>
            {componentItems.length > 0
              ? componentItems.map((item) => (
                  <ComponentRow key={item.id} item={item} prices={componentPrices} />
                ))
              : <Text style={docStyles.emptyMsg}>No components specified.</Text>
            }
          </View>

          {/* ── TOTAL INVESTMENT ─────────────────────────────────── */}
          <DocDivider thick />
          <View style={docStyles.totalSection}>
            <DocLabel>{PROPOSAL_PREVIEW.totalInvestmentLabel}</DocLabel>
            <Text style={docStyles.totalAmount}>{totalStr}</Text>
            <Text style={docStyles.totalNote}>
              *Prices are estimates. Final quote subject to site survey.
            </Text>
          </View>

          {/* ── DOCUMENT FOOTER ──────────────────────────────────── */}
          <DocDivider />
          <View style={docStyles.docFooter}>
            <Text style={docStyles.footerLabel}>{PROPOSAL_PREVIEW.generatedByFooter}</Text>
            <View style={docStyles.colorChips}>
              <View style={[docStyles.colorChip, { backgroundColor: DOC.accentAmber }]} />
              <View style={[docStyles.colorChip, { backgroundColor: DOC.accentTeal }]} />
              <View style={[docStyles.colorChip, { backgroundColor: DOC.accentBlue }]} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── FABs — fixed bottom-right ───────────────────────────────────── */}
      <View style={[styles.fabStack, { bottom: Math.max(insets.bottom + Spacing.xxl, 32) }]}>
        {/* Share FAB — amber */}
        <Pressable
          onPress={handleShare}
          disabled={generating}
          style={({ pressed }) => [styles.fab, styles.fabShare, pressed && styles.fabPressed]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {generating ? (
            <ActivityIndicator color={Colors.onPrimary} size="small" />
          ) : (
            <MaterialCommunityIcons name="share-variant" size={24} color={Colors.onPrimary} />
          )}
        </Pressable>

        {/* Save PDF FAB — dark with amber border */}
        <Pressable
          onPress={handleSavePDF}
          disabled={generating}
          style={({ pressed }) => [styles.fab, styles.fabSave, pressed && styles.fabPressed]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name="file-pdf-box"
            size={24}
            color={Colors.primaryContainer}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── SCREEN STYLES ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
  },

  // ── NAV
  navBar: {
    height: 64,
    backgroundColor: Colors.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPaddingH,
    borderBottomWidth: 1,
    borderBottomColor: ColorAlpha.outlineVariant10,
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
  editBtn: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.body,
    color: Colors.primaryContainer,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },

  // ── SCROLL
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },

  // ── DOCUMENT (white paper)
  document: {
    backgroundColor: DOC.paper,
    width: '100%',
    borderRadius: 4,
    padding: Spacing.xxxl,
    ...Shadows.fab,
    marginBottom: Spacing.xxxl,
  },

  // ── FABs
  fabStack: {
    position: 'absolute',
    right: Spacing.xxl,
    flexDirection: 'column',
    gap: Spacing.lg,
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.fab,
  },
  fabShare: {
    backgroundColor: Colors.primary, // amber #FFC880
  },
  fabSave: {
    backgroundColor: Colors.surfaceContainerHighest, // dark #353534
    borderWidth: 1,
    borderColor: Colors.primaryContainer, // amber border
  },
  fabPressed: {
    transform: [{ scale: 0.9 }],
  },
});

// ─── DOCUMENT STYLES (white-paper context) ────────────────────────────────────

const docStyles = StyleSheet.create({
  // ── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xxl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: 6,
  },
  brandIcon: {
    backgroundColor: DOC.accentAmber,
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: FontFamily.manropeBlack,
    fontSize: FontSize.xxl,
    color: DOC.ink,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  brandSubtitle: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 10,
    color: DOC.sectionLabel,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  docMeta: {
    alignItems: 'flex-end',
  },
  docRefText: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.standard,
    color: DOC.ink,
  },
  docDateText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: DOC.muted,
    marginTop: 4,
  },

  // ── Divider
  divider: {
    height: 1,
    backgroundColor: DOC.divider,
    marginVertical: Spacing.xl,
  },
  dividerThick: {
    height: 2,
    backgroundColor: DOC.ink,
  },

  // ── Section label
  sectionLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: 10,
    color: DOC.sectionLabel,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },

  // ── Two-column grid
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  colHalf: {
    flex: 1,
  },
  clientName: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.lg,
    color: DOC.ink,
    marginBottom: 4,
  },
  clientDetail: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: DOC.muted,
    lineHeight: 20,
  },
  systemRecBox: {
    borderWidth: 1,
    borderColor: 'rgba(82,69,52,0.2)',
    borderRadius: 8,
    padding: Spacing.lg,
    backgroundColor: 'rgba(245,166,35,0.03)',
  },
  systemRecTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.standard,
    color: DOC.accentAmber,
    marginBottom: 4,
  },
  systemRecBody: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: DOC.muted,
    lineHeight: 20,
  },

  // ── Metrics row
  metricsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: DOC.metricBorder,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  metricCell: {
    flex: 1,
    padding: Spacing.lg,
    borderRightWidth: 1,
    borderRightColor: DOC.metricBorder,
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: 9,
    color: DOC.sectionLabel,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.standard,
    color: DOC.accentAmber,
  },
  metricSub: {
    fontFamily: FontFamily.interRegular,
    fontSize: 10,
    color: DOC.muted,
    marginTop: 2,
  },

  // ── Section
  section: {
    marginBottom: Spacing.xl,
  },

  // ── Appliance table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245,166,35,0.05)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: 0,
  },
  tableHeaderCell: {
    fontFamily: FontFamily.interBold,
    fontSize: 10,
    color: DOC.sectionLabel,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    width: 60,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DOC.divider,
  },
  tableCell: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: DOC.ink,
    width: 60,
  },
  tableCellFlex: {
    flex: 1,
    width: undefined,
  },
  tableCellBold: {
    fontFamily: FontFamily.interSemiBold,
  },
  tableCellRight: {
    textAlign: 'right',
  },
  emptyMsg: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: DOC.sectionLabel,
    paddingVertical: Spacing.lg,
  },

  // ── Component rows
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,226,225,0.5)',
  },
  componentName: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.body,
    color: DOC.ink,
  },
  componentSku: {
    fontFamily: FontFamily.interRegular,
    fontSize: 11,
    color: DOC.muted,
    marginTop: 2,
  },
  componentPrice: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.body,
    color: DOC.ink,
    marginLeft: Spacing.lg,
  },

  // ── Total section
  totalSection: {
    alignItems: 'flex-end',
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  totalAmount: {
    fontFamily: FontFamily.manropeBlack,
    fontSize: 36,
    color: DOC.accentAmber,
    letterSpacing: -0.5,
    lineHeight: 44,
    marginTop: 4,
  },
  totalNote: {
    fontFamily: FontFamily.interRegular,
    fontSize: 10,
    color: DOC.muted,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // ── Footer
  docFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  footerLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: 10,
    color: DOC.sectionLabel,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  colorChips: {
    flexDirection: 'row',
    gap: 6,
  },
  colorChip: {
    height: 4,
    width: 28,
    borderRadius: 2,
  },
});
