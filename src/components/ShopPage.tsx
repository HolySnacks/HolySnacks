"use client";

import { useState, useEffect } from "react";
import { Category, Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/products";
import { HolyLogo } from "./HolyLogo";

export function ShopPage({ lang, onBack, onOpenCat, onAddToCart, onOpenDetail }: {
  lang: "en" | "lt"; onBack: () => void; onOpenCat: (cat: Category) => void;
  onAddToCart: (p: Product, c: Category) => void;
  onOpenDetail: (p: Product, c: Category) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const allProducts = CATEGORIES.flatMap(cat =>
    cat.products.map(p => ({ ...p, cat }))
  );

  const filtered = activeFilter === "all"
    ? allProducts
    : allProducts.filter(p => p.cat.id === activeFilter);

  const filters = [
    { id: "all", label: lang === "en" ? "All Products" : "Visi produktai", icon: "✦" },
    ...CATEGORIES.map(c => ({ id: c.id, label: lang === "lt" ? c.labelLt : c.label, icon: c.icon })),
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080e1c]">

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-[#f0c855]/10"
        style={{ background: "rgba(8,14,28,0.85)" }}>
        <button onClick={onBack} className="text-sm font-semibold text-[#f0c855]/70 hover:text-[#f0c855] transition-colors">
          {lang === "en" ? "← Back" : "← Atgal"}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[#f0c855] text-lg">✦</span>
          <span className="font-[var(--font-playfair)] text-xl font-bold text-white">
            {lang === "en" ? "Holy Shop" : "Šventoji Parduotuvė"}
          </span>
          <span className="text-[#f0c855] text-lg">✦</span>
        </div>
        <HolyLogo size="sm" />
      </div>

      {/* Hero banner */}
      <div className={`relative py-14 px-6 text-center overflow-hidden transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(240,200,85,0.10) 0%, transparent 60%)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24"
          style={{ background: "linear-gradient(to bottom, rgba(240,200,85,0.3), transparent)" }} />
        <p className="text-[#f0c855]/60 text-xs tracking-widest uppercase mb-3">✦ ✦ ✦</p>
        <h1 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-black text-white mb-3">
          {lang === "en" ? "The Holy Universe" : "Šventoji visata"}
        </h1>
        <p className="text-white/50 max-w-lg mx-auto">
          {lang === "en"
            ? "All products from all planets — naturally crafted, divinely delicious."
            : "Visi produktai iš visų planetų — natūraliai sukurti, dieviškai skanūs."}
        </p>

        {/* Planet quick links */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => onOpenCat(cat)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
              style={{ background: `${cat.glow}`, border: `1px solid ${cat.accentColor}50`, color: cat.accentColor }}>
              {cat.icon} {lang === "lt" ? cat.labelLt : cat.label} →
            </button>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="sticky top-[65px] z-10 flex overflow-x-auto gap-2 px-6 py-4 border-b border-white/5"
        style={{ background: "rgba(8,14,28,0.95)", scrollbarWidth: "none" }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all"
            style={activeFilter === f.id ? {
              background: "linear-gradient(to right, #d4a830, #fad55c)",
              color: "#080e1c",
              boxShadow: "0 0 16px rgba(240,200,85,0.3)",
            } : {
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="max-w-6xl mx-auto px-6 py-10 pb-24">
        <p className="text-white/30 text-sm mb-6">
          {filtered.length} {lang === "en" ? "products" : "produktai"}
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((p, i) => {
            const isComingSoon = p.badge === "Coming Soon";
            return (
              <div key={`${p.cat.id}-${i}`}
                onClick={() => !isComingSoon && onOpenDetail(p, p.cat)}
                className={`rounded-2xl overflow-hidden flex flex-col ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${isComingSoon ? "opacity-50" : "hover:-translate-y-1 cursor-pointer"}`}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${p.cat.accentColor}20`,
                  transition: `opacity 0.5s ${i * 0.05}s, transform 0.5s ${i * 0.05}s`,
                }}>

                {/* Product visual */}
                <div className={`h-44 bg-gradient-to-br ${p.gradient} relative flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)]" />
                  <span className="text-6xl relative z-10 drop-shadow-lg">{p.emoji}</span>
                  {/* Category badge */}
                  <button onClick={(e) => { e.stopPropagation(); onOpenCat(p.cat); }}
                    className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all hover:scale-105"
                    style={{ background: `${p.cat.glow}`, border: `1px solid ${p.cat.accentColor}50`, color: p.cat.accentColor }}>
                    {p.cat.icon} {lang === "lt" ? p.cat.labelLt : p.cat.label}
                  </button>
                  {p.badge && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{
                        background: isComingSoon ? "rgba(255,255,255,0.12)" : p.cat.accentColor,
                        color: isComingSoon ? "rgba(255,255,255,0.6)" : "#080e1c",
                      }}>
                      {isComingSoon ? (lang === "lt" ? "Netrukus" : "Soon") : p.badge}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-[var(--font-playfair)] font-bold text-base text-white mb-0.5">{p.name}</h3>
                  <p className="text-xs mb-2" style={{ color: p.cat.accentColor }}>{p.flavor}</p>
                  <p className="text-xs text-white/45 leading-relaxed flex-1">{p.desc}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold" style={{ color: p.cat.accentColor }}>{p.price}</span>
                    <button
                      disabled={isComingSoon}
                      onClick={(e) => { e.stopPropagation(); if (!isComingSoon) onAddToCart(p, p.cat); }}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80 disabled:opacity-40"
                      style={{ background: isComingSoon ? "rgba(255,255,255,0.08)" : p.cat.accentColor, color: isComingSoon ? "white" : "#080e1c" }}>
                      {isComingSoon ? (lang === "lt" ? "Netrukus" : "Soon") : (lang === "en" ? "Add to Cart" : "Į krepšelį")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
