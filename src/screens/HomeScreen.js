/**
 * HomeScreen — SolarSpec entry point.
 * Displays the SolarSpec brand header, New Proposal CTA,
 * recent proposals portfolio list, and AdMob banner.
 * Reads proposals from storage on mount.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { HOME, APP, NAV } from '../constants/strings';
import AdBanner from '../components/AdBanner';
import { loadProposals } from '../services/storage';

// ─── ICON MAP ─────────────────────────────────────────────────────────────────
// Maps stored client type to a MaterialCommunityIcons name
const CLIENT_ICON_MAP = {
  person: 'account',
  apartment: 'office-building',
  cottage: 'home',
};

// ─── PROPOSAL CARD ────────────────────────────────────────────────────────────

/**
 * Renders a single proposal card. Large kVA (≥ 10) uses teal badge,
 * smaller kVA uses amber badge — matching the Stitch design.
 * @param {{ item: object, onPress: Function }} props
 */
function ProposalCard({ item, onPress }) {
  const { clientName, location, inverterSizeVA, reference, date, clientType } = item;
  const kva = inverterSizeVA ? (inverterSizeVA / 1000).toFixed(1) : '—';
  const isLarge = inverterSizeVA >= 10000;
  const iconName = CLIENT_ICON_MAP[clientType] || 'account';

  const badgeBg = isLarge
    ? ColorAlpha.secondary10
    : ColorAlpha.primaryContainer10;
  const badgeBorder = isLarge
    ? 'rgba(38,163,122,0.20)'
    : ColorAlpha.primaryContainer20;
  const badgeTextColor = isLarge ? Colors.secondary : Colors.primaryContainer;
  const boltColor = isLarge ? Colors.secondary : Colors.primaryContainer;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.card}
    >
      {/* Top row: icon + name/location + kVA badge */}
      <View style={styles.cardTopRow}>
        <View style={styles.cardLeft}>
          {/* Client icon box */}
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name={iconName}
              size={24}
              color={Colors.primaryContainer}
            />
          </View>
          {/* Name + location */}
          <View style={styles.cardNameBlock}>
            <Text style={styles.clientName} numberOfLines={1}>
              {clientName}
            </Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={12}
                color={Colors.onSurfaceVariant}
              />
              <Text style={styles.locationText} numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>
        </View>

        {/* kVA badge */}
        <View
          style={[
            styles.kvaBadge,
            { backgroundColor: badgeBg, borderColor: badgeBorder },
          ]}
        >
          <MaterialCommunityIcons name="lightning-bolt" size={14} color={boltColor} />
          <Text style={[styles.kvaText, { color: badgeTextColor }]}>
            {kva} kVA
          </Text>
        </View>
      </View>

      {/* Bottom row: reference + date */}
      <View style={styles.cardDividerRow}>
        <Text style={styles.referenceText}>
          {HOME.proposalRefPrefix} {reference}
        </Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

function EmptyProposals() {
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="file-document-outline"
        size={40}
        color={Colors.outlineVariant}
      />
      <Text style={styles.emptyText}>{HOME.noProposals}</Text>
    </View>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────

/**
 * HomeScreen — entry point of SolarSpec.
 * @param {{ navigation: object }} props
 */
export default function HomeScreen({ navigation }) {
  const [proposals, setProposals] = useState([]);

  // Load proposals from storage on mount
  useEffect(() => {
    let mounted = true;
    async function fetchProposals() {
      try {
        const stored = await loadProposals();
        if (mounted) setProposals(stored);
      } catch (e) {
        console.error('HomeScreen fetchProposals:', e);
      }
    }
    fetchProposals();
    return () => { mounted = false; };
  }, []);

  // Refresh proposals when navigating back to Home
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const stored = await loadProposals();
        setProposals(stored);
      } catch (e) {
        console.error('HomeScreen focus refresh:', e);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const handleNewProposal = useCallback(() => {
    navigation.navigate('ClientInfo');
  }, [navigation]);

  const handleSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleProposalPress = useCallback(
    (proposal) => {
      navigation.navigate('ProposalPreview', { proposal });
    },
    [navigation]
  );

  const renderProposal = useCallback(
    ({ item }) => (
      <ProposalCard item={item} onPress={() => handleProposalPress(item)} />
    ),
    [handleProposalPress]
  );

  const keyExtractor = useCallback((item) => item.reference || item.id || String(Math.random()), []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surfaceContainerLowest} />

      {/* ── NAV HEADER ─────────────────────────────────────────────────── */}
      <View style={styles.navBar}>
        {/* Logo mark + wordmark + tagline */}
        <View style={styles.navBrand}>
          <View style={styles.logoMark}>
            <MaterialCommunityIcons
              name="solar-power"
              size={20}
              color={Colors.primaryContainer}
            />
          </View>
          <View style={styles.wordmarkBlock}>
            <Text style={styles.wordmark}>{APP.wordmark}</Text>
            <Text style={styles.tagline}>{APP.tagline}</Text>
          </View>
        </View>

        {/* Settings icon */}
        <TouchableOpacity
          onPress={handleSettings}
          style={styles.settingsBtn}
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

      {/* ── SCROLLABLE BODY ────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ambient glow — simulated via a tinted overlay at the top */}
        <View style={styles.ambientGlow} pointerEvents="none" />

        {/* ── QUICK ACTIONS ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{HOME.quickActionsLabel}</Text>

          {/* New Proposal CTA */}
          <Pressable
            onPress={handleNewProposal}
            style={({ pressed }) => pressed && styles.ctaPressed}
          >
            <LinearGradient
              colors={Gradients.cta.colors}
              start={Gradients.cta.start}
              end={Gradients.cta.end}
              style={styles.ctaButton}
            >
              {/* Left: icon box + label */}
              <View style={styles.ctaLeft}>
                <View style={styles.ctaIconBox}>
                  <MaterialCommunityIcons
                    name="plus-circle"
                    size={24}
                    color={Colors.onPrimary}
                  />
                </View>
                <Text style={styles.ctaLabel}>{HOME.newProposalBtn}</Text>
              </View>
              {/* Right: chevron */}
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={Colors.onPrimary}
              />
            </LinearGradient>
          </Pressable>
        </View>

        {/* ── RECENT PROPOSALS ───────────────────────────────────────── */}
        <View style={styles.section}>
          {/* Section header row */}
          <View style={styles.portfolioHeader}>
            <View>
              <Text style={styles.sectionLabel}>{HOME.portfolioLabel.split(' / ')[0]}</Text>
              <Text style={styles.portfolioTitle}>
                {HOME.portfolioLabel.split(' / ')[1] || 'Recent Proposals'}
              </Text>
            </View>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>{HOME.viewAll}</Text>
            </TouchableOpacity>
          </View>

          {/* Proposal list */}
          {proposals.length === 0 ? (
            <EmptyProposals />
          ) : (
            <FlatList
              data={proposals}
              renderItem={renderProposal}
              keyExtractor={keyExtractor}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.cardGap} />}
            />
          )}
        </View>

        {/* ── ADMOB BANNER ───────────────────────────────────────────── */}
        <View style={styles.adSection}>
          <AdBanner />
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
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: ColorAlpha.primaryContainer10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkBlock: {
    flexDirection: 'column',
  },
  wordmark: {
    fontFamily: FontFamily.manropeBlack,
    fontSize: FontSize.xl,
    color: Colors.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 3,
    lineHeight: 22,
  },
  tagline: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.footnote,
    color: 'rgba(215,195,174,0.70)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── SCROLL
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxxl,
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(245,166,35,0.06)',
    borderRadius: 9999,
  },

  // ── SECTION
  section: {
    marginBottom: Spacing.sectionGap,
  },
  sectionLabel: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.lg,
  },

  // ── CTA BUTTON
  ctaButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.fab,
  },
  ctaPressed: {
    transform: [{ scale: 0.98 }],
  },
  ctaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  ctaIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(69,43,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.lg,
    color: Colors.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── PORTFOLIO HEADER
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.xxl,
  },
  portfolioTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xxl,
    color: Colors.onSurface,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  viewAllText: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.body,
    color: Colors.primary,
  },

  // ── PROPOSAL CARD
  card: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(82,69,52,0.15)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    flex: 1,
    marginRight: Spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(82,69,52,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardNameBlock: {
    flex: 1,
  },
  clientName: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: Colors.onSurfaceVariant,
    flex: 1,
  },

  // kVA badge
  kvaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    flexShrink: 0,
  },
  kvaText: {
    fontFamily: FontFamily.manropeBlack,
    fontSize: FontSize.body,
    letterSpacing: -0.5,
  },

  // Bottom divider row (ref + date)
  cardDividerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(82,69,52,0.10)',
  },
  referenceText: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.footnote,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(215,195,174,0.60)',
  },
  dateText: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.caption,
    color: Colors.onSurfaceVariant,
  },

  // ── CARD GAP (FlatList separator)
  cardGap: {
    height: Spacing.cardGap,
  },

  // ── EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyText: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── ADMOB SECTION
  adSection: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
});
