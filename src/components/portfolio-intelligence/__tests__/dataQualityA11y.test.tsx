// Accessibility contract for the data-quality warning banner and the locked
// switch UI. A blocked state has to be announced to screen readers and every
// control in it has to be reachable and operable from the keyboard alone.

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import DataQualityPanel from "../DataQualityPanel";
import TaxSwitchPanel from "../TaxSwitchPanel";
import { buildDataQualityReport } from "@/lib/pi/dataQuality";
import { buildSwitchPlan, computeHoldingTaxes } from "@/lib/pi/tax";
import { FIXED_NOW, funds, profile } from "@/lib/pi/__tests__/fixtures";

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});
afterAll(() => vi.useRealTimers());
afterEach(() => cleanup());

const codedFunds = funds.map((f, i) => ({ ...f, schemeCode: String(100001 + i) }));

const cleanReport = buildDataQualityReport({
  funds: codedFunds,
  annualIncome: profile.annualIncome,
  nav: {
    requestedCodes: codedFunds.map((f) => f.schemeCode),
    unavailable: [],
    oldestFetchedAt: FIXED_NOW.toISOString(),
    error: null,
  },
  now: FIXED_NOW,
});

const blockedReport = buildDataQualityReport({
  funds: funds.map((f, i) => (i === 1 ? { ...f, purchaseDate: "" } : f)),
  annualIncome: 0,
  nav: { requestedCodes: ["100001"], unavailable: ["100001"], oldestFetchedAt: null, error: null },
  now: FIXED_NOW,
});

const holdings = computeHoldingTaxes(funds, { annualIncome: profile.annualIncome });
const switchPlan = buildSwitchPlan(
  funds,
  [{ fundId: "f2", reason: "Small cap sleeve is above the risk band", amount: 300000 }],
  { annualIncome: profile.annualIncome },
);

describe("DataQualityPanel accessibility", () => {
  it("exposes the panel as a labelled region", () => {
    render(<DataQualityPanel report={blockedReport} />);
    const region = screen.getByRole("region", { name: /data quality & switch readiness/i });
    expect(region).toBeTruthy();
  });

  it("announces the blocked state through an assertive alert", () => {
    render(<DataQualityPanel report={blockedReport} />);
    const alert = screen.getByRole("alert");
    expect(alert.getAttribute("aria-live")).toBe("assertive");
    expect(alert.textContent).toMatch(/blocked/i);
  });

  it("announces the unlocked state politely, not as an alert", () => {
    render(<DataQualityPanel report={cleanReport} />);
    expect(screen.queryByRole("alert")).toBeNull();
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toMatch(/unlocked/i);
  });

  it("renders blockers as a labelled list with one item per requirement", () => {
    render(<DataQualityPanel report={blockedReport} />);
    const list = screen.getByRole("list", { name: /blocking data requirements/i });
    expect(list.querySelectorAll("li").length).toBe(blockedReport.blockers.length);
  });

  it("gives every blocker and warning a remediation step in text, not colour alone", () => {
    render(<DataQualityPanel report={blockedReport} />);
    [...blockedReport.blockers, ...blockedReport.warnings].forEach((issue) => {
      expect(screen.getByText(`Fix: ${issue.fix}`)).toBeTruthy();
    });
  });

  it("names the icon-only-risk refresh control and keeps it keyboard operable", () => {
    const onRefreshNav = vi.fn();
    render(<DataQualityPanel report={blockedReport} onRefreshNav={onRefreshNav} />);
    const button = screen.getByRole("button", { name: /refresh nav data/i });

    // Reachable: a real <button>, in the tab order, not tabIndex-hacked.
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("tabindex")).toBeNull();

    button.focus();
    expect(document.activeElement).toBe(button);

    // Operable: Enter and Space both activate a native button (click semantics).
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.click(button);
    fireEvent.keyDown(button, { key: " " });
    fireEvent.click(button);
    expect(onRefreshNav).toHaveBeenCalledTimes(2);
  });

  it("marks the refresh control busy and disabled while NAV is loading", () => {
    render(<DataQualityPanel report={blockedReport} onRefreshNav={() => {}} refreshing />);
    const button = screen.getByRole("button", { name: /refresh nav data/i });
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("hides decorative icons from assistive tech", () => {
    const { container } = render(<DataQualityPanel report={blockedReport} onRefreshNav={() => {}} />);
    container.querySelectorAll("svg").forEach((svg) => {
      expect(svg.getAttribute("aria-hidden")).not.toBeNull();
    });
  });
});

describe("Locked switch UI accessibility", () => {
  it("describes the switch panel with the lock reason when blocked", () => {
    render(<TaxSwitchPanel plan={switchPlan} holdings={holdings} quality={blockedReport} />);
    const region = screen.getByRole("region", { name: /tax-aware switch plan/i });
    const describedBy = region.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const lock = document.getElementById(describedBy as string);
    expect(lock?.getAttribute("role")).toBe("alert");
    expect(lock?.textContent).toMatch(/locked/i);
  });

  it("lists every unmet requirement inside the lock banner", () => {
    render(<TaxSwitchPanel plan={switchPlan} holdings={holdings} quality={blockedReport} />);
    const list = screen.getByRole("list", { name: /reasons switching is locked/i });
    expect(list.querySelectorAll("li").length).toBe(blockedReport.blockers.length);
  });

  it("states the blocked verdict in text on each candidate, not by colour", () => {
    render(<TaxSwitchPanel plan={switchPlan} holdings={holdings} quality={blockedReport} />);
    expect(screen.getAllByText(/switch blocked — data incomplete/i).length).toBe(switchPlan.options.length);
  });

  it("exposes no actionable switch control while blocked", () => {
    render(<TaxSwitchPanel plan={switchPlan} holdings={holdings} quality={blockedReport} />);
    expect(screen.queryAllByRole("button", { name: /switch|execute|proceed/i })).toHaveLength(0);
  });

  it("drops the lock banner and shows real verdicts once requirements are met", () => {
    render(<TaxSwitchPanel plan={switchPlan} holdings={holdings} quality={cleanReport} />);
    const region = screen.getByRole("region", { name: /tax-aware switch plan/i });
    expect(region.getAttribute("aria-describedby")).toBeNull();
    expect(screen.queryByText(/switching is locked/i)).toBeNull();
  });
});
