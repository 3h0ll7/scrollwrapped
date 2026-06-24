import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopHeader } from "@/components/dashboard/top-header";
import { HeroCard } from "@/components/dashboard/hero-card";
import { GradientStats } from "@/components/dashboard/gradient-stats";
import { ScrollChart } from "@/components/dashboard/scroll-chart";
import { ActivitySidebar } from "@/components/dashboard/activity-sidebar";
import { Achievements } from "@/components/dashboard/achievements";
import { FunInsights } from "@/components/dashboard/fun-insights";
import { CalculatorCard } from "@/components/dashboard/calculator-card";
import { calculateScrollMiles, DEFAULT_INPUT, type CalcInput } from "@/lib/scrollmiles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScrollMiles — How many miles has your thumb scrolled?" },
      { name: "description", content: "A beautiful analytics dashboard for your scrolling life. Discover your lifetime thumb miles, content miles, and shareable insights." },
      { property: "og:title", content: "ScrollMiles — How many miles has your thumb scrolled?" },
      { property: "og:description", content: "I wonder how many miles I scrolled with my thumb." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [input, setInput] = useState<CalcInput>(DEFAULT_INPUT);
  const result = useMemo(() => calculateScrollMiles(input), [input]);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader />
        <main className="flex-1 p-6 lg:p-10 space-y-6 lg:space-y-8">
          <div className="grid xl:grid-cols-[1fr_340px] gap-6 lg:gap-8">
            <div className="space-y-6 lg:space-y-8 min-w-0">
              <HeroCard r={result} />
              <GradientStats r={result} />
              <ScrollChart r={result} />
            </div>
            <div className="space-y-6">
              <ActivitySidebar r={result} />
            </div>
          </div>
          <Achievements r={result} />
          <FunInsights r={result} />
          <CalculatorCard input={input} onChange={setInput} />
          <footer className="pt-6 pb-2 text-center text-xs text-muted-foreground">
            Estimates are for fun — based on average scroll behavior. ScrollMiles © {new Date().getFullYear()}
          </footer>
        </main>
      </div>
    </div>
  );
}
