import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DashboardData } from "@/lib/analytics.server";

const visitSchema = z.object({
  path: z.string().trim().max(300).default("/"),
  sessionId: z.string().trim().max(80).optional().default(""),
  referrer: z.string().trim().max(300).optional().default(""),
});

export const trackVisit = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => visitSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("site_visits").insert({
        path: data.path || "/",
        session_id: data.sessionId || null,
        referrer: data.referrer || null,
      });
    } catch (e) {
      console.error("visit log failed", e);
    }
    return { ok: true as const };
  });

async function assertAdmin(ctx: { supabase: { rpc: Function }; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Admins only");
}

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardData> => {
    await assertAdmin(context as never);
    const { buildDashboard } = await import("@/lib/analytics.server");
    return buildDashboard(8);
  });

export const emailDigestNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { sendWeeklyDigest } = await import("@/lib/analytics.server");
    return sendWeeklyDigest();
  });
