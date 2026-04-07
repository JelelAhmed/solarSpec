/**
 * SolarSpec AdMob Unit IDs
 * Test IDs are active during development.
 * Replace with real IDs before production release.
 * All IDs use Platform.select() for iOS vs Android targeting.
 */
import { Platform } from 'react-native';

// ─── APP IDs (configured in app.json plugins array) ──────────────────────────
// Android: ca-app-pub-3940256099942544~3347511713
// iOS:     ca-app-pub-3940256099942544~1458002511

// ─── BANNER UNIT IDs ─────────────────────────────────────────────────────────

/**
 * Banner ad unit ID for Home screen.
 * Google test ID — replace with real ID before release.
 */
export const BANNER_HOME = Platform.select({
  android: 'ca-app-pub-3940256099942544/6300978111',
  ios: 'ca-app-pub-3940256099942544/2934735716',
});

/**
 * Banner ad unit ID for Load Input screen (Step 3).
 * Google test ID — replace with real ID before release.
 */
export const BANNER_LOAD_INPUT = Platform.select({
  android: 'ca-app-pub-3940256099942544/6300978111',
  ios: 'ca-app-pub-3940256099942544/2934735716',
});

/**
 * Banner ad unit ID for Component List screen (Step 6).
 * Google test ID — replace with real ID before release.
 */
export const BANNER_COMPONENT_LIST = Platform.select({
  android: 'ca-app-pub-3940256099942544/6300978111',
  ios: 'ca-app-pub-3940256099942544/2934735716',
});

// ─── INTERSTITIAL UNIT IDs ────────────────────────────────────────────────────

/**
 * Interstitial ad unit ID triggered on Generate Proposal button.
 * Google test ID — replace with real ID before release.
 */
export const INTERSTITIAL_GENERATE_PROPOSAL = Platform.select({
  android: 'ca-app-pub-3940256099942544/1033173712',
  ios: 'ca-app-pub-3940256099942544/4411468910',
});
