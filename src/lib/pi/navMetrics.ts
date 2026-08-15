// Deterministic risk/return metrics computed from real NAV history.
// Every metric returns null when the NAV window is too short — nothing here is
// ever estimated, back-filled or assumed.

export interface NavPoint {
  date: string; // ISO yyyy-mm-dd
  nav: number;
}

export interface NavSeries {
  schemeCode: string;
  schemeName: string | null;
  fundHouse: string | null;
  category: string | null;
  source: string;
  fetchedAt: string;
  latestNav: number | null;
  latestNavDate: string | null;
  history: NavPoint[]; // ascending by date
}

export interface NavMetrics {
  schemeCode: string;
  asOfNavDate: string | null;
  fetchedAt: string;
  observations: number;
  return1yPct: number | null;
  return3yCagrPct: number | null;
  return5yCagrPct: number | null;
  annualisedVolPct: number | null;
  maxDrawdownPct: number | null;
  sharpe: number | null;
  sortino: number | null;
  worst1yPct: number | null;
  best1yPct: number | null;
  unavailable: string[]; // metric names that need a longer NAV window
}

const RISK_FREE_PCT = 6.5;

const sortAsc = (h: NavPoint[]) => [...h].sort((a, b) => a.date.localeCompare(b.date));

/** NAV at or immediately before the target date; null when the series starts later. */
const navOnOrBefore = (history: NavPoint[], target: Date): NavPoint | null => {
  const iso = target.toISOString().slice(0, 10);
  let found: NavPoint | null = null;
  for (const p of history) {
    if (p.date <= iso) found = p;
    else break;
  }
  return found;
};

const yearsAgo = (from: Date, years: number) => {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() - years);
  return d;
};

const cagr = (start: number, end: number, years: number) =>
  start > 0 && years > 0 ? +(((Math.pow(end / start, 1 / years) - 1) * 100).toFixed(2)) : null;

export const computeNavMetrics = (series: NavSeries): NavMetrics => {
  const history = sortAsc(series.history).filter((p) => Number.isFinite(p.nav) && p.nav > 0);
  const unavailable: string[] = [];
  const last = history[history.length - 1];

  const base: NavMetrics = {
    schemeCode: series.schemeCode,
    asOfNavDate: last?.date ?? null,
    fetchedAt: series.fetchedAt,
    observations: history.length,
    return1yPct: null,
    return3yCagrPct: null,
    return5yCagrPct: null,
    annualisedVolPct: null,
    maxDrawdownPct: null,
    sharpe: null,
    sortino: null,
    worst1yPct: null,
    best1yPct: null,
    unavailable,
  };

  if (!last || history.length < 30) {
    unavailable.push("All metrics — NAV history too short (need at least ~30 observations).");
    return base;
  }

  const end = new Date(last.date);

  const windowReturn = (years: number) => {
    const startPoint = navOnOrBefore(history, yearsAgo(end, years));
    if (!startPoint) return null;
    const spanYears =
      (new Date(last.date).getTime() - new Date(startPoint.date).getTime()) / (365.25 * 24 * 3600 * 1000);
    if (spanYears < years * 0.9) return null;
    return years === 1
      ? +(((last.nav / startPoint.nav - 1) * 100).toFixed(2))
      : cagr(startPoint.nav, last.nav, spanYears);
  };

  base.return1yPct = windowReturn(1);
  base.return3yCagrPct = windowReturn(3);
  base.return5yCagrPct = windowReturn(5);
  if (base.return1yPct === null) unavailable.push("1-year return");
  if (base.return3yCagrPct === null) unavailable.push("3-year CAGR");
  if (base.return5yCagrPct === null) unavailable.push("5-year CAGR");

  // Daily log-ish returns from the available series.
  const rets: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const r = history[i].nav / history[i - 1].nav - 1;
    if (Number.isFinite(r)) rets.push(r);
  }

  if (rets.length >= 60) {
    const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
    const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1);
    const perPeriod = Math.sqrt(variance);
    // Periods per year inferred from the actual observation spacing.
    const spanYears =
      (new Date(last.date).getTime() - new Date(history[0].date).getTime()) / (365.25 * 24 * 3600 * 1000);
    const periodsPerYear = spanYears > 0 ? rets.length / spanYears : 252;
    const vol = perPeriod * Math.sqrt(periodsPerYear) * 100;
    base.annualisedVolPct = +vol.toFixed(2);

    const annReturn = base.return3yCagrPct ?? base.return1yPct;
    if (annReturn !== null && vol > 0) {
      base.sharpe = +(((annReturn - RISK_FREE_PCT) / vol).toFixed(2));
      const downside = rets.filter((r) => r < 0);
      if (downside.length >= 20) {
        const dVar = downside.reduce((a, b) => a + b ** 2, 0) / downside.length;
        const dVol = Math.sqrt(dVar) * Math.sqrt(periodsPerYear) * 100;
        base.sortino = dVol > 0 ? +(((annReturn - RISK_FREE_PCT) / dVol).toFixed(2)) : null;
      } else {
        unavailable.push("Sortino ratio");
      }
    } else {
      unavailable.push("Sharpe ratio");
      unavailable.push("Sortino ratio");
    }

    let peak = history[0].nav;
    let maxDd = 0;
    history.forEach((p) => {
      peak = Math.max(peak, p.nav);
      maxDd = Math.min(maxDd, p.nav / peak - 1);
    });
    base.maxDrawdownPct = +(maxDd * 100).toFixed(2);
  } else {
    unavailable.push("Volatility, drawdown, Sharpe and Sortino");
  }

  // Rolling 1-year windows — worst and best, from real data only.
  const rolling: number[] = [];
  for (let i = 0; i < history.length; i++) {
    const startDate = new Date(history[i].date);
    const target = new Date(startDate);
    target.setFullYear(target.getFullYear() + 1);
    const later = history.find((p) => p.date >= target.toISOString().slice(0, 10));
    if (later) rolling.push((later.nav / history[i].nav - 1) * 100);
  }
  if (rolling.length >= 12) {
    base.worst1yPct = +Math.min(...rolling).toFixed(2);
    base.best1yPct = +Math.max(...rolling).toFixed(2);
  } else {
    unavailable.push("Rolling 1-year range");
  }

  return base;
};

/** XIRR for a dated cashflow set (negative = invested, positive = value). */
export const xirr = (flows: Array<{ date: string; amount: number }>): number | null => {
  if (flows.length < 2) return null;
  const sorted = [...flows].sort((a, b) => a.date.localeCompare(b.date));
  const t0 = new Date(sorted[0].date).getTime();
  if (!sorted.some((f) => f.amount < 0) || !sorted.some((f) => f.amount > 0)) return null;

  const npv = (rate: number) =>
    sorted.reduce((acc, f) => {
      const years = (new Date(f.date).getTime() - t0) / (365.25 * 24 * 3600 * 1000);
      return acc + f.amount / Math.pow(1 + rate, years);
    }, 0);

  let lo = -0.9;
  let hi = 5;
  if (npv(lo) * npv(hi) > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid;
    else hi = mid;
  }
  return +(((lo + hi) / 2) * 100).toFixed(2);
};

export const isStale = (fetchedAt: string, maxAgeHours = 24) =>
  Date.now() - new Date(fetchedAt).getTime() > maxAgeHours * 3600 * 1000;

export const freshnessLabel = (fetchedAt: string | null) => {
  if (!fetchedAt) return "No NAV data fetched";
  const mins = Math.round((Date.now() - new Date(fetchedAt).getTime()) / 60000);
  if (mins < 60) return `NAV data refreshed ${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `NAV data refreshed ${hrs} hr ago`;
  return `NAV data refreshed ${Math.round(hrs / 24)} days ago`;
};
