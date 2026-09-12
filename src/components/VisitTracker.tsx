import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackVisit } from "@/lib/analytics.functions";

function sessionId(): string {
  try {
    const k = "xt_session";
    let v = sessionStorage.getItem(k);
    if (!v) {
      v = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

/** Records one visit per route view. Fire-and-forget; never blocks the UI. */
export function VisitTracker() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (path.startsWith("/dashboard") || path.startsWith("/auth")) return;
    void trackVisit({
      data: { path, sessionId: sessionId(), referrer: document.referrer || "" },
    }).catch(() => {});
  }, [path]);

  return null;
}
