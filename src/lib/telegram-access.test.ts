// @ts-nocheck — Bun provides this test module at runtime.
// @ts-nocheck — Bun provides this test module at runtime.
import { describe, expect, it } from "bun:test";
import {
  classifyTelegramCommand,
  isConfiguredTelegramOwner,
  isTelegramCommandAllowed,
} from "@/lib/telegram-access";

describe("Telegram command access", () => {
  const ownerId = 6753468481;

  it("grants owner commands only to the exact configured Telegram user ID", () => {
    expect(isConfiguredTelegramOwner(ownerId, ownerId)).toBe(true);
    expect(isTelegramCommandAllowed({ command: "settings", actorId: 12345, ownerId, groupAdmin: true })).toBe(false);
    expect(isTelegramCommandAllowed({ command: "settings", actorId: ownerId, ownerId, groupAdmin: false })).toBe(true);
  });

  it("requires a group administrator for moderation commands", () => {
    expect(isTelegramCommandAllowed({ command: "ban", actorId: 12345, ownerId, groupAdmin: false })).toBe(false);
    expect(isTelegramCommandAllowed({ command: "ban", actorId: 12345, ownerId, groupAdmin: true })).toBe(true);
    expect(isTelegramCommandAllowed({ command: "ban", actorId: 12345, ownerId, groupAdmin: true, commandPermission: "owner" })).toBe(false);
    expect(isTelegramCommandAllowed({ command: "ban", actorId: ownerId, ownerId, groupAdmin: false, commandPermission: "owner" })).toBe(true);
    expect(isTelegramCommandAllowed({ command: "ban", actorId: 12345, ownerId, groupAdmin: true, commandPermission: "owner" })).toBe(false);
    expect(isTelegramCommandAllowed({ command: "ban", actorId: ownerId, ownerId, groupAdmin: false, commandPermission: "owner" })).toBe(true);
  });

  it("keeps help public and classifies owner-only configuration commands", () => {
    expect(classifyTelegramCommand("/help")).toBe("public");
    expect(classifyTelegramCommand("/antiflood@GITXTROBOT")).toBe("owner");
    expect(classifyTelegramCommand("/logs")).toBe("moderator");
    expect(classifyTelegramCommand("/logs")).toBe("moderator");
  });
});