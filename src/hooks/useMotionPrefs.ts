import { useEffect, useState } from "react";

/** Reduced-motion + pointer capability detection (SSR safe). */
export function useMotionPrefs() {
  const [prefs, setPrefs] = useState({ reduced: false, fine: false, ready: false });

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fp = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setPrefs({ reduced: rm.matches, fine: fp.matches, ready: true });
    sync();
    rm.addEventListener("change", sync);
    fp.addEventListener("change", sync);
    return () => {
      rm.removeEventListener("change", sync);
      fp.removeEventListener("change", sync);
    };
  }, []);

  return prefs;
}

/** True when the interactive layer (cursor, parallax, tilt) should run. */
export function useInteractive() {
  const { reduced, fine, ready } = useMotionPrefs();
  return ready && fine && !reduced;
}
