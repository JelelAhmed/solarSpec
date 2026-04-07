---
trigger: always_on
---

# SolarSpec Code Style Rules

- Destructure props at the top of every component.
- Every exported function must have a JSDoc comment describing
  what it does, its parameters, and return value.
- Name all calculation return values with units in the key name:
  batteryCapacityAh, inverterSizeVA, panelWattageW,
  controllerCurrentA etc.
- No magic numbers anywhere. Every constant must be named and
  live in /src/constants/index.js.
- Component files: PascalCase. Utility files: camelCase.
- Keep components under 200 lines. Split into subcomponents
  if exceeded.
- No inline styles longer than 3 properties. Use StyleSheet.
- All TouchableOpacity and Pressable components must have
  a minimum hitSlop of 8px on all sides for touch targets.
- Stepper buttons (− and +) minimum touch target: 40×40px.
  Use width:40 height:40 in StyleSheet.
- Never use hardcoded colour strings in component files.
  Always import from /src/theme/index.js.
- Never use hardcoded string literals visible to users.
  Always import from /src/constants/strings.js.
- StyleSheet.create() for all styles. No anonymous style objects
  passed as props except for one-off dynamic values like
  { width: calculatedValue }.
