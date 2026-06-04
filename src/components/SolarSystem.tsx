"use client";

import { useState } from "react";
import { Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/products";
import { Planet } from "./Planet";
import { CometBad } from "./CometBad";
import { CometGood } from "./CometGood";
import { StarField } from "./StarField";
import { Halo } from "./Halo";

export function SolarSystem({ onSelectCategory, onBadPlanet, onGoodPlanet, hint }: {
  onSelectCategory: (cat: Category) => void;
  onBadPlanet: () => void;
  onGoodPlanet: () => void;
  hint: string;
}) {
  const total = 800;
  const cx = total / 2;
  const [hintVisible, setHintVisible] = useState(true);

  const handleInteract = (cb: () => void) => {
    setHintVisible(false);
    cb();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: total, height: total }}>
        {/* Star field background */}
        <StarField />
        {/* Central sun — clickable → Mission */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="absolute inset-0 rounded-full blur-3xl scale-[3] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(240,200,85,0.3) 0%, transparent 70%)" }} />
          <a href="#mission" className="block relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer group pointer-events-auto"
            style={{
              background: "radial-gradient(circle at 35% 35%, #fde68a, #f0c855 50%, #b8860b)",
              boxShadow: "0 0 50px 15px rgba(240,200,85,0.45), 0 0 100px 30px rgba(240,200,85,0.15)",
              transition: "box-shadow 0.3s, transform 0.3s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 70px 25px rgba(240,200,85,0.65), 0 0 130px 50px rgba(240,200,85,0.25)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px 15px rgba(240,200,85,0.45), 0 0 100px 30px rgba(240,200,85,0.15)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <span className="font-[var(--font-playfair)] font-black text-2xl text-[#0b1220] select-none">H</span>
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ color: "#f0c855" }}>Mission ↓</span>
          </a>
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none">
            <Halo width={80} height={20} strokeWidth={2.5} />
          </div>
        </div>
        {/* Product category planets */}
        {CATEGORIES.map((cat, i) => (
          <Planet key={i} cat={cat} cx={cx} total={total} onClick={() => handleInteract(() => onSelectCategory(cat))} />
        ))}
        {/* ── Comets — outside planet orbits, top corners, drifting inward ── */}
        <CometBad onClick={() => handleInteract(onBadPlanet)} />
        <CometGood onClick={() => handleInteract(onGoodPlanet)} />

        {/* ── First-visit hint callout — fades out after interaction ── */}
        {hintVisible && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ animation: "fade-in-up 1s ease-out 1.5s both", zIndex: 30 }}>
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
              style={{
                background: "rgba(240,200,85,0.08)",
                border: "1px solid rgba(240,200,85,0.25)",
                backdropFilter: "blur(8px)",
              }}>
              <span style={{ fontSize: 16, animation: "float 2s ease-in-out infinite" }}>👆</span>
              <span className="text-xs font-semibold tracking-wider uppercase whitespace-nowrap"
                style={{ color: "rgba(240,200,85,0.75)" }}>{hint}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
