import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { submitContact } from "@/lib/site.functions";
import { MagneticButton } from "@/components/motion/MagneticButton";

export function ContactForm() {
  const send = useServerFn(submitContact);
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
          subject: String(fd.get("subject") ?? ""),
          message: String(fd.get("message") ?? ""),
        },
      });
      toast.success("MESSAGE TRANSMITTED — I'll reply soon.");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transmission failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="holo-panel mt-8 grid gap-4 p-6 sm:grid-cols-2">
      <input name="name" required minLength={2} placeholder="NAME" className="xt-input" />
      <input name="email" required type="email" placeholder="EMAIL" className="xt-input" />
      <input name="subject" placeholder="SUBJECT" className="xt-input sm:col-span-2" />
      <textarea
        name="message"
        required
        minLength={10}
        rows={5}
        placeholder="MESSAGE"
        className="xt-input sm:col-span-2"
      />
      <MagneticButton
        type="submit"
        disabled={busy}
        className="btn-brand sm:col-span-2 disabled:opacity-60"
      >
        {busy ? "TRANSMITTING..." : "SEND MESSAGE"}
      </MagneticButton>
    </form>
  );
}
