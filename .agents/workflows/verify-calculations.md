---
description: Run and verify all calculation engine tests
---

1. Run all unit tests in /src/utils/calculations.test.js
2. Confirm all pass for all four battery chemistries:
   lead-acid (DoD 50%), AGM (60%), Gel (60%), Lithium (90%)
3. Confirm all pass for 12V, 24V, and 48V system voltages
4. Confirm series and parallel configurations calculate correctly
   for both panels and batteries
5. Confirm fridge duty cycle (0.3) applied correctly
6. Confirm rounding to standard component sizes works:
   Inverter: nearest of 1000,1500,2000,3000,3500,5000,7500,10000
   Controller: nearest of 10,20,30,40,60,80,100
   MCB: nearest of 6,10,16,20,25,32,40,63,80,100
7. Confirm charge controller is zero/null for hybrid system type
8. Check System Recommendation screen renders updated values
   in correct metric cards with amber values and teal sub-values
9. Check charge controller card is hidden for hybrid system type
10. Check System Diagram receives correct wire current/voltage props
11. Check PDF proposal template reflects updated component specs
12. Report any failures with: specific formula, input values used,
    expected output, actual output received