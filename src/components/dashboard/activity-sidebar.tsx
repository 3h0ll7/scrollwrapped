import { motion } from "motion/react";
import { Clock, Mouse, MousePointerClick, MoveDown, Smartphone, Users } from "lucide-react";
import { formatNumber } from "@/lib/scrollmiles";

type BrowserAnalytics = {
  scrolls: number;
  thumbCm: number;
  contentCm: number;
  screenMin: number;
  wheelEvents: number;
  touchScrollEvents: number;
  interactions: number;
  visits: number;
  maxScrollPercent: number;
};

const meters = (cm: number) => cm / 100;

export function ActivitySidebar({ analytics }: { analytics: BrowserAnalytics }) {
  const rows = [
    {
      label: "Page scroll distance",
      value: `${formatNumber(meters(analytics.contentCm))}m`,
      detail: `${analytics.maxScrollPercent.toFixed(0)}% max page depth`,
      icon: MoveDown,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Mouse wheel events",
      value: formatNumber(analytics.wheelEvents),
      detail: "Captured from wheel input",
      icon: Mouse,
      color: "from-purple-500 to-fuchsia-500",
    },
    {
      label: "Touch scroll events",
      value: formatNumber(analytics.touchScrollEvents),
      detail: "Captured from touchmove input",
      icon: Smartphone,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Session duration",
      value: `${formatNumber(analytics.screenMin)}m`,
      detail: "Authenticated web session time",
      icon: Clock,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Daily visits",
      value: formatNumber(analytics.visits),
      detail: "Unique browser sessions today",
      icon: Users,
      color: "from-pink-500 to-rose-500",
    },
    {
      label: "Total interactions",
      value: formatNumber(analytics.interactions),
      detail: "Scrolls, clicks, touches, and keys",
      icon: MousePointerClick,
      color: "from-slate-700 to-slate-950",
    },
  ];

  return (
    <aside className="rounded-3xl bg-card border border-border shadow-soft p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Verified web data</div>
          <h3 className="mt-1 text-lg font-display font-bold tracking-tight">Browser analytics</h3>
        </div>
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Live</span>
      </div>
      <div className="mt-5 space-y-3">
        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${row.color} text-white grid place-items-center shadow-soft`}>
              <row.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold truncate">{row.label}</div>
                <div className="text-xs font-semibold text-foreground">{row.value}</div>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{row.detail}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </aside>
  );
}
