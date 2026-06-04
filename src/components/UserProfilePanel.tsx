"use client";

import { createClient, getLevelInfo, LEVELS } from "@/lib/supabase";
import type { Profile, ScanRecord } from "@/lib/supabase";
import { getGrade } from "@/lib/scanner";

export function UserProfilePanel({ profile, recentScans, lang, onClose, onSignOut }: {
  profile: Profile;
  recentScans: ScanRecord[];
  lang: "en" | "lt";
  onClose: () => void;
  onSignOut: () => void;
}) {
  const { current, next, progress, xpIntoLevel, xpNeeded } = getLevelInfo(profile.xp);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden animate-fade-in-up"
        style={{ background: "#0d1525", border: "1px solid rgba(240,200,85,0.22)", maxHeight: "88vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-[var(--font-playfair)] text-lg font-black text-white">
            {lang === "en" ? "Your Journey" : "Jūsų kelias"}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-black overflow-hidden"
              style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                : <span className="text-white">{(profile.display_name?.[0] ?? "?").toUpperCase()}</span>}
            </div>
            <div>
              <div className="font-bold text-white text-base">{profile.display_name ?? "Holy Snacker"}</div>
              <div className="text-xs text-white/35 mt-0.5">
                {lang === "en" ? "Member since" : "Narys nuo"} {new Date(profile.created_at).getFullYear()}
              </div>
            </div>
          </div>

          {/* Level card */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(99,102,241,0.09)", border: "1px solid rgba(99,102,241,0.25)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-3xl">{current.emoji}</div>
                <div className="text-white font-black text-lg mt-1.5">{current.title}</div>
                <div className="text-xs text-white/35">{lang === "en" ? "Level" : "Lygis"} {current.level}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black" style={{ color: "#f0c855" }}>{profile.xp.toLocaleString()}</div>
                <div className="text-xs text-white/35">XP</div>
              </div>
            </div>
            {next ? (
              <>
                <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
                  <span>{xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP → {next.emoji} {next.title}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "linear-gradient(to right, #6366f1, #f0c855)", transition: "width 1s ease" }} />
                </div>
              </>
            ) : (
              <div className="text-xs text-[#f0c855]/70 font-bold">⭐ Max level reached!</div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: lang === "en" ? "Scans" : "Nuskaitymai", value: profile.total_scans, emoji: "🔍" },
              { label: lang === "en" ? "Streak" : "Serija",      value: `${profile.streak_days}d`, emoji: "🔥" },
              { label: lang === "en" ? "Level" : "Lygis",        value: current.level, emoji: current.emoji },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className="text-white font-black text-lg leading-none">{s.value}</div>
                <div className="text-[10px] text-white/30 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* All levels overview */}
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-3">
              {lang === "en" ? "Level Roadmap" : "Lygių kelias"}
            </div>
            <div className="space-y-1.5">
              {LEVELS.map((lvl) => {
                const isReached  = profile.xp >= lvl.xpRequired;
                const isCurrent  = lvl.level === current.level;
                return (
                  <div key={lvl.level} className="flex items-center gap-3 rounded-xl px-3 py-2"
                    style={{
                      background: isCurrent ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)",
                      border: isCurrent ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.05)",
                      opacity: isReached ? 1 : 0.4,
                    }}>
                    <span className="text-lg w-6 text-center">{lvl.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{lvl.title}</div>
                      <div className="text-[10px] text-white/30">{lvl.xpRequired.toLocaleString()} XP</div>
                    </div>
                    {isReached && <span className="text-[10px] text-green-400">✓</span>}
                    {isCurrent && <span className="text-[10px] text-[#f0c855] font-bold">NOW</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent scans */}
          {recentScans.length > 0 && (
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-3">
                {lang === "en" ? "Recent Scans" : "Paskutiniai nuskaitymai"}
              </div>
              <div className="space-y-2">
                {recentScans.map((s, i) => {
                  const g = getGrade(s.score);
                  return (
                    <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2.5"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="min-w-0 flex-1 mr-3">
                        <div className="text-sm text-white/80 font-medium truncate">{s.product_name}</div>
                        <div className="text-[10px] text-white/30">{new Date(s.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-black" style={{ color: g.color }}>{s.score}</span>
                        <span className="text-[10px] text-[#f0c855]/60 font-bold">+{s.xp_earned} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={onSignOut}
            className="w-full py-3 rounded-2xl text-sm text-white/35 hover:text-white/65 transition-colors border border-white/8 hover:border-white/18 mt-2">
            {lang === "en" ? "Sign out" : "Atsijungti"}
          </button>
        </div>
      </div>
    </div>
  );
}
