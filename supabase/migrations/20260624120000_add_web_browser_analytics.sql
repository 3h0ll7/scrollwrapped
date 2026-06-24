-- Store verified browser analytics captured from authenticated web sessions.
ALTER TABLE public.daily_metrics
  ADD COLUMN IF NOT EXISTS wheel_events INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS touch_scroll_events INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interaction_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS visit_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_scroll_percent NUMERIC NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.daily_metrics.wheel_events IS 'Verified browser mouse wheel events for this user/day/source.';
COMMENT ON COLUMN public.daily_metrics.touch_scroll_events IS 'Verified browser touch scroll move events for this user/day/source.';
COMMENT ON COLUMN public.daily_metrics.interaction_count IS 'Verified browser interactions, including scroll inputs, clicks, touches, and key presses.';
COMMENT ON COLUMN public.daily_metrics.visit_count IS 'Verified authenticated browser visits for this user/day/source.';
COMMENT ON COLUMN public.daily_metrics.max_scroll_percent IS 'Farthest page depth reached in verified browser tracking.';
