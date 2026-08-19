import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitHire } from "@/lib/site.functions";
import { fieldClass, labelClass } from "@/components/ContactForm";

const AVAILABILITY = [
  ["Status", "OPEN FOR WORK"],
  ["Engagements", "Freelance · Contract · Collaboration"],
  ["Focus", "Frontend engineering, motion & interface systems"],
  ["Response time", "Usually within 24 hours"],
];

export function HireSection() {
  const send = useServerFn(submitHire);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("sending");
    setMessage("");
    try {
      const res = await send({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          company: String(fd.get("company") ?? ""),
          budget: String(fd.get("budget") ?? ""),
          timeline: String(fd.get("timeline") ?? ""),
          details: String(fd.get("details") ?? ""),
        },
      });
      setState("done");
      setMessage(
        res.emailed
          ? "REQUEST SENT — it's in my inbox, I'll reply shortly."
          : "REQUEST LOGGED — I'll reply shortly.",
      );
      e.currentTarget.reset();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  return (
    <section id="hire" className="mx-auto max-w-6xl px-5 py-16">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
          // availability
        </p>
        <h2 className="mt-2 font-display text-3xl text-gradient sm:text-4xl">HIRE ME</h2>
        <div className="mt-3 h-px w-24 rule-brand" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="panel space-y-5 p-6">
          <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            <span className="h-2 w-2 rounded-full bg-cyan animate-pulse-ring" /> Available now
          </p>
          {AVAILABILITY.map(([k, v]) => (
            <div key={k}>
              <p className={labelClass}>{k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{v}</p>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="panel grid gap-4 p-6 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label className={labelClass} htmlFor="h-name">
              Name
            </label>
            <input id="h-name" name="name" required maxLength={100} className={fieldClass} />
          </div>
          <div className="grid gap-1.5">
            <label className={labelClass} htmlFor="h-email">
              Email
            </label>
            <input
              id="h-email"
              name="email"
              type="email"
              required
              maxLength={255}
              className={fieldClass}
            />
          </div>
          <div className="grid gap-1.5">
            <label className={labelClass} htmlFor="h-company">
              Company
            </label>
            <input id="h-company" name="company" maxLength={150} className={fieldClass} />
          </div>
          <div className="grid gap-1.5">
            <label className={labelClass} htmlFor="h-budget">
              Budget
            </label>
            <input
              id="h-budget"
              name="budget"
              maxLength={80}
              placeholder="e.g. $1k – $3k"
              className={fieldClass}
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <label className={labelClass} htmlFor="h-timeline">
              Timeline
            </label>
            <input
              id="h-timeline"
              name="timeline"
              maxLength={80}
              placeholder="e.g. 3 weeks"
              className={fieldClass}
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <label className={labelClass} htmlFor="h-details">
              Project details
            </label>
            <textarea
              id="h-details"
              name="details"
              required
              rows={5}
              maxLength={2000}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button
              type="submit"
              disabled={state === "sending"}
              className="rounded-md border border-cyan/40 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-cyan transition-colors hover:bg-cyan/10 disabled:opacity-50"
            >
              {state === "sending" ? "Sending..." : "Send Hire Request"}
            </button>
            {message && (
              <p
                className={`font-mono text-xs ${state === "error" ? "text-destructive" : "text-cyan"}`}
                role="status"
              >
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
