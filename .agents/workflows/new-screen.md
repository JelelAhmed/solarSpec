---
description: Scaffold a new screen correctly with navigation
---

1. Create screen file in /src/screens/ with correct PascalCase name
2. Add to navigation stack in /src/navigation/index.js
   with correct route name from /src/constants/strings.js
3. Wire navigation params if screen receives data from prior screen
4. Wrap screen root in SafeAreaView from react-native-safe-area-context
5. Load Manrope and Inter fonts via useFonts() at top of component
6. Apply correct backgroundColor from theme (#131313 for all screens
   except Proposal Preview which uses #FFFFFF for the document)
7. Add navigation header using design system rules:
   backgroundColor '#0E0E0E', height 64, back arrow amber,
   SolarSpec wordmark amber, settings icon muted
8. Add progress bar if screen is in the 6-step flow:
   Own row below header, 6 segments, active count matches step number
9. Add AsyncStorage keys to /src/services/storage.js if screen
   persists any data
10. Add AdBanner component if screen is in the ad placement list
    (Home, Load Input, Component List only)
11. Add fixed bottom CTA button if screen has a primary action:
    Use position:absolute bottom with safe area inset padding
    LinearGradient from expo-linear-gradient
12. Test navigation to and from screen renders without errors
13. Confirm renders correctly on both iOS and Android layouts
14. Confirm no light/cream background appears anywhere