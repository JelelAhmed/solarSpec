---
description: Generate a sample PDF proposal with dummy data
---

Dummy data to use:
  Client: "Test Client", "12 Marina Street, Lagos"
  System type: Hybrid inverter
  Battery: Lithium (LiFePO4), 48V
  Appliances:
    3× Standing Fan 60W 8hrs
    1× LED Smart TV 100W 5hrs
    6× LED Bulb 10W 6hrs
    1× Refrigerator 150W 24hrs (duty cycle 0.3)
  Business: "Solar Excellence Ltd", no logo uploaded
  Peak sun hours: 5
  Days autonomy: 1
  Inverter efficiency: 90%
  Panel derating: 80%
  Selected panel: 400W (72-cell, Voc 37V)

Steps:
1. Run full calculation engine on dummy data
2. Verify calculated values are reasonable:
   Total load should be ~700-800W
   Battery capacity should be ~5-8 kWh
   Panel array should be ~2-4 panels
3. Build proposal HTML string from /src/templates/proposal.js
4. Verify HTML string contains all required sections:
   header, proposal number, client details, system recommendation
   box, appliance table, component list, total, footer
5. Generate PDF using react-native-html-to-pdf
6. Open Proposal Preview screen with PDF file path
7. Verify white document renders on dark background
8. Verify share FAB (amber) visible bottom right
9. Verify save FAB (dark with amber border) below share FAB
10. Verify Edit button visible top right in amber
11. Test share button opens native share sheet
12. Report any broken layouts, overflow text, or missing sections