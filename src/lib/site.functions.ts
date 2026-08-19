import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(5, "Message too short").max(2000),
});

const hireSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().max(150).optional().default(""),
  budget: z.string().trim().max(80).optional().default(""),
  timeline: z.string().trim().max(80).optional().default(""),
  details: z.string().trim().min(5, "Tell me a bit more").max(2000),
});

async function notify(subject: string, lines: string[]) {
  const key = process.env["RESEND_API_KEY"];
  const to = process.env["CONTACT_EMAIL"];
  if (!key || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "XT Builds <onboarding@resend.dev>",
        to: [to],
        subject,
        text: lines.join("\n"),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
    });
    if (error) throw new Error("Could not save your message. Please try again.");
    const emailed = await notify(`New contact message from ${data.name}`, [
      `From: ${data.name} <${data.email}>`,
      `Subject: ${data.subject || "(none)"}`,
      "",
      data.message,
    ]);
    return { ok: true as const, emailed };
  });

export const submitHire = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => hireSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("hire_requests").insert({
      name: data.name,
      email: data.email,
      company: data.company || null,
      budget: data.budget || null,
      timeline: data.timeline || null,
      details: data.details,
    });
    if (error) throw new Error("Could not send your request. Please try again.");
    const emailed = await notify(`Hire request from ${data.name}`, [
      `From: ${data.name} <${data.email}>`,
      `Company: ${data.company || "-"}`,
      `Budget: ${data.budget || "-"}`,
      `Timeline: ${data.timeline || "-"}`,
      "",
      data.details,
    ]);
    return { ok: true as const, emailed };
  });
