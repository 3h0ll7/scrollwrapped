import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { generateSeries, type CalcResult } from "@/lib/scrollmiles";

const RANGES = [
  { label: "Day", days: 1 },
  { label: "Week", days: 7 },
  { label: "Month", days: 30 },
  { label: "Year", days: 365 },
  { label: "Lifetime", days: 730 },
] as const;

export function ScrollChart({ r }: { r: CalcResult }) {
  const [range, setRange] = useState<(typeof RANGES)[number]["label"]>("Month");
  const days = RANGES.find((x) => x.label === range)!.days;
  const data = useMemo(() => generateSeries(r, days), [r, days]);

  return (
    <section className="rounded-3xl bg-card border border-border shadow-soft p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Scroll analytics</div>
          <h2 className="mt-1 text-2xl font-display font-bold tracking-tight">Distance over time</h2>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <Legend color="var(--brand-purple)" label="Thumb distance (mi)" />
            <Legend color="var(--brand-blue)" label="Content distance (mi)" />
          </div>
        </div>
        <div className="inline-flex bg-muted rounded-xl p-1">
          {RANGES.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setRange(opt.label)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                range === opt.label
                  ? "bg-surface text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="thumbFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-purple)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--brand-purple)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="contentFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-blue)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--brand-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                boxShadow: "var(--shadow-md)",
                fontSize: 12,
              }}
              labelStyle={{ fontWeight: 600, color: "var(--foreground)" }}
            />
            <Area type="monotone" dataKey="content" stroke="var(--brand-blue)" strokeWidth={2.5} fill="url(#contentFill)" />
            <Area type="monotone" dataKey="thumb" stroke="var(--brand-purple)" strokeWidth={2.5} fill="url(#thumbFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="font-medium">{label}</span>
    </div>
  );
}
