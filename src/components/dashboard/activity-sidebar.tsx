import { motion } from "motion/react";
import { Instagram, Youtube } from "lucide-react";
import { formatNumber, type CalcResult } from "@/lib/scrollmiles";

// icons that lucide doesn't carry — use letters as glyphs
function TikTokGlyph() {
  return <span className="font-display font-black text-base">♪</span>;
}
function XGlyph() {
  return <span className="font-display font-black text-base">𝕏</span>;
}
function RedditGlyph() {
  return <span className="font-display font-black text-base">r/</span>;
}

const apps = (r: CalcResult) => {
  const total = r.dailyAverageScrolls;
  const splits = [0.34, 0.27, 0.18, 0.12, 0.09];
  const defs = [
    { name: "Instagram", icon: <Instagram className="w-4 h-4" />, color: "from-pink-500 to-fuchsia-500" },
    { name: "TikTok", icon: <TikTokGlyph />, color: "from-slate-800 to-slate-950" },
    { name: "YouTube", icon: <Youtube className="w-4 h-4" />, color: "from-red-500 to-rose-600" },
    { name: "X", icon: <XGlyph />, color: "from-zinc-800 to-black" },
    { name: "Reddit", icon: <RedditGlyph />, color: "from-orange-500 to-red-500" },
  ];
  return defs.map((d, i) => {
    const scrolls = Math.round(total * splits[i]);
    const minutes = Math.round(scrolls / 14);
    const meters = (scrolls * 3.5) / 100;
    return { ...d, scrolls, minutes, meters };
  });
};

export function ActivitySidebar({ r }: { r: CalcResult }) {
  const data = apps(r);
  return (
    <aside className="rounded-3xl bg-card border border-border shadow-soft p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Today</div>
          <h3 className="mt-1 text-lg font-display font-bold tracking-tight">Active apps</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">Live</span>
      </div>
      <div className="mt-5 space-y-3">
        {data.map((a, i) => (
          <motion.div
            key={a.name}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} text-white grid place-items-center shadow-soft`}>
              {a.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold truncate">{a.name}</div>
                <div className="text-xs font-semibold text-foreground">{formatNumber(a.scrolls)}</div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{a.minutes}m</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>{a.meters.toFixed(1)}m thumb</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${a.color}`}
                  style={{ width: `${Math.min(100, (a.scrolls / data[0].scrolls) * 100)}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </aside>
  );
}
