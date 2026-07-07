Add a tenure comparison view to the Time Machine so users can see which historical investment window (10, 15, 20, or 25 years) produced the highest return.

## What we will build

1. **"Compare Tenures" mode inside InvestmentSimulation**
   - Add a toggle between the existing animated single-run and a new instant comparison view.
   - The comparison calculates the final Conservative/Moderate/Aggressive portfolio values for every available start year (2014, 2009, 2004, 1999) using the same return series and strategy multipliers already in the component.

2. **Comparison results UI**
   - A clean table or bar chart showing, for each tenure:
     - Window label (e.g. "2014–2023")
     - Final value for each strategy
     - Total return % and approximate CAGR/XIRR
   - Highlight the tenure with the best top-performing strategy and the best strategy overall.

3. **No breaking changes**
   - Keep the existing animated simulation and controls intact.
   - The comparison will be a separate, instant computation so users can flip back and forth quickly.

## Technical notes
- Reuse `allMarketEvents`, `getStrategyMultiplier`, and the existing `Portfolio` types.
- Add a helper to run the math synchronously for all four slices.
- Display results in a new card below the controls, using the existing `Card`/`recharts` patterns already used in the page.
- Update the Time Machine intro text in FinancialEducation to mention the new comparison feature if it fits naturally.