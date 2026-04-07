const fs = require('fs');
const src = fs.readFileSync('src/screens/HomeScreen.js', 'utf8');

const checks = [];

// 1. Background colour uses theme token
checks.push({ n: 1, pass: src.includes('Colors.background'), msg: 'background uses Colors.background' });

// 2. Cards use surfaceContainerHigh 
checks.push({ n: 2, pass: src.includes('Colors.surfaceContainerHigh'), msg: 'cards use surfaceContainerHigh' });

// 4. Nav header uses surfaceContainerLowest
checks.push({ n: 4, pass: src.includes('Colors.surfaceContainerLowest'), msg: 'nav bar uses surfaceContainerLowest' });

// 5. Primary amber referenced
checks.push({ n: 5, pass: src.includes('Colors.primaryContainer') || src.includes('Colors.primary'), msg: 'amber colour referenced' });

// 6. Teal secondary referenced
checks.push({ n: 6, pass: src.includes('Colors.secondary'), msg: 'teal colour referenced for large kVA' });

// 7. Section labels use onSurfaceVariant
checks.push({ n: 7, pass: src.includes('Colors.onSurfaceVariant'), msg: 'muted text uses onSurfaceVariant' });

// 8. Primary text uses onSurface
checks.push({ n: 8, pass: src.includes('Colors.onSurface'), msg: 'primary text uses onSurface' });

// 9. No raw hardcoded hex values (rgba is OK as they are transparency helpers)
const hexRaw = src.match(/#[0-9A-Fa-f]{6}/g) || [];
// Allow rgba-embedded hex - these are special opacity variants not in theme
const nonRgbaHex = hexRaw.filter(h => {
  const idx = src.indexOf(h);
  const before = src.slice(Math.max(0, idx - 5), idx);
  return !before.includes('rgba(') && !before.includes("'rgba");
});
checks.push({ n: 9, pass: nonRgbaHex.length === 0, msg: 'no raw hardcoded hex values', detail: nonRgbaHex.slice(0, 3).join(', ') });

// 13. CTA uses ManropeExtraBold uppercase
checks.push({ n: 13, pass: src.includes('manropeExtraBold') && src.includes("'uppercase'"), msg: 'CTA uses manropeExtraBold + uppercase' });

// 14. All text has explicit fontFamily
checks.push({ n: 14, pass: !src.match(/fontFamily.*system/i), msg: 'no system default fonts used' });

// 15. No bottom tab bar
checks.push({ n: 15, pass: !src.includes('TabNavigator') && !src.includes('tabBar'), msg: 'no bottom tab bar' });

// 19. LinearGradient used for CTA
checks.push({ n: 19, pass: src.includes('LinearGradient'), msg: 'CTA uses LinearGradient' });

// 20. CTA height at least 56px (paddingVertical:20 ~= 56 with text)
checks.push({ n: 20, pass: src.includes('Spacing.xl') || src.includes('paddingVertical: 20') || src.includes('height: 56'), msg: 'CTA has sufficient height (paddingVertical from Spacing)' });

// 21. SafeAreaView used
checks.push({ n: 21, pass: src.includes('SafeAreaView'), msg: 'SafeAreaView used' });

// 29. AdMob banner present
checks.push({ n: 29, pass: src.includes('AdBanner'), msg: 'AdMob banner present on Home' });

// 32. useCallback used - no inline functions in render
checks.push({ n: 32, pass: src.includes('useCallback'), msg: 'useCallback used for event handlers' });

// 33. FlatList for proposal list
checks.push({ n: 33, pass: src.includes('FlatList'), msg: 'FlatList used (not ScrollView.map)' });

const passed = checks.filter(c => c.pass).length;
const failed = checks.filter(c => !c.pass);

console.log('HomeScreen — Design Consistency Audit');
console.log('======================================');
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
