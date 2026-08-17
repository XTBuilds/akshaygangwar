import { useState } from "react";

const IG_USER = "raxx_xt";
const IG_URL = `https://instagram.com/${IG_USER}`;

/**
 * Instagram Life Stream layer. Instagram's Graph API requires an authorized
 * business token, so the layer renders as spatial portals into the live
 * profile until a connection is authorized.
 */
export function LifeStream() {
  const [active, setActive] = useState<number | null>(null);
  const tiles = [
    { label: "Latest Drop", depth: 0 },
    { label: "Studio Nights", depth: 1 },
    { label: "Build Logs", depth: 2 },
    { label: "Off-Grid", depth: 3 },
  ];

  return (
    <section id="stream" className="mx-auto max-w-6xl px-5 py-16">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
          // life stream
        </p>
        <h2 className="mt-2 font-display text-3xl text-gradient sm:text-4xl">
          INSTAGRAM @{IG_USER.toUpperCase()}
        </h2>
        <div className="mt-3 h-px w-24 rule-brand" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <a
            key={t.label}
            href={IG_URL}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            style={{
              transform:
                active === i
                  ? "translateZ(0) translateY(-10px) scale(1.03)"
                  : `translateY(${t.depth * 3}px) scale(${1 - t.depth * 0.012})`,
              opacity: active === null || active === i ? 1 : 0.45,
            }}
            className="holo-panel flex h-52 flex-col justify-between p-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet">
              LAYER {String(i + 1).padStart(2, "0")}
            </p>
            <div>
              <p className="font-display text-lg text-foreground">{t.label}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan">
                Open portal →
              </p>
            </div>
          </a>
        ))}
      </div>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        ● Live post images require an authorized Instagram Graph connection — portals link to the
        live profile until it is connected.
      </p>
    </section>
  );
}
