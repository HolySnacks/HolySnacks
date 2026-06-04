"use client";

import { CartItem } from "@/lib/types";

export function CartDrawer({ items, lang, onClose, onUpdateQty, onRemove }: {
  items: CartItem[];
  lang: "en" | "lt";
  onClose: () => void;
  onUpdateQty: (name: string, delta: number) => void;
  onRemove: (name: string) => void;
}) {
  const total = items.reduce((sum, item) => {
    return sum + parseFloat(item.product.price.replace("€", "")) * item.quantity;
  }, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[58] bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-[60] flex flex-col"
        style={{ background: "#0d1525", borderLeft: "1px solid rgba(240,200,85,0.12)", boxShadow: "-8px 0 40px rgba(0,0,0,0.5)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0c855]/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🛒</span>
            <span className="font-[var(--font-playfair)] text-lg font-bold text-white">
              {lang === "en" ? "Your Cart" : "Krepšelis"}
            </span>
            {totalQty > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-black text-[#0b1220]"
                style={{ background: "#f0c855" }}>
                {totalQty}
              </span>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all text-xl leading-none">
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-12">
              <span className="text-6xl opacity-20 select-none">🛒</span>
              <p className="text-white/30 text-sm">{lang === "en" ? "Your cart is empty" : "Krepšelis tuščias"}</p>
              <button onClick={onClose}
                className="text-xs font-bold px-5 py-2.5 rounded-full border border-[#f0c855]/20 text-[#f0c855]/50 hover:text-[#f0c855] hover:border-[#f0c855]/40 transition-all">
                {lang === "en" ? "← Continue shopping" : "← Tęsti pirkimą"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const price = parseFloat(item.product.price.replace("€", ""));
                return (
                  <div key={item.product.name} className="flex gap-3 p-3 rounded-2xl group"
                    style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${item.cat.accentColor}18` }}>

                    {/* Visual */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.product.gradient} flex items-center justify-center flex-shrink-0`}
                      style={{ boxShadow: `0 0 12px ${item.cat.glow}` }}>
                      <span className="text-2xl select-none">{item.product.emoji}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">{item.product.name}</h4>
                          <p className="text-[10px] mt-0.5" style={{ color: item.cat.accentColor }}>{item.product.flavor}</p>
                        </div>
                        <button onClick={() => onRemove(item.product.name)}
                          className="text-white/15 hover:text-red-400 transition-colors text-base leading-none flex-shrink-0 mt-0.5">
                          ×
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2.5">
                        {/* Qty controls */}
                        <div className="flex items-center gap-2">
                          <button onClick={() => onUpdateQty(item.product.name, -1)}
                            className="w-6 h-6 rounded-full text-sm font-bold flex items-center justify-center transition-all hover:opacity-80"
                            style={{ background: "rgba(255,255,255,0.08)", color: "white" }}>
                            −
                          </button>
                          <span className="text-sm font-bold text-white w-4 text-center tabular-nums">{item.quantity}</span>
                          <button onClick={() => onUpdateQty(item.product.name, 1)}
                            className="w-6 h-6 rounded-full text-sm font-bold flex items-center justify-center transition-all hover:opacity-80"
                            style={{ background: item.cat.accentColor, color: "#0b1220" }}>
                            +
                          </button>
                        </div>
                        <span className="text-sm font-bold tabular-nums" style={{ color: item.cat.accentColor }}>
                          €{(price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-[#f0c855]/10 flex-shrink-0">
            <div className="flex items-center justify-between mb-5">
              <span className="text-white/40 text-sm">{lang === "en" ? "Order total" : "Viso"}</span>
              <span className="font-[var(--font-playfair)] text-3xl font-black" style={{ color: "#f0c855" }}>
                €{total.toFixed(2)}
              </span>
            </div>
            <button
              className="w-full py-4 rounded-full font-bold text-sm text-[#0b1220] transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(to right, #d4a830, #fad55c)", boxShadow: "0 4px 20px rgba(240,200,85,0.28)" }}>
              ✦ {lang === "en" ? "Proceed to Checkout" : "Pereiti prie užsakymo"}
            </button>
            <p className="text-center text-[10px] text-white/18 mt-3">
              {lang === "en" ? "🔒 Secure checkout · Free shipping over €50" : "🔒 Saugus mokėjimas · Nemokamas pristatymas nuo €50"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
