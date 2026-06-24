import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Footprints, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — ScrollMiles" },
      { name: "description", content: "Sign in with Google to track your real scrolling life." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function signInGoogle() {
    setLoading(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      setError(result.error.message ?? "Sign-in failed");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-background to-muted px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-hero grid place-items-center shadow-glow-purple">
            <Footprints className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg leading-none">ScrollMiles</div>
            <div className="text-xs text-muted-foreground mt-1">Your scrolling life, measured.</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Sign in to your dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Track your lifetime thumb miles, unlock badges, and get AI-powered insights from your real activity.
        </p>

        <button
          onClick={signInGoogle}
          disabled={loading}
          className="mt-8 w-full h-12 rounded-xl bg-foreground text-background font-medium flex items-center justify-center gap-3 hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#fff" d="M21.35 11.1H12v3.18h5.3c-.23 1.4-1.66 4.1-5.3 4.1-3.18 0-5.78-2.64-5.78-5.88s2.6-5.88 5.78-5.88c1.81 0 3.02.77 3.71 1.43l2.53-2.44C16.49 4.04 14.43 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.64-3.65 8.64-8.78 0-.59-.06-1.04-.14-1.5z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
          By signing in you agree to let ScrollMiles store your scroll metrics. We never sell your data and you can delete everything anytime.
        </p>
      </motion.div>
    </div>
  );
}
