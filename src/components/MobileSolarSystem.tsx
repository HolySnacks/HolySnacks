"use client";

import React from "react";
import { Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/products";
import { Planet } from "./Planet";
import { StarField } from "./StarField";
import { Halo } from "./Halo";

// Mobile-tuned orbital parameters keyed by category id. Smaller radii, gentler
// (slower) speeds and larger relative planets so the planets stay easy to tap on
// a small touch screen. Outward extent (radius + size/2) is kept within the
// `TOTAL/2` field so nothing clips off the edge.
const MOBILE_ORBITS: Record<string, { radius: number; size: number; duration: number; startAngle: number }> = {
  gummies:   { radius: 64,  size: 40, duration: 18, startAngle: 0 },
  chocolate: { radius: 84,  size: 40, duration: 24, startAngle: 140 },
  holy:      { radius: 102, size: 40, duration: 30, startAngle: 60 },
  drinks:    { radius: 118, size: 38, duration: 36, startAngle: 240 },
  snacks:    { radius: 132, size: 36, duration: 42, startAngle: 320 },
  gums:      { radius: 144, size: 34, duration: 48, startAngle: 170 },
};

const TOTAL = 320;
const CX = TOTAL / 2;

export function MobileSolarSystem({ onSelectCategory, onBadPlanet, onGoodPlanet, lang }: {
  onSelectCategory: (cat: Category) => void;
  onBadPlanet: () => void;
  onGoodPlanet: () => void;
  lang: "en" | "lt";
}) {
  return (
    <div className="w-full flex flex-col items-center -mx-6 overflow-x-clip">
      <div className="relative mx-auto" style={{ width: TOTAL, height: TOTAL, overflow: "visible" }}>
        {/* Star field background */}
        <StarField />

        {/* Central sun — clickable → Mission */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="absolute inset-0 rounded-full blur-2xl scale-[3] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(240,200,85,0.3) 0%, transparent 70%)" }} />
          <a href="#mission" className="block relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform pointer-events-auto"
            style={{
              background: "radial-gradient(circle at 35% 35%, #fde68a, #f0c855 50%, #b8860b)",
              boxShadow: "0 0 36px 10px rgba(240,200,85,0.45), 0 0 70px 22px rgba(240,200,85,0.15)",
            }}
          >
            <span className="font-[var(--font-playfair)] font-black text-lg text-[#0b1220] select-none">H</span>
          </a>
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-none">
            <Halo width={56} height={14} strokeWidth={2} />
          </div>
        </div>

        {/* Product category planets — same orbit mechanics as desktop, mobile sizing */}
        {CATEGORIES.map((cat, i) => {
          const m = MOBILE_ORBITS[cat.id];
          if (!m) return null;
          const mobileCat: Category = { ...cat, ...m };
          return (
            <Planet
              key={i}
              cat={mobileCat}
              cx={CX}
              total={TOTAL}
              label={lang === "lt" ? cat.labelLt : cat.label}
              labelClassName="mt-1 text-[8px] font-bold tracking-wide uppercase whitespace-nowrap"
              onClick={() => onSelectCategory(cat)}
            />
          );
        })}

        {/* Good / Bad comets — drifting in the top corners, outside the orbits */}
        <MobileComet variant="good" onClick={onGoodPlanet} style={{ left: 2, top: 18 }} />
        <MobileComet variant="bad" onClick={onBadPlanet} style={{ right: 2, top: 18 }} />
      </div>

      <p className="mt-2 text-[10px] text-white/25 tracking-[0.2em] uppercase animate-pulse">
        {lang === "en" ? "tap a planet to explore" : "palieskite planetą"}
      </p>
    </div>
  );
}

/* ── Compact drifting comet for the small mobile field ─────────────────────── */
function MobileComet({ variant, onClick, style }: {
  variant: "good" | "bad";
  onClick: () => void;
  style: React.CSSProperties;
}) {
  const good = variant === "good";
  const NR = 19; // nucleus radius
  const color = good ? "34,197,94" : "220,38,38";
  const nucleusBg = good
    ? "radial-gradient(circle at 30% 28%, #052e16, #14532d 58%, #021a0a)"
    : "radial-gradient(circle at 30% 28%, #7f1d1d, #450a0a 58%, #1c0202)";
  const emoji = good ? "🌿" : "☠️";
  const drift = good ? "comet-good-drift-sm" : "comet-bad-drift-sm";
  const pulseDur = good ? 2.2 : 2;

  // Sparks trailing the nucleus toward the corner (up-left for good, up-right for bad).
  const sx = good ? -1 : 1;
  const sparks = [
    { x: 13 * sx, y: -13, d: 0,   dur: 1.4, s: 3, c: good ? "#22c55e" : "#ef4444" },
    { x: 25 * sx, y: -25, d: 0.3, dur: 1.7, s: 2, c: good ? "#4ade80" : "#f97316" },
    { x: 17 * sx, y: -33, d: 0.5, dur: 1.3, s: 2, c: good ? "#86efac" : "#fca5a5" },
    { x: 37 * sx, y: -29, d: 0.7, dur: 1.6, s: 2, c: good ? "#22c55e" : "#ef4444" },
    { x: 29 * sx, y: -43, d: 1.0, dur: 1.9, s: 2, c: good ? "#4ade80" : "#f97316" },
  ];

  // Tail streak: extends up-left (good) or up-right (bad) from the nucleus center.
  const tail: React.CSSProperties = good
    ? {
        left: NR - 52, top: NR - 5, width: 52, height: 10,
        background: `linear-gradient(to left, rgba(${color},0.85), rgba(${color},0))`,
        transformOrigin: "right center", transform: "rotate(45deg)",
      }
    : {
        left: NR, top: NR - 5, width: 52, height: 10,
        background: `linear-gradient(to right, rgba(${color},0.85), rgba(${color},0))`,
        transformOrigin: "left center", transform: "rotate(-45deg)",
      };

  return (
    <div className="absolute pointer-events-none" style={{ ...style, width: NR * 2, height: NR * 2, zIndex: 20, animation: `${drift} 8s ease-in-out infinite` }}>
      {/* Tail glow */}
      <div style={{ position: "absolute", ...tail, filter: "blur(6px)", pointerEvents: "none" }} />
      {/* Spark particles */}
      {sparks.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          width: p.s, height: p.s, borderRadius: "50%",
          background: p.c,
          left: NR + p.x, top: NR + p.y,
          animation: `${good ? "spark-good" : "spark-bad"} ${p.dur}s ease-out ${p.d}s infinite`,
          ["--fx" as string]: `${p.x * 0.55}px`,
          ["--fy" as string]: `${p.y * 0.55}px`,
          pointerEvents: "none",
          boxShadow: `0 0 ${p.s + 2}px ${p.c}`,
        } as React.CSSProperties} />
      ))}
      {/* Nucleus — the only tappable part */}
      <button onClick={onClick}
        className="absolute active:scale-95 transition-transform pointer-events-auto"
        style={{
          left: 0, top: 0,
          width: NR * 2, height: NR * 2, borderRadius: "50%",
          background: nucleusBg,
          boxShadow: `0 0 26px 9px rgba(${color},0.55), inset 0 0 18px rgba(0,0,0,0.7)`,
          border: `2px solid rgba(${color},0.55)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: `comet-nucleus-pulse ${pulseDur}s ease-in-out infinite`,
        }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
      </button>
    </div>
  );
}
