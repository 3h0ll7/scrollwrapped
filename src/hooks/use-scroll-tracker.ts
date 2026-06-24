import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { recordWebAnalytics } from "@/lib/dashboard.functions";

type AnalyticsBuffer = {
  wheel_events: number;
  touch_scroll_events: number;
  session_seconds: number;
  daily_visits: number;
  interaction_count: number;
  page_scroll_cm: number;
  max_scroll_percent: number;
};

const emptyBuffer = (): AnalyticsBuffer => ({
  wheel_events: 0,
  touch_scroll_events: 0,
  session_seconds: 0,
  daily_visits: 0,
  interaction_count: 0,
  page_scroll_cm: 0,
  max_scroll_percent: 0,
});

// Tracks real browser analytics for authenticated users and periodically flushes to Supabase.
export function useScrollTracker(enabled: boolean) {
  const sendFn = useServerFn(recordWebAnalytics);
  const buf = useRef<AnalyticsBuffer>(emptyBuffer());
  const lastTouchY = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const lastFlushAt = useRef(Date.now());

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const today = new Date().toISOString().slice(0, 10);
    const visitKey = `scrollmiles:web-visit:${today}`;
    if (window.sessionStorage.getItem(visitKey) !== "1") {
      window.sessionStorage.setItem(visitKey, "1");
      buf.current.daily_visits += 1;
    }

    const dpr = window.devicePixelRatio || 1;
    const pxToCm = (px: number) => (px / dpr / 96) * 2.54;
    const maxScrollPercent = () => {
      const doc = document.documentElement;
      const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
      return Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
    };
    const countInteraction = () => {
      buf.current.interaction_count += 1;
    };

    lastScrollY.current = window.scrollY;
    buf.current.max_scroll_percent = Math.max(buf.current.max_scroll_percent, maxScrollPercent());

    function onScroll() {
      const dy = Math.abs(window.scrollY - lastScrollY.current);
      if (dy >= 1) {
        buf.current.page_scroll_cm += pxToCm(dy);
        lastScrollY.current = window.scrollY;
      }
      buf.current.max_scroll_percent = Math.max(buf.current.max_scroll_percent, maxScrollPercent());
    }
    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaY) < 1 && Math.abs(e.deltaX) < 1) return;
      buf.current.wheel_events += 1;
      countInteraction();
    }
    function onTouchStart(e: TouchEvent) {
      lastTouchY.current = e.touches[0]?.clientY ?? null;
      countInteraction();
    }
    function onTouchMove(e: TouchEvent) {
      const y = e.touches[0]?.clientY;
      if (y == null || lastTouchY.current == null) return;
      if (Math.abs(y - lastTouchY.current) >= 3) {
        buf.current.touch_scroll_events += 1;
        lastTouchY.current = y;
      }
    }
    function onTouchEnd() {
      lastTouchY.current = null;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("click", countInteraction, { passive: true });
    window.addEventListener("keydown", countInteraction);

    async function flush() {
      const now = Date.now();
      buf.current.session_seconds += Math.max(0, (now - lastFlushAt.current) / 1000);
      lastFlushAt.current = now;
      const data = {
        ...buf.current,
        session_seconds: Math.min(86_400, buf.current.session_seconds),
      };
      const hasData =
        data.daily_visits > 0 ||
        data.page_scroll_cm > 0 ||
        data.wheel_events > 0 ||
        data.touch_scroll_events > 0 ||
        data.interaction_count > 0 ||
        data.session_seconds >= 5;
      if (!hasData) return;
      buf.current = emptyBuffer();
      try {
        await sendFn({ data });
      } catch {
        // Browser tracking is best-effort and should never interrupt the app.
      }
    }

    const id = window.setInterval(flush, 15_000);
    const onHide = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("click", countInteraction);
      window.removeEventListener("keydown", countInteraction);
      document.removeEventListener("visibilitychange", onHide);
      window.clearInterval(id);
      void flush();
    };
  }, [enabled, sendFn]);
}
