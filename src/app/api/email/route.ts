import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FROM = "HolySnacks <hello@holysnacks.com>";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export type EmailType = "welcome" | "level_up" | "streak_broken" | "weekly_digest";

interface WelcomePayload { type: "welcome"; to: string; name: string }
interface LevelUpPayload { type: "level_up"; to: string; name: string; level: number; title: string; emoji: string }
interface StreakBrokenPayload { type: "streak_broken"; to: string; name: string; streakDays: number }
interface WeeklyDigestPayload { type: "weekly_digest"; to: string; name: string; scans: number; topScore: number }

type Payload = WelcomePayload | LevelUpPayload | StreakBrokenPayload | WeeklyDigestPayload;

function buildEmail(payload: Payload): { subject: string; html: string } {
  switch (payload.type) {
    case "welcome":
      return {
        subject: "Welcome to HolySnacks ✦",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0b1220;color:#f5f0eb;padding:40px 32px;border-radius:16px">
            <h1 style="color:#f0c855;font-size:28px;margin:0 0 16px">Welcome, ${payload.name}! 🌱</h1>
            <p style="line-height:1.6;color:#d0cbc4">You've just joined the cleanest snack community on the planet. You're now a <strong style="color:#f0c855">Snack Curious</strong> — your journey to Snack Deity starts here.</p>
            <p style="line-height:1.6;color:#d0cbc4">Start scanning products to earn XP, build your streak, and discover what's really in your food.</p>
            <a href="https://holysnacks.com" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#f0c855;color:#0b1220;font-weight:700;border-radius:40px;text-decoration:none">Start Scanning →</a>
          </div>
        `,
      };

    case "level_up":
      return {
        subject: `You leveled up to ${payload.title} ${payload.emoji}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0b1220;color:#f5f0eb;padding:40px 32px;border-radius:16px">
            <div style="font-size:48px;text-align:center;margin-bottom:16px">${payload.emoji}</div>
            <h1 style="color:#f0c855;font-size:24px;margin:0 0 12px;text-align:center">Level ${payload.level}: ${payload.title}</h1>
            <p style="line-height:1.6;color:#d0cbc4;text-align:center">Incredible, ${payload.name}. You've reached a new level of ingredient awareness. Keep scanning — you're getting closer to Snack Deity.</p>
            <a href="https://holysnacks.com" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#f0c855;color:#0b1220;font-weight:700;border-radius:40px;text-decoration:none;width:100%;text-align:center;box-sizing:border-box">See Your Profile →</a>
          </div>
        `,
      };

    case "streak_broken":
      return {
        subject: `Your ${payload.streakDays}-day streak ended 🔥`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0b1220;color:#f5f0eb;padding:40px 32px;border-radius:16px">
            <h1 style="color:#f0c855;font-size:24px;margin:0 0 12px">Don't break the habit, ${payload.name}</h1>
            <p style="line-height:1.6;color:#d0cbc4">Your ${payload.streakDays}-day scan streak ended. That's okay — champions fall and get back up. Scan something today to start a new streak and earn bonus XP.</p>
            <a href="https://holysnacks.com" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#f0c855;color:#0b1220;font-weight:700;border-radius:40px;text-decoration:none">Restart My Streak →</a>
          </div>
        `,
      };

    case "weekly_digest":
      return {
        subject: `Your HolySnacks week: ${payload.scans} scans`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0b1220;color:#f5f0eb;padding:40px 32px;border-radius:16px">
            <h1 style="color:#f0c855;font-size:24px;margin:0 0 20px">Weekly Round-Up, ${payload.name}</h1>
            <div style="display:flex;gap:16px;margin-bottom:24px">
              <div style="flex:1;background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;text-align:center">
                <div style="font-size:32px;font-weight:700;color:#f0c855">${payload.scans}</div>
                <div style="font-size:12px;color:#a09890;margin-top:4px">Scans This Week</div>
              </div>
              <div style="flex:1;background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;text-align:center">
                <div style="font-size:32px;font-weight:700;color:#22c55e">${payload.topScore}</div>
                <div style="font-size:12px;color:#a09890;margin-top:4px">Best Purity Score</div>
              </div>
            </div>
            <a href="https://holysnacks.com/history" style="display:inline-block;padding:12px 28px;background:#f0c855;color:#0b1220;font-weight:700;border-radius:40px;text-decoration:none">View Full History →</a>
          </div>
        `,
      };
  }
}

export async function POST(req: NextRequest) {
  const resend = getResend();
  if (!resend) {
    return NextResponse.json({ ok: false, error: "Email not configured" }, { status: 503 });
  }

  // Require server-to-server secret
  const secret = req.headers.get("x-email-secret");
  if (!secret || secret !== process.env.EMAIL_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const payload: Payload = await req.json();
    const { subject, html } = buildEmail(payload);

    const { error } = await resend.emails.send({
      from: FROM,
      to: payload.to,
      subject,
      html,
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[email]", err);
    return NextResponse.json({ ok: false, error: "Failed to send" }, { status: 500 });
  }
}
