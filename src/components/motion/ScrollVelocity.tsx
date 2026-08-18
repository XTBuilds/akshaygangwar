import { useEffect } from "react";
import { useMotionPrefs } from "@/hooks/useMotionPrefs";

/**
 * Publishes --scroll-skew (deg, capped ~1.6) and --scroll-boost (0..1) on
 * <html> while scrolling, easing back to zero when scrolling stops.
 */
export function ScrollVelocity() {
  const { reduced, ready } = useMotionPrefs();

  useEffect(() => {
    if (!ready || reduced) return;
    const root = document.documentElement;
    let last = window.scrollY;
    let vel = 0;
    let raf = 0;

    const tick = () => {
      const y = window.scrollY;
      const delta = y - last;
      last = y;
      vel += (delta - vel) * 0.2;
      vel *= 0.92;
      const skew = Math.max(-1.6, Math.min(1.6, vel * 0.045));
      root.style.setProperty("--scroll-skew", `${skew.toFixed(3)}deg`);
      root.style.setProperty("--scroll-boost", Math.min(1, Math.abs(vel) / 60).toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      root.style.setProperty("--scroll-skew", "0deg");
      root.style.setProperty("--scroll-boost", "0");
    };
  }, [ready, reduced]);

  return null;
}
