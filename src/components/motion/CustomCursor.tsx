import { useEffect, useRef, useState } from "react";
import { useInteractive } from "@/hooks/useMotionPrefs";

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, .chip, .portal-link';

/** Minimal dot + ring cursor. Desktop / fine-pointer / motion-allowed only. */
export function CustomCursor() {
  const active = useInteractive();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!active) return;
    document.body.classList.add("has-custom-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const el = (e.target as HTMLElement | null)?.closest?.(INTERACTIVE);
      setHovering(Boolean(el));
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (ring.current)
        ring.current.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    raf = requestAnimationFrame(tick);
    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div ref={dot} className="cursor-dot" />
      <div
        ref={ring}
        className={`cursor-ring ${hovering ? "is-hover" : ""} ${pressed ? "is-press" : ""}`}
      />
    </div>
  );
}
