import { createFileRoute, Link } from "@tanstack/react-router";
import { CosmicBackdrop } from "@/components/CosmicBackdrop";
import { HireSection } from "@/components/HireSection";

export const Route = createFileRoute("/hire")({
  head: () => ({
    meta: [
      { title: "Hire Akshay Gangwar — Start a Project | XT BUILDS" },
      {
        name: "description",
        content:
          "Share your project idea, budget and timeline with Akshay Gangwar. Briefs land straight in his inbox, usually answered within 24 hours.",
      },
      { property: "og:title", content: "Hire Akshay Gangwar — Start a Project" },
      {
        property: "og:description",
        content: "Send your idea, budget and timeline. Direct line to Akshay Gangwar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HirePage,
});

function HirePage() {
  return (
    <div className="min-h-screen">
      <CosmicBackdrop />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <Link to="/" className="portal-link">
          ← Back to XT CORE
        </Link>
        <h1 className="mt-8 font-display text-4xl text-gradient sm:text-5xl">HIRE XT</h1>
        <div className="mt-3 h-px w-24 rule-brand" />
        <p className="mt-5 max-w-2xl text-sm text-muted-foreground">
          Tell me what you want to build, the budget range you have in mind and when you need it
          live. Every brief is delivered to my inbox — expect a reply within 24 hours.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["01 / BRIEF", "You send idea, budget and timeline."],
            ["02 / SCOPE", "I reply with a plan, price and delivery date."],
            ["03 / BUILD", "Weekly previews until launch."],
          ].map(([k, v]) => (
            <div key={k} className="holo-panel p-5">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {k}
              </p>
              <p className="mt-2 text-sm text-foreground">{v}</p>
            </div>
          ))}
        </div>

        <HireSection />
      </main>
    </div>
  );
}
