"use client";

import { useState, useEffect } from "react";
import { createClient, getLevelInfo, computeXP, type Profile, type ScanRecord } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { getGrade } from "@/lib/scanner";
import { T } from "@/lib/translations";
import { useInView } from "@/lib/hooks";
import type { Category, Product, CartItem } from "@/lib/types";

import { HolyLogo } from "@/components/HolyLogo";
import { SolarSystem } from "@/components/SolarSystem";
import { MobilePlanetScroller } from "@/components/MobilePlanetScroller";
import { AuthModal } from "@/components/AuthModal";
import { UserProfilePanel } from "@/components/UserProfilePanel";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { BadPlanetPage } from "@/components/BadPlanetPage";
import { GoodPlanetPage } from "@/components/GoodPlanetPage";
import { ShopPage } from "@/components/ShopPage";
import { CategoryPage } from "@/components/CategoryPage";
import { FounderStorySection } from "@/components/FounderStorySection";
import { ComparisonSection } from "@/components/ComparisonSection";
import { LeaderboardSection } from "@/components/LeaderboardSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { IngredientScannerSection } from "@/components/IngredientScannerSection";
import { ProductQuizSection } from "@/components/ProductQuizSection";
import { LoyaltySection } from "@/components/LoyaltySection";
import { NewsletterSection } from "@/components/NewsletterSection";

export default function Home() {
  const [lang, setLang] = useState<"en" | "lt">("en");
  const [email, setEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [badPlanetOpen, setBadPlanetOpen] = useState(false);
  const [goodPlanetOpen, setGoodPlanetOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<{ product: Product; cat: Category } | null>(null);
  const t = T[lang];

  // ── Auth & profile state ────────────────────────────────────────────────────
  const [user, setUser]               = useState<User | null>(null);
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [authOpen, setAuthOpen]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [xpToast, setXpToast]         = useState<{ xp: number; label: string } | null>(null);

  // Load auth state on mount — getSession reads cookies immediately (catches post-OAuth redirects)
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        // Close auth modal on successful sign-in
        if (event === "SIGNED_IN") setAuthOpen(false);
      } else {
        setProfile(null);
        setRecentScans([]);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const supabase = createClient();
    const { data: p, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error || !p) {
      // Profile row missing — create it now (handles users who signed up before the trigger)
      const { data: authUser } = await supabase.auth.getUser();
      const meta = authUser?.user?.user_metadata ?? {};
      const fresh: Profile = {
        id: userId,
        display_name: meta.full_name ?? meta.name ?? null,
        avatar_url: meta.avatar_url ?? null,
        xp: 0, level: 1, streak_days: 0, last_scan_at: null, total_scans: 0,
        created_at: new Date().toISOString(),
      };
      try { await supabase.from("profiles").upsert(fresh, { onConflict: "id" }); } catch { /* silent */ }
      setProfile(fresh);
      return;
    }
    if (p) setProfile(p as Profile);
    const { data: scans } = await supabase.from("scan_records")
      .select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
    if (scans) setRecentScans(scans as ScanRecord[]);
  }

  // Called after every successful scan
  async function onScanComplete(productName: string, score: number) {
    if (!user) return;
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    const { data: p, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    // If DB tables not set up yet, just show XP toast from local profile state
    if (profileError || !p) {
      const localXp = computeXP(score, true, 0);
      setXpToast({ xp: localXp, label: "" });
      setTimeout(() => setXpToast(null), 3500);
      return;
    }
    const isFirstToday  = p.last_scan_at !== today;
    const newStreak     = isFirstToday ? (p.streak_days ?? 0) + 1 : p.streak_days ?? 0;
    const xpEarned      = computeXP(score, isFirstToday, newStreak);
    const newXp         = (p.xp ?? 0) + xpEarned;
    const { current: oldLevel } = getLevelInfo(p.xp ?? 0);
    const { current: newLevel } = getLevelInfo(newXp);
    const leveledUp     = newLevel.level > oldLevel.level;

    // Save scan
    await supabase.from("scan_records").insert({
      user_id: user.id, product_name: productName, score, grade: getGrade(score).label, xp_earned: xpEarned,
    });
    // Update profile
    await supabase.from("profiles").update({
      xp: newXp,
      level: newLevel.level,
      streak_days: newStreak,
      last_scan_at: today,
      total_scans: (p.total_scans ?? 0) + 1,
    }).eq("id", user.id);

    await loadProfile(user.id);
    setXpToast({ xp: xpEarned, label: leveledUp ? `Level up! ${newLevel.emoji} ${newLevel.title}` : "" });
    setTimeout(() => setXpToast(null), 3500);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfileOpen(false);
  }

  const missionAnim = useInView();

  // Cart helpers
  function addToCart(product: Product, cat: Category) {
    setCartItems(prev => {
      const exists = prev.find(i => i.product.name === product.name);
      if (exists) return prev.map(i => i.product.name === product.name ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, cat, quantity: 1 }];
    });
    setCartOpen(true);
  }
  function updateQty(name: string, delta: number) {
    setCartItems(prev => prev.map(i => i.product.name === name ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
  }
  function removeFromCart(name: string) {
    setCartItems(prev => prev.filter(i => i.product.name !== name));
  }

  // Prevent body scroll when any overlay is open
  useEffect(() => {
    document.body.style.overflow = (selectedCat || shopOpen || badPlanetOpen || goodPlanetOpen || detailProduct) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedCat, shopOpen, badPlanetOpen, goodPlanetOpen, detailProduct]);

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#f0eee8]">

      {/* Auth modal */}
      {authOpen && <AuthModal lang={lang} onClose={() => setAuthOpen(false)} onAuthed={() => setAuthOpen(false)} />}

      {/* Profile panel */}
      {profileOpen && profile && (
        <UserProfilePanel profile={profile} recentScans={recentScans} lang={lang}
          onClose={() => setProfileOpen(false)} onSignOut={signOut} />
      )}

      {/* XP Toast */}
      {xpToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up pointer-events-none">
          <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5"
            style={{ background: "#0d1525", border: "1px solid rgba(240,200,85,0.35)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            <span className="text-2xl">⚡</span>
            <div>
              <div className="text-sm font-black text-[#f0c855]">+{xpToast.xp} XP earned!</div>
              {xpToast.label && <div className="text-xs text-white/60 mt-0.5">{xpToast.label}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <CartDrawer items={cartItems} lang={lang} onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty} onRemove={removeFromCart} />
      )}

      {/* Product detail modal */}
      {detailProduct && (
        <ProductDetailModal product={detailProduct.product} cat={detailProduct.cat} lang={lang}
          onBack={() => setDetailProduct(null)} onAddToCart={addToCart} />
      )}

      {/* Bad Planet overlay */}
      {badPlanetOpen && (
        <BadPlanetPage lang={lang} onBack={() => setBadPlanetOpen(false)} />
      )}

      {/* Good Planet overlay */}
      {goodPlanetOpen && (
        <GoodPlanetPage lang={lang} onBack={() => setGoodPlanetOpen(false)} />
      )}

      {/* Shop overlay */}
      {shopOpen && (
        <ShopPage lang={lang} onBack={() => setShopOpen(false)}
          onOpenCat={(cat) => { setShopOpen(false); setSelectedCat(cat); }}
          onAddToCart={addToCart}
          onOpenDetail={(p, c) => setDetailProduct({ product: p, cat: c })} />
      )}

      {/* Category overlay */}
      {selectedCat && (
        <CategoryPage cat={selectedCat} lang={lang} onBack={() => setSelectedCat(null)}
          onAddToCart={addToCart}
          onOpenDetail={(p, c) => setDetailProduct({ product: p, cat: c })} />
      )}

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0b1220]/75 backdrop-blur-md border-b border-[#f0c855]/15">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <HolyLogo />
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#solar" className="hover:text-[#f0c855] transition-colors">{t.nav.products}</a>
            <a href="/about" className="hover:text-[#f0c855] transition-colors">{t.nav.about}</a>
            <a href="#mission" className="hover:text-[#f0c855] transition-colors">{t.nav.mission}</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === "en" ? "lt" : "en")}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#f0c855]/20 hover:border-[#f0c855]/50 transition-colors text-[#f0c855]/60 hover:text-[#f0c855]">
              {lang === "en" ? "LT" : "EN"}
            </button>
            {/* Auth / Profile button */}
            {user && profile ? (
              (() => {
                const li = getLevelInfo(profile.xp);
                return (
                  <button onClick={() => setProfileOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6366f1]/30 hover:border-[#6366f1]/60 transition-all text-white/70 hover:text-white"
                    style={{ background: "rgba(99,102,241,0.1)" }}>
                    <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-black"
                      style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)" }}>
                      {profile.avatar_url
                        ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                        : <span className="text-white">{(profile.display_name?.[0] ?? "?").toUpperCase()}</span>}
                    </div>
                    {/* XP + level progress (desktop) */}
                    <div className="hidden sm:flex flex-col gap-[3px]">
                      <span className="text-[10px] font-black leading-none" style={{ color: "#f0c855" }}>
                        {li.current.emoji} {li.current.title} · {profile.xp.toLocaleString()} XP
                      </span>
                      {/* Mini progress bar */}
                      <div className="h-[3px] rounded-full overflow-hidden" style={{ width: 72, background: "rgba(240,200,85,0.15)" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${li.progress}%`, background: "linear-gradient(to right, #d4a830, #fad55c)" }} />
                      </div>
                    </div>
                  </button>
                );
              })()
            ) : (
              <button onClick={() => setAuthOpen(true)}
                className="text-xs font-bold px-4 py-1.5 rounded-full border border-[#6366f1]/40 hover:border-[#6366f1]/70 transition-all text-[#818cf8] hover:text-white"
                style={{ background: "rgba(99,102,241,0.1)" }}>
                {lang === "en" ? "Sign In" : "Prisijungti"}
              </button>
            )}
            <button onClick={() => setShopOpen(true)}
              className="hidden md:block text-sm font-bold px-5 py-2 rounded-full hover:opacity-90 transition-opacity text-[#0b1220]"
              style={{ background: "linear-gradient(to right, #d4a830, #fad55c)" }}>
              {t.nav.shop}
            </button>
            {/* Cart icon */}
            <button onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center w-9 h-9 rounded-full border border-[#f0c855]/20 hover:border-[#f0c855]/50 text-[#f0c855]/55 hover:text-[#f0c855] transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartItems.reduce((s, i) => s + i.quantity, 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-[#0b1220]"
                  style={{ background: "#f0c855" }}>
                  {cartItems.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
            <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className={`block w-5 h-0.5 bg-white/70 transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-white/70 transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-white/70 transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#f0c855]/10 bg-[#0d1525] px-6 py-4 flex flex-col gap-4">
            <a href="#solar" onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-[#f0c855] py-2">{t.nav.products}</a>
            <a href="/about" onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-[#f0c855] py-2">{t.nav.about}</a>
            <button onClick={() => { setShopOpen(true); setMobileMenuOpen(false); }} className="mt-2 py-3 rounded-full text-[#0b1220] font-bold text-sm" style={{ background: "linear-gradient(to right, #d4a830, #fad55c)" }}>{t.nav.shop}</button>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen w-full overflow-x-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-[700px] h-[700px] rounded-full -translate-y-1/2"
            style={{ background: "radial-gradient(ellipse, rgba(99,150,255,0.08) 0%, transparent 70%)" }} />
          <div className="absolute top-0 left-1/4 w-[500px] h-[280px]"
            style={{ background: "radial-gradient(ellipse, rgba(240,200,85,0.10) 0%, transparent 70%)" }} />
          <div className="absolute top-0 left-1/3 w-0.5 h-64"
            style={{ background: "linear-gradient(to bottom, rgba(240,200,85,0.2), transparent)" }} />

          {/* ── Desktop visual bridge: connecting text ↔ solar system ── */}
          {/* Horizontal gradient beam spanning the gap */}
          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: "38%", right: "28%", height: 2,
              background: "linear-gradient(to right, rgba(129,140,248,0.22), rgba(240,200,85,0.12), rgba(129,140,248,0.04))" }} />
          {/* Mid-point glow node */}
          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
            style={{ left: "52%", width: 6, height: 6, borderRadius: "50%",
              background: "rgba(129,140,248,0.8)", boxShadow: "0 0 14px 4px rgba(129,140,248,0.4)",
              animation: "float 3s ease-in-out infinite" }} />
          {/* Bridge sparkles */}
          {[
            { left: "43%", top: "42%", size: 3, delay: "0s", color: "rgba(240,200,85,0.6)" },
            { left: "48%", top: "58%", size: 2, delay: "0.8s", color: "rgba(129,140,248,0.7)" },
            { left: "56%", top: "38%", size: 2.5, delay: "1.6s", color: "rgba(240,200,85,0.5)" },
            { left: "62%", top: "54%", size: 2, delay: "0.4s", color: "rgba(192,132,252,0.6)" },
          ].map((s, i) => (
            <div key={i} className="hidden lg:block absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{ left: s.left, top: s.top, width: s.size * 2, height: s.size * 2,
                background: s.color, boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
                animation: `float 2.5s ease-in-out infinite`, animationDelay: s.delay }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center min-h-screen max-w-7xl mx-auto px-6 pt-28 pb-12 gap-8">

          {/* Left — text */}
          <div className="w-full lg:flex-1 lg:max-w-xl">
            {/* Floating ✦ sparkles — decorative */}
            <div className="hidden lg:block relative h-0">
              <span className="absolute -top-8 -left-4 text-[#f0c855]/20 text-xl animate-float select-none">✦</span>
              <span className="absolute -top-2 left-48 text-[#f0c855]/15 text-sm animate-float select-none" style={{ animationDelay: "1.2s" }}>✦</span>
            </div>

            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#f0c855] mb-6 px-4 py-2 rounded-full border border-[#f0c855]/30 bg-[#f0c855]/5">
              {t.badge}
            </span>

            <h1 className="font-[var(--font-playfair)] text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-6 whitespace-pre-line">
              <span className="bg-gradient-to-br from-[#93c5fd] via-[#d8b4fe] to-[#fcd34d] bg-clip-text text-transparent">
                {t.hero.tagline}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/65 mb-10 leading-relaxed max-w-md">
              {t.hero.sub}
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <a href="#solar" className="px-8 py-4 rounded-full font-bold text-sm hover:opacity-90 transition-all hover:scale-105 text-[#0b1220]"
                style={{ background: "linear-gradient(to right, #d4a830, #fad55c)", boxShadow: "0 4px 24px rgba(240,200,85,0.3)" }}>
                {t.hero.cta}
              </a>
              <a href="#mission" className="px-8 py-4 rounded-full border border-[#f0c855]/20 text-[#f0c855]/70 font-semibold text-sm hover:border-[#f0c855]/50 hover:text-[#f0c855] transition-all">
                {t.hero.cta2}
              </a>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/5">
              {[
                { num: "6", label: lang === "en" ? "Planets" : "Planetos" },
                { num: "20+", label: lang === "en" ? "Products" : "Produktai" },
                { num: "100%", label: lang === "en" ? "Natural" : "Natūralu" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-[var(--font-playfair)] text-2xl font-black" style={{ color: "#f0c855" }}>{s.num}</div>
                  <div className="text-xs text-white/40 tracking-widest uppercase mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Solar system (desktop only) */}
          <div id="solar" className="hidden lg:flex flex-1 justify-center items-center">
            <SolarSystem onSelectCategory={setSelectedCat} onBadPlanet={() => setBadPlanetOpen(true)} onGoodPlanet={() => setGoodPlanetOpen(true)} hint={t.clickHint} />
          </div>

          {/* Mobile planet swiper — replaces scaled solar system */}
          <div className="lg:hidden w-full">
            <MobilePlanetScroller
              onSelectCategory={setSelectedCat}
              onBadPlanet={() => setBadPlanetOpen(true)}
              onGoodPlanet={() => setGoodPlanetOpen(true)}
              lang={lang}
            />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-[#f0c855]/10 bg-[#f0c855]/[0.02] py-4">
        <div className="flex whitespace-nowrap gap-8 text-xs tracking-widest text-[#f0c855]/40 font-medium animate-marquee">
          <span>{t.marquee}</span><span>{t.marquee}</span>
        </div>
      </div>

      {/* ── MISSION ──────────────────────────────────────────────── */}
      <section id="mission" className="px-6 py-24 relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(240,200,85,0.12) 0%, rgba(11,18,32,0) 60%), #0b1220", borderTop: "1px solid rgba(240,200,85,0.2)", borderBottom: "1px solid rgba(240,200,85,0.2)" }}>

        {/* Sun rays background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full opacity-10"
            style={{ background: "linear-gradient(to bottom, #f0c855, transparent)" }} />
          {[-60,-30,0,30,60].map((deg, i) => (
            <div key={i} className="absolute top-0 left-1/2 origin-top h-96 w-px opacity-[0.06]"
              style={{ background: "linear-gradient(to bottom, #f0c855, transparent)", transform: `rotate(${deg}deg)` }} />
          ))}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] opacity-20"
            style={{ background: "radial-gradient(ellipse, rgba(240,200,85,0.6) 0%, transparent 70%)" }} />
        </div>

        <div ref={missionAnim.ref}
          className={`max-w-5xl mx-auto relative z-10 transition-all duration-700 ${missionAnim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

          {/* Sun icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle at 35% 35%, #fde68a, #f0c855 50%, #b8860b)",
                boxShadow: "0 0 30px 8px rgba(240,200,85,0.5)",
              }}>
              <span className="font-[var(--font-playfair)] font-black text-xl text-[#0b1220]">H</span>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "#f0c855", textShadow: "0 0 40px rgba(240,200,85,0.4)" }}>
              {t.mission.title}
            </h2>
            <p className="text-white/65 text-lg max-w-3xl mx-auto leading-relaxed">{t.mission.sub}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {t.mission.pillars.map((p, i) => (
              <div key={i} className="p-6 rounded-2xl text-center group transition-all duration-300 hover:-translate-y-1"
                style={{ background: "rgba(240,200,85,0.05)", border: "1px solid rgba(240,200,85,0.15)", boxShadow: "0 0 20px rgba(240,200,85,0.04)" }}>
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{p.icon}</div>
                <h3 className="font-bold mb-2" style={{ color: "#f0c855" }}>{p.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Explore planets CTA */}
          <div className="flex justify-center">
            <a href="#solar"
              className="group flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105"
              style={{
                background: "radial-gradient(circle at 35% 35%, #fde68a, #f0c855 50%, #d4a830)",
                color: "#0b1220",
                boxShadow: "0 0 30px 8px rgba(240,200,85,0.3)",
              }}>
              <span className="text-lg">🪐</span>
              {lang === "en" ? "Explore the Planets" : "Tyrinėk planetas"}
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOUNDER STORY ────────────────────────────────────────── */}
      <FounderStorySection lang={lang} />

      {/* ── COMPARISON ───────────────────────────────────────────── */}
      <ComparisonSection lang={lang} />

      {/* ── LEADERBOARD ──────────────────────────────────────────── */}
      <LeaderboardSection lang={lang} currentUserId={user?.id} />

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <TestimonialsSection lang={lang} />

      {/* ── INGREDIENT SCANNER ───────────────────────────────────── */}
      <div id="scanner">
        <IngredientScannerSection lang={lang} user={user} onScanComplete={onScanComplete} />
      </div>

      {/* ── PRODUCT QUIZ ─────────────────────────────────────────── */}
      <ProductQuizSection lang={lang} onSelectCategory={setSelectedCat} />

      {/* ── LOYALTY ──────────────────────────────────────────────── */}
      <LoyaltySection lang={lang} />

      {/* ── NEWSLETTER ───────────────────────────────────────────── */}
      <NewsletterSection lang={lang} />

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-[#f0c855]/10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <HolyLogo size="lg" />
              <p className="text-sm text-white/25 italic mt-3">{t.footer.tagline}</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/30">
              <a href="#solar" className="hover:text-[#f0c855] transition-colors">{lang === "en" ? "Products" : "Produktai"}</a>
              <a href="#mission" className="hover:text-[#f0c855] transition-colors">{lang === "en" ? "Mission" : "Misija"}</a>
              <a href="#scanner" className="hover:text-[#f0c855] transition-colors">{lang === "en" ? "Scanner" : "Skaitytuvas"}</a>
              <a href="#leaderboard" className="hover:text-[#f0c855] transition-colors">{lang === "en" ? "Leaderboard" : "Lyderiai"}</a>
              <a href="/about" className="hover:text-[#f0c855] transition-colors">{lang === "en" ? "About" : "Apie mus"}</a>
              <a href="/contact" className="hover:text-[#f0c855] transition-colors">{lang === "en" ? "Contact" : "Kontaktai"}</a>
              <a href="/privacy" className="hover:text-[#f0c855] transition-colors">{lang === "en" ? "Privacy" : "Privatumas"}</a>
              <a href="/terms" className="hover:text-[#f0c855] transition-colors">{lang === "en" ? "Terms" : "Sąlygos"}</a>
            </div>
            <div className="flex items-center gap-4">
              {[
                { label: "Instagram", stroke: true, d: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
                { label: "TikTok", stroke: false, d: <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/> },
                { label: "Facebook", stroke: false, d: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> },
              ].map(({ label, d, stroke }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-10 h-10 rounded-full border border-[#f0c855]/15 flex items-center justify-center text-white/30 hover:text-[#f0c855] hover:border-[#f0c855]/40 transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={stroke ? "none" : "currentColor"} stroke={stroke ? "currentColor" : "none"} strokeWidth={stroke ? 2 : 0} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
                </a>
              ))}
            </div>
          </div>
          <div className="border-t border-[#f0c855]/10 pt-6 flex items-center justify-center gap-3">
            <span className="text-[#f0c855]/20 text-xs">✦</span>
            <p className="text-xs text-white/15">{t.footer.copy}</p>
            <span className="text-[#f0c855]/20 text-xs">✦</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
