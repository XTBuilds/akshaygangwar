import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
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
    offset: ["start end", "start 0.28"],
  });
  const { scrollYProgress: exitP } = useScroll({
    target: ref,
    offset: ["end 0.72", "end start"],
  });

  const damp = mobile ? 0.55 : 1;
  const spring = { stiffness: 220, damping: 34, mass: 0.6, restDelta: 0.001 };
  const enterS = useSpring(enterP, spring);
  const exitS = useSpring(exitP, spring);

  const yIn = useTransform(enterS, [0, 1], [96 * damp, 0], { ease: ease.out as unknown as (t: number) => number });
  const sIn = useTransform(enterS, [0, 1], [1 - 0.1 * damp, 1]);
  const oIn = useTransform(enterS, [0, 1], [0.35, 1]);
  const yOut = useTransform(exitS, [0, 1], [0, -72 * damp]);
  const sOut = useTransform(exitS, [0, 1], [1, 1 - 0.06 * damp]);
  const oOut = useTransform(exitS, [0, 1], [1, 0.4]);

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
