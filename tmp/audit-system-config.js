const fs = require('fs');
const src = fs.readFileSync('src/screens/SystemConfigScreen.js', 'utf8');

const checks = [];

// 1. Background uses Colors.background
checks.push({ n: 1, pass: src.includes('Colors.background'), msg: 'background uses Colors.background' });

// 2. Primary cards (#2A2A2A) — selected inverter cards use surfaceContainerHigh
checks.push({ n: 2, pass: src.includes('Colors.surfaceContainerHigh'), msg: 'selected cards use surfaceContainerHigh (#2A2A2A)' });

// 3. Unselected cards use surfaceContainerLow (#1C1B1B)
checks.push({ n: 3, pass: src.includes('Colors.surfaceContainerLow'), msg: 'unselected cards use surfaceContainerLow (#1C1B1B)' });

// 4. Nav header uses surfaceContainerLowest
checks.push({ n: 4, pass: src.includes('Colors.surfaceContainerLowest'), msg: 'nav bar uses surfaceContainerLowest' });

// 5. Amber primary colours referenced
checks.push({ n: 5, pass: src.includes('Colors.primaryContainer') || src.includes('Colors.primary'), msg: 'amber colour referenced' });

// 8. Primary text
checks.push({ n: 8, pass: src.includes('Colors.onSurface'), msg: 'primary text uses onSurface' });

// 9. No raw hardcoded hex
const hexMatches = src.match(/#[0-9A-Fa-f]{6}/g) || [];
const riskHex = hexMatches.filter(h => {
  const idx = src.indexOf(h);
  const before = src.slice(Math.max(0, idx - 8), idx);
  return !before.includes('rgba(') && !before.includes("'rgba") && !before.includes('"rgba');
});
checks.push({ n: 9, pass: riskHex.length === 0, msg: 'no raw hardcoded hex values', detail: riskHex.slice(0, 3).join(', ') });

// 10. Screen title Manrope ExtraBold 36
checks.push({ n: 10, pass: src.includes('manropeExtraBold') && src.includes('FontSize.display'), msg: 'screen title uses ManropeExtraBold + FontSize.display' });

// 13. CTA uses ManropeExtraBold uppercase
checks.push({ n: 13, pass: src.includes('manropeExtraBold') && src.includes('letterSpacing: 3'), msg: 'CTA uses ManropeExtraBold + letterSpacing 3' });

// 14. No system fonts
checks.push({ n: 14, pass: !src.match(/fontFamily.*system/i), msg: 'no system default fonts' });

// 15. No bottom tab bar
checks.push({ n: 15, pass: !src.includes('TabNavigator') && !src.includes('tabBar'), msg: 'no bottom tab bar' });

// 16. Progress bar has label row above it
checks.push({ n: 16, pass: src.includes('progressRow') && src.includes('ProgressBar'), msg: 'ProgressBar present with label row above' });

// 17. ProgressBar component with step 2
checks.push({ n: 17, pass: src.includes('currentStep={2}'), msg: 'ProgressBar uses currentStep={2} (2 segments amber)' });

// 19. LinearGradient for CTA
checks.push({ n: 19, pass: src.includes('LinearGradient') && src.includes('Gradients.cta'), msg: 'CTA uses LinearGradient with Gradients.cta' });

// 20. CTA height sufficient
checks.push({ n: 20, pass: src.includes('Spacing.xl') || src.includes('paddingVertical: 20') || src.includes('height: 56'), msg: 'CTA has sufficient height' });

// 21. SafeAreaView used
checks.push({ n: 21, pass: src.includes('SafeAreaView'), msg: 'SafeAreaView used' });

// 23. NO engineering preview card / filler image (check for specific element names, not the word)
checks.push({ n: 23, pass: !src.includes('EngineeringPreview') && !src.includes('engineeringCard')
  && !src.includes('filler-image') && !src.includes('FillerImage'), msg: 'no engineering preview component used (rule 23)' });

// 30. No AdMob on SystemConfig
checks.push({ n: 30, pass: !src.includes('AdBanner'), msg: 'no AdMob banner on SystemConfig (correct)' });

// 32. useCallback for handlers
checks.push({ n: 32, pass: src.includes('useCallback'), msg: 'useCallback used for event handlers' });

// Selected inverter card has amber 2px border
checks.push({ n: 98, pass: src.includes('borderColor: Colors.primaryContainer') && src.includes('borderWidth: 2'), msg: 'selected card has 2px amber border' });

// Selected inverter card has amber check circle
checks.push({ n: 97, pass: src.includes('check-circle'), msg: 'check-circle icon used for selected state' });

// Chemistry chip selected uses amber fill
checks.push({ n: 96, pass: src.includes('chemistryChipSelected') && src.includes('Colors.primaryContainer'), msg: 'selected chemistry chip uses amber fill' });

// Voltage chips in a row (flexDirection row)
checks.push({ n: 95, pass: src.includes('voltageRow'), msg: 'voltage chips in a row layout' });

const passed = checks.filter(c => c.pass).length;
const failed = checks.filter(c => !c.pass);

console.log('SystemConfigScreen — Design Consistency Audit');
console.log('==============================================');
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
