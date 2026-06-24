import { ShieldCheck, Sparkles } from "lucide-react";

export function DataSourceBadge({ source }: { source: "verified" | "estimated" | "mixed" }) {
  if (source === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
        <ShieldCheck className="w-3.5 h-3.5" />
        Verified Web Data
      </span>
    );
  }
  if (source === "mixed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold border border-blue-500/20">
        <ShieldCheck className="w-3.5 h-3.5" />
        Verified Web Data + Estimates
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold border border-amber-500/20">
      <Sparkles className="w-3.5 h-3.5" />
      Estimated Data
    </span>
  );
}
