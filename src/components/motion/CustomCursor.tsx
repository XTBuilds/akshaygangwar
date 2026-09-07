import { useEffect, useRef } from "react";
import { useInteractive } from "@/hooks/useMotionPrefs";

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, .chip, .portal-link';

/**
 * Minimal dot + ring cursor. Desktop / fine-pointer / motion-allowed only.
 * State changes are written straight to the DOM (no React re-render per move),
 * and the cursor hides when the pointer leaves the window.
 */
export function CustomCursor() {
  const active = useInteractive();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    document.body.classList.add("has-custom-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;
    let hovering = false;
    let visible = false;

    const setVisible = (v: boolean) => {
      if (visible === v) return;
      visible = v;
      dot.current?.classList.toggle("is-visible", v);
      ring.current?.classList.toggle("is-visible", v);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      setVisible(true);
      const next = Boolean((e.target as Element | null)?.closest?.(INTERACTIVE));
      if (next !== hovering) {
        hovering = next;
        ring.current?.classList.toggle("is-hover", next);
      }
    };
    const down = () => ring.current?.classList.add("is-press");
    const up = () => ring.current?.classList.remove("is-press");
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    const tick = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (ring.current)
        ring.current.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("blur", leave);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    raf = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("blur", leave);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </div>
  );
}
