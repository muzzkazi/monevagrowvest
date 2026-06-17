import { supabase } from "@/integrations/supabase/client";

export type NavClickCategory = "screener" | "calculator" | "money_management" | "ai_planning" | "other";

const SESSION_KEY = "moneva_session_id";

const getSessionId = (): string => {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
};

/**
 * Fire-and-forget click logger for header dropdown items.
 * Never blocks navigation; failures are swallowed silently.
 */
export const trackNavClick = (
  itemLabel: string,
  route: string,
  category: NavClickCategory,
  source: string = "header_dropdown"
): void => {
  try {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null;
    const sessionId = getSessionId();

    // Resolve current user (if any) without blocking the click
    supabase.auth.getUser().then(({ data }) => {
      void supabase.from("nav_click_events").insert({
        item_label: itemLabel,
        route,
        category,
        source,
        user_id: data.user?.id ?? null,
        session_id: sessionId,
        user_agent: userAgent,
      });
    }).catch(() => {
      // Silent fail — analytics must never break navigation
    });
  } catch {
    // Silent fail
  }
};
