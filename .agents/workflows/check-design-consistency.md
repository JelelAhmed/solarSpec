---
description: Audit all screens for design system consistency
---

Run this audit on every screen after building it.

## Colour checks

1. Screen background is #131313 or #0F0F0F (never pure black #000000,
   never white, never cream, never light grey)
2. Primary cards use backgroundColor '#2A2A2A' (surface-container-high)
3. Secondary cards/info areas use '#1C1B1B' (surface-container-low)
4. Nav header background is '#0E0E0E' (surface-container-lowest)
5. Primary values (kVA, Wh, kWp, hrs) are color '#F5A623' (amber)
6. Energy/secondary values (Wh, kWh readings) are color '#68DBAE' (teal)
7. Section labels are color '#D7C3AE' (on-surface-variant)
8. Primary text is color '#E5E2E1' (on-surface)
9. No hardcoded hex values in component StyleSheets
   (all colours imported from /src/theme/index.js)

## Typography checks

10. Screen titles use Manrope fontSize:36 fontWeight:'800'
11. Section labels use Inter fontSize:11 uppercase letterSpacing:2
12. Card titles use Manrope fontSize:18 fontWeight:'700'
13. CTA button text uses Manrope fontSize:18 fontWeight:'800' uppercase
14. No default system font used anywhere
    (all text has explicit fontFamily from theme)

## Layout checks

15. No bottom tab bar on any screen
16. Progress bar is on its own row below nav header
    (never overlapping or inline with header text)
17. Progress bar has exactly 6 segments
18. Active segments are '#F5A623', inactive are '#2A2A2A'
19. CTA button uses LinearGradient (not flat backgroundColor)
    colors={['#FFC880','#F5A623']}
20. CTA button height is at minimum 56px
21. All screens wrapped in SafeAreaView

## Component-specific checks

22. Component List screen: dark background (#131313 or #0F0F0F)
    Never light/cream. Total card uses amber gradient.
23. System Config screen: no Engineering Preview card or filler image
24. Client Details screen: no satellite/irradiance language in info card
25. System Sizing screen: subtitle reads "Calculated from your
    appliance load and system configuration."
26. System Diagram screen: no Export PDF button.
    Next Step is the only CTA.
27. Settings screen: no bottom tab bar, no serial number text.
28. Proposal Preview: white document on dark background.
    Share FAB amber. Save FAB dark with amber border.

## Ad placement checks

29. AdMob banner PRESENT on: Home, Load Input, Component List
30. AdMob banner ABSENT on: Client Details, System Config,
    System Sizing, System Diagram, Proposal Preview, Settings
31. Interstitial triggered ONLY on Generate Proposal button

## Performance checks

32. No inline function definitions inside render
    (use useCallback for event handlers)
33. FlatList used for appliance list (not ScrollView with map)
34. Images and base64 assets memoized where possible

Report any screen that fails any check with the specific
rule number and what was found vs what was expected.