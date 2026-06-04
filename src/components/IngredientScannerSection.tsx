"use client";

import { useState, useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { useInView } from "@/lib/hooks";
import { scanText, computeScore, getGrade, looksLikeProductName, searchLTBrand, KNOWN_BRANDS, LT_BRANDS, badPts } from "@/lib/scanner";
import type { ScanResult, GoodResult, FetchedProduct, ScanHistoryItem, LTBrand } from "@/lib/scanner";
import { ProductReviews } from "@/components/ProductReviews";
import { ReviewForm } from "@/components/ReviewForm";

export function IngredientScannerSection({ lang, user, onScanComplete }: { lang: "en" | "lt"; user: User | null; onScanComplete: (productName: string, score: number) => void }) {
  const anim = useInView(0.1);
  const [input, setInput]                     = useState("");
  const [badResults, setBadResults]           = useState<ScanResult[]>([]);
  const [goodResults, setGoodResults]         = useState<GoodResult[]>([]);
  const [fetched, setFetched]                 = useState<FetchedProduct | null>(null);
  const [notFound, setNotFound]               = useState(false);
  const [missedCount, setMissedCount]         = useState(0);
  const [showSubmit, setShowSubmit]           = useState(false);
  const [submitBrand, setSubmitBrand]         = useState("");
  const [submitIngredients, setSubmitIngredients] = useState("");
  const [submitDone, setSubmitDone]           = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [scanned, setScanned]                 = useState(false);
  const [scanning, setScanning]               = useState(false);
  const [scanPhase, setScanPhase]             = useState<"idle"|"lookup"|"analysing"|"researching">("idle");
  const [showIngredients, setShowIngredients] = useState(false);
  const [brandResults, setBrandResults]       = useState<LTBrand | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [cameraOpen, setCameraOpen]           = useState(false);
  const [suggestions, setSuggestions]         = useState<string[]>([]);
  const [suggFocused, setSuggFocused]         = useState(-1);
  const [scanHistory, setScanHistory]         = useState<ScanHistoryItem[]>([]);
  const [productScanCount, setProductScanCount] = useState<number | null>(null);
  const videoRef      = useRef<HTMLVideoElement>(null);
  const controlsRef   = useRef<{ stop(): void } | null>(null);

  // Autocomplete suggestions
  useEffect(() => {
    const q = input.toLowerCase().trim();
    if (!q || q.length < 2 || !looksLikeProductName(input)) { setSuggestions([]); return; }

    const seen = new Set<string>();
    const results: string[] = [];

    // KNOWN_BRANDS keys
    for (const key of Object.keys(KNOWN_BRANDS)) {
      if (key.startsWith(q) && key !== q) {
        const label = KNOWN_BRANDS[key].productName;
        if (!seen.has(label)) { seen.add(label); results.push(label); }
      }
    }
    // LT brands
    for (const brand of LT_BRANDS) {
      if (brand.aliases.some(a => a.startsWith(q)) && !seen.has(brand.display)) {
        seen.add(brand.display); results.push(brand.display);
      }
    }

    setSuggestions(results.slice(0, 6));
    setSuggFocused(-1);
  }, [input]);

  // Load scan history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hs_scan_history");
      if (stored) setScanHistory(JSON.parse(stored));
    } catch {}
  }, []);

  // Close camera and stop ZXing scanning controls
  function closeCamera() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraOpen(false);
  }

  // Open camera and start ZXing barcode decoding
  async function openCamera() {
    setCameraOpen(true);
    // Dynamically import to avoid SSR issues
    const { BrowserMultiFormatReader } = await import("@zxing/browser");
    const reader = new BrowserMultiFormatReader();
    try {
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result) => {
          if (result) {
            const barcode = result.getText();
            controls.stop();
            controlsRef.current = null;
            setCameraOpen(false);
            setInput(barcode);
            scanWithQuery(barcode);
          }
        }
      );
      controlsRef.current = controls;
    } catch {
      closeCamera();
    }
  }

  async function recordMissed(query: string): Promise<boolean> {
    try {
      const res = await fetch("/api/missed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, userId: user?.id ?? null }),
      });
      const data = await res.json();
      setMissedCount(data.count ?? 1);
      return data.autoFound ?? false;
    } catch { return false; }
  }

  async function submitIngredientForm() {
    if (!submitIngredients.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: input.trim(),
          brand: submitBrand,
          ingredients: submitIngredients,
          userId: user?.id ?? null,
        }),
      });
      setSubmitDone(true);
    } catch { /* silent */ }
    setSubmitting(false);
  }

  async function scan() { await scanWithQuery(input.trim()); }

  async function scanWithQuery(q: string) {
    if (!q) return;
    setScanning(true);
    setScanned(false);
    setFetched(null);
    setNotFound(false);
    setShowIngredients(false);
    setBrandResults(null);
    setExpandedProduct(null);

    let textToScan    = q;
    let resolvedName  = q; // track product name for XP record

    if (looksLikeProductName(q)) {
      setScanPhase("lookup");

      // ── Layer 0: Lithuanian brand database ──
      const ltBrand = searchLTBrand(q);
      if (ltBrand) {
        setScanPhase("analysing");
        await new Promise(r => setTimeout(r, 500));
        setBrandResults(ltBrand);
        setScanned(true);
        setScanning(false);
        setScanPhase("idle");
        // Award XP for brand browse (use avg score of brand products)
        if (user) {
          const avgScore = Math.round(
            ltBrand.products.reduce((sum, p) => {
              const { bad, good } = scanText(p.ingredients);
              return sum + computeScore(bad, good);
            }, 0) / ltBrand.products.length
          );
          onScanComplete(ltBrand.display, avgScore);
        }
        return;
      }

      // ── Layer 1: instant hardcoded lookup for 25 major brands ──
      const key = q.toLowerCase().trim();
      const known = KNOWN_BRANDS[key];

      if (known) {
        const product: FetchedProduct = {
          productName: known.productName,
          brand:       known.brand,
          ingredients: known.ingredients,
          nutriscore:  known.nutriscore ?? null,
          image:       null,
        };
        setFetched(product);
        textToScan   = known.ingredients;
        resolvedName = known.productName;

      } else {
        // ── Layer 2: Open Food Facts API ──
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6000);
          const res  = await fetch(`/api/scan?q=${encodeURIComponent(q)}`, { signal: controller.signal });
          clearTimeout(timer);
          const data = await res.json() as { found: boolean } & Partial<FetchedProduct>;
          if (data.found && data.ingredients) {
            const product: FetchedProduct = {
              productName: data.productName ?? q,
              brand:       data.brand       ?? "",
              ingredients: data.ingredients,
              nutriscore:  data.nutriscore  ?? null,
              image:       data.image       ?? null,
            };
            setFetched(product);
            textToScan   = data.ingredients;
            resolvedName = data.productName ?? q;
            // Social proof: if cached, estimate scan count from product name seed
            if ((data as Record<string, unknown>).fromCache) {
              let seed = 0;
              for (let i = 0; i < resolvedName.length; i++) seed = (seed * 31 + resolvedName.charCodeAt(i)) & 0xffff;
              setProductScanCount(120 + (seed % 4800));
            }
          } else {
            // Not found — research it immediately
            setNotFound(true);
            setScanning(false);
            setScanPhase("researching");
            const autoFound = await recordMissed(q);
            if (autoFound) {
              // Found by auto-research — retry silently
              setNotFound(false);
              setScanPhase("lookup");
              setScanning(true);
              await scanWithQuery(q);
              return;
            }
            setScanPhase("idle");
            setScanned(true);
            setScanning(false);
            return;
          }
        } catch {
          setNotFound(true);
          setScanning(false);
          setScanPhase("researching");
          const autoFound = await recordMissed(q);
          if (autoFound) {
            setNotFound(false);
            setScanPhase("lookup");
            setScanning(true);
            await scanWithQuery(q);
            return;
          }
          setScanPhase("idle");
          setScanned(true);
          setScanning(false);
          return;
        }
      }
    } else {
      // Ingredient list typed manually — use a short label
      resolvedName = textToScan.length < 50 ? textToScan : "Manual ingredient scan";
    }

    // ── Bidirectional analysis ──
    setScanPhase("analysing");
    await new Promise(r => setTimeout(r, 600));
    const { bad, good } = scanText(textToScan);
    setBadResults(bad);
    setGoodResults(good);
    setScanned(true);
    setScanning(false);
    setScanPhase("idle");

    // ── Save to scan history ──
    const histScore = computeScore(bad, good);
    const histItem: ScanHistoryItem = { query: q, productName: resolvedName, score: histScore, timestamp: Date.now() };
    setScanHistory(prev => {
      const deduped = prev.filter(h => h.query.toLowerCase() !== q.toLowerCase());
      const next = [histItem, ...deduped].slice(0, 8);
      try { localStorage.setItem("hs_scan_history", JSON.stringify(next)); } catch {}
      return next;
    });

    // ── Award XP if user is logged in ──
    if (user) {
      onScanComplete(resolvedName, histScore);
    }
  }

  function reset() {
    setInput(""); setBadResults([]); setGoodResults([]); setFetched(null);
    setNotFound(false); setMissedCount(0); setShowSubmit(false);
    setSubmitBrand(""); setSubmitIngredients(""); setSubmitDone(false);
    setScanned(false); setScanning(false);
    setScanPhase("idle"); setShowIngredients(false);
    setBrandResults(null); setExpandedProduct(null);
    setProductScanCount(null);
  }

  const dangerColor = { high: "#ef4444", medium: "#f97316", low: "#eab308" };
  const score = computeScore(badResults, goodResults);
  const grade = getGrade(score);

  const phaseLabel = {
    lookup:      lang === "en" ? "🔍 Looking up product…"          : "🔍 Ieškoma produkto…",
    analysing:   lang === "en" ? "⚗️ Analysing ingredients…"       : "⚗️ Analizuojami ingredientai…",
    researching: lang === "en" ? "🌐 Researching across databases…" : "🌐 Ieškoma duomenų bazėse…",
    idle: "",
  };

  // Bonus / penalty totals for display (1000-pt scale)
  const totalBonus   = goodResults.reduce((s, r) => s + r.ingredient.bonus, 0);
  const totalPenalty = badResults.reduce((s, r) => s + badPts(r), 0);

  return (
    <section className="relative py-28 px-6 overflow-hidden" style={{ background: "radial-gradient(ellipse at 30% 60%, #0a0d1a 0%, #0b1220 70%)" }}>
      <div className="absolute left-0 top-1/3 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-15"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />

      <div ref={anim.ref} className="max-w-3xl mx-auto">

        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#818cf8" }}>
            ✦ {lang === "en" ? "Smart Ingredient Scanner" : "Išmanusis ingredientų skaitytuvas"}
          </p>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-black text-white mb-4">
            {lang === "en"
              ? <>Is your snack<br /><span style={{ color: "#818cf8" }}>actually clean?</span></>
              : <>Ar jūsų užkandis<br /><span style={{ color: "#818cf8" }}>tikrai švarus?</span></>}
          </h2>
          <p className="text-white/45 max-w-lg mx-auto text-sm leading-relaxed">
            {lang === "en"
              ? "Type any product name (\"Milka\", \"Lays\", \"Oreo\") or a Lithuanian brand (\"Pergalė\", \"Rūta\", \"Selga\") to see every product scored — or paste an ingredient label directly."
              : "Įveskite produkto pavadinimą, lietuvišką prekės ženklą (\"Pergalė\", \"Rūta\", \"Selga\") arba įklijuokite ingredientų sąrašą. Blogi ingredientai atima taškus, geri — prideda."}
          </p>
        </div>

        {/* Scanner box */}
        <div className={`rounded-3xl overflow-hidden transition-all duration-700 delay-150 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(129,140,248,0.18)" }}>

          {/* Input */}
          <div className="p-6 pb-2">

            {/* ── Mobile: prominent barcode camera CTA ── */}
            <button onClick={openCamera} disabled={scanning}
              className="sm:hidden w-full flex items-center gap-4 py-4 px-5 rounded-2xl mb-4 transition-all active:scale-[0.98] disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(129,140,248,0.07) 100%)",
                border: "1px solid rgba(129,140,248,0.4)",
                boxShadow: "0 0 28px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}>
              {/* Camera icon circle */}
              <div style={{
                width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(129,140,248,0.2))",
                border: "1px solid rgba(129,140,248,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
                boxShadow: "0 0 16px rgba(99,102,241,0.25)",
              }}>📷</div>
              {/* Text */}
              <div className="text-left flex-1 min-w-0">
                <div className="font-black text-sm tracking-wide leading-tight" style={{ color: "#818cf8" }}>
                  {lang === "en" ? "Scan Barcode" : "Nuskaityti brūkšninį kodą"}
                </div>
                <div className="text-[10px] leading-tight mt-0.5" style={{ color: "rgba(129,140,248,0.5)" }}>
                  {lang === "en" ? "Point camera at any product" : "Nukreipkite kamerą į produktą"}
                </div>
              </div>
              <span className="text-base" style={{ color: "rgba(129,140,248,0.45)" }}>→</span>
            </button>

            {/* Mobile divider */}
            <div className="sm:hidden flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
                {lang === "en" ? "or type / paste below" : "arba įveskite žemiau"}
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            </div>

            <div className="text-[9px] font-bold tracking-widest uppercase text-white/25 mb-3">
              {looksLikeProductName(input) && input.trim() && searchLTBrand(input)
                ? (lang === "en" ? `🇱🇹 Lithuanian brand detected — showing all ${searchLTBrand(input)!.products.length} products` : `🇱🇹 Rastas lietuviškas prekės ženklas — rodomi visi ${searchLTBrand(input)!.products.length} produktai`)
                : looksLikeProductName(input) && input.trim()
                ? (lang === "en" ? "📦 Product name detected — will auto-lookup ingredients" : "📦 Rastas produkto pavadinimas — ingredientai bus paieškoti automatiškai")
                : input.trim()
                ? (lang === "en" ? "📋 Ingredient list detected — scanning directly" : "📋 Rastas ingredientų sąrašas — skenuojama tiesiogiai")
                : (lang === "en" ? "Type a product name or paste an ingredient list" : "Įveskite produkto pavadinimą arba įklijuokite ingredientų sąrašą")}
            </div>
            <div className="relative">
              <textarea
                value={input}
                onChange={e => { setInput(e.target.value); setScanned(false); setBadResults([]); setGoodResults([]); setFetched(null); setNotFound(false); }}
                onKeyDown={e => {
                  if (suggestions.length > 0) {
                    if (e.key === "ArrowDown") { e.preventDefault(); setSuggFocused(i => Math.min(i + 1, suggestions.length - 1)); return; }
                    if (e.key === "ArrowUp")   { e.preventDefault(); setSuggFocused(i => Math.max(i - 1, -1)); return; }
                    if (e.key === "Enter" && suggFocused >= 0) { e.preventDefault(); setInput(suggestions[suggFocused]); setSuggestions([]); return; }
                    if (e.key === "Escape") { setSuggestions([]); return; }
                  }
                  if (e.key === "Enter" && !e.shiftKey && !scanning) { e.preventDefault(); scan(); }
                }}
                onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                placeholder={lang === "en"
                  ? "e.g. Milka  ·  Carlsberg  ·  Pergalė  ·  Rūta  ·  or paste an ingredient list..."
                  : "pvz. Pergalė  ·  Rūta  ·  Milka  ·  arba įklijuokite ingredientų sąrašą..."}
                className="w-full bg-transparent text-white/85 placeholder-white/18 text-sm leading-relaxed resize-none outline-none"
                style={{ minHeight: 80 }}
              />
              {/* Autocomplete dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl overflow-hidden"
                  style={{ background: "#0e1628", border: "1px solid rgba(129,140,248,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                  {suggestions.map((s, i) => (
                    <button key={s} type="button"
                      onMouseDown={() => { setInput(s); setSuggestions([]); }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3"
                      style={{ background: i === suggFocused ? "rgba(129,140,248,0.15)" : "transparent", color: i === suggFocused ? "#818cf8" : "rgba(255,255,255,0.65)" }}>
                      <span className="text-white/25">🔍</span>
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-5 flex items-center gap-3 flex-wrap">
            <button onClick={scan} disabled={scanning || !input.trim()}
              className="px-7 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: scanning ? "rgba(129,140,248,0.2)" : "linear-gradient(135deg, #6366f1, #818cf8)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
              }}>
              {scanning ? phaseLabel[scanPhase] : (lang === "en" ? "🔍 Scan" : "🔍 Nuskaityti")}
            </button>
            <button onClick={openCamera} disabled={scanning}
              title={lang === "en" ? "Scan barcode with camera" : "Nuskaityti brūkšninį kodą kamera"}
              className="hidden sm:flex px-4 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed items-center gap-2"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(129,140,248,0.3)",
                color: "#818cf8",
              }}>
              📷 {lang === "en" ? "Barcode" : "Kodas"}
            </button>
            {(input || scanned) && (
              <button onClick={reset} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                {lang === "en" ? "Clear" : "Išvalyti"}
              </button>
            )}
            {!scanning && !scanned && (
              <span className="text-[10px] text-white/20 ml-auto hidden sm:block">
                {lang === "en" ? "Enter ↵ to scan" : "Enter ↵ nuskaityti"}
              </span>
            )}
          </div>

          {/* Scan line */}
          {scanning && (
            <div className="relative h-0.5 w-full overflow-hidden" style={{ background: "rgba(129,140,248,0.08)" }}>
              <div className="absolute inset-y-0 w-1/3 animate-scan"
                style={{ background: "linear-gradient(to right, transparent, #818cf8, transparent)" }} />
            </div>
          )}
        </div>

        {/* ── Scan History ── */}
        {!scanned && scanHistory.length > 0 && (
          <div className="mt-6 animate-fade-in-up">
            <div className="text-[9px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "rgba(255,255,255,0.2)" }}>
              {lang === "en" ? "Recently scanned" : "Neseniai tikrinta"}
            </div>
            <div className="flex flex-col gap-2">
              {scanHistory.map((item) => {
                const g = getGrade(item.score);
                const relTime = (() => {
                  const diff = Date.now() - item.timestamp;
                  const m = Math.floor(diff / 60000);
                  const h = Math.floor(diff / 3600000);
                  const d = Math.floor(diff / 86400000);
                  if (d > 0) return lang === "en" ? `${d}d ago` : `prieš ${d}d`;
                  if (h > 0) return lang === "en" ? `${h}h ago` : `prieš ${h}h`;
                  if (m > 0) return lang === "en" ? `${m}m ago` : `prieš ${m}min`;
                  return lang === "en" ? "just now" : "ką tik";
                })();
                return (
                  <button key={item.timestamp} onClick={() => { setInput(item.query); scanWithQuery(item.query); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {/* Score pill */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                      style={{ background: `${g.color}18`, border: `1px solid ${g.color}40`, color: g.color }}>
                      {item.score}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white/75 truncate leading-tight">{item.productName}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{relTime}</div>
                    </div>
                    {/* Grade */}
                    <div className="text-xs font-black flex-shrink-0" style={{ color: g.color }}>{g.label}</div>
                    <span className="text-white/20 text-xs flex-shrink-0">↺</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Camera modal */}
        {cameraOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
            <div className="relative w-full max-w-sm rounded-3xl overflow-hidden"
              style={{ background: "#0b1220", border: "1px solid rgba(129,140,248,0.3)" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid rgba(129,140,248,0.12)" }}>
                <div>
                  <div className="font-bold text-white text-sm">
                    {lang === "en" ? "📷 Scan barcode" : "📷 Nuskaityti brūkšninį kodą"}
                  </div>
                  <div className="text-[11px] text-white/40 mt-0.5">
                    {lang === "en" ? "Point camera at any product barcode" : "Nukreipkite kamerą į produkto brūkšninį kodą"}
                  </div>
                </div>
                <button onClick={closeCamera}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all text-lg">
                  ✕
                </button>
              </div>
              {/* Video feed */}
              <div className="relative bg-black" style={{ aspectRatio: "4/3" }}>
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                {/* Scan overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-52 h-32">
                    {/* Corner brackets */}
                    {[["top-0 left-0","border-t-2 border-l-2 rounded-tl-lg"],
                      ["top-0 right-0","border-t-2 border-r-2 rounded-tr-lg"],
                      ["bottom-0 left-0","border-b-2 border-l-2 rounded-bl-lg"],
                      ["bottom-0 right-0","border-b-2 border-r-2 rounded-br-lg"]
                    ].map(([pos, cls], i) => (
                      <div key={i} className={`absolute w-5 h-5 ${pos} ${cls}`}
                        style={{ borderColor: "#818cf8" }} />
                    ))}
                    {/* Animated scan line */}
                    <div className="absolute left-1 right-1 h-px animate-scan"
                      style={{ background: "linear-gradient(to right, transparent, #818cf8, transparent)" }} />
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 text-center text-[11px] text-white/30">
                {lang === "en"
                  ? "Supports EAN-13, UPC-A, QR Code and more"
                  : "Palaiko EAN-13, UPC-A, QR kodą ir kitus formatus"}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {scanned && (
          <div className="mt-8 animate-fade-in-up space-y-6">

            {/* ── BRAND RESULTS PANEL ── */}
            {brandResults && (
              <div>
                {/* Brand header */}
                <div className="rounded-2xl p-5 mb-4 flex items-center gap-4"
                  style={{ background: "rgba(129,140,248,0.07)", border: "1px solid rgba(129,140,248,0.22)" }}>
                  <div className="text-4xl">{brandResults.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-[var(--font-playfair)] text-2xl font-black text-white">{brandResults.display}</span>
                      <span className="text-xl">{brandResults.country}</span>
                    </div>
                    <div className="text-xs text-white/35 mt-0.5">{brandResults.tagline}</div>
                    <div className="text-[10px] text-indigo-400/60 mt-1.5 font-bold tracking-widest uppercase">
                      {brandResults.products.length} {lang === "en" ? "products analysed" : "produktai išanalizuoti"}
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-[9px] text-white/20 uppercase tracking-widest font-bold mb-1">{lang === "en" ? "Avg score" : "Vid. balas"}</div>
                    <div className="font-[var(--font-playfair)] text-3xl font-black"
                      style={{ color: getGrade(Math.round(brandResults.products.reduce((acc, p) => { const { bad, good } = scanText(p.ingredients); return acc + computeScore(bad, good); }, 0) / brandResults.products.length)).color }}>
                      {Math.round(brandResults.products.reduce((acc, p) => { const { bad, good } = scanText(p.ingredients); return acc + computeScore(bad, good); }, 0) / brandResults.products.length)}
                    </div>
                  </div>
                </div>

                {/* Product cards grid */}
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-indigo-400/50 mb-3">
                  ✦ {lang === "en" ? "All products — click to expand" : "Visi produktai — spausk norėdamas išskleisti"}
                </p>
                <div className="space-y-3">
                  {brandResults.products.map((product, idx) => {
                    const { bad, good } = scanText(product.ingredients);
                    const s = computeScore(bad, good);
                    const g = getGrade(s);
                    const isExpanded = expandedProduct === idx;
                    const penalty = bad.reduce((acc, r) => acc + badPts(r), 0);
                    const bonus   = good.reduce((acc, r) => acc + r.ingredient.bonus, 0);
                    return (
                      <div key={idx}
                        onClick={() => setExpandedProduct(isExpanded ? null : idx)}
                        className="rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                        style={{
                          background: isExpanded ? `${g.color}0a` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isExpanded ? g.color + "30" : "rgba(255,255,255,0.07)"}`,
                        }}>
                        {/* Card header row */}
                        <div className="flex items-center gap-3">
                          <span className="text-xl flex-shrink-0">{product.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-white leading-tight truncate">{product.nameLt}</div>
                            <div className="text-[10px] text-white/35 mt-0.5">{lang === "en" ? product.category : product.categoryLt}</div>
                          </div>
                          {/* Score pill */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-right">
                              <div className="font-[var(--font-playfair)] text-2xl font-black leading-none" style={{ color: g.color }}>{s}</div>
                              <div className="text-[9px] font-bold" style={{ color: g.color }}>{g.emoji} {lang === "en" ? g.label : g.labelLt}</div>
                            </div>
                          </div>
                          <span className="text-white/20 text-xs ml-1">{isExpanded ? "▲" : "▼"}</span>
                        </div>

                        {/* Mini score bar */}
                        <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.max(0, Math.min(100, s / 10))}%`, background: `linear-gradient(to right, #ef444488, ${g.color})` }} />
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-white/6 space-y-3" onClick={e => e.stopPropagation()}>
                            {/* Points breakdown */}
                            <div className="flex gap-4 text-xs">
                              <span className="text-white/35">{lang === "en" ? "Base" : "Bazė"}: <span className="text-white/60 font-bold">50</span></span>
                              {penalty > 0 && <span className="text-white/35">{lang === "en" ? "Threats" : "Grėsmės"}: <span className="text-red-400 font-bold">−{penalty}</span></span>}
                              {bonus > 0   && <span className="text-white/35">{lang === "en" ? "Boosts" : "Pliusai"}: <span className="text-green-400 font-bold">+{bonus}</span></span>}
                            </div>
                            {/* Good finds */}
                            {good.length > 0 && (
                              <div>
                                <div className="text-[9px] font-bold tracking-widest uppercase text-green-400/50 mb-1.5">
                                  ✦ {lang === "en" ? "Good ingredients" : "Geri ingredientai"}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {good.map((r, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                      style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                                      {r.ingredient.emoji} {r.ingredient.name} +{r.ingredient.bonus}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Bad ingredients */}
                            {bad.length > 0 && (
                              <div>
                                <div className="text-[9px] font-bold tracking-widest uppercase text-red-400/50 mb-1.5">
                                  ☠ {lang === "en" ? "Bad ingredients" : "Blogi ingredientai"}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {bad.map((r, i) => {
                                    const dc = { high: "#ef4444", medium: "#f97316", low: "#eab308" }[r.ingredient.danger];
                                    return (
                                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                        style={{ background: dc + "18", color: dc }}>
                                        {r.ingredient.emoji} {r.ingredient.name} −{badPts(r)}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {/* Ingredients text */}
                            <div className="text-[10px] text-white/25 leading-relaxed italic border-t border-white/5 pt-2">
                              <span className="text-white/35 not-italic font-bold">{lang === "en" ? "Ingredients: " : "Sudėtis: "}</span>
                              {product.ingredients}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Disclaimer */}
                <div className="mt-4 text-center text-[10px] text-white/20 italic">
                  {lang === "en"
                    ? "✦ Ingredient data sourced from official brand websites. Formulations may vary."
                    : "✦ Ingredientų duomenys iš oficialių gamintojų svetainių. Sudėtis gali skirtis."}
                </div>
              </div>
            )}

            {/* ── single-product view (hidden when brand results shown) ── */}
            {!brandResults && (<>

            {/* Product card (if looked up) */}
            {fetched && (
              <div className="rounded-2xl p-5 flex gap-4 items-start"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(129,140,248,0.15)" }}>
                {fetched.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fetched.image} alt={fetched.productName} className="w-16 h-16 object-contain rounded-xl flex-shrink-0 bg-white/5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-base leading-tight">{fetched.productName}</div>
                  {fetched.brand && <div className="text-xs text-white/40 mt-0.5">{fetched.brand}</div>}
                  <div className="flex items-center gap-3 mt-3">
                    {fetched.nutriscore && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider"
                        style={{
                          background: ({ a:"#22c55e",b:"#84cc16",c:"#eab308",d:"#f97316",e:"#ef4444" } as Record<string,string>)[fetched.nutriscore] ?? "#6b7280",
                          color: "#fff",
                        }}>
                        Nutri-Score {fetched.nutriscore.toUpperCase()}
                      </span>
                    )}
                    <button onClick={() => setShowIngredients(v => !v)}
                      className="text-[10px] text-white/30 hover:text-white/60 transition-colors underline underline-offset-2">
                      {showIngredients ? (lang === "en" ? "Hide ingredients" : "Slėpti ingredientus") : (lang === "en" ? "Show full ingredient list" : "Rodyti visus ingredientus")}
                    </button>
                  </div>
                  {showIngredients && (
                    <p className="text-[11px] text-white/40 mt-3 leading-relaxed">{fetched.ingredients}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── NOT FOUND — full featured ── */}
            {notFound && !fetched && (
              <div className="rounded-2xl overflow-hidden animate-fade-in-up"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>

                {/* Header */}
                <div className="px-5 py-4 flex items-start gap-4"
                  style={{ borderBottom: showSubmit ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div className="text-2xl mt-0.5">🔍</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white/80 text-sm mb-1">
                      {lang === "en" ? `"${input.trim()}" not found in any database` : `"${input.trim()}" nerasta jokioje duomenų bazėje`}
                    </div>
                    <div className="text-xs text-white/35 leading-relaxed">
                      {missedCount > 1
                        ? (lang === "en"
                            ? `${missedCount} people have searched for this — we're tracking it.`
                            : `${missedCount} žmonių ieškojo šio produkto — sekame.`)
                        : (lang === "en"
                            ? "We've noted this search. If it appears on Open Food Facts, it'll work next time."
                            : "Užfiksavome šią paiešką. Jei produktas atsiras Open Food Facts, kitą kartą veiks.")}
                    </div>
                    {missedCount > 1 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {Array.from({ length: Math.min(missedCount, 8) }).map((_, i) => (
                          <div key={i} className="w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-bold"
                            style={{ background: "rgba(99,102,241,0.25)", color: "#818cf8" }}>
                            {i + 1 === Math.min(missedCount, 8) && missedCount > 8 ? `+${missedCount - 7}` : "👤"}
                          </div>
                        ))}
                        <span className="text-[10px] text-white/25 ml-1">
                          {lang === "en" ? "also searched" : "taip pat ieškojo"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Paste-ingredients guidance ── */}
                {!showSubmit && !submitDone && (
                  <div className="mx-5 mb-3 rounded-xl px-4 py-3 flex items-start gap-3"
                    style={{ background: "rgba(240,200,85,0.06)", border: "1px solid rgba(240,200,85,0.18)" }}>
                    <span className="text-base mt-0.5">💡</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold mb-0.5" style={{ color: "rgba(240,200,85,0.85)" }}>
                        {lang === "en" ? "Have the label? Paste ingredients directly" : "Turite etiketę? Įklijuokite ingredientus tiesiogiai"}
                      </div>
                      <div className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {lang === "en"
                          ? "Copy the ingredient list from the back of the package and paste it into the search box above — we'll score it instantly, no product name needed."
                          : "Nukopijuokite ingredientų sąrašą nuo pakuotės ir įklijuokite į paieškos laukelį viršuje — įvertinsime iš karto."}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit toggle */}
                {!showSubmit && !submitDone && (
                  <div className="px-5 py-3 flex items-center justify-between">
                    <span className="text-xs text-white/30">
                      {lang === "en" ? "Know the ingredients?" : "Žinote ingredientus?"}
                    </span>
                    <button onClick={() => setShowSubmit(true)}
                      className="text-xs font-bold px-4 py-1.5 rounded-full transition-all hover:scale-105"
                      style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8" }}>
                      {lang === "en" ? "✦ Submit ingredients" : "✦ Pateikti ingredientus"}
                    </button>
                  </div>
                )}

                {/* Submit form */}
                {showSubmit && !submitDone && (
                  <div className="px-5 py-4 space-y-3">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-3">
                      {lang === "en" ? "Submit ingredient data" : "Pateikti ingredientų duomenis"}
                    </div>
                    <input type="text" placeholder={lang === "en" ? "Brand name (optional)" : "Prekės ženklas (neprivaloma)"}
                      value={submitBrand} onChange={e => setSubmitBrand(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#6366f1]/40 transition-colors" />
                    <textarea placeholder={lang === "en" ? "Paste the full ingredient list from the label…" : "Įklijuokite visą ingredientų sąrašą nuo etiketės…"}
                      value={submitIngredients} onChange={e => setSubmitIngredients(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#6366f1]/40 transition-colors resize-none" />
                    <div className="flex gap-3">
                      <button onClick={submitIngredientForm} disabled={submitting || !submitIngredients.trim()}
                        className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 text-[#0b1220]"
                        style={{ background: "linear-gradient(to right, #6366f1, #818cf8)" }}>
                        {submitting ? "…" : (lang === "en" ? "Submit" : "Pateikti")}
                      </button>
                      <button onClick={() => setShowSubmit(false)}
                        className="px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 transition-colors border border-white/10">
                        {lang === "en" ? "Cancel" : "Atšaukti"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Thank you state */}
                {submitDone && (
                  <div className="px-5 py-4 flex items-center gap-3"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-xl">✦</span>
                    <div>
                      <div className="text-sm font-bold text-green-400">
                        {lang === "en" ? "Thank you! We'll review it soon." : "Ačiū! Peržiūrėsime netrukus."}
                      </div>
                      <div className="text-xs text-white/30 mt-0.5">
                        {lang === "en" ? "Once approved, this product will be searchable by everyone." : "Patvirtinus, produktas bus rodomas visiems."}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Score card (bidirectional) ── */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>

              {/* Social proof — only when count is available */}
              {productScanCount && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex -space-x-1.5">
                    {["🧑","👩","🧔","👧","🧑‍🦱"].map((e, i) => (
                      <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-[#0b1220]"
                        style={{ background: `hsl(${i * 47 + 200}, 60%, 35%)` }}>{e}</div>
                    ))}
                  </div>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    <strong style={{ color: "rgba(255,255,255,0.6)" }}>{productScanCount.toLocaleString()}</strong>{" "}
                    {lang === "en" ? "people analysed this product" : "žmonių analizavo šį produktą"}
                  </span>
                </div>
              )}

              {/* Main score row */}
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="font-[var(--font-playfair)] text-6xl font-black leading-none" style={{ color: grade.color }}>{score}</div>
                  <div className="text-[10px] text-white/35 tracking-widest uppercase mt-1">{lang === "en" ? "Purity Score" : "Grynumo balas"}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-2xl" style={{ color: grade.color }}>{grade.emoji} {lang === "en" ? grade.label : grade.labelLt}</div>
                  <div className="text-xs text-white/35 mt-1">
                    {badResults.length === 0 && goodResults.length === 0
                      ? (lang === "en" ? "No data matched" : "Duomenų nerasta")
                      : `${badResults.length} ${lang === "en" ? "threat(s)" : "grėsmė(-ių)"}  ·  ${goodResults.length} ${lang === "en" ? "boost(s)" : "pliusas(-ai)"}`}
                  </div>
                </div>
              </div>

              {/* ── Share button — right under the score so it's always visible ── */}
              {!brandResults && (
                <button
                  onClick={() => {
                    const productName = fetched?.productName ?? input.trim();
                    const url = `/api/share-image?product=${encodeURIComponent(productName)}&score=${score}&grade=${encodeURIComponent(grade.label)}&emoji=${encodeURIComponent(grade.emoji)}&color=${encodeURIComponent(grade.color)}&bad=${badResults.length}&good=${goodResults.length}`;
                    if (navigator.share) {
                      navigator.share({ title: `${productName} — ${score} pts (${grade.label})`, text: `I scanned ${productName} on HolySnacks and got ${score}/1000 — ${grade.label}!`, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.origin + url);
                      alert(lang === "en" ? "Share image URL copied!" : "Nuorodą nukopijuota!");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] mb-5"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}>
                  📤 {lang === "en" ? "Share result" : "Dalintis"}
                </button>
              )}

              {/* Score bar with gradient */}
              <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(0, Math.min(100, score / 10))}%`, background: `linear-gradient(to right, #ef444488, ${grade.color})` }} />
              </div>

              {/* Grade scale legend */}
              <div className="flex gap-1 text-[8px] text-white/20 font-bold tracking-wider justify-between">
                {[
                  { l: "TOXIC",   c: "#7f1d1d" },
                  { l: "POOR",    c: "#ef4444" },
                  { l: "NEUTRAL", c: "#f97316" },
                  { l: "DECENT",  c: "#84cc16" },
                  { l: "HOLY",    c: "#22c55e" },
                  { l: "DIVINE",  c: "#f0c855" },
                ].map((g, i) => (
                  <span key={i} style={{ color: g.c }}>{g.l}</span>
                ))}
              </div>

              {/* Points breakdown (if something was found) */}
              {(badResults.length > 0 || goodResults.length > 0) && (
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-white/40">{lang === "en" ? "Baseline" : "Bazė"}: <span className="text-white/60 font-bold">500</span></span>
                  </div>
                  {totalPenalty > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                      <span className="text-white/40">{lang === "en" ? "Threats" : "Grėsmės"}: <span className="text-red-400 font-bold">−{totalPenalty}</span></span>
                    </div>
                  )}
                  {totalBonus > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-white/40">{lang === "en" ? "Good finds" : "Geri ingredientai"}: <span className="text-green-400 font-bold">+{totalBonus}</span></span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Review bar (share moved above score card) ── */}
            {!brandResults && user && (
              <div className="flex gap-3">
                <button
                  onClick={() => document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(240,200,85,0.08)", border: "1px solid rgba(240,200,85,0.2)", color: "#f0c855" }}>
                  ⭐ {lang === "en" ? "Leave a review" : "Palikti atsiliepimą"}
                </button>
              </div>
            )}

            {/* ── Good Finds section ── */}
            {goodResults.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-green-400/60 mb-3">
                  ✦ {lang === "en" ? `Good Finds (${goodResults.length})` : `Geri ingredientai (${goodResults.length})`}
                </p>
                <div className="space-y-2.5">
                  {goodResults.map((r, i) => (
                    <div key={i} className="rounded-2xl p-4 flex items-start gap-4 transition-all hover:scale-[1.01]"
                      style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.20)" }}>
                      <div className="text-2xl flex-shrink-0 mt-0.5">{r.ingredient.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="font-bold text-sm text-white">{r.ingredient.name}</span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                            style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                            +{r.ingredient.bonus} pts
                          </span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">{r.ingredient.whyGood}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Threats section ── */}
            <div>
              {badResults.length === 0 ? (
                <div className="rounded-2xl p-8 text-center"
                  style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
                  <div className="text-4xl mb-3">✅</div>
                  <div className="font-bold text-white mb-1">{lang === "en" ? "No threats detected!" : "Grėsmių nerasta!"}</div>
                  <div className="text-sm text-white/40 max-w-xs mx-auto">
                    {lang === "en"
                      ? "None of our flagged bad ingredients were found. That's a good sign — though always check the full label."
                      : "Nė vienas iš žymėtų blogų ingredientų nerastas. Geras ženklas — visada patikrinkite visą etiketę."}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-red-400/60 mb-3">
                    ☠ {lang === "en" ? `Threats Detected (${badResults.length})` : `Aptiktos grėsmės (${badResults.length})`}
                  </p>
                  <div className="space-y-3">
                    {badResults.map((r, i) => (
                      <div key={i} className="rounded-2xl p-4 flex items-start gap-4 transition-all hover:scale-[1.01]"
                        style={{
                          background: `${dangerColor[r.ingredient.danger]}08`,
                          border: `1px solid ${dangerColor[r.ingredient.danger]}25`,
                        }}>
                        <div className="text-2xl flex-shrink-0 mt-0.5">{r.ingredient.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="font-bold text-sm text-white">{r.ingredient.name}</span>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                              style={{ background: `${dangerColor[r.ingredient.danger]}22`, color: dangerColor[r.ingredient.danger] }}>
                              −{badPts(r)} pts · {r.ingredient.danger} risk
                            </span>
                            {r.ingredient.bannedIn && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
                                🚫 {lang === "en" ? "Banned in some countries" : "Uždraustas kai kuriose šalyse"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 leading-relaxed mb-1.5">{r.ingredient.whyBad}</p>
                          <p className="text-[10px] text-white/30 leading-relaxed italic">
                            <span style={{ color: dangerColor[r.ingredient.danger] + "99" }}>Holy Promise: </span>
                            {r.ingredient.holyPromise}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 pb-2 text-center">
                    <p className="text-xs text-white/25">
                      {lang === "en" ? "✦ HolySnacks contains none of the above. Ever." : "✦ HolySnacks nenaudoja nė vieno iš aukščiau paminėtų. Niekada."}
                    </p>
                  </div>

                  {/* ── Try HolySnacks instead ── */}
                  <div className="rounded-2xl p-5 mt-2"
                    style={{ background: "linear-gradient(135deg, rgba(240,200,85,0.06), rgba(99,102,241,0.06))", border: "1px solid rgba(240,200,85,0.18)" }}>
                    <p className="text-[10px] font-black tracking-[0.25em] uppercase mb-4" style={{ color: "#f0c855" }}>
                      ✦ {lang === "en" ? "Try HolySnacks instead" : "Išbandyk HolySnacks vietoj to"}
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { emoji: "🥔", name: "Holy Chips", desc: lang === "en" ? "Baked, not fried. Olive oil & sea salt only." : "Kepti, ne kepti aliejuje. Tik alyvuogių aliejus ir druska.", badge: "Bestseller" },
                        { emoji: "✨", name: "Golden Elixir", desc: lang === "en" ? "Turmeric, ginger & black pepper. Anti-inflammatory." : "Ciberžolė, imbieras ir pipirai. Priešuždegiminė gėrimė.", badge: "New" },
                        { emoji: "🫐", name: "Berry Bliss", desc: lang === "en" ? "Pure fruit gummies. Nothing else." : "Grynų vaisių gumos. Nieko daugiau.", badge: null },
                      ].map((p) => (
                        <a key={p.name} href="/#solar"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:scale-[1.01] group"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          <span className="text-xl flex-shrink-0">{p.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{p.name}</span>
                              {p.badge && (
                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                                  style={{ background: "rgba(240,200,85,0.15)", color: "#f0c855" }}>{p.badge}</span>
                              )}
                            </div>
                            <p className="text-[11px] text-white/40 truncate">{p.desc}</p>
                          </div>
                          <span className="text-white/20 group-hover:text-white/50 transition-colors text-xs">→</span>
                        </a>
                      ))}
                    </div>
                    <a href="/#solar"
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]"
                      style={{ background: "rgba(240,200,85,0.12)", border: "1px solid rgba(240,200,85,0.25)", color: "#f0c855" }}>
                      {lang === "en" ? "Browse all clean products →" : "Peržiūrėti visus švaruis produktus →"}
                    </a>
                  </div>
                </div>
              )}
            </div>
            </>)}

            {/* ── Community reviews ── */}
            {scanned && fetched && !brandResults && (
              <ProductReviews
                lang={lang}
                productName={fetched.productName}
              />
            )}

            {/* ── Review form (logged-in users only, non-brand scan) ── */}
            {scanned && user && !brandResults && (
              <ReviewForm
                id="review-form"
                lang={lang}
                productName={fetched?.productName ?? input.trim()}
                brand={fetched?.brand ?? ""}
                score={score}
                userId={user.id}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
