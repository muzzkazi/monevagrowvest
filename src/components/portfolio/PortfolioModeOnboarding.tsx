import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Activity, ArrowRight } from "lucide-react";

const KEY = "moneva.portfolioMode.chosen.v1";

/**
 * Asks first-time visitors whether they want a one-time review or ongoing tracking,
 * and routes them accordingly. Shown only on /portfolio-review and /mutual-fund-tracker,
 * and only until the user makes a choice (or dismisses it).
 */
const PortfolioModeOnboarding = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const chosen = localStorage.getItem(KEY);
      if (!chosen) setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  const choose = (mode: "review" | "tracker") => {
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* ignore */
    }
    setOpen(false);
    const target = mode === "review" ? "/portfolio-review" : "/mutual-fund-tracker";
    if (location.pathname !== target) navigate(target);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">What are you here for?</DialogTitle>
          <DialogDescription>
            Pick what you need today. You can switch anytime from the header.
          </DialogDescription>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-4 mt-2">
          <button
            onClick={() => choose("review")}
            className="text-left border border-border rounded-xl p-5 hover:border-financial-accent hover:bg-financial-accent/5 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-financial-accent/10 text-financial-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="font-semibold text-foreground">One-time review</div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Paste your current funds and get an AI verdict on what to keep, reduce, exit or switch.
            </p>
            <span className="text-xs font-medium text-financial-accent inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Start Portfolio Review <ArrowRight className="h-3 w-3" />
            </span>
          </button>

          <button
            onClick={() => choose("tracker")}
            className="text-left border border-border rounded-xl p-5 hover:border-financial-accent hover:bg-financial-accent/5 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-financial-accent/10 text-financial-accent">
                <Activity className="h-5 w-5" />
              </div>
              <div className="font-semibold text-foreground">Ongoing tracking</div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Add funds once, then return anytime to see NAV, performance, overlap, manager changes and news.
            </p>
            <span className="text-xs font-medium text-financial-accent inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Open Portfolio Tracker <ArrowRight className="h-3 w-3" />
            </span>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              try { localStorage.setItem(KEY, "skipped"); } catch { /* ignore */ }
              setOpen(false);
            }}
          >
            Skip — I'll explore on my own
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioModeOnboarding;
