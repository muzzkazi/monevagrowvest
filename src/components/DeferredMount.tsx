import { useEffect, useRef, useState, ReactNode } from "react";

interface DeferredMountProps {
  children: ReactNode;
  /** Distance (CSS px) from the viewport at which to mount the children. */
  rootMargin?: string;
  /** Min-height to reserve to prevent layout shift before children mount. */
  minHeight?: number | string;
  /** Always mount after this many ms even if never scrolled. */
  fallbackDelayMs?: number;
}

/**
 * Mounts children only when the placeholder approaches the viewport
 * (or after a fallback timeout). Useful for deferring heavy below-the-fold
 * sections + their network calls until they're actually needed.
 */
const DeferredMount = ({
  children,
  rootMargin = "400px",
  minHeight = 320,
  fallbackDelayMs = 4000,
}: DeferredMountProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount) return;
    if (!("IntersectionObserver" in window)) {
      setShouldMount(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldMount(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    const t = window.setTimeout(() => setShouldMount(true), fallbackDelayMs);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [shouldMount, rootMargin, fallbackDelayMs]);

  return (
    <div ref={ref} style={!shouldMount ? { minHeight } : undefined}>
      {shouldMount ? children : null}
    </div>
  );
};

export default DeferredMount;
