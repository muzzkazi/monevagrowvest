import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, RefreshCw, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const reviewItems = [
  "Your current list of funds (search + add)",
  "Monthly SIP amount for each fund",
  "Risk profile (Conservative / Moderate / Aggressive)",
  "Investment horizon in years",
  "Primary goal (optional)",
];

const trackerItems = [
  "Add the funds you own — once",
  "Set monthly SIP — once",
  "That's it. Come back anytime for NAV, performance, overlap, AMC/SEBI/manager updates and news.",
];

/**
 * Side-by-side checklist comparing inputs for Portfolio Review vs Portfolio Tracker.
 * Used as a contextual explainer on both pages.
 */
const ReviewVsTrackerChecklist = ({ active }: { active: "review" | "tracker" }) => (
  <Card>
    <CardContent className="p-5 grid md:grid-cols-2 gap-5">
      <div
        className={`rounded-lg p-4 border ${
          active === "review"
            ? "border-financial-accent/40 bg-financial-accent/5"
            : "border-border bg-background"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw className="h-4 w-4 text-financial-accent" />
          <span className="font-semibold text-sm text-foreground">Portfolio Review (One-Time) — provide each time</span>
          {active === "review" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-financial-accent text-white">YOU ARE HERE</span>
          )}
        </div>
        <ul className="space-y-2">
          {reviewItems.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        {active !== "review" && (
          <Link
            to="/portfolio-review"
            className="inline-block mt-3 text-xs font-medium text-financial-accent hover:underline"
          >
            Run a one-time review →
          </Link>
        )}
      </div>

      <div
        className={`rounded-lg p-4 border ${
          active === "tracker"
            ? "border-financial-accent/40 bg-financial-accent/5"
            : "border-border bg-background"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-financial-accent" />
          <span className="font-semibold text-sm text-foreground">Portfolio Tracker (Ongoing) — set once</span>
          {active === "tracker" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-financial-accent text-white">YOU ARE HERE</span>
          )}
        </div>
        <ul className="space-y-2">
          {trackerItems.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        {active !== "tracker" && (
          <Link
            to="/mutual-fund-tracker"
            className="inline-block mt-3 text-xs font-medium text-financial-accent hover:underline"
          >
            Open ongoing tracker →
          </Link>
        )}
      </div>
    </CardContent>
  </Card>
);

export default ReviewVsTrackerChecklist;
