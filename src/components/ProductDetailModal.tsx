"use client";

import { useState, useEffect } from "react";
import { Category, Product } from "@/lib/types";
import { DETAIL_INGREDIENTS, DETAIL_CERTS } from "@/lib/products";
import { ReviewForm } from "./ReviewForm";
import { ProductReviews } from "./ProductReviews";
import type { User } from "@supabase/supabase-js";
import { HolyLogo } from "./HolyLogo";

const DETAIL_NUTRITION: Record<string, Array<{ label: string; value: string }>> = {
  gummies:   [{ label: "Serving", value: "30 g (≈5 pcs)" }, { label: "Calories", value: "95 kcal" }, { label: "Total Sugar", value: "14 g" }, { label: "Added Sugar", value: "0 g" }, { label: "Protein", value: "2 g" }, { label: "Fat", value: "0 g" }],
  chocolate: [{ label: "Serving", value: "30 g (3 squares)" }, { label: "Calories", value: "165 kcal" }, { label: "Total Sugar", value: "8 g" }, { label: "Added Sugar", value: "5 g" }, { label: "Protein", value: "3 g" }, { label: "Fat", value: "13 g" }],
  drinks:    [{ label: "Serving", value: "330 ml" }, { label: "Calories", value: "12 kcal" }, { label: "Total Sugar", value: "0 g" }, { label: "Electrolytes", value: "380 mg" }, { label: "Vitamin C", value: "80 mg" }, { label: "Fat", value: "0 g" }],
  snacks:    [{ label: "Serving", value: "28 g (≈12 pcs)" }, { label: "Calories", value: "130 kcal" }, { label: "Total Sugar", value: "0 g" }, { label: "Sodium", value: "120 mg" }, { label: "Protein", value: "2 g" }, { label: "Fat", value: "7 g" }],
  gums:      [{ label: "Serving", value: "2 pieces (5 g)" }, { label: "Calories", value: "6 kcal" }, { label: "Xylitol", value: "1.8 g" }, { label: "Nano-HA", value: "200 mg" }, { label: "Sugars", value: "0 g" }, { label: "Fat", value: "0 g" }],
};

export function ProductDetailModal({ product, cat, lang, onBack, onAddToCart }: {
  product: Product;
  cat: Category;
  lang: "en" | "lt";
  onBack: () => void;
  onAddToCart: (p: Product, c: Category) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 40); }, []);
  const isComingSoon = product.badge === "Coming Soon";

  function handleAdd() {
    onAddToCart(product, cat);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const ingredients = DETAIL_INGREDIENTS[cat.id] ?? DETAIL_INGREDIENTS.snacks;
  const nutrition   = DETAIL_NUTRITION[cat.id]   ?? DETAIL_NUTRITION.snacks;

  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto"
      style={{ background: `radial-gradient(ellipse at 30% 10%, ${cat.bgFrom} 0%, #080e1c 65%)` }}>

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b"
        style={{ borderColor: `${cat.accentColor}15`, background: "rgba(8,14,28,0.75)" }}>
        <button onClick={onBack} className="text-sm font-semibold transition-colors hover:text-white"
          style={{ color: cat.accentColor }}>
          ← {lang === "en" ? "Back" : "Atgal"}
        </button>
        <span className="text-xs text-white/30 tracking-widest uppercase">{lang === "en" ? "Product Details" : "Produkto detalės"}</span>
        <HolyLogo size="sm" />
      </div>

      {/* Content */}
      <div className={`max-w-4xl mx-auto px-6 py-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left — visual + certs */}
          <div className="flex flex-col items-center">
            <div className={`w-full max-w-xs aspect-square rounded-3xl bg-gradient-to-br ${product.gradient} flex items-center justify-center mb-6 relative overflow-hidden`}
              style={{
                boxShadow: `0 0 80px 20px ${cat.glow}, inset 0 0 40px rgba(255,255,255,0.12)`,
                border: "2px solid rgba(255,255,255,0.18)",
              }}>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_28%_25%,white,transparent_55%)]" />
              <span className="text-[7rem] drop-shadow-2xl relative z-10 select-none">{product.emoji}</span>
              {product.badge && (
                <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: isComingSoon ? "rgba(255,255,255,0.15)" : cat.accentColor, color: isComingSoon ? "rgba(255,255,255,0.7)" : "#0b1220" }}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Certifications */}
            <div className="flex flex-wrap gap-2 justify-center">
              {DETAIL_CERTS.map((cert, i) => (
                <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.45)" }}>
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Right — info */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: cat.accentColor }}>
              {cat.icon} {lang === "lt" ? cat.labelLt : cat.label} Planet
            </p>
            <h1 className="font-[var(--font-playfair)] text-3xl md:text-4xl font-black text-white mb-1">{product.name}</h1>
            <p className="text-base mb-5" style={{ color: cat.accentColor }}>{product.flavor}</p>
            <p className="text-white/55 leading-relaxed mb-8 text-sm">
              {product.desc} {lang === "en"
                ? " Every batch is crafted from certified organic sources and tested for purity before it leaves our facility."
                : " Kiekviena partija gaminama iš sertifikuotų ekologiškų žaliavų ir tikrinama prieš išleidimą."}
            </p>

            {/* Price + CTA */}
            <div className="flex items-center gap-4 mb-10">
              <span className="font-[var(--font-playfair)] text-4xl font-black" style={{ color: cat.accentColor }}>
                {product.price}
              </span>
              <button
                disabled={isComingSoon}
                onClick={handleAdd}
                className="flex-1 py-4 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                style={{ background: isComingSoon ? "rgba(255,255,255,0.08)" : (added ? "#22c55e" : cat.accentColor), color: isComingSoon ? "white" : "#0b1220" }}>
                {isComingSoon
                  ? (lang === "en" ? "Coming Soon" : "Netrukus")
                  : added
                    ? (lang === "en" ? "✓ Added to Cart!" : "✓ Pridėta!")
                    : (lang === "en" ? "✦ Add to Cart" : "✦ Į krepšelį")}
              </button>
            </div>

            {/* Ingredients */}
            <div className="mb-7">
              <h3 className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: cat.accentColor }}>
                🌿 {lang === "en" ? "Ingredients" : "Sudėtis"}
              </h3>
              <p className="text-sm text-white/48 leading-relaxed px-4 py-3.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${cat.accentColor}12` }}>
                {ingredients}
              </p>
            </div>

            {/* Nutrition */}
            <div>
              <h3 className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color: cat.accentColor }}>
                📊 {lang === "en" ? "Nutrition Facts" : "Maistinė vertė"}
              </h3>
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: `${cat.accentColor}12` }}>
                {nutrition.map((row, i) => (
                  <div key={i} className="flex justify-between px-4 py-2.5 text-sm"
                    style={{
                      background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                      borderBottom: i < nutrition.length - 1 ? `1px solid ${cat.accentColor}08` : "none",
                    }}>
                    <span className="text-white/38">{row.label}</span>
                    <span className="font-bold text-white/65">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
