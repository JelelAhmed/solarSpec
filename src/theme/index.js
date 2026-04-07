/**
 * SolarSpec Design System Tokens
 * Source of truth: /design/tokens.md
 * All colours, typography, spacing, borders, and gradients.
 * Never use hardcoded values in components — always import from here.
 */

// ─── COLOURS ─────────────────────────────────────────────────────────────────

export const Colors = {
  // Background layers (darkest → lightest)
  surfaceContainerLowest: '#0E0E0E', // nav bar, input bg, deepest
  background: '#131313',            // main screen background
  surface: '#131313',
  surfaceDim: '#131313',
  surfaceContainerLow: '#1C1B1B',   // info cards
  surfaceContainer: '#201F1F',      // mid containers
  surfaceContainerHigh: '#2A2A2A',  // PRIMARY CARDS
  surfaceContainerHighest: '#353534', // chips, badges, steppers
  surfaceBright: '#3A3939',         // hover states
  surfaceVariant: '#353534',

  // Primary amber
  primary: '#FFC880',               // amber light — progress bars, step labels
  primaryContainer: '#F5A623',      // AMBER — CTAs, active states, primary values
  primaryFixed: '#FFDDB4',
  primaryFixedDim: '#FFB955',

  // Secondary teal
  secondary: '#68DBAE',             // TEAL — energy values, success
  secondaryContainer: '#26A37A',    // TEAL DARK — large kVA badge bg
  secondaryFixed: '#86F8C9',
  secondaryFixedDim: '#68DBAE',

  // Tertiary blue
  tertiary: '#9BD9FF',              // BLUE — metric card icons, info icons
  tertiaryContainer: '#3AC2FF',

  // Text colours
  onSurface: '#E5E2E1',             // primary text
  onSurfaceVariant: '#D7C3AE',      // secondary/muted text
  onBackground: '#E5E2E1',
  onPrimary: '#452B00',             // text on amber buttons
  onPrimaryContainer: '#644000',
  onPrimaryFixed: '#291800',        // darkest text on amber
  onSecondary: '#003827',
  onSecondaryContainer: '#003121',

  // Utility colours
  outline: '#9F8E7A',               // borders (stronger)
  outlineVariant: '#524534',        // borders (subtle — use with opacity)
  error: '#FFB4AB',
  errorContainer: '#93000A',
  inverseSurface: '#E5E2E1',
  inverseOnSurface: '#313030',

  // Semantic aliases
  amber: '#F5A623',
  amberLight: '#FFC880',
  teal: '#68DBAE',
  blue: '#9BD9FF',
};

// Opacity helpers — returns rgba string from hex + alpha
export const withOpacity = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
};

// Pre-computed commonly used opacity variants
export const ColorAlpha = {
  outlineVariant10: 'rgba(82,69,52,0.10)',
  outlineVariant15: 'rgba(82,69,52,0.15)',
  outlineVariant20: 'rgba(82,69,52,0.20)',
  outlineVariant30: 'rgba(82,69,52,0.30)',
  primaryContainer10: 'rgba(245,166,35,0.10)',
  primaryContainer20: 'rgba(245,166,35,0.20)',
  primaryContainer30: 'rgba(245,166,35,0.30)',
  secondary10: 'rgba(104,219,174,0.10)',
  onSurfaceVariant60: 'rgba(215,195,174,0.60)',
  onSurfaceVariant70: 'rgba(229,226,225,0.70)',
  surfaceContainerHigh40: 'rgba(42,42,42,0.40)',
  surfaceContainerHigh80: 'rgba(42,42,42,0.80)',
  ctaBarBackground: 'rgba(19,19,19,0.85)',
};

// ─── GRADIENTS ───────────────────────────────────────────────────────────────

export const Gradients = {
  /** Primary CTA — all Next/Generate buttons. Top (#FFC880) → Bottom (#F5A623) */
  cta: {
    colors: ['#FFC880', '#F5A623'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  /** Summary/Total card — Component List total. Diagonal amber */
  summaryCard: {
    colors: ['#F5A623', '#FFC880'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────

export const FontFamily = {
  // Manrope — headlines, screen titles, card titles, CTA labels
  manropeBold: 'Manrope_700Bold',
  manropeExtraBold: 'Manrope_800ExtraBold',
  manropeBlack: 'Manrope_900Black',

  // Inter — body, labels, descriptions
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
};

export const FontSize = {
  tiny: 9,       // legend labels, tiny annotations
  footnote: 10,  // AdMob label, reference numbers, footer
  label: 11,     // ALL section labels, field labels (uppercase caps)
  caption: 12,   // sub-values in metric cards, dates
  body: 14,      // body text, descriptions, table content
  standard: 16,  // standard body
  lg: 18,        // card titles, input text, component names
  xl: 20,        // nav title, kVA display in diagram info cards
  xxl: 24,       // section headings
  xxxl: 30,      // Total Load display
  display: 36,   // screen titles
  hero: 48,      // total cost in proposal preview
};

/** Pre-composed typography styles for consistent application */
export const Typography = {
  screenTitle: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.display,
    letterSpacing: -0.5,
    color: Colors.onSurface,
  },
  navTitle: {
    fontFamily: FontFamily.manropeBlack,
    fontSize: FontSize.xl,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: Colors.primaryContainer,
  },
  sectionLabel: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.onSurfaceVariant,
  },
  fieldLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
  },
  cardTitle: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
  },
  metricValue: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xxl,
    color: Colors.primaryContainer,
  },
  metricSubValue: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.caption,
    color: Colors.secondary,
  },
  inputText: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.lg,
    color: Colors.onSurface,
  },
  ctaButton: {
    fontFamily: FontFamily.manropeExtraBold,
    fontSize: FontSize.lg,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: Colors.onPrimary,
  },
  badgeText: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
  },
  body: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.body,
    color: Colors.onSurface,
  },
  caption: {
    fontFamily: FontFamily.interMedium,
    fontSize: FontSize.caption,
    color: Colors.onSurfaceVariant,
  },
  footnote: {
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.footnote,
    color: Colors.onSurfaceVariant,
  },
  progressLabel: {
    fontFamily: FontFamily.interBold,
    fontSize: FontSize.label,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  totalLoad: {
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.xxxl,
    color: Colors.onSurface,
  },
  proposalTotal: {
    fontFamily: FontFamily.manropeBlack,
    fontSize: FontSize.hero,
    color: Colors.onPrimaryFixed,
  },
};

// ─── SPACING ─────────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
  screenH: 48,
  screenPaddingH: 24,   // horizontal padding all screens
  cardPadding: 20,      // standard card padding
  cardPaddingLg: 24,    // large card padding
  cardGap: 16,          // gap between cards in a list
  sectionGap: 48,       // gap between major sections
  formFieldGap: 40,     // gap between form fields
  chipGap: 12,          // gap between chips
  gridGap: 16,          // gap in metric card grids
  progressBarHeight: 6, // progress bar segment height
  progressBarGap: 8,    // gap between progress bar segments
};

// ─── BORDER RADIUS ───────────────────────────────────────────────────────────

export const BorderRadius = {
  xs: 4,    // TextInput, AdMob placeholder, small badges
  sm: 8,    // buttons, chips, icon boxes, info cards
  md: 12,   // all primary cards
  lg: 16,   // FAB button
  xl: 24,   // bottom sheet top corners
  full: 9999, // progress bar segments, status dots
};

// ─── BORDERS ─────────────────────────────────────────────────────────────────

export const Borders = {
  card: {
    borderWidth: 1,
    borderColor: 'rgba(82,69,52,0.15)',
  },
  cardStrong: {
    borderWidth: 1,
    borderColor: 'rgba(82,69,52,0.30)',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
  },
  inputBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  inputBottomFocus: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  sectionAccent: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryContainer,
  },
  infoCardAccent: {
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(245,166,35,0.30)',
  },
};

// ─── SHADOWS ─────────────────────────────────────────────────────────────────

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fab: {
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

// ─── COMPONENT DIMENSIONS ────────────────────────────────────────────────────

export const Dimensions = {
  navHeight: 64,
  ctaHeight: 56,
  fabSize: 64,
  fabBorderRadius: 16,
  stepperSize: 40,       // − and + button minimum touch target
  stepperHitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
  iconBoxSize: 48,
  adBannerWidth: 320,
  adBannerHeight: 50,
  progressBarHeight: 6,
  progressSegments: 6,
  bottomSheetHandleWidth: 48,
  bottomSheetHandleHeight: 4,
};
