const fs = require('fs');
const src = fs.readFileSync('src/screens/SystemRecommendationScreen.js', 'utf8');

const checks = [];

checks.push({ n: 1, pass: src.includes('Colors.background'), msg: 'background uses Colors.background' });
checks.push({ n: 2, pass: src.includes('Colors.surfaceContainerHigh'), msg: 'metric cards use surfaceContainerHigh' });
checks.push({ n: 3, pass: src.includes('Colors.surfaceContainerLow'), msg: 'accordion + wiring use surfaceContainerLow' });
checks.push({ n: 4, pass: src.includes('Colors.surfaceContainerLowest'), msg: 'nav uses surfaceContainerLowest' });
checks.push({ n: 5, pass: src.includes('Colors.primaryContainer'), msg: 'amber primaryContainer referenced (metric values)' });
checks.push({ n: 6, pass: src.includes('Colors.secondary'), msg: 'teal secondary referenced (sub-values)' });
checks.push({ n: 7, pass: src.includes('Colors.tertiary'), msg: 'blue tertiary referenced for metric icons' });
checks.push({ n: 8, pass: src.includes('Colors.onSurface'), msg: 'primary text uses onSurface' });

const hexMatches = src.match(/#[0-9A-Fa-f]{6}/g) || [];
const riskHex = hexMatches.filter(h => {
  const idx = src.indexOf(h);
  const before = src.slice(Math.max(0, idx - 8), idx);
  return !before.includes('rgba(') && !before.includes("'rgba") && !before.includes('"rgba');
});
checks.push({ n: 9, pass: riskHex.length === 0, msg: 'no raw hardcoded hex values', detail: riskHex.slice(0, 3).join(', ') });

checks.push({ n: 10, pass: src.includes('manropeExtraBold') && src.includes('FontSize.display'), msg: 'screen title uses ManropeExtraBold + display(36)' });
checks.push({ n: 11, pass: src.includes('FontSize.label') && src.includes("textTransform: 'uppercase'"), msg: 'labels use FontSize.label + uppercase' });
checks.push({ n: 12, pass: src.includes('FontFamily.manropeBold') && src.includes('FontSize.xxl'), msg: 'metric values use manropeBold + xxl(24)' });
checks.push({ n: 13, pass: src.includes('manropeExtraBold') && src.includes('letterSpacing: 3'), msg: 'CTA uses manropeExtraBold + letterSpacing 3' });
checks.push({ n: 14, pass: !src.match(/fontFamily.*system/i), msg: 'no system default fonts' });
checks.push({ n: 15, pass: !src.includes('TabNavigator') && !src.includes('tabBar'), msg: 'no bottom tab bar' });
checks.push({ n: 16, pass: src.includes('progressRow') && src.includes('ProgressBar'), msg: 'ProgressBar present with label row above' });
checks.push({ n: 17, pass: src.includes('currentStep={4}'), msg: 'ProgressBar uses currentStep={4}' });
checks.push({ n: 19, pass: src.includes('LinearGradient') && src.includes('Gradients.cta'), msg: 'CTA uses LinearGradient with Gradients.cta' });
checks.push({ n: 20, pass: src.includes('paddingVertical'), msg: 'CTA has sufficient height (paddingVertical)' });
checks.push({ n: 21, pass: src.includes('SafeAreaView'), msg: 'SafeAreaView used' });
checks.push({ n: 30, pass: !src.includes('AdBanner'), msg: 'no AdMob on SystemRecommendation (correct)' });
checks.push({ n: 32, pass: src.includes('useCallback'), msg: 'useCallback used for event handlers' });
checks.push({ n: 94, pass: src.includes('useSafeAreaInsets'), msg: 'useSafeAreaInsets used for CTA bar' });

// Bento grid structure
checks.push({ n: 95, pass: src.includes('bentoGrid') && src.includes('bentoRow'), msg: '2-col bento grid layout present' });
// Solar array card is full width
checks.push({ n: 96, pass: src.includes('metricCardFull') || src.includes('fullWidth'), msg: 'solar array card spans full width' });
// Wiring pills
checks.push({ n: 97, pass: src.includes('WiringPills') && src.includes('wiringPill'), msg: 'WiringPills component present' });
// Accordion
checks.push({ n: 98, pass: src.includes('EfficiencyAccordion') && src.includes('accordion'), msg: 'Efficiency accordion present' });
// runFullSizingCalculation used
checks.push({ n: 99, pass: src.includes('runFullSizingCalculation'), msg: 'runFullSizingCalculation called (no inline calc logic)' });

const passed = checks.filter(c => c.pass).length;
const failed = checks.filter(c => !c.pass);

console.log('SystemRecommendationScreen — Design Consistency Audit');
console.log('======================================================');
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
