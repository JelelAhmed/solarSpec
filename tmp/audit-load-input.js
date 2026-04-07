const fs = require('fs');
const src = fs.readFileSync('src/screens/LoadInputScreen.js', 'utf8');

const checks = [];

// 1. Background uses Colors.background
checks.push({ n: 1, pass: src.includes('Colors.background'), msg: 'background uses Colors.background' });

// 2. Primary cards (#2A2A2A) — total card uses surfaceContainerHigh
checks.push({ n: 2, pass: src.includes('Colors.surfaceContainerHigh'), msg: 'total load card uses surfaceContainerHigh' });

// 3. Appliance cards use surfaceContainerLow
checks.push({ n: 3, pass: src.includes('Colors.surfaceContainerLow'), msg: 'appliance cards use surfaceContainerLow' });

// 4. Nav uses surfaceContainerLowest
checks.push({ n: 4, pass: src.includes('Colors.surfaceContainerLowest'), msg: 'nav bar uses surfaceContainerLowest' });

// 5. Amber referenced for total load value + FAB
checks.push({ n: 5, pass: src.includes('Colors.primaryContainer') && src.includes('Colors.primary'), msg: 'amber colours referenced' });

// 6. Teal (secondary) referenced for daily Wh and energy result
checks.push({ n: 6, pass: src.includes('Colors.secondary'), msg: 'teal (secondary) referenced for Wh values' });

// 8. Primary text uses onSurface
checks.push({ n: 8, pass: src.includes('Colors.onSurface'), msg: 'primary text uses onSurface' });

// 9. No raw hardcoded hex
const hexMatches = src.match(/#[0-9A-Fa-f]{6}/g) || [];
const riskHex = hexMatches.filter(h => {
  const idx = src.indexOf(h);
  const before = src.slice(Math.max(0, idx - 8), idx);
  return !before.includes('rgba(') && !before.includes("'rgba") && !before.includes('"rgba');
});
checks.push({ n: 9, pass: riskHex.length === 0, msg: 'no raw hardcoded hex values', detail: riskHex.slice(0, 3).join(', ') });

// 13. CTA uses ManropeExtraBold uppercase letterSpacing 3
checks.push({ n: 13, pass: src.includes('manropeExtraBold') && src.includes('letterSpacing: 3'), msg: 'CTA uses ManropeExtraBold + letterSpacing 3' });

// 14. No system fonts
checks.push({ n: 14, pass: !src.match(/fontFamily.*system/i), msg: 'no system default fonts' });

// 15. No bottom tab bar
checks.push({ n: 15, pass: !src.includes('TabNavigator') && !src.includes('tabBar'), msg: 'no bottom tab bar' });

// 16. Progress bar has label row above, on its own row
checks.push({ n: 16, pass: src.includes('progressRow') && src.includes('ProgressBar'), msg: 'ProgressBar present with label row above' });

// 17. ProgressBar step 3
checks.push({ n: 17, pass: src.includes('currentStep={3}'), msg: 'ProgressBar uses currentStep={3}' });

// 19. LinearGradient for CTA and FAB
checks.push({ n: 19, pass: src.includes('LinearGradient') && src.includes('Gradients.cta.colors'), msg: 'LinearGradient used for CTA and FAB' });

// 20. CTA has sufficient height (paddingVertical Spacing.lg on gradient row)
checks.push({ n: 20, pass: src.includes('ctaGradient') || src.includes('Spacing.xl') || src.includes('paddingVertical'), msg: 'CTA has sufficient height' });

// 21. SafeAreaView used
checks.push({ n: 21, pass: src.includes('SafeAreaView'), msg: 'SafeAreaView used' });

// 29. AdMob banner present on LoadInput
checks.push({ n: 29, pass: src.includes('AdBanner'), msg: 'AdMob banner present on LoadInput' });

// 32. useCallback for event handlers
checks.push({ n: 32, pass: src.includes('useCallback'), msg: 'useCallback used for event handlers' });

// 33. FlatList used (not ScrollView + map)
checks.push({ n: 33, pass: src.includes('FlatList'), msg: 'FlatList used for appliance list (rule 33)' });

// BottomSheet used
checks.push({ n: 90, pass: src.includes('BottomSheet'), msg: '@gorhom/bottom-sheet used for Add Appliance' });

// Slider used from @react-native-community
checks.push({ n: 91, pass: src.includes("from '@react-native-community/slider'"), msg: '@react-native-community/slider used for duration' });

// FAB uses position:absolute
checks.push({ n: 92, pass: src.includes("position: 'absolute'") || src.includes('position:absolute'), msg: 'FAB uses position:absolute' });

// Stepper min 40x40px from Dimensions.stepperSize
checks.push({ n: 93, pass: src.includes('Dimensions.stepperSize'), msg: 'stepper buttons use Dimensions.stepperSize (40px min)' });

// useSafeAreaInsets for fixed elements
checks.push({ n: 94, pass: src.includes('useSafeAreaInsets'), msg: 'useSafeAreaInsets used for bottom elements' });

// Bottom sheet background #0E0E0E with borderRadius 24
checks.push({ n: 95, pass: src.includes('sheetBackground') && src.includes('borderTopLeftRadius: 24') && src.includes('borderTopRightRadius: 24'), msg: 'bottom sheet has dark bg + borderRadius 24' });

// Bottom sheet handle 48w 4h surfaceContainerHighest
checks.push({ n: 96, pass: src.includes('sheetHandle') && src.includes('width: 48') && src.includes('height: 4'), msg: 'bottom sheet handle: 48×4 rect' });

const passed = checks.filter(c => c.pass).length;
const failed = checks.filter(c => !c.pass);

console.log('LoadInputScreen — Design Consistency Audit');
console.log('==========================================');
checks.forEach(c => {
  console.log((c.pass ? '✓' : '✗') + ' [' + c.n + '] ' + c.msg + (c.detail ? ' → FOUND: ' + c.detail : ''));
});
console.log('');
console.log(passed + '/' + checks.length + ' checks passed');
if (failed.length) {
  console.log('FAILED rules:', failed.map(c => c.n).join(', '));
  process.exit(1);
} else {
  console.log('ALL CHECKS PASSED ✓');
}
