"use client";

import React from "react";

export function CometGood({ onClick }: { onClick: () => void }) {
  // Tail extends from nucleus toward upper-left (away from solar system center).
  const SPARKS = [
    { x: -18,  y: -18,  d: 0,    dur: 1.4, s: 3, c: "#22c55e" },
    { x: -38,  y: -38,  d: 0.2,  dur: 1.8, s: 2, c: "#4ade80" },
    { x: -24,  y: -55,  d: 0.45, dur: 1.2, s: 3, c: "#86efac" },
    { x: -58,  y: -48,  d: 0.7,  dur: 1.6, s: 2, c: "#22c55e" },
    { x: -42,  y: -72,  d: 1.0,  dur: 2.0, s: 2, c: "#4ade80" },
    { x: -72,  y: -32,  d: 0.3,  dur: 1.3, s: 3, c: "#86efac" },
    { x: -55,  y: -88,  d: 0.85, dur: 1.7, s: 2, c: "#22c55e" },
    { x: -88,  y: -58,  d: 1.2,  dur: 1.5, s: 2, c: "#4ade80" },
    { x: -95,  y: -95,  d: 0.55, dur: 1.9, s: 2, c: "#86efac" },
    { x: -65,  y: -105, d: 1.4,  dur: 1.4, s: 3, c: "#22c55e" },
  ];
  const NR = 36;
  const NY = 36;

  return (
    <div className="absolute group cursor-pointer" onClick={onClick}
      style={{ left: 80, top: 28, animation: "comet-good-drift 8s ease-in-out infinite", zIndex: 20 }}>

      {/* ── Tail glow — pivot at nucleus center so sphere covers the root ── */}
      <div style={{
        position: "absolute", left: NR - 190, top: NR - 26,
        width: 190, height: 52,
        background: "linear-gradient(to left, rgba(34,197,94,0.65), rgba(34,197,94,0))",
        clipPath: "polygon(100% 0%, 0% 38%, 0% 62%, 100% 100%)",
        transformOrigin: "right center", transform: "rotate(45deg)",
        filter: "blur(14px)", pointerEvents: "none",
      }} />
      {/* ── Tail sharp core ── */}
      <div style={{
        position: "absolute", left: NR - 165, top: NR - 11,
        width: 165, height: 22,
        background: "linear-gradient(to left, rgba(34,197,94,0.95), rgba(34,197,94,0))",
        clipPath: "polygon(100% 0%, 0% 32%, 0% 68%, 100% 100%)",
        transformOrigin: "right center", transform: "rotate(45deg)",
        pointerEvents: "none",
      }} />
      {/* ── Tail inner bright streak ── */}
      <div style={{
        position: "absolute", left: NR - 100, top: NR - 5,
        width: 100, height: 10,
        background: "linear-gradient(to left, rgba(74,222,128,0.95), rgba(74,222,128,0))",
        transformOrigin: "right center", transform: "rotate(45deg)",
        pointerEvents: "none",
      }} />

      {/* ── Spark particles along tail ── */}
      {SPARKS.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          width: p.s, height: p.s, borderRadius: "50%",
          background: p.c,
          left: NR + p.x, top: NY + p.y,
          animation: `spark-good ${p.dur}s ease-out ${p.d}s infinite`,
          "--fx": `${p.x * 0.55}px`,
          "--fy": `${p.y * 0.55}px`,
          pointerEvents: "none",
          boxShadow: `0 0 ${p.s + 2}px ${p.c}`,
        } as React.CSSProperties} />
      ))}

      {/* ── Nucleus ── */}
      <div style={{ animation: "comet-nucleus-pulse 2.2s ease-in-out infinite", position: "relative", zIndex: 10 }}
        className="transition-transform duration-300 group-hover:scale-110">
        <div style={{
          width: NR * 2, height: NR * 2, borderRadius: "50%",
          background: "radial-gradient(circle at 30% 28%, #052e16, #14532d 58%, #021a0a)",
          boxShadow: "0 0 36px 14px rgba(34,197,94,0.62), 0 0 72px 28px rgba(34,197,94,0.2), inset 0 0 28px rgba(0,0,0,0.75)",
          border: "2px solid rgba(34,197,94,0.58)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 26 }}>🌿</span>
        </div>
        {/* Hover tooltip — replaces tiny static label */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
            background: "rgba(4,30,16,0.96)", border: "1px solid rgba(34,197,94,0.45)",
            borderRadius: 8, padding: "5px 10px", whiteSpace: "nowrap", zIndex: 50,
            backdropFilter: "blur(8px)",
          }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#22c55e" }}>🌿 Good Planet</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>Click to see clean ingredients</div>
          {/* Arrow */}
          <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%) rotate(45deg)",
            width: 8, height: 8, background: "rgba(4,30,16,0.96)",
            borderRight: "1px solid rgba(34,197,94,0.45)", borderBottom: "1px solid rgba(34,197,94,0.45)" }} />
        </div>
      </div>
    </div>
  );
}
