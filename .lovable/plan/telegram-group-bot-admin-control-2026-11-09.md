# Telegram Group Bot Admin Control

## Goal
Turn the already connected Telegram bot into an owner-controlled group administration bot for the configured owner and primary group, with persistent settings and an owner-only site control room.

## Build
- Add private persistent storage for group settings, warnings, keyword filters, and timestamped moderation/audit events.
- Add a Telegram webhook that verifies Telegram's secret header, validates updates, restricts activity to the configured group, and records join/leave, command, moderation, and configuration events.
- Implement the requested bot commands with per-command authorization: exact Telegram owner ID for owner controls, Telegram group-admin checks for moderation, and public responses for basic commands. Include a Telegram inline settings menu for owner configuration.
- Add a signed-in, admin-protected site page to view bot health/logs, edit settings, and securely register or refresh the webhook using the existing linked Telegram connection. Never expose bot credentials to the browser.
- Add the bot page link to the existing owner dashboard, and test core authorization/setting rules plus public webhook validation where possible.

## Technical details
- Use the existing TanStack Start routes and server-function patterns, Telegram's Bot API through the already linked connection gateway, and additive Lovable Cloud migrations with explicit grants and RLS.
- Use the configured owner ID `6753468481` and group ID `-1001997761568`; compare numeric Telegram user IDs for privileged actions, never usernames.
- Register the webhook only after the new receiver is available; report any hosting or Telegram permission limitation rather than claiming unverified activation.
