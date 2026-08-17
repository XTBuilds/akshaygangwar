import { useEffect, useState } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useGithub } from "@/hooks/useGithub";

type Action = { label: string; hint: string; run: () => void };

export function CommandOrb({
  onToggleFilters,
  density,
  onToggleDensity,
}: {
  onToggleFilters: () => void;
  density: "comfortable" | "dense";
  onToggleDensity: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { refresh } = useGithub();
  const orbRef = useMagnetic<HTMLButtonElement>(0.3, 150);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  const go = (id: string) => () => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  const actions: Action[] = [
    { label: "Refresh Sync", hint: "GitHub", run: () => { refresh(); setOpen(false); } },
    { label: "Explorer", hint: "Jump", run: go("#repos") },
    { label: "Projects", hint: "Jump", run: go("#projects") },
    { label: "Life Stream", hint: "Jump", run: go("#stream") },
    { label: "Toggle Filters", hint: "Explorer", run: () => { onToggleFilters(); setOpen(false); } },
    {
      label: `Density: ${density === "dense" ? "Dense" : "Comfort"}`,
      hint: "Layout",
      run: () => { onToggleDensity(); },
    },
  ];

  return (
    <>
      <button
        ref={orbRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open XT command palette (Ctrl or Cmd + K)"
        className="command-orb fixed bottom-8 left-1/2 z-40 h-16 w-16 -translate-x-1/2 rounded-full"
      >
        <span className="font-display text-sm text-background">XT</span>
      </button>

      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-background/70 backdrop-blur-md transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-label="XT command palette"
        aria-hidden={!open}
        className={`fixed left-1/2 top-1/2 z-50 w-[min(92vw,34rem)] -translate-x-1/2 -translate-y-1/2 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
        }`}
      >
        <div className="holo-panel p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-violet">
            XT COMMAND PALETTE — CTRL / ⌘ + K
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {actions.map((a, i) => (
              <button
                key={a.label}
                type="button"
                onClick={a.run}
                style={{ transitionDelay: open ? `${i * 35}ms` : "0ms" }}
                className={`portal-link flex items-center justify-between transition-all duration-300 ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                <span>{a.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{a.hint}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
