import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HolySnacks — Snack Holy. Live Wholly.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b1220 0%, #0d1a35 50%, #0b1220 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          display: "flex",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(240,200,85,0.12) 0%, transparent 70%)",
          display: "flex",
        }} />

        {/* Halo ring */}
        <div style={{
          width: 140, height: 28, borderRadius: "50%",
          border: "2px solid rgba(240,200,85,0.6)",
          marginBottom: -14,
          display: "flex",
        }} />

        {/* Logo emoji */}
        <div style={{ fontSize: 80, marginBottom: 8, display: "flex" }}>✦</div>

        {/* Brand name */}
        <div style={{
          fontSize: 72, fontWeight: 900, color: "#f0eee8",
          letterSpacing: "-2px", marginBottom: 16,
          display: "flex",
        }}>
          HolySnacks
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 28, color: "#f0c855", fontWeight: 700,
          letterSpacing: "3px", textTransform: "uppercase",
          marginBottom: 40, display: "flex",
        }}>
          Snack Holy. Live Wholly.
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["🔍 Ingredient Scanner", "⚡ XP Levels", "🌿 100% Clean"].map((label) => (
            <div key={label} style={{
              display: "flex",
              padding: "10px 20px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#f0eee8",
              fontSize: 20,
              fontWeight: 600,
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div style={{
          position: "absolute", bottom: 32,
          color: "rgba(255,255,255,0.3)",
          fontSize: 18, letterSpacing: "2px",
          display: "flex",
        }}>
          holysnacks.com
        </div>
      </div>
    ),
    { ...size }
  );
}
