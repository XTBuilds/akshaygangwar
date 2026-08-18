import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";

type Common = { children: ReactNode; className?: string; strength?: number; radius?: number };

/** Magnetic wrapper preserving native button semantics. */
export function MagneticButton({
  children,
  className = "",
  strength = 0.2,
  radius = 110,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useMagnetic<HTMLButtonElement>(strength, radius);
  return (
    <button ref={ref} className={`magnetic ${className}`} {...rest}>
      {children}
    </button>
  );
}

/** Magnetic anchor — keeps href, target and rel intact. */
export function MagneticLink({
  children,
  className = "",
  strength = 0.18,
  radius = 110,
  ...rest
}: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const ref = useMagnetic<HTMLAnchorElement>(strength, radius);
  return (
    <a ref={ref} className={`magnetic ${className}`} {...rest}>
      {children}
    </a>
  );
}
