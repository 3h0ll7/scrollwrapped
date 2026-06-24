import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Public ingestion endpoint for the future Android/iOS companion app.
// Authentication = per-user `ingest_token` stored on the profile.
// POST body: { token, day, source: "android"|"ios", metrics: {...}, apps?: [...] }

const Body = z.object({
  token: z.string().min(16),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  source: z.enum(["android", "ios"]),
  metrics: z.object({
    screen_time_minutes: z.number().min(0).max(1440).default(0),
    total_scrolls: z.number().int().min(0).default(0),
    thumb_cm: z.number().min(0).default(0),
    content_cm: z.number().min(0).default(0),
    sessions: z.number().int().min(0).default(0),
    app_opens: z.number().int().min(0).default(0),
  }),
  apps: z
    .array(
      z.object({
        app_id: z.string().min(1).max(64),
        minutes: z.number().min(0).default(0),
        opens: z.number().int().min(0).default(0),
        estimated_scrolls: z.number().int().min(0).default(0),
        thumb_cm: z.number().min(0).default(0),
      }),
    )
    .max(50)
    .optional(),
});

export const Route = createFileRoute("/api/public/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: z.infer<typeof Body>;
        try {
          payload = Body.parse(await request.json());
        } catch (e) {
          return Response.json(
            { error: "invalid_payload", message: e instanceof Error ? e.message : "bad request" },
            { status: 400 },
          );
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("ingest_token", payload.token)
          .maybeSingle();

        if (!profile) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        const userId = profile.id;

        await supabaseAdmin.from("daily_metrics").upsert(
          {
            user_id: userId,
            day: payload.day,
            source: payload.source,
            ...payload.metrics,
          },
          { onConflict: "user_id,day,source" },
        );

        if (payload.apps && payload.apps.length > 0) {
          await supabaseAdmin.from("app_metrics").upsert(
            payload.apps.map((a) => ({
              user_id: userId,
              day: payload.day,
              source: payload.source,
              app_id: a.app_id,
              minutes: a.minutes,
              opens: a.opens,
              estimated_scrolls: a.estimated_scrolls,
              thumb_cm: a.thumb_cm,
            })),
            { onConflict: "user_id,day,app_id,source" },
          );
        }

        // Mark profile as having verified data
        await supabaseAdmin
          .from("profiles")
          .update({ data_source: "verified" })
          .eq("id", userId);

        return Response.json({ ok: true });
      },
      GET: async () =>
        Response.json({
          name: "scrollmiles-ingest",
          version: 1,
          docs: "POST { token, day (YYYY-MM-DD), source: 'android'|'ios', metrics, apps[] }",
        }),
    },
  },
});
