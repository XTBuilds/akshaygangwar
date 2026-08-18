import { useEffect, useRef } from "react";

/**
 * Fixed deep-space backdrop. Intentionally static: nebula, fog and the
 * micro particle field are painted once and never animate or parallax.
 */
export function CosmicBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // static star field
      for (let i = 0; i < 420; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 1.3;
        const a = 0.15 + Math.random() * 0.6;
        ctx.fillStyle =
          Math.random() > 0.82
            ? `rgba(255, 140, 240, ${a})`
            : `rgba(170, 235, 255, ${a})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // frozen data streams
      ctx.lineWidth = 1;
      for (let i = 0; i < 26; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const len = 40 + Math.random() * 160;
        const grad = ctx.createLinearGradient(x, y, x, y + len);
        grad.addColorStop(0, "rgba(120, 240, 255, 0)");
        grad.addColorStop(0.5, "rgba(120, 240, 255, 0.22)");
        grad.addColorStop(1, "rgba(120, 240, 255, 0)");
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + len);
        ctx.stroke();
      }
    };

    paint();
    let t = 0;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(paint, 180);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <Parallax
        depth={4}
        className="nebula-cyan animate-drift-a absolute -left-40 top-[-10%] h-[70vh] w-[70vw] rounded-full"
      />
      <Parallax
        depth={5}
        invert
        className="nebula-magenta animate-drift-b absolute -right-40 top-[25%] h-[75vh] w-[65vw] rounded-full"
      />
      <Parallax
        depth={3}
        className="nebula-deep animate-drift-a absolute bottom-[-20%] left-[20%] h-[60vh] w-[60vw] rounded-full"
      />
      <Parallax depth={3} as="canvas" className="absolute inset-0 opacity-80" />
      <canvas ref={ref} className="absolute inset-0 opacity-80" />
      <Parallax depth={2} className="absolute -inset-8 grid-bg opacity-[0.12]" />
      <div className="pointer-glow absolute inset-0" />
      <div className="volumetric absolute inset-0" />
    </div>
  );
}

