import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import webpush from "web-push";

// VAPID keys must be set in env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_MAILTO
function initVapid() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const mailto = process.env.VAPID_MAILTO ?? "mailto:hello@holysnacks.com";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(mailto, pub, priv);
  return true;
}

export async function POST(req: NextRequest) {
  // Require server-to-server secret to prevent abuse
  const secret = req.headers.get("x-push-secret");
  if (!secret || secret !== process.env.PUSH_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (!initVapid()) {
    return NextResponse.json({ ok: false, error: "VAPID not configured" }, { status: 503 });
  }

  try {
    const { userId, title, body, url } = await req.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    let query = supabase.from("push_subscriptions").select("*");
    if (userId) query = query.eq("user_id", userId);

    const { data: subs } = await query;
    if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 });

    const payload = JSON.stringify({ title, body, url: url ?? "/" });
    let sent = 0;
    const expired: string[] = [];

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh_key, auth: sub.auth_key } },
            payload
          );
          sent++;
        } catch (err: unknown) {
          // 404/410 means the subscription is no longer valid
          if (err && typeof err === "object" && "statusCode" in err) {
            const code = (err as { statusCode: number }).statusCode;
            if (code === 404 || code === 410) expired.push(sub.endpoint);
          }
        }
      })
    );

    // Clean up expired subscriptions
    if (expired.length) {
      await supabase.from("push_subscriptions").delete().in("endpoint", expired);
    }

    return NextResponse.json({ ok: true, sent, expired: expired.length });
  } catch (err) {
    console.error("[push/send]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
