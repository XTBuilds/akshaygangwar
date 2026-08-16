import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  "INITIALIZING XT CORE",
  "COMPILING MODULE 07",
  "BUILD PROCESS STARTED",
  "OPTIMIZING SYSTEM",
  "NEURAL INTERFACE READY",
  "CORE SYNCHRONIZED",
  "BUILD SUCCESS",
];

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  a: number;
  r: number;
  hue: number;
};

export function XTLoader({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setLines((l) => [...l, BOOT_LINES[i % BOOT_LINES.length] ?? ""].slice(-7));
    }, 420);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const start = performance.now();
    const dur = 5200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setProgress(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setLeaving(true);
        setTimeout(onDone, 900);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    // sample "XT" pixels for particle targets
    const off = document.createElement("canvas");
    off.width = 300;
    off.height = 140;
    const octx = off.getContext("2d")!;
    octx.fillStyle = "#fff";
    octx.font = "bold 110px Orbitron, sans-serif";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillText("XT", 150, 74);
    const data = octx.getImageData(0, 0, off.width, off.height).data;

    const targets: { x: number; y: number }[] = [];
    for (let y = 0; y < off.height; y += 3) {
      for (let x = 0; x < off.width; x += 3) {
        if ((data[(y * off.width + x) * 4 + 3] ?? 0) > 128) targets.push({ x: x - 150, y: y - 70 });
      }
    }

    const particles: Particle[] = targets.map((t) => ({
      x: (Math.random() - 0.5) * 900,
      y: (Math.random() - 0.5) * 700,
      tx: t.x,
      ty: t.y,
      a: Math.random(),
      r: Math.random() * 1.2 + 0.5,
      hue: 185 + Math.random() * 60,
    }));

    const dust = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: Math.random() * 1.4 + 0.3,
      v: Math.random() * 0.0006 + 0.0002,
    }));

    const t0 = performance.now();
    let raf = 0;
    const draw = (now: number) => {
      const el = (now - t0) / 1000;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.scale(dpr, dpr);
      const W = w / dpr;
      const H = h / dpr;
      const cx = W / 2;
      const cy = H / 2;

      // dust
      dust.forEach((d) => {
        d.y -= d.v;
        if (d.y < 0) d.y = 1;
        ctx.fillStyle = `rgba(140,200,255,${0.25 + d.s * 0.15})`;
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.s, 0, Math.PI * 2);
        ctx.fill();
      });

      const R = Math.min(W, H) * 0.24;

      // rotating rings
      for (let k = 0; k < 3; k++) {
        const rr = R * (1.15 + k * 0.22);
        const dir = k % 2 === 0 ? 1 : -1;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(dir * el * (0.25 + k * 0.12));
        ctx.strokeStyle = `rgba(90,190,255,${0.35 - k * 0.08})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([rr * 0.5, rr * 0.18, rr * 0.12, rr * 0.3]);
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // liquid energy inner ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.setLineDash([]);
      for (let s = 0; s < 3; s++) {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) {
          const wob =
            Math.sin(a * 6 + el * 2.2 + s) * 3 + Math.sin(a * 11 - el * 3.1 + s * 2) * 1.8;
          const rr = R * 0.96 + wob;
          const px = Math.cos(a) * rr;
          const py = Math.sin(a) * rr;
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(${60 + s * 30},${210 - s * 20},255,${0.5 - s * 0.13})`;
        ctx.lineWidth = 2 - s * 0.5;
        ctx.shadowBlur = 18;
        ctx.shadowColor = "rgba(60,200,255,0.9)";
        ctx.stroke();
      }
      ctx.restore();

      // core glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4);
      g.addColorStop(0, "rgba(40,140,255,0.22)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // particles assembling XT
      const assemble = Math.min(1, Math.max(0, (el - 0.6) / 3.6));
      const scale = Math.min(W, H) / 620;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.shadowBlur = 10;
      particles.forEach((p) => {
        const ease = assemble * assemble * (3 - 2 * assemble);
        p.x += (p.tx * scale * 1.6 - p.x) * 0.045 * (0.2 + ease);
        p.y += (p.ty * scale * 1.6 - p.y) * 0.045 * (0.2 + ease);
        const jitter = (1 - ease) * 4;
        ctx.fillStyle = `hsla(${p.hue}, 100%, ${60 + ease * 20}%, ${0.35 + ease * 0.6})`;
        ctx.shadowColor = `hsla(${p.hue},100%,65%,0.9)`;
        ctx.beginPath();
        ctx.arc(
          p.x + Math.sin(el * 3 + p.a * 9) * jitter,
          p.y + Math.cos(el * 2.4 + p.a * 7) * jitter,
          p.r + ease * 0.4,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      });
      ctx.restore();

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const circ = 2 * Math.PI * 46;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-background transition-all duration-[900ms] ${
        leaving ? "scale-125 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <div className="absolute inset-0 grid-bg opacity-40" />
      {/* background code */}
      <div className="pointer-events-none absolute inset-0 flex justify-between px-4 font-mono text-[10px] leading-5 text-primary/25 sm:text-xs">
        {[0, 1, 2].map((c) => (
          <pre key={c} className="animate-scan whitespace-pre">
            {Array.from({ length: 26 }, (_, i) =>
              `${(i * 7 + c * 13).toString(16).padStart(4, "0")}  ${
                ["const core = await xt.boot()", "compile(module_07)", "if (!ready) retry()", "render(<XT />)", "optimize({ level: 3 })", "sync(neural.interface)"][
                  (i + c) % 6
                ]
              }`,
            ).join("\n")}
          </pre>
        ))}
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* progress ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-[62vmin] w-[62vmin] -rotate-90">
          <circle cx="50" cy="50" r="46" fill="none" stroke="oklch(0.3 0.04 265)" strokeWidth="0.4" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress / 100)}
          />
        </svg>
      </div>

      {/* HUD */}
      <div className="absolute inset-0 p-5 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan/70 sm:p-8 sm:text-xs">
        <div className="flex justify-between">
          <span>CPU 74%</span>
          <span>MEMORY 8.4 GB</span>
        </div>
        <div className="absolute left-5 top-1/2 -translate-y-1/2 space-y-2 sm:left-8">
          <div>SYSTEM ONLINE</div>
          <div>NETWORK CONNECTED</div>
          <div>CORE TEMP 42°C</div>
        </div>
        <div className="absolute bottom-16 left-1/2 w-full max-w-md -translate-x-1/2 space-y-1 px-5 text-center normal-case tracking-normal text-primary/60">
          {lines.map((l, i) => (
            <div key={`${l}-${i}`} style={{ opacity: 0.25 + i * 0.11 }}>
              &gt; {l}
            </div>
          ))}
        </div>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center sm:bottom-8">
          <div className="font-display text-2xl text-foreground">{progress}%</div>
          <div className="mt-1 text-cyan/60">BUILD {progress}%</div>
        </div>
      </div>
    </div>
  );
}
