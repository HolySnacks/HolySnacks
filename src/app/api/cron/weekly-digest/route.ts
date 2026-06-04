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

  // Fetch all users (paginated; handle up to 1000 for now)
  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error || !users) return NextResponse.json({ ok: false, error: "Failed to list users" }, { status: 500 });

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const origin = new URL(req.url).origin;
  const emailSecret = process.env.EMAIL_SECRET ?? "";

  let sent = 0;
  const errors: string[] = [];

  for (const user of users) {
    if (!user.email) continue;

    // Count scans in the last 7 days for this user
    const { data: scans } = await supabase
      .from("scan_records")
      .select("score")
      .eq("user_id", user.id)
      .gte("created_at", since);

    if (!scans || scans.length === 0) continue; // no activity — skip

    const topScore = Math.max(...scans.map(s => s.score));
    const name = (user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email.split("@")[0]) as string;

    try {
      await fetch(`${origin}/api/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-email-secret": emailSecret },
        body: JSON.stringify({
          type: "weekly_digest",
          to: user.email,
          name,
          scans: scans.length,
          topScore,
        }),
      });
      sent++;
    } catch (e) {
      errors.push(user.email);
    }
  }

  return NextResponse.json({ ok: true, sent, errors });
}
