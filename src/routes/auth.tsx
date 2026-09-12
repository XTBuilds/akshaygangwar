import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CosmicBackdrop } from "@/components/CosmicBackdrop";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Owner Access — XT BUILDS" },
      { name: "description", content: "Private sign-in for the XT BUILDS owner dashboard." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Owner Access — XT BUILDS" },
      { property: "og:description", content: "Private sign-in for the XT dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created — sign in now.");
        setMode("in");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <CosmicBackdrop />
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
        <Link to="/" className="portal-link">
          ← Back to XT CORE
        </Link>
        <h1 className="mt-6 font-display text-3xl text-gradient">OWNER ACCESS</h1>
        <div className="mt-3 h-px w-24 rule-brand" />
        <form onSubmit={onSubmit} className="holo-panel mt-8 grid gap-4 p-6">
          <input
            className="xt-input"
            type="email"
            required
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="xt-input"
            type="password"
            required
            minLength={6}
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={busy} className="btn-brand disabled:opacity-60">
            {busy ? "..." : mode === "in" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
          <button
            type="button"
            className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
          >
            {mode === "in" ? "No account? Create one" : "Have an account? Sign in"}
          </button>
        </form>
      </main>
    </div>
  );
}
