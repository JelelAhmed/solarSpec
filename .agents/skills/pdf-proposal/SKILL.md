---
name: pdf-proposal
description: Use when building or modifying the PDF proposal
template, the export flow, or the proposal preview screen.
---

## Output format

The proposal is an HTML string passed to react-native-html-to-pdf.
It renders as a white A4 document.
Font: Arial or sans-serif only (PDF-safe fonts only).

## Document sections (in order)

1. Header row
   Left: amber icon box + "SOLARSPEC" wordmark black uppercase
         + "Technical Solar Solutions" muted label below
   Right: "PROPOSAL #SS-YYYY-NNN" bold + date below
   Bottom: thin divider line #E5E2E1

2. Client Details section
   Label: "CLIENT DETAILS" — muted uppercase small
   Client name: bold large
   Address: muted, two lines

3. System Recommendation highlight box
   Border: 1px solid #F5A623
   borderRadius: 8px
   Background: very light amber tint rgba(245,166,35,0.05)
   Content: system size bold amber (e.g. "7.5kW Hybrid Solar System")
            one-line description in muted text below

4. Appliance Table
   Label: "APPLIANCE TABLE & LOAD ANALYSIS"
   Table columns: Item | Qty | Watts | Daily Usage
   Header row: light grey background #F5F5F5 bold uppercase small
   Row dividers: 1px solid #E5E2E1
   Each row: item name bold, other cells regular

5. System Components section
   Label: "SYSTEM COMPONENTS"
   Each row: component name bold + spec subtitle muted
             price right-aligned bold (omit entire row if blank)
   Row divider: 1px solid #E5E2E1 at 50% opacity

6. Total
   Top border: 2px solid #131313
   "TOTAL SYSTEM INVESTMENT" label: muted uppercase small right-aligned
   Amount: Manrope/bold large amber #F5A623 right-aligned
   Note below: italic muted small (warranty note if applicable)

7. Footer
   Left: "Generated with SolarSpec" — muted uppercase tiny
   Right: three colour bars (h:4 w:32 each):
          amber #F5A623 | teal #26A37A | blue #3AC2FF
   Top border: 1px solid #E5E2E1

## Proposal number format

Auto-increment from AsyncStorage.
Format: SS-YYYY-NNN (e.g. SS-2024-001)
Year from current date. Number increments per proposal.

## Logo handling

If technician has uploaded a logo:
  Convert to base64 string on load from AsyncStorage
  Render as: <img src="data:image/[type];base64,[data]"
              style="height:48px;width:auto;" />

If no logo:
  Render amber solar_power icon placeholder as SVG inline

## Export flow (critical sequence)

1. User taps "Generate Proposal" on Component List screen
2. Check AdMob interstitial is loaded
3. Show interstitial ad — await completion or dismissal
4. Begin PDF generation from proposal HTML string
5. Save PDF to device cache directory
6. Navigate to Proposal Preview screen passing PDF file path
7. Proposal Preview renders the PDF via WebView or Image

## Proposal Preview screen

White document (article element) on dark screen background.
Back arrow top left (amber).
"Edit" text button top right (amber) — navigates back to Component List.
Two FAB buttons fixed bottom right:
  Share FAB: backgroundColor '#FFC880' color '#452B00'
             icon: share (filled) size:24
             height:56 width:56 borderRadius:12
  PDF/Save FAB: backgroundColor '#2A2A2A' borderColor '#F5A623' borderWidth:1
               icon: picture_as_pdf size:24 color '#F5A623'
               height:56 width:56 borderRadius:12
  Gap between FABs: 16px

Share button triggers: React Native Share.share() with PDF file path
Save button triggers: copy PDF to Downloads folder using expo-file-system