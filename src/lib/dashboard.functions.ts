import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const InputSchema = z.object({
  age: z.number().min(5).max(120),
  yearsOwningSmartphone: z.number().min(0).max(80),
  dailyScreenTimeHours: z.number().min(0).max(24),
  socialMediaHours: z.number().min(0).max(24),
});

export const getDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profileRes, dailyRes, appsRes, badgesRes, insightsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("daily_metrics")
        .select("*")
        .eq("user_id", userId)
        .order("day", { ascending: false })
        .limit(90),
      supabase
        .from("app_metrics")
        .select("*")
        .eq("user_id", userId)
        .order("day", { ascending: false })
        .limit(500),
      supabase.from("badges").select("*").eq("user_id", userId),
      supabase
        .from("insights")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    return {
      profile: profileRes.data,
      daily: dailyRes.data ?? [],
      apps: appsRes.data ?? [],
      badges: badgesRes.data ?? [],
      insights: insightsRes.data ?? [],
    };
  });

export const saveCalculatorInputs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({
        age: data.age,
        years_owning_smartphone: data.yearsOwningSmartphone,
        daily_screen_time_hours: data.dailyScreenTimeHours,
        social_media_hours: data.socialMediaHours,
        onboarded: true,
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const WebAnalyticsPing = z.object({
  wheel_events: z.number().int().min(0).max(1_000_000),
  touch_scroll_events: z.number().int().min(0).max(1_000_000),
  session_seconds: z.number().min(0).max(86_400),
  daily_visits: z.number().int().min(0).max(100),
  interaction_count: z.number().int().min(0).max(1_000_000),
  page_scroll_cm: z.number().min(0).max(10_000_000),
  max_scroll_percent: z.number().min(0).max(100),
});

export const recordWebAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => WebAnalyticsPing.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);
    const totalScrollEvents = data.wheel_events + data.touch_scroll_events;

    const { data: existing, error: selectError } = await supabase
      .from("daily_metrics")
      .select("*")
      .eq("user_id", userId)
      .eq("day", today)
      .eq("source", "web")
      .maybeSingle();

    if (selectError) throw new Error(selectError.message);

    if (existing) {
      const { error } = await supabase
        .from("daily_metrics")
        .update({
          total_scrolls: existing.total_scrolls + totalScrollEvents,
          thumb_cm: Number(existing.thumb_cm) + data.page_scroll_cm,
          content_cm: Number(existing.content_cm) + data.page_scroll_cm,
          screen_time_minutes: Number(existing.screen_time_minutes) + data.session_seconds / 60,
          sessions: Number(existing.sessions ?? 0) + data.daily_visits,
          app_opens: Number(existing.app_opens ?? 0) + data.interaction_count,
          wheel_events: Number(existing.wheel_events ?? 0) + data.wheel_events,
          touch_scroll_events: Number(existing.touch_scroll_events ?? 0) + data.touch_scroll_events,
          interaction_count: Number(existing.interaction_count ?? 0) + data.interaction_count,
          visit_count: Number(existing.visit_count ?? 0) + data.daily_visits,
          max_scroll_percent: Math.max(Number(existing.max_scroll_percent ?? 0), data.max_scroll_percent),
        })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("daily_metrics").insert({
        user_id: userId,
        day: today,
        total_scrolls: totalScrollEvents,
        thumb_cm: data.page_scroll_cm,
        content_cm: data.page_scroll_cm,
        screen_time_minutes: data.session_seconds / 60,
        sessions: data.daily_visits,
        app_opens: data.interaction_count,
        wheel_events: data.wheel_events,
        touch_scroll_events: data.touch_scroll_events,
        interaction_count: data.interaction_count,
        visit_count: data.daily_visits,
        max_scroll_percent: data.max_scroll_percent,
        source: "web",
      });
      if (error) throw new Error(error.message);
    }

    await supabase.from("profiles").update({ data_source: "verified" }).eq("id", userId);

    return { ok: true };
  });

export const generateInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");

    const [{ data: daily }, { data: apps }, { data: profile }] = await Promise.all([
      supabase
        .from("daily_metrics")
        .select("*")
        .eq("user_id", userId)
        .order("day", { ascending: false })
        .limit(30),
      supabase
        .from("app_metrics")
        .select("*")
        .eq("user_id", userId)
        .order("day", { ascending: false })
        .limit(60),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    ]);

    const summary = {
      profile: profile
        ? {
            age: profile.age,
            screen_time_hours: profile.daily_screen_time_hours,
            social_hours: profile.social_media_hours,
            years_owning_smartphone: profile.years_owning_smartphone,
          }
        : null,
      last30Days: daily ?? [],
      apps: apps ?? [],
    };

    const prompt = `You are a witty, friendly data analyst for ScrollMiles, an app that tracks how far users have scrolled with their thumb. 
Generate exactly 5 short, punchy, personal insights about this user's data. Each must be one sentence (max 18 words), specific, and use real numbers when possible. 
Tone: Spotify Wrapped meets Apple Health. Avoid generic statements. Vary topics: time, distance, comparisons, behavior, trends.
Return ONLY a JSON array of 5 strings, no preamble.

USER DATA:
${JSON.stringify(summary).slice(0, 6000)}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? "[]";
    let lines: string[] = [];
    try {
      const parsed = JSON.parse(content);
      lines = Array.isArray(parsed) ? parsed : Array.isArray(parsed.insights) ? parsed.insights : [];
    } catch {
      lines = [];
    }
    lines = lines.filter((s) => typeof s === "string" && s.length > 0).slice(0, 5);

    if (lines.length > 0) {
      await supabase.from("insights").insert(
        lines.map((body) => ({ user_id: userId, body, kind: "weekly" })),
      );
    }
    return { insights: lines };
  });

const BadgeList = [
  { code: "first_mile", label: "First Mile", test: (totals: Totals) => totals.thumbMiles >= 1 },
  { code: "scrolls_100k", label: "100K Scrolls", test: (t: Totals) => t.totalScrolls >= 100_000 },
  { code: "scroll_marathon", label: "Scroll Marathon", test: (t: Totals) => t.thumbMiles >= 26.2 },
  { code: "thumb_athlete", label: "Thumb Athlete", test: (t: Totals) => t.thumbMiles >= 100 },
  { code: "endless_feed", label: "Endless Feed Survivor", test: (t: Totals) => t.totalScrolls >= 1_000_000 },
];
type Totals = { thumbMiles: number; totalScrolls: number };

export const unlockBadges = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ thumbMiles: z.number(), totalScrolls: z.number() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const earned = BadgeList.filter((b) => b.test(data)).map((b) => b.code);
    if (earned.length === 0) return { unlocked: [] };
    const { data: existing } = await supabase
      .from("badges")
      .select("code")
      .eq("user_id", userId);
    const have = new Set((existing ?? []).map((b: { code: string }) => b.code));
    const toInsert = earned.filter((c) => !have.has(c)).map((code) => ({ user_id: userId, code }));
    if (toInsert.length > 0) await supabase.from("badges").insert(toInsert);
    return { unlocked: toInsert.map((b) => b.code) };
  });
