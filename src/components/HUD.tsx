import { useEffect, useState } from "react";
import { useGithub } from "@/hooks/useGithub";

export function HUD() {
  const { errorMessage, isFetching } = useGithub();
  const [time, setTime] = useState<string>("");
  const [fps, setFps] = useState(60);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      frames += 1;
      if (t - last >= 1000) {
        setFps(frames);
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const sync = errorMessage ? "OFFLINE" : isFetching ? "SYNCING" : "ONLINE";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 hidden justify-between px-5 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan/60 backdrop-blur-sm md:flex">
      <span>XT // CORE</span>
      <span className={errorMessage ? "text-destructive" : "text-neon"}>
        ● SYSTEM {errorMessage ? "DEGRADED" : "ONLINE"}
      </span>
      <span className="hidden lg:inline">FPS {fps}</span>
      <span>GITHUB SYNC: {sync}</span>
      <span>{time}</span>
    </div>
  );
}
