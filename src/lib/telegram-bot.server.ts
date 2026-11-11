import type { Database } from "@/integrations/supabase/types";
import { classifyTelegramCommand, isTelegramCommandAllowed } from "@/lib/telegram-access";

type TelegramUser = { id: number; username?: string; first_name?: string; last_name?: string; is_bot?: boolean };
type TelegramChat = { id: number; type: string; title?: string; username?: string };
type TelegramMessage = {
  message_id: number;
  date?: number;
  text?: string;
  caption?: string;
  from?: TelegramUser;
  chat: TelegramChat;
  reply_to_message?: TelegramMessage;
  new_chat_members?: TelegramUser[];
  left_chat_member?: TelegramUser;
};
type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  callback_query?: { id: string; from: TelegramUser; data?: string; message?: TelegramMessage };
  chat_member?: { chat: TelegramChat; from: TelegramUser; old_chat_member: { status: string; user: TelegramUser }; new_chat_member: { status: string; user: TelegramUser } };
};
type BotSettings = Database["public"]["Tables"]["telegram_group_settings"]["Row"];

const HTML_ESCAPE = /[&<>]/g;

function ownerId() {
  const id = Number(process.env["TELEGRAM_OWNER_ID"]);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Telegram owner is not configured");
  return id;
}

function groupId() {
  const id = Number(process.env["TELEGRAM_GROUP_ID"]);
  if (!Number.isSafeInteger(id) || id >= 0) throw new Error("Telegram group is not configured");
  return id;
}

function webhookSecret() {
  const secret = process.env["TELEGRAM_WEBHOOK_SECRET"];
  if (!secret) throw new Error("Telegram receiver is not configured");
  return secret;
}

function apiCredentials() {
  const key = process.env["TELEGRAM_API_KEY"];
  const gatewayKey = process.env["LOVABLE_API_KEY"];
  if (!key || !gatewayKey) throw new Error("Telegram connection is not available");
  return { key, gatewayKey };
}

export function verifyTelegramWebhookSecret(actual: string | null, expected = webhookSecret()) {
  if (actual === null) return false;
  const maxLength = Math.max(actual.length, expected.length);
  let difference = actual.length ^ expected.length;
  for (let index = 0; index < maxLength; index++) {
    difference |= (actual.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  }
  return difference === 0;
}

async function telegramApi<T = Record<string, unknown>>(method: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { key, gatewayKey } = apiCredentials();
  const response = await fetch(`https://connector-gateway.lovable.dev/telegram/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${gatewayKey}`,
      "X-Connection-Api-Key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const details = (await response.text()).slice(0, 1000);
    console.error(`Telegram request failed [${response.status}]: ${details}`);
    throw new Error(`Telegram request failed (${response.status})`);
  }
  const data = (await response.json()) as { ok?: boolean; result?: T; description?: string };
  if (!data.ok) throw new Error(data.description || "Telegram rejected the request");
  return data.result as T;
}

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function ensureSettings(chatId = groupId()): Promise<BotSettings> {
  const db = await adminClient();
  const { data, error } = await db.from("telegram_group_settings").upsert({ chat_id: chatId }, { onConflict: "chat_id", ignoreDuplicates: true }).select("*").maybeSingle();
  if (error) throw new Error("Could not load group settings");
  if (data) return data;
  const existing = await db.from("telegram_group_settings").select("*").eq("chat_id", chatId).single();
  if (existing.error || !existing.data) throw new Error("Could not load group settings");
  return existing.data;
}

async function audit(input: {
  chatId: number;
  action: string;
  actor?: TelegramUser;
  targetId?: number | null;
  reason?: string | null;
  details?: Record<string, unknown>;
}) {
  const db = await adminClient();
  const { error } = await db.from("telegram_audit_logs").insert({
    chat_id: input.chatId,
    actor_id: input.actor?.id ?? null,
    actor_username: input.actor?.username ?? null,
    action: input.action,
    target_user_id: input.targetId ?? null,
    reason: input.reason?.slice(0, 1000) ?? null,
    details: input.details ?? {},
  });
  if (error) console.error("Telegram audit logging failed");
}

async function send(chatId: number, text: string, extra: Record<string, unknown> = {}) {
  return telegramApi("sendMessage", { chat_id: chatId, text: text.slice(0, 4000), ...extra });
}

async function answerCallback(id: string, text = "Saved") {
  try { await telegramApi("answerCallbackQuery", { callback_query_id: id, text }); } catch { /* UI acknowledgement is best-effort. */ }
}

async function isGroupAdmin(chatId: number, userId: number) {
  try {
    const member = await telegramApi<{ status?: string }>("getChatMember", { chat_id: chatId, user_id: userId });
    return member.status === "creator" || member.status === "administrator";
  } catch {
    return false;
  }
}

function userName(user: TelegramUser) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || String(user.id);
}

function keyboard(settings: BotSettings) {
  const line = (label: string, key: keyof BotSettings, value: boolean) => ({ text: `${value ? "ON" : "OFF"} · ${label}`, callback_data: `toggle:${String(key)}` });
  return { inline_keyboard: [
    [line("Bot", "enabled", settings.enabled), line("Welcome", "welcome_enabled", settings.welcome_enabled)],
    [line("Farewell", "farewell_enabled", settings.farewell_enabled), line("Logging", "logging_enabled", settings.logging_enabled)],
    [line("Anti-spam", "antispam_enabled", settings.antispam_enabled), line("Anti-flood", "antiflood_enabled", settings.antiflood_enabled)],
    [{ text: "View group rules", callback_data: "view:rules" }],
  ] };
}

const HELP_TEXT = [
  "XT GROUP CONTROL",
  "Public: /start /help /ping /info /status /id /rules /owner",
  "Moderators: /ban /unban /kick /mute /unmute /warn /warnings /resetwarns /purge /promote /demote /lock /unlock /logs",
  "Owner only: /settings /antispam /antiflood /filter /setrules /broadcast",
  "Reply to a member's message for moderation, or provide their numeric user ID.",
].join("\n");

async function updateSettings(chatId: number, patch: Partial<BotSettings>, actor?: TelegramUser) {
  const db = await adminClient();
  const { error } = await db.from("telegram_group_settings").upsert({ chat_id: chatId, ...patch, updated_by: actor?.id ?? ownerId(), updated_at: new Date().toISOString() });
  if (error) throw new Error("Could not save bot settings");
}

async function writeWarning(chatId: number, targetId: number, actor: TelegramUser, reason: string, settings: BotSettings) {
  const db = await adminClient();
  const current = await db.from("telegram_warnings").select("warning_count").eq("chat_id", chatId).eq("user_id", targetId).maybeSingle();
  const count = (current.data?.warning_count ?? 0) + 1;
  const { error } = await db.from("telegram_warnings").upsert({ chat_id: chatId, user_id: targetId, warning_count: count, last_reason: reason.slice(0, 1000), updated_at: new Date().toISOString() });
  if (error) throw new Error("Could not save warning");
  await audit({ chatId, action: "warn", actor, targetId, reason, details: { warning_count: count } });
  if (count >= settings.warning_threshold) {
    await telegramApi("restrictChatMember", {
      chat_id: chatId, user_id: targetId,
      permissions: { can_send_messages: false, can_send_audios: false, can_send_documents: false, can_send_photos: false, can_send_videos: false, can_send_video_notes: false, can_send_voice_notes: false, can_send_polls: false, can_send_other_messages: false, can_add_web_page_previews: false },
      until_date: Math.floor(Date.now() / 1000) + settings.auto_mute_minutes * 60,
    });
    await audit({ chatId, action: "auto_mute", actor, targetId, reason: "Warning threshold reached", details: { warning_count: count, minutes: settings.auto_mute_minutes } });
    return { count, muted: true };
  }
  return { count, muted: false };
}

function targetUser(message: TelegramMessage, args: string[]) {
  const replyUser = message.reply_to_message?.from;
  const idString = replyUser ? String(replyUser.id) : args.shift();
  if (!idString || !/^\d{1,20}$/.test(idString)) return null;
  const id = Number(idString);
  return Number.isSafeInteger(id) && id > 0 ? { id, user: replyUser } : null;
}

async function processMemberText(message: TelegramMessage, settings: BotSettings) {
  const actor = message.from;
  const content = (message.text ?? message.caption ?? "").trim();
  if (!actor || actor.is_bot || !content || message.chat.id !== groupId()) return;
  const admin = await isGroupAdmin(message.chat.id, actor.id);
  if (admin) return;
  const db = await adminClient();
  const filters = await db.from("telegram_keyword_filters").select("keyword").eq("chat_id", message.chat.id);
  const matched = filters.data?.find((entry) => content.toLowerCase().includes(entry.keyword.toLowerCase()));
  if (matched) {
    await telegramApi("deleteMessage", { chat_id: message.chat.id, message_id: message.message_id });
    await audit({ chatId: message.chat.id, action: "filter_delete", actor, reason: `Matched filter: ${matched.keyword}`, details: { message_id: message.message_id } });
    return;
  }
  if (!settings.antispam_enabled && !settings.antiflood_enabled) return;
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content.toLowerCase().replace(/\s+/g, " ")));
  const hash = Array.from(new Uint8Array(hashBuffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const windowStart = new Date(Date.now() - settings.flood_window_seconds * 1000).toISOString();
  const recent = await db.from("telegram_message_activity").select("message_hash").eq("chat_id", message.chat.id).eq("user_id", actor.id).gte("created_at", windowStart).order("created_at", { ascending: false }).limit(30);
  const sameText = recent.data?.filter((entry) => entry.message_hash === hash).length ?? 0;
  const isFlood = settings.antiflood_enabled && (recent.data?.length ?? 0) >= settings.flood_limit;
  const isRepeat = settings.antispam_enabled && sameText >= 2;
  await db.from("telegram_message_activity").insert({ chat_id: message.chat.id, user_id: actor.id, message_hash: hash });
  if (!isFlood && !isRepeat) return;
  await telegramApi("deleteMessage", { chat_id: message.chat.id, message_id: message.message_id });
  const result = await writeWarning(message.chat.id, actor.id, actor, isFlood ? "Message flood" : "Repeated message", settings);
  await send(message.chat.id, result.muted ? `Spam removed. Member muted after warning ${result.count}.` : `Spam removed. Warning ${result.count}/${settings.warning_threshold}.`);
}

async function processCommand(message: TelegramMessage, settings: BotSettings) {
  const actor = message.from;
  const text = message.text ?? "";
  if (!actor || !text.startsWith("/")) return;
  const [rawCommand, ...args] = text.trim().split(/\s+/);
  const command = rawCommand?.slice(1).split("@")[0]?.toLowerCase() ?? "";
  const chatId = message.chat.id;
  const actorIsOwner = actor.id === ownerId();
  const actorIsAdmin = chatId === groupId() && await isGroupAdmin(chatId, actor.id);
  if (!isTelegramCommandAllowed({ command, actorId: actor.id, ownerId: ownerId(), groupAdmin: actorIsAdmin })) {
    await send(chatId, "This command is limited to the configured bot owner or group administrators.");
    await audit({ chatId, action: "command_denied", actor, details: { command } });
    return;
  }
  await audit({ chatId, action: "command", actor, details: { command } });
  const reply = message.reply_to_message;
  const target = targetUser(message, args);
  const reason = args.join(" ").slice(0, 500) || "No reason given";

  try {
    switch (command) {
      case "start": await send(chatId, `XT bot online. Use /help for commands.${chatId === groupId() ? "" : `\nOwner ID: ${ownerId()}`}`); break;
      case "help": await send(chatId, HELP_TEXT); break;
      case "ping": await send(chatId, `Pong · ${Math.max(0, Math.floor(Date.now() / 1000) - (message.date ?? Math.floor(Date.now() / 1000)))}s`); break;
      case "id": await send(chatId, `Your ID: ${actor.id}\nChat ID: ${chatId}\nGroup ID: ${groupId()}`); break;
      case "owner": await send(chatId, `Bot owner: ${ownerId()}\nPrimary group: ${groupId()}`); break;
      case "status": {
        const info = await telegramApi<{ username?: string }>("getMe");
        await send(chatId, `Bot: @${info.username ?? "connected"}\nGroup controls: ${settings.enabled ? "enabled" : "paused"}\nLogging: ${settings.logging_enabled ? "on" : "off"}\nAnti-spam: ${settings.antispam_enabled ? "on" : "off"}\nAnti-flood: ${settings.antiflood_enabled ? "on" : "off"}`);
        break;
      }
      case "info": {
        const info = await telegramApi<{ title?: string; type?: string; username?: string }>("getChat", { chat_id: groupId() });
        await send(chatId, `Group: ${info.title ?? "Primary group"}\nType: ${info.type ?? "group"}\nUsername: ${info.username ? `@${info.username}` : "private"}\nID: ${groupId()}`);
        break;
      }
      case "rules": await send(chatId, settings.rules_text); break;
      case "settings": {
        if (!actorIsOwner) { await send(chatId, "Only the configured owner can change bot settings."); break; }
        await send(chatId, "XT GROUP SETTINGS", { reply_markup: keyboard(settings) });
        break;
      }
      case "ban": case "unban": case "kick": case "mute": case "unmute": case "warn": case "warnings": case "resetwarns": case "promote": case "demote": {
        if (chatId !== groupId()) { await send(chatId, "Use moderation commands inside the configured group."); break; }
        if (!target) { await send(chatId, "Reply to a member or include their numeric Telegram user ID."); break; }
        if (target.id === ownerId() || target.id === Number((await telegramApi<{ id: number }>("getMe")).id)) { await send(chatId, "Protected account: action refused."); break; }
        const withTarget = { chat_id: chatId, user_id: target.id };
        if (command === "ban") { await telegramApi("banChatMember", { ...withTarget, revoke_messages: true }); await audit({ chatId, action: "ban", actor, targetId: target.id, reason }); await send(chatId, `User ${target.id} banned.`); }
        else if (command === "unban") { await telegramApi("unbanChatMember", { ...withTarget, only_if_banned: true }); await audit({ chatId, action: "unban", actor, targetId: target.id, reason }); await send(chatId, `User ${target.id} unbanned.`); }
        else if (command === "kick") { await telegramApi("banChatMember", { ...withTarget, revoke_messages: true }); await telegramApi("unbanChatMember", { ...withTarget, only_if_banned: true }); await audit({ chatId, action: "kick", actor, targetId: target.id, reason }); await send(chatId, `User ${target.id} removed.`); }
        else if (command === "mute") { const minutes = Number(args[0]) || 60; const duration = Math.max(1, Math.min(10080, minutes)); await telegramApi("restrictChatMember", { ...withTarget, permissions: { can_send_messages: false, can_send_audios: false, can_send_documents: false, can_send_photos: false, can_send_videos: false, can_send_video_notes: false, can_send_voice_notes: false, can_send_polls: false, can_send_other_messages: false, can_add_web_page_previews: false }, until_date: Math.floor(Date.now() / 1000) + duration * 60 }); await audit({ chatId, action: "mute", actor, targetId: target.id, reason, details: { minutes: duration } }); await send(chatId, `User ${target.id} muted for ${duration} minutes.`); }
        else if (command === "unmute") { await telegramApi("restrictChatMember", { ...withTarget, permissions: { can_send_messages: true, can_send_audios: true, can_send_documents: true, can_send_photos: true, can_send_videos: true, can_send_video_notes: true, can_send_voice_notes: true, can_send_polls: true, can_send_other_messages: true, can_add_web_page_previews: true } }); await audit({ chatId, action: "unmute", actor, targetId: target.id, reason }); await send(chatId, `User ${target.id} unmuted.`); }
        else if (command === "warn") { const warning = await writeWarning(chatId, target.id, actor, reason, settings); await send(chatId, warning.muted ? `Warning ${warning.count}. Threshold reached; muted ${settings.auto_mute_minutes}m.` : `Warning ${warning.count}/${settings.warning_threshold}.`); }
        else if (command === "warnings") { const db = await adminClient(); const row = await db.from("telegram_warnings").select("warning_count,last_reason").eq("chat_id", chatId).eq("user_id", target.id).maybeSingle(); await send(chatId, `User ${target.id}: ${row.data?.warning_count ?? 0} warnings${row.data?.last_reason ? `\nLatest: ${row.data.last_reason}` : ""}`); }
        else if (command === "resetwarns") { const db = await adminClient(); await db.from("telegram_warnings").delete().eq("chat_id", chatId).eq("user_id", target.id); await audit({ chatId, action: "reset_warnings", actor, targetId: target.id }); await send(chatId, `Warnings reset for ${target.id}.`); }
        else if (command === "promote") { await telegramApi("promoteChatMember", { ...withTarget, can_change_info: false, can_post_messages: false, can_edit_messages: false, can_delete_messages: true, can_invite_users: true, can_restrict_members: false, can_pin_messages: false, can_promote_members: false, can_manage_video_chats: false }); await audit({ chatId, action: "promote", actor, targetId: target.id }); await send(chatId, `User ${target.id} promoted with limited admin rights.`); }
        else { await telegramApi("promoteChatMember", { ...withTarget, can_change_info: false, can_post_messages: false, can_edit_messages: false, can_delete_messages: false, can_invite_users: false, can_restrict_members: false, can_pin_messages: false, can_promote_members: false, can_manage_video_chats: false }); await audit({ chatId, action: "demote", actor, targetId: target.id }); await send(chatId, `Admin rights removed for ${target.id}.`); }
        break;
      }
      case "purge": {
        if (chatId !== groupId()) { await send(chatId, "Use /purge in the configured group."); break; }
        const count = Math.max(1, Math.min(100, Number(args[0]) || 10));
        if (!reply) { await send(chatId, "Reply to the first message, then use /purge [count]."); break; }
        let deleted = 0;
        for (let id = reply.message_id; id <= message.message_id && deleted < count; id++) {
          try { await telegramApi("deleteMessage", { chat_id: chatId, message_id: id }); deleted++; } catch { /* Telegram limits deletion by age and eligibility. */ }
        }
        await audit({ chatId, action: "purge", actor, reason, details: { requested: count, deleted } });
        await send(chatId, `Removed ${deleted} eligible messages.`);
        break;
      }
      case "lock": case "unlock": {
        if (chatId !== groupId()) { await send(chatId, `Use /${command} in the configured group.`); break; }
        const db = await adminClient();
        const current = await telegramApi<{ permissions?: Record<string, boolean> }>("getChat", { chat_id: chatId });
        if (command === "lock") {
          const original = current.permissions ?? {};
          const restricted = { can_send_messages: false, can_send_audios: false, can_send_documents: false, can_send_photos: false, can_send_videos: false, can_send_video_notes: false, can_send_voice_notes: false, can_send_polls: false, can_send_other_messages: false, can_add_web_page_previews: false };
          await telegramApi("setChatPermissions", { chat_id: chatId, permissions: restricted });
          await updateSettings(chatId, { locked: true, locked_permissions: original }, actor);
        } else {
          const original = settings.locked_permissions as Record<string, boolean>;
          await telegramApi("setChatPermissions", { chat_id: chatId, permissions: Object.keys(original).length ? original : { can_send_messages: true, can_send_audios: true, can_send_documents: true, can_send_photos: true, can_send_videos: true, can_send_video_notes: true, can_send_voice_notes: true, can_send_polls: true, can_send_other_messages: true, can_add_web_page_previews: true } });
          await updateSettings(chatId, { locked: false }, actor);
        }
        await audit({ chatId, action: command, actor });
        await send(chatId, command === "lock" ? "Group locked for members." : "Saved group permissions restored.");
        break;
      }
      case "antispam": case "antiflood": {
        if (!actorIsOwner) { await send(chatId, "Only the configured owner can change protection settings."); break; }
        const enabled = args[0] === "on" ? true : args[0] === "off" ? false : !settings[command === "antispam" ? "antispam_enabled" : "antiflood_enabled"];
        const patch = command === "antispam" ? { antispam_enabled: enabled } : { antiflood_enabled: enabled };
        await updateSettings(groupId(), patch, actor);
        await audit({ chatId: groupId(), action: command, actor, details: { enabled } });
        await send(chatId, `${command} ${enabled ? "enabled" : "disabled"}.`);
        break;
      }
      case "filter": {
        if (!actorIsOwner) { await send(chatId, "Only the configured owner can manage keyword filters."); break; }
        const [operation, ...words] = args;
        const keyword = words.join(" ").trim().slice(0, 100);
        const db = await adminClient();
        if (operation === "list") {
          const all = await db.from("telegram_keyword_filters").select("keyword").eq("chat_id", groupId()).limit(50);
          await send(chatId, `Filters: ${(all.data ?? []).map((item) => item.keyword).join(", ") || "none"}`);
        } else if ((operation === "add" || operation === "remove") && keyword.length >= 2) {
          if (operation === "add") await db.from("telegram_keyword_filters").upsert({ chat_id: groupId(), keyword: keyword.toLowerCase(), created_by: actor.id });
          else await db.from("telegram_keyword_filters").delete().eq("chat_id", groupId()).eq("keyword", keyword.toLowerCase());
          await audit({ chatId: groupId(), action: `filter_${operation}`, actor, reason: keyword });
          await send(chatId, `Filter ${operation === "add" ? "added" : "removed"}: ${keyword}`);
        } else await send(chatId, "Usage: /filter add <word>, /filter remove <word>, /filter list");
        break;
      }
      case "setrules": {
        if (!actorIsOwner) { await send(chatId, "Only the configured owner can change group rules."); break; }
        const rules = args.join(" ").trim().slice(0, 3500);
        if (!rules) { await send(chatId, "Usage: /setrules <new rules>"); break; }
        await updateSettings(groupId(), { rules_text: rules }, actor);
        await audit({ chatId: groupId(), action: "set_rules", actor });
        await send(chatId, "Group rules updated.");
        break;
      }
      case "logs": {
        const db = await adminClient();
        const limit = Math.max(1, Math.min(25, Number(args[0]) || 10));
        const rows = await db.from("telegram_audit_logs").select("created_at,action,actor_id,target_user_id,reason").eq("chat_id", groupId()).order("created_at", { ascending: false }).limit(limit);
        const list = (rows.data ?? []).map((item) => `${new Date(item.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST · ${item.action} · ${item.actor_id ?? "system"}${item.target_user_id ? ` → ${item.target_user_id}` : ""}${item.reason ? ` · ${item.reason.slice(0, 70)}` : ""}`);
        await send(chatId, `RECENT ACTIVITY\n${list.join("\n") || "No activity yet."}`);
        break;
      }
      case "broadcast": {
        if (!actorIsOwner) { await send(chatId, "Only the configured owner can broadcast."); break; }
        const announcement = args.join(" ").trim().slice(0, 3500);
        if (!announcement) { await send(chatId, "Usage: /broadcast <announcement>"); break; }
        await send(groupId(), announcement);
        await audit({ chatId: groupId(), action: "broadcast", actor, details: { characters: announcement.length } });
        await send(chatId, "Announcement sent to the group.");
        break;
      }
      default: await send(chatId, HELP_TEXT);
    }
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Telegram could not complete that action.";
    console.error(`Telegram command failed: ${command}: ${messageText.slice(0, 200)}`);
    await audit({ chatId, action: "command_failed", actor, reason: command, details: { failure: messageText.slice(0, 250) } });
    await send(chatId, `Could not complete /${command}. Check the bot's group permissions and try again.`);
  }
}

async function processCallback(update: TelegramUpdate) {
  const callback = update.callback_query;
  if (!callback) return;
  if (callback.from.id !== ownerId()) { await answerCallback(callback.id, "Owner only"); return; }
  const chatId = callback.message?.chat.id ?? groupId();
  const data = callback.data ?? "";
  const settings = await ensureSettings(groupId());
  if (data === "view:rules") {
    await answerCallback(callback.id, "Group rules");
    await send(callback.from.id, settings.rules_text);
    return;
  }
  const field = data.startsWith("toggle:") ? data.slice("toggle:".length) : "";
  const allowed: Array<keyof BotSettings> = ["enabled", "welcome_enabled", "farewell_enabled", "logging_enabled", "antispam_enabled", "antiflood_enabled"];
  if (!allowed.includes(field as keyof BotSettings)) { await answerCallback(callback.id, "Unknown setting"); return; }
  const key = field as keyof BotSettings;
  const value = !Boolean(settings[key]);
  await updateSettings(groupId(), { [key]: value }, callback.from);
  await audit({ chatId: groupId(), action: "setting_toggle", actor: callback.from, details: { setting: key, value } });
  await answerCallback(callback.id, `${key} ${value ? "on" : "off"}`);
  if (callback.message) await telegramApi("editMessageReplyMarkup", { chat_id: callback.message.chat.id, message_id: callback.message.message_id, reply_markup: keyboard({ ...settings, [key]: value }) });
}

async function processUpdate(update: TelegramUpdate) {
  const callback = update.callback_query;
  if (callback) { await processCallback(update); return; }
  const memberEvent = update.chat_member;
  if (memberEvent?.chat.id === groupId()) {
    await audit({ chatId: groupId(), action: `member_${memberEvent.new_chat_member.status}`, actor: memberEvent.from, targetId: memberEvent.new_chat_member.user.id, details: { previous_status: memberEvent.old_chat_member.status } });
  }
  const message = update.message ?? update.edited_message;
  if (!message || message.chat.id !== groupId() && message.chat.type !== "private") return;
  const dbSettings = await ensureSettings(groupId());
  if (!dbSettings.enabled && message.chat.id === groupId()) return;
  if (message.new_chat_members && message.chat.id === groupId()) {
    for (const member of message.new_chat_members) {
      await audit({ chatId: groupId(), action: "member_join", actor: member, targetId: member.id });
      if (dbSettings.welcome_enabled) await send(groupId(), dbSettings.welcome_template.replaceAll("{name}", userName(member)).replaceAll("{username}", member.username ?? ""));
    }
  }
  if (message.left_chat_member && message.chat.id === groupId()) {
    await audit({ chatId: groupId(), action: "member_leave", actor: message.left_chat_member, targetId: message.left_chat_member.id });
    if (dbSettings.farewell_enabled) await send(groupId(), dbSettings.farewell_template.replaceAll("{name}", userName(message.left_chat_member)).replaceAll("{username}", message.left_chat_member.username ?? ""));
  }
  if (message.text?.startsWith("/")) await processCommand(message, dbSettings);
  else if (message.chat.id === groupId()) await processMemberText(message, dbSettings);
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const db = await adminClient();
  const receipt = await db.from("telegram_update_receipts").insert({ update_id: update.update_id });
  if (receipt.error?.code === "23505") return;
  if (receipt.error) throw new Error("Could not record Telegram update");
  try {
    await processUpdate(update);
  } catch (error) {
    await db.from("telegram_update_receipts").delete().eq("update_id", update.update_id);
    throw error;
  }
}

export async function getTelegramRuntimeStatus() {
  const [me, webhook] = await Promise.all([
    telegramApi<{ id: number; username?: string; first_name?: string }>("getMe"),
    telegramApi<{ url?: string; pending_update_count?: number; last_error_message?: string }>("getWebhookInfo"),
  ]);
  return { me, webhook, expectedGroupId: groupId(), ownerId: ownerId() };
}

export async function setTelegramWebhook() {
  const url = "https://project--44e6b5c8-f888-4875-8727-51b14eb89853-dev.lovable.app/api/public/telegram/webhook";
  await telegramApi("setWebhook", {
    url,
    secret_token: webhookSecret(),
    allowed_updates: ["message", "edited_message", "callback_query", "chat_member", "my_chat_member"],
    drop_pending_updates: false,
  });
  return { url, ...(await getTelegramRuntimeStatus()) };
}

export async function getTelegramWebhookSecret() {
  return webhookSecret();
}

export async function getTelegramDashboardData() {
  const chatId = groupId();
  const db = await adminClient();
  const [settings, logs, warnings, filters, runtime] = await Promise.all([
    ensureSettings(chatId),
    db.from("telegram_audit_logs").select("id,created_at,action,actor_id,actor_username,target_user_id,reason,details").eq("chat_id", chatId).order("created_at", { ascending: false }).limit(50),
    db.from("telegram_warnings").select("user_id,warning_count,last_reason,updated_at").eq("chat_id", chatId).order("updated_at", { ascending: false }).limit(20),
    db.from("telegram_keyword_filters").select("keyword,created_by,created_at").eq("chat_id", chatId).order("created_at", { ascending: false }),
    getTelegramRuntimeStatus().catch(() => null),
  ]);
  return {
    settings,
    logs: logs.data ?? [],
    warnings: warnings.data ?? [],
    filters: filters.data ?? [],
    runtime,
    groupId: chatId,
    ownerId: ownerId(),
  };
}

export async function saveTelegramDashboardSettings(input: {
  enabled: boolean;
  welcome_enabled: boolean;
  farewell_enabled: boolean;
  logging_enabled: boolean;
  antispam_enabled: boolean;
  antiflood_enabled: boolean;
  welcome_template: string;
  farewell_template: string;
  flood_limit: number;
  flood_window_seconds: number;
  warning_threshold: number;
  auto_mute_minutes: number;
  rules_text: string;
}) {
  const db = await adminClient();
  const { error } = await db.from("telegram_group_settings").upsert({ chat_id: groupId(), ...input, updated_by: ownerId(), updated_at: new Date().toISOString() });
  if (error) throw new Error("Could not save bot settings");
  await audit({ chatId: groupId(), action: "web_settings_saved", actor: { id: ownerId() }, details: { fields: Object.keys(input) } });
  return getTelegramDashboardData();
}

export async function deleteTelegramFilter(keyword: string) {
  const db = await adminClient();
  const normalized = keyword.trim().toLowerCase();
  const { error } = await db.from("telegram_keyword_filters").delete().eq("chat_id", groupId()).eq("keyword", normalized);
  if (error) throw new Error("Could not remove keyword filter");
  await audit({ chatId: groupId(), action: "filter_removed_from_web", actor: { id: ownerId() }, reason: normalized });
  return getTelegramDashboardData();
}

export async function addTelegramFilter(keyword: string) {
  const db = await adminClient();
  const normalized = keyword.trim().toLowerCase();
  const { error } = await db.from("telegram_keyword_filters").upsert({ chat_id: groupId(), keyword: normalized, created_by: ownerId() });
  if (error) throw new Error("Could not add keyword filter");
  await audit({ chatId: groupId(), action: "filter_added_from_web", actor: { id: ownerId() }, reason: normalized });
  return getTelegramDashboardData();
}

export { classifyTelegramCommand };