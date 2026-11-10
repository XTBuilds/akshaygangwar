export type TelegramCommandClass = "public" | "moderator" | "owner";

const OWNER_COMMANDS = new Set([
  "settings",
  "antispam",
  "antiflood",
  "filter",
  "setrules",
  "broadcast",
  "owner",
]);

const MODERATOR_COMMANDS = new Set([
  "ban",
  "unban",
  "kick",
  "mute",
  "unmute",
  "warn",
  "warnings",
  "resetwarns",
  "purge",
  "promote",
  "demote",
  "lock",
  "unlock",
]);

export function isConfiguredTelegramOwner(actorId: number | null | undefined, ownerId: number) {
  return typeof actorId === "number" && Number.isSafeInteger(actorId) && actorId === ownerId;
}

export function classifyTelegramCommand(command: string): TelegramCommandClass {
  const normalized = command.trim().replace(/^\//, "").split("@")[0]?.toLowerCase() ?? "";
  if (OWNER_COMMANDS.has(normalized)) return "owner";
  if (MODERATOR_COMMANDS.has(normalized)) return "moderator";
  return "public";
}

export function isTelegramCommandAllowed(input: {
  command: string;
  actorId: number | null | undefined;
  ownerId: number;
  groupAdmin: boolean;
}) {
  const access = classifyTelegramCommand(input.command);
  if (access === "public") return true;
  if (access === "owner") return isConfiguredTelegramOwner(input.actorId, input.ownerId);
  return input.groupAdmin || isConfiguredTelegramOwner(input.actorId, input.ownerId);
}
