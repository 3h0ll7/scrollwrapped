import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { funInsights, type CalcResult } from "@/lib/scrollmiles";

export function FunInsights({ r }: { r: CalcResult }) {
  const insights = funInsights(r);
  return (
    <section className="rounded-3xl p-6 lg:p-8 bg-gradient-soft border border-border shadow-soft">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-hero grid place-items-center shadow-glow-purple">
          <Sparkles className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">AI-powered</div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Fun insights</h2>
        </div>
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-3">
        {insights.map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="p-5 rounded-2xl bg-surface border border-border shadow-soft"
          >
            <div className="text-2xl">
              {["🤯", "🌎", "📱", "👍", "🏃‍♂️", "🚀"][i % 6]}
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-foreground">{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
