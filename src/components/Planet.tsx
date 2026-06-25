"use client";

import { Category } from "@/lib/types";

export function Planet({ cat, cx, total, onClick, label, labelClassName }: { cat: Category; cx: number; total: number; onClick: () => void; label?: string; labelClassName?: string }) {
  const d = cat.radius * 2;
  // Encode startAngle via negative delay so the CSS animation doesn't override
  // the inline transform (which it would — CSS animations always win at fill time).
  // A negative delay of -(startAngle/360)*duration effectively fast-forwards the
  // animation to the correct initial position.
  const orbitDelay = `${-((cat.startAngle / 360) * cat.duration).toFixed(3)}s`;
  return (
    <div className="absolute left-1/2 top-1/2 pointer-events-none" style={{ marginLeft: -cx, marginTop: -cx }}>
      {/* Orbit ring — no pointer events */}
      <svg width={total} height={total} className="absolute inset-0 pointer-events-none">
        <circle cx={cx} cy={cx} r={cat.radius} fill="none" stroke={cat.ring} strokeWidth="1" strokeDasharray="5 9" />
      </svg>
      {/* Rotating container — no pointer events */}
      <div className="absolute pointer-events-none" style={{
        width: d, height: d,
        left: cx - cat.radius, top: cx - cat.radius,
        animation: `orbit ${cat.duration}s linear infinite`,
        animationDelay: orbitDelay,
      }}>
        {/* Planet — pointer events re-enabled here only */}
        <div className="absolute left-1/2 flex flex-col items-center cursor-pointer group pointer-events-auto"
          style={{ top: -cat.size / 2, animation: `counter-orbit ${cat.duration}s linear infinite`, animationDelay: orbitDelay }}
          onClick={onClick}
        >
          <div className={`rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center select-none transition-all duration-300 group-hover:scale-110`}
            style={{
              width: cat.size, height: cat.size,
              boxShadow: `0 0 24px 6px ${cat.glow}, inset 0 0 20px rgba(255,255,255,0.15)`,
              border: "2px solid rgba(255,255,255,0.25)",
            }}
          >
            <span style={{ fontSize: cat.size * 0.38 }}>{cat.icon}</span>
          </div>
          <span className={labelClassName ?? "mt-2 text-xs font-semibold tracking-widest uppercase whitespace-nowrap"}
            style={{ color: cat.accentColor }}>
            {label ?? cat.label}
          </span>
        </div>
      </div>
    </div>
  );
}
