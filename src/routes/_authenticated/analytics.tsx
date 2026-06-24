import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardPage, MetricCard, PageHero, getDailySeries } from "@/components/dashboard/page-kit";

export const Route = createFileRoute("/_authenticated/analytics")({ head: () => ({ meta: [{ title: "Analytics — ScrollMiles" }] }), component: AnalyticsPage });

function AnalyticsPage() {
  return <DashboardPage>{(data) => {
    const series = getDailySeries(data);
    const apps = (data.apps?.length ? data.apps : [
      { app_name: "Social", screen_time_minutes: 145 }, { app_name: "Video", screen_time_minutes: 96 }, { app_name: "Messages", screen_time_minutes: 54 }, { app_name: "Reading", screen_time_minutes: 38 },
    ]).slice(0, 6).map((a: any) => ({ name: a.app_name ?? a.package_name ?? "App", minutes: Math.round(Number(a.screen_time_minutes ?? 0)) }));
    const total = series.reduce((sum, d) => sum + d.screen, 0);
    return <>
      <PageHero eyebrow="Analytics" title="Your scrolling patterns, decoded" body="Track usage charts, screen-time trends, app mix, and thumb-distance momentum from verified data when available." />
      <div className="grid md:grid-cols-3 gap-4"><MetricCard label="14-day screen time" value={`${total}m`} detail="Combined active minutes in the trend window." /><MetricCard label="Peak day" value={`${Math.max(...series.map(d => d.screen))}m`} detail="Highest daily screen-time total in this view." /><MetricCard label="Tracked apps" value={`${apps.length}`} detail="Apps contributing to your current breakdown." /></div>
      <section className="rounded-3xl bg-card border border-border p-6 shadow-soft"><h2 className="text-xl font-bold tracking-tight">Screen time trends</h2><div className="mt-6 h-72"><ResponsiveContainer><AreaChart data={series}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="day" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip/><Area type="monotone" dataKey="screen" stroke="var(--brand-purple)" fill="var(--brand-purple)" fillOpacity={0.18}/></AreaChart></ResponsiveContainer></div></section>
      <div className="grid lg:grid-cols-2 gap-6"><section className="rounded-3xl bg-card border border-border p-6 shadow-soft"><h2 className="text-xl font-bold tracking-tight">Usage charts</h2><div className="mt-6 h-72"><ResponsiveContainer><BarChart data={series}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="day" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip/><Bar dataKey="scrolls" fill="var(--brand-blue)" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div></section><section className="rounded-3xl bg-card border border-border p-6 shadow-soft"><h2 className="text-xl font-bold tracking-tight">App usage breakdown</h2><div className="mt-6 h-72"><ResponsiveContainer><PieChart><Pie data={apps} dataKey="minutes" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={4}>{apps.map((_: any, i: number) => <Cell key={i} fill={["var(--brand-purple)","var(--brand-blue)","var(--brand-pink)","#22c55e","#f59e0b","#06b6d4"][i % 6]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div></section></div>
    </>;
  }}</DashboardPage>;
}
