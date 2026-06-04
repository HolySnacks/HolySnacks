"use client";

import { useState, useEffect } from "react";
import { Category, Product } from "@/lib/types";
import { T, Lang } from "@/lib/translations";
import { CATEGORIES } from "@/lib/products";
import { HolyLogo } from "./HolyLogo";

export function CategoryPage({ cat, lang, onBack, onAddToCart, onOpenDetail }: {
  cat: Category; lang: Lang; onBack: () => void;
  onAddToCart: (p: Product, c: Category) => void;
  onOpenDetail: (p: Product, c: Category) => void;
}) {
  const t = T[lang];
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: `radial-gradient(ellipse at 30% 20%, ${cat.bgFrom} 0%, #0b1220 70%)` }}>

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b"
        style={{ borderColor: `${cat.accentColor}20`, background: "rgba(11,18,32,0.6)" }}>
        <button onClick={onBack} className="text-sm font-semibold transition-colors hover:text-white"
          style={{ color: cat.accentColor }}>
          {t.back}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cat.icon}</span>
          <span className="font-[var(--font-playfair)] text-xl font-bold text-white">
            {lang === "lt" ? cat.labelLt : cat.label}
          </span>
        </div>
        <HolyLogo size="sm" />
      </div>

      {/* Hero banner */}
      <div className={`relative flex flex-col items-center justify-center py-10 px-6 text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        {/* Planet visual large */}
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-6`}
          style={{ boxShadow: `0 0 60px 20px ${cat.glow}, inset 0 0 30px rgba(255,255,255,0.2)`, border: "2px solid rgba(255,255,255,0.3)" }}>
          <span className="text-5xl">{cat.icon}</span>
        </div>
        <h1 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-black mb-3 text-white">
          {lang === "lt" ? cat.labelLt : cat.label} <span className="text-white/40">Planet</span>
        </h1>
        <p className="text-white/50 max-w-md">{lang === "en" ? "Discover our divine selection of" : "Atrask mūsų dievišką"} {lang === "lt" ? cat.labelLt.toLowerCase() : cat.label.toLowerCase()} {lang === "lt" ? "kolekciją" : "— made with only the purest natural ingredients."}
        </p>

        {/* ── Key Ingredients science panel (gums & any future science-forward category) ── */}
        {cat.keyIngredients && (
          <div className="mt-10 w-full max-w-2xl">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-4 opacity-60"
              style={{ color: cat.accentColor }}>
              ✦ {lang === "en" ? "Powered by Science" : "Mokslo galia"}
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {cat.keyIngredients.map((ki, i) => (
                <div key={i} className="rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${cat.accentColor}25`,
                    boxShadow: `0 0 20px ${cat.glow}18`,
                  }}>
                  <div className="text-3xl mb-3">{ki.emoji}</div>
                  <div className="font-bold text-sm text-white mb-2 leading-tight">{ki.name}</div>
                  <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{ki.benefit}</div>
                </div>
              ))}
            </div>
            {/* Teal divider line */}
            <div className="mt-8 h-px w-24 mx-auto rounded-full opacity-30"
              style={{ background: cat.accentColor }} />
          </div>
        )}
      </div>

      {/* Products grid */}
      <div className="max-w-5xl mx-auto px-6 pb-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cat.products.map((p, i) => {
          const isComingSoon = p.badge === "Coming Soon";
          return (
            <div key={i}
              onClick={() => !isComingSoon && onOpenDetail(p, cat)}
              className={`rounded-2xl overflow-hidden border flex flex-col ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${isComingSoon ? "opacity-60" : "hover:-translate-y-1 hover:shadow-xl cursor-pointer"}`}
              style={{
                borderColor: `${cat.accentColor}20`,
                background: "rgba(255,255,255,0.03)",
                boxShadow: isComingSoon ? "none" : `0 0 30px ${cat.glow}30`,
                transition: `opacity 0.5s ${i * 0.1 + 0.2}s, transform 0.5s ${i * 0.1 + 0.2}s, box-shadow 0.3s`,
              }}
            >
              {/* Product visual */}
              <div className={`h-44 bg-gradient-to-br ${p.gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)]" />
                <span className="text-6xl relative z-10 drop-shadow-lg">{p.emoji}</span>
                {p.badge && (
                  <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: isComingSoon ? "rgba(255,255,255,0.15)" : cat.accentColor,
                      color: isComingSoon ? "rgba(255,255,255,0.7)" : "#0b1220",
                    }}>
                    {isComingSoon ? (lang === "lt" ? "Netrukus" : "Coming Soon") : p.badge}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-[var(--font-playfair)] font-bold text-lg text-white mb-1">{p.name}</h3>
                <p className="text-xs mb-2" style={{ color: cat.accentColor }}>{p.flavor}</p>
                <p className="text-sm text-white/50 leading-relaxed flex-1">{p.desc}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold" style={{ color: cat.accentColor }}>{p.price}</span>
                  <button
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-80 disabled:opacity-40"
                    style={{ background: isComingSoon ? "rgba(255,255,255,0.1)" : cat.accentColor, color: isComingSoon ? "white" : "#0b1220" }}
                    disabled={isComingSoon}
                    onClick={(e) => { e.stopPropagation(); if (!isComingSoon) onAddToCart(p, cat); }}
                  >
                    {isComingSoon ? (lang === "lt" ? "Netrukus" : "Soon") : t.addToCart}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explore other planets footer strip */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <div className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${cat.accentColor}18` }}>
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase opacity-50 mb-1"
              style={{ color: cat.accentColor }}>✦ Explore the Universe</p>
            <p className="text-sm text-white/50">{lang === "en" ? "Discover all 6 clean-food planets" : "Atrask visas 6 švarios mitybos planetas"}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            {CATEGORIES.filter(c => c.id !== cat.id).slice(0, 5).map(c => (
              <button key={c.id}
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }}>
                <span>{c.icon}</span>
                <span className="hidden sm:inline">{lang === "lt" ? c.labelLt : c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
