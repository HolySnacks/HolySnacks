import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const product = searchParams.get("product") ?? "Unknown Product";
  const score   = parseInt(searchParams.get("score") ?? "500");
  const grade   = searchParams.get("grade") ?? "Neutral";
  const emoji   = searchParams.get("emoji") ?? "⚠️";
  const color   = searchParams.get("color") ?? "#f97316";
  const bad     = parseInt(searchParams.get("bad") ?? "0");
  const good    = parseInt(searchParams.get("good") ?? "0");

  const barWidth = Math.max(0, Math.min(100, score / 10));

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #0b1220 0%, #0d1a35 60%, #0b1220 100%)",
        fontFamily: "sans-serif", position: "relative", overflow: "hidden",
        padding: "0 60px",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 400, height: 400, borderRadius: "50%",
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
          display: "flex",
        }} />

        {/* HolySnacks label */}
        <div style={{
          position: "absolute", top: 32, left: 48,
          display: "flex", alignItems: "center", gap: 8,
          color: "#f0c855", fontSize: 18, fontWeight: 900, letterSpacing: "-0.5px",
        }}>
          <span>✦</span><span>HolySnacks Scanner</span>
        </div>

        {/* Grade badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 20,
          padding: "10px 24px", borderRadius: 999,
          background: `${color}18`,
          border: `2px solid ${color}44`,
        }}>
          <span style={{ fontSize: 32 }}>{emoji}</span>
          <span style={{ fontSize: 24, fontWeight: 900, color, letterSpacing: "2px", textTransform: "uppercase" }}>
            {grade}
          </span>
        </div>

        {/* Score */}
        <div style={{
          fontSize: 96, fontWeight: 900, color, lineHeight: 1,
          marginBottom: 8, display: "flex",
        }}>
          {score}
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", letterSpacing: "3px", marginBottom: 32, display: "flex" }}>
          PURITY SCORE
        </div>

        {/* Bar */}
        <div style={{
          width: 500, height: 10, borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          marginBottom: 8, display: "flex", position: "relative",
        }}>
          <div style={{
            width: `${barWidth}%`, height: "100%", borderRadius: 999,
            background: `linear-gradient(to right, #ef444488, ${color})`,
            display: "flex",
          }} />
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginBottom: 36, display: "flex" }}>
          Baseline 500 · Max 1000+
        </div>

        {/* Product name */}
        <div style={{
          fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.85)",
          textAlign: "center", maxWidth: 540,
          marginBottom: 24, display: "flex",
        }}>
          {product.length > 60 ? product.slice(0, 57) + "…" : product}
        </div>

        {/* Stats pills */}
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{
            display: "flex", padding: "8px 20px", borderRadius: 999,
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
            color: "#ef4444", fontSize: 15, fontWeight: 700, gap: 6,
          }}>
            ⚠ {bad} {bad === 1 ? "threat" : "threats"} found
          </div>
          <div style={{
            display: "flex", padding: "8px 20px", borderRadius: 999,
            background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
            color: "#22c55e", fontSize: 15, fontWeight: 700, gap: 6,
          }}>
            ✓ {good} {good === 1 ? "benefit" : "benefits"} found
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: "absolute", bottom: 28,
          color: "rgba(255,255,255,0.2)", fontSize: 14, letterSpacing: "2px",
          display: "flex",
        }}>
          holysnacks.com/scanner
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
