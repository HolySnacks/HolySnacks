import { STAR_DATA } from "@/lib/starfield";

export function StarField() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none rounded-full"
      style={{ zIndex: 0 }}
    >
      {STAR_DATA.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.minOpacity,
            ["--star-min" as string]: s.minOpacity,
            ["--star-max" as string]: s.maxOpacity,
            ["--dur" as string]: `${s.dur}s`,
            ["--delay" as string]: `${s.delay}s`,
            ...(s.twinkle ? { animation: `twinkle ${s.dur}s ease-in-out infinite ${s.delay}s` } : {}),
            ...(s.drift ? { animation: `drift ${s.dur * 2}s ease-in-out infinite ${s.delay}s` } : {}),
          }}
        />
      ))}
    </div>
  );
}
