
-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  age INT,
  years_owning_smartphone NUMERIC,
  daily_screen_time_hours NUMERIC,
  social_media_hours NUMERIC,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  ingest_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  data_source TEXT NOT NULL DEFAULT 'estimated' CHECK (data_source IN ('estimated','verified','mixed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_profile_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own_profile_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own_profile_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Daily metrics (real or estimated)
CREATE TABLE public.daily_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  screen_time_minutes NUMERIC NOT NULL DEFAULT 0,
  total_scrolls INT NOT NULL DEFAULT 0,
  thumb_cm NUMERIC NOT NULL DEFAULT 0,
  content_cm NUMERIC NOT NULL DEFAULT 0,
  sessions INT NOT NULL DEFAULT 0,
  app_opens INT NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'estimated' CHECK (source IN ('estimated','android','ios','web')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, day, source)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_metrics TO authenticated;
GRANT ALL ON public.daily_metrics TO service_role;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_daily_all" ON public.daily_metrics FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX daily_metrics_user_day_idx ON public.daily_metrics(user_id, day DESC);

-- Per-app metrics
CREATE TABLE public.app_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  app_id TEXT NOT NULL,
  minutes NUMERIC NOT NULL DEFAULT 0,
  opens INT NOT NULL DEFAULT 0,
  estimated_scrolls INT NOT NULL DEFAULT 0,
  thumb_cm NUMERIC NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'estimated',
  UNIQUE (user_id, day, app_id, source)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_metrics TO authenticated;
GRANT ALL ON public.app_metrics TO service_role;
ALTER TABLE public.app_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_app_all" ON public.app_metrics FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX app_metrics_user_day_idx ON public.app_metrics(user_id, day DESC);

-- Badges
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.badges TO authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_badges_all" ON public.badges FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI insights
CREATE TABLE public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'weekly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insights TO authenticated;
GRANT ALL ON public.insights TO service_role;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_insights_all" ON public.insights FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Profile auto-create trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
