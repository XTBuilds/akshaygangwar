import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const userSchema = z.object({
  id: z.number().int().safe(),
  username: z.string().max(64).optional(),
  first_name: z.string().max(256).optional(),
  last_name: z.string().max(256).optional(),
  is_bot: z.boolean().optional(),
}).passthrough();

const messageSchema = z.object({
  message_id: z.number().int().positive().safe(),
  date: z.number().int().optional(),
  text: z.string().max(4096).optional(),
  caption: z.string().max(1024).optional(),
  from: userSchema.optional(),
  chat: z.object({ id: z.number().int().safe(), type: z.string().max(32), title: z.string().max(256).optional(), username: z.string().max(64).optional() }).passthrough(),
  reply_to_message: z.lazy(() => messageSchema).optional(),
  new_chat_members: z.array(userSchema).max(100).optional(),
  left_chat_member: userSchema.optional(),
}).passthrough();

const updateSchema = z.object({
  update_id: z.number().int().nonnegative().safe(),
  message: messageSchema.optional(),
  edited_message: messageSchema.optional(),
  callback_query: z.object({ id: z.string().min(1).max(256), from: userSchema, data: z.string().max(64).optional(), message: messageSchema.optional() }).passthrough().optional(),
  chat_member: z.object({
    chat: z.object({ id: z.number().int().safe(), type: z.string().max(32) }).passthrough(),
    from: userSchema,
    old_chat_member: z.object({ status: z.string().max(32), user: userSchema }).passthrough(),
    new_chat_member: z.object({ status: z.string().max(32), user: userSchema }).passthrough(),
  }).passthrough().optional(),
}).passthrough();

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
          return new Response("Unsupported content type", { status: 415 });
        }
        const contentLength = Number(request.headers.get("content-length") ?? 0);
        if (contentLength > 64_000) return new Response("Payload too large", { status: 413 });

        try {
          const { getTelegramWebhookSecret, handleTelegramUpdate, verifyTelegramWebhookSecret } = await import("@/lib/telegram-bot.server");
          const expected = await getTelegramWebhookSecret();
          if (!verifyTelegramWebhookSecret(request.headers.get("x-telegram-bot-api-secret-token"), expected)) {
            return new Response("Unauthorized", { status: 401 });
          }
          const raw = await request.text();
          if (raw.length > 64_000) return new Response("Payload too large", { status: 413 });
          let json: unknown;
          try { json = JSON.parse(raw); } catch { return new Response("Invalid JSON", { status: 400 }); }
          const parsed = updateSchema.safeParse(json);
          if (!parsed.success) return new Response("Invalid Telegram update", { status: 400 });
          await handleTelegramUpdate(parsed.data as Parameters<typeof handleTelegramUpdate>[0]);
          return Response.json({ ok: true });
        } catch (error) {
          console.error("Telegram update processing failed", error instanceof Error ? error.message : "unknown error");
          return new Response("Update processing failed", { status: 500 });
        }
      },
    },
  },
});