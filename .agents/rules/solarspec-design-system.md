---
trigger: always_on
---

# SolarSpec Design System Rules

The complete design token reference is in /design/tokens.md.
This file contains the critical rules. Always cross-reference
tokens.md when building any screen.

## Colour system

Eight surface layers from darkest to lightest:
  #0E0E0E  surface-container-lowest  ← nav bar, input bg, deepest
  #131313  background/surface        ← main screen background
  #1C1B1B  surface-container-low     ← info cards
  #201F1F  surface-container         ← mid containers
  #2A2A2A  surface-container-high    ← PRIMARY CARDS (most cards)
  #353534  surface-container-highest ← chips, badges, stepper bg
  #3A3939  surface-bright            ← hover states only

Primary amber (action):  #F5A623 (primary-container)
Amber light (progress):  #FFC880 (primary)
Teal (energy/success):   #68DBAE (secondary)
Teal dark (badge bg):    #26A37A (secondary-container)
Blue (metric icons):     #9BD9FF (tertiary)
Primary text:            #E5E2E1 (on-surface)
Secondary text:          #D7C3AE (on-surface-variant)
Border subtle:           #524534 (outline-variant) at 10–30% opacity
Error:                   #FFB4AB

## Typography system

Font families:
  Headline: Manrope  (700 bold, 800 extrabold, 900 black)
  Body:     Inter    (400 regular, 500 medium, 600 semibold)
  Label:    Inter    (400, 500, 600, 700 bold)

Load via @expo-google-fonts/manrope and @expo-google-fonts/inter.
Apply via StyleSheet fontFamily property:
  'Manrope_700Bold', 'Manrope_800ExtraBold', 'Manrope_900Black'
  'Inter_400Regular', 'Inter_500Medium', 'Inter_600SemiBold'

Font size scale (Stitch → React Native fontSize):
  9px  → 9     tiny annotations
  10px → 10    AdMob labels, footer, reference numbers
  11px → 11    ALL section labels, field labels (0.6875rem)
  12px → 12    sub-values in metric cards, dates (text-xs)
  14px → 14    body text, descriptions (text-sm)
  18px → 18    card titles, input text (text-lg)
  20px → 20    nav title, info card values (text-xl)
  24px → 24    section headings (text-2xl)
  30px → 30    Total Load display (text-3xl)
  36px → 36    screen titles (text-4xl)
  48px → 48    total cost in proposal (text-5xl)

Typography patterns by element:
  Screen title:    Manrope 36 weight:800 letterSpacing:-0.5 color:#E5E2E1
  Section label:   Inter 11 weight:600 uppercase letterSpacing:2 color:#D7C3AE
  Card title:      Manrope 18 weight:700 color:#E5E2E1
  Metric value:    Manrope 24 weight:700 color:#F5A623
  Metric sub-val:  Inter 12 weight:500 color:#68DBAE
  Field label:     Inter 11 weight:700 uppercase letterSpacing:1.5 color:#D7C3AE
  Input text:      Inter 18 weight:500 color:#E5E2E1
  Nav title:       Manrope 20 weight:900 uppercase letterSpacing:3 color:#F5A623
  CTA button:      Manrope 18 weight:800 uppercase letterSpacing:3 color:#452B00
  Badge text:      Inter 11 weight:700 uppercase letterSpacing:1.5 color:#D7C3AE

## Gradients (always use expo-linear-gradient)

Primary CTA:    colors={['#FFC880','#F5A623']} start={x:0,y:0} end={x:0,y:1}
Summary card:   colors={['#F5A623','#FFC880']} start={x:0,y:0} end={x:1,y:1}
Ambient glow:   not replicated in RN — skip or use very subtle
                backgroundColor with low opacity tint

## Border radius

4px   ← TextInput, AdMob placeholder, small badges
8px   ← buttons, chips, icon boxes, info cards (rounded-lg)
12px  ← all primary cards (rounded-xl)
16px  ← FAB button (rounded-2xl)
24px  ← bottom sheet top corners (rounded-t-3xl)
9999  ← progress bar segments, status dots (rounded-full)

## Borders

Standard card:    borderWidth:1 borderColor:rgba(82,69,52,0.15)
Stronger:         borderWidth:1 borderColor:rgba(82,69,52,0.30)
Selected card:    borderWidth:2 borderColor:'#F5A623'
Input bottom:     borderBottomWidth:1 borderBottomColor:'#524534'
Input focus:      borderBottomWidth:2 borderBottomColor:'#FFC880'
Section accent:   borderLeftWidth:4 borderLeftColor:'#F5A623'
Info card accent: borderLeftWidth:2 borderLeftColor:rgba(245,166,35,0.30)

## Navigation header (all screens)

backgroundColor: '#0E0E0E'
height: 64
paddingHorizontal: 24
paddingVertical: 16
position: sticky (use React Navigation header or position:absolute)

Back button: MaterialCommunityIcons 'arrow-left' size:24 color:'#F5A623'
Settings icon: MaterialCommunityIcons 'cog' size:24 color:rgba(229,226,225,0.6)
SolarSpec wordmark: Manrope 20 weight:900 uppercase letterSpacing:3 color:'#F5A623'

## Progress bar (all flow screens)

6 segments in a row
Active segment: flex:1 height:6 backgroundColor:'#F5A623' borderRadius:99
Inactive segment: flex:1 height:6 backgroundColor:'#2A2A2A' borderRadius:99
Gap between segments: 8px
Row above: flexDirection:row justifyContent:space-between marginBottom:8
  Left label: Inter 11 weight:700 uppercase letterSpacing:1.5 color:'#D7C3AE'
  Right label: Inter 11 weight:700 uppercase letterSpacing:1.5 color:'#FFC880'
CRITICAL: Progress bar is always on its own row below the nav header.
Never inline with header content.

## CTA button (primary action)

Use LinearGradient from expo-linear-gradient
colors={['#FFC880','#F5A623']} start={x:0,y:0} end={x:0,y:1}
height: 56 (paddingVertical:16)
width: '100%'
borderRadius: 12
font: Manrope 18 weight:800 uppercase letterSpacing:3 color:'#452B00'
activeOpacity: 0.9
active scale: use Animated or Pressable style transform

## AdMob banner placeholder (development)

width: 320, height: 50
backgroundColor: '#353534'
borderRadius: 4
borderWidth: 1, borderColor: rgba(82,69,52,0.30)
alignSelf: 'center'
Label: Inter 10 weight:700 uppercase letterSpacing:3 color:rgba(215,195,174,0.6)

## Dark theme enforcement

ALL screens use backgroundColor:'#131313' or '#0F0F0F'.
Component List screen is dark. Never light/cream on any screen.
Proposal Preview screen is the ONLY screen with white content
— this is the document paper effect, intentional.
Settings screen is dark throughout. No light sections.

## Stitch design files location

HTML source:     /design/stitch-code/
Screen images:   /design/screens/
Design tokens:   /design/tokens.md

When building any screen, read the corresponding HTML file
from /design/stitch-code/ for exact implementation details.
Use tokens.md for React Native translation of all values.
Use screen images from /design/screens/ for visual confirmation.
Do not freestyle any design decision not covered by these files.
