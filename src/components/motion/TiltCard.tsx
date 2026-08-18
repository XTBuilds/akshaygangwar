import { useRef, type ReactNode } from "react";
import { useInteractive } from "@/hooks/useMotionPrefs";

/**
 * Subtle 3D tilt (max ~4deg) with a cursor-following light sheen.
 * Disabled on touch / coarse pointers / reduced motion.
 */
export function TiltCard({
  children,
  className = "",
  max = 4,
  lift = 4,
  onActivate,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  lift?: number;
  onActivate?: () => void;
}) {
  const active = useInteractive();
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${((py - 0.5) * -2 * max).toFixed(2)}deg) rotateY(${((px - 0.5) * 2 * max).toFixed(2)}deg) translate3d(0, ${-lift}px, 0)`;
    el.style.setProperty("--lx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--ly", `${(py * 100).toFixed(1)}%`);
    el.style.setProperty("--sheen", "1");
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.setProperty("--sheen", "0");
  };

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      {...(onActivate
        ? {
            onDoubleClick: onActivate,
          }
        : {})}
      className={`tilt-card ${className}`}
    >
      <span aria-hidden className="tilt-sheen" />
      <span className="tilt-inner">{children}</span>
    </article>
  );
}
