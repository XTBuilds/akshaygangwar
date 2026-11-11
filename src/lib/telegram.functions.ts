import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: { rpc: Function }; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Admins only");
}

const settingsSchema = z.object({
  enabled: z.boolean(),
  welcome_enabled: z.boolean(),
  farewell_enabled: z.boolean(),
  logging_enabled: z.boolean(),
  antispam_enabled: z.boolean(),
  antiflood_enabled: z.boolean(),
  welcome_template: z.string().trim().min(1).max(500),
  farewell_template: z.string().trim().min(1).max(500),
  flood_limit: z.number().int().min(2).max(30),
  flood_window_seconds: z.number().int().min(2).max(120),
  warning_threshold: z.number().int().min(1).max(10),
  auto_mute_minutes: z.number().int().min(1).max(10080),
  rules_text: z.string().trim().min(1).max(3500),
});

export const getTelegramControlRoom = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { getTelegramDashboardData } = await import("@/lib/telegram-bot.server");
    return getTelegramDashboardData();
  });

export const saveTelegramControlSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { saveTelegramDashboardSettings } = await import("@/lib/telegram-bot.server");
    return saveTelegramDashboardSettings(data);
  });

export const addTelegramKeyword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ keyword: z.string().trim().min(2).max(100) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { addTelegramFilter } = await import("@/lib/telegram-bot.server");
    return addTelegramFilter(data.keyword);
  });

export const removeTelegramKeyword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ keyword: z.string().trim().min(2).max(100) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { deleteTelegramFilter } = await import("@/lib/telegram-bot.server");
    return deleteTelegramFilter(data.keyword);
  });

export const registerTelegramWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { setTelegramWebhook } = await import("@/lib/telegram-bot.server");
    return setTelegramWebhook();
  });