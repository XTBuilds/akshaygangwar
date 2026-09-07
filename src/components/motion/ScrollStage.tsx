import { useRef, type ReactNode } from "react";
import { cubicBezier, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ease } from "@/lib/motion";

/**
 * Scroll-linked section transition. Progress is bound 1:1 to scroll position
 * (reversible frame-by-frame):
 *  - entering from the bottom: rises + scales 0.9 → 1, opacity 0.35 → 1
 *  - leaving at the top: drifts up + scales 1 → 0.94, opacity 1 → 0.4
 * Transform/opacity only. Reduced-motion renders a plain section.
 */
export function ScrollStage({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  const { scrollYProgress: enterP } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });
  const { scrollYProgress: exitP } = useScroll({
    target: ref,
    offset: ["end 0.8", "end start"],
  });

  const damp = mobile ? 0.5 : 1;
  const spring = { stiffness: 200, damping: 32, mass: 0.6, restDelta: 0.001 };
  const enterS = useSpring(enterP, spring);
  const exitS = useSpring(exitP, spring);

  // entering from below: rises + zooms in
  const yIn = useTransform(enterS, [0, 1], [130 * damp, 0], { ease: cubicBezier(...ease.out) });
  const sIn = useTransform(enterS, [0, 1], [1 - 0.16 * damp, 1]);
  const oIn = useTransform(enterS, [0, 1], [0.1, 1]);
  // leaving at the top: pushes toward the viewer (zooms out of frame) + fades
  const yOut = useTransform(exitS, [0, 1], [0, -90 * damp]);
  const sOut = useTransform(exitS, [0, 1], [1, 1 + 0.14 * damp]);
  const oOut = useTransform(exitS, [0, 1], [1, 0]);

  const y = useTransform([yIn, yOut], ([a, b]) => (a as number) + (b as number));
  const scale = useTransform([sIn, sOut], ([a, b]) => (a as number) * (b as number));
  const opacity = useTransform([oIn, oOut], ([a, b]) => Math.min(a as number, b as number));


  if (reduced) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      id={id}
      style={{ y, scale, opacity, transformOrigin: "50% 50%", willChange: "transform, opacity" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
