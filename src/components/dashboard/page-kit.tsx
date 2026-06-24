import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardData } from "@/lib/dashboard.functions";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Loader2 } from "lucide-react";

export function useDashboardPageData() {
  const getData = useServerFn(getDashboardData);
  return useQuery({ queryKey: ["dashboard"], queryFn: () => getData() });
}

export function DashboardPage({ children }: { children: (data: any) => React.ReactNode }) {
  const { data, isLoading } = useDashboardPageData();

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const profile = data?.profile;
  return (
    <DashboardLayout name={profile?.display_name ?? profile?.email ?? "You"} avatarUrl={profile?.avatar_url ?? null}>
      <main className="flex-1 p-6 lg:p-10 space-y-6 lg:space-y-8">{children(data ?? {})}</main>
    </DashboardLayout>
  );
}

export function PageHero({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <section className="rounded-3xl bg-gradient-soft border border-border p-6 lg:p-8 shadow-soft">
      <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{eyebrow}</div>
      <h1 className="mt-2 text-3xl lg:text-4xl font-display font-bold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm lg:text-base text-muted-foreground leading-relaxed">{body}</p>
    </section>
  );
}

export function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl bg-card border border-border p-5 shadow-soft">
      <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</div>
      <div className="mt-2 text-3xl font-display font-bold tracking-tight">{value}</div>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

export function getDailySeries(data: any) {
    const daily = [...(data?.daily ?? [])].reverse().slice(-14);
    return daily.length ? daily.map((d: any) => ({
      day: new Date(d.day).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      screen: Math.round(Number(d.screen_time_minutes ?? 0)),
      scrolls: Number(d.total_scrolls ?? 0),
      thumb: Number(d.thumb_cm ?? 0) / 160934.4,
    })) : Array.from({ length: 7 }, (_, i) => ({ day: `Day ${i + 1}`, screen: [62, 88, 74, 109, 96, 121, 84][i], scrolls: [420, 610, 520, 780, 690, 860, 570][i], thumb: [0.08, 0.12, 0.1, 0.16, 0.13, 0.18, 0.11][i] }));
}
