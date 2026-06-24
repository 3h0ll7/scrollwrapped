import { motion } from "motion/react";
import { ArrowUpRight, Hand, Eye, MousePointerClick, Clock } from "lucide-react";
import { formatMiles, formatNumber, type CalcResult } from "@/lib/scrollmiles";

export function HeroCard({ r }: { r: CalcResult }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-gradient-hero text-white p-8 lg:p-10 shadow-glow-purple"
    >
      {/* glow orbs */}
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-pink-300/30 blur-3xl" />

      <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Total Miles Scrolled
          </div>
          <div className="mt-5 flex items-end gap-3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6, type: "spring" }}
              className="text-7xl md:text-8xl font-display font-black tracking-[-0.04em] leading-[0.9]"
            >
              {formatMiles(r.thumbMiles)}
            </motion.div>
            <div className="pb-3 text-xl font-semibold text-white/85">Miles</div>
          </div>
          <p className="mt-3 text-white/80 text-base max-w-sm">
            With your thumb — across feeds, reels, posts, and infinite timelines.
          </p>
          <button className="mt-7 inline-flex items-center gap-2 bg-white text-foreground px-5 py-3 rounded-xl text-sm font-semibold shadow-card hover:shadow-elevated transition">
            Share my ScrollMiles
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat icon={MousePointerClick} label="Total Scrolls" value={formatNumber(r.totalScrolls)} />
          <Stat icon={Hand} label="Daily Avg" value={formatNumber(r.dailyAverageScrolls)} />
          <Stat icon={Clock} label="Streak" value={`${r.currentStreakDays}d`} />
          <Stat icon={Eye} label="Content Mi" value={formatMiles(r.contentMiles)} />
        </div>
      </div>
    </motion.section>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Hand; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/12 backdrop-blur border border-white/15 p-4">
      <Icon className="w-4 h-4 text-white/80" />
      <div className="mt-3 text-2xl font-display font-bold tracking-tight leading-none">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wider text-white/70 font-medium">{label}</div>
    </div>
  );
}
