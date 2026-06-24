import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BarChart3, Activity, Trophy, FileText, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Activity", to: "/activity", icon: Activity },
  { label: "Achievements", to: "/achievements", icon: Trophy },
  { label: "Reports", to: "/reports", icon: FileText },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-border bg-surface/60 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-6 h-20 border-b border-border">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-hero grid place-items-center shadow-glow-purple">
          <Sparkles className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="font-display font-bold text-base tracking-tight">ScrollMiles</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Thumb Analytics</div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {items.map((it) => {
          const active = pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-gradient-hero text-white shadow-glow-purple"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <it.icon className="w-4.5 h-4.5" strokeWidth={2} />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-4 p-4 rounded-2xl bg-gradient-soft border border-border">
        <div className="text-xs font-semibold text-foreground">Pro insights</div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Unlock yearly Wrapped, AI insights, and leaderboards.
        </p>
        <button className="mt-3 w-full text-xs font-semibold py-2 rounded-lg bg-foreground text-background hover:opacity-90 transition">
          Upgrade
        </button>
      </div>
    </aside>
  );
}
