"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { HolyLogo } from "./HolyLogo";

export function AuthModal({ lang, onClose, onAuthed }: { lang: "en" | "lt"; onClose: () => void; onAuthed: () => void }) {
  const [mode, setMode]             = useState<"signin" | "signup">("signin");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState<string | null>(null);
  const [magicMode, setMagicMode]   = useState(false);
  const supabase = createClient();

  async function handleGoogle() {
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  async function handleApple() {
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  async function handleMagicLink() {
    if (!email) return;
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSuccess(lang === "en" ? "Magic link sent! Check your inbox." : "Nuoroda išsiųsta! Patikrinkite el. paštą.");
    setLoading(false);
  }

  async function handleEmail() {
    if (!email || !password) return;
    setLoading(true); setError(null);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else setSuccess(lang === "en" ? "Check your email to verify your account!" : "Patikrinkite el. paštą patvirtinimui!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else { onAuthed(); onClose(); }
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden animate-fade-in-up"
        style={{ background: "#0d1525", border: "1px solid rgba(240,200,85,0.22)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <div className="font-[var(--font-playfair)] text-xl font-black text-white">
              {mode === "signup" ? (lang === "en" ? "Join the Chosen" : "Prisijunk prie išrinktųjų") : (lang === "en" ? "Welcome Back" : "Sveiki sugrįžę")}
            </div>
            <div className="text-xs text-white/35 mt-1">
              {mode === "signup" ? (lang === "en" ? "Track your purity journey & earn XP" : "Sekite savo tyrumą ir kaupiami XP") : (lang === "en" ? "Continue your holy path" : "Tęskite šventąjį kelią")}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">✕</button>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-3">
          {/* OAuth buttons */}
          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl font-medium text-sm transition-all hover:bg-white/10 disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {lang === "en" ? "Continue with Google" : "Tęsti su Google"}
          </button>

          <button onClick={handleApple} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl font-medium text-sm transition-all hover:bg-white/10 disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            {lang === "en" ? "Continue with Apple" : "Tęsti su Apple"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[11px] text-white/20">{lang === "en" ? "or" : "arba"}</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {magicMode ? (
            /* Magic link flow */
            <>
              <input type="email" placeholder={lang === "en" ? "Email address" : "El. paštas"}
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleMagicLink()}
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#f0c855]/40 transition-colors" />

              {error   && <p className="text-xs text-red-400 px-1">{error}</p>}
              {success && <p className="text-xs text-green-400 px-1">{success}</p>}

              {!success && (
                <button onClick={handleMagicLink} disabled={loading || !email}
                  className="w-full py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 text-[#0b1220]"
                  style={{ background: "linear-gradient(to right, #d4a830, #fad55c)" }}>
                  {loading ? "…" : (lang === "en" ? "✦ Send Magic Link" : "✦ Siųsti nuorodą")}
                </button>
              )}

              <button onClick={() => { setMagicMode(false); setError(null); setSuccess(null); }}
                className="w-full text-center text-xs text-white/25 hover:text-white/50 transition-colors pt-1">
                {lang === "en" ? "Use password instead" : "Naudoti slaptažodį"}
              </button>
            </>
          ) : (
            /* Password flow */
            <>
              <input type="email" placeholder={lang === "en" ? "Email address" : "El. paštas"}
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#f0c855]/40 transition-colors" />
              <input type="password" placeholder={lang === "en" ? "Password" : "Slaptažodis"}
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleEmail()}
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#f0c855]/40 transition-colors" />

              {error   && <p className="text-xs text-red-400 px-1">{error}</p>}
              {success && <p className="text-xs text-green-400 px-1">{success}</p>}

              <button onClick={handleEmail} disabled={loading || !email || !password}
                className="w-full py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 text-[#0b1220]"
                style={{ background: "linear-gradient(to right, #d4a830, #fad55c)" }}>
                {loading ? "…" : mode === "signup" ? (lang === "en" ? "✦ Create Account" : "✦ Sukurti paskyrą") : (lang === "en" ? "✦ Sign In" : "✦ Prisijungti")}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <p className="text-white/25">
                  {mode === "signup" ? (lang === "en" ? "Already have an account? " : "Jau turite paskyrą? ") : (lang === "en" ? "New here? " : "Nauja? ")}
                  <button onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(null); setSuccess(null); }}
                    className="text-[#f0c855]/65 hover:text-[#f0c855] transition-colors">
                    {mode === "signup" ? (lang === "en" ? "Sign in" : "Prisijungti") : (lang === "en" ? "Create account" : "Registruotis")}
                  </button>
                </p>
                <button onClick={() => { setMagicMode(true); setError(null); setSuccess(null); }}
                  className="text-white/25 hover:text-[#f0c855]/65 transition-colors">
                  {lang === "en" ? "Magic link" : "Nuoroda"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
