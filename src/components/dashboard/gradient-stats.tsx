import { motion } from "motion/react";
import { Hand, Eye, MousePointerClick, Smartphone, ShieldCheck } from "lucide-react";
import { formatMiles, formatNumber, type CalcResult } from "@/lib/scrollmiles";

const cards = (r: CalcResult) => [
  {
    title: "Thumb Distance",
    value: formatMiles(r.thumbMiles),
    unit: "miles",
    sub: "Physical thumb travel",
    icon: Hand,
    gradient: "bg-gradient-purple",
    glow: "shadow-glow-purple",
  },
  {
    title: "Content Distance",
    value: formatNumber(r.contentMiles),
    unit: "miles",
    sub: "Feed scrolled visually",
    icon: Eye,
    gradient: "bg-gradient-blue",
    glow: "shadow-glow-blue",
  },
  {
    title: "Lifetime Scrolls",
    value: formatNumber(r.totalScrolls),
    unit: "scrolls",
    sub: "Individual flicks",
    icon: MousePointerClick,
    gradient: "bg-gradient-pink",
    glow: "shadow-glow-pink",
  },
  {
    title: "Screen Time",
    value: formatNumber(r.lifetimeScreenHours),
    unit: "hours",
    sub: "Lifetime glow exposure",
    icon: Smartphone,
    gradient: "bg-gradient-purple",
    glow: "shadow-glow-purple",
  },
];

export function GradientStats({ r, verified }: { r: CalcResult; verified: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards(r).map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.4 }}
          className={`relative overflow-hidden rounded-3xl ${c.gradient} ${c.glow} p-6 text-white`}
        >
          <div className="absolute -top-12 -right-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur grid place-items-center">
              <c.icon className="w-4.5 h-4.5" />
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 backdrop-blur px-2 py-1 rounded-full">
              {verified ? <ShieldCheck className="w-3 h-3" /> : null}
              {verified ? "Verified Web Data" : "Estimated"}
            </div>
          </div>
          <div className="relative mt-6">
            <div className="text-xs uppercase tracking-widest text-white/75 font-semibold">{c.title}</div>
            <div className="mt-2 flex items-end gap-1.5">
              <div className="text-4xl font-display font-black tracking-tight leading-none">{c.value}</div>
              <div className="pb-1 text-sm font-medium text-white/80">{c.unit}</div>
            </div>
            <div className="mt-1 text-xs text-white/75">{c.sub}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
