import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function auth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) return NextResponse.json({ ok: false, error: "Supabase service key not configured" }, { status: 503 });

  const supabase = createClient(url, serviceKey);

  // Find users whose last scan was yesterday (streak breaks tonight if they don't scan)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, streak_days, display_name")
    .eq("last_scan_at", yesterday)
    .gte("streak_days", 1);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ ok: true, notified: 0 });
  }

  const origin = new URL(req.url).origin;
  const pushSecret = process.env.PUSH_SECRET ?? "";
  let notified = 0;

  for (const profile of profiles) {
    try {
      const res = await fetch(`${origin}/api/push/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-push-secret": pushSecret },
        body: JSON.stringify({
          userId: profile.id,
          title: "Streak at risk 🔥",
          body: `You have a ${profile.streak_days}-day streak — scan something before midnight to keep it alive!`,
          url: "/#scanner",
        }),
      });
      if (res.ok) notified++;
    } catch { /* silently skip — don't fail the whole cron */ }
  }

  return NextResponse.json({ ok: true, notified });
}
