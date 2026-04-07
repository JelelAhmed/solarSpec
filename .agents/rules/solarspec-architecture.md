---
trigger: always_on
---

# SolarSpec Architecture Rules

- App name is SolarSpec. Never rename or abbreviate it.
- Platform: React Native + Expo managed workflow. Never eject.
- Target: Android (Play Store) and iOS (App Store). Always build
  for both simultaneously.
- All calculation logic lives exclusively in
  /src/utils/calculations.js. No calculation logic inside
  components or screens under any circumstances.
- All constants (standard component sizes, preset appliances,
  panel library, default efficiencies, standard ratings) live
  exclusively in /src/constants/index.js.
- All AdMob unit IDs live exclusively in /src/constants/ads.js.
- All user-facing text strings live in /src/constants/strings.js.
  No hardcoded strings in components.
- AsyncStorage is only accessed through /src/services/storage.js
  wrapper. Never call AsyncStorage directly from a screen
  or component.
- Navigation: React Navigation stack only. No bottom tabs.
  No drawer. No modal stack. Stack navigation throughout.
- The SVG system diagram lives entirely in
  /src/components/SystemDiagram.js. It receives all values
  as props. Zero calculation logic inside it.
- The PDF proposal template lives in /src/templates/proposal.js
  as an HTML string builder function. It receives a data object
  and returns an HTML string.
- All colours reference /src/theme/index.js exclusively.
  No hardcoded hex values anywhere in components.
- Every calculation function must have a corresponding unit test
  in /src/utils/calculations.test.js.
- iOS and Android must be compatible at all times. Use
  Platform.select() for any platform-specific code.
- Use functional components and hooks only. No class components.
- Use async/await for all async operations. No raw promise chains.
- Handle all errors with try/catch. Never leave a promise
  unhandled.

## Required dependencies (install on scaffold)

- expo-linear-gradient — ALL gradient backgrounds
- @gorhom/bottom-sheet — Add Appliance bottom sheet
- @react-native-community/slider — duration sliders in Load Input
- react-native-safe-area-context — ALL screens use SafeAreaView
- @expo-google-fonts/manrope — headline font
- @expo-google-fonts/inter — body and label font
- @expo/vector-icons (MaterialCommunityIcons) — icon system
- react-native-svg — system diagram
- react-native-html-to-pdf — PDF generation
- react-native-google-mobile-ads — AdMob
- @react-native-async-storage/async-storage — local storage
- react-navigation/native + react-navigation/stack — navigation
- expo-image-picker — logo upload in settings

## Position and layout rules

- React Native has no position:fixed. Use position:absolute
  on fixed FABs and bottom CTA bars within the root View.
- Wrap all fixed bottom elements with useSafeAreaInsets()
  to respect home indicator on iOS.
- Wrap all screens in SafeAreaView from
  react-native-safe-area-context.
- Sticky headers: use React Navigation header or
  position:absolute with scroll offset tracking.
- No backdrop-filter in React Native. Use semi-opaque
  backgroundColor rgba for bottom bar blur effect.
  e.g. rgba(19,19,19,0.85) for the CTA bar background.

## Gradient rules

- Never use CSS gradient strings. Always use LinearGradient
  from expo-linear-gradient.
- Primary CTA gradient: colors={['#FFC880','#F5A623']}
  start={{x:0,y:0}} end={{x:0,y:1}}
- Summary card gradient: colors={['#F5A623','#FFC880']}
  start={{x:0,y:0}} end={{x:1,y:1}}

## Bottom sheet rules

- Use @gorhom/bottom-sheet for Add Appliance sheet.
- snapPoints: ['10%', '55%'] — partially visible at rest,
  full on open.
- Handle bar: View width:48 height:4 backgroundColor
  surface-variant (#353534) borderRadius:99 alignSelf:center.
- Background: #0E0E0E with borderTopLeftRadius:24
  borderTopRightRadius:24.

## Slider rules

- Use @react-native-community/slider for all duration sliders.
- minimumTrackTintColor: '#F5A623' (primary-container amber)
- maximumTrackTintColor: '#353534' (surface-container-highest)
- thumbTintColor: '#F5A623'
- style: height:6 (matches Stitch h-1.5)

## Form input rules

- All text inputs use bottom border only — no box border.
- backgroundColor: '#0E0E0E' (surface-container-lowest)
- borderBottomWidth: 1, borderBottomColor: '#524534'
- On focus: borderBottomWidth: 2, borderBottomColor: '#FFC880'
- fontSize: 18 (text-lg), fontWeight: '500'
- placeholderTextColor: '#353534' (surface-variant)
- Disabled inputs: opacity 0.6, editable={false}

## Icon rules

- Use @expo/vector-icons MaterialCommunityIcons throughout.
- Default size: 24px.
- Never let icons inherit parent font size.
- Icon colour map:
    Amber (#F5A623): back arrow, nav icons, selected states
    Teal (#68DBAE):  energy/secondary value icons
    Blue (#9BD9FF):  metric card icons (bolt, battery, solar, timer, sun)
    Error (#FFB4AB): delete/trash icon
    Muted (#D7C3AE at 60%): settings icon, inactive icons
