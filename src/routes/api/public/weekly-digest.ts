import { createFileRoute } from "@tanstack/react-router";

/** Scheduled weekly report. Call with header: x-digest-secret: <DIGEST_CRON_SECRET> */
export const Route = createFileRoute("/api/public/weekly-digest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["DIGEST_CRON_SECRET"];
        if (!secret) return new Response("Not configured", { status: 503 });
        if (request.headers.get("x-digest-secret") !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { sendWeeklyDigest } = await import("@/lib/analytics.server");
        const result = await sendWeeklyDigest();
        return Response.json(result);
      },
    },
  },
});
