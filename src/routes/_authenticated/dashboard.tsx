import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopHeader } from "@/components/dashboard/top-header";
import { HeroCard } from "@/components/dashboard/hero-card";
import { GradientStats } from "@/components/dashboard/gradient-stats";
import { ScrollChart } from "@/components/dashboard/scroll-chart";
import { ActivitySidebar } from "@/components/dashboard/activity-sidebar";
import { Achievements } from "@/components/dashboard/achievements";
import { CalculatorCard } from "@/components/dashboard/calculator-card";
import { DataSourceBadge } from "@/components/dashboard/data-source-badge";
import {
  calculateScrollMiles,
  DEFAULT_INPUT,
  type CalcInput,
  formatNumber,
} from "@/lib/scrollmiles";
import {
  getDashboardData,
  saveCalculatorInputs,
  generateInsights,
  unlockBadges,
} from "@/lib/dashboard.functions";
import { useScrollTracker } from "@/hooks/use-scroll-tracker";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — ScrollMiles" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getData = useServerFn(getDashboardData);
  const saveInputs = useServerFn(saveCalculatorInputs);
  const genInsights = useServerFn(generateInsights);
  const unlock = useServerFn(unlockBadges);

  useScrollTracker(true);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getData(),
  });

  const [input, setInput] = useState<CalcInput>(DEFAULT_INPUT);
  useEffect(() => {
    if (data?.profile) {
      setInput({
        age: data.profile.age ?? DEFAULT_INPUT.age,
        yearsOwningSmartphone: Number(data.profile.years_owning_smartphone ?? DEFAULT_INPUT.yearsOwningSmartphone),
        dailyScreenTimeHours: Number(data.profile.daily_screen_time_hours ?? DEFAULT_INPUT.dailyScreenTimeHours),
        socialMediaHours: Number(data.profile.social_media_hours ?? DEFAULT_INPUT.socialMediaHours),
      });
    }
  }, [data?.profile]);

  const estimated = useMemo(() => calculateScrollMiles(input), [input]);

  // Merge real (verified) totals with estimated lifetime
  const verifiedTotals = useMemo(() => {
    const d = data?.daily ?? [];
    return d.reduce(
      (acc, row) => ({
        scrolls: acc.scrolls + (row.total_scrolls ?? 0),
        thumbCm: acc.thumbCm + Number(row.thumb_cm ?? 0),
        contentCm: acc.contentCm + Number(row.content_cm ?? 0),
        screenMin: acc.screenMin + Number(row.screen_time_minutes ?? 0),
      }),
      { scrolls: 0, thumbCm: 0, contentCm: 0, screenMin: 0 },
    );
  }, [data?.daily]);

  const merged = useMemo(() => {
    const cmPerMile = 160934.4;
    const verifiedMiles = verifiedTotals.thumbCm / cmPerMile;
    const verifiedContentMiles = verifiedTotals.contentCm / cmPerMile;
    return {
      ...estimated,
      thumbMiles: estimated.thumbMiles + verifiedMiles,
      contentMiles: estimated.contentMiles + verifiedContentMiles,
      totalScrolls: estimated.totalScrolls + verifiedTotals.scrolls,
    };
  }, [estimated, verifiedTotals]);

  const saveMut = useMutation({
    mutationFn: async (next: CalcInput) => saveInputs({ data: next }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });

  const insightMut = useMutation({
    mutationFn: async () => genInsights(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });

  // Auto-unlock badges when totals change meaningfully
  useEffect(() => {
    if (!data) return;
    unlock({ data: { thumbMiles: merged.thumbMiles, totalScrolls: merged.totalScrolls } })
      .then((r) => {
        if (r.unlocked.length) qc.invalidateQueries({ queryKey: ["dashboard"] });
      })
      .catch(() => {});
  }, [data, merged.thumbMiles, merged.totalScrolls, unlock, qc]);

  function updateInput(next: CalcInput) {
    setInput(next);
    saveMut.mutate(next);
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const profile = data?.profile;
  const source = (profile?.data_source ?? "estimated") as "estimated" | "verified" | "mixed";
  const insights = data?.insights ?? [];
  const earnedBadges = new Set((data?.badges ?? []).map((b) => b.code));

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader
          name={profile?.display_name ?? profile?.email ?? "You"}
          avatarUrl={profile?.avatar_url ?? null}
          onSignOut={signOut}
        />
        <main className="flex-1 p-6 lg:p-10 space-y-6 lg:space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <DataSourceBadge source={source} />
            <span className="text-xs text-muted-foreground">
              {source === "verified"
                ? "Powered by your device's real screen-time data."
                : "Based on your inputs below. Connect a companion app for verified data."}
            </span>
          </div>

          <div className="grid xl:grid-cols-[1fr_340px] gap-6 lg:gap-8">
            <div className="space-y-6 lg:space-y-8 min-w-0">
              <HeroCard r={merged} />
              <GradientStats r={merged} />
              <ScrollChart r={merged} />
            </div>
            <div className="space-y-6">
              <ActivitySidebar r={merged} />
              <IngestCard token={profile?.ingest_token ?? ""} />
            </div>
          </div>

          <Achievements r={merged} earned={earnedBadges} />

          <AiInsights
            insights={insights.map((i) => i.body)}
            loading={insightMut.isPending}
            onGenerate={() => insightMut.mutate()}
          />

          <CalculatorCard input={input} onChange={updateInput} />

          <footer className="pt-6 pb-2 text-center text-xs text-muted-foreground">
            ScrollMiles © {new Date().getFullYear()} — Real data when available, transparent estimates otherwise.
          </footer>
        </main>
      </div>
    </div>
  );
}

function AiInsights({
  insights,
  loading,
  onGenerate,
}: {
  insights: string[];
  loading: boolean;
  onGenerate: () => void;
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold tracking-tight">AI Insights</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Personalized observations from your data.</p>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="h-9 px-3 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {insights.length ? "Refresh" : "Generate"}
        </button>
      </div>
      {insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">No insights yet. Click Generate to get your first batch.</p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {insights.map((s, i) => (
            <li
              key={i}
              className="rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function IngestCard({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="rounded-3xl border border-dashed border-border bg-surface p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Connect real device data
      </div>
      <p className="text-sm mt-2 text-foreground/80 leading-relaxed">
        Use this token in the ScrollMiles companion app (Android / iOS) to upload verified Digital Wellbeing & Screen Time data.
      </p>
      <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-muted">
        <code className="text-[11px] flex-1 truncate font-mono">{token || "—"}</code>
        <button
          onClick={() => {
            if (!token) return;
            navigator.clipboard.writeText(token);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="h-7 w-7 grid place-items-center rounded-md hover:bg-background transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <p className="text-[11px] mt-3 text-muted-foreground">
        Endpoint: <code className="font-mono">POST /api/public/ingest</code>
      </p>
    </section>
  );
}
