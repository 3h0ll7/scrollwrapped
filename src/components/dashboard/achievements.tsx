import { motion } from "motion/react";
import { formatMiles, formatNumber, type CalcResult } from "@/lib/scrollmiles";

interface Ach {
  emoji: string;
  title: string;
  desc: string;
  unlocked: boolean;
  progress: number;
}

const achievements = (r: CalcResult): Ach[] => [
  {
    emoji: "🏅",
    title: "First Mile",
    desc: "Scrolled your first thumb mile",
    unlocked: r.thumbMiles >= 1,
    progress: Math.min(1, r.thumbMiles / 1),
  },
  {
    emoji: "💯",
    title: "100K Scrolls",
    desc: "One hundred thousand flicks",
    unlocked: r.totalScrolls >= 100_000,
    progress: Math.min(1, r.totalScrolls / 100_000),
  },
  {
    emoji: "👍",
    title: "10 Miles Thumb",
    desc: "Ten miles of thumb travel",
    unlocked: r.thumbMiles >= 10,
    progress: Math.min(1, r.thumbMiles / 10),
  },
  {
    emoji: "🏃",
    title: "Scroll Marathon",
    desc: "26.2 miles of content scrolled",
    unlocked: r.contentMiles >= 26.2,
    progress: Math.min(1, r.contentMiles / 26.2),
  },
  {
    emoji: "♾️",
    title: "Endless Feed Survivor",
    desc: "Survived 1M+ scrolls",
    unlocked: r.totalScrolls >= 1_000_000,
    progress: Math.min(1, r.totalScrolls / 1_000_000),
  },
  {
    emoji: "🌍",
    title: "Cross-Country",
    desc: "Content scrolled 2,800+ miles",
    unlocked: r.contentMiles >= 2800,
    progress: Math.min(1, r.contentMiles / 2800),
  },
];

export function Achievements({ r }: { r: CalcResult }) {
  const list = achievements(r);
  return (
    <section className="rounded-3xl bg-card border border-border shadow-soft p-6 lg:p-8">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Achievements</div>
          <h2 className="mt-1 text-2xl font-display font-bold tracking-tight">Badges earned</h2>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{list.filter((a) => a.unlocked).length}</span> / {list.length} unlocked
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {list.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.04 * i }}
            className={`relative rounded-2xl p-4 border transition ${
              a.unlocked
                ? "bg-gradient-soft border-border shadow-soft"
                : "bg-muted/40 border-border/60"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl grid place-items-center text-xl ${
                  a.unlocked ? "bg-gradient-hero shadow-glow-purple" : "bg-muted"
                }`}
              >
                <span className={a.unlocked ? "" : "grayscale opacity-50"}>{a.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{a.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{a.desc}</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full ${a.unlocked ? "bg-gradient-hero" : "bg-muted-foreground/40"}`}
                style={{ width: `${a.progress * 100}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-medium text-muted-foreground">
              <span>{Math.round(a.progress * 100)}%</span>
              <span>
                {a.title.includes("Scrolls")
                  ? formatNumber(r.totalScrolls)
                  : a.title.includes("Thumb") || a.title === "First Mile"
                    ? `${formatMiles(r.thumbMiles)} mi`
                    : `${formatMiles(r.contentMiles)} mi`}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
