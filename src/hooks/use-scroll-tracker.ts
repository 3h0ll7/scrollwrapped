import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { recordWebScrolls } from "@/lib/dashboard.functions";

// Tracks real scroll distance on the page using touchmove / wheel / scroll events.
// Aggregates locally and flushes every 20s and on visibility change.
export function useScrollTracker(enabled: boolean) {
  const sendFn = useServerFn(recordWebScrolls);
  const buf = useRef({ scrolls: 0, thumb_cm: 0, content_cm: 0, seconds_active: 0 });
  const lastTouchY = useRef<number | null>(null);
  const lastActiveTick = useRef(Date.now());

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Convert px → cm using device pixel ratio + a rough 96 dpi baseline.
    const dpr = window.devicePixelRatio || 1;
    const pxToCm = (px: number) => (px / dpr / 96) * 2.54;

    function flushTick() {
      lastActiveTick.current = Date.now();
    }

    function onWheel(e: WheelEvent) {
      const dy = Math.abs(e.deltaY);
      if (dy < 5) return;
      buf.current.scrolls += 1;
      buf.current.thumb_cm += pxToCm(dy) * 0.5; // wheel ≈ partial thumb sweep
      buf.current.content_cm += pxToCm(dy);
      flushTick();
    }
    function onTouchStart(e: TouchEvent) {
      lastTouchY.current = e.touches[0]?.clientY ?? null;
    }
    function onTouchMove(e: TouchEvent) {
      const y = e.touches[0]?.clientY;
      if (y == null || lastTouchY.current == null) return;
      const dy = Math.abs(y - lastTouchY.current);
      if (dy < 3) return;
      buf.current.thumb_cm += pxToCm(dy);
      buf.current.content_cm += pxToCm(dy);
      lastTouchY.current = y;
      flushTick();
    }
    function onTouchEnd() {
      lastTouchY.current = null;
      buf.current.scrolls += 1;
    }

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    async function flush() {
      const seconds = Math.min(60, (Date.now() - lastActiveTick.current) / 1000);
      const data = { ...buf.current, seconds_active: Math.max(buf.current.seconds_active, seconds) };
      if (data.scrolls < 1) return;
      buf.current = { scrolls: 0, thumb_cm: 0, content_cm: 0, seconds_active: 0 };
      try {
        await sendFn({ data });
      } catch {
        // Drop silently — best-effort tracker.
      }
    }

    const id = window.setInterval(flush, 20_000);
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("visibilitychange", onHide);
      window.clearInterval(id);
      flush();
    };
  }, [enabled, sendFn]);
}
