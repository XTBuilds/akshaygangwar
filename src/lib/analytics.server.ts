/** Server-only analytics helpers: categorisation, logging and the weekly digest. */

export type LogCategory =
  | "projects"
  | "github"
  | "hiring"
  | "skills"
  | "contact"
  | "about"
  | "site"
  | "other";

const RULES: Array<[LogCategory, RegExp]> = [
  ["hiring", /\b(hire|hiring|freelance|available|rate|rates|budget|cost|price|quote|contract|job|work with)\b/i],
  ["contact", /\b(contact|email|reach|call|message|dm|telegram|whatsapp|instagram)\b/i],
  ["github", /\b(github|repo|repos|repository|commit|star|stars|fork|open source|readme)\b/i],
  ["projects", /\b(project|projects|portfolio|case study|lab|build|builds|app|website you)\b/i],
  ["skills", /\b(skill|skills|stack|tech|technology|language|react|typescript|python|framework|tool)\b/i],
  ["about", /\b(who|about|bio|experience|background|study|age|location|based)\b/i],
  ["site", /\b(this site|the site|navigate|page|menu|cursor|animation|theme|how did you build)\b/i],
];

export function categorise(text: string): LogCategory {
  for (const [cat, re] of RULES) if (re.test(text)) return cat;
  return "other";
}

export async function logMahiruQuestion(input: {
  question: string;
  sessionId?: string | null;
  page?: string | null;
  kind?: "question" | "message";
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("mahiru_logs").insert({
      question: input.question.slice(0, 2000),
      category: categorise(input.question),
      kind: input.kind ?? "question",
      session_id: input.sessionId ?? null,
      page: input.page ?? null,
    });
  } catch (e) {
    console.error("mahiru log failed", e);
  }
}

export type WeekBucket = {
  weekStart: string;
  visits: number;
  briefs: number;
  mahiru: number;
  contacts: number;
};

export type DashboardData = {
  totals: { visits: number; briefs: number; mahiru: number; contacts: number };
  weeks: WeekBucket[];
  categories: Array<{ category: string; count: number }>;
  recent: Array<{ created_at: string; category: string; kind: string; question: string }>;
};

function weekStart(d: Date): string {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (x.getUTCDay() + 6) % 7; // Monday = 0
  x.setUTCDate(x.getUTCDate() - day);
  return x.toISOString().slice(0, 10);
}

export async function buildDashboard(weeks = 8): Promise<DashboardData> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const since = new Date(Date.now() - weeks * 7 * 24 * 3600 * 1000).toISOString();

  const [visits, briefs, mahiru, contacts] = await Promise.all([
    supabaseAdmin.from("site_visits").select("created_at").gte("created_at", since),
    supabaseAdmin.from("hire_requests").select("created_at").gte("created_at", since),
    supabaseAdmin
      .from("mahiru_logs")
      .select("created_at, category, kind, question")
      .gte("created_at", since),
    supabaseAdmin.from("contact_messages").select("created_at").gte("created_at", since),
  ]);

  const buckets = new Map<string, WeekBucket>();
  for (let i = weeks - 1; i >= 0; i--) {
    const key = weekStart(new Date(Date.now() - i * 7 * 24 * 3600 * 1000));
    buckets.set(key, { weekStart: key, visits: 0, briefs: 0, mahiru: 0, contacts: 0 });
  }
  const add = (rows: Array<{ created_at: string }> | null, field: keyof WeekBucket) => {
    for (const r of rows ?? []) {
      const b = buckets.get(weekStart(new Date(r.created_at)));
      if (b && field !== "weekStart") b[field] += 1;
    }
  };
  add(visits.data, "visits");
  add(briefs.data, "briefs");
  add(mahiru.data, "mahiru");
  add(contacts.data, "contacts");

  const counts = new Map<string, number>();
  for (const r of mahiru.data ?? []) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);

  const recent = [...(mahiru.data ?? [])]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 25);

  return {
    totals: {
      visits: visits.data?.length ?? 0,
      briefs: briefs.data?.length ?? 0,
      mahiru: mahiru.data?.length ?? 0,
      contacts: contacts.data?.length ?? 0,
    },
    weeks: [...buckets.values()],
    categories: [...counts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
    recent,
  };
}

/** Emails the owner a summary of the most recent week. */
export async function sendWeeklyDigest(): Promise<{ sent: boolean; reason?: string }> {
  const data = await buildDashboard(2);
  const last = data.weeks[data.weeks.length - 1];
  const prev = data.weeks[data.weeks.length - 2];
  const delta = (a: number, b?: number) => (b === undefined ? "" : ` (prev ${b})`);
  const topics = data.categories
    .slice(0, 6)
    .map((c) => `${c.category}: ${c.count}`)
    .join("\n");

  const { notifyOwner } = await import("@/lib/notify.server");
  return notifyOwner(`XT weekly report — week of ${last?.weekStart ?? "now"}`, {
    visitors: `${last?.visits ?? 0}${delta(last?.visits ?? 0, prev?.visits)}`,
    "project briefs": `${last?.briefs ?? 0}${delta(last?.briefs ?? 0, prev?.briefs)}`,
    "mahiru messages": `${last?.mahiru ?? 0}${delta(last?.mahiru ?? 0, prev?.mahiru)}`,
    "contact messages": `${last?.contacts ?? 0}${delta(last?.contacts ?? 0, prev?.contacts)}`,
    "top topics": topics || "no questions yet",
    "recent questions": data.recent
      .slice(0, 10)
      .map((r) => `- [${r.category}] ${r.question.slice(0, 160)}`)
      .join("\n"),
  });
}
