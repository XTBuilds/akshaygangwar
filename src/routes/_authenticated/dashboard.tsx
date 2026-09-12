import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { CosmicBackdrop } from "@/components/CosmicBackdrop";
import { getDashboard, emailDigestNow } from "@/lib/analytics.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard — XT BUILDS" },
      { name: "description", content: "Visitor, brief and Mahiru activity for XT BUILDS." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Owner Dashboard — XT BUILDS" },
      { property: "og:description", content: "Private analytics for XT BUILDS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <h1 className="font-display text-2xl text-gradient">NO ACCESS</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      <Link to="/" className="portal-link mt-6 inline-block">
        ← Back to XT CORE
      </Link>
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
});

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-foreground/10">
      <div
        className="h-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.7)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const load = useServerFn(getDashboard);
  const digest = useServerFn(emailDigestNow);
  const [sending, setSending] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => load(),
    retry: 0,
  });

  const maxWeek = Math.max(
    1,
    ...(data?.weeks ?? []).map((w) => Math.max(w.visits, w.briefs, w.mahiru, w.contacts)),
  );

  return (
    <div className="min-h-screen">
      <CosmicBackdrop />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="portal-link">
            ← Back to XT CORE
          </Link>
          <button
            className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
          >
            Sign out
          </button>
        </div>

        <h1 className="mt-8 font-display text-4xl text-gradient">CONTROL ROOM</h1>
        <div className="mt-3 h-px w-24 rule-brand" />

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading telemetry…</p>}
        {error && (
          <p className="mt-8 text-sm text-destructive">
            {error instanceof Error ? error.message : "Could not load"}
          </p>
        )}

        {data && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              {[
                ["VISITORS", data.totals.visits],
                ["PROJECT BRIEFS", data.totals.briefs],
                ["MAHIRU MESSAGES", data.totals.mahiru],
                ["CONTACT MESSAGES", data.totals.contacts],
              ].map(([label, value]) => (
                <div key={String(label)} className="holo-panel p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-2 font-display text-3xl text-foreground">{value as number}</p>
                  <p className="mt-1 text-xs text-muted-foreground">last 8 weeks</p>
                </div>
              ))}
            </div>

            <section className="holo-panel mt-8 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl text-foreground">WEEKLY ACTIVITY</h2>
                <button
                  className="btn-brand disabled:opacity-60"
                  disabled={sending}
                  onClick={async () => {
                    setSending(true);
                    try {
                      const res = await digest();
                      toast[res.sent ? "success" : "error"](
                        res.sent ? "Report emailed to you." : `Email failed: ${res.reason}`,
                      );
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    } finally {
                      setSending(false);
                    }
                  }}
                >
                  {sending ? "SENDING..." : "EMAIL ME THIS REPORT"}
                </button>
              </div>

              <div className="mt-6 grid gap-5">
                {data.weeks.map((w) => (
                  <div key={w.weekStart}>
                    <p className="font-mono text-xs text-muted-foreground">
                      WEEK OF {w.weekStart} — {w.visits} visits · {w.briefs} briefs · {w.mahiru}{" "}
                      mahiru · {w.contacts} contacts
                    </p>
                    <div className="mt-2 grid gap-1">
                      <Bar value={w.visits} max={maxWeek} />
                      <Bar value={w.briefs} max={maxWeek} />
                      <Bar value={w.mahiru} max={maxWeek} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <section className="holo-panel p-6">
                <h2 className="font-display text-xl text-foreground">TOPICS ASKED</h2>
                <div className="mt-4 grid gap-3">
                  {data.categories.length === 0 && (
                    <p className="text-sm text-muted-foreground">No questions logged yet.</p>
                  )}
                  {data.categories.map((c) => (
                    <div key={c.category}>
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {c.category} — {c.count}
                      </p>
                      <Bar value={c.count} max={data.categories[0]?.count ?? 1} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="holo-panel p-6">
                <h2 className="font-display text-xl text-foreground">RECENT QUESTIONS</h2>
                <ul className="mt-4 grid gap-3">
                  {data.recent.length === 0 && (
                    <li className="text-sm text-muted-foreground">Nothing yet.</li>
                  )}
                  {data.recent.map((r, i) => (
                    <li key={i} className="border-b border-foreground/10 pb-2">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()} · {r.category} · {r.kind}
                      </p>
                      <p className="mt-1 text-sm text-foreground">{r.question}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
