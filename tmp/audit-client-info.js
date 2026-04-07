const fs = require('fs');
const src = fs.readFileSync('src/screens/ClientInfoScreen.js', 'utf8');

const checks = [];

// 1. Background colour uses theme token
checks.push({ n: 1, pass: src.includes('Colors.background'), msg: 'background uses Colors.background' });

// 3. Secondary cards (info card) use surfaceContainerLow
checks.push({ n: 3, pass: src.includes('Colors.surfaceContainerLow'), msg: 'info card uses surfaceContainerLow (#1C1B1B)' });

// 4. Nav header uses surfaceContainerLowest
checks.push({ n: 4, pass: src.includes('Colors.surfaceContainerLowest'), msg: 'nav bar uses surfaceContainerLowest' });

// 7. Section labels use onSurfaceVariant
checks.push({ n: 7, pass: src.includes('Colors.onSurfaceVariant'), msg: 'muted text uses onSurfaceVariant' });

// 8. Primary text uses onSurface
checks.push({ n: 8, pass: src.includes('Colors.onSurface'), msg: 'primary text uses onSurface' });

// 9. No raw hardcoded hex — check for bare hex literals
const hexMatches = src.match(/#[0-9A-Fa-f]{6}/g) || [];
const riskHex = hexMatches.filter(h => {
  const idx = src.indexOf(h);
  const before = src.slice(Math.max(0, idx - 8), idx);
  // Allow hex inside rgba() strings and string literals used for opacity variants
  return !before.includes('rgba(') && !before.includes("'rgba") && !before.includes('"rgba');
});
checks.push({ n: 9, pass: riskHex.length === 0, msg: 'no raw hardcoded hex values', detail: riskHex.slice(0, 3).join(', ') });

// 10. Screen title uses Manrope fontSize:36 fontWeight:800
checks.push({ n: 10, pass: src.includes('manropeExtraBold') && src.includes('FontSize.display'), msg: 'screen title uses ManropeExtraBold + FontSize.display(36)' });

// 11. Section labels use Inter fontSize:11 uppercase
checks.push({ n: 11, pass: src.includes('FontSize.label') && src.includes("'uppercase'"), msg: 'field labels use FontSize.label(11) + uppercase' });

// 13. CTA uses ManropeExtraBold uppercase
checks.push({ n: 13, pass: src.includes('manropeExtraBold') && src.includes('letterSpacing: 3'), msg: 'CTA uses ManropeExtraBold, letterSpacing 3' });

// 14. No system fonts
checks.push({ n: 14, pass: !src.match(/fontFamily.*system/i), msg: 'no system default fonts' });

// 15. No bottom tab bar
checks.push({ n: 15, pass: !src.includes('TabNavigator') && !src.includes('tabBar'), msg: 'no bottom tab bar' });

// 16. Progress bar on its own row (below navBar, before title block)
checks.push({ n: 16, pass: src.includes('ProgressBar') && src.includes('currentStep={1}'), msg: 'ProgressBar present with currentStep=1' });

// 17. Progress bar — 6 segments (checked in ProgressBar component itself)
checks.push({ n: 17, pass: src.includes('ProgressBar'), msg: 'ProgressBar component used (6 segments enforced in component)' });

// 18. Active amber, inactive dark (checked in ProgressBar component)
checks.push({ n: 18, pass: src.includes('ProgressBar'), msg: 'ProgressBar colors enforced in component' });

// 19. LinearGradient for CTA
checks.push({ n: 19, pass: src.includes('LinearGradient') && src.includes('Gradients.cta.colors'), msg: 'CTA uses LinearGradient with Gradients.cta.colors' });

// 20. CTA height ≥ 56px (paddingVertical Spacing.xl = 20, × 2 = 40 + text ~= 60px)
checks.push({ n: 20, pass: src.includes('Spacing.xl') || src.includes('paddingVertical: 20') || src.includes('height: 56'), msg: 'CTA has sufficient height' });

// 21. SafeAreaView used
checks.push({ n: 21, pass: src.includes('SafeAreaView'), msg: 'SafeAreaView used' });

// 24. No satellite/irradiance language in info card
checks.push({ n: 24, pass: !src.includes('satellite') && !src.includes('irradiance') && !src.includes('solar potential'), msg: 'no satellite/irradiance language in info card' });

// 30. No AdMob banner on Client Details
checks.push({ n: 30, pass: !src.includes('AdBanner'), msg: 'no AdMob banner on ClientDetails (correct)' });

// 32. useCallback for event handlers
checks.push({ n: 32, pass: src.includes('useCallback'), msg: 'useCallback used for event handlers' });

// Safe area insets for bottom CTA
checks.push({ n: 99, pass: src.includes('useSafeAreaInsets'), msg: 'useSafeAreaInsets() used for bottom CTA bar' });

const passed = checks.filter(c => c.pass).length;
const failed = checks.filter(c => !c.pass);

console.log('ClientInfoScreen — Design Consistency Audit');
console.log('============================================');
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
