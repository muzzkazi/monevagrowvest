
For Moneva, I'd pick **Option 1: Unify both tools on `taxEngine.ts`** — but with a small twist.

## My recommendation: Option 1 (with light differentiation)

### Why
1. **Correctness is non-negotiable for a tax tool.** The standalone calculator is on FY 2023-24, New Regime only. That's actively misleading users. Fixing this is table stakes.
2. **Single source of truth.** Both surfaces should produce identical numbers for identical inputs. `taxEngine.ts` already handles slabs, 87A rebate, 4% cess, HRA, 80C/80D/NPS, home loan, capital gains, and Old vs New comparison. Duplicating that logic is a bug factory.
3. **Two entry points serve real, different intents:**
   - **Calculator tab** = "I have 60 seconds, give me a number" (income-led, instant)
   - **AI Planning wizard** = "Walk me through it and tell me what to do" (guided, 11 steps, recommendations)
   Removing the calculator (Option 2) loses the fast-path user. Keeping them separate but inconsistent (status quo) breaks trust.
4. **Option 3 (rename + banner)** doesn't fix the underlying math problem — it just labels the inconsistency.

### What I'd build

**Rewrite `src/components/Calculators.tsx` Tax Calculator tab** to:
- Import and call `computeTax()` from `src/lib/taxEngine.ts`
- Show a compact form: Income, Income Type (salaried/self-employed), 80C invested, 80D, Home loan interest, NPS
- Display **side-by-side Old vs New** result cards with: taxable income, total tax, effective rate
- Highlight the **recommended regime** with a badge + savings amount
- Show **FY 2024-25** label clearly
- Add a subtle CTA card at the bottom: *"Want HRA, capital gains, and personalized SIP suggestions? → Open full Tax Planning wizard"* linking to `/tax-planning`

This keeps the calculator fast, makes it accurate, and naturally funnels power users to the wizard without nagging.

### Files touched
- `src/components/Calculators.tsx` — rewrite the Tax Calculator tab section only
- No changes to `taxEngine.ts` or `TaxPlanningWizard.tsx`

### Out of scope
- No new routes, no schema changes, no new dependencies.
