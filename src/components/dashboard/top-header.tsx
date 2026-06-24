import { Bell, Search, Settings2 } from "lucide-react";

export function TopHeader() {
  return (
    <header className="h-20 px-6 lg:px-10 flex items-center justify-between gap-4 border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search insights, apps, achievements…"
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-muted/60 border border-transparent focus:bg-surface focus:border-border focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm placeholder:text-muted-foreground transition"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-11 h-11 grid place-items-center rounded-xl hover:bg-muted transition relative">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-gradient-pink" />
        </button>
        <button className="w-11 h-11 grid place-items-center rounded-xl hover:bg-muted transition">
          <Settings2 className="w-4.5 h-4.5" />
        </button>
        <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-border">
          <div className="text-right leading-tight">
            <div className="text-sm font-semibold">Alex Carter</div>
            <div className="text-[11px] text-muted-foreground">Scroll Marathoner</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-hero grid place-items-center text-white font-semibold text-sm shadow-glow-purple">
            AC
          </div>
        </div>
      </div>
    </header>
  );
}
