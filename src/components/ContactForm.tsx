import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContact } from "@/lib/site.functions";

export const fieldClass =
  "w-full rounded-md border border-border/70 bg-background/60 px-3 py-2.5 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-cyan";

export const labelClass =
  "font-mono text-[10px] uppercase tracking-[0.25em] text-violet";

export function ContactForm() {
  const send = useServerFn(submitContact);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("sending");
    setMessage("");
    try {
      await send({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          subject: String(fd.get("subject") ?? ""),
          message: String(fd.get("message") ?? ""),
        },
      });
      setState("done");
      setMessage("TRANSMISSION RECEIVED — I'll get back to you soon.");
      e.currentTarget.reset();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel mt-8 grid gap-4 p-6 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <label className={labelClass} htmlFor="c-name">
          Name
        </label>
        <input id="c-name" name="name" required maxLength={100} className={fieldClass} />
      </div>
      <div className="grid gap-1.5">
        <label className={labelClass} htmlFor="c-email">
          Email
        </label>
        <input
          id="c-email"
          name="email"
          type="email"
          required
          maxLength={255}
          className={fieldClass}
        />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <label className={labelClass} htmlFor="c-subject">
          Subject
        </label>
        <input id="c-subject" name="subject" maxLength={150} className={fieldClass} />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <label className={labelClass} htmlFor="c-message">
          Message
        </label>
        <textarea
          id="c-message"
          name="message"
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
          {state === "sending" ? "Transmitting..." : "Send Message"}
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
  );
}
