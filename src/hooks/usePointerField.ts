import { useEffect } from "react";
import { useInteractive } from "./useMotionPrefs";

/**
 * Single global rAF loop that publishes a smoothed pointer position as CSS
 * custom properties on <html>:
 *   --mx / --my : normalized -1..1, lerped (used by .parallax depth layers)
 *   --cx / --cy : smoothed viewport px (used by ambient glows + custom cursor)
 * Nothing else listens to mousemove, so the cost stays constant.
 */
export function usePointerField() {
  const active = useInteractive();

  useEffect(() => {
    const root = document.documentElement;
    if (!active) {
      root.style.setProperty("--mx", "0");
      root.style.setProperty("--my", "0");
      return;
    }

    let tnx = 0;
    let tny = 0;
    let nx = 0;
    let ny = 0;
    let tpx = window.innerWidth / 2;
    let tpy = window.innerHeight / 2;
    let px = tpx;
    let py = tpy;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tnx = (e.clientX / window.innerWidth - 0.5) * 2;
      tny = (e.clientY / window.innerHeight - 0.5) * 2;
      tpx = e.clientX;
      tpy = e.clientY;
    };

    const tick = () => {
      nx += (tnx - nx) * 0.075;
      ny += (tny - ny) * 0.075;
      px += (tpx - px) * 0.16;
      py += (tpy - py) * 0.16;
      root.style.setProperty("--mx", nx.toFixed(4));
      root.style.setProperty("--my", ny.toFixed(4));
      root.style.setProperty("--cx", `${px.toFixed(1)}px`);
      root.style.setProperty("--cy", `${py.toFixed(1)}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [active]);
}
