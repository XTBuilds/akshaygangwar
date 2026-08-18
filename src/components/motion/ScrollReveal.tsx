import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * Fade + rise + micro-scale on first entry. Children stagger via CSS
 * nth-child delays when `stagger` is set. Content is visible without JS
 * (the hidden state is only applied after mount, motion permitting).
 */
export function ScrollReveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  stagger = false,
  id,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    setShown(false);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      className={`reveal ${stagger ? "reveal-stagger" : ""} ${shown ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
