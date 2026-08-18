import type { CSSProperties, ElementType, ReactNode } from "react";

type Props = {
  /** Pixel travel at full pointer deflection. Layer 1: 2-5, L2: 5-12, L3: 10-20. */
  depth?: number;
  /** Inverted layers move with the cursor instead of against it. */
  invert?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  "aria-hidden"?: boolean;
};

/**
 * Depth layer driven purely by the CSS vars published by usePointerField —
 * no per-element listeners, transform/opacity only.
 */
export function Parallax({
  depth = 6,
  invert = false,
  as: Tag = "div",
  className = "",
  style,
  children,
  ...rest
}: Props) {
  return (
    <Tag
      className={`parallax ${className}`}
      style={{ ["--depth" as string]: invert ? depth : -depth, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
