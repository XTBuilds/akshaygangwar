import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Activity, Bot, Check, Clock3, Filter, RefreshCw, Save, Shield, Users, Webhook } from "lucide-react";
import { CosmicBackdrop } from "@/components/CosmicBackdrop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  addTelegramKeyword,
  getTelegramControlRoom,
  registerTelegramWebhook,
  removeTelegramKeyword,
  saveTelegramControlSettings,
} from "@/lib/telegram.functions";

export const Route = createFileRoute("/_authenticated/telegram")({
  head: () => ({
    meta: [
      { title: "Telegram Bot Control — XT BUILDS" },
      { name: "description", content: "Private settings and activity for the XT Telegram group bot." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Telegram Bot Control — XT BUILDS" },
      { property: "og:description", content: "Private Telegram bot administration for XT BUILDS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TelegramControlRoom,
});

type ControlData = Awaited<ReturnType<typeof getTelegramControlRoom>>;
type Settings = ControlData["settings"];

const toggleFields = [
  ["enabled", "Bot enabled", "Pause group bot commands and moderation."],
  ["welcome_enabled", "Welcome messages", "Greet new group members."],
  ["farewell_enabled", "Farewell messages", "Log and announce member departures."],
  ["logging_enabled", "Activity logging", "Store administrative events and command activity."],
  ["antispam_enabled", "Anti-spam", "Remove repeated messages and apply warning thresholds."],
  ["antiflood_enabled", "Anti-flood", "Detect rapid message bursts."],
] as const;

function TelegramControlRoom() {
  const queryClient = useQueryClient();
  const load = useServerFn(getTelegramControlRoom);
  const save = useServerFn(saveTelegramControlSettings);
  const register = useServerFn(registerTelegramWebhook);
  const addFilter = useServerFn(addTelegramKeyword);
  const removeFilter = useServerFn(removeTelegramKeyword);
  const query = useQuery({ queryKey: ["telegram-control"], queryFn: () => load(), retry: 0 });
  const [form, setForm] = useState<Settings | null>(null);
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["telegram-control"] });
  const mutation = useMutation({
    mutationFn: (values: Parameters<typeof save>[0]) => save(values),
    onSuccess: async (data) => { setForm(data.settings); await refresh(); toast.success("Bot settings saved."); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save settings."),
  });
  const webhookMutation = useMutation({
    mutationFn: () => register(),
    onSuccess: async () => { await refresh(); toast.success("Telegram receiver registered."); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not register the receiver."),
  });
  const addFilterMutation = useMutation({
    mutationFn: (value: string) => addFilter({ data: { keyword: value } }),
    onSuccess: async (data) => { setForm(data.settings); setKeyword(""); await refresh(); toast.success("Keyword filter added."); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not add keyword."),
  });
  const removeFilterMutation = useMutation({
    mutationFn: (value: string) => removeFilter({ data: { keyword: value } }),
    onSuccess: async (data) => { setForm(data.settings); await refresh(); toast.success("Keyword filter removed."); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not remove keyword."),
  });

  const data = query.data;
  const values = form ?? data?.settings ?? null;
  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.logs ?? []).filter((entry) => !term || [entry.action, entry.actor_username, entry.reason, String(entry.actor_id ?? ""), String(entry.target_user_id ?? "")].some((part) => String(part ?? "").toLowerCase().includes(term)));
  }, [data?.logs, search]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm((current) => ({ ...(current ?? data?.settings), [key]: value }) as Settings);
  };

  const saveSettings = () => {
    if (!values) return;
    mutation.mutate({
      enabled: values.enabled,
      welcome_enabled: values.welcome_enabled,
      farewell_enabled: values.farewell_enabled,
      logging_enabled: values.logging_enabled,
      antispam_enabled: values.antispam_enabled,
      antiflood_enabled: values.antiflood_enabled,
      welcome_template: values.welcome_template,
      farewell_template: values.farewell_template,
      flood_limit: values.flood_limit,
      flood_window_seconds: values.flood_window_seconds,
      warning_threshold: values.warning_threshold,
      auto_mute_minutes: values.auto_mute_minutes,
      rules_text: values.rules_text,
    });
  };

  return (
    <div className="min-h-screen">
      <CosmicBackdrop />
      <main className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/dashboard" className="portal-link">← CONTROL ROOM</Link>
          <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
            <RefreshCw className={query.isFetching ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-xs uppercase text-primary">TEAM XT SUPPORT · PRIVATE ADMIN</p>
            <h1 className="mt-2 font-display text-4xl text-gradient">TELEGRAM CONTROL</h1>
            <p className="mt-2 text-sm text-muted-foreground">Group {data?.groupId ?? "…"} · owner {data?.ownerId ?? "…"}</p>
          </div>
          <Button onClick={() => webhookMutation.mutate()} disabled={webhookMutation.isPending}>
            <Webhook /> {webhookMutation.isPending ? "CONNECTING…" : "CONNECT TELEGRAM"}
          </Button>
        </div>

        {query.isLoading && <p className="mt-10 text-sm text-muted-foreground">Loading bot status…</p>}
        {query.error && <p className="mt-10 text-sm text-destructive">{query.error instanceof Error ? query.error.message : "Could not load bot control."}</p>}

        {data && values && (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="holo-panel p-5">
                <div className="flex items-center gap-2 text-primary"><Bot size={17} /><span className="font-mono text-[10px] uppercase">BOT IDENTITY</span></div>
                <p className="mt-3 font-display text-xl">{data.runtime?.me.username ? `@${data.runtime.me.username}` : "CONNECTED BOT"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{data.runtime?.me.first_name ?? "Telegram status unavailable"}</p>
              </div>
              <div className="holo-panel p-5">
                <div className="flex items-center gap-2 text-primary"><Activity size={17} /><span className="font-mono text-[10px] uppercase">RECEIVER</span></div>
                <p className="mt-3 font-display text-xl">{data.runtime?.webhook.url ? "ONLINE" : "NOT CONNECTED"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{data.runtime?.webhook.pending_update_count ?? 0} pending Telegram updates</p>
              </div>
              <div className="holo-panel p-5">
                <div className="flex items-center gap-2 text-primary"><Shield size={17} /><span className="font-mono text-[10px] uppercase">MODERATION STATE</span></div>
                <p className="mt-3 font-display text-xl">{values.enabled ? "ACTIVE" : "PAUSED"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{data.warnings.length} recent warning records</p>
              </div>
            </section>

            {data.runtime?.webhook.last_error_message && <p className="mt-4 border-l-2 border-destructive px-3 py-2 text-sm text-destructive">Telegram receiver: {data.runtime.webhook.last_error_message}</p>}

            <section className="mt-10 border-t border-foreground/10 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="font-display text-2xl">GROUP CONFIGURATION</h2><p className="mt-1 text-sm text-muted-foreground">Changes apply to the configured Telegram group.</p></div>
                <Button onClick={saveSettings} disabled={mutation.isPending}><Save /> {mutation.isPending ? "SAVING…" : "SAVE SETTINGS"}</Button>
              </div>

              <div className="mt-6 grid gap-x-10 gap-y-7 lg:grid-cols-2">
                <div className="grid gap-4">
                  {toggleFields.map(([key, title, description]) => (
                    <div key={key} className="flex items-start justify-between gap-4 border-b border-foreground/10 pb-4">
                      <div><Label htmlFor={`telegram-${key}`} className="font-medium">{title}</Label><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>
                      <Switch id={`telegram-${key}`} checked={Boolean(values[key])} onCheckedChange={(checked) => update(key, checked)} />
                    </div>
                  ))}
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2"><Label htmlFor="welcome-template">Welcome message</Label><Input id="welcome-template" value={values.welcome_template} onChange={(event) => update("welcome_template", event.target.value)} /><p className="text-xs text-muted-foreground">Use {'{name}'} and {'{username}'} where member details should appear.</p></div>
                  <div className="grid gap-2"><Label htmlFor="farewell-template">Farewell message</Label><Input id="farewell-template" value={values.farewell_template} onChange={(event) => update("farewell_template", event.target.value)} /></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2"><Label htmlFor="flood-limit">Flood count</Label><Input id="flood-limit" type="number" min={2} max={30} value={values.flood_limit} onChange={(event) => update("flood_limit", Number(event.target.value))} /></div>
                    <div className="grid gap-2"><Label htmlFor="flood-window">Window (seconds)</Label><Input id="flood-window" type="number" min={2} max={120} value={values.flood_window_seconds} onChange={(event) => update("flood_window_seconds", Number(event.target.value))} /></div>
                    <div className="grid gap-2"><Label htmlFor="warn-limit">Warnings before mute</Label><Input id="warn-limit" type="number" min={1} max={10} value={values.warning_threshold} onChange={(event) => update("warning_threshold", Number(event.target.value))} /></div>
                    <div className="grid gap-2"><Label htmlFor="mute-length">Auto-mute (minutes)</Label><Input id="mute-length" type="number" min={1} max={10080} value={values.auto_mute_minutes} onChange={(event) => update("auto_mute_minutes", Number(event.target.value))} /></div>
                  </div>
                  <div className="grid gap-2"><Label htmlFor="group-rules">Group rules</Label><Textarea id="group-rules" rows={4} value={values.rules_text} onChange={(event) => update("rules_text", event.target.value)} /></div>
                </div>
              </div>
            </section>

            <section className="mt-10 border-t border-foreground/10 pt-8">
              <div className="flex items-center gap-2"><Filter size={18} className="text-primary" /><h2 className="font-display text-2xl">KEYWORD FILTERS</h2></div>
              <form className="mt-4 flex max-w-xl gap-2" onSubmit={(event) => { event.preventDefault(); if (keyword.trim().length >= 2) addFilterMutation.mutate(keyword.trim()); }}>
                <Input aria-label="New blocked keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Add a word or phrase" maxLength={100} />
                <Button type="submit" disabled={keyword.trim().length < 2 || addFilterMutation.isPending}>Add</Button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.filters.map((item) => <div key={item.keyword} className="flex items-center gap-2 border border-foreground/15 px-3 py-1.5 font-mono text-xs"><span>{item.keyword}</span><Button variant="ghost" size="icon-sm" aria-label={`Remove ${item.keyword}`} onClick={() => removeFilterMutation.mutate(item.keyword)}><span aria-hidden="true">×</span></Button></div>)}
                {data.filters.length === 0 && <p className="text-sm text-muted-foreground">No keyword filters configured.</p>}
              </div>
            </section>

            <section className="mt-10 border-t border-foreground/10 pt-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><h2 className="font-display text-2xl">ADMIN ACTIVITY</h2><p className="mt-1 text-sm text-muted-foreground">Recent commands, moderation actions, and configuration changes.</p></div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 size={14} /> Times shown in IST</div>
              </div>
              <Input className="mt-4 max-w-sm" aria-label="Search activity logs" placeholder="Search action, member ID or reason" value={search} onChange={(event) => setSearch(event.target.value)} />
              <div className="mt-4 divide-y divide-foreground/10">
                {filteredLogs.map((entry) => <article key={entry.id} className="grid gap-1 py-3 sm:grid-cols-[180px_160px_1fr] sm:items-start">
                  <time className="font-mono text-[10px] text-muted-foreground">{new Date(entry.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</time>
                  <p className="font-mono text-xs uppercase text-primary">{entry.action}</p>
                  <p className="text-sm text-foreground">{entry.actor_username ? `@${entry.actor_username}` : entry.actor_id ? `User ${entry.actor_id}` : "System"}{entry.target_user_id ? ` → ${entry.target_user_id}` : ""}{entry.reason ? ` · ${entry.reason}` : ""}</p>
                </article>)}
                {filteredLogs.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No matching activity.</p>}
              </div>
            </section>

            <section className="mt-10 border-t border-foreground/10 pt-8">
              <div className="flex items-center gap-2"><Users size={18} className="text-primary" /><h2 className="font-display text-2xl">RECENT WARNINGS</h2></div>
              <div className="mt-4 divide-y divide-foreground/10">
                {data.warnings.map((warning) => <div key={warning.user_id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>User {warning.user_id} · {warning.warning_count} warnings</span><span className="text-muted-foreground">{warning.last_reason ?? "No reason"}</span></div>)}
                {data.warnings.length === 0 && <p className="py-5 text-sm text-muted-foreground">No warnings recorded.</p>}
              </div>
            </section>
          </>
        )}
        <div className="mt-12 flex items-center gap-2 border-t border-foreground/10 pt-5 text-xs text-muted-foreground"><Check size={14} /> Owner actions are checked again on the server.</div>
      </main>
    </div>
  );
}