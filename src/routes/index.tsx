import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Footprints, ArrowRight, ShieldCheck, Sparkles, BarChart3 } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScrollMiles — How many miles has your thumb scrolled?" },
      {
        name: "description",
        content:
          "Discover your lifetime thumb miles, verified screen time, AI insights and badges. Sign in with Google to start tracking.",
      },
      { property: "og:title", content: "ScrollMiles" },
      { property: "og:description", content: "I wonder how many miles I scrolled with my thumb." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-hero grid place-items-center shadow-glow-purple">
            <Footprints className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-lg">ScrollMiles</span>
        </div>
        <Link
          to="/auth"
          className="h-10 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition inline-flex items-center gap-2"
        >
          Sign in <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <main className="px-6 lg:px-12 py-16 lg:py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
            Spotify Wrapped × Apple Health, for scrolling
          </span>
          <h1 className="mt-6 text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            How many miles has your{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">thumb scrolled?</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            ScrollMiles measures your lifetime thumb distance, content miles, screen time and app
            sessions — using real device data when available, transparent estimates otherwise.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="h-12 px-6 rounded-xl bg-foreground text-background font-medium inline-flex items-center gap-2 hover:opacity-90 transition"
            >
              Get my ScrollMiles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        <div className="mt-20 grid md:grid-cols-3 gap-4">
          <Feature
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Verified or estimated"
            body="Pulls real screen-time when a companion app is connected. Labels everything clearly."
          />
          <Feature
            icon={<Sparkles className="w-5 h-5" />}
            title="AI insights"
            body="Personalized observations like “you spent 12 days on TikTok this year.”"
          />
          <Feature
            icon={<BarChart3 className="w-5 h-5" />}
            title="Shareable wrap"
            body="Lifetime miles, top apps, badges, and a beautiful chart of your scrolling life."
          />
        </div>
      </main>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
