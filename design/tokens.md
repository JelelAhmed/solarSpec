# SolarSpec Design Tokens
# Extracted from Stitch source code — source of truth for React Native translation

---

## COLOUR SYSTEM

### Background layers (darkest to lightest)
```
background:               #131313   ← main screen background
surface:                  #131313   ← same as background
surface-dim:              #131313   ← same
surface-container-lowest: #0E0E0E   ← nav bar, deepest surfaces
surface-container-low:    #1C1B1B   ← info cards, input backgrounds
surface-container:        #201F1F   ← mid-level containers
surface-container-high:   #2A2A2A   ← primary cards, appliance cards
surface-container-highest:#353534   ← chips, badges, highest surface
surface-bright:           #3A3939   ← hover states
surface-variant:          #353534   ← same as highest
```

### Text colours
```
on-surface:               #E5E2E1   ← primary text (white-ish)
on-surface-variant:       #D7C3AE   ← secondary/muted text
on-background:            #E5E2E1   ← same as on-surface
on-primary:               #452B00   ← text on amber buttons
on-primary-container:     #644000   ← text on amber surfaces
on-secondary:             #003827   ← text on teal surfaces
on-secondary-container:   #003121
on-primary-fixed:         #291800   ← darkest text on amber
```

### Brand colours
```
primary-container:        #F5A623   ← AMBER — borders, active states, icons
primary:                  #FFC880   ← AMBER LIGHT — progress bars, step labels
primary-fixed:            #FFDDB4   ← lightest amber
primary-fixed-dim:        #FFB955   ← mid amber
surface-tint:             #FFB955   ← same

secondary:                #68DBAE   ← TEAL — energy values, success, Wh readings
secondary-container:      #26A37A   ← TEAL DARK — large kVA badge bg
secondary-fixed:          #86F8C9
secondary-fixed-dim:      #68DBAE   ← same as secondary

tertiary:                 #9BD9FF   ← BLUE — icons in metric cards, info icons
tertiary-container:       #3AC2FF
```

### Utility colours
```
outline:                  #9F8E7A   ← borders (stronger)
outline-variant:          #524534   ← borders (subtle, use /10 to /30 opacity)
error:                    #FFB4AB   ← error states
error-container:          #93000A
inverse-surface:          #E5E2E1
inverse-on-surface:       #313030
```

### Opacity modifiers used throughout
```
/5   = 5% opacity   → ambient glows
/10  = 10% opacity  → badge backgrounds, subtle tints
/15  = 15% opacity  → card borders
/20  = 20% opacity  → badge borders, icon backgrounds
/30  = 30% opacity  → dashed borders, dividers
/40  = 40% opacity  → progress bar backgrounds
/50  = 50% opacity  → AdMob text, disabled states
/60  = 60% opacity  → settings icon, muted elements
/70  = 70% opacity  → tagline text
/80  = 80% opacity  → bottom bar backdrop
```

---

## GRADIENTS

### Primary CTA button gradient
```
background: linear-gradient(180deg, #FFC880 0%, #F5A623 100%)
Direction: top (#FFC880) to bottom (#F5A623)
Used on: New Proposal button, Next Step buttons, Generate Proposal button
```

### Ambient background glow (solar-flare)
```
background: radial-gradient(circle at top right, rgba(245,166,35,0.12) 0%, transparent 70%)
Used on: Home screen main background
```

### Hero glow (subtle variant)
```
background: radial-gradient(circle at top right, rgba(245,166,35,0.08) 0%, transparent 50%)
Used on: System Sizing, Component List screens
```

### Summary card gradient (Component List total)
```
background: linear-gradient(to bottom right, #F5A623, #FFC880)
Used on: Total Estimated Cost card only
```

---

## TYPOGRAPHY

### Font families
```
Headline: Manrope  (weights: 700 bold, 800 extrabold, 900 black)
Body:     Inter    (weights: 400 regular, 500 medium, 600 semibold)
Label:    Inter    (weights: 400, 500, 600, 700 bold)
```

### Font size scale (Tailwind → React Native pt)
```
text-[9px]         → 9pt    ← legend labels, tiny annotations
text-[10px]        → 10pt   ← AdMob label, reference numbers, footer
text-[0.625rem]    → 10pt   ← same
text-[0.65rem]     → 10.4pt ← preset appliance labels
text-[0.6875rem]   → 11pt   ← ALL section labels, field labels, uppercase caps
text-xs            → 12pt   ← sub-values in metric cards, dates
text-sm            → 14pt   ← body text, descriptions, table content
text-base          → 16pt   ← standard body
text-lg            → 18pt   ← card titles, input text, component names
text-xl            → 20pt   ← nav title, kVA display in diagram info cards
text-2xl           → 24pt   ← section headings (Recent Proposals)
text-3xl           → 30pt   ← Total Load display
text-4xl           → 36pt   ← screen titles (Client Details, System Sizing)
text-5xl           → 48pt   ← total cost in proposal preview
```

### Typography patterns by element
```
Screen title:         font-headline text-4xl font-extrabold tracking-tight text-on-surface
Section label (caps): font-label text-[0.6875rem] uppercase tracking-[0.2em] text-on-surface-variant font-semibold
Card title:           font-headline font-bold text-lg text-on-surface
Metric value (large): font-headline text-2xl font-bold text-primary-container
Metric sub-value:     font-label text-xs text-secondary font-medium
Field label:          font-label text-[0.6875rem] uppercase tracking-[0.1em] text-on-surface-variant font-bold
Input text:           font-medium text-lg text-on-surface
Nav title (amber):    font-headline font-black text-xl uppercase tracking-widest text-[#f5a623]
CTA button:           font-headline font-extrabold text-lg uppercase tracking-widest text-on-primary
Progress label:       font-label text-[0.6875rem] uppercase tracking-widest
Badge/chip text:      font-label text-[0.6875rem] uppercase tracking-wider text-on-surface-variant
```

---

## SPACING

### Page layout
```
Horizontal padding:     px-6  → 24px left/right on all screens
Max content width:      max-w-2xl → 672px (mobile: full width)
Top padding (below nav): pt-8 → 32px, or pt-24 → 96px when header is fixed
Bottom padding:         pb-8 → 32px, or pb-32 → 128px when FAB present
```

### Component spacing
```
Card padding:           p-5 → 20px, or p-6 → 24px (larger cards)
Card gap in list:       space-y-4 → 16px between cards
Section margin bottom:  mb-12 → 48px between major sections
Form field gap:         gap-10 → 40px between form fields
Grid gap (metric cards):gap-4 → 16px
Chip gap:               gap-3 → 12px, gap-4 → 16px
Progress bar height:    h-1.5 → 6px
Progress bar gap:       gap-2 → 8px between segments
```

---

## BORDER RADIUS

```
DEFAULT:  4px   → rounded     ← subtle rounding, AdMob placeholder
lg:       8px   → rounded-lg  ← buttons, chips, input fields, icon boxes
xl:       12px  → rounded-xl  ← primary cards, main cards
2xl:      16px  (not in config, but rounded-2xl used for FAB)
3xl:      24px  → rounded-t-3xl ← bottom sheet top corners
full:     9999px → rounded-full ← progress bar segments, status dots
```

---

## BORDERS

```
Standard card border:   border border-outline-variant/15
Stronger border:        border border-outline-variant/30
Selected card border:   border-2 border-primary-container
Input bottom border:    border-b border-outline-variant (focus: border-primary-container)
Divider:                border-t border-outline-variant/10
Section accent:         border-l-4 border-primary (current estimation card)
Info card accent:       border-l-2 border-primary-container/30
```

---

## NAVIGATION HEADER (shared across all screens)

```
Background:   #0E0E0E (surface-container-lowest)
Height:       h-16 → 64px
Padding:      px-6 py-4
Position:     sticky top-0 z-50

Back button:
  - Icon: arrow_back (Material Symbols)
  - Colour: #F5A623 (amber)
  - Background: transparent, hover #2A2A2A
  - Size: p-2 rounded-lg, touch target ~40px

SolarSpec wordmark:
  - Font: Manrope font-black text-xl uppercase tracking-widest
  - Colour: #F5A623

Settings icon:
  - Icon: settings (Material Symbols)
  - Colour: #E5E2E1 at 60% opacity
  - Size: p-2 rounded-lg
```

---

## PROGRESS BAR (shared pattern)

```
Container:   flex gap-2 h-1.5 w-full (6 segments)
Active:      bg-primary-container rounded-full flex-1 (#F5A623)
Inactive:    bg-surface-container-high rounded-full flex-1 (#2A2A2A)
Row above:   flex justify-between items-center mb-4 (or mb-1)
  Left:      font-label text-[0.6875rem] uppercase tracking-[0.1em] text-on-surface-variant
  Right:     font-label text-[0.6875rem] uppercase tracking-[0.1em] text-primary (amber label)
Position:    Own row below navigation header. NEVER inline with header text.
```

---

## CTA BUTTON (primary action — shared pattern)

```
Background:  linear-gradient(180deg, #FFC880 0%, #F5A623 100%)
Height:      py-5 → ~56px touch target
Width:       w-full (full width)
Border radius: rounded-xl → 12px
Font:        font-headline font-extrabold text-lg uppercase tracking-widest
Text colour: text-on-primary (#452B00) or text-on-primary-fixed (#291800)
Active state: active:scale-[0.98] transition-all
Shadow:      shadow-xl shadow-primary/10
```

---

## ICON SYSTEM

```
Library: Material Symbols Outlined
Default style: font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24
Filled style:  font-variation-settings: 'FILL' 1 (used for logo, FAB icons, filled states)

Icon colours by context:
  Amber (#F5A623):    back arrow, nav icons, selected states, FAB
  Teal (#68DBAE):     secondary/energy icons in metric cards
  Tertiary (#9BD9FF): info icons, metric card icons (bolt, battery, solar, timer, sun)
  Error (#FFB4AB):    delete/trash icon, shield/safety icon
  on-surface-variant: settings, muted icons
  on-primary-container: icons inside amber backgrounds

In React Native: use @expo/vector-icons MaterialSymbols or react-native-vector-icons
```

---

## ADMOB BANNER PLACEHOLDER (development)

```
Width:        320px (fixed, centred)
Height:       50px
Background:   surface-container-highest (#353534) or surface-container-high (#2A2A2A)
Border:       border border-outline-variant/30
Border radius: rounded (4px) or rounded-sm
Label:        font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60
              "AdMob Banner" or "AdMob Banner (320x50)"
```

---

## SCREEN-SPECIFIC PATTERNS

### Home — Proposal card
```
Container:    bg-surface-container-high p-5 rounded-xl border border-outline-variant/15
Hover:        hover:bg-surface-bright transition-colors duration-300
Icon box:     w-12 h-12 bg-surface-container-lowest rounded-lg border border-outline-variant/10
Name:         font-headline font-bold text-lg text-on-surface
Location row: flex items-center gap-1.5 text-on-surface-variant text-sm
kVA badge amber: bg-primary-container/10 px-3 py-1.5 rounded-md border border-primary-container/20
kVA badge teal:  bg-secondary-container/10 px-3 py-1.5 rounded-md border border-secondary-container/20
kVA text amber:  text-primary-container font-headline font-black text-sm tracking-tighter
kVA text teal:   text-secondary font-headline font-black text-sm tracking-tighter
Divider row:  flex justify-between pt-4 border-t border-outline-variant/10
Reference:    text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60
Date:         text-xs font-medium text-on-surface-variant
```

### Client Details — Form inputs
```
Input style:  bottom-border only (no box border)
Background:   #0E0E0E (surface-container-lowest)
Border:       border-bottom: 1px solid #524534 (outline-variant)
Focus border: border-bottom: 2px solid #FFC880 (primary)
Text:         font-medium text-lg text-on-surface
Placeholder:  text-surface-variant (#353534)
Disabled:     opacity-60, cursor-not-allowed, text-on-surface-variant
```

### System Config — Selection cards
```
Unselected:   bg-surface-container-low p-6 rounded-xl border border-transparent
Selected:     bg-surface-container-high p-6 rounded-xl border-2 border-primary-container ring-1 ring-primary/20
Checkmark:    absolute top-4 right-4 text-primary (check_circle filled icon)
Selected title: text-primary (amber light)
Icon box unselected: bg-surface-container-highest
Icon box selected:   bg-primary-container/20
```

### System Config — Chemistry/Voltage chips
```
Unselected: bg-surface-container-low text-on-surface-variant py-4 px-2 rounded-lg border border-outline-variant/10
Selected:   bg-primary-container text-on-primary-container py-4 px-2 rounded-lg font-bold shadow-lg
Voltage unselected: bg-surface-container-low border border-outline-variant/15 text-on-surface-variant rounded-lg
Voltage selected:   bg-surface-container-high border-2 border-primary-container text-primary rounded-lg
```

### Load Input — Appliance card
```
Container:    bg-surface-container-low rounded-xl p-5 flex flex-col gap-6
Hover:        hover:bg-surface-container-high transition-colors
Icon box:     w-12 h-12 bg-surface-container-highest rounded-lg text-primary
Name:         font-headline font-bold text-lg text-on-surface
Wattage:      text-[0.6875rem] font-bold uppercase tracking-wider text-on-surface-variant
Stepper btn:  w-10 h-10 border border-outline-variant/30 rounded-lg
Stepper num:  text-xl font-headline font-bold
Energy box:   bg-surface-container-highest/50 rounded-lg p-3 text-right
Energy value: text-xl font-headline font-bold text-secondary
Slider:       h-1.5 bg-surface-container-highest rounded-lg accent-primary
Duration val: font-headline font-bold text-primary
```

### Load Input — Bottom sheet (Add Appliance)
```
Container:    fixed bottom-0 bg-[#0E0E0E] rounded-t-3xl border-t border-outline-variant/10
Handle:       w-12 h-1 bg-surface-variant rounded-full mx-auto mb-6
Preset icon:  w-14 h-14 bg-surface-container-high rounded-xl
Preset hover: group-hover:bg-primary-container group-hover:text-on-primary-container
Preset label: text-[0.65rem] font-bold uppercase tracking-tighter
Custom item:  border-2 border-dashed border-outline-variant/30 (hover: border-primary)
FAB:          fixed bottom-8 right-8 w-16 h-16 primary-gradient rounded-2xl
```

### System Sizing — Metric cards
```
Standard (half width):  bg-surface-container-high p-5 rounded-xl border border-outline-variant/15 min-h-[140px]
Full width (solar):     col-span-2
Icon:                   material-symbols text-tertiary (blue)
Edit pencil:            material-symbols text-on-surface-variant text-lg hover:text-primary
Label:                  font-label text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-1
Value:                  font-headline text-2xl font-bold text-primary-container (amber)
Sub-value:              font-label text-xs text-secondary font-medium (teal)
Config badge (3S2P):    bg-surface-container-lowest px-2 py-0.5 rounded text-[0.65rem] font-bold text-secondary uppercase border border-outline-variant/20
```

### System Sizing — Efficiency assumptions
```
Container:   details/summary collapsible
Summary:     flex justify-between items-center p-5 bg-surface-container-low rounded-xl
Arrow:       expand_more icon, rotates 180deg when open (group-open:rotate-180)
Fields:      progress bar style (visual) with percentage label
Update btn:  full width, border border-outline-variant/30, text-on-surface
```

### System Diagram — SVG wires
```
DC connections (amber): stroke="#f5a623" stroke-width="3" with glow filter
AC connections (teal):  stroke="#26a37a" stroke-width="3" with glow filter  
Grid bypass (dashed):   stroke-dasharray="4 4" stroke="#9f8e7a" opacity-40
Glow filter amber:      filter: drop-shadow(0 0 4px #f5a623)
Glow filter teal:       filter: drop-shadow(0 0 4px #26a37a)
Wire labels:            rect fill="#0e0e0e" rx="4", text fill=current colour
```

### System Diagram — Component buttons
```
Standard:   flex flex-col items-center gap-2 p-4 bg-surface-container-high/40 rounded-lg border border-outline-variant/5
Hover:      hover:bg-surface-container-high/80 transition-all
Inverter (hero): p-6 bg-surface-container-high border-2 border-primary-container/20 rounded-xl shadow-lg
Inverter hover: hover:border-primary-container
Label:      text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant
```

### Component List — Price input
```
Container:  relative
Symbol:     absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium "₦"
Input:      bg-surface-container-lowest border-0 border-b border-outline-variant
            focus:border-primary-container focus:ring-0 py-3 pl-8 text-sm
```

### Component List — Total card
```
Background: linear-gradient(to bottom right, #F5A623, #FFC880)
Padding:    p-8 rounded-xl
Label:      font-label text-[0.75rem] uppercase tracking-[0.2em] text-on-primary-container font-bold
Amount:     font-headline font-black text-4xl text-on-primary-fixed
```

### Proposal document (white paper)
```
Background:   #FFFFFF
Text:         #131313
Font:         Arial or system sans-serif (PDF safe)
Section label: font-label text-xs font-bold uppercase tracking-widest color: outline (#9F8E7A)
Divider:      border-[#E5E2E1]
Table header: bg-surface-container-lowest/5 (very light grey)
Table divider: divide-y divide-[#E5E2E1]
Component price: font-headline font-bold text-sm right-aligned
Total:        font-headline font-black text-4xl text-primary-container (#F5A623)
Footer bars:  h-1 w-8 (amber, teal, tertiary-container colours)
```

### Settings — Business card
```
Container:   grid md:grid-cols-12 gap-1
Info card:   md:col-span-8 bg-surface-container-high rounded-xl p-8
Logo card:   md:col-span-4 bg-surface-container-highest rounded-xl p-8 items-center justify-center
Field label: text-[0.6875rem] font-label uppercase tracking-widest text-on-surface-variant
Field value: text-lg font-medium text-on-surface py-1
Separator:   border-b border-outline-variant/15 pb-2
Logo icon:   w-20 h-20 bg-surface-container-low border border-outline-variant/20 rounded-xl
```

### Settings — About section
```
Row style:   flex justify-between items-center bg-surface-container-high p-6
Top row:     rounded-t-xl
Bottom row:  rounded-b-xl
Middle rows: no rounding
Gap between rows: gap-1 (1px gap creating separated card effect)
Version badge: bg-surface-variant px-3 py-1 rounded text-[0.6875rem] font-label text-tertiary
```

---

## REACT NATIVE TRANSLATION NOTES

### Fonts
Load via expo-font or @expo-google-fonts:
- @expo-google-fonts/manrope
- @expo-google-fonts/inter

### Icons
Use @expo/vector-icons with MaterialCommunityIcons or install
react-native-vector-icons with Material Symbols support.
Fallback: use Ionicons for approximate equivalents.

### Gradients
Use expo-linear-gradient for all gradient backgrounds.
LinearGradient component replaces CSS gradient strings.

### Shadows
React Native shadow props differ from CSS box-shadow.
Use elevation (Android) and shadow* props (iOS) together.
For ambient glow effects, use a semi-transparent View overlay
with borderRadius instead of CSS blur/glow filters.

### Bottom sheet
Use @gorhom/bottom-sheet library.
Replaces CSS translate-y bottom sheet simulation in Stitch code.

### Sliders
Use @react-native-community/slider.
Style with minimumTrackTintColor="#F5A623" maximumTrackTintColor="#353534"
thumbTintColor="#F5A623"

### Form inputs with bottom border only
TextInput with borderBottomWidth + borderBottomColor style only.
Remove all other border styles.

### SVG glow filters
React Native SVG supports filter elements but glow filters
may not render identically. Use drop shadow filter as close
approximation or skip glow for performance on older devices.

### Sticky/fixed positioning
React Native has no position:fixed. Use:
- Sticky header: position absolute or ScrollView stickyHeaderIndices
- Fixed FAB: position absolute at bottom of root View
- Fixed CTA bar: position absolute bottom:0 with safe area inset

### Safe area insets
Wrap all screens with SafeAreaView from react-native-safe-area-context.
Add paddingBottom for fixed bottom elements to respect home indicator.

### Backdrop blur
React Native has no backdrop-filter. Use a semi-opaque
View with backgroundColor rgba for the bottom CTA bar blur effect.

---

## FILE REFERENCE MAP

01-home.html          → HomeScreen.js
02-client-details.html → ClientInfoScreen.js
03-system-config.html  → SystemConfigScreen.js
04-load-input.html     → LoadInputScreen.js
05-system-sizing.html  → SystemRecommendationScreen.js
06-system-diagram.html → SystemDiagramScreen.js (layout reference only — SVG rebuilt)
07-component-list.html → ComponentListScreen.js
08-proposal-preview.html → ProposalPreviewScreen.js
09-settings.html       → SettingsScreen.js