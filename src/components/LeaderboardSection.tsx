"use client";

import { useState, useEffect } from "react";
import { createClient, getLevelInfo } from "@/lib/supabase";
import { useInView } from "@/lib/hooks";

type LeaderEntry = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak_days: number;
};

export function LeaderboardSection({ lang, currentUserId }: { lang: "en" | "lt"; currentUserId?: string }) {
  const anim = useInView(0.1);
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, xp, level, streak_days")
          .order("xp", { ascending: false })
          .limit(20);
        setLeaders((data as LeaderEntry[]) ?? []);
      } catch {
        // silently skip if table not ready
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const t = {
    en: { title: "Purity Leaderboard", sub: "Top snack-conscious community members", you: "You", scans: "scans", streak: "streak" },
    lt: { title: "Švarumo lyderiai", sub: "Geriausiai besirūpinantys sveika mityba", you: "Tu", scans: "skenavimų", streak: "serija" },
  }[lang];

  const podiumColors = ["#f0c855", "#b0b8c8", "#d4875a"];
  const podiumEmojis = ["🥇", "🥈", "🥉"];

  return (
    <section id="leaderboard" className="px-6 py-24 max-w-4xl mx-auto">
      <div
        ref={anim.ref}
        className={`transition-all duration-700 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="text-center mb-12">
          <span className="text-[#f0c855]/60 text-xs tracking-widest uppercase mb-3 block">✦ Community ✦</span>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold mb-3">{t.title}</h2>
          <p className="text-white/45 text-lg">{t.sub}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#f0c855]/30 border-t-[#f0c855] animate-spin" />
          </div>
        ) : leaders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-14 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
            <span className="text-5xl opacity-60">🏆</span>
            <p className="text-white/55 font-semibold text-lg text-center">
              {lang === "en" ? "No entries yet" : "Dar nėra įrašų"}
            </p>
            <p className="text-white/30 text-sm text-center max-w-xs">
              {lang === "en"
                ? "Be the first to reach the top — scan a product and earn your first XP."
                : "Tapk pirmuoju — nuskaituok produktą ir uždirbk pirmąjį XP."}
            </p>
            <a href="#scanner"
              className="mt-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
              style={{ background: "rgba(240,200,85,0.12)", border: "1px solid rgba(240,200,85,0.25)", color: "#f0c855" }}>
              {lang === "en" ? "Scan now →" : "Skenuoti dabar →"}
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {leaders.map((entry, i) => {
              const levelInfo = getLevelInfo(entry.xp);
              const isMe = entry.id === currentUserId;
              const color = podiumColors[i] ?? "rgba(255,255,255,0.15)";
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all"
                  style={{
                    background: isMe ? "rgba(240,200,85,0.07)" : i < 3 ? `${color}0d` : "rgba(255,255,255,0.02)",
                    borderColor: isMe ? "rgba(240,200,85,0.35)" : i < 3 ? `${color}33` : "rgba(255,255,255,0.07)",
                  }}
                >
                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    {i < 3 ? (
                      <span className="text-xl">{podiumEmojis[i]}</span>
                    ) : (
                      <span className="text-white/30 text-sm font-bold">#{i + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold overflow-hidden"
                    style={{ background: `${color}22`, border: `1.5px solid ${color}44` }}>
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{levelInfo.current.emoji}</span>
                    )}
                  </div>

                  {/* Name + level */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white/90 truncate">
                        {entry.display_name || (lang === "en" ? "Anonymous Snacker" : "Anonimas")}
                      </span>
                      {isMe && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: "rgba(240,200,85,0.15)", color: "#f0c855" }}>
                          {t.you}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/35">{levelInfo.current.emoji} {levelInfo.current.title}</span>
                      {entry.streak_days > 1 && (
                        <span className="text-xs text-orange-400/70">🔥 {entry.streak_days}d {t.streak}</span>
                      )}
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-lg" style={{ color: i < 3 ? color : "rgba(255,255,255,0.6)" }}>
                      {entry.xp.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/25">XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
