import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  subject: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10).max(4000),
});

const hireSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  company: z.string().trim().max(120).optional().default(""),
  budget: z.string().trim().max(60).optional().default(""),
  timeline: z.string().trim().max(60).optional().default(""),
  details: z.string().trim().min(10).max(4000),
});

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
    if (error) throw new Error(`Could not save message: ${error.message}`);
    const { notifyOwner } = await import("@/lib/notify.server");
    await notifyOwner(
      `XT contact — ${data.subject || data.name}`,
      { name: data.name, email: data.email, subject: data.subject, message: data.message },
      data.email,
    );
    return { ok: true as const };
  });

export const submitHireRequest = createServerFn({ method: "POST" })
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
    if (error) throw new Error(`Could not save request: ${error.message}`);
    return { ok: true as const };
  });
