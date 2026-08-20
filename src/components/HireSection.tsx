import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { submitHireRequest } from "@/lib/site.functions";
import { MagneticButton } from "@/components/motion/MagneticButton";

export function HireSection() {
  const send = useServerFn(submitHireRequest);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      await send({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          company: String(fd.get("company") ?? ""),
          budget: String(fd.get("budget") ?? ""),
          timeline: String(fd.get("timeline") ?? ""),
          details: String(fd.get("details") ?? ""),
        },
      });
      toast.success("REQUEST LOGGED — project brief received.");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="hire" className="mx-auto max-w-6xl px-5 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
        // hire protocol
      </p>
      <h2 className="mt-2 font-display text-3xl text-gradient sm:text-4xl">START A PROJECT</h2>
      <div className="mt-3 h-px w-24 rule-brand" />

      <form onSubmit={onSubmit} className="holo-panel mt-8 grid gap-4 p-6 sm:grid-cols-2">
        <input name="name" required minLength={2} placeholder="NAME" className="xt-input" />
        <input name="email" required type="email" placeholder="EMAIL" className="xt-input" />
        <input name="company" placeholder="COMPANY (OPTIONAL)" className="xt-input" />
        <input name="budget" placeholder="BUDGET RANGE" className="xt-input" />
        <input name="timeline" placeholder="TIMELINE" className="xt-input sm:col-span-2" />
        <textarea
          name="details"
          required
          minLength={10}
          rows={5}
          placeholder="PROJECT DETAILS"
          className="xt-input sm:col-span-2"
        />
        <MagneticButton
          type="submit"
          disabled={busy}
          className="btn-brand sm:col-span-2 disabled:opacity-60"
        >
          {busy ? "SENDING..." : "SEND BRIEF"}
        </MagneticButton>
      </form>
    </section>
  );
}
