"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient, getLevelInfo, computeXP, LEVELS, type Profile, type ScanRecord } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// ─── CATEGORY + PRODUCT DATA ──────────────────────────────────────────────────

type Product = {
  name: string;
  flavor: string;
  price: string;
  emoji: string;
  badge?: string;
  desc: string;
  gradient: string;
};

type KeyIngredient = {
  emoji: string;
  name: string;
  benefit: string;
};

type Category = {
  id: string;
  radius: number;
  duration: number;
  size: number;
  startAngle: number;
  icon: string;
  label: string;
  labelLt: string;
  gradient: string;
  glow: string;
  ring: string;
  bgFrom: string;
  accentColor: string;
  products: Product[];
  keyIngredients?: KeyIngredient[];
};

const CATEGORIES: Category[] = [
  {
    id: "gummies",
    radius: 105, duration: 9, size: 84, startAngle: 0,
    icon: "🍬", label: "Gummies", labelLt: "Guminukai",
    gradient: "from-pink-500 via-orange-400 to-yellow-400",
    glow: "rgba(251,146,60,0.45)",
    ring: "rgba(251,146,60,0.15)",
    bgFrom: "#1a0a10",
    accentColor: "#fb923c",
    keyIngredients: [
      {
        emoji: "🍎",
        name: "Apple Pectin",
        benefit: "Premium French confectionery standard. A natural plant-based gelling agent extracted from apple skins — creates a perfect chew without gelatin, corn syrup, or synthetic binders.",
      },
      {
        emoji: "🌾",
        name: "Tapioca Starch",
        benefit: "Adds body, bounce, and that satisfying chew. Naturally gluten-free, derived from cassava root. The secret to a gummy that holds its shape without artificial stiffeners.",
      },
      {
        emoji: "🌊",
        name: "Natural Agar",
        benefit: "A secondary texture stabiliser from red algae. Keeps gummies firm at room temperature, vegan-certified, and adds nothing synthetic to the formula.",
      },
    ],
    products: [
      { name: "KubiX Classic", flavor: "Strawberry Cubes", price: "€4.99", emoji: "🍓", badge: "Bestseller", desc: "Real strawberry juice in every cube. No corn syrup, no artificial colors.", gradient: "from-pink-600 to-red-500" },
      { name: "HolyGummy Medley", flavor: "Mixed Fruit", price: "€5.49", emoji: "🍊", badge: "New", desc: "Mango, peach, raspberry — all-natural, vegan, gluten-free.", gradient: "from-orange-500 to-yellow-400" },
      { name: "Berry Bliss", flavor: "Blueberry & Raspberry", price: "€4.49", emoji: "🫐", desc: "Antioxidant-rich berry gummies. Pure fruit, nothing else.", gradient: "from-purple-600 to-blue-500" },
      { name: "Tropical Cubes", flavor: "Mango & Pineapple", price: "€5.99", emoji: "🥭", badge: "Coming Soon", desc: "Taste of the tropics. Organic mango and pineapple concentrate.", gradient: "from-yellow-500 to-green-400" },
    ],
  },
  {
    id: "chocolate",
    radius: 170, duration: 16, size: 90, startAngle: 110,
    icon: "🍫", label: "Chocolate", labelLt: "Šokoladas",
    gradient: "from-amber-900 via-amber-700 to-yellow-600",
    glow: "rgba(180,100,30,0.45)",
    ring: "rgba(180,100,30,0.18)",
    bgFrom: "#120a00",
    accentColor: "#d4a830",
    keyIngredients: [
      {
        emoji: "🍫",
        name: "Single-Origin Cacao",
        benefit: "Traceable from farm to bar — no blended commodity cacao, no mystery origins. Rich in flavonoids and natural antioxidants that conventional chocolate processing destroys.",
      },
      {
        emoji: "🌿",
        name: "Natural & Organic Sweeteners",
        benefit: "Coconut sugar, raw honey, organic stevia and other nature-derived sources only. Never refined white sugar, never artificial sweeteners. Sweetness with intention.",
      },
      {
        emoji: "🌸",
        name: "Bourbon Vanilla Pod",
        benefit: "Real vanilla bean extract — not synthetic vanillin derived from petrochemicals. The flavour is richer, rounder, and takes weeks to develop properly. Worth every second.",
      },
    ],
    products: [
      { name: "Holy Dark 72%", flavor: "Pure Dark Chocolate", price: "€6.99", emoji: "🍫", badge: "Premium", desc: "Single-origin cacao, 72% dark. No additives, just pure chocolate.", gradient: "from-amber-900 to-yellow-700" },
      { name: "Holy Milk Dream", flavor: "Creamy Milk Chocolate", price: "€5.99", emoji: "🥛", desc: "Velvety smooth milk chocolate made with organic whole milk.", gradient: "from-amber-700 to-orange-400" },
      { name: "Hazel Divine", flavor: "Hazelnut & Dark Choc", price: "€7.49", emoji: "🌰", badge: "New", desc: "Roasted hazelnuts and 65% dark chocolate. Divine combination.", gradient: "from-amber-800 to-amber-600" },
      { name: "Holy White", flavor: "Vanilla White Chocolate", price: "€6.49", emoji: "🤍", badge: "Coming Soon", desc: "Real vanilla bean, organic cocoa butter, naturally sweet.", gradient: "from-yellow-200 to-amber-300" },
    ],
  },
  {
    id: "drinks",
    radius: 235, duration: 25, size: 82, startAngle: 220,
    icon: "🥤", label: "Drinks", labelLt: "Gėrimai",
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    glow: "rgba(99,179,237,0.45)",
    ring: "rgba(99,179,237,0.18)",
    bgFrom: "#000d1a",
    accentColor: "#60a5fa",
    keyIngredients: [
      {
        emoji: "⚡",
        name: "Natural Electrolytes",
        benefit: "Calcium, magnesium and potassium sourced from mineral deposits — not synthetic lab salts. Replenish what you actually lose during exercise, without the neon dye.",
      },
      {
        emoji: "🦠",
        name: "Live Probiotics",
        benefit: "Gut-friendly cultures that survive the journey to your microbiome. Supports immunity, digestion, and mood — because what you drink shapes your whole body, not just your thirst.",
      },
      {
        emoji: "🌿",
        name: "Organic Stevia Leaf",
        benefit: "300× sweeter than sugar with zero calories and zero glycaemic impact. Extracted from the whole leaf — not chemically isolated rebaudioside. Sweet the way nature intended.",
      },
    ],
    products: [
      { name: "Holy Hydrate", flavor: "Electrolyte Water", price: "€2.99", emoji: "💧", badge: "Bestseller", desc: "Pure spring water with natural electrolytes. Zero sugar, zero junk.", gradient: "from-cyan-500 to-blue-600" },
      { name: "Golden Elixir", flavor: "Turmeric & Ginger", price: "€4.49", emoji: "✨", badge: "New", desc: "Anti-inflammatory blend of turmeric, ginger and black pepper.", gradient: "from-yellow-500 to-orange-500" },
      { name: "Berry Rush", flavor: "Mixed Berry Juice", price: "€3.99", emoji: "🫐", desc: "Cold-pressed berry juice. No added sugar, 100% fruit.", gradient: "from-purple-600 to-pink-500" },
      { name: "Holy Matcha", flavor: "Ceremonial Grade Matcha", price: "€5.49", emoji: "🍵", badge: "Coming Soon", desc: "Japanese ceremonial matcha. Calm energy, no jitters.", gradient: "from-green-600 to-emerald-400" },
    ],
  },
  {
    id: "snacks",
    radius: 308, duration: 36, size: 80, startAngle: 300,
    icon: "🍟", label: "Snacks", labelLt: "Traškučiai",
    gradient: "from-yellow-400 via-orange-500 to-red-500",
    glow: "rgba(249,115,22,0.45)",
    ring: "rgba(249,115,22,0.18)",
    bgFrom: "#150800",
    accentColor: "#f97316",
    keyIngredients: [
      {
        emoji: "🫒",
        name: "Extra-Virgin Cold-Pressed Olive Oil",
        benefit: "First cold press only — full polyphenols, antioxidants and oleocanthal intact. Conventional snack oils are refined, bleached and deodorised until nothing beneficial remains.",
      },
      {
        emoji: "🧂",
        name: "Himalayan Pink Salt",
        benefit: "Hand-harvested from ancient sea beds 500 million years old. Contains 84 naturally occurring trace minerals. Not chemically processed like standard table salt.",
      },
      {
        emoji: "🌿",
        name: "Rosemary Extract",
        benefit: "A potent natural antioxidant that keeps snacks fresh without synthetic preservatives. Replaces BHA and BHT — two petrochemical preservatives banned in several countries.",
      },
    ],
    products: [
      { name: "Holy Chips", flavor: "Sea Salt & Olive Oil", price: "€3.49", emoji: "🥔", badge: "Bestseller", desc: "Thin-sliced, baked not fried. Olive oil and sea salt only.", gradient: "from-yellow-500 to-amber-500" },
      { name: "Protein Puffs", flavor: "Cheddar & Herbs", price: "€4.99", emoji: "🧀", badge: "New", desc: "20g protein per bag. Made from pea protein, naturally flavored.", gradient: "from-orange-500 to-yellow-400" },
      { name: "Divine Crackers", flavor: "Rosemary & Sea Salt", price: "€3.99", emoji: "🌿", desc: "Crispy sourdough crackers with rosemary. Naturally fermented.", gradient: "from-amber-700 to-yellow-600" },
      { name: "Holy Popcorn", flavor: "Caramel & Himalayan Salt", price: "€3.29", emoji: "🍿", badge: "Coming Soon", desc: "Air-popped, coated in coconut sugar caramel. Addictively good.", gradient: "from-amber-500 to-orange-400" },
    ],
  },
  {
    id: "holy",
    radius: 265, duration: 30, size: 88, startAngle: 55,
    icon: "✦", label: "Holy Picks", labelLt: "Švarūs produktai",
    gradient: "from-emerald-400 via-teal-300 to-cyan-400",
    glow: "rgba(52,211,153,0.55)",
    ring: "rgba(52,211,153,0.20)",
    bgFrom: "#001810",
    accentColor: "#34d399",
    keyIngredients: [
      {
        emoji: "📋",
        name: "≤5 Ingredients",
        benefit: "The golden rule of clean eating: if you can't pronounce it, your body probably can't process it. Every Holy Pick product has a label you can read in seconds — whole foods only.",
      },
      {
        emoji: "🚫",
        name: "Zero Artificial Additives",
        benefit: "No E-numbers from the danger list, no synthetic colours, no artificial preservatives. Every ingredient on the label is either a whole food or a recognised safe natural extract.",
      },
      {
        emoji: "🌍",
        name: "Minimal Processing",
        benefit: "Cold-pressed, stone-ground, or simply mixed — never extruded, never chemically modified. The closer to nature the process, the more nutrients reach your cells intact.",
      },
    ],
    products: [
      { name: "Nakd Cocoa Orange", flavor: "Dates · Cashews · Cocoa", price: "€1.89", emoji: "🍫", badge: "Legendary ⭐", desc: "4 ingredients. No baking, no additives, no compromise. Just pressed whole fruit and nuts.", gradient: "from-orange-700 to-amber-500" },
      { name: "RXBAR Chocolate Sea Salt", flavor: "Egg Whites · Almonds · Dates", price: "€3.49", emoji: "💪", badge: "Holy ✦", desc: "No B.S. on the label — literally lists every ingredient on the front. 12g protein, zero sugar alcohols.", gradient: "from-red-800 to-red-600" },
      { name: "Oatly Oat Drink", flavor: "Oats · Water · Rapeseed Oil", price: "€2.29", emoji: "🌾", badge: "Divine 👑", desc: "The original oat drink. 6 clean ingredients, B12 + D2 fortified, zero hidden thickeners.", gradient: "from-yellow-600 to-amber-400" },
      { name: "Lindt 90% Excellence", flavor: "Cocoa Mass · Sugar · Cocoa Butter", price: "€2.99", emoji: "🖤", badge: "Holy ✦", desc: "3 ingredients. Intense, clean, antioxidant-rich. No palm oil, no lecithin, no vanillin.", gradient: "from-stone-800 to-stone-600" },
    ],
  },
  {
    id: "gums",
    radius: 368, duration: 44, size: 78, startAngle: 150,
    icon: "🦷", label: "Gums", labelLt: "Gumos",
    gradient: "from-teal-400 via-cyan-300 to-sky-400",
    glow: "rgba(45,212,191,0.45)",
    ring: "rgba(45,212,191,0.18)",
    bgFrom: "#001818",
    accentColor: "#2dd4bf",
    keyIngredients: [
      {
        emoji: "🔬",
        name: "Nano-Hydroxyapatite",
        benefit: "The exact mineral your teeth are made of — remineralises enamel at the nano scale. Clinically proven fluoride alternative used in Japanese dentistry since the 1980s.",
      },
      {
        emoji: "🌿",
        name: "Birch Xylitol",
        benefit: "Starves cavity-causing bacteria without harming your gut microbiome. Zero glycaemic impact, derived from sustainably harvested birch trees.",
      },
      {
        emoji: "🌱",
        name: "Chicle Gum Base",
        benefit: "Ancient natural resin from the Sapodilla tree. No synthetic polymers, no petrochemicals — just the way gum was chewed for thousands of years.",
      },
    ],
    products: [
      { name: "HolyGum Classic", flavor: "Pure Peppermint", price: "€3.99", emoji: "🌿", badge: "Bestseller", desc: "12-piece pack. Xylitol + Nano-Hydroxyapatite — remineralises your enamel with every chew. Zero aspartame, zero sugar, zero compromise.", gradient: "from-teal-500 to-cyan-400" },
      { name: "HolyGum Spearmint", flavor: "Cool Spearmint", price: "€3.99", emoji: "🫧", desc: "Gentle spearmint coolness. Birch xylitol sweetened, naturally fresh. Enamel-safe, pH-neutral, dentist-approved.", gradient: "from-cyan-400 to-sky-400" },
      { name: "HolyGum Charcoal", flavor: "Activated Charcoal & Mint", price: "€4.49", emoji: "🖤", badge: "New", desc: "Activated charcoal + Nano-Hydroxyapatite for surface whitening support. The cleanest chew on the planet.", gradient: "from-slate-700 via-slate-600 to-teal-500" },
      { name: "HolyGum Berry Fresh", flavor: "Wild Berry & Mint", price: "€4.49", emoji: "🫐", badge: "Coming Soon", desc: "Wild berry freshness meets dental science. The guilt-free gum that actually protects your teeth while you enjoy it.", gradient: "from-purple-600 to-teal-400" },
    ],
  },
];

// ─── CART ─────────────────────────────────────────────────────────────────────

type CartItem = {
  product: Product;
  cat: Category;
  quantity: number;
};

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  { name: "Emma R.",     location: "Amsterdam, NL", rating: 5, productName: "KubiX Classic",   catIcon: "🍬", text: "Finally found gummies my kids actually beg for — and I'm happy to give them. No corn syrup, no artificial dyes. Just strawberry. We go through a bag a week." },
  { name: "Lukas M.",    location: "Berlin, DE",    rating: 5, productName: "Holy Dark 72%",   catIcon: "🍫", text: "I've been hunting for clean dark chocolate for years. No waxy aftertaste, no weird sweeteners. Just pure cacao. Ordered six bars already." },
  { name: "Sofija K.",   location: "Vilnius, LT",   rating: 5, productName: "Holy Hydrate",    catIcon: "💧", text: "Nebegaliu gerti įprastų izotonikų po to, kaip radau Holy Hydrate. Tinka po treniruočių, nėra to saldaus sirupo pojūčio. Rekomenduoju visiems." },
  { name: "James T.",    location: "London, UK",    rating: 5, productName: "Holy Chips",       catIcon: "🥔", text: "Baked, not fried, genuinely crispy, and the ingredient list is four words long. I was deeply sceptical. I'm now a subscriber." },
  { name: "Marta W.",    location: "Warsaw, PL",    rating: 5, productName: "Golden Elixir",   catIcon: "✨", text: "The turmeric drink is my morning ritual now. Anti-inflammatory, beautifully warming, and the colour alone makes me happy every single day." },
  { name: "Andrius P.",  location: "Kaunas, LT",    rating: 5, productName: "Berry Bliss",     catIcon: "🫐", text: "Pirkau kaip dovaną mamai. Ji dabar užsako pati ir rekomenduoja draugėms. Tai geriausia rekomendacija, kurią galiu duoti." },
];

// ─── FAKE PRODUCT DETAIL DATA ─────────────────────────────────────────────────

const DETAIL_INGREDIENTS: Record<string, string> = {
  gummies:   "Organic Fruit Juice Concentrate, Coconut Sugar, Apple Pectin, Tapioca Starch, Natural Agar (texture stabiliser), Citric Acid (from lemons), Natural Colors (Beet Juice Powder, Turmeric, Spirulina Extract), Sunflower Wax (natural glaze)",
  chocolate: "Organic Cacao Mass (72%), Coconut Sugar, Organic Cacao Butter, Bourbon Vanilla Pod Extract, Himalayan Pink Salt",
  drinks:    "Purified Spring Water, Natural Electrolytes (Calcium Chloride, Magnesium Chloride, Potassium Chloride), Citric Acid, Natural Fruit Flavor, Organic Stevia Leaf Extract",
  snacks:    "Organic Potatoes, Extra-Virgin Cold-Pressed Olive Oil, Himalayan Pink Salt, Rosemary Extract (natural preservative)",
  gums:      "Xylitol (from Birch Wood), Gum Base (Chicle Natural Resin, Candelilla Wax), Nano-Hydroxyapatite, Calcium Carbonate, Natural Peppermint Oil, Sunflower Lecithin, Carnauba Wax (natural glaze), Spearmint Extract",
};

const DETAIL_NUTRITION: Record<string, Array<{ label: string; value: string }>> = {
  gummies:   [{ label: "Serving", value: "30 g (≈5 pcs)" }, { label: "Calories", value: "95 kcal" }, { label: "Total Sugar", value: "14 g" }, { label: "Added Sugar", value: "0 g" }, { label: "Protein", value: "2 g" }, { label: "Fat", value: "0 g" }],
  chocolate: [{ label: "Serving", value: "30 g (3 squares)" }, { label: "Calories", value: "165 kcal" }, { label: "Total Sugar", value: "8 g" }, { label: "Added Sugar", value: "5 g" }, { label: "Protein", value: "3 g" }, { label: "Fat", value: "13 g" }],
  drinks:    [{ label: "Serving", value: "330 ml" }, { label: "Calories", value: "12 kcal" }, { label: "Total Sugar", value: "0 g" }, { label: "Electrolytes", value: "380 mg" }, { label: "Vitamin C", value: "80 mg" }, { label: "Fat", value: "0 g" }],
  snacks:    [{ label: "Serving", value: "28 g (≈12 pcs)" }, { label: "Calories", value: "130 kcal" }, { label: "Total Sugar", value: "0 g" }, { label: "Sodium", value: "120 mg" }, { label: "Protein", value: "2 g" }, { label: "Fat", value: "7 g" }],
  gums:      [{ label: "Serving", value: "2 pieces (5 g)" }, { label: "Calories", value: "6 kcal" }, { label: "Xylitol", value: "1.8 g" }, { label: "Nano-HA", value: "200 mg" }, { label: "Sugars", value: "0 g" }, { label: "Fat", value: "0 g" }],
};

const DETAIL_CERTS = ["🌱 Vegan", "🌿 Non-GMO", "🚫 No Artificial Colors", "🔬 No Synthetic Preservatives", "🌾 Gluten-Free"];

// ─── BAD PLANET DATA ──────────────────────────────────────────────────────────

const BAD_PLANET = {
  radius: 392, duration: 50, size: 88, startAngle: 60,
  icon: "☠️",
  gradient: "from-red-900 via-rose-800 to-orange-900",
  glow: "rgba(220,38,38,0.45)",
  ring: "rgba(220,38,38,0.18)",
  accentColor: "#ef4444",
};

const GOOD_PLANET = {
  radius: 320, duration: 42, size: 88, startAngle: 240,
  icon: "🌿",
  glow: "rgba(34,197,94,0.50)",
  ring: "rgba(34,197,94,0.20)",
  accentColor: "#22c55e",
};

type GoodIngredient = {
  name: string;
  emoji: string;
  benefit: "high" | "medium";
  category: "sweeteners" | "colors" | "preservatives" | "fats" | "enhancers" | "gelling" | "emulsifiers" | "superfoods" | "proteins" | "fibres";
  replaces: string;
  whyGood: string;
  holyUse: string;
  gradient: string;
  alsoKnownAs?: string;
  scienceFact?: string;
};

const GOOD_CATEGORIES = [
  { id: "all",           label: "All Good Stuff",        labelLt: "Visa geroji pusė",        icon: "✦"  },
  { id: "sweeteners",    label: "Natural Sweeteners",    labelLt: "Natūralūs saldikliai",    icon: "🍯" },
  { id: "colors",        label: "Natural Colours",       labelLt: "Natūralūs dažai",         icon: "🌈" },
  { id: "preservatives", label: "Natural Preservation",  labelLt: "Natūralus konservavimas", icon: "🌿" },
  { id: "fats",          label: "Good Fats",             labelLt: "Geri riebalai",           icon: "🫒" },
  { id: "enhancers",     label: "Natural Flavour",       labelLt: "Natūralus skonis",        icon: "🍄" },
  { id: "gelling",       label: "Natural Binders",       labelLt: "Natūralūs rišikliai",     icon: "🌊" },
  { id: "emulsifiers",   label: "Clean Emulsifiers",     labelLt: "Švarūs emulsikliai",      icon: "🌻" },
  { id: "superfoods",    label: "Superfoods",            labelLt: "Supermaistas",            icon: "⚡" },
  { id: "proteins",      label: "Plant Proteins",        labelLt: "Augaliniai baltymai",     icon: "💪" },
  { id: "fibres",        label: "Prebiotic Fibres",      labelLt: "Prebiotinės skaidulos",   icon: "🧬" },
];

const GOOD_INGREDIENTS: GoodIngredient[] = [
  // ── NATURAL SWEETENERS ────────────────────────────────────────────────────
  {
    name: "Medjool Dates",
    emoji: "🌴", benefit: "high", category: "sweeteners",
    replaces: "Refined Sugar, High-Fructose Corn Syrup, Glucose Syrup",
    alsoKnownAs: "Date paste, date sugar, whole dates, Deglet Noor dates",
    whyGood: "Whole fruit sweetener with fibre, potassium, magnesium, and B vitamins intact. The fibre slows glucose absorption — no blood sugar spike, no crash. Tastes twice as sweet as refined sugar so you use half as much.",
    holyUse: "Our primary binder and sweetener in bars and gummies. When dates sweeten, the entire ingredient list shortens — no thickeners, no gums, no syrups needed.",
    scienceFact: "Studies show dates have a surprisingly low glycaemic index (GI 42–55) despite being intensely sweet — because the fibre matrix controls sugar release.",
    gradient: "from-amber-700 to-yellow-600",
  },
  {
    name: "Coconut Sugar",
    emoji: "🥥", benefit: "high", category: "sweeteners",
    replaces: "Refined White Sugar, Brown Sugar, Cane Sugar",
    alsoKnownAs: "Coconut palm sugar, gula melaka, palm sugar",
    whyGood: "Retains inulin (a prebiotic fibre), iron, zinc, calcium, and potassium. GI of 35 vs 65 for white sugar. Produces no comparable insulin spike and supports gut microbiome health.",
    holyUse: "Used in our chocolate coatings and chocolate-based products. Gives a natural caramel depth that refined sugar never achieves.",
    scienceFact: "Coconut sugar contains up to 9% inulin — a soluble fibre that feeds beneficial Bifidobacterium in your gut.",
    gradient: "from-amber-800 to-amber-600",
  },
  {
    name: "Raw Honey",
    emoji: "🍯", benefit: "high", category: "sweeteners",
    replaces: "Corn Syrup, Glucose Syrup, Inverted Sugar Syrup",
    alsoKnownAs: "Wildflower honey, manuka honey, raw unfiltered honey",
    whyGood: "Contains 180+ bioactive compounds including hydrogen peroxide, methylglyoxal, and bee defensin-1 — natural antimicrobials. Preserves naturally without chemicals. Contains enzymes, antioxidants, and trace minerals destroyed by heat processing.",
    holyUse: "Used raw in our gums and coating layers. Never heated above 40°C so every enzyme survives into the final product.",
    gradient: "from-yellow-600 to-amber-500",
  },
  {
    name: "Monk Fruit Extract",
    emoji: "🍈", benefit: "high", category: "sweeteners",
    replaces: "Aspartame (E951), Sucralose (E955), Acesulfame-K (E950), Saccharin",
    alsoKnownAs: "Luo han guo, Siraitia grosvenorii, mogroside V",
    whyGood: "200–400× sweeter than sugar from mogrosides — antioxidant compounds, not sugar molecules. Zero glycaemic impact, zero calories, zero gut microbiome disruption. The only zero-calorie sweetener with antioxidant properties rather than oxidative ones.",
    holyUse: "Our go-to zero-calorie sweetener for anything that needs intense sweetness without any sugar. No aftertaste, no chemicals.",
    scienceFact: "Mogrosides in monk fruit are being studied for anti-inflammatory and anti-cancer properties — a rare case where a sweetener may actively benefit health.",
    gradient: "from-green-700 to-emerald-600",
  },
  {
    name: "Organic Stevia Leaf",
    emoji: "🌱", benefit: "high", category: "sweeteners",
    replaces: "Aspartame, Sucralose, Acesulfame-K, Cyclamate",
    alsoKnownAs: "Stevia rebaudiana, Reb-A, steviol glycosides (when processed)",
    whyGood: "The whole leaf form retains chlorophyll, terpenes, and antioxidants alongside sweetness. Zero calories, zero GI impact, and actively lowers blood pressure in clinical trials. Used by the Guaraní people for 1,500 years without adverse effects.",
    holyUse: "We use only certified organic whole-leaf or minimally processed stevia — never the highly refined Reb-A isolate stripped of all its natural compounds.",
    gradient: "from-green-600 to-teal-500",
  },
  {
    name: "Maple Syrup (Grade A Dark)",
    emoji: "🍁", benefit: "medium", category: "sweeteners",
    replaces: "Refined Sugar, Corn Syrup, Artificial Caramel Flavouring",
    alsoKnownAs: "Pure maple syrup, Canadian maple syrup",
    whyGood: "Contains 24 antioxidants, manganese (37% RDA per tbsp), zinc, riboflavin, and quebecol — a polyphenol unique to maple syrup. GI of 54 vs 65 for white sugar. Real flavour complexity that artificial caramel can never replicate.",
    holyUse: "Used in coatings where we need a natural caramel note. One ingredient — sap from maple trees. Nothing added.",
    gradient: "from-amber-600 to-orange-500",
  },
  {
    name: "Blackstrap Molasses",
    emoji: "🖤", benefit: "high", category: "sweeteners",
    replaces: "Refined Brown Sugar, Caramel Colouring (E150), Artificial Molasses Flavour",
    alsoKnownAs: "Black treacle, final molasses, unsulphured molasses",
    whyGood: "The mineral-rich byproduct of sugar refining — what remains after all the 'empty' sucrose is stripped away. Rich in iron (20% RDA per tbsp), calcium, magnesium, potassium, and B6. What the sugar industry discards is what actually nourishes you.",
    holyUse: "Used in small amounts to deepen flavour and add genuine mineral content to dark snacks and coatings.",
    scienceFact: "Blackstrap molasses has a lower GI than refined sugar because its residual fibre and mineral content slows glucose absorption.",
    gradient: "from-stone-800 to-amber-900",
  },
  {
    name: "Lucuma Powder",
    emoji: "🌟", benefit: "medium", category: "sweeteners",
    replaces: "Refined Sugar, Caramel Powder, Artificial Butterscotch Flavour",
    alsoKnownAs: "Pouteria lucuma, gold of the Incas, lucuma flour",
    whyGood: "A Peruvian fruit dried and powdered that delivers natural caramel-butterscotch sweetness with a low GI of 25. Contains beta-carotene, niacin, iron, and zinc. Naturally low in sugars but intensely flavourful — you need less of it.",
    holyUse: "Used in caramel-flavoured snacks as a clean, whole-food alternative to caramel syrups or artificial butterscotch.",
    gradient: "from-yellow-700 to-amber-500",
  },
  {
    name: "Yacon Syrup",
    emoji: "🌿", benefit: "high", category: "sweeteners",
    replaces: "Golden Syrup, Agave Syrup (highly processed), High-Fructose Corn Syrup",
    alsoKnownAs: "Yacon root syrup, Smallanthus sonchifolius extract",
    whyGood: "Up to 50% fructooligosaccharides (FOS) — prebiotic fibres your gut bacteria ferment rather than your body absorbing as sugar. Clinically shown to increase Bifidobacterium and reduce fasting blood glucose. Genuinely feeds your microbiome while tasting sweet.",
    holyUse: "Used in gut-health focused products where we want sweetness and a prebiotic effect in a single ingredient.",
    scienceFact: "A 2009 randomised controlled trial showed yacon syrup significantly decreased fasting serum insulin and waist circumference in obese premenopausal women.",
    gradient: "from-lime-600 to-green-500",
  },

  // ── NATURAL COLOURS ────────────────────────────────────────────────────────
  {
    name: "Spirulina Blue",
    emoji: "🫧", benefit: "high", category: "colors",
    replaces: "Brilliant Blue (E133), Indigo Carmine (E132), Blue 1",
    alsoKnownAs: "Phycocyanin, spirulina extract",
    whyGood: "Phycocyanin — the blue pigment from spirulina — is a powerful antioxidant and anti-inflammatory compound. Colours food vivid blue while simultaneously protecting cells. Banned synthetic dyes are linked to ADHD; spirulina blue is linked to brain health.",
    holyUse: "Used in select products needing a blue or purple hue. The colour is a side effect — the nutrition is the point.",
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    name: "Beet Root Powder",
    emoji: "🫀", benefit: "high", category: "colors",
    replaces: "Red 40 (E129), Carmoisine (E122), Allura Red, Cochineal (E120)",
    alsoKnownAs: "Beetroot extract, beet juice concentrate, betanin (E162)",
    whyGood: "Betalains in beetroot are potent antioxidants that lower blood pressure, improve athletic endurance, and support liver detoxification. Colours food rich red/pink while delivering nitrates that the body converts to nitric oxide — a vasodilator.",
    holyUse: "Our choice for any red or pink colouring. The pigment concentration gives full colour at doses that also deliver measurable nitrate benefits.",
    scienceFact: "A single serving of beet-coloured food can deliver enough nitrates to measurably lower systolic blood pressure within 2–3 hours.",
    gradient: "from-rose-700 to-pink-500",
  },
  {
    name: "Turmeric Extract",
    emoji: "🌕", benefit: "high", category: "colors",
    replaces: "Yellow 5 (E102, Tartrazine), Yellow 6 (E110, Sunset Yellow)",
    alsoKnownAs: "Curcumin, E100, curcuminoids",
    whyGood: "Curcumin is one of the most studied anti-inflammatory compounds in existence — over 12,000 published studies. Tartrazine (Yellow 5) it replaces is linked to ADHD, hives, and is banned in Norway. The replacement actively protects rather than harms.",
    holyUse: "Gives our products a golden yellow without any synthetic chemistry. The curcumin content varies by batch — we test every lot.",
    gradient: "from-yellow-500 to-amber-400",
  },
  {
    name: "Butterfly Pea Flower",
    emoji: "🌸", benefit: "medium", category: "colors",
    replaces: "Blue 1, Violet 1, Brilliant Blue (E133), Green 3",
    alsoKnownAs: "Clitoria ternatea, blue pea, Asian pigeonwings",
    whyGood: "Anthocyanins in the flower change colour based on pH — blue in neutral, purple in alkaline, pink in acid — creating natural colour-changing effects impossible to replicate synthetically. Rich in antioxidants with nootropic potential.",
    holyUse: "Used in select limited edition products. The colour-shift reaction when mixed with citric acid is something no synthetic dye can do.",
    gradient: "from-purple-600 to-blue-500",
  },
  {
    name: "Annatto Extract",
    emoji: "🧡", benefit: "high", category: "colors",
    replaces: "Yellow 6 (E110, Sunset Yellow), Orange B (E122), Annatto (synthetic substitute)",
    alsoKnownAs: "Bixin, norbixin, E160b, achiote, roucou",
    whyGood: "Derived from the seeds of the achiote tree. Bixin and norbixin are carotenoids with antioxidant activity — they colour food vivid orange-yellow while scavenging free radicals. No ADHD links, no genotoxicity. Has been used in South American cuisine for centuries.",
    holyUse: "Used for any orange or yellow hue requirement. The carotenoid content means the colour literally works as an antioxidant in your body.",
    gradient: "from-orange-500 to-yellow-400",
  },
  {
    name: "Red Cabbage Extract",
    emoji: "🔴", benefit: "high", category: "colors",
    replaces: "Red 40 (E129, Allura Red), Carmoisine (E122), Amaranth (E123)",
    alsoKnownAs: "Anthocyanin from red cabbage, E163, purple cabbage extract",
    whyGood: "Anthocyanins from red cabbage produce vivid red, purple, and blue hues depending on pH — a full colour range from one ingredient. These same pigments are among the most studied anti-cancer antioxidants. Red 40 is made from petroleum; red cabbage grows in soil.",
    holyUse: "Used to achieve red and purple tones naturally. pH-sensitive behaviour is a bonus — it tells you the product is genuinely natural.",
    scienceFact: "Red cabbage anthocyanins cross the blood-brain barrier and accumulate in brain tissue, where they demonstrate neuroprotective activity in animal studies.",
    gradient: "from-purple-700 to-rose-600",
  },
  {
    name: "Paprika Extract",
    emoji: "🌶️", benefit: "high", category: "colors",
    replaces: "Red 40 (E129), Carmine (E120), Allura Red",
    alsoKnownAs: "Capsanthin, capsorubin, E160c, oleoresin paprika",
    whyGood: "Capsanthin and capsorubin are carotenoids with proven antioxidant activity and anti-inflammatory properties. Produces warm red-orange colour without any petroleum chemistry. Has been a food ingredient for centuries in virtually every cuisine.",
    holyUse: "Used in savoury snacks for natural red-orange colour. Adds a warm visual note with zero artificial chemistry.",
    gradient: "from-red-600 to-orange-500",
  },
  {
    name: "Matcha Powder",
    emoji: "🍵", benefit: "high", category: "colors",
    replaces: "Green 3 (Fast Green, E143), Brilliant Blue + Yellow mix (synthetic green)",
    alsoKnownAs: "Ceremonial matcha, tencha, powdered green tea, EGCG source",
    whyGood: "Chlorophyll delivers natural vivid green that synthetic dyes mimic poorly. But matcha also delivers L-theanine (calm focus), EGCG (potent antioxidant), and natural caffeine. The colour is the least interesting thing about it.",
    holyUse: "Used in green-coloured products and matcha-flavoured lines. Every gram carries cognitive and antioxidant benefit.",
    scienceFact: "Matcha contains 137× more EGCG than standard brewed green tea because you consume the whole ground leaf rather than a water infusion.",
    gradient: "from-green-600 to-emerald-400",
  },
  {
    name: "Hibiscus Extract",
    emoji: "🌺", benefit: "high", category: "colors",
    replaces: "Allura Red (E129), Carmoisine (E122), Erythrosine (E127)",
    alsoKnownAs: "Hibiscus sabdariffa, roselle extract, sorrel extract, E163 variant",
    whyGood: "Delivers deep crimson-pink naturally from anthocyanins and hibiscus acid. Clinical studies show hibiscus extract lowers systolic blood pressure comparably to captopril (a blood pressure drug). The colour serves as a cardiovascular benefit.",
    holyUse: "Used in berry-flavoured and pink-coloured products. One of the few food colourings with genuine medicinal evidence.",
    scienceFact: "A randomised trial published in the Journal of Nutrition found hibiscus tea reduced systolic blood pressure by 7 mmHg in prehypertensive adults over 6 weeks.",
    gradient: "from-rose-600 to-pink-400",
  },

  // ── NATURAL PRESERVATION ───────────────────────────────────────────────────
  {
    name: "Vitamin E (Mixed Tocopherols)",
    emoji: "🛡️", benefit: "high", category: "preservatives",
    replaces: "BHA (E320), BHT (E321), TBHQ (E319)",
    alsoKnownAs: "Mixed tocopherols, E306, sunflower tocopherols, natural antioxidant",
    whyGood: "Prevents fat oxidation exactly as BHA/BHT do — but simultaneously acts as a fat-soluble antioxidant in your body rather than a potential carcinogen. BHA is listed as a possible human carcinogen (IARC Group 2B); Vitamin E is a nutrient.",
    holyUse: "Added to any fat-containing product to maintain freshness. The dose that preserves also contributes to your daily Vitamin E intake.",
    scienceFact: "BHT is metabolically converted to BHQ in the body — a compound that damages DNA in some studies. Vitamin E does the opposite: it donates electrons to neutralise free radicals.",
    gradient: "from-amber-500 to-yellow-400",
  },
  {
    name: "Rosemary Extract",
    emoji: "🌿", benefit: "high", category: "preservatives",
    replaces: "TBHQ (E319), Propyl Gallate (E310), Ethoxyquin (E324)",
    alsoKnownAs: "Rosemary antioxidant, rosmarinic acid, carnosic acid, E392",
    whyGood: "Carnosic acid and rosmarinic acid outperform synthetic alternatives in some fat matrices. Simultaneously studied for neuroprotective, anti-tumour, and anti-inflammatory properties. Preserves while actively benefiting health.",
    holyUse: "Our standard antioxidant preservative in all oil-containing products. Works synergistically with Vitamin E for complete fat protection.",
    gradient: "from-green-600 to-emerald-500",
  },
  {
    name: "Citric Acid (Fermentation-Derived)",
    emoji: "🍋", benefit: "medium", category: "preservatives",
    replaces: "Sodium Benzoate (E211), Potassium Sorbate (E202), Calcium Propionate (E282)",
    alsoKnownAs: "Natural citric acid, E330, lemon acid",
    whyGood: "Lowers product pH to create an inhospitable environment for bacteria and mould — no synthetic chemistry needed. Also enhances mineral absorption (chelation) and adds brightness. When fermentation-derived, it is identical to what lemons produce.",
    holyUse: "We source only non-GMO fermentation-derived citric acid. Used for pH control, preservation, and flavour brightness simultaneously.",
    gradient: "from-yellow-400 to-lime-400",
  },
  {
    name: "Vitamin C (Ascorbic Acid)",
    emoji: "🍊", benefit: "high", category: "preservatives",
    replaces: "Sodium Benzoate (E211), Sodium Erythorbate (E316), Sodium Ascorbate (synthetic)",
    alsoKnownAs: "L-ascorbic acid, E300, natural ascorbic acid, rose hip extract",
    whyGood: "Prevents browning and oxidation of cut fruit and fat-containing products. Unlike sodium benzoate — which reacts with Vitamin C to form benzene (a known carcinogen) — Vitamin C is the antioxidant itself. Simultaneously preserves the product and boosts immune function.",
    holyUse: "Used in fruit-based products to preserve colour and freshness. When you see it on our label it means we chose nutrition over chemistry.",
    scienceFact: "Sodium benzoate + ascorbic acid in the same product produces benzene at concentrations that may exceed safe limits — Vitamin C alone produces none.",
    gradient: "from-orange-400 to-yellow-300",
  },
  {
    name: "Green Tea Extract (EGCG)",
    emoji: "🍃", benefit: "high", category: "preservatives",
    replaces: "BHA (E320), BHT (E321), Propyl Gallate (E310)",
    alsoKnownAs: "Epigallocatechin gallate, green tea polyphenols, camellia sinensis extract",
    whyGood: "EGCG is one of the most potent plant antioxidants — it prevents lipid peroxidation at low concentrations, extending shelf life without synthetic chemistry. The same compound is simultaneously the most studied cancer-preventive, cardiovascular-protective polyphenol in existence.",
    holyUse: "Used in fat-rich products where oxidation is the main shelf-life challenge. Preservation that also actively protects your cells.",
    scienceFact: "EGCG has been shown in meta-analyses to reduce LDL cholesterol by 9–14% and lower blood pressure — effects BHA and BHT never offer.",
    gradient: "from-green-500 to-teal-400",
  },
  {
    name: "Raw Apple Cider Vinegar",
    emoji: "🍶", benefit: "medium", category: "preservatives",
    replaces: "Acetic Acid (synthetic E260), Sodium Diacetate (E262), Potassium Acetate (E261)",
    alsoKnownAs: "ACV with mother, unfiltered apple cider vinegar, fermented apple juice",
    whyGood: "The 'mother' — a colony of beneficial bacteria and enzymes — makes raw ACV a living preservative. Lowers pH to inhibit pathogens naturally. The acetic acid it contains is identical to synthetic E260 in function, but the accompanying enzymes, probiotics, and polyphenols are not.",
    holyUse: "Used in marinades, dressings, and sour-flavoured products. The tangy preservation is a bonus on top of the probiotic content.",
    gradient: "from-amber-400 to-yellow-300",
  },
  {
    name: "Pomegranate Extract",
    emoji: "💎", benefit: "high", category: "preservatives",
    replaces: "BHA (E320), TBHQ (E319), Synthetic Antioxidants",
    alsoKnownAs: "Punica granatum extract, punicalagins, ellagic acid",
    whyGood: "Punicalagins in pomegranate are the most potent antioxidants found in any food — 3× the antioxidant activity of red wine and green tea. They preserve fats from oxidation while simultaneously being studied for anti-cancer, anti-inflammatory, and cardioprotective effects.",
    holyUse: "Used in premium product lines where maximum antioxidant preservation meets maximum health benefit.",
    scienceFact: "Punicalagins are converted by gut bacteria to urolithins — compounds that activate mitophagy (cellular renewal) and improve muscle endurance in human trials.",
    gradient: "from-rose-700 to-red-500",
  },

  // ── GOOD FATS ──────────────────────────────────────────────────────────────
  {
    name: "Extra Virgin Olive Oil",
    emoji: "🫒", benefit: "high", category: "fats",
    replaces: "Refined Palm Oil, Soybean Oil, Cottonseed Oil, Vegetable Oil (generic)",
    alsoKnownAs: "EVOO, cold-pressed olive oil, first cold press",
    whyGood: "Over 36 phenolic compounds including oleocanthal — a natural COX inhibitor with ibuprofen-like anti-inflammatory effects. The Mediterranean diet evidence for cardiovascular protection is one of the strongest in nutrition science.",
    holyUse: "Used in savoury products and coatings. We use only certified PDO cold-pressed EVOO — tested for adulteration.",
    scienceFact: "The PREDIMED trial (7,447 participants) found EVOO reduced major cardiovascular events by 30% vs a low-fat diet — one of the largest diet-intervention trials ever conducted.",
    gradient: "from-green-600 to-lime-500",
  },
  {
    name: "Virgin Coconut Oil",
    emoji: "🥥", benefit: "medium", category: "fats",
    replaces: "Hydrogenated Vegetable Oil, Partially Hydrogenated Oils, Interesterified Fats",
    alsoKnownAs: "Cold-pressed coconut oil, unrefined coconut oil, VCO",
    whyGood: "Medium-chain triglycerides (MCTs) are metabolised directly by the liver for immediate energy — bypassing fat storage pathways. Lauric acid (50% of coconut fat) has documented antimicrobial properties. No trans fat, no chemical modification.",
    holyUse: "Used in chocolate coatings for snap and melt-point control. Never hydrogenated, never deodorised.",
    gradient: "from-amber-300 to-yellow-200",
  },
  {
    name: "Cold-Pressed Avocado Oil",
    emoji: "🥑", benefit: "high", category: "fats",
    replaces: "Canola Oil (refined), Sunflower Oil (refined), Corn Oil",
    alsoKnownAs: "Avocado oil, Persea americana oil",
    whyGood: "Highest smoke point of any plant oil (270°C) — stays stable under heat where refined seed oils oxidise and form aldehydes. 70% oleic acid. Contains lutein — an antioxidant concentrated in the eyes. No solvent extraction, no deodorising.",
    holyUse: "Used wherever high-heat application is needed. The stability means less oxidised fat reaching the final product.",
    gradient: "from-green-700 to-lime-500",
  },
  {
    name: "Cold-Pressed Hemp Seed Oil",
    emoji: "🌿", benefit: "high", category: "fats",
    replaces: "Refined Canola Oil, Vegetable Oil, Blended Seed Oils",
    alsoKnownAs: "Hemp oil, Cannabis sativa seed oil (no THC/CBD)",
    whyGood: "A perfect 3:1 ratio of omega-6 to omega-3 — the ideal ratio for human health according to nutritional science. Rare among plant oils. Contains gamma-linolenic acid (GLA), which reduces inflammation. No THC, no CBD — just the seed.",
    holyUse: "Used in health-focused products and dressings. The omega balance alone makes it one of the most nutritionally complete oils available.",
    scienceFact: "The World Health Organisation recommends an omega-6:omega-3 ratio of 4:1 or lower. Hemp seed oil at 3:1 is one of the few plant oils that achieves this naturally.",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    name: "Grass-Fed Ghee",
    emoji: "🧈", benefit: "high", category: "fats",
    replaces: "Margarine, Hydrogenated Vegetable Shortening, Refined Butter",
    alsoKnownAs: "Clarified butter, Indian ghee, drawn butter",
    whyGood: "From grass-fed cows: naturally high in CLA (conjugated linoleic acid — anti-cancer, anti-obesity), butyric acid (primary fuel for colon cells and gut barrier repair), and fat-soluble vitamins A, D, E, K2. Milk solids removed — casein and lactose-free. Stable at high heat without oxidation.",
    holyUse: "Used in products where a rich, nutty depth is needed. Genuinely nutritious fat rather than an empty calorie carrier.",
    scienceFact: "Butyrate from ghee is the preferred energy source for colonocytes (colon cells). It repairs the gut lining, reduces inflammation, and is deficient in most Western diets.",
    gradient: "from-yellow-500 to-amber-400",
  },
  {
    name: "Cold-Pressed Pumpkin Seed Oil",
    emoji: "🎃", benefit: "medium", category: "fats",
    replaces: "Refined Vegetable Oil, Soybean Oil, Generic Seed Oil Blends",
    alsoKnownAs: "Styrian pumpkin oil, pepita oil, Cucurbita pepo oil",
    whyGood: "Rich in phytosterols (lower LDL cholesterol), zinc (immune function, skin), magnesium, and a near-equal omega-6:omega-3 ratio. Deep green-red colour signals genuine antioxidant density — refined oils have no colour because their phytonutrients have been stripped.",
    holyUse: "Used in speciality savoury products for depth of flavour and nutritional density. One of the most mineral-dense culinary oils available.",
    gradient: "from-orange-700 to-amber-600",
  },
  {
    name: "Flaxseed Oil (Cold-Pressed)",
    emoji: "🌾", benefit: "high", category: "fats",
    replaces: "Refined Vegetable Oil, Fish Oil (for omega-3), Canola Oil",
    alsoKnownAs: "Linseed oil, flax oil, Linum usitatissimum oil, ALA source",
    whyGood: "The richest plant source of ALA omega-3 (57% of total fat) — a precursor to EPA and DHA. Contains lignans — phytoestrogens with documented anti-cancer properties, particularly for breast and prostate. Zero chemical extraction — cold pressing only.",
    holyUse: "Used in small amounts in bars and health products for omega-3 enrichment without fish sourcing. Never heated to preserve ALA integrity.",
    scienceFact: "Flaxseed lignans reduce breast cancer risk markers by up to 33% in clinical trials — one of the most consistent findings in nutritional oncology.",
    gradient: "from-amber-600 to-yellow-500",
  },

  // ── NATURAL FLAVOUR ENHANCERS ──────────────────────────────────────────────
  {
    name: "Nutritional Yeast",
    emoji: "🍄", benefit: "high", category: "enhancers",
    replaces: "Monosodium Glutamate (MSG, E621), Disodium Inosinate (E631), Disodium Guanylate (E627)",
    alsoKnownAs: "Nooch, inactive yeast, fortified nutritional yeast",
    whyGood: "Provides natural glutamates that trigger umami taste receptors identically to MSG — but packaged with B vitamins, beta-glucans (immune-supporting), and all 18 amino acids. The flavour enhancement is a side effect of nutrition, not a chemical trick.",
    holyUse: "Used in savoury snack seasonings. A single teaspoon contains over 40% of daily B12 requirements.",
    gradient: "from-yellow-600 to-amber-500",
  },
  {
    name: "Mushroom Powder (Shiitake & Porcini)",
    emoji: "🍄", benefit: "high", category: "enhancers",
    replaces: "Artificial Flavour, Yeast Extract (highly processed), E621–E635 range",
    alsoKnownAs: "Dried mushroom powder, fungal umami, mushroom extract",
    whyGood: "Shiitake contains eritadenine (lowers cholesterol), lentinan (immunomodulator), and natural glutamates rivalling MSG — with simultaneous therapeutic benefits. Mushroom umami complexity is impossible to fake with single-compound additives.",
    holyUse: "Used in small amounts in savoury coatings for deep flavour complexity. The compounds survive drying and remain bioactive.",
    gradient: "from-stone-600 to-amber-700",
  },
  {
    name: "Vanilla Bean (Whole & Extract)",
    emoji: "🌸", benefit: "medium", category: "enhancers",
    replaces: "Vanillin (synthetic), Ethyl Vanillin (E465), Artificial Vanilla Flavour",
    alsoKnownAs: "Bourbon vanilla, Tahitian vanilla, Mexican vanilla, vanilla oleoresin",
    whyGood: "Real vanilla contains 250+ aromatic compounds — rounded, complex flavour where synthetic vanillin is flat and one-dimensional. Contains vanillic acid (antioxidant) and p-hydroxybenzaldehyde (anti-inflammatory). The difference is immediately detectable on the palate.",
    holyUse: "We use only real vanilla bean or certified pure extract. Nothing artificial, nothing synthetic.",
    gradient: "from-amber-800 to-yellow-700",
  },
  {
    name: "Ceylon Cinnamon",
    emoji: "🌰", benefit: "high", category: "enhancers",
    replaces: "Cassia Cinnamon, Artificial Cinnamon Flavour, Cinnamic Aldehyde (synthetic)",
    alsoKnownAs: "True cinnamon, Cinnamomum verum, Sri Lankan cinnamon, Mexican cinnamon",
    whyGood: "Ceylon contains negligible coumarin (< 0.004%) vs cassia (up to 1%) — coumarin is toxic to the liver at regular doses. Contains cinnamaldehyde, eugenol, and cinnamate which lower fasting blood sugar, improve insulin sensitivity, and reduce LDL. The difference from cassia is pharmacologically meaningful.",
    holyUse: "We use only verified Ceylon cinnamon. The liver-safety difference alone makes substituting cassia non-negotiable.",
    scienceFact: "Clinical trials show 1–6g of cinnamon per day reduces fasting blood glucose by 18–29% in type 2 diabetics — comparable to some pharmaceutical interventions.",
    gradient: "from-amber-700 to-orange-600",
  },
  {
    name: "Ginger Root",
    emoji: "🫚", benefit: "high", category: "enhancers",
    replaces: "Artificial Ginger Flavour, Ginger Oleoresin (solvent-extracted), Synthetic Zingerone",
    alsoKnownAs: "Zingiber officinale, fresh ginger, dried ginger powder, ginger extract",
    whyGood: "Gingerols and shogaols — the active compounds — are potent anti-nausea, anti-inflammatory, and gastroprotective agents with over 100 peer-reviewed studies supporting clinical use. Inhibits COX-2 enzymes with similar mechanism to ibuprofen. Real ginger delivers what artificial flavour only imitates.",
    holyUse: "Used in spiced snacks and ginger-flavoured products. The anti-inflammatory benefit is a bonus on every serving.",
    scienceFact: "Ginger reduces exercise-induced muscle pain by 25% — a 2010 double-blind trial finding no other spice has replicated.",
    gradient: "from-yellow-600 to-amber-500",
  },
  {
    name: "Miso Paste (Unpasteurised)",
    emoji: "🥢", benefit: "high", category: "enhancers",
    replaces: "MSG (E621), Hydrolysed Vegetable Protein, Artificial Savoury Flavour, Yeast Extract",
    alsoKnownAs: "Fermented soybean paste, koji miso, shiro miso, hatcho miso",
    whyGood: "Aged fermentation of soybeans and grains with Aspergillus oryzae produces hundreds of umami compounds, digestive enzymes, and beneficial bacteria — no artificial chemistry required. Unpasteurised miso delivers live probiotics alongside deep flavour. Epidemiological data links miso consumption to reduced cancer incidence in Japan.",
    holyUse: "Used in savoury dressings and seasonings for real umami without any additives. The complexity of fermented flavour cannot be replicated in a laboratory.",
    gradient: "from-amber-800 to-red-800",
  },
  {
    name: "Carob Powder",
    emoji: "🌿", benefit: "medium", category: "enhancers",
    replaces: "Cocoa Powder (for caffeine-sensitive), Artificial Chocolate Flavour, Carob Substitute (synthetic)",
    alsoKnownAs: "Locust bean pod powder, St. John's bread, Ceratonia siliqua",
    whyGood: "Naturally sweet — contains 50% natural sugars — so less added sweetener is needed. Zero caffeine, zero theobromine, making it safe for children and caffeine-sensitive individuals. Gallic acid in carob is antiviral, antibacterial, and anti-inflammatory. Tastes like chocolate with its own character.",
    holyUse: "Used in products where we want chocolate depth without caffeine. The natural sweetness also reduces the need for added sugar.",
    gradient: "from-stone-700 to-amber-800",
  },
  {
    name: "Smoked Paprika (Natural)",
    emoji: "🔥", benefit: "medium", category: "enhancers",
    replaces: "Smoke Flavour (liquid smoke, E1520), Artificial BBQ Flavour, Caramel Colouring + Flavour",
    alsoKnownAs: "Pimentón de la Vera, oak-smoked paprika, sweet smoked paprika",
    whyGood: "Real wood-smoked paprika delivers smoke, sweetness, and colour in one ingredient. Capsanthin (the red carotenoid) has antioxidant properties. Compare to liquid smoke — a concentrate of combustion byproducts including guaiacol and syringol, sometimes with carcinogenic PAH traces.",
    holyUse: "Used in BBQ and savoury snacks. One whole-food ingredient replaces three separate artificial additives.",
    gradient: "from-red-700 to-orange-600",
  },
  {
    name: "Black Pepper Extract (Piperine)",
    emoji: "🌑", benefit: "high", category: "enhancers",
    replaces: "Artificial Spice Flavour, Capsaicin Extract (synthetic), Pungency Enhancers",
    alsoKnownAs: "Piperine, BioPerine, Piper nigrum extract",
    whyGood: "Piperine increases the bioavailability of other nutrients by up to 2,000% — particularly curcumin (turmeric). A tiny amount makes every other ingredient in the formula more effective. Simultaneously has anti-inflammatory, antioxidant, and thermogenic properties. Nature's bioavailability enhancer.",
    holyUse: "Added to any turmeric-containing product to ensure curcumin is actually absorbed. Most turmeric products without piperine deliver nearly zero bioavailable curcumin.",
    scienceFact: "Piperine increases curcumin bioavailability by 2,000% in human subjects — one of the largest nutrient-synergy effects ever documented.",
    gradient: "from-stone-800 to-zinc-700",
  },

  // ── NATURAL BINDERS & GELLING ──────────────────────────────────────────────
  {
    name: "Apple Pectin",
    emoji: "🍎", benefit: "high", category: "gelling",
    replaces: "Gelatin, Carrageenan (E407), Guar Gum (E412), Modified Corn Starch",
    alsoKnownAs: "Pectin, E440, fruit pectin, high-methoxyl pectin",
    whyGood: "A soluble fibre from apple skins that gels without any animal or synthetic chemistry. Feeds Bifidobacterium and Lactobacillus gut bacteria. Lowers LDL cholesterol by binding bile acids. The gelling is a bonus — the fibre effect is the primary benefit.",
    holyUse: "Our primary gelling agent in all gummies and jellied products. Gives a clean, fruit-derived chew that gelatin or carrageenan cannot match.",
    scienceFact: "Apple pectin significantly reduces LDL cholesterol in clinical trials by trapping bile acids in the gut and forcing the liver to use cholesterol to make more.",
    gradient: "from-red-500 to-rose-400",
  },
  {
    name: "Agar Agar",
    emoji: "🌊", benefit: "high", category: "gelling",
    replaces: "Gelatin, Carrageenan (E407), Methylcellulose (E461)",
    alsoKnownAs: "Agar, kanten, Japanese isinglass, E406",
    whyGood: "Derived from red algae — 100% vegan, kosher, halal. Sets firmer than gelatin at lower concentrations with no animal slaughter. Contains agarose fibres that pass through the gut undigested, acting as a prebiotic. Zero calories from agar itself.",
    holyUse: "Used as a stability agent in certain products. The sea-sourced mineral content (calcium, magnesium) is an unintended nutritional bonus.",
    gradient: "from-teal-500 to-cyan-400",
  },
  {
    name: "Arrowroot Powder",
    emoji: "🌾", benefit: "medium", category: "gelling",
    replaces: "Modified Corn Starch (E1422, E1442), Tapioca Maltodextrin, Waxy Maize Starch",
    alsoKnownAs: "Arrowroot starch, Maranta arundinacea, West Indian arrowroot",
    whyGood: "Thickens at lower temperatures than corn starch (no chemical modification needed), produces a glossy transparent gel that chemically modified starches approximate poorly. Easily digestible, gentle on irritated guts, zero chemical treatment.",
    holyUse: "Used in coatings and fillings needing a glossy, smooth texture. One ingredient, zero chemistry.",
    gradient: "from-stone-400 to-amber-300",
  },
  {
    name: "Psyllium Husk",
    emoji: "🌱", benefit: "high", category: "gelling",
    replaces: "Methylcellulose (E461), Hydroxypropyl Methylcellulose (E464), Xanthan Gum (E415)",
    alsoKnownAs: "Plantago ovata, isabgol, psyllium fibre",
    whyGood: "The outer coating of psyllium seeds forms a viscous gel that acts as an excellent binder. Simultaneously provides 70% soluble fibre — clinically proven to reduce LDL cholesterol, slow glucose absorption, and relieve both constipation and diarrhoea. Methylcellulose (what it replaces) is a chemically modified wood pulp.",
    holyUse: "Used in fibre-boosted bars and products where binding and gut benefit can come from the same ingredient.",
    scienceFact: "The FDA allows a health claim for psyllium husk — one of very few foods permitted to state it reduces the risk of coronary heart disease.",
    gradient: "from-lime-600 to-green-500",
  },
  {
    name: "Flaxseed Meal",
    emoji: "🟤", benefit: "high", category: "gelling",
    replaces: "Methylcellulose (E461), Egg (as binder), Modified Starch",
    alsoKnownAs: "Ground flaxseed, linseed meal, flax egg",
    whyGood: "Mixed with water, forms a mucilaginous gel equivalent to egg as a binder — 100% vegan, zero processing. Simultaneously delivers 28% of daily omega-3 ALA, lignans (anti-cancer phytoestrogens), and soluble fibre. The binding function is almost incidental to the nutritional profile.",
    holyUse: "Used as a vegan egg replacement in baked and bound products. A single tablespoon replaces an egg and adds significant nutrition.",
    gradient: "from-amber-700 to-stone-600",
  },
  {
    name: "Tapioca Starch",
    emoji: "🌿", benefit: "medium", category: "gelling",
    replaces: "Modified Corn Starch (E1412, E1442), Waxy Maize, Wheat Starch",
    alsoKnownAs: "Cassava starch, tapioca flour, manioc starch",
    whyGood: "Naturally gluten-free starch from cassava root with no chemical modification needed. Creates a clean, neutral-tasting gel, chew, or crisp depending on application. No solvent treatment, no acid modification — processed by mechanical extraction only.",
    holyUse: "Used in gummies for the satisfying chew and in coatings for crispness. One ingredient that does the same job as three modified starches.",
    gradient: "from-stone-300 to-amber-200",
  },

  // ── CLEAN EMULSIFIERS ──────────────────────────────────────────────────────
  {
    name: "Sunflower Lecithin",
    emoji: "🌻", benefit: "high", category: "emulsifiers",
    replaces: "Soy Lecithin (E322, often GMO), PGPR (E476), Polysorbate 80 (E433)",
    alsoKnownAs: "Sunflower phospholipids, non-GMO lecithin, E322 (sunflower)",
    whyGood: "Provides phosphatidylcholine — a precursor to acetylcholine (brain neurotransmitter). Non-GMO, cold-pressed from sunflower seeds with no solvent extraction. Soy lecithin (the alternative) is often hexane-extracted from GMO soy. PGPR is a synthetic ester with zero nutritional value.",
    holyUse: "Our standard emulsifier in chocolate products. The phosphatidylcholine content is a genuine cognitive health bonus.",
    scienceFact: "Phosphatidylcholine from lecithin is converted to choline in the body — essential for fetal brain development and adult cognitive function.",
    gradient: "from-yellow-400 to-amber-300",
  },
  {
    name: "Organic Soy Lecithin (Non-GMO)",
    emoji: "🌱", benefit: "medium", category: "emulsifiers",
    replaces: "PGPR (E476), Polysorbate 60 (E435), Polysorbate 80 (E433)",
    alsoKnownAs: "E322 (soy), non-GMO soy phospholipids, organic lecithin",
    whyGood: "When certified organic and non-GMO, soy lecithin is a genuine nutritional emulsifier (not a synthetic shortcut). Provides choline, phosphatidylinositol (cell membrane component), and phosphatidylethanolamine. The key distinction from conventional soy lecithin is no hexane extraction and no GMO concerns.",
    holyUse: "Used only when sunflower lecithin is unavailable. We require non-GMO certification and cold-press extraction as minimum standards.",
    gradient: "from-green-500 to-lime-400",
  },
  {
    name: "Beeswax",
    emoji: "🐝", benefit: "high", category: "emulsifiers",
    replaces: "Carnauba Wax (E903), Shellac (E904), Synthetic Glazing Agents (E901–E905 range)",
    alsoKnownAs: "Cera alba, white beeswax, yellow beeswax, E901",
    whyGood: "A natural wax produced by honeybees as a product of their lifecycle — not an industrial or synthetic process. Used as a glazing and sealing agent on coatings, it contains flavonoids, vitamin A, and anti-microbial properties. Carnauba wax (the synthetic alternative in many 'natural' products) is harvested from palm leaves using chemical bleaching.",
    holyUse: "Used to create a protective seal on certain coatings and gummies. Every coating it provides is from a natural, traceable source.",
    gradient: "from-yellow-500 to-amber-400",
  },

  // ── SUPERFOODS ─────────────────────────────────────────────────────────────
  {
    name: "Raw Cacao",
    emoji: "🍫", benefit: "high", category: "superfoods",
    replaces: "Processed Cocoa Powder, Dutch-Processed Cocoa, Milk Chocolate Compound",
    alsoKnownAs: "Theobroma cacao, cacao nibs, raw cacao powder, unprocessed cocoa",
    whyGood: "Raw cacao retains flavanols (epicatechin, catechin) that are destroyed by alkalisation ('Dutching'). These flavanols improve blood flow, lower blood pressure, enhance mood via PEA (phenylethylamine), and feed beneficial gut bacteria. Dutch-processed cocoa tastes milder because its beneficial compounds have been chemically destroyed.",
    holyUse: "We use only raw or minimally processed cacao. The darker taste is not a compromise — it is the proof that the flavanols are intact.",
    scienceFact: "The Kuna people of Panama, who drink 5 cups of flavanol-rich cacao daily, have an 8× lower incidence of cardiovascular disease than the mainland Panamanian population.",
    gradient: "from-amber-900 to-stone-800",
  },
  {
    name: "Spirulina (Superfood)",
    emoji: "💚", benefit: "high", category: "superfoods",
    replaces: "Synthetic Protein Supplements, Synthetic B12, Artificial Green Colouring",
    alsoKnownAs: "Arthrospira platensis, blue-green algae, spirulina powder",
    whyGood: "Gram for gram, the most nutrient-dense food on earth. 60–70% protein by weight, complete amino acid profile, the only plant source of true B12, plus phycocyanin (potent antioxidant), iron, GLA, and beta-carotene. A single gram outperforms most synthetic supplements.",
    holyUse: "Used in green-coloured and high-protein products. The colour it produces is proof of its phycocyanin content — the most valuable compound it contains.",
    scienceFact: "NASA proposed spirulina as an ideal food for space travel due to its nutrient density — the highest per gram of any known food substance.",
    gradient: "from-teal-600 to-green-500",
  },
  {
    name: "Maca Root Powder",
    emoji: "⚡", benefit: "high", category: "superfoods",
    replaces: "Artificial Energy Supplements, Caffeine Powder, Synthetic Libido Enhancers",
    alsoKnownAs: "Lepidium meyenii, Peruvian ginseng, maca extract",
    whyGood: "An adaptogen — reduces cortisol and stress hormones while improving energy, endurance, and hormonal balance without stimulants. Contains glucosinolates and macamides — compounds unique to maca with no synthetic equivalent. Used by Andean warriors for millennia before modern sports science confirmed its effects.",
    holyUse: "Used in energy and endurance products as a stimulant-free performance ingredient. The energy is metabolic, not chemical.",
    scienceFact: "Maca root increased cycling time-trial performance by 10% in male cyclists in a randomised crossover trial — comparable to conventional training adaptations.",
    gradient: "from-amber-600 to-yellow-500",
  },
  {
    name: "Acai Powder",
    emoji: "🫐", benefit: "high", category: "superfoods",
    replaces: "Artificial Berry Flavour, Grape Extract (used as cheap substitute), Synthetic Anthocyanins",
    alsoKnownAs: "Euterpe oleracea, acaí berry, freeze-dried acai",
    whyGood: "ORAC score (antioxidant capacity) of 15,000+ μmol TE/100g — among the highest of any food. Rich in anthocyanins, oleic acid (healthy fat), and ellagic acid. The flavour is genuinely complex — dark chocolate, blackberry, and red wine notes that no artificial berry flavour replicates.",
    holyUse: "Used in superfood bars and berry-flavoured lines. The purple-black colour is natural proof of anthocyanin density.",
    gradient: "from-purple-800 to-indigo-700",
  },
  {
    name: "Chlorella",
    emoji: "🟢", benefit: "high", category: "superfoods",
    replaces: "Synthetic Multivitamins, Artificial Green Colouring, Synthetic Iron Supplements",
    alsoKnownAs: "Chlorella vulgaris, green algae, chlorella pyrenoidosa, CGF",
    whyGood: "Contains Chlorella Growth Factor (CGF) — a nucleotide-peptide complex that accelerates tissue repair and immune function. One of the few foods with Vitamin B12 in an active form. Chlorophyll content is 10× higher than wheatgrass — the most potent detoxification pigment in food.",
    holyUse: "Used in green superfood blends. A natural whole food that covers micronutrient gaps no synthetic supplement can fully replicate.",
    scienceFact: "Chlorella supplementation reduced dioxin concentration in breast milk by 30% in lactating Japanese women in a 2007 peer-reviewed study — a measurable heavy metal chelation effect.",
    gradient: "from-green-700 to-teal-600",
  },
  {
    name: "Baobab Powder",
    emoji: "🌳", benefit: "high", category: "superfoods",
    replaces: "Synthetic Vitamin C, Citric Acid (as flavouring), Artificial Sour Flavour",
    alsoKnownAs: "Adansonia digitata, African baobab, monkey bread fruit powder",
    whyGood: "The fruit pulp dries naturally on the tree — the powder is essentially a whole food with zero processing. Contains 6× more Vitamin C than oranges, more calcium than milk, more potassium than bananas, and prebiotic fibre that feeds gut Lactobacillus. The sour flavour is the natural taste of ascorbic acid and malic acid.",
    holyUse: "Used for natural sourness and Vitamin C enrichment without any synthetic additives. The flavour is the nutrition.",
    scienceFact: "Baobab prebiotic fibre significantly increases Lactobacillus rhamnosus GG survival in the gut compared to inulin — making it one of the most effective prebiotic fruit powders studied.",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    name: "Raw Cacao Butter",
    emoji: "🤍", benefit: "high", category: "superfoods",
    replaces: "Refined Cocoa Butter, Palm Kernel Oil, Hydrogenated Coconut Fat, Confectionary Fat",
    alsoKnownAs: "Theobroma oil, cocoa fat, unrefined cacao butter",
    whyGood: "Cold-pressed from cacao beans — retains polyphenols and the full flavour spectrum. Rich in stearic acid (a saturated fat that does not raise LDL), oleic acid (heart-healthy monounsaturated), and palmitic acid. Natural, stable at room temperature without hydrogenation. Forms the base of all real chocolate.",
    holyUse: "The fat base of all our chocolate products. Never deodorised, never bleached — you taste the cacao terroir in every batch.",
    gradient: "from-amber-100 to-yellow-100",
  },

  // ── PLANT PROTEINS ─────────────────────────────────────────────────────────
  {
    name: "Pea Protein (Non-GMO)",
    emoji: "💛", benefit: "high", category: "proteins",
    replaces: "Soy Protein Isolate (GMO), Casein, Whey Protein (conventional factory farming)",
    alsoKnownAs: "Pea protein isolate, Pisum sativum protein, yellow split pea protein",
    whyGood: "Complete amino acid profile with high leucine content — triggers muscle protein synthesis. Non-GMO, allergen-free, no hexane extraction in premium grades. Zero cholesterol, zero saturated fat. Clinically shown to produce equivalent muscle gains to whey protein in resistance-trained individuals.",
    holyUse: "Used in protein bars and high-protein snacks. The neutral flavour and clean label make it our preferred animal-free protein.",
    scienceFact: "A 2015 double-blind randomised trial found pea protein produced statistically equivalent bicep muscle thickness gains to whey protein after 12 weeks of resistance training.",
    gradient: "from-yellow-500 to-lime-400",
  },
  {
    name: "Hemp Protein",
    emoji: "🌿", benefit: "high", category: "proteins",
    replaces: "Soy Protein Isolate, Pea Protein (when omega-3 is needed), Whey Protein",
    alsoKnownAs: "Hemp seed protein, Cannabis sativa protein, hemp powder",
    whyGood: "Contains all 20 amino acids including all 9 essential — and delivers them alongside a 3:1 omega-6:omega-3 ratio and 30% dietary fibre. No chemical isolation process — mechanically pressed seeds only. Edestin protein (hemp-specific) is structurally closest to human blood plasma protein of any plant source.",
    holyUse: "Used in products where we want protein and omega-3 from a single ingredient. The earthy flavour pairs naturally with cacao and seed-based products.",
    scienceFact: "Edestin — the dominant protein in hemp — is a globulin protein that shares structural similarity to the immune globulins in human blood, potentially supporting immune response.",
    gradient: "from-green-600 to-lime-500",
  },
  {
    name: "Brown Rice Protein",
    emoji: "🌾", benefit: "medium", category: "proteins",
    replaces: "Casein Protein, Whey Protein, Soy Protein Isolate",
    alsoKnownAs: "Rice protein concentrate, sprouted brown rice protein",
    whyGood: "Hypoallergenic — no dairy, no soy, no gluten. Gentle on the gut. Sprouted forms have increased bioavailability and reduced phytic acid (which blocks mineral absorption in unsprouted grains). Pairs with pea protein to create a complete amino acid profile that rivals whey.",
    holyUse: "Used in combination with pea protein for complete amino acid coverage. The sprouted form is our preference for maximum bioavailability.",
    gradient: "from-amber-400 to-yellow-300",
  },
  {
    name: "Pumpkin Seed Protein",
    emoji: "🎃", benefit: "high", category: "proteins",
    replaces: "Soy Protein Isolate, Conventional Protein Powders",
    alsoKnownAs: "Pepita protein, Cucurbita pepo protein, pumpkin protein powder",
    whyGood: "Rich in zinc (immune function, testosterone support), magnesium, iron, and all essential amino acids. High in tryptophan — precursor to serotonin and melatonin. The fat removed during cold-pressing is captured separately — nothing is wasted or chemically treated.",
    holyUse: "Used in seed-based snacks and protein products where zinc and magnesium content is a selling point alongside the protein.",
    scienceFact: "Pumpkin seeds are one of the richest plant sources of zinc — a single 30g serving provides 20–30% of the RDA in a form that is more bioavailable than many supplements.",
    gradient: "from-orange-600 to-amber-500",
  },
  {
    name: "Sacha Inchi Protein",
    emoji: "⭐", benefit: "high", category: "proteins",
    replaces: "Conventional Protein Blends, Fish Oil + Protein Combinations, Soy Protein",
    alsoKnownAs: "Plukenetia volubilis, Inca peanut, mountain peanut protein",
    whyGood: "Contains 60% protein by weight and 48% omega-3 ALA — one of the only protein sources that simultaneously provides therapeutic omega-3 levels. Complete amino acid profile. Grown in the Peruvian Amazon without pesticides or irrigation. Zero processing beyond cold-pressing.",
    holyUse: "Used in ultra-premium protein products where omega-3 and protein density from a single source is the goal.",
    scienceFact: "Sacha inchi has a Protein Digestibility Corrected Amino Acid Score (PDCAAS) of 0.87 — comparable to meat and eggs — from a plant source with no processing chemicals.",
    gradient: "from-emerald-600 to-teal-500",
  },

  // ── PREBIOTIC FIBRES ───────────────────────────────────────────────────────
  {
    name: "Chicory Root Inulin",
    emoji: "🔵", benefit: "high", category: "fibres",
    replaces: "Maltodextrin (E1400), Polydextrose (E1200), Synthetic Fibre Fillers",
    alsoKnownAs: "Inulin, FOS (fructooligosaccharides), chicory fibre, oligofructose",
    whyGood: "The gold-standard prebiotic fibre — selectively feeds Bifidobacterium and Lactobacillus while starving pathogenic bacteria. Increases calcium absorption by up to 20% (clinical trials). Lowers fasting blood glucose. Provides bulk and a slightly sweet taste with zero calories from digestion. Maltodextrin (what it replaces) feeds pathogens and spikes blood sugar.",
    holyUse: "Used in our fibre-enriched products as a clean, functional filler that actively improves gut health rather than just adding weight.",
    scienceFact: "Chicory inulin at 5–10g/day increases faecal Bifidobacterium counts by 10-fold in randomised controlled trials — a prebiotic dose considered clinically meaningful.",
    gradient: "from-blue-700 to-indigo-600",
  },
  {
    name: "Oat Beta-Glucan",
    emoji: "🥣", benefit: "high", category: "fibres",
    replaces: "Refined Starch Fillers, Maltodextrin, Polydextrose, Synthetic Thickeners",
    alsoKnownAs: "Beta-glucan, oat fibre, cereal beta-glucan, (1,3)(1,4)-beta-D-glucan",
    whyGood: "The active fibre responsible for oats' cholesterol-lowering effect — FDA allows an explicit heart disease risk reduction claim for foods containing ≥0.75g beta-glucan per serving. Forms a viscous gel in the gut that traps cholesterol-containing bile acids and slows glucose absorption. Simultaneously feeds Lactobacillus and Bifidobacterium.",
    holyUse: "Used in oat-based bars and high-fibre products. Every gram of beta-glucan we include is clinically backed to improve cardiovascular markers.",
    scienceFact: "3g of oat beta-glucan daily (achievable in one serving) reduces LDL cholesterol by 5–10% — one of the most replicated findings in clinical nutrition.",
    gradient: "from-amber-400 to-yellow-300",
  },
  {
    name: "Acacia Fibre",
    emoji: "🌿", benefit: "high", category: "fibres",
    replaces: "Xanthan Gum (E415), Guar Gum (E412), Carboxymethyl Cellulose (E466)",
    alsoKnownAs: "Gum arabic, acacia gum, E414, Acacia senegal fibre",
    whyGood: "A prebiotic soluble fibre from the acacia tree sap — ancient food and medicine. Selectively feeds Bifidobacterium and Lactobacillus, while being particularly gentle on IBS-affected digestive systems (low FODMAP at normal doses). Forms a mild gel that stabilises emulsions. Xanthan gum (the alternative) is fermented by problematic bacteria in some people.",
    holyUse: "Used in products where a gentle, gut-friendly stabiliser is needed. The prebiotic benefit is more important than the texture function.",
    gradient: "from-lime-500 to-green-400",
  },
  {
    name: "Jerusalem Artichoke Powder",
    emoji: "🌻", benefit: "high", category: "fibres",
    replaces: "Maltodextrin, Polydextrose (E1200), Synthetic Sweetener + Fibre Combos",
    alsoKnownAs: "Topinambur, sunchoke, Helianthus tuberosus, FOS source",
    whyGood: "Contains 16–20% inulin and fructooligosaccharides by dry weight — among the highest of any vegetable. Feeds gut bacteria selectively, increases faecal Bifidobacterium by measurable amounts, and provides a mildly sweet taste (about 10% as sweet as sugar). Grown in temperate climates without pesticides.",
    holyUse: "Used in prebiotic-focused products where we need fibre, mild sweetness, and a clean label from one whole-food ingredient.",
    scienceFact: "Jerusalem artichoke supplementation for 4 weeks increased Bifidobacterium in 73% of test subjects and significantly reduced serum triglycerides.",
    gradient: "from-yellow-600 to-lime-500",
  },
  {
    name: "Resistant Starch (from Green Banana)",
    emoji: "🍌", benefit: "high", category: "fibres",
    replaces: "Refined Starch, Maltodextrin, Polydextrose, Digestible Carb Fillers",
    alsoKnownAs: "Green banana flour, unripe banana starch, type 2 resistant starch",
    whyGood: "Resists digestion in the small intestine and arrives intact in the colon, where it ferments to produce short-chain fatty acids (SCFAs) — particularly butyrate, the primary fuel for colon cells. Dramatically lowers the glycaemic index of any product it is added to. A starch that behaves like fibre.",
    holyUse: "Used in lower-glycaemic bars and snacks to reduce the blood sugar impact without reducing carbohydrate content on the label.",
    scienceFact: "Green banana resistant starch reduces postprandial blood glucose by up to 50% compared to the equivalent amount of digestible starch — validated in multiple human trials.",
    gradient: "from-green-400 to-lime-300",
  },
];

type BadIngredient = {
  name: string;
  emoji: string;
  danger: "high" | "medium" | "low";
  category: "sugars" | "colors" | "preservatives" | "fats" | "enhancers" | "packaging" | "minerals" | "processing" | "toxins" | "sweeteners" | "meats" | "starches" | "oils";
  hidesIn: string;
  whyBad: string;
  holyPromise: string;
  gradient: string;
  alsoKnownAs?: string;
  bannedIn?: string;
  eNumber?: string;
  points?: number;   // custom deduction on 1000-pt scale (overrides danger-based default)
};

type BadCategory = {
  id: string;
  label: string;
  labelLt: string;
  icon: string;
};

const BAD_CATEGORIES: BadCategory[] = [
  { id: "all",          label: "All Threats",          labelLt: "Visi",               icon: "☠️" },
  { id: "sugars",       label: "Sugars",               labelLt: "Cukrūs",             icon: "🍬" },
  { id: "colors",       label: "Artificial Colors",    labelLt: "Dažai",              icon: "🎨" },
  { id: "preservatives",label: "Preservatives",        labelLt: "Konservantai",       icon: "⚗️" },
  { id: "fats",         label: "Bad Fats",             labelLt: "Blogi riebalai",     icon: "🛢️" },
  { id: "enhancers",    label: "Flavor Tricks",        labelLt: "Skonio gudrybės",    icon: "🔬" },
  { id: "processing",   label: "Processing Chemicals", labelLt: "Gamybos chemikalai", icon: "🧫" },
  { id: "toxins",       label: "Hidden Toxins",        labelLt: "Paslėpti toksinai",  icon: "☣️" },
  { id: "packaging",    label: "Packaging Toxins",     labelLt: "Pakuotės toksinai",  icon: "📦" },
  { id: "minerals",     label: "Mineral Deception",    labelLt: "Mineralų apgaulė",   icon: "🧂" },
  { id: "sweeteners",   label: "Artificial Sweeteners", labelLt: "Dirbtiniai saldikliai", icon: "🧪" },
  { id: "meats",        label: "Processed Meat Chem.",  labelLt: "Mėsos chemikalai",      icon: "🥩" },
  { id: "starches",     label: "Refined Starches",      labelLt: "Rafinuoti krakmolai",   icon: "🌾" },
  { id: "oils",         label: "Refined Seed Oils",     labelLt: "Rafinuoti augaliniai aliejai", icon: "🫙" },
];

const BAD_INGREDIENTS: BadIngredient[] = [

  // ── SUGARS & SWEETENERS ───────────────────────────────────────────────────
  {
    name: "Refined Sugar",
    emoji: "🍬", danger: "high", category: "sugars",
    alsoKnownAs: "Sucrose, sugar, white sugar, cane sugar, beet sugar, table sugar, brown sugar, raw sugar, invert sugar, invert cane syrup, added sugars, sugar syrup, confectioner's sugar, powdered sugar, icing sugar, caster sugar, granulated sugar",
    hidesIn: "Sodas, cereals, yogurts, pasta sauces, protein bars, 'healthy' granola",
    whyBad: "Spikes blood sugar and insulin, fuels chronic inflammation, feeds harmful gut bacteria, and is directly linked to obesity, type 2 diabetes, and cardiovascular disease. Activates the same dopamine pathways as cocaine in animal studies — by design.",
    holyPromise: "We sweeten only with coconut sugar, medjool dates, or real fruit concentrates — low GI and packed with minerals.",
    gradient: "from-red-800 to-pink-700",
  },
  {
    name: "High-Fructose Corn Syrup",
    emoji: "🌽", danger: "high", category: "sugars",
    points: 300, // worst sugar: directly causes fatty liver, bypasses satiety
    alsoKnownAs: "HFCS, glucose-fructose syrup, isoglucose, corn sweetener",
    bannedIn: "Restricted in several EU countries due to production quotas; effectively limited",
    hidesIn: "Sodas, candy, ketchup, bread, salad dressings, fruit juices, cereals",
    whyBad: "Processed directly by the liver into fat, bypassing normal satiety signals. Strongly linked to non-alcoholic fatty liver disease, metabolic syndrome, and insulin resistance. Your body has no 'off switch' for fructose — so you keep eating.",
    holyPromise: "Zero corn syrup in any HolySnacks product. Ever. Full stop.",
    gradient: "from-orange-800 to-red-700",
  },
  {
    name: "Aspartame",
    emoji: "🧪", danger: "high", category: "sugars",
    points: 240, // WHO IARC Group 2B possible carcinogen (2023 reclassification)
    eNumber: "E951",
    alsoKnownAs: "NutraSweet, Equal, AminoSweet, Canderel",
    bannedIn: "Classified as 'possibly carcinogenic to humans' (Group 2B) by WHO/IARC in 2023",
    hidesIn: "Diet sodas, sugar-free gum, 'light' yogurts, protein shakes, sugar-free sweets",
    whyBad: "Classified a possible carcinogen by WHO in 2023. Breaks down into methanol, aspartic acid, and phenylalanine in the body. Linked to gut microbiome disruption, headaches, mood disorders, and paradoxically increases sweet cravings.",
    holyPromise: "Never here. Sweetness from monk fruit, organic stevia leaf, or raw fruit — always.",
    gradient: "from-purple-800 to-red-700",
  },
  {
    name: "Sucralose",
    emoji: "⚗️", danger: "medium", category: "sugars",
    eNumber: "E955",
    alsoKnownAs: "Splenda, chlorinated sugar",
    hidesIn: "Diet drinks, protein bars, 'zero sugar' products, baked goods, flavored syrups",
    whyBad: "Made by chlorinating sugar — 3 chlorine atoms added per molecule. Kills beneficial gut bacteria and reduces microbiome diversity. A 2023 study found it produces toxic compounds (chloropropanols) when heated during baking.",
    holyPromise: "No chlorinated anything in HolySnacks. Real sweetness only.",
    gradient: "from-pink-800 to-orange-700",
  },
  {
    name: "Acesulfame Potassium",
    emoji: "🔋", danger: "medium", category: "sugars",
    eNumber: "E950",
    alsoKnownAs: "Ace-K, Acesulfame K, Sweet One, Sunett",
    hidesIn: "Energy drinks, diet sodas, sugar-free desserts, protein powders, chewing gum",
    whyBad: "200× sweeter than sugar but metabolizes into acetoacetamide — a compound that may damage thyroid function. Animal studies show it alters gut microbiota and affects metabolic rate. Almost always blended with aspartame to mask its bitter aftertaste.",
    holyPromise: "We skip all synthetic sweeteners. If it doesn't grow from the earth, it's not in our products.",
    gradient: "from-orange-800 to-yellow-700",
  },
  {
    name: "Maltodextrin",
    emoji: "🌾", danger: "medium", category: "sugars",
    alsoKnownAs: "Modified food starch, glucose polymer, dextrin",
    hidesIn: "Protein powders, infant formula, packaged snacks, sauces, 'keto' bars",
    whyBad: "Has a glycemic index higher than table sugar (GI 110 vs. 65 for sugar). Suppresses beneficial gut bacteria, promotes pathogenic bacteria growth, and causes rapid blood sugar spikes — yet hides in countless 'sugar-free' products.",
    holyPromise: "We use whole-food carbs — oat flour, almond flour, coconut flour. No fillers. No spikes.",
    gradient: "from-yellow-700 to-orange-600",
  },

  // ── ARTIFICIAL COLORS ─────────────────────────────────────────────────────
  {
    name: "Red 40 (Allura Red)",
    emoji: "🔴", danger: "high", category: "colors",
    points: 220, // ADHD-linked, petroleum-derived, EU warning label required
    eNumber: "E129",
    alsoKnownAs: "Allura Red AC, FD&C Red No. 40, CI Food Red 17",
    bannedIn: "Banned or heavily restricted in Austria, Belgium, Denmark, France, Germany, Switzerland; carries EU warning label",
    hidesIn: "Gummies, sports drinks, cereals, maraschino cherries, gelatins, medications, fruit punch",
    whyBad: "Linked to ADHD and hyperactivity in children across multiple controlled studies. UK Food Standards Agency advises removing it from children's food. Contains benzidine — a carcinogen allowed only at 'trace' levels by the FDA. Derived from petroleum.",
    holyPromise: "Our red comes from beet juice and hibiscus extract — vibrant, real, and packed with antioxidants.",
    gradient: "from-red-700 to-rose-600",
  },
  {
    name: "Yellow 5 & Yellow 6",
    emoji: "🟡", danger: "high", category: "colors",
    points: 220, // coal-tar derived; EU mandatory warning label; ADHD-linked
    eNumber: "E102 / E110",
    alsoKnownAs: "Tartrazine (Y5), Sunset Yellow FCF (Y6), FD&C Yellow No. 5 & 6",
    bannedIn: "Must carry EU warning label: 'may have an adverse effect on activity and attention in children'",
    hidesIn: "Mac & cheese powder, chips, pickles, mustard, orange soda, cereal, energy drinks",
    whyBad: "Tartrazine triggers severe allergic reactions in aspirin-sensitive individuals. Both dyes are linked to hyperactivity in children. Sunset Yellow is derived from coal tar and has been associated with hives, asthma, and tumor growth in high-dose animal studies.",
    holyPromise: "Our yellows and oranges come from turmeric, carrot concentrate, and saffron extract. Real food, real color.",
    gradient: "from-yellow-600 to-orange-500",
  },
  // (Titanium Dioxide & Caramel Color E150d moved to ADDITIONAL COLORS section below — fuller versions kept)

  // ── PRESERVATIVES ─────────────────────────────────────────────────────────
  {
    name: "Sodium Benzoate",
    emoji: "💧", danger: "high", category: "preservatives",
    points: 230, // forms benzene (Group 1 carcinogen) when combined with vitamin C
    eNumber: "E211",
    alsoKnownAs: "Benzoate of soda, potassium benzoate (E212)",
    bannedIn: "Under heavy restriction across the EU; countries proactively phasing it out",
    hidesIn: "Soft drinks, pickles, fruit juices, condiments, soy sauce, salad dressings",
    whyBad: "Reacts with vitamin C (ascorbic acid) to form benzene — a known Group 1 carcinogen. Even at FDA-approved levels, the benzene formed can exceed the EPA's safe limit for drinking water. Also linked to ADHD, hyperactivity, and mitochondrial damage.",
    holyPromise: "We preserve with natural citric acid and rosemary extract — effective, proven, and completely safe.",
    gradient: "from-red-900 to-orange-700",
  },
  {
    name: "BHA & BHT",
    emoji: "🏭", danger: "medium", category: "preservatives",
    points: 260, // IARC Group 2B carcinogen; hormone disruptor; banned in several countries
    eNumber: "E320 / E321",
    alsoKnownAs: "Butylated Hydroxyanisole, Butylated Hydroxytoluene",
    bannedIn: "BHA banned in Japan; both restricted across the UK and EU",
    hidesIn: "Cereals, chips, vegetable oils, chewing gum, instant noodles, pet food, cosmetics",
    whyBad: "BHA is listed as a possible carcinogen (Group 2B) by the IARC. BHT has been linked to liver and kidney damage and thyroid disruption in animal studies. Both mimic estrogen and may disrupt hormonal balance, especially in children.",
    holyPromise: "Natural vitamin E (tocopherol) and rosemary extract keep our products fresh — no synthetic antioxidants needed.",
    gradient: "from-yellow-800 to-red-800",
  },
  {
    name: "TBHQ",
    emoji: "💀", danger: "high", category: "preservatives",
    eNumber: "E319",
    alsoKnownAs: "tert-Butylhydroquinone, tertiary butylhydroquinone",
    bannedIn: "Banned in Japan and heavily restricted in the EU; not permitted in infant foods anywhere",
    hidesIn: "Fast food frying oils, crackers, microwave popcorn, frozen fish, instant noodles",
    whyBad: "At low doses it's 'approved', but TBHQ metabolizes into a compound causing oxidative DNA damage. Animal studies link it to liver tumors, vision disturbances, and convulsions at higher doses. The FDA allows only 0.02% in food — because more would be overtly toxic.",
    holyPromise: "Our oils are cold-pressed and consumed fresh. We never need TBHQ.",
    gradient: "from-red-950 to-rose-800",
  },
  {
    name: "Sodium Nitrate & Nitrite",
    emoji: "🥩", danger: "high", category: "preservatives",
    eNumber: "E250 / E251",
    alsoKnownAs: "Sodium nitrite (E250), sodium nitrate (E251), curing salt, pink curing salt",
    bannedIn: "WHO/IARC classifies processed meats containing these as Group 1 carcinogens — same as tobacco and asbestos",
    hidesIn: "Bacon, ham, hot dogs, all deli meats, beef jerky, canned corned beef, pepperoni",
    whyBad: "In the body, nitrites react with amines from protein to form nitrosamines — potent carcinogens. The WHO classifies processed meats containing these additives as definitively causing bowel cancer. Consumption of just 50g per day increases colorectal cancer risk by 18%.",
    holyPromise: "HolySnacks doesn't use cured meats. Where we preserve, we use real sea salt and natural fermentation cultures.",
    gradient: "from-rose-900 to-red-700",
  },
  {
    name: "Potassium Bromate",
    emoji: "🍞", danger: "high", category: "preservatives",
    points: 300, // IARC Group 2B carcinogen; banned in EU, Canada, UK, China, and many others
    eNumber: "E924",
    alsoKnownAs: "Bromate, bread improver, flour treatment agent",
    bannedIn: "Banned in EU, UK, Canada, Brazil, China, India, Nigeria, Sri Lanka. Still legal in the USA.",
    hidesIn: "Commercial bread, flour, bread rolls, pizza dough, crackers, bread crumbs",
    whyBad: "A possible human carcinogen (IARC Group 2B). Supposed to bake off during cooking, but studies show residue remains. Linked to kidney damage and thyroid tumors in animal studies. Banned in almost every developed nation — but not the United States.",
    holyPromise: "Our baked goods use naturally leavened sourdough and certified organic flours. No bromates, ever.",
    gradient: "from-amber-900 to-red-800",
  },
  {
    name: "Sulfites",
    emoji: "🍷", danger: "medium", category: "preservatives",
    eNumber: "E220–E228",
    alsoKnownAs: "Sulphur dioxide (E220), sodium bisulfite, potassium metabisulfite, sulfur dioxide",
    hidesIn: "Wine, dried fruits, shrimp, condiments, pickles, canned vegetables, vinegar, fruit juices",
    whyBad: "Trigger asthma attacks and severe allergic reactions in 1 in 100 people. Can cause hives, nausea, and anaphylaxis in sulfite-sensitive individuals. Must be declared on EU labels above 10mg/kg — but manufacturers routinely use just below that threshold.",
    holyPromise: "We dry our fruits naturally, in the sun or with gentle heat. No sulfite blanching. No shortcuts.",
    gradient: "from-purple-700 to-red-700",
  },

  // ── BAD FATS ──────────────────────────────────────────────────────────────
  {
    name: "Trans Fats",
    emoji: "🛢️", danger: "high", category: "fats",
    points: 300, // banned in most developed nations; zero safe consumption level
    alsoKnownAs: "Partially hydrogenated oils (PHO), hydrogenated fat, shortening, hardened vegetable fat",
    bannedIn: "Banned in the USA (2018), across the EU, Canada, Denmark, Switzerland, and most developed nations",
    hidesIn: "Margarine, packaged biscuits, fast food, commercial baked goods, non-dairy creamers, frosting",
    whyBad: "Raises LDL ('bad') cholesterol while simultaneously lowering HDL ('good') cholesterol. The FDA estimated trans fats caused 20,000 heart attacks and 7,000 deaths annually before the ban. There is no safe level of consumption — even tiny amounts cause harm.",
    holyPromise: "Only extra-virgin olive oil and cold-pressed coconut oil. Both unrefined, both traceable to source.",
    gradient: "from-gray-800 to-red-800",
  },
  {
    name: "Palm Oil",
    emoji: "🌴", danger: "medium", category: "fats",
    alsoKnownAs: "Vegetable oil (often unlabeled), palm fat, palm kernel oil, palm kernel, palmitate, palm olein, vegetable fat (palm), refined palm, stearic acid (sometimes)",
    hidesIn: "Chocolate spreads, biscuits, instant noodles, margarine, ice cream, pizza, most packaged baked goods",
    whyBad: "Responsible for catastrophic deforestation in Indonesia and Malaysia, destroying orangutan habitats. Highly refined palm oil contains glycidyl esters — potential carcinogens formed during high-temperature processing. Raises LDL cholesterol comparably to trans fats.",
    holyPromise: "RSPO certified sustainable if absolutely required — otherwise we use shea butter, coconut oil, or skip it entirely.",
    gradient: "from-green-900 to-red-800",
  },
  {
    name: "Industrial Canola Oil",
    emoji: "🧴", danger: "medium", category: "fats",
    alsoKnownAs: "Rapeseed oil, vegetable oil, LEAR oil, low erucic acid rapeseed",
    hidesIn: "Chips, crackers, salad dressings, margarine, most 'vegetable oils', restaurant frying",
    whyBad: "Requires chemical extraction with hexane — an industrial solvent. Extremely high in omega-6 fatty acids, further worsening the already imbalanced omega-6:omega-3 ratio in modern diets. This promotes systemic inflammation. Often GMO and highly refined.",
    holyPromise: "We use only extra-virgin olive oil and cold-pressed coconut oil. No industrial seed oils. Ever.",
    gradient: "from-yellow-700 to-orange-700",
  },

  // ── FLAVOR TRICKS ─────────────────────────────────────────────────────────
  {
    name: "MSG",
    emoji: "🔬", danger: "medium", category: "enhancers",
    eNumber: "E621",
    alsoKnownAs: "Monosodium glutamate, yeast extract, hydrolyzed protein, autolyzed yeast, glutamic acid, 'natural flavor'",
    hidesIn: "Chips, instant noodles, fast food, seasoning packets, frozen meals, restaurant soups",
    whyBad: "Overstimulates glutamate receptors in the brain. Triggers 'MSG symptom complex' in sensitive people — headaches, facial pressure, sweating, nausea. More critically, it's hidden under 20+ label aliases, making informed avoidance nearly impossible for most consumers.",
    holyPromise: "Our flavor comes from slow-roasted spices, real herbs, and natural fermentation. Nothing manufactured in a lab.",
    gradient: "from-orange-900 to-red-700",
  },
  {
    name: '"Natural Flavors" / Artificial Flavor',
    emoji: "🎭", danger: "medium", category: "enhancers",
    alsoKnownAs: "Natural flavoring, natural flavor, artificial flavor, artificial flavors, artificial and natural flavors, natural and artificial flavors, natural and artificial flavor, artificial colour, artificial color, FTNF (from the named fruit)",
    hidesIn: "Almost everything in a box, bag, or can — it is the 4th most common ingredient in the US food supply",
    whyBad: "The FDA's definition of 'natural flavor' legally covers 2,000+ substances — including beaver anal secretions (castoreum), insect derivatives, and heavily processed chemical compounds. It's a black box that hides MSG, allergens, and synthetic additives behind a 'natural' label.",
    holyPromise: "We list every ingredient by its real name, in plain language. No 'natural flavors'. No black boxes. No hiding.",
    gradient: "from-indigo-800 to-red-700",
  },
  // (Carrageenan entry moved to ADDITIONAL PRESERVATIVES section below — fuller version kept)

  // ── PACKAGING TOXINS ──────────────────────────────────────────────────────
  {
    name: "BPA",
    emoji: "🧴", danger: "high", category: "packaging",
    alsoKnownAs: "Bisphenol A, BPS (the 'safer' replacement — equally dangerous), polycarbonate plastic",
    bannedIn: "Banned in baby bottles across the EU, Canada, USA; stricter limits proposed for all food contact materials in EU",
    hidesIn: "Plastic food packaging, can linings, thermal receipt paper, reusable plastic bottles, plastic wrapping",
    whyBad: "A potent endocrine disruptor that mimics estrogen. Linked to breast and prostate cancer, infertility, obesity, ADHD, and early puberty. Leaches from packaging into food — especially when heated. 'BPA-free' plastics replaced it with BPS and BPF, which show identical hormonal disruption.",
    holyPromise: "HolySnacks uses glass jars, uncoated paper, and certified BPA-free packaging where plastic is unavoidable.",
    gradient: "from-blue-900 to-red-800",
  },
  {
    name: "PFAS (Forever Chemicals)",
    emoji: "☢️", danger: "high", category: "packaging",
    alsoKnownAs: "Per- and polyfluoroalkyl substances, Teflon, PTFE, GenX chemicals, C8",
    bannedIn: "Active legislation in the EU; restricted in food packaging in Denmark, Germany and multiple US states",
    hidesIn: "Microwave popcorn bags, fast food wrappers, grease-proof paper, pizza boxes, non-stick cookware",
    whyBad: "Called 'forever chemicals' because they never break down in the environment or the human body. Detected in the blood of 97% of Americans tested. Linked to kidney cancer, thyroid disease, immune suppression, high cholesterol, and pregnancy complications. They migrate from packaging directly into food.",
    holyPromise: "Our packaging is PFAS-free certified. What touches your food matters just as much as what's in it.",
    gradient: "from-green-900 to-red-900",
  },

  // ── MINERAL DECEPTION ────────────────────────────────────────────────────
  {
    name: "Refined Table Salt",
    emoji: "🧂", danger: "medium", category: "minerals",
    alsoKnownAs: "Processed sodium chloride, iodized salt, sea salt (when heavily refined)",
    hidesIn: "Chips, crackers, all canned foods, processed meats, fast food, commercial bread",
    whyBad: "Stripped of 80+ natural trace minerals during refining. Typically contains anti-caking agents (sodium aluminosilicate, potassium ferrocyanide) and bleaching agents. Excessive intake from refined salt is directly linked to hypertension, stroke, and kidney disease.",
    holyPromise: "Only Himalayan pink salt or Celtic grey sea salt — both mineral-rich, unrefined, and naturally stunning.",
    gradient: "from-slate-700 to-red-700",
  },
  {
    name: "Fluoride (excess)",
    emoji: "🦷", danger: "low", category: "minerals",
    alsoKnownAs: "Sodium fluoride, hydrofluorosilicic acid, fluorosilicate, stannous fluoride",
    hidesIn: "Toothpaste, fluoridated tap water (US, UK, some EU cities), some non-organic teas, Teflon cookware",
    whyBad: "Trace fluoride aids dental health, but chronic overexposure causes dental fluorosis (brown spots, weakened enamel) and skeletal fluorosis. Long-term high intake has been linked to thyroid disruption, lower IQ in children (Harvard meta-analysis, 2012), and pineal gland calcification.",
    holyPromise: "HolySnacks snacks are naturally fluoride-free. We only include what genuinely belongs in food.",
    gradient: "from-blue-900 to-red-800",
  },
  {
    name: "Aluminum Compounds",
    emoji: "🔩", danger: "low", category: "minerals",
    eNumber: "E173 / E541",
    alsoKnownAs: "Sodium aluminum phosphate, aluminum silicate, alum, aluminum lake (in food dyes)",
    bannedIn: "EFSA lowered the tolerable weekly intake in 2008; under review for further restrictions",
    hidesIn: "Baking powder, processed cheese slices, commercial cakes, some food colorings, anti-caking agents in salt",
    whyBad: "Accumulates in brain tissue over a lifetime. Associated with neurotoxicity and implicated as a contributing factor in Alzheimer's disease research. The EFSA reduced its safe weekly intake because Europeans were routinely exceeding it through normal diet. Particularly concerning in infant formula.",
    holyPromise: "We use aluminum-free baking powder and real plant colorants. No heavy metal contamination from any source.",
    gradient: "from-gray-700 to-red-700",
  },

  // ── MORE SUGARS ───────────────────────────────────────────────────────────
  {
    name: "Saccharin",
    emoji: "🧪", danger: "medium", category: "sugars",
    eNumber: "E954",
    alsoKnownAs: "Sodium saccharin, Sweet'N Low, Sugar Twin, Hermesetas",
    bannedIn: "FDA attempted to ban it in 1977; WHO/IARC reclassified it as Group 2B possible carcinogen in 2023",
    hidesIn: "Diet sodas, tabletop sweeteners, toothpaste, vitamins, canned fruit, sugar-free jams, medications",
    whyBad: "The oldest synthetic sweetener (1879), made from petroleum. Bladder tumors in rats at high doses triggered a near-ban in 1977. A landmark 2022 Cell study (Suez et al.) proved it induces glucose intolerance and disrupts gut microbiome in healthy humans — a controlled trial. WHO's IARC classified it as a possible carcinogen in 2023.",
    holyPromise: "We sweeten with coconut sugar, real fruit, and monk fruit extract. Nothing invented in a petroleum lab.",
    gradient: "from-pink-900 to-red-700",
  },
  {
    name: "Cyclamate",
    emoji: "⚗️", danger: "high", category: "sugars",
    eNumber: "E952",
    alsoKnownAs: "Sodium cyclamate, calcium cyclamate, cyclamic acid",
    bannedIn: "Banned in the USA since 1969; Canada since 1977; still permitted in EU and ~100 other countries",
    hidesIn: "Diet drinks (outside USA), sugar-free products, tabletop sweeteners, canned fruit, pharmaceuticals",
    whyBad: "Banned by the FDA in 1969 after studies showed bladder cancer in rats. Some gut bacteria metabolize cyclamate into cyclohexylamine — a compound shown to damage testicles and affect reproductive health in animals. Petitions to reinstate it in the USA have been repeatedly rejected. Still widely used in Europe and Asia.",
    holyPromise: "No cyclamate, ever. A sweetener banned for 55 years in the USA has no place in a product that calls itself Holy.",
    gradient: "from-rose-900 to-orange-800",
  },

  // ── MORE ARTIFICIAL COLORS ────────────────────────────────────────────────
  {
    name: "Carmine (Cochineal)",
    emoji: "🐛", danger: "medium", category: "colors",
    eNumber: "E120",
    alsoKnownAs: "Cochineal extract, carminic acid, natural red 4, crimson lake",
    hidesIn: "Strawberry yogurt, red fruit juices, maraschino cherries, some red lipstick, pink grapefruit drinks, sausage casings",
    whyBad: "Made by crushing 70,000 female cochineal insects to produce 1 pound of dye. Triggers severe allergic reactions including anaphylaxis — the FDA received reports of fatal reactions. Despite being labeled as 'natural color', it is an animal product, making it unsuitable for vegans, vegetarians, and those with insect allergies. Most consumers have no idea their 'strawberry' yogurt contains crushed insects.",
    holyPromise: "Our red comes from beet juice and hibiscus — vibrant, truly plant-based, genuinely natural.",
    gradient: "from-red-800 to-rose-600",
  },
  {
    name: "Red 3 (Erythrosine)",
    emoji: "🍒", danger: "high", category: "colors",
    eNumber: "E127",
    alsoKnownAs: "FD&C Red No. 3, erythrosine B, cherry red, iodine red",
    bannedIn: "FDA banned it from cosmetics and externally applied drugs in 1990 due to thyroid cancer risk — but still permits it in food. EU requires warning label for children's food.",
    hidesIn: "Maraschino cherries, cocktail cherries, canned fruit cocktail, some ice cream, pink-dyed pistachio shells",
    whyBad: "A cherry-pink petroleum-derived dye. The FDA banned it from cosmetics in 1990 because it caused thyroid tumors in animal studies. Yet the same dye remains legal in food — a regulatory inconsistency widely criticized by scientists. Contains iodine, which can interfere with thyroid function even at permitted levels.",
    holyPromise: "We color with real cherries and hibiscus. If we wouldn't put something on your skin, it doesn't go in your food.",
    gradient: "from-red-700 to-pink-600",
  },
  {
    name: "Blue 1 (Brilliant Blue)",
    emoji: "🔵", danger: "medium", category: "colors",
    points: 180, // banned in 6 EU countries; petroleum-derived; EU warning label required
    eNumber: "E133",
    alsoKnownAs: "Brilliant Blue FCF, FD&C Blue No. 1, Acid Blue 9",
    bannedIn: "Banned in Belgium, France, Germany, Greece, Norway, Spain, Switzerland; EU requires warning label",
    hidesIn: "Sports drinks, popsicles, ice cream, canned peas, blue candy, some medications, cereals",
    whyBad: "A petroleum-derived synthetic dye containing benzene sulfonates. Animal studies show it can cross the blood-brain barrier and the gut-brain barrier. Linked to kidney tumors in mice at high doses. Its bright blue color has zero nutritional value and serves only to make food visually appealing. Banned across multiple European countries.",
    holyPromise: "We use spirulina extract for blue and blue-green tones — a superfood that adds color and nutrition simultaneously.",
    gradient: "from-blue-800 to-indigo-700",
  },
  {
    name: "Quinoline Yellow",
    emoji: "🟨", danger: "medium", category: "colors",
    eNumber: "E104",
    alsoKnownAs: "Food Yellow 13, Acid Yellow 3, D&C Yellow No. 10",
    bannedIn: "Banned in the USA, Australia, Japan, and Norway; EU requires children's hyperactivity warning label",
    hidesIn: "Smoked fish, some scotch eggs, certain pickles, medications, hair dye, some sparkling drinks in EU",
    whyBad: "A dull greenish-yellow coal tar dye. Linked to hyperactivity in children in the same McCann Southampton Study (2007) that influenced EU-wide warning labels. Possible DNA damage in in-vitro studies. Banned in multiple countries, yet manufacturers still use it where permitted — purely for cosmetic appearance.",
    holyPromise: "Our yellows come from turmeric and carrot concentrate. Nature has been making beautiful yellows for millions of years.",
    gradient: "from-yellow-700 to-amber-600",
  },

  // ── MORE PRESERVATIVES ────────────────────────────────────────────────────
  {
    name: "Propyl Gallate",
    emoji: "🏭", danger: "medium", category: "preservatives",
    eNumber: "E310",
    alsoKnownAs: "Propyl 3,4,5-trihydroxybenzoate, PG",
    hidesIn: "Vegetable oils, chewing gum base, meat products, baked goods, snack foods, some cereals",
    whyBad: "A synthetic antioxidant added to fat-containing foods to prevent rancidity. Animal studies link it to liver and kidney damage, thyroid issues, and possible carcinogenicity. Listed as a suspected endocrine disruptor by the EU. Almost always found alongside BHA and BHT — a triple-threat combination of synthetic preservatives.",
    holyPromise: "Natural rosemary extract and vitamin E keep our fats fresh. No synthetic antioxidants that need toxicology disclaimers.",
    gradient: "from-amber-800 to-red-700",
  },
  {
    name: "Calcium Propionate",
    emoji: "🍞", danger: "medium", category: "preservatives",
    eNumber: "E282",
    alsoKnownAs: "Sodium propionate (E281), calcium propanoate, propionic acid salt",
    hidesIn: "Virtually all commercial bread, packaged baked goods, pizza bases, English muffins, tortillas, some dairy products",
    whyBad: "The mold inhibitor in almost every loaf of supermarket bread. A 2002 Australian study found calcium propionate caused significant increases in irritability, restlessness, inattention and sleep disturbance in children in a double-blind controlled trial. Also linked to migraines in sensitive adults. It's in nearly every slice of commercially produced bread.",
    holyPromise: "Our baked goods use natural sourdough fermentation — the lactic acid produced keeps mold away naturally, the way bread has been made for 5,000 years.",
    gradient: "from-orange-800 to-red-700",
  },
  {
    name: "Potassium Sorbate",
    emoji: "🧫", danger: "low", category: "preservatives",
    eNumber: "E202",
    alsoKnownAs: "Sorbic acid (E200), potassium sorbate, 2,4-hexadienoic acid salt",
    hidesIn: "Wine, cheese, dried fruits, yogurt, deli meats, fruit juices, sauces, some baked goods",
    whyBad: "Generally considered one of the safer preservatives, but when combined with ascorbic acid (Vitamin C — very common in food and drinks), it forms mutagenic compounds in genotoxicity studies. DNA damage was observed in human white blood cells in vitro. The combination of E202 + Vitamin C, common in many 'healthy' fruit drinks, is potentially problematic.",
    holyPromise: "We preserve with salt, fermentation, and natural acidity. No synthetic sorbates combined with the vitamin C naturally present in our fruit ingredients.",
    gradient: "from-teal-800 to-red-700",
  },

  // ── PROCESSING CHEMICALS ──────────────────────────────────────────────────
  {
    name: "Azodicarbonamide (ADA)",
    emoji: "🧶", danger: "high", category: "processing",
    eNumber: "E927a",
    alsoKnownAs: "ADA, flour treatment agent, dough conditioner, 'yoga mat chemical'",
    bannedIn: "Banned in EU, UK, Australia, Singapore (up to $450,000 fine + 15 years prison in Singapore); banned in most of the developed world except the USA",
    hidesIn: "Commercial bread, burger buns, hot dog rolls, sandwich bread, wraps (Subway, McDonald's removed it after public pressure in 2014)",
    whyBad: "Used to bleach flour and condition dough — it's also used to make yoga mats, flip-flops, and shoe rubber. When baked, it breaks down into semicarbazide and urethane — both carcinogenic compounds. Banned across the developed world. Subway and McDonald's removed it from their bread in 2014 after public outcry, proving it was never necessary.",
    holyPromise: "Our bread is made with organic flour and sourdough — nothing that also appears in yoga mat manufacturing.",
    gradient: "from-green-900 to-red-800",
  },
  {
    name: "Brominated Vegetable Oil (BVO)",
    emoji: "🥤", danger: "high", category: "processing",
    alsoKnownAs: "BVO, brominated oil, citrus oil BVO",
    bannedIn: "Banned in EU, UK, Japan, India; FDA revoked GRAS (Generally Recognized As Safe) status in 2024",
    hidesIn: "Citrus-flavored sodas (Mountain Dew, some Fanta varieties, sports drinks, energy drinks)",
    whyBad: "Vegetable oil bonded with bromine atoms to stop citrus flavor from separating in drinks. Bromine accumulates in body fat, thyroid, and brain tissue over time. Linked to memory loss, nerve damage, and skin problems. The FDA used it for decades as 'generally safe' — then revoked that status in 2024. Banned in the EU since 1970. It took the FDA 54 more years to act.",
    holyPromise: "Our drinks use whole fruit concentrates with nothing to separate. No brominated chemistry required.",
    gradient: "from-orange-900 to-red-800",
  },
  {
    name: "Diacetyl (Artificial Butter)",
    emoji: "🧈", danger: "high", category: "processing",
    alsoKnownAs: "2,3-butanedione, acetyl methyl carbinol, artificial butter flavor, artificial popcorn flavor",
    bannedIn: "Several US states require labeling; EU restricts levels in food",
    hidesIn: "Microwave popcorn, artificial butter flavoring, some margarines, baked goods, flavored coffee, vape liquids",
    whyBad: "Causes bronchiolitis obliterans — 'popcorn lung' — a severe, irreversible lung disease. First documented in factory workers at a Missouri popcorn plant who developed permanent lung damage. Multiple lawsuits followed. Many manufacturers removed diacetyl from popcorn, but replaced it with 2,3-pentanedione and acetoin, which appear to cause the same damage. Consumers are exposed to it every time microwave popcorn is opened.",
    holyPromise: "Our snacks are flavored with real butter (where applicable), real herbs, and real spices. No artificial flavor that destroys lung tissue.",
    gradient: "from-yellow-800 to-red-700",
  },
  {
    name: "Acrylamide",
    emoji: "🍟", danger: "high", category: "processing",
    alsoKnownAs: "Not an additive — forms naturally during high-heat cooking of starchy foods",
    bannedIn: "IARC Group 2A: probably carcinogenic to humans. EU mandates reduction measures and monitoring. California requires Prop 65 cancer warning on products with high acrylamide.",
    hidesIn: "Potato chips, french fries, toast, crispy bread, breakfast cereals, coffee (roasting process), biscuits, roasted almonds, baby food (rusks)",
    whyBad: "Forms when starchy foods are cooked above 120°C — a reaction between asparagine (amino acid) and reducing sugars. IARC classifies it as a probable human carcinogen. Causes nerve damage at high doses. Definitively causes cancer in animal studies at dietary exposure levels. The darker/crispier the food, the more acrylamide it contains. It's in some of the most commonly eaten foods on earth.",
    holyPromise: "We bake at lower temperatures and use ingredients naturally lower in asparagine. Our chips are baked — not fried at 180°C. Less crunch, vastly safer chemistry.",
    gradient: "from-amber-700 to-red-700",
  },
  {
    name: "Propylene Glycol",
    emoji: "🛞", danger: "medium", category: "processing",
    eNumber: "E1520",
    alsoKnownAs: "Propane-1,2-diol, PG, 1,2-propanediol",
    hidesIn: "Artificial vanilla extract, salad dressings, baked goods, flavored coffee, commercial frosting, packaged icing, some ice cream",
    whyBad: "A solvent used to carry food flavors and colorings — also used in antifreeze, aircraft de-icing fluid, hydraulic fluids, and electronic cigarettes (food-grade propylene glycol is a different purity than industrial, but the compound is identical). Accumulates in people with kidney disease and can cause toxicity. Metabolizes to lactic acid and pyruvic acid, increasing acidic load on the body.",
    holyPromise: "Our flavors are dissolved in food-grade ethanol or water. Nothing that appears in your car's antifreeze reservoir.",
    gradient: "from-cyan-900 to-red-800",
  },

  // ── HIDDEN TOXINS ─────────────────────────────────────────────────────────
  {
    name: "Glyphosate Residues",
    emoji: "🌾", danger: "high", category: "toxins",
    alsoKnownAs: "Roundup residue, herbicide residue, N-(phosphonomethyl)glycine",
    bannedIn: "IARC Group 2A: probable human carcinogen (2015). Bayer settled glyphosate lawsuits for $10.9 billion. Several US states and EU member states working to phase it out.",
    hidesIn: "Non-organic oats, wheat, barley, lentils, chickpeas, beer, wine, honey, non-organic fruit and vegetables — detected in 70%+ of non-organic food tested",
    whyBad: "The world's most-used herbicide, applied directly to many crops before harvest as a desiccant (drying agent). IARC classified it as a probable human carcinogen in 2015. Bayer (owner of Monsanto) paid $10.9 billion to settle cancer lawsuits from thousands of claimants. It functions as an antibiotic — systematically destroying beneficial gut bacteria and disrupting the microbiome. Also chelates (locks away) essential minerals like zinc and manganese from crops.",
    holyPromise: "All HolySnacks ingredients are certified organic — meaning glyphosate use is prohibited by law throughout the supply chain.",
    gradient: "from-green-800 to-red-800",
  },
  {
    name: "Aflatoxins",
    emoji: "🥜", danger: "high", category: "toxins",
    alsoKnownAs: "Aflatoxin B1, B2, G1, G2, M1 — mycotoxins from Aspergillus mold",
    bannedIn: "IARC Group 1: definitively carcinogenic to humans. All countries set maximum limits — but limits still allow detectable exposure.",
    hidesIn: "Peanuts, peanut butter, corn, tree nuts (almonds, pistachios, walnuts), some spices, dried figs, cottonseed, some grains",
    whyBad: "Aflatoxin B1 is the most potent naturally occurring carcinogen known to science. Produced by Aspergillus mold that grows on improperly stored crops in warm, humid conditions. IARC Group 1 — definitively causes liver cancer. Survives most cooking temperatures. Suppresses immune function. Causes stunted growth in children with chronic low-level exposure. Organic certification does NOT guarantee aflatoxin-free products.",
    holyPromise: "We source nuts and seeds from certified, regularly tested suppliers with strict aflatoxin monitoring. Every batch is tested before use.",
    gradient: "from-amber-900 to-red-900",
  },
  {
    name: "Inorganic Arsenic",
    emoji: "💀", danger: "high", category: "toxins",
    alsoKnownAs: "Arsenic (inorganic), arsenite, arsenate — distinct from organic arsenic in seafood",
    bannedIn: "IARC Group 1: definitively carcinogenic to humans. FDA has set limits only for infant rice cereal — not for adult rice products.",
    hidesIn: "Rice, rice milk, brown rice syrup (used as sweetener in many 'healthy' products), rice cakes, rice pasta, apple juice, some bottled water, wine",
    whyBad: "Rice absorbs inorganic arsenic from soil and water more efficiently than any other crop. Inorganic arsenic is a Group 1 carcinogen — definitively causes bladder, lung, and skin cancer. Brown rice contains significantly MORE arsenic than white rice (concentrated in the bran). Rice-based baby food is a particular concern. Brown rice syrup, marketed as a 'healthy' sugar alternative, can contain very high arsenic levels.",
    holyPromise: "We use certified low-arsenic grain sources and test for heavy metals. Brown rice syrup is never used as a sweetener in HolySnacks products.",
    gradient: "from-slate-800 to-red-800",
  },
  {
    name: "Lead in Food",
    emoji: "🔋", danger: "high", category: "toxins",
    alsoKnownAs: "Lead contamination, lead residue, Pb — a heavy metal with no safe exposure level",
    bannedIn: "No safe level of lead exposure exists — any amount causes harm. WHO and FDA both state there is no safe blood lead level.",
    hidesIn: "Certain spices (turmeric, paprika, chili from some regions — sometimes adulterated with lead chromate for color), baby food (especially root vegetables, fruit pouches), some canned goods, imported cookware, certain candies",
    whyBad: "There is no safe level of lead exposure. Period. It causes irreversible brain damage and lower IQ in children — even tiny amounts. A 2021 US Congressional investigation found 95% of baby foods tested contained detectable levels of heavy metals including lead. Lead accumulates in bones and is released during pregnancy, exposing the fetus. Certain spices are intentionally adulterated with lead compounds to enhance color.",
    holyPromise: "All HolySnacks ingredients are tested for heavy metals including lead. We source spices only from certified, fully traceable suppliers.",
    gradient: "from-gray-800 to-red-900",
  },
  {
    name: "Microplastics",
    emoji: "🧬", danger: "high", category: "toxins",
    alsoKnownAs: "Nanoplastics, plastic particles, plastic fragments, PET particles, polyethylene fragments",
    bannedIn: "No regulatory framework exists yet — science is moving faster than legislation. WHO has called for urgent research and action.",
    hidesIn: "Table salt, honey, beer, bottled water, tap water, canned food, fresh produce, seafood, processed food, food stored in plastic packaging",
    whyBad: "Microplastics are now found in human blood, lungs, placenta, breast milk, testicles, and most recently — brain tissue (2024 study found 4-7x higher plastic concentration in brain tissue vs. liver/kidney). Humans ingest approximately 5 grams of microplastics per week — the weight of a credit card. They carry absorbed toxic chemicals (PCBs, pesticides, BPA) directly into tissues. Cause oxidative stress and inflammation at the cellular level. There is currently no way to remove them from the food supply.",
    holyPromise: "HolySnacks uses glass jars and paper packaging wherever possible to minimize plastic-food contact. This won't eliminate all exposure, but it's the most responsible choice we can make right now.",
    gradient: "from-blue-900 to-red-900",
  },

  // ── MORE BAD FATS ─────────────────────────────────────────────────────────
  {
    name: "Interesterified Fats",
    emoji: "🧬", danger: "medium", category: "fats",
    alsoKnownAs: "Interesterified vegetable oil, stearic acid-rich fats, fully hydrogenated then interesterified oils",
    hidesIn: "Margarine, commercial shortening, some baked goods, non-dairy creamers, fried foods, infant formula (some)",
    whyBad: "Created as a direct replacement for trans fats after the trans fat ban, using chemical or enzymatic processes to rearrange fatty acid positions. Emerging research (2007 Sundram study) suggests they may impair insulin function and raise blood sugar MORE effectively than trans fats — while raising LDL and lowering HDL similarly. Not required to be labeled separately. Manufacturers adopted them without long-term safety data, replacing one problem with a potentially worse one.",
    holyPromise: "We use only naturally occurring fats — cold-pressed olive and coconut oil — whose safety has been established over thousands of years of human use.",
    gradient: "from-orange-900 to-red-800",
  },
  {
    name: "Cottonseed Oil",
    emoji: "🌿", danger: "medium", category: "fats",
    alsoKnownAs: "Vegetable oil (when unlabeled), cotton oil",
    hidesIn: "Chips, crackers, fried snacks, peanut butter (some brands), salad dressings, margarine, commercial baked goods — often labeled simply as 'vegetable oil'",
    whyBad: "Cotton is NOT a food crop — it's a fiber crop sprayed with pesticides not approved for human food consumption. These residues concentrate in the oil. Contains gossypol — a natural toxin that must be removed during refining using harsh chemical processes. Extremely high in omega-6 fatty acids, promoting systemic inflammation. One of the most heavily pesticide-contaminated oil crops in the world.",
    holyPromise: "We only use oils from crops specifically grown for human consumption, cold-pressed without chemical solvents. No cotton, no mystery pesticides.",
    gradient: "from-green-800 to-red-700",
  },

  // ── MORE FLAVOR TRICKS ────────────────────────────────────────────────────
  {
    name: "Mono & Diglycerides",
    emoji: "🕳️", danger: "medium", category: "enhancers",
    eNumber: "E471",
    alsoKnownAs: "Mono- and diglycerides of fatty acids, glycerol monostearate, distilled monoglycerides",
    hidesIn: "Bread, ice cream, peanut butter, margarine, whipped toppings, packaged pastries, non-dairy creamers — incredibly widespread",
    whyBad: "The trans fat loophole. Mono and diglycerides are often derived from partially hydrogenated oils — meaning they can contain significant trans fats. But because they're classified as emulsifiers rather than fats, they are legally exempt from trans fat labeling requirements. A product can declare '0g Trans Fat' on its label and still contain substantial trans fats through this ingredient. This regulatory gap affects millions of products.",
    holyPromise: "We emulsify with sunflower lecithin and natural techniques. No hidden trans fats, no regulatory loopholes on our labels.",
    gradient: "from-purple-900 to-red-700",
  },
  {
    name: "Polysorbate 80",
    emoji: "🌀", danger: "medium", category: "enhancers",
    eNumber: "E433",
    alsoKnownAs: "Polyoxyethylene sorbitan monooleate, Tween 80",
    hidesIn: "Ice cream, salad dressings, pickles, whipped cream, some bread, vitamins/supplements",
    whyBad: "A synthetic emulsifier made from sorbitol and oleic acid, heavily processed. A 2015 Georgia Institute of Technology study (published in Nature) found it caused metabolic syndrome, inflammation, and colitis in mice by disrupting gut bacteria and eroding the intestinal mucus layer. A 2019 study linked it to increased intestinal permeability ('leaky gut'). Industry calls it safe because acute toxicity is low — but chronic gut microbiome disruption has long-term consequences.",
    holyPromise: "We use sunflower lecithin for emulsification — a single-ingredient, minimally processed phospholipid that supports, rather than disrupts, gut barrier function.",
    gradient: "from-indigo-900 to-red-700",
  },
  {
    name: "Synthetic Vanillin",
    emoji: "🏭", danger: "low", category: "enhancers",
    alsoKnownAs: "Artificial vanilla flavor, vanillin, imitation vanilla extract",
    hidesIn: "95%+ of 'vanilla flavored' products: biscuits, cakes, ice cream, yogurt, protein bars, cereals, chocolate, coffee syrups",
    whyBad: "Made primarily from petroleum byproducts OR lignin — a waste product of the paper-pulp industry. Has zero relationship to real vanilla beyond one flavor compound. Real vanilla contains 250+ flavonoids and aromatic compounds. Synthetic vanillin is a single isolated molecule from an industrial process. Maillard reaction products in artificial vanilla may trigger migraines in sensitive individuals. Most consumers have no idea — 'vanilla flavor' sounds natural.",
    holyPromise: "We use real bourbon vanilla bean extract — 250+ natural compounds, genuine flavor, and the kind of ingredient you can actually trace back to a real plant.",
    gradient: "from-amber-800 to-orange-700",
  },

  // ── ARTIFICIAL SWEETENERS ────────────────────────────────────────────────────
  {
    name: "Acesulfame-K",
    emoji: "🧪", danger: "medium", category: "sweeteners",
    eNumber: "E950",
    alsoKnownAs: "Acesulfame potassium, Ace-K, Sunett, Sweet One",
    hidesIn: "Diet sodas, sugar-free energy drinks, protein bars, chewing gum, sugar-free yogurt, 'light' products, many foods labeled zero-sugar",
    whyBad: "200× sweeter than sugar, Acesulfame-K is often paired with aspartame to mask each other's aftertaste. Several rodent studies found dose-dependent increases in cancer incidence — though regulators contest methodology. A 2021 study (Cell Metabolism) found it disrupts gut microbiome and impairs insulin signaling. Contains methylene chloride — a potential carcinogen — as a byproduct of manufacture. Despite being approved, its safety database is considered outdated and thin by many scientists.",
    holyPromise: "We sweeten with coconut sugar, raw honey, and organic stevia leaf — real, traceable, minimally processed alternatives.",
    gradient: "from-purple-900 to-pink-800",
    bannedIn: "No ban — but many health authorities have called for reassessment. Studies pending EU re-evaluation.",
  },
  {
    name: "Neotame",
    emoji: "🧪", danger: "medium", category: "sweeteners",
    eNumber: "E961",
    alsoKnownAs: "N-neohexyl-aspartame, NutraSweet N",
    hidesIn: "Processed foods as unlabeled flavor enhancer (does not require disclosure on US labels below certain concentrations), soft drinks, baked goods, dairy",
    whyBad: "A derivative of aspartame — 8,000× sweeter than sugar — that can legally be used in the US without appearing on the label. Extremely little long-term safety data exists. A 2023 study from the University of North Carolina found neotame damaged the intestinal wall of mice and triggered inflammation pathways. The fact that it can be legally hidden in 'natural flavors' labels makes it nearly impossible to avoid without full transparency.",
    holyPromise: "HolySnacks products list every ingredient, full stop. No hidden sweeteners, no 'natural flavors' smoke screens.",
    gradient: "from-violet-900 to-purple-800",
  },
  {
    name: "Advantame",
    emoji: "🧪", danger: "low", category: "sweeteners",
    eNumber: "E969",
    alsoKnownAs: "ADV — no common trade name",
    hidesIn: "Emerging use in baked goods, beverages, and dairy — approved 2014 in the US, approved EU 2014. Still rare but growing.",
    whyBad: "20,000× sweeter than sugar — the most potent approved sweetener. Approved with minimal long-term human safety data. In the US, does not require a phenylketonuria (PKU) warning unlike aspartame, despite being an aspartame derivative, because theoretical phenylalanine release is lower. Independent long-term safety research is essentially nonexistent as of 2024 — it has only been on market since 2014. We simply do not know what daily consumption across decades does.",
    holyPromise: "If the safety data doesn't exist yet, we don't use it. Our sweeteners have centuries of safe human consumption behind them.",
    gradient: "from-fuchsia-900 to-rose-800",
  },

  // ── REFINED STARCHES & FLOUR ─────────────────────────────────────────────────
  {
    name: "Dextrose",
    emoji: "🌽", danger: "medium", category: "starches",
    alsoKnownAs: "Glucose, corn sugar, grape sugar, D-glucose, dextrose monohydrate",
    hidesIn: "Chips, sausages, processed meats, bread, baked goods, energy drinks, sports nutrition, baby food, ketchup, sauces, almost all packaged food",
    whyBad: "Pure glucose derived from cornstarch via enzymatic hydrolysis. Glycemic Index of 100 — the highest possible, higher than table sugar (GI 65). Spikes blood sugar violently, triggering an insulin surge followed by a crash. Used in processed foods because it's cheap and extends shelf life. In processed meats it accelerates nitrite curing reactions. Virtually always derived from GMO corn.",
    holyPromise: "We use whole-food sweeteners with low glycaemic index. No refined glucose derivatives, ever.",
    gradient: "from-yellow-800 to-amber-700",
  },
  {
    name: "Modified Starch",
    emoji: "⚗️", danger: "medium", category: "starches",
    eNumber: "E1404–E1452",
    alsoKnownAs: "Modified corn starch, modified food starch, modified tapioca starch, oxidised starch, cross-linked starch, acetylated starch",
    hidesIn: "Soups, sauces, gravies, ready meals, puddings, baby food, salad dressings, frozen food, processed cheese, instant noodles",
    whyBad: "Starches chemically altered with acids, bases, bleaches, or phosphate groups to change texture and stability. E1422 (acetylated distarch adipate) has been flagged by EFSA for use in infant formula. Some modified starches are made with propylene oxide — a probable carcinogen. Despite being labelled as 'natural' (it's derived from corn or potato), the modifications are industrial chemical processes. GI remains high, and the gut microbiome cannot ferment highly modified starches the same way as intact starch.",
    holyPromise: "We use whole unmodified tapioca starch and apple pectin — ingredients whose molecular structure is exactly as nature made them.",
    gradient: "from-stone-800 to-amber-800",
  },
  {
    name: "Bleached & Enriched Flour",
    emoji: "🌾", danger: "medium", category: "starches",
    alsoKnownAs: "Enriched wheat flour, white flour, refined flour, bleached flour, all-purpose flour",
    hidesIn: "White bread, pasta, crackers, cookies, pizza dough, pastries, cereals, pancake mix, breadcrumbs — essentially all conventional baked goods",
    whyBad: "Milling removes the bran and germ — stripping out 40% of vitamins, minerals, and all of the fibre. 'Enrichment' replaces a handful of synthetic vitamins — a poor substitute for what was removed. Bleaching uses chlorine dioxide, benzoyl peroxide, or azodicarbonamide (ADA, a banned dough conditioner in the EU) to whiten. The result is a fibre-depleted, nutrient-hollow ingredient that spikes blood sugar rapidly and feeds dysbiotic gut bacteria. GI of white bread: 75 — higher than table sugar.",
    holyPromise: "When we use flour, it is whole grain, stone-milled, and traceable. No bleaching, no synthetic enrichment, no stripping.",
    gradient: "from-amber-700 to-yellow-600",
  },
  {
    name: "Corn Syrup",
    emoji: "🌽", danger: "medium", category: "starches",
    alsoKnownAs: "Glucose syrup, glucose-fructose syrup (Europe), light corn syrup, dark corn syrup",
    hidesIn: "Candy, sauces, breakfast cereal, bread, baked goods, jam, ice cream, processed snacks — often listed as 'glucose syrup' in EU",
    whyBad: "Highly processed glucose derived from cornstarch — typically GMO corn. Lower fructose content than HFCS but still rapidly digested pure glucose. GI of 100. Provides zero nutrients while significantly elevating blood sugar. Almost exclusively from GMO corn without disclosure. 'Glucose syrup' is the EU labeling that obscures the corn origin. Contributes to insulin resistance with regular consumption.",
    holyPromise: "No refined glucose syrups in any form. We sweeten intentionally with whole-food sources.",
    gradient: "from-yellow-700 to-orange-700",
  },
  {
    name: "Polydextrose",
    emoji: "🔬", danger: "low", category: "starches",
    eNumber: "E1200",
    alsoKnownAs: "Synthetic fibre, soluble fibre (on label)",
    hidesIn: "Protein bars, 'high fibre' cereals, diet foods, sugar-free candy, some dairy products — often presented as a positive 'fibre' ingredient",
    whyBad: "A synthetic polymer made from glucose, sorbitol, and citric acid — not a naturally occurring fibre. Marketed as a 'dietary fibre' on labels but metabolically behaves very differently from real plant fibre. In sensitive individuals causes bloating, gas, and osmotic diarrhoea at typical serving sizes. The gut microbiome ferments it differently from prebiotic fibres, producing less beneficial short-chain fatty acids.",
    holyPromise: "Our fibre comes from real fruit, apple pectin, and whole food ingredients — not synthetic polymers.",
    gradient: "from-slate-700 to-gray-600",
  },

  // ── REFINED SEED OILS ────────────────────────────────────────────────────────
  {
    name: "Refined Sunflower Oil",
    emoji: "🌻", danger: "medium", category: "oils",
    alsoKnownAs: "Sunflower oil, vegetable oil (often sunflower), high-oleic sunflower oil (refined)",
    hidesIn: "Chips, crisps, crackers, most fried snacks, margarine, salad dressings, canned fish, pesto, dips — the default frying oil in European mass-market food",
    whyBad: "Refined with hexane (a neurotoxic petrochemical solvent), bleached, and deodorized — destroying natural antioxidants and vitamin E. Contains 65–70% omega-6 linoleic acid. The modern diet already provides 10–20× more omega-6 than omega-3, and refined sunflower oil dramatically worsens this ratio, driving systemic inflammation. Highly unstable at high temperatures — oxidises into aldehydes and lipid peroxides, which are toxic byproducts shown to damage DNA and promote cardiovascular disease.",
    holyPromise: "We use only extra-virgin cold-pressed olive oil — first cold press, full polyphenols intact. Zero industrial seed oils.",
    gradient: "from-yellow-600 to-orange-500",
  },
  {
    name: "Refined Soybean Oil",
    emoji: "🫘", danger: "medium", category: "oils",
    alsoKnownAs: "Soybean oil, soya oil, soy oil, vegetable oil (often soybean in North America)",
    hidesIn: "Margarine, salad dressings, mayonnaise, packaged crackers, cookies, fast food, most restaurant frying oil, infant formula",
    whyBad: "The most consumed oil in the United States. Over 94% of US soybeans are genetically modified. Hexane-extracted, refined, bleached, deodorized. Extremely high in omega-6 linoleic acid (54%), dramatically worsening the omega-6:omega-3 imbalance. A 2020 UC Riverside study found soybean oil induced genetic changes in the hypothalamus affecting neurological function, anxiety, and autism-related pathways in mice — even compared to fructose. Phytoestrogens from soy may affect hormone signalling.",
    holyPromise: "No soybean oil in any HolySnacks product. We do not use any industrial seed oil regardless of its source.",
    gradient: "from-green-900 to-lime-800",
  },
  {
    name: "Refined Corn Oil",
    emoji: "🌽", danger: "medium", category: "oils",
    alsoKnownAs: "Corn oil, maize oil, vegetable oil (sometimes corn)",
    hidesIn: "Margarine, chips, popcorn, salad dressings, fried snack food, some baked goods, cooking sprays",
    whyBad: "Virtually all commercially produced corn oil comes from GMO corn. Hexane-extracted and industrially refined. 57% omega-6 linoleic acid — one of the highest concentrations of any oil. Oxidatively unstable at frying temperatures, generating toxic aldehyde compounds. A 2013 clinical trial published in the BMJ found replacing saturated fat with corn oil actually increased cardiovascular mortality — directly contradicting decades of dietary guidelines. The industry still promotes it as a 'heart-healthy' vegetable oil.",
    holyPromise: "Our snacks are made with extra-virgin cold-pressed olive oil. No corn oil, no industrial processing.",
    gradient: "from-yellow-700 to-lime-700",
  },
  {
    name: "Refined Rapeseed Oil",
    emoji: "🌼", danger: "medium", category: "oils",
    alsoKnownAs: "Rapeseed oil, canola oil (Canada/US), vegetable oil, colza oil",
    hidesIn: "Mayonnaise, salad dressings, margarine, bread, chips, ready meals, store-brand cooking oils — the most common 'vegetable oil' in European products",
    whyBad: "The dominant 'vegetable oil' in European supermarkets. Refined with hexane, bleached, deodorized at 200–230°C — destroying natural antioxidants. Contains erucic acid in older varieties (harmful to heart muscle at high doses) and small amounts in modern low-erucic (canola) varieties. High-temperature refining creates trans fatty acids and oxidation products. The omega-6:omega-3 ratio (2:1) is better than sunflower oil but refining negates the potential benefits.",
    holyPromise: "No refined rapeseed or canola oil. Our only fat sources are cold-pressed olive oil and unrefined coconut oil.",
    gradient: "from-yellow-500 to-amber-600",
  },
  {
    name: "Hydrogenated Vegetable Oil",
    emoji: "⚠️", danger: "high", category: "oils",
    alsoKnownAs: "Partially hydrogenated oil, PHO, shortening, vegetable shortening, hardened fat, hardened vegetable fat",
    hidesIn: "Margarine, commercial baked goods, cookies, crackers, pastries, microwave popcorn, non-dairy creamer, frozen pizza, fried fast food — check for 'hydrogenated' anywhere on the label",
    whyBad: "Industrial trans fats created by forcing hydrogen gas through liquid vegetable oil under pressure with a nickel catalyst. Banned for direct addition to US food since 2020 and largely banned in the EU since 2021. Even trace amounts (>0.5g/day) significantly raise LDL, lower HDL, increase systemic inflammation, and elevate heart disease risk. The WHO estimates trans fats kill 500,000 people per year globally. Still present in some imported products and countries with weaker regulations.",
    holyPromise: "Banned in our kitchen before it was banned in law. Zero hydrogenated fats, zero trans fats in any form.",
    gradient: "from-red-900 to-gray-800",
    bannedIn: "EU (partially hydrogenated, since 2021), USA (since 2020), many others — but still legal in some countries",
  },

  // ── HIDDEN MSG SOURCES ───────────────────────────────────────────────────────
  {
    name: "Autolyzed Yeast Extract",
    emoji: "🍄", danger: "medium", category: "enhancers",
    alsoKnownAs: "Yeast extract, autolyzed yeast, torula yeast, brewer's yeast extract",
    hidesIn: "Chips, crackers, soups, bouillon cubes, instant noodles, sauces, ready meals, fast food, 'natural flavor' — one of the most common hidden MSG sources",
    whyBad: "Yeast cells are broken down (autolyzed) releasing their contents — including naturally occurring glutamate, which is biochemically identical to MSG. This allows manufacturers to list 'yeast extract' or 'natural flavors' instead of MSG while delivering the same glutamate effect. Glutamate excites neuronal receptors — the same mechanism that causes 'MSG symptom complex' in sensitive individuals. In the EU, free glutamate from yeast extract must not exceed certain limits, but compliance monitoring is limited.",
    holyPromise: "We season with whole herbs, spices, and Himalayan salt. No hidden glutamate boosters in any form.",
    gradient: "from-amber-900 to-brown-800",
  },
  {
    name: "Hydrolyzed Vegetable Protein",
    emoji: "⚗️", danger: "medium", category: "enhancers",
    alsoKnownAs: "HVP, hydrolyzed plant protein, hydrolyzed soy protein, hydrolyzed wheat protein, hydrolyzed corn protein",
    hidesIn: "Chips, soups, sauces, seasoning mixes, instant noodles, crackers, processed meats, dips, some 'natural flavor' formulations",
    whyBad: "Vegetable protein (usually soy, wheat, or corn) broken down with hydrochloric acid or enzymes to release amino acids including glutamic acid — free glutamate, identical to MSG. The FDA acknowledges HVP contains MSG but does not require MSG labeling because it occurs 'naturally' from protein hydrolysis. May contain residual chlorpropanols (3-MCPD) — carcinogenic compounds formed during acid hydrolysis — found at concerning levels in some products. Almost always sourced from GMO crops.",
    holyPromise: "No acid-hydrolyzed proteins in any formulation. Flavour comes from real ingredients, not chemistry.",
    gradient: "from-lime-900 to-green-800",
  },
  {
    name: "Disodium Inosinate",
    emoji: "🔬", danger: "medium", category: "enhancers",
    eNumber: "E631",
    alsoKnownAs: "IMP, sodium inosinate, inosinic acid, disodium 5'-inosinate",
    hidesIn: "Chips, flavored crackers, instant noodles, soups, ramen, seasoned snacks — almost always paired with E627 to amplify MSG 4–8×",
    whyBad: "A nucleotide flavor enhancer derived from meat, fish, or yeast. On its own, it has modest flavor enhancement. When combined with MSG and E627 (which it almost always is), the synergistic effect amplifies the total umami taste 4–8× — meaning far less MSG can produce the same intensity. Not suitable for those on purine-restricted diets (gout). Its presence virtually always signals that MSG or hidden glutamate sources are also present, even if not listed.",
    holyPromise: "We season naturally. If you see E631 on a label, assume MSG and hidden glutamate are present too — and know they're not in ours.",
    gradient: "from-teal-900 to-green-800",
  },
  {
    name: "Disodium Guanylate",
    emoji: "🔬", danger: "medium", category: "enhancers",
    eNumber: "E627",
    alsoKnownAs: "GMP, sodium guanylate, disodium 5'-guanylate, guanylic acid",
    hidesIn: "Flavored chips, instant noodles, seasoning sachets, stock cubes, soup powders, frozen meals, processed cheese — virtually always with E631 and MSG",
    whyBad: "Works identically to E631 — a nucleotide enhancer that multiplies the perceived intensity of MSG. Not suitable for those with gout (purines). In the EU, E627 must not be used in foods intended for infants and young children. Like E631, its presence is a reliable indicator that the product relies on glutamate boosting — a signal of ultra-processed, lab-engineered flavour rather than real food quality. The combination of MSG + E631 + E627 is sometimes called the 'flavour trinity' in the processed food industry.",
    holyPromise: "Flavour engineering has no place in our recipes. Real ingredients taste real.",
    gradient: "from-cyan-900 to-teal-800",
  },

  // ── PROCESSED MEAT CHEMICALS ─────────────────────────────────────────────────
  {
    name: "Sodium Nitrite",
    emoji: "🥩", danger: "high", category: "meats",
    eNumber: "E250",
    alsoKnownAs: "Sodium nitrite, curing salt, Prague powder #1",
    hidesIn: "Ham, bacon, salami, hot dogs, sausages, deli meats, smoked fish, canned corned beef — essentially all cured and processed meats",
    whyBad: "Used to preserve colour and prevent botulism in processed meats. In acidic, high-heat conditions (like your stomach or a frying pan), nitrites react with amino acids to form nitrosamines — classified as probable human carcinogens by the IARC. A 2019 study (International Journal of Epidemiology, 500,000 people) found a 58% higher risk of colorectal cancer in high processed-meat consumers. The WHO classified processed meats as Group 1 carcinogens (sufficient evidence of cancer causation) in 2015 — the same category as tobacco.",
    holyPromise: "HolySnacks does not produce cured meats. If we ever do, we use celery powder nitrate (naturally occurring) with full disclosure.",
    gradient: "from-red-950 to-rose-900",
    bannedIn: "No ban — but the WHO classifies processed meats containing nitrites as Group 1 carcinogens. Several countries are introducing limits.",
  },
  {
    name: "Sodium Nitrate",
    emoji: "🥩", danger: "high", category: "meats",
    eNumber: "E251",
    alsoKnownAs: "Potassium nitrate E252, saltpeter, curing salt",
    hidesIn: "Dry-cured meats, salami, pepperoni, prosciutto, some cheeses, some fish products — converts to nitrite during curing",
    whyBad: "A slower-acting precursor to nitrite. Bacteria in cured meats gradually convert nitrate to nitrite over the curing period. The nitrite then forms nitrosamines upon heating or in the acidic stomach environment. Exposure is cumulative — eating cured meats daily adds up. Nitrate is naturally present in vegetables (spinach, beetroot) but the context matters: plant nitrate comes with antioxidants like vitamin C and polyphenols that inhibit nitrosamine formation. Isolated nitrate in processed meats has no such protective companions.",
    holyPromise: "Zero nitrates or nitrites from synthetic sources in any HolySnacks formulation.",
    gradient: "from-rose-950 to-red-800",
  },
  {
    name: "Sodium Erythorbate",
    emoji: "🧬", danger: "low", category: "meats",
    eNumber: "E316",
    alsoKnownAs: "Erythorbic acid E315, isoascorbic acid, D-araboascorbic acid",
    hidesIn: "Hot dogs, sausages, ham, frozen seafood, some canned vegetables — used to speed up nitrite curing and stabilise colour",
    whyBad: "Not directly toxic — it's a stereoisomer of vitamin C (ascorbic acid). However, its purpose is to accelerate the conversion of sodium nitrate to sodium nitrite in cured meats — effectively intensifying nitrite exposure and nitrosamine formation potential. It has no vitamin C activity. The concern is not the erythorbate itself but what it does: it's a process accelerator for the most carcinogenic step in meat processing. Its presence signals the product is industrially cured.",
    holyPromise: "We source real food, not industrially cured products laden with curing accelerators.",
    gradient: "from-orange-900 to-red-800",
  },

  // ── ADDITIONAL COLORS ────────────────────────────────────────────────────────
  {
    name: "Yellow 5 (Tartrazine)",
    emoji: "🟡", danger: "medium", category: "colors",
    eNumber: "E102",
    alsoKnownAs: "Tartrazine, CI 19140, FD&C Yellow 5",
    bannedIn: "Norway (banned), Austria (banned). Requires warning label: 'may have an adverse effect on activity and attention in children' in EU",
    hidesIn: "Lemonade, energy drinks, chips, candy, pickles, canned peas, breakfast cereal, mustard, coloured pasta — anything yellow or green-tinted",
    whyBad: "One of the 'Southampton Six' artificial dyes linked to hyperactivity and attention problems in children in a 2007 UK study (published in The Lancet). The EU mandatory warning label followed. Cross-reacts with aspirin in aspirin-sensitive individuals, triggering asthmatic reactions. Made from coal tar and petroleum. In the UK, companies reformulated products rather than print the warning. Banned in Norway. The FDA reviewed the science in 2011 but did not require action — leaving US consumers without warnings.",
    holyPromise: "We color with turmeric, beet juice, and spirulina. Not coal tar.",
    gradient: "from-yellow-600 to-amber-500",
  },
  {
    name: "Yellow 6 (Sunset Yellow)",
    emoji: "🟠", danger: "medium", category: "colors",
    eNumber: "E110",
    alsoKnownAs: "Sunset Yellow FCF, CI 15985, FD&C Yellow 6",
    bannedIn: "Norway, Finland (banned). EU mandatory warning label for hyperactivity in children",
    hidesIn: "Orange-flavored drinks, chips, candy, cereals, baked goods, prescription medications, some cheeses — anything orange or deep yellow",
    whyBad: "Another of the Southampton Six. Linked to hyperactivity in children, allergic reactions (especially in aspirin-sensitive individuals), and animal studies showing adrenal gland and kidney tumours at high doses. Derived from petroleum. The warning label required by the EU is: 'may have an adverse effect on activity and attention in children' — yet the FDA has not acted. It is suspected to be contaminated with Sudan I (a carcinogen) in manufacturing — the EU has had multiple alerts for this contamination.",
    holyPromise: "Zero synthetic petroleum-derived dyes in our formulations.",
    gradient: "from-orange-600 to-amber-500",
  },
  {
    name: "Caramel Color E150d",
    emoji: "🟤", danger: "high", category: "colors",
    points: 220, // contains 4-MEI (potential carcinogen); California Prop 65 warning required
    eNumber: "E150d",
    alsoKnownAs: "Ammonia sulfite caramel, sulfite ammonia caramel, class IV caramel color, Caramel Color IV, ammonia caramel, Class IV caramel",
    bannedIn: "Not banned, but California's Prop 65 requires cancer warning labels on products with >29 μg/day 4-MEI — leading Coca-Cola to reformulate in California",
    hidesIn: "Cola drinks (Coca-Cola, Pepsi), soy sauce, dark beer, coffee syrups, some gravies and sauces, vinegar — anything deep brown-colored in a bottle",
    whyBad: "Made by heating ammonia and sulfite compounds with sugar — producing 2-methylimidazole and 4-methylimidazole (4-MEI) as byproducts. 4-MEI is classified as a possible human carcinogen (Group 2B, IARC). A 2011 study (NTP, National Toxicology Program) found 4-MEI causes lung tumours in mice. The FDA has acknowledged the concern but has not set a limit. A Consumer Reports investigation (2014) found multiple soft drinks exceeded California's 29 μg/day threshold for cancer warning labels.",
    holyPromise: "We color naturally with cocoa, coffee, and spices. No ammonia chemistry in our kitchen.",
    gradient: "from-amber-900 to-brown-800",
  },
  {
    name: "Titanium Dioxide",
    emoji: "🤍", danger: "high", category: "colors",
    points: 260, // EU-banned nanoparticle; EFSA: DNA damage cannot be ruled out
    eNumber: "E171",
    alsoKnownAs: "TiO2, CI 77891, titania, white food coloring, CI 77891",
    bannedIn: "EU (banned as food additive since 2022), UK (ban under consideration). Still legal in USA, Canada, Australia.",
    hidesIn: "White candy coating, chewing gum, icing, marshmallows, white sauces, some medications, white chocolates, toothpaste — anything brilliantly white",
    whyBad: "A white pigment made of titanium nanoparticles. Banned as a food additive by the EU in 2022 after EFSA concluded that genotoxicity (DNA damage) could not be ruled out. The nano-scale particles are small enough to cross cell membranes and the gut epithelium. Studies have shown it accumulates in the liver, spleen, and kidneys. A 2021 Nature Communications study found TiO2 nanoparticles dysregulate the intestinal microbiome and promote colorectal carcinogenesis in mice. Still in use in the USA, Canada, and Australia.",
    holyPromise: "EU-banned ingredients are banned in our entire product line globally — not just in Europe.",
    gradient: "from-gray-600 to-slate-500",
  },

  // ── ADDITIONAL PRESERVATIVES ─────────────────────────────────────────────────
  {
    name: "Benzoic Acid",
    emoji: "⚗️", danger: "medium", category: "preservatives",
    eNumber: "E210",
    alsoKnownAs: "Sodium benzoate E211, potassium benzoate E212, calcium benzoate E213",
    hidesIn: "Soft drinks, fruit juices, pickles, margarine, salad dressings, soy sauce, jams, some dairy products — the most widely used preservative in beverages",
    whyBad: "When combined with vitamin C (ascorbic acid) — common in fruit drinks and energy drinks — benzoic acid and ascorbate react to form benzene, a known human carcinogen (Group 1, IARC). The FDA has acknowledged benzene formation in drinks but considers levels 'not an immediate risk' — a phrase that ignores cumulative lifetime exposure. Also one of the Southampton Six preservatives linked to hyperactivity in children. Sodium benzoate (E211) has been linked in studies to increased ADHD symptoms and oxidative stress.",
    holyPromise: "We preserve naturally with rosemary extract, citric acid from lemons, and vitamin C — none of which form benzene.",
    gradient: "from-indigo-800 to-violet-700",
  },
  {
    name: "Sulfur Dioxide & Sulfites",
    emoji: "💨", danger: "medium", category: "preservatives",
    eNumber: "E220–E228",
    alsoKnownAs: "Sulfur dioxide E220, sodium bisulfite E222, sodium metabisulfite E223, potassium metabisulfite E224, potassium sulfite E225",
    bannedIn: "Not banned, but must be declared on labels when >10 mg/kg. Prohibited in meat and food recognised as source of vitamin B1.",
    hidesIn: "Wine, beer, dried fruits (apricots, raisins, cranberries), packaged potatoes and chips, pickled vegetables, fruit juices, vinegar, shrimp, some medications",
    whyBad: "A major allergen — the EU and FDA require mandatory labelling because sulfites trigger asthmatic reactions in roughly 5–10% of asthmatics, potentially severely. Sulfur dioxide gas and dissolved sulfites destroy vitamin B1 (thiamine) in food. Some evidence links chronic sulfite exposure to gut dysbiosis. Dried fruits labelled 'no added sulfites' often still contain them naturally or from cross-contamination. Conventional dried apricots can contain >1,000 mg/kg SO₂.",
    holyPromise: "We dry and preserve naturally. Our ingredients carry no sulfite treatments.",
    gradient: "from-yellow-800 to-green-700",
  },
  {
    name: "Carrageenan",
    emoji: "🌊", danger: "medium", category: "preservatives",
    eNumber: "E407",
    alsoKnownAs: "Irish moss extract, carrageenan gum, dried red seaweed extract",
    hidesIn: "Plant-based milks (almond, oat, coconut), chocolate milk, deli meats, infant formula, yogurt, cream, ice cream, coffee creamers, processed cheese",
    whyBad: "Extracted from red seaweed but heavily processed. Poligeenan (degraded carrageenan) is a known carcinogen — and food-grade carrageenan converts to poligeenan in the acidic stomach environment. A 2016 review by the National Organic Standards Board recommended removing it from organic certification. Animal studies show carrageenan triggers intestinal inflammation, promotes ulcerative colitis-like symptoms, and impairs insulin signalling. EU has banned carrageenan from infant formula since 2018.",
    holyPromise: "We use natural agar and apple pectin for texture. No inflammatory carrageenan.",
    gradient: "from-teal-800 to-cyan-700",
  },
  {
    name: "EDTA",
    emoji: "🧲", danger: "medium", category: "preservatives",
    eNumber: "E385 / E386",
    alsoKnownAs: "Disodium EDTA, calcium disodium EDTA, edetic acid, ethylenediaminetetraacetic acid",
    hidesIn: "Mayonnaise, salad dressings, canned legumes, canned seafood, potato products, carbonated drinks, some sauces, pickles, margarines",
    whyBad: "A chelating agent that binds to metal ions to prevent rancidity and discolouration. EDTA is poorly absorbed but the small amount that is absorbed chelates (binds and removes) essential minerals including zinc, calcium, iron, and magnesium — potentially disrupting mineral balance with regular consumption. Concerns exist about its accumulation in aquatic environments, where it does not degrade and releases chelated heavy metals back into ecosystems. Some studies in rodents show developmental and reproductive effects at high doses.",
    holyPromise: "We rely on natural antioxidants — rosemary extract, vitamin E from sunflower oil — not chelating chemicals.",
    gradient: "from-slate-800 to-blue-700",
  },

  // ── ADDITIONAL PROCESSING CHEMICALS ──────────────────────────────────────────
  {
    name: "L-Cysteine",
    emoji: "🪶", danger: "medium", category: "processing",
    eNumber: "E920",
    alsoKnownAs: "L-cysteine hydrochloride, cysteine, dough conditioner",
    bannedIn: "Not permitted in organic certified products. Source often undisclosed on labels.",
    hidesIn: "Commercial bread, pizza dough, fast-food buns, croissants, tortillas, crackers, dough-based products — widely used as a dough conditioner to reduce mixing time",
    whyBad: "Used to relax gluten networks in dough — reducing industrial mixing time and costs. The source is rarely disclosed: commercially it is often derived from duck feathers, pig or cow hair, or human hair (primarily from Chinese hair salons). It can also be made synthetically or from poultry feathers. Vegetarians and vegans who avoid products containing E920 of animal origin have no reliable way to determine the source. The undisclosed sourcing is a fundamental transparency issue. Some individuals also report digestive sensitivity.",
    holyPromise: "Our baked goods (where applicable) use traditional long fermentation — a natural process that conditions dough without chemistry or hidden animal sourcing.",
    gradient: "from-stone-700 to-amber-700",
  },
  {
    name: "Carboxymethylcellulose",
    emoji: "🧫", danger: "medium", category: "processing",
    eNumber: "E466",
    alsoKnownAs: "CMC, cellulose gum, sodium carboxymethylcellulose",
    hidesIn: "Ice cream, dairy-free alternatives, cream cheese, dressings, frozen food, baked goods, toothpaste, some diet foods — very widely used thickener/stabiliser",
    whyBad: "A semi-synthetic derivative of cellulose (plant fibre) chemically modified with chloroacetic acid. A 2015 study in Nature (Emilie Viennois, Georgia State) found CMC at doses achievable through normal diet significantly disrupted the gut microbiome, increased intestinal permeability, promoted low-grade inflammation, and accelerated development of metabolic syndrome and colitis in mice. A 2022 NutriNet-Santé cohort study (91,000 people) found CMC associated with higher risk of type 2 diabetes.",
    holyPromise: "We thicken with apple pectin and natural agar — nothing derived from chloroacetic acid chemistry.",
    gradient: "from-emerald-900 to-teal-800",
  },
  {
    name: "Sodium Phosphate",
    emoji: "🧂", danger: "medium", category: "processing",
    eNumber: "E339",
    alsoKnownAs: "Disodium phosphate, trisodium phosphate, sodium polyphosphate, sodium hexametaphosphate, TSP",
    hidesIn: "Processed cheese, cheese slices, ham, deli meats, instant noodles, fast food chicken, canned meat, some cereals — used to retain moisture and improve texture",
    whyBad: "Inorganic phosphate additives are absorbed much more efficiently than natural food phosphate (80–100% vs 40–60%). Consistently elevated phosphate levels are associated with accelerated biological aging (telomere shortening), endothelial dysfunction, and significantly higher cardiovascular mortality — even in people without kidney disease. A 2012 study found serum phosphate in the upper normal range associated with 55% higher cardiovascular risk. People with kidney disease are explicitly told to avoid added phosphates. The average person unknowingly consumes 1,000+ mg/day of added phosphate from processed foods.",
    holyPromise: "No phosphate additives. Minerals in our products come from Himalayan salt and whole-food sources.",
    gradient: "from-blue-900 to-slate-700",
  },
  {
    name: "Silicon Dioxide",
    emoji: "🪨", danger: "low", category: "processing",
    eNumber: "E551",
    alsoKnownAs: "Silica, amorphous silica, fumed silica, colloidal silicon dioxide",
    hidesIn: "Table salt, spice mixes, powdered sugar, garlic powder, onion powder, powdered coffee creamer, some protein powders — anti-caking agent in virtually all powdered products",
    whyBad: "Amorphous silicon dioxide is considered generally safe at macro scale. The concern is nanoparticle silicon dioxide — increasingly used in food applications — which can penetrate cell membranes. A 2021 EFSA re-evaluation found uncertainty about nanoparticle forms and raised concerns about accumulation in the gut. Some animal studies suggest chronic exposure to nano-SiO₂ causes inflammatory responses and liver damage. Conventional table salt may contain up to 10g/kg silicon dioxide.",
    holyPromise: "We use Himalayan pink salt — naturally free-flowing due to mineral composition. No anti-caking agents added.",
    gradient: "from-gray-500 to-stone-500",
  },
  {
    name: "Soy Protein Isolate",
    emoji: "🏭", danger: "medium", category: "processing",
    alsoKnownAs: "Isolated soy protein, ISP, textured soy protein (TVP)",
    hidesIn: "Protein bars, protein shakes, meat alternatives, infant formula, processed meats, bread, soups — marketed as a 'high protein' ingredient",
    whyBad: "Produced by extracting protein from defatted soy flour using hexane — a neurotoxic petrochemical solvent. Residual hexane may remain in the finished product. Contains phytic acid which inhibits absorption of zinc, iron, and calcium. High concentration of phytoestrogens (isoflavones) may disrupt hormonal signalling — of particular concern in infant formula, where soy-fed infants receive doses equivalent to 5 birth control pills' worth of phytoestrogens per day. 94% of US soy is GMO, and herbicide (glyphosate) residues are routinely detected.",
    holyPromise: "Our protein comes from whole foods — peas, seeds, nuts — not hexane-extracted industrial protein fractions.",
    gradient: "from-green-900 to-lime-800",
  },
];

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────

const T = {
  en: {
    badge: "✦ Divinely Natural ✦",
    nav: { products: "Products", about: "About", mission: "Mission", shop: "Shop Now" },
    hero: {
      tagline: "Snack Holy.\nLive Wholly.",
      sub: "Premium natural & organic snacks — healthy alternatives to everything you crave. No junk. No compromises.",
      cta: "Explore Universe",
      cta2: "Our Story",
    },
    marquee: "✦ NATURAL ✦ ORGANIC ✦ NO HARMFUL INGREDIENTS ✦ PREMIUM TASTE ✦ GUILT FREE ✦ DIVINELY CRAFTED ✦ NATURAL ✦ ORGANIC ✦ NO HARMFUL INGREDIENTS ✦",
    clickHint: "Click a planet to explore",
    back: "← Back to Universe",
    addToCart: "Add to Cart",
    comingSoon: "Coming Soon",
    mission: {
      title: "The Holy Mission",
      sub: "Every snack on store shelves hides something. Artificial dyes. Hidden sugars. Unpronounceable additives. We built HolySnacks because you deserve better.",
      pillars: [
        { icon: "🌿", title: "100% Natural", desc: "Every ingredient is traceable, natural, and honest." },
        { icon: "✦", title: "Premium Quality", desc: "We don't cut corners. Ever." },
        { icon: "🚫", title: "No Junk", desc: "No artificial colors, flavors, or preservatives." },
        { icon: "♻️", title: "Sustainable", desc: "Eco-conscious packaging and responsible sourcing." },
      ],
    },
    newsletter: { title: "Join the Chosen.", sub: "New flavors. Exclusive drops. Early access. No spam.", placeholder: "your@email.com", cta: "✦ Join the Movement" },
    footer: { tagline: "Snack Holy. Live Wholly.", copy: "© 2025 HolySnacks. All rights reserved.", links: ["Products", "About", "Contact", "Privacy Policy"] },
  },
  lt: {
    badge: "✦ Dieviškai Natūralu ✦",
    nav: { products: "Produktai", about: "Apie mus", mission: "Misija", shop: "Pirkti dabar" },
    hero: {
      tagline: "Snack Holy.\nLive Wholly.",
      sub: "Premium natūralūs ir ekologiški užkandžiai — sveikos alternatyvos viskam, ko trokšti. Jokių kenksmingų ingredientų.",
      cta: "Tyrinėti visatą",
      cta2: "Mūsų istorija",
    },
    marquee: "✦ NATŪRALU ✦ EKOLOGIŠKA ✦ BE KENKSMINGŲ INGREDIENTŲ ✦ PREMIUM SKONIS ✦ SĄŽININGA ✦ DIEVIŠKAI GAMINTA ✦ NATŪRALU ✦ EKOLOGIŠKA ✦",
    clickHint: "Spustelėk planetą ir tyrinėk",
    back: "← Grįžti į visatą",
    addToCart: "Į krepšelį",
    comingSoon: "Netrukus",
    mission: {
      title: "Šventoji misija",
      sub: "Kiekvienas parduotuvės užkandis slepia kažką. Dirbtiniai dažai. Paslėpti cukrūs. Mes sukūrėme HolySnacks, nes tu nusipelnei geriau.",
      pillars: [
        { icon: "🌿", title: "100% Natūralu", desc: "Kiekvienas ingredientas yra atsekamas ir sąžiningas." },
        { icon: "✦", title: "Premium kokybė", desc: "Mes niekada nekerpame kampų." },
        { icon: "🚫", title: "Be šlamšto", desc: "Jokių dirbtinių dažų, aromatų ar konservantų." },
        { icon: "♻️", title: "Tvaru", desc: "Ekologiška pakuotė ir atsakingas tiekimas." },
      ],
    },
    newsletter: { title: "Prisijunk prie išrinktųjų.", sub: "Nauji skoniai. Išskirtiniai leidimai. Ankstyva prieiga.", placeholder: "tavo@el.pastas.lt", cta: "✦ Prisijungti" },
    footer: { tagline: "Snack Holy. Live Wholly.", copy: "© 2025 HolySnacks. Visos teisės saugomos.", links: ["Produktai", "Apie mus", "Kontaktai", "Privatumo politika"] },
  },
};

// ─── STAR FIELD DATA (deterministic — no hydration issues) ───────────────────

const STAR_DATA = Array.from({ length: 200 }, (_, i) => ({
  x: (i * 73.856 + i * i * 0.137) % 100,
  y: (i * 47.932 + i * i * 0.089) % 100,
  size: [1, 1, 1, 1, 1.5, 1.5, 2][i % 7],
  minOpacity: 0.06 + (i % 5) * 0.04,
  maxOpacity: 0.3  + (i % 4) * 0.2,
  twinkle: i % 4 === 0,
  drift:   i % 9 === 0,
  dur:     2 + (i % 5),
  delay:   (i * 0.71) % 6,
}));

const SHOOTING_STARS = [
  { x: 8,  y: 6,  angle: 42, delay: 0,  dur: 14 },
  { x: 62, y: 4,  angle: 38, delay: 8,  dur: 20 },
  { x: 30, y: 2,  angle: 50, delay: 17, dur: 16 },
  { x: 80, y: 10, angle: 35, delay: 26, dur: 22 },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Halo({ width = 48, height = 14, strokeWidth = 2.5 }: { width?: number; height?: number; strokeWidth?: number }) {
  return (
    <svg width={width} height={height + 6} viewBox={`0 0 ${width} ${height + 6}`} className="animate-halo"
      style={{ filter: "drop-shadow(0 0 5px #f0c855) drop-shadow(0 0 12px #f0c85570)" }}>
      <ellipse cx={width / 2} cy={(height + 6) / 2} rx={width / 2 - strokeWidth} ry={height / 2 - 1}
        fill="none" stroke="#f0c855" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

function HolyLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  const hw = size === "lg" ? 64 : size === "sm" ? 40 : 50;
  return (
    <div className="flex flex-col items-start gap-0.5">
      <div className="ml-1"><Halo width={hw} height={size === "lg" ? 16 : 12} strokeWidth={size === "lg" ? 3 : 2} /></div>
      <span className={`${textSize} font-bold tracking-tight leading-none`}>
        <span className="bg-gradient-to-r from-[#f0c855] via-[#fde68a] to-[#f0c855] bg-clip-text text-transparent">Holy</span>
        <span className="text-white">Snacks</span>
      </span>
    </div>
  );
}

// ─── STAR FIELD ───────────────────────────────────────────────────────────────

function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-full" style={{ zIndex: 0 }}>
      {STAR_DATA.map((s, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top:  `${s.y}%`,
            width:  s.size,
            height: s.size,
            opacity: s.minOpacity,
            ["--star-min" as string]: s.minOpacity,
            ["--star-max" as string]: s.maxOpacity,
            ["--dur"   as string]: `${s.dur}s`,
            ["--delay" as string]: `${s.delay}s`,
            ...(s.twinkle ? { animation: `twinkle ${s.dur}s ease-in-out infinite ${s.delay}s` } : {}),
            ...(s.drift   ? { animation: `drift   ${s.dur * 2}s ease-in-out infinite ${s.delay}s` } : {}),
          }}
        />
      ))}
      {/* Shooting stars */}
      {SHOOTING_STARS.map((ss, i) => (
        <div key={i} className="absolute"
          style={{
            left: `${ss.x}%`,
            top:  `${ss.y}%`,
            width: 90,
            height: 1.5,
            borderRadius: 2,
            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.85), transparent)",
            transform: `rotate(${ss.angle}deg)`,
            transformOrigin: "left center",
            animation: `shooting-star ${ss.dur}s linear infinite ${ss.delay}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── MOBILE PLANET SCROLLER ───────────────────────────────────────────────────

function MobilePlanetScroller({ onSelectCategory, onBadPlanet, onGoodPlanet, lang }: {
  onSelectCategory: (cat: Category) => void;
  onBadPlanet: () => void;
  onGoodPlanet: () => void;
  lang: "en" | "lt";
}) {
  return (
    <div className="w-full flex flex-col items-center gap-2">

      {/* ── Comet Banners (fixed above planet scroller) ── */}
      <div className="flex gap-2 w-full px-4 mb-1">

        {/* Good Comet — top-left approaching (tail extends left) */}
        <button onClick={onGoodPlanet} className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-4 active:scale-95 transition-all relative overflow-hidden"
          style={{
            background: "linear-gradient(105deg, rgba(4,30,16,0.97) 0%, rgba(5,46,22,0.85) 100%)",
            border: "1px solid rgba(34,197,94,0.4)",
            animation: "comet-banner-pulse-good 3s ease-in-out infinite",
          }}>
          {/* Tail visual extending LEFT */}
          <div style={{
            position: "absolute", right: "100%", top: "50%", marginTop: -8,
            width: 60, height: 16,
            background: "linear-gradient(to left, rgba(34,197,94,0.6), transparent)",
            borderRadius: "100px 0 0 100px",
            pointerEvents: "none",
          }} />
          {/* Glow behind nucleus */}
          <div style={{
            position: "absolute", left: 8, top: "50%", marginTop: -20,
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(34,197,94,0.25)", filter: "blur(10px)",
            pointerEvents: "none",
          }} />
          {/* Nucleus */}
          <div style={{
            width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
            background: "radial-gradient(circle at 30% 28%, #052e16, #14532d 55%, #021a0a)",
            boxShadow: "0 0 20px 7px rgba(34,197,94,0.6), inset 0 0 14px rgba(0,0,0,0.6)",
            border: "2px solid rgba(34,197,94,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", zIndex: 1,
          }}>
            <span style={{ fontSize: 20 }}>🌿</span>
          </div>
          {/* Text */}
          <div className="text-left min-w-0 flex-1 z-10">
            <div className="text-sm font-black tracking-wider leading-tight" style={{ color: "#22c55e" }}>
              {lang === "en" ? "GOOD PLANET" : "GEROJI PLANETA"}
            </div>
            <div className="text-[10px] text-white/45 leading-tight mt-1">
              {GOOD_INGREDIENTS.length} {lang === "en" ? "clean ingredients" : "švarių ingredientų"}
            </div>
          </div>
          <span className="text-emerald-400/60 text-sm z-10">→</span>
        </button>

        {/* Bad Comet — top-right approaching (tail extends right) */}
        <button onClick={onBadPlanet} className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-4 active:scale-95 transition-all relative overflow-hidden"
          style={{
            background: "linear-gradient(75deg, rgba(30,4,4,0.97) 0%, rgba(60,5,5,0.85) 100%)",
            border: "1px solid rgba(220,38,38,0.4)",
            animation: "comet-banner-pulse 3s ease-in-out infinite",
          }}>
          {/* Tail visual extending RIGHT */}
          <div style={{
            position: "absolute", left: "100%", top: "50%", marginTop: -8,
            width: 60, height: 16,
            background: "linear-gradient(to right, rgba(220,38,38,0.6), transparent)",
            borderRadius: "0 100px 100px 0",
            pointerEvents: "none",
          }} />
          {/* Glow behind nucleus */}
          <div style={{
            position: "absolute", right: 8, top: "50%", marginTop: -20,
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(220,38,38,0.25)", filter: "blur(10px)",
            pointerEvents: "none",
          }} />
          {/* Nucleus */}
          <div style={{
            width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
            background: "radial-gradient(circle at 30% 28%, #7f1d1d, #450a0a 55%, #1c0202)",
            boxShadow: "0 0 20px 7px rgba(220,38,38,0.6), inset 0 0 14px rgba(0,0,0,0.6)",
            border: "2px solid rgba(220,38,38,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", zIndex: 1,
          }}>
            <span style={{ fontSize: 20 }}>☠️</span>
          </div>
          {/* Text */}
          <div className="text-left min-w-0 flex-1 z-10">
            <div className="text-sm font-black tracking-wider leading-tight" style={{ color: "#ef4444" }}>
              {lang === "en" ? "BAD PLANET" : "BLOGOJI PLANETA"}
            </div>
            <div className="text-[10px] text-white/45 leading-tight mt-1">
              {lang === "en" ? "Toxins exposed" : "Atskleisti toksinai"}
            </div>
          </div>
          <span className="text-red-500/40 text-xs z-10">→</span>
        </button>
      </div>

      {/* ── Planet cards scroller ── */}
      <div
        className="w-full flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 py-4"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => onSelectCategory(cat)}
            className="snap-center flex-shrink-0 flex flex-col items-center gap-4 rounded-3xl p-6 transition-all active:scale-95 cursor-pointer text-left"
            style={{
              width: 230,
              background: `radial-gradient(ellipse at 50% 0%, ${cat.bgFrom}dd 0%, rgba(11,18,32,0.97) 100%)`,
              border: `1px solid ${cat.accentColor}28`,
              boxShadow: `0 0 40px ${cat.glow}18`,
            }}
          >
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center flex-shrink-0`}
              style={{
                boxShadow: `0 0 30px 6px ${cat.glow}, inset 0 0 18px rgba(255,255,255,0.15)`,
                border: "2px solid rgba(255,255,255,0.22)",
              }}>
              <span style={{ fontSize: 30 }}>{cat.icon}</span>
            </div>
            <div className="text-center">
              <div className="font-[var(--font-playfair)] font-black text-lg text-white mb-0.5">
                {lang === "lt" ? cat.labelLt : cat.label}
              </div>
              <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: cat.accentColor }}>
                {cat.products.length} {lang === "en" ? "products" : "produktai"}
              </div>
            </div>
            {cat.keyIngredients && (
              <div className="text-[9px] text-white/30 text-center leading-relaxed px-1">
                {cat.keyIngredients.map(ki => ki.name).join(" · ")}
              </div>
            )}
            <div className="px-4 py-1.5 rounded-full text-[10px] font-bold mt-auto"
              style={{ background: `${cat.accentColor}18`, color: cat.accentColor, border: `1px solid ${cat.accentColor}38` }}>
              {lang === "en" ? "Explore →" : "Tyrinėti →"}
            </div>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-white/25 tracking-[0.2em] uppercase animate-pulse">
        ← {lang === "en" ? "swipe to explore" : "braukite tyrinėti"} →
      </p>
    </div>
  );
}

// ─── PLANET ───────────────────────────────────────────────────────────────────

function Planet({ cat, cx, total, onClick }: { cat: Category; cx: number; total: number; onClick: () => void }) {
  const d = cat.radius * 2;
  return (
    <div className="absolute left-1/2 top-1/2 pointer-events-none" style={{ marginLeft: -cx, marginTop: -cx }}>
      {/* Orbit ring — no pointer events */}
      <svg width={total} height={total} className="absolute inset-0 pointer-events-none">
        <circle cx={cx} cy={cx} r={cat.radius} fill="none" stroke={cat.ring} strokeWidth="1" strokeDasharray="5 9" />
      </svg>
      {/* Rotating container — no pointer events */}
      <div className="absolute pointer-events-none" style={{
        width: d, height: d,
        left: cx - cat.radius, top: cx - cat.radius,
        animation: `orbit ${cat.duration}s linear infinite`,
        transform: `rotate(${cat.startAngle}deg)`,
      }}>
        {/* Planet — pointer events re-enabled here only */}
        <div className="absolute left-1/2 flex flex-col items-center cursor-pointer group pointer-events-auto"
          style={{ top: -cat.size / 2, animation: `counter-orbit ${cat.duration}s linear infinite` }}
          onClick={onClick}
        >
          <div className={`rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center select-none transition-all duration-300 group-hover:scale-110`}
            style={{
              width: cat.size, height: cat.size,
              boxShadow: `0 0 24px 6px ${cat.glow}, inset 0 0 20px rgba(255,255,255,0.15)`,
              border: "2px solid rgba(255,255,255,0.25)",
            }}
          >
            <span style={{ fontSize: cat.size * 0.38 }}>{cat.icon}</span>
          </div>
          <span className="mt-2 text-xs font-semibold tracking-widest uppercase whitespace-nowrap"
            style={{ color: cat.accentColor }}>
            {cat.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── BAD COMET (top-right corner, drifts toward center) ───────────────────────

function CometBad({ onClick }: { onClick: () => void }) {
  // Nucleus sits at component origin (top-left of component).
  // Tail extends from nucleus toward upper-right (away from solar system center).
  const SPARKS = [
    { x: 18,  y: -18,  d: 0,    dur: 1.4, s: 3, c: "#ef4444" },
    { x: 38,  y: -38,  d: 0.2,  dur: 1.8, s: 2, c: "#f97316" },
    { x: 24,  y: -55,  d: 0.45, dur: 1.2, s: 3, c: "#fca5a5" },
    { x: 58,  y: -48,  d: 0.7,  dur: 1.6, s: 2, c: "#ef4444" },
    { x: 42,  y: -72,  d: 1.0,  dur: 2.0, s: 2, c: "#f97316" },
    { x: 72,  y: -32,  d: 0.3,  dur: 1.3, s: 3, c: "#fca5a5" },
    { x: 55,  y: -88,  d: 0.85, dur: 1.7, s: 2, c: "#ef4444" },
    { x: 88,  y: -58,  d: 1.2,  dur: 1.5, s: 2, c: "#f97316" },
    { x: 95,  y: -95,  d: 0.55, dur: 1.9, s: 2, c: "#fca5a5" },
    { x: 65,  y: -105, d: 1.4,  dur: 1.4, s: 3, c: "#ef4444" },
  ];
  const NR = 36; // nucleus radius
  const NY = 36; // nucleus center Y in component

  return (
    <div className="absolute group cursor-pointer" onClick={onClick}
      style={{ left: 648, top: 28, animation: "comet-bad-drift 8s ease-in-out infinite", zIndex: 20 }}>

      {/* ── Tail glow — pivot at nucleus center so sphere covers the root ── */}
      <div style={{
        position: "absolute", left: NR, top: NR - 26,
        width: 190, height: 52,
        background: "linear-gradient(to right, rgba(220,38,38,0.65), rgba(220,38,38,0))",
        clipPath: "polygon(0% 0%, 100% 38%, 100% 62%, 0% 100%)",
        transformOrigin: "left center", transform: "rotate(-45deg)",
        filter: "blur(14px)", pointerEvents: "none",
      }} />
      {/* ── Tail sharp core ── */}
      <div style={{
        position: "absolute", left: NR, top: NR - 11,
        width: 165, height: 22,
        background: "linear-gradient(to right, rgba(239,68,68,0.95), rgba(239,68,68,0))",
        clipPath: "polygon(0% 0%, 100% 32%, 100% 68%, 0% 100%)",
        transformOrigin: "left center", transform: "rotate(-45deg)",
        pointerEvents: "none",
      }} />
      {/* ── Tail inner bright streak ── */}
      <div style={{
        position: "absolute", left: NR, top: NR - 5,
        width: 100, height: 10,
        background: "linear-gradient(to right, rgba(255,160,100,0.95), rgba(255,160,100,0))",
        transformOrigin: "left center", transform: "rotate(-45deg)",
        pointerEvents: "none",
      }} />

      {/* ── Spark particles along tail ── */}
      {SPARKS.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          width: p.s, height: p.s, borderRadius: "50%",
          background: p.c,
          left: NR + p.x, top: NY + p.y,
          animation: `spark-bad ${p.dur}s ease-out ${p.d}s infinite`,
          "--fx": `${p.x * 0.55}px`,
          "--fy": `${p.y * 0.55}px`,
          pointerEvents: "none",
          boxShadow: `0 0 ${p.s + 2}px ${p.c}`,
        } as React.CSSProperties} />
      ))}

      {/* ── Nucleus ── */}
      <div style={{ animation: "comet-nucleus-pulse 2s ease-in-out infinite", position: "relative", zIndex: 10 }}
        className="transition-transform duration-300 group-hover:scale-110">
        <div style={{
          width: NR * 2, height: NR * 2, borderRadius: "50%",
          background: "radial-gradient(circle at 30% 28%, #7f1d1d, #450a0a 58%, #1c0202)",
          boxShadow: "0 0 36px 14px rgba(220,38,38,0.62), 0 0 72px 28px rgba(220,38,38,0.2), inset 0 0 28px rgba(0,0,0,0.75)",
          border: "2px solid rgba(220,38,38,0.58)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 26 }}>☠️</span>
        </div>
        {/* Hover tooltip — replaces tiny static label */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
            background: "rgba(30,4,4,0.96)", border: "1px solid rgba(220,38,38,0.45)",
            borderRadius: 8, padding: "5px 10px", whiteSpace: "nowrap", zIndex: 50,
            backdropFilter: "blur(8px)",
          }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#ef4444" }}>☠️ Bad Planet</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>Click to see what to avoid</div>
          {/* Arrow */}
          <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%) rotate(45deg)",
            width: 8, height: 8, background: "rgba(30,4,4,0.96)", border: "0 0 1px 1px solid rgba(220,38,38,0.45)",
            borderRight: "1px solid rgba(220,38,38,0.45)", borderBottom: "1px solid rgba(220,38,38,0.45)" }} />
        </div>
      </div>
    </div>
  );
}

// ─── GOOD COMET (top-left corner, drifts toward center) ───────────────────────

function CometGood({ onClick }: { onClick: () => void }) {
  // Tail extends from nucleus toward upper-left (away from solar system center).
  const SPARKS = [
    { x: -18,  y: -18,  d: 0,    dur: 1.4, s: 3, c: "#22c55e" },
    { x: -38,  y: -38,  d: 0.2,  dur: 1.8, s: 2, c: "#4ade80" },
    { x: -24,  y: -55,  d: 0.45, dur: 1.2, s: 3, c: "#86efac" },
    { x: -58,  y: -48,  d: 0.7,  dur: 1.6, s: 2, c: "#22c55e" },
    { x: -42,  y: -72,  d: 1.0,  dur: 2.0, s: 2, c: "#4ade80" },
    { x: -72,  y: -32,  d: 0.3,  dur: 1.3, s: 3, c: "#86efac" },
    { x: -55,  y: -88,  d: 0.85, dur: 1.7, s: 2, c: "#22c55e" },
    { x: -88,  y: -58,  d: 1.2,  dur: 1.5, s: 2, c: "#4ade80" },
    { x: -95,  y: -95,  d: 0.55, dur: 1.9, s: 2, c: "#86efac" },
    { x: -65,  y: -105, d: 1.4,  dur: 1.4, s: 3, c: "#22c55e" },
  ];
  const NR = 36;
  const NY = 36;

  return (
    <div className="absolute group cursor-pointer" onClick={onClick}
      style={{ left: 80, top: 28, animation: "comet-good-drift 8s ease-in-out infinite", zIndex: 20 }}>

      {/* ── Tail glow — pivot at nucleus center so sphere covers the root ── */}
      <div style={{
        position: "absolute", left: NR - 190, top: NR - 26,
        width: 190, height: 52,
        background: "linear-gradient(to left, rgba(34,197,94,0.65), rgba(34,197,94,0))",
        clipPath: "polygon(100% 0%, 0% 38%, 0% 62%, 100% 100%)",
        transformOrigin: "right center", transform: "rotate(45deg)",
        filter: "blur(14px)", pointerEvents: "none",
      }} />
      {/* ── Tail sharp core ── */}
      <div style={{
        position: "absolute", left: NR - 165, top: NR - 11,
        width: 165, height: 22,
        background: "linear-gradient(to left, rgba(34,197,94,0.95), rgba(34,197,94,0))",
        clipPath: "polygon(100% 0%, 0% 32%, 0% 68%, 100% 100%)",
        transformOrigin: "right center", transform: "rotate(45deg)",
        pointerEvents: "none",
      }} />
      {/* ── Tail inner bright streak ── */}
      <div style={{
        position: "absolute", left: NR - 100, top: NR - 5,
        width: 100, height: 10,
        background: "linear-gradient(to left, rgba(74,222,128,0.95), rgba(74,222,128,0))",
        transformOrigin: "right center", transform: "rotate(45deg)",
        pointerEvents: "none",
      }} />

      {/* ── Spark particles along tail ── */}
      {SPARKS.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          width: p.s, height: p.s, borderRadius: "50%",
          background: p.c,
          left: NR + p.x, top: NY + p.y,
          animation: `spark-good ${p.dur}s ease-out ${p.d}s infinite`,
          "--fx": `${p.x * 0.55}px`,
          "--fy": `${p.y * 0.55}px`,
          pointerEvents: "none",
          boxShadow: `0 0 ${p.s + 2}px ${p.c}`,
        } as React.CSSProperties} />
      ))}

      {/* ── Nucleus ── */}
      <div style={{ animation: "comet-nucleus-pulse 2.2s ease-in-out infinite", position: "relative", zIndex: 10 }}
        className="transition-transform duration-300 group-hover:scale-110">
        <div style={{
          width: NR * 2, height: NR * 2, borderRadius: "50%",
          background: "radial-gradient(circle at 30% 28%, #052e16, #14532d 58%, #021a0a)",
          boxShadow: "0 0 36px 14px rgba(34,197,94,0.62), 0 0 72px 28px rgba(34,197,94,0.2), inset 0 0 28px rgba(0,0,0,0.75)",
          border: "2px solid rgba(34,197,94,0.58)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 26 }}>🌿</span>
        </div>
        {/* Hover tooltip — replaces tiny static label */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
            background: "rgba(4,30,16,0.96)", border: "1px solid rgba(34,197,94,0.45)",
            borderRadius: 8, padding: "5px 10px", whiteSpace: "nowrap", zIndex: 50,
            backdropFilter: "blur(8px)",
          }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#22c55e" }}>🌿 Good Planet</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>Click to see clean ingredients</div>
          {/* Arrow */}
          <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%) rotate(45deg)",
            width: 8, height: 8, background: "rgba(4,30,16,0.96)",
            borderRight: "1px solid rgba(34,197,94,0.45)", borderBottom: "1px solid rgba(34,197,94,0.45)" }} />
        </div>
      </div>
    </div>
  );
}

// ─── SOLAR SYSTEM ─────────────────────────────────────────────────────────────

function SolarSystem({ onSelectCategory, onBadPlanet, onGoodPlanet, hint }: {
  onSelectCategory: (cat: Category) => void;
  onBadPlanet: () => void;
  onGoodPlanet: () => void;
  hint: string;
}) {
  const total = 800;
  const cx = total / 2;
  const [hintVisible, setHintVisible] = useState(true);

  const handleInteract = (cb: () => void) => {
    setHintVisible(false);
    cb();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: total, height: total }}>
        {/* Star field background */}
        <StarField />
        {/* Central sun — clickable → Mission */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="absolute inset-0 rounded-full blur-3xl scale-[3] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(240,200,85,0.3) 0%, transparent 70%)" }} />
          <a href="#mission" className="block relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer group pointer-events-auto"
            style={{
              background: "radial-gradient(circle at 35% 35%, #fde68a, #f0c855 50%, #b8860b)",
              boxShadow: "0 0 50px 15px rgba(240,200,85,0.45), 0 0 100px 30px rgba(240,200,85,0.15)",
              transition: "box-shadow 0.3s, transform 0.3s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 70px 25px rgba(240,200,85,0.65), 0 0 130px 50px rgba(240,200,85,0.25)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px 15px rgba(240,200,85,0.45), 0 0 100px 30px rgba(240,200,85,0.15)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <span className="font-[var(--font-playfair)] font-black text-2xl text-[#0b1220] select-none">H</span>
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ color: "#f0c855" }}>Mission ↓</span>
          </a>
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none">
            <Halo width={80} height={20} strokeWidth={2.5} />
          </div>
        </div>
        {/* Product category planets */}
        {CATEGORIES.map((cat, i) => (
          <Planet key={i} cat={cat} cx={cx} total={total} onClick={() => handleInteract(() => onSelectCategory(cat))} />
        ))}
        {/* ── Comets — outside planet orbits, top corners, drifting inward ── */}
        <CometBad onClick={() => handleInteract(onBadPlanet)} />
        <CometGood onClick={() => handleInteract(onGoodPlanet)} />

        {/* ── First-visit hint callout — fades out after interaction ── */}
        {hintVisible && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ animation: "fade-in-up 1s ease-out 1.5s both", zIndex: 30 }}>
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
              style={{
                background: "rgba(240,200,85,0.08)",
                border: "1px solid rgba(240,200,85,0.25)",
                backdropFilter: "blur(8px)",
              }}>
              <span style={{ fontSize: 16, animation: "float 2s ease-in-out infinite" }}>👆</span>
              <span className="text-xs font-semibold tracking-wider uppercase whitespace-nowrap"
                style={{ color: "rgba(240,200,85,0.75)" }}>{hint}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CATEGORY PAGE ────────────────────────────────────────────────────────────

function CategoryPage({ cat, lang, onBack, onAddToCart, onOpenDetail }: {
  cat: Category; lang: "en" | "lt"; onBack: () => void;
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
      <div className={`relative flex flex-col items-center justify-center py-16 px-6 text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
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
      <div className="max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

// ─── SHOP PAGE ────────────────────────────────────────────────────────────────

function ShopPage({ lang, onBack, onOpenCat, onAddToCart, onOpenDetail }: {
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

// ─── BAD PLANET PAGE ──────────────────────────────────────────────────────────

function BadPlanetPage({ lang, onBack }: { lang: "en" | "lt"; onBack: () => void }) {
  const [visible, setVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const dangerMeta = {
    high:   { label: "HIGH RISK",   labelLt: "DIDELĖ RIZIKA",   color: "#ef4444", border: "rgba(220,38,38,0.40)", bg: "rgba(220,38,38,0.09)"  },
    medium: { label: "MEDIUM RISK", labelLt: "VIDUTINĖ RIZIKA", color: "#f97316", border: "rgba(234,88,12,0.35)", bg: "rgba(234,88,12,0.08)"  },
    low:    { label: "CAUTION",     labelLt: "DĖMESIO",         color: "#eab308", border: "rgba(202,138,4,0.30)", bg: "rgba(202,138,4,0.07)"  },
  };

  const filtered = activeCategory === "all"
    ? BAD_INGREDIENTS
    : BAD_INGREDIENTS.filter(ing => ing.category === activeCategory);

  const highCount   = BAD_INGREDIENTS.filter(i => i.danger === "high").length;
  const bannedCount = BAD_INGREDIENTS.filter(i => i.bannedIn).length;
  const total       = BAD_INGREDIENTS.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#08060e" }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-red-950/40"
        style={{ background: "rgba(8,6,14,0.96)" }}>
        <button onClick={onBack} className="text-sm font-semibold text-red-400/55 hover:text-red-400 transition-colors">
          {lang === "en" ? "← Back to Universe" : "← Grįžti į visatą"}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">☠️</span>
          <span className="font-[var(--font-playfair)] text-lg font-bold" style={{ color: "#fca5a5" }}>
            {lang === "en" ? "The Bad Planet" : "Blogoji planeta"}
          </span>
        </div>
        <HolyLogo size="sm" />
      </div>

      {/* ── Hero ── */}
      <div className={`relative py-16 px-6 text-center overflow-hidden transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        {/* Background atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px]"
            style={{ background: "radial-gradient(ellipse, rgba(180,0,0,0.18) 0%, transparent 65%)" }} />
          {[-60,-35,-12,0,12,35,60].map((deg, i) => (
            <div key={i} className="absolute top-0 left-1/2 origin-top h-96 w-px opacity-[0.04]"
              style={{ background: "linear-gradient(to bottom, #ef4444, transparent)", transform: `rotate(${deg}deg)` }} />
          ))}
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Planet */}
          <div className="w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center animate-float"
            style={{
              background: "radial-gradient(circle at 35% 35%, #7f1d1d, #450a0a 55%, #120000)",
              boxShadow: "0 0 90px 28px rgba(200,0,0,0.22), 0 0 40px 10px rgba(220,38,38,0.15), inset 0 0 30px rgba(0,0,0,0.8)",
              border: "2px solid rgba(220,38,38,0.28)",
            }}>
            <span className="text-5xl">☠️</span>
          </div>

          <p className="text-red-500/50 text-xs tracking-[0.3em] uppercase font-bold mb-4">
            ☠ {lang === "en" ? "Educational — No products for sale" : "Edukacinis — Produktų nėra"} ☠
          </p>
          <h1 className="font-[var(--font-playfair)] text-4xl md:text-6xl font-black mb-5 leading-tight"
            style={{ color: "#fca5a5", textShadow: "0 0 60px rgba(220,38,38,0.45)" }}>
            {lang === "en" ? "What Hides in Your Snacks" : "Kas slepiasi tavo užkandžiuose"}
          </h1>
          <p className="text-white/45 text-base md:text-lg leading-relaxed mb-10">
            {lang === "en"
              ? "The global food industry uses hundreds of additives, preservatives, and synthetic ingredients — many banned in other countries or linked to serious health issues. We researched every single one so you don't have to."
              : "Pasaulinė maisto pramonė naudoja šimtus priedų, konservantų ir sintetinių ingredientų. Daugelis jų yra uždrausti kitose šalyse arba siejami su rimtomis sveikatos problemomis. Mes juos ištyrėme už jus."}
          </p>

          {/* Stats row */}
          <div className="flex justify-center gap-5 md:gap-12 mb-10 flex-wrap">
            {[
              { num: total,        suffix: "",  label: lang === "en" ? "Ingredients Exposed"  : "Atskleistų ingredientų", red: true  },
              { num: highCount,    suffix: "",  label: lang === "en" ? "High Risk"             : "Didelė rizika",           red: true  },
              { num: bannedCount,  suffix: "+", label: lang === "en" ? "Banned Somewhere"      : "Uždrausti šalyse",        red: true  },
              { num: 0,            suffix: "",  label: lang === "en" ? "In HolySnacks"         : "HolySnacks produktuose",  red: false },
            ].map((s, i) => (
              <div key={i} className="text-center px-4">
                <div className="font-[var(--font-playfair)] text-4xl font-black mb-1"
                  style={{ color: s.red ? "#ef4444" : "#f0c855" }}>
                  {s.num}{s.suffix}
                </div>
                <div className="text-xs text-white/30 tracking-widest uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Danger legend */}
          <div className="flex justify-center gap-3 flex-wrap">
            {(["high", "medium", "low"] as const).map(d => (
              <div key={d} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
                style={{ background: dangerMeta[d].bg, border: `1px solid ${dangerMeta[d].border}`, color: dangerMeta[d].color }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dangerMeta[d].color }} />
                {lang === "en" ? dangerMeta[d].label : dangerMeta[d].labelLt}
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.35)" }}>
              🚫 {lang === "en" ? "Banned in countries" : "Uždrausti šalyse"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category filter tabs (sticky) ── */}
      <div className="sticky top-[65px] z-10 border-b border-white/5"
        style={{ background: "rgba(8,6,14,0.98)", backdropFilter: "blur(12px)" }}>
        <div className="flex flex-wrap gap-2 px-6 py-3 justify-center">
          {BAD_CATEGORIES.map(bc => {
            const count = bc.id === "all"
              ? BAD_INGREDIENTS.length
              : BAD_INGREDIENTS.filter(i => i.category === bc.id).length;
            const isActive = activeCategory === bc.id;
            return (
              <button key={bc.id} onClick={() => setActiveCategory(bc.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all"
                style={isActive ? {
                  background: "linear-gradient(135deg, #991b1b, #dc2626)",
                  color: "#fff",
                  boxShadow: "0 0 18px rgba(220,38,38,0.45)",
                } : {
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.40)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                <span>{bc.icon}</span>
                <span>{lang === "lt" ? bc.labelLt : bc.label}</span>
                <span className="opacity-40 ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ingredients grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-16">
        <p className="text-white/20 text-xs tracking-widest uppercase mb-6">
          {lang === "en"
            ? `Showing ${filtered.length} of ${total} ingredients — 0 found in HolySnacks`
            : `Rodoma ${filtered.length} iš ${total} ingredientų — 0 HolySnacks produktuose`}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ing, i) => {
            const dm = dangerMeta[ing.danger];
            const cardKey = ing.name;
            const isExpanded = expandedCard === cardKey;
            return (
              <div key={cardKey}
                className={`rounded-2xl overflow-hidden flex flex-col hover:-translate-y-0.5 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  background: dm.bg,
                  border: `1px solid ${dm.border}`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
                  transition: `opacity 0.5s ${((i % 9) * 55 + 80) / 1000}s, transform 0.5s ${((i % 9) * 55 + 80) / 1000}s`,
                }}>

                {/* Card header */}
                <div className={`h-24 bg-gradient-to-br ${ing.gradient} relative flex items-center justify-center overflow-hidden flex-shrink-0`}>
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)]" />
                  <span className="text-5xl relative z-10 drop-shadow-lg select-none">{ing.emoji}</span>

                  {/* Danger badge */}
                  <span className="absolute top-2 right-2 text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest"
                    style={{ background: "rgba(0,0,0,0.65)", color: dm.color, border: `1px solid ${dm.color}35` }}>
                    {lang === "en" ? dm.label : dm.labelLt}
                  </span>

                  {/* Banned badge */}
                  {ing.bannedIn && (
                    <span className="absolute top-2 left-2 text-[8px] font-black px-2 py-0.5 rounded-full bg-black/70 text-white/60 border border-white/10 tracking-wider">
                      🚫 BANNED
                    </span>
                  )}

                  {/* E-number */}
                  {ing.eNumber && (
                    <span className="absolute bottom-2 right-2 text-[8px] font-mono text-white/35 tracking-wider">
                      {ing.eNumber}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col flex-1 gap-2.5">
                  <h3 className="font-[var(--font-playfair)] font-bold text-base leading-snug" style={{ color: dm.color }}>
                    {ing.name}
                  </h3>

                  {/* Also known as */}
                  {ing.alsoKnownAs && (
                    <div className="text-[9px] leading-relaxed" style={{ color: `${dm.color}60` }}>
                      <span className="font-black tracking-widest uppercase">🏷 {lang === "en" ? "Also known as" : "Taip pat žinoma kaip"}: </span>
                      <span className="text-white/35">{ing.alsoKnownAs}</span>
                    </div>
                  )}

                  {/* Banned in */}
                  {ing.bannedIn && (
                    <div className="px-2.5 py-1.5 rounded-lg text-[9px] leading-relaxed"
                      style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.18)" }}>
                      <span className="font-black text-red-400/60 tracking-widest uppercase">🚫 {lang === "en" ? "Banned" : "Uždrausta"}: </span>
                      <span className="text-white/40">{ing.bannedIn}</span>
                    </div>
                  )}

                  {/* Hides in */}
                  <div>
                    <p className="text-[8px] font-black tracking-[0.18em] uppercase mb-1" style={{ color: `${dm.color}55` }}>
                      🕵️ {lang === "en" ? "Hides in" : "Slepiasi"}
                    </p>
                    <p className="text-[11px] text-white/45 leading-relaxed">{ing.hidesIn}</p>
                  </div>

                  {/* Why harmful — collapsible */}
                  <div className="flex-1">
                    <p className="text-[8px] font-black tracking-[0.18em] uppercase mb-1" style={{ color: `${dm.color}55` }}>
                      ⚠️ {lang === "en" ? "Why harmful" : "Kodėl kenksminga"}
                    </p>
                    <p className={`text-[11px] text-white/65 leading-relaxed transition-all duration-300 ${isExpanded ? "" : "line-clamp-3"}`}>
                      {ing.whyBad}
                    </p>
                    <button
                      className="text-[9px] font-bold mt-1.5 transition-opacity hover:opacity-100 opacity-60"
                      style={{ color: dm.color }}
                      onClick={() => setExpandedCard(isExpanded ? null : cardKey)}
                    >
                      {isExpanded
                        ? (lang === "en" ? "Show less ↑" : "Mažiau ↑")
                        : (lang === "en" ? "Read more ↓" : "Daugiau ↓")}
                    </button>
                  </div>

                  {/* Holy Promise */}
                  <div className="px-3 py-2.5 rounded-xl mt-1"
                    style={{ background: "rgba(240,200,85,0.055)", border: "1px solid rgba(240,200,85,0.14)" }}>
                    <p className="text-[8px] font-black tracking-[0.18em] uppercase text-[#f0c855]/45 mb-1">
                      ✦ {lang === "en" ? "HolySnacks Promise" : "HolySnacks pažadas"}
                    </p>
                    <p className="text-[11px] text-[#f0c855]/75 leading-relaxed">{ing.holyPromise}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="px-6 pb-24">
        <div className="max-w-xl mx-auto text-center p-10 rounded-3xl"
          style={{ background: "rgba(240,200,85,0.04)", border: "1px solid rgba(240,200,85,0.13)" }}>
          <div className="w-12 h-12 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              background: "radial-gradient(circle at 35% 35%, #fde68a, #f0c855 50%, #b8860b)",
              boxShadow: "0 0 24px 6px rgba(240,200,85,0.35)",
            }}>
            <span className="font-[var(--font-playfair)] font-black text-lg text-[#0b1220]">H</span>
          </div>
          <p className="text-[#f0c855]/25 text-xs tracking-widest uppercase mb-4">✦ ✦ ✦</p>
          <h3 className="font-[var(--font-playfair)] text-2xl md:text-3xl font-black text-white mb-3">
            {lang === "en" ? "Now you know." : "Dabar žinai."}
          </h3>
          <p className="text-white/30 text-sm leading-relaxed mb-8">
            {lang === "en"
              ? `Every one of these ${total} ingredients is absent from every single HolySnacks product. That's not luck — that's the mission.`
              : `Nė vieno iš šių ${total} ingredientų nėra jokiame HolySnacks produkte. Tai ne atsitiktinumas — tai mūsų misija.`}
          </p>
          <button onClick={onBack}
            className="px-8 py-4 rounded-full font-bold text-sm hover:opacity-90 transition-all hover:scale-105 text-[#0b1220]"
            style={{ background: "linear-gradient(to right, #d4a830, #fad55c)", boxShadow: "0 4px 28px rgba(240,200,85,0.28)" }}>
            ✦ {lang === "en" ? "Choose the Holy Path" : "Pasirink šventą kelią"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TESTIMONIALS SECTION ─────────────────────────────────────────────────────

function TestimonialsSection({ lang }: { lang: "en" | "lt" }) {
  const anim = useInView();
  return (
    <section className="px-6 py-24 border-t border-[#f0c855]/10"
      style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(240,200,85,0.04) 0%, transparent 65%), #0b1220" }}>
      <div ref={anim.ref}
        className={`max-w-6xl mx-auto transition-all duration-700 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        <div className="text-center mb-14">
          <p className="text-[#f0c855]/45 text-xs tracking-widest uppercase mb-4">✦ ✦ ✦</p>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-white mb-4">
            {lang === "en" ? "The Chosen Speak" : "Sako išrinktieji"}
          </h2>
          <p className="text-white/35 max-w-sm mx-auto text-sm">
            {lang === "en" ? "Real people. Real results. No sponsored posts." : "Tikri žmonės. Tikri atsiliepimai. Jokių reklaminių postų."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i}
              className="p-6 rounded-2xl flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(240,200,85,0.09)" }}>

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <span key={s} className="text-sm" style={{ color: "#f0c855" }}>★</span>
                ))}
              </div>

              {/* Text */}
              <p className="text-white/60 text-sm leading-relaxed flex-1">"{t.text}"</p>

              {/* Product */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-base">{t.catIcon}</span>
                <span className="text-xs font-semibold" style={{ color: "#f0c855" }}>{t.productName}</span>
              </div>

              {/* Author */}
              <div className="pt-3 border-t border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: "rgba(240,200,85,0.14)", color: "#f0c855" }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white/80">{t.name}</div>
                  <div className="text-[10px] text-white/25">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FOUNDER STORY SECTION ────────────────────────────────────────────────────

function FounderStorySection({ lang }: { lang: "en" | "lt" }) {
  const anim = useInView(0.1);
  const pillars = lang === "en" ? [
    { icon: "🔬", stat: "3 yrs", label: "of ingredient research" },
    { icon: "📋", stat: "52+",   label: "harmful ingredients catalogued" },
    { icon: "🌿", stat: "100%",  label: "natural formulations only" },
    { icon: "🌍", stat: "12+",   label: "countries we source from" },
  ] : [
    { icon: "🔬", stat: "3 m.",  label: "ingredientų tyrimų" },
    { icon: "📋", stat: "52+",   label: "žalingų ingredientų kataloge" },
    { icon: "🌿", stat: "100%",  label: "natūralios formuluotės" },
    { icon: "🌍", stat: "12+",   label: "šalių, iš kurių tiekiame" },
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden" style={{ background: "radial-gradient(ellipse at 60% 50%, #0d1a0d 0%, #0b1220 60%)" }}>
      {/* Subtle green ambient glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }} />

      <div ref={anim.ref} className="max-w-6xl mx-auto">
        {/* Label */}
        <p className={`text-[10px] font-bold tracking-[0.3em] uppercase mb-4 transition-all duration-700 ${anim.inView ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ color: "#22c55e" }}>
          ✦ {lang === "en" ? "Our Origin" : "Mūsų istorija"}
        </p>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — story text */}
          <div className={`transition-all duration-700 delay-100 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              {lang === "en"
                ? <>We read the labels<br /><span style={{ color: "#22c55e" }}>so you never have to.</span></>
                : <>Mes skaitome etiketes,<br /><span style={{ color: "#22c55e" }}>kad jums nereikėtų.</span></>}
            </h2>
            <div className="space-y-4 text-white/55 leading-relaxed text-base">
              <p>
                {lang === "en"
                  ? "HolySnacks was born from a simple frustration: why is it so hard to find a snack you can actually trust? Every aisle, every label — a maze of numbers, chemicals, and names nobody can pronounce."
                  : "HolySnacks gimė iš paprastos frustrancijos: kodėl taip sunku rasti užkandį, kuriuo galima tikrai pasitikėti? Kiekviena parduotuvės eilė — cheminių pavadinimų labirintas."}
              </p>
              <p>
                {lang === "en"
                  ? "We spent years cataloguing what the food industry hides in plain sight — artificial dyes, hidden sugars, synthetic preservatives, packaging chemicals that leach into your food. 52 ingredients. The Bad Planet."
                  : "Metus katalogavome, ką maisto pramonė slepia aiškiai matomoje vietoje — dirbtiniai dažai, paslėpti cukrūs, sintetiniai konservantai. 52 ingredientai. Blogoji planeta."}
              </p>
              <p>
                {lang === "en"
                  ? "Then we built the alternative. Every HolySnacks product starts with one rule: if we wouldn't feed it to someone we love, it doesn't go in. No exceptions."
                  : "Tada sukūrėme alternatyvą. Kiekvienas HolySnacks produktas prasideda nuo vienos taisyklės: jei neleistume to valgyti artimiesiems — to nebus sudėtyje. Jokių išimčių."}
              </p>
            </div>

            {/* Pull quote */}
            <div className="mt-10 pl-5 border-l-2 border-[#22c55e]/40">
              <p className="font-[var(--font-playfair)] text-xl text-white/80 italic leading-snug">
                {lang === "en"
                  ? "\"Premium doesn't mean expensive. It means honest.\""
                  : "\"Premium nereiškia brangaus. Tai reiškia sąžiningą.\""}
              </p>
              <p className="text-xs text-white/30 mt-2 tracking-widest uppercase">— HolySnacks</p>
            </div>
          </div>

          {/* Right — stats grid */}
          <div className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-200 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {pillars.map((p, i) => (
              <div key={i} className="rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(34,197,94,0.12)",
                  boxShadow: "0 0 24px rgba(34,197,94,0.05)",
                  animationDelay: `${i * 100}ms`,
                }}>
                <span className="text-3xl">{p.icon}</span>
                <div>
                  <div className="font-[var(--font-playfair)] text-3xl font-black" style={{ color: "#22c55e" }}>{p.stat}</div>
                  <div className="text-xs text-white/40 mt-1 leading-snug">{p.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── INGREDIENT SCANNER SECTION ───────────────────────────────────────────────

type ScanResult = { ingredient: BadIngredient; matched: string };
type FetchedProduct = { productName: string; brand: string; ingredients: string; nutriscore: string | null; image: string | null };
type ScanHistoryItem = { query: string; productName: string; score: number; timestamp: number };

// ─── BONUS INGREDIENTS DATABASE (scanner — awards bonus purity points) ────────

type BonusIngredient = {
  name: string;
  emoji: string;
  bonus: number;        // points ADDED to purity score
  aliases: string[];    // terms to match in ingredient lists
  whyGood: string;
};

type GoodResult = { ingredient: BonusIngredient; matched: string };

const BONUS_INGREDIENTS: BonusIngredient[] = [
  // ── DENTAL / FUNCTIONAL ──
  { name: "Nano-Hydroxyapatite", emoji: "🦷", bonus: 250,
    aliases: ["nano-hydroxyapatite", "nano hydroxyapatite", "hydroxyapatite", "n-ha", "nha"],
    whyGood: "The exact mineral teeth are made of. Remineralises enamel at the nano scale. Clinically proven fluoride alternative used in Japanese dentistry since the 1980s." },
  { name: "Birch Xylitol", emoji: "🌿", bonus: 180,
    aliases: ["xylitol", "birch xylitol", "birch sugar", "xylitol (birch)"],
    whyGood: "Actively starves cavity-causing bacteria. Zero glycaemic impact. Inhibits Streptococcus mutans — the primary tooth-decay bacterium." },
  { name: "Probiotics / Live Cultures", emoji: "🦠", bonus: 200,
    aliases: ["probiotics", "live cultures", "lactobacillus", "bifidobacterium", "live active cultures", "acidophilus", "bifidus"],
    whyGood: "Supports gut microbiome diversity, immunity, and the gut-brain axis. Genuine, well-documented functional health benefit." },
  { name: "Chicle Gum Base", emoji: "🌱", bonus: 120,
    aliases: ["chicle", "natural gum base", "chicle gum base", "natural resin"],
    whyGood: "Ancient natural resin from the Sapodilla tree. Biodegradable, no synthetic polymers, no petrochemicals — gum as nature intended." },

  // ── PREMIUM FATS & OILS ──
  { name: "Extra-Virgin Olive Oil", emoji: "🫒", bonus: 150,
    // "olive oil" alone is too broad — refined olive oil is common in restaurant/junk food.
    // Only reward when the label explicitly says extra-virgin or cold-pressed.
    aliases: ["extra virgin olive oil", "extra-virgin olive oil", "cold-pressed olive oil", "evoo"],
    whyGood: "First cold press retains polyphenols and oleocanthal — a natural anti-inflammatory compound equivalent in potency to low-dose ibuprofen at typical dietary amounts." },
  { name: "Virgin Coconut Oil", emoji: "🥥", bonus: 100,
    aliases: ["virgin coconut oil", "cold-pressed coconut oil", "unrefined coconut oil", "raw coconut oil"],
    whyGood: "Rich in MCTs (medium-chain triglycerides) — rapidly metabolised for energy. Natural lauric acid has antimicrobial properties." },

  // ── CLEAN SWEETENERS ──
  { name: "Organic Stevia Leaf", emoji: "🌱", bonus: 120,
    aliases: ["stevia", "stevia leaf extract", "organic stevia", "stevia rebaudiana", "rebaudioside a"],
    whyGood: "Zero-calorie, zero-GI natural sweetener. Whole-leaf extract contains beneficial glycosides — not an isolated synthetic compound." },
  { name: "Coconut Sugar", emoji: "🥥", bonus: 80,
    aliases: ["coconut sugar", "coconut palm sugar", "coconut blossom sugar"],
    whyGood: "GI of 35 vs cane sugar at 65. Unrefined — retains minerals and inulin prebiotic fibre. Sustainably tapped without destroying the tree." },
  { name: "Raw Honey", emoji: "🍯", bonus: 100,
    aliases: ["raw honey", "pure honey", "organic honey", "manuka honey"],
    whyGood: "Contains 31+ polyphenols, active enzymes, and natural antimicrobial hydrogen peroxide. Thousands of years of documented safe use." },
  { name: "Maple Syrup (Pure)", emoji: "🍁", bonus: 60,
    aliases: ["pure maple syrup", "maple syrup", "grade a maple syrup"],
    whyGood: "Contains 24+ antioxidants and minerals including zinc and manganese. Lower GI than refined sugar." },

  // ── CLEAN SALTS & MINERALS ──
  { name: "Himalayan Pink Salt", emoji: "🏔️", bonus: 100,
    aliases: ["himalayan salt", "himalayan pink salt", "pink himalayan salt", "pink salt", "rock salt"],
    whyGood: "Hand-mined, zero industrial processing. 84 naturally occurring trace minerals. No anti-caking agents, no bleaching, no chemical treatment." },
  { name: "Natural Sea Salt", emoji: "🌊", bonus: 50,
    aliases: ["sea salt", "natural sea salt", "celtic sea salt", "fleur de sel", "sel gris"],
    whyGood: "Natural trace mineral content preserved. No chemical bleaching, no synthetic anti-caking agents unlike refined table salt." },
  { name: "Natural Electrolytes", emoji: "⚡", bonus: 100,
    // "electrolytes" bare is too generic. Require "natural electrolytes" or the full mineral name
    // as a group (individual ions appear in too many processed foods as additives).
    aliases: ["natural electrolytes", "mineral electrolytes"],
    whyGood: "Essential minerals for hydration, nerve signalling, and muscle function from mineral sources — not synthetic laboratory salts." },

  // ── NATURAL COLORS ──
  { name: "Beet Juice Powder", emoji: "🫚", bonus: 80,
    aliases: ["beet juice powder", "beetroot powder", "beetroot juice", "beet powder", "beet juice"],
    whyGood: "Natural red pigment containing betalains — potent antioxidants that reduce oxidative stress. Also supports nitric oxide production for cardiovascular health." },
  { name: "Turmeric", emoji: "💛", bonus: 100,
    aliases: ["turmeric", "curcumin", "turmeric extract", "turmeric powder", "curcuma longa"],
    whyGood: "Contains curcumin — one of the most studied natural anti-inflammatory compounds in nutritional science. Over 3,000 published peer-reviewed studies." },
  { name: "Spirulina Extract", emoji: "💚", bonus: 100,
    aliases: ["spirulina", "spirulina extract", "spirulina powder", "phycocyanin"],
    whyGood: "Blue-green algae with all essential amino acids, B12, iron, and the powerful antioxidant phycocyanin. One of Earth's most nutrient-dense foods." },

  // ── NATURAL GELLING & TEXTURE ──
  { name: "Apple Pectin", emoji: "🍎", bonus: 120,
    aliases: ["apple pectin", "pectin", "fruit pectin", "citrus pectin"],
    whyGood: "Soluble prebiotic fibre from apple skins. Feeds beneficial gut bacteria, lowers LDL cholesterol, and regulates blood sugar. Infinitely better than synthetic binders." },
  { name: "Natural Agar", emoji: "🌊", bonus: 80,
    aliases: ["agar", "agar-agar", "natural agar"],
    whyGood: "Derived from red algae. Vegan, zero-calorie gelling agent. Contains trace iodine and minerals from seaweed — actively beneficial." },
  { name: "Tapioca Starch", emoji: "🌾", bonus: 60,
    // "tapioca" alone matches "tapioca dextrin" (candy coating agent in Skittles etc.) — remove it.
    aliases: ["tapioca starch", "cassava starch", "cassava flour"],
    whyGood: "Minimally processed starch from cassava root. Naturally gluten-free, not chemically modified, resistant starch fraction feeds gut bacteria." },

  // ── NATURAL PRESERVATIVES ──
  { name: "Rosemary Extract", emoji: "🌿", bonus: 100,
    aliases: ["rosemary extract", "rosemary", "rosmarinus officinalis", "rosmarinic acid"],
    whyGood: "Potent natural antioxidant preservative — rosmarinic acid and carnosic acid. Directly replaces synthetic BHA/BHT with zero concern." },
  { name: "Citric Acid (Natural)", emoji: "🍋", bonus: 50,
    // Bare "citric acid" is almost always synthetic (from Aspergillus mold on sugar, not citrus).
    // It appears in Sprite, Red Bull, Fanta — no bonus there. Only real citrus juice qualifies.
    aliases: ["lemon juice concentrate", "lemon juice", "lime juice", "natural lemon juice", "orange juice concentrate"],
    whyGood: "Real citrus juice brings vitamin C, flavonoids, and natural acidity — unlike synthetic citric acid which is industrially fermented from corn sugar." },
  { name: "Vitamin C (Natural)", emoji: "🍊", bonus: 80,
    aliases: ["ascorbic acid", "vitamin c", "l-ascorbic acid", "ascorbate"],
    whyGood: "Powerful antioxidant preservative that supports immune function and iron absorption. Safe, beneficial, and universally recognised." },
  { name: "Sunflower Wax", emoji: "🌻", bonus: 60,
    aliases: ["sunflower wax", "sunflower seed wax"],
    whyGood: "100% plant-derived natural glaze from sunflower seeds. Replaces petroleum-based mineral oil coatings. Vegan and biodegradable." },

  // ── FUNCTIONAL SUPERFOODS ──
  { name: "Raw / Organic Cacao", emoji: "🍫", bonus: 120,
    // Only match when organic/raw/single-origin qualifier is explicit.
    // "cocoa mass" and "cocoa butter" alone appear in every conventional chocolate
    // (Snickers, Milka, KitKat) and must NOT trigger a bonus.
    aliases: ["organic cacao", "raw cacao", "organic cocoa", "raw cocoa", "single-origin cacao", "organic dark chocolate", "organic cocoa mass", "organic cocoa butter", "organic cacao mass", "organic cacao butter"],
    whyGood: "Among the highest antioxidant foods on Earth. Flavonoids improve blood flow, cognition, and cardiovascular health. Real chocolate — not a processed imitation." },
  { name: "Matcha / Green Tea", emoji: "🍵", bonus: 120,
    aliases: ["matcha", "green tea extract", "green tea", "egcg", "epigallocatechin"],
    whyGood: "EGCG is one of the most studied natural antioxidants. L-theanine provides calm sustained focus. Supports metabolism and cellular health." },
  { name: "Ginger", emoji: "🫚", bonus: 80,
    aliases: ["ginger", "ginger extract", "ginger root", "zingiber officinale", "ginger powder"],
    whyGood: "Gingerols and shogaols are potent anti-inflammatory and anti-nausea compounds. Supports digestion and gut motility." },
  { name: "Organic Fruit Juice", emoji: "🍓", bonus: 60,
    aliases: ["organic fruit juice", "fruit juice concentrate", "organic fruit juice concentrate"],
    whyGood: "Real fruit-derived sweetness with retained phytonutrients, antioxidants, and natural flavour compounds." },

  // ── WHOLE FOODS & REAL PROTEINS ──
  { name: "Whole Nuts", emoji: "🥜", bonus: 50,
    aliases: ["peanuts", "almonds", "cashews", "walnuts", "hazelnuts", "pecans", "macadamia", "pistachios", "pine nuts", "brazil nuts", "roasted peanuts", "dry roasted peanuts", "roasted almonds", "whole almonds", "whole hazelnuts"],
    whyGood: "Whole unprocessed nuts deliver protein, healthy mono- and polyunsaturated fats, fibre, and minerals — a genuine whole-food ingredient even in an otherwise processed product." },
  { name: "Real Vanilla", emoji: "🌸", bonus: 80,
    aliases: ["vanilla bean", "vanilla extract", "bourbon vanilla", "vanilla pod", "madagascar vanilla", "tahitian vanilla", "vanilla bean extract", "real vanilla extract", "pure vanilla extract", "vanilla beans"],
    whyGood: "Real vanilla bean contains 250+ natural flavour compounds and beneficial antioxidants. Completely different to synthetic vanillin — a single molecule derived from petroleum or paper-pulp waste." },
  { name: "Pea Protein", emoji: "💪", bonus: 80,
    aliases: ["pea protein", "pea protein isolate", "split pea protein", "yellow pea protein", "pea protein concentrate"],
    whyGood: "Clean plant-based protein extracted without hexane (unlike soy protein isolate). High in BCAAs, hypoallergenic, and sustainably grown without the hormone concerns of soy." },
  { name: "Whole Oats", emoji: "🌾", bonus: 60,
    aliases: ["whole grain oats", "rolled oats", "oat flour", "oatmeal", "whole oats", "wholegrain oats", "oat bran", "steel-cut oats", "gluten-free oats"],
    whyGood: "Rich in beta-glucan — a soluble fibre proven to reduce LDL cholesterol and feed beneficial gut bacteria. One of the most studied grains for cardiovascular health." },
  { name: "Dates / Medjool Dates", emoji: "🌴", bonus: 80,
    aliases: ["dates", "medjool dates", "date paste", "date syrup", "whole dates", "date pieces", "deglet noor dates"],
    whyGood: "Nature's caramel — whole fruit sweetness with fibre, potassium, magnesium, and antioxidants. GI of ~42 (lower than most sweeteners) because the fibre slows sugar absorption." },
  { name: "Almond Flour", emoji: "🌰", bonus: 80,
    aliases: ["almond flour", "almond meal", "ground almonds", "blanched almonds", "almond powder"],
    whyGood: "High in vitamin E, magnesium, and healthy monounsaturated fats. Naturally low-GI flour that retains the nut's full nutritional profile — no bleaching, no fortification needed." },
  { name: "Real Whole Fruit", emoji: "🍇", bonus: 60,
    aliases: ["strawberries", "raspberries", "blueberries", "blackberries", "cherries", "cranberries", "dried blueberries", "dried cranberries", "freeze-dried strawberries", "freeze-dried raspberries", "freeze-dried fruit", "real fruit pieces", "whole fruit"],
    whyGood: "Whole or minimally processed fruit provides vitamins, polyphenols, and fibre — genuinely nutritious versus artificial fruit flavouring derived from a chemistry lab." },
  { name: "Egg / Egg White", emoji: "🥚", bonus: 40,
    aliases: ["whole egg", "egg whites", "egg yolk", "free-range egg", "organic egg", "egg powder", "dried egg whites", "pasteurised egg"],
    whyGood: "One of nature's most complete proteins — all 9 essential amino acids, choline for brain health, and bioavailable B vitamins. A genuine whole-food protein source." },
];

// ─── KNOWN BRANDS — instant offline lookup for popular junk food ──────────────
// Ingredients sourced from official product labels / manufacturer sites.

const KNOWN_BRANDS: Record<string, Omit<FetchedProduct, "nutriscore"|"image"> & { nutriscore?: string }> = {
  "milka":       { productName: "Milka Milk Chocolate", brand: "Milka (Mondelēz)", ingredients: "Sugar, Cocoa Butter, Skimmed Milk Powder, Cocoa Mass, Vegetable Fat (Palm Fat), Lactose, Whey Powder, Emulsifiers (Soya Lecithin E322, E476), Vanillin" },
  "lays":        { productName: "Lay's Classic", brand: "Lay's (PepsiCo)", ingredients: "Potatoes, Vegetable Oil (Sunflower, Corn and/or Canola Oil), Salt, Dextrose, Monosodium Glutamate (MSG)" },
  "lay's":       { productName: "Lay's Classic", brand: "Lay's (PepsiCo)", ingredients: "Potatoes, Vegetable Oil (Sunflower, Corn and/or Canola Oil), Salt, Dextrose, Monosodium Glutamate (MSG)" },
  "oreo":        { productName: "Oreo Original", brand: "Oreo (Mondelēz)", ingredients: "Sugar, Enriched Flour, High Oleic Canola Oil, Cocoa, High Fructose Corn Syrup, Leavening (Sodium Bicarbonate, Calcium Phosphate), Salt, Soy Lecithin, Chocolate, Artificial Flavor, Blue 1", nutriscore: "e" },
  "pringles":    { productName: "Pringles Original", brand: "Pringles (Kellogg's)", ingredients: "Dried Potatoes, Vegetable Oil (Corn, Cottonseed, High Oleic Soybean Oil), Degerminated Yellow Corn Flour, Cornstarch, Rice Flour, Maltodextrin, Mono and Diglycerides (E471), Salt, Dextrose, Sodium Caseinate, Modified Corn Starch", nutriscore: "d" },
  "snickers":    { productName: "Snickers Bar", brand: "Snickers (Mars)", ingredients: "Milk Chocolate (Sugar, Cocoa Butter, Chocolate, Skim Milk, Lactose, Milkfat, Soy Lecithin, Artificial Flavors), Peanuts, Corn Syrup, Sugar, Palm Oil, Skim Milk, Salt, Egg Whites, Artificial Flavor", nutriscore: "e" },
  "kitkat":      { productName: "KitKat Chocolate Bar", brand: "KitKat (Nestlé)", ingredients: "Sugar, Wheat Flour, Cocoa Butter, Nonfat Milk, Chocolate, Refined Palm Oil, Lactose, Milk Fat, Soy Lecithin, PGPR (Polyglycerol Polyricinoleate E476), Yeast, Artificial Flavor, Salt", nutriscore: "e" },
  "kit kat":     { productName: "KitKat Chocolate Bar", brand: "KitKat (Nestlé)", ingredients: "Sugar, Wheat Flour, Cocoa Butter, Nonfat Milk, Chocolate, Refined Palm Oil, Lactose, Milk Fat, Soy Lecithin, PGPR (Polyglycerol Polyricinoleate E476), Yeast, Artificial Flavor, Salt", nutriscore: "e" },
  "nutella":     { productName: "Nutella Hazelnut Spread", brand: "Nutella (Ferrero)", ingredients: "Sugar, Palm Oil, Hazelnuts 13%, Skimmed Milk Powder 8.7%, Fat-Reduced Cocoa 7.4%, Emulsifier: Lecithins (Soya), Vanillin", nutriscore: "e" },
  "coca-cola":   { productName: "Coca-Cola Original", brand: "The Coca-Cola Company", ingredients: "Carbonated Water, High Fructose Corn Syrup, Caramel Color (E150d), Phosphoric Acid, Natural Flavors, Caffeine", nutriscore: "e" },
  "coke":        { productName: "Coca-Cola Original", brand: "The Coca-Cola Company", ingredients: "Carbonated Water, High Fructose Corn Syrup, Caramel Color (E150d), Phosphoric Acid, Natural Flavors, Caffeine", nutriscore: "e" },
  "pepsi":       { productName: "Pepsi Cola", brand: "PepsiCo", ingredients: "Carbonated Water, High Fructose Corn Syrup, Caramel Color (E150d), Sugar, Phosphoric Acid, Caffeine, Citric Acid, Natural Flavor", nutriscore: "e" },
  "sprite":      { productName: "Sprite", brand: "Sprite (Coca-Cola Co.)", ingredients: "Carbonated Water, High Fructose Corn Syrup, Citric Acid, Natural Flavors, Sodium Citrate, Sodium Benzoate (preservative)" },
  "fanta":       { productName: "Fanta Orange", brand: "Fanta (Coca-Cola Co.)", ingredients: "Carbonated Water, High Fructose Corn Syrup, Citric Acid, Sodium Benzoate, Natural Flavors, Modified Corn Starch, Glycerol Ester of Rosin (BVO alternative), Yellow 6", nutriscore: "e" },
  "doritos":     { productName: "Doritos Nacho Cheese", brand: "Doritos (PepsiCo)", ingredients: "Whole Corn, Vegetable Oil (Corn, Canola, Sunflower Oil), Salt, Cheddar Cheese, Whey, Monosodium Glutamate, Buttermilk, Romano Cheese, Onion Powder, Natural and Artificial Flavor, Dextrose, Lactose, Spices, Artificial Color Red 40, Blue 1, Yellow 5, Lactic Acid, Citric Acid, Disodium Inosinate, Disodium Guanylate", nutriscore: "d" },
  "haribo":      { productName: "Haribo Gold Bears", brand: "Haribo", ingredients: "Corn Syrup, Sugar, Gelatin, Dextrose, Citric Acid, Starch, Artificial and Natural Flavors, Fractionated Coconut Oil, Carnauba Wax, Beeswax, Artificial Colors Red 40, Yellow 5, Yellow 6, Blue 1" },
  "mars":        { productName: "Mars Bar", brand: "Mars (Mars Inc.)", ingredients: "Milk Chocolate (Sugar, Cocoa Butter, Skim Milk, Chocolate, Lactose, Milkfat, Soy Lecithin, Artificial Flavors), Corn Syrup, Sugar, Palm Oil, Skim Milk, Less than 2% Cocoa Powder, Barley Malt Extract, Salt, Egg Whites, Artificial Flavor" },
  "twix":        { productName: "Twix Bar", brand: "Twix (Mars Inc.)", ingredients: "Milk Chocolate (Sugar, Cocoa Butter, Chocolate, Skim Milk, Lactose, Milkfat, Soy Lecithin, Pgpr, Artificial Flavors), Enriched Wheat Flour, Corn Syrup, Sugar, Palm Oil, Dextrose, Less than 2% of Salt, Baking Soda, Soy Lecithin, Artificial Flavor" },
  "skittles":    { productName: "Skittles Original", brand: "Skittles (Mars Wrigley)", ingredients: "Sugar, Corn Syrup, Hydrogenated Palm Kernel Oil, Fruit Juice from Concentrate, Citric Acid, Tapioca Dextrin, Modified Corn Starch, Natural and Artificial Flavors, Coloring (Red 40, Yellow 5, Yellow 6, Blue 1, Titanium Dioxide)" },
  "cheetos":     { productName: "Cheetos Crunchy", brand: "Cheetos (PepsiCo)", ingredients: "Enriched Cornmeal, Vegetable Oil (Corn, Canola, Sunflower Oil), Cheese Seasoning (Whey, Cheddar Cheese, Canola Oil, Maltodextrin, Natural and Artificial Flavors, Salt, Sodium Phosphate, Monosodium Glutamate, Lactic Acid, Artificial Color Yellow 6)" },
  "red bull":    { productName: "Red Bull Energy Drink", brand: "Red Bull GmbH", ingredients: "Carbonated Water, Sucrose, Glucose, Citric Acid, Taurine, Sodium Bicarbonate, Magnesium Carbonate, Caffeine, Niacinamide, Calcium Pantothenate, Pyridoxine HCl, Vitamin B12, Natural and Artificial Flavors, Caramel Color (E150)" },
  "redbull":     { productName: "Red Bull Energy Drink", brand: "Red Bull GmbH", ingredients: "Carbonated Water, Sucrose, Glucose, Citric Acid, Taurine, Sodium Bicarbonate, Magnesium Carbonate, Caffeine, Niacinamide, Calcium Pantothenate, Pyridoxine HCl, Vitamin B12, Natural and Artificial Flavors, Caramel Color (E150)" },
  "monster":     { productName: "Monster Energy Original", brand: "Monster Beverage Corp.", ingredients: "Carbonated Water, Sugar, Glucose, Citric Acid, Natural Flavors, Taurine, Sodium Citrate, Color (Caramel E150a), Panax Ginseng Root Extract, L-Carnitine L-Tartrate, Caffeine, Sorbic Acid (preservative), Benzoic Acid (preservative), Niacinamide (Vit. B3), Sucralose, Sodium Chloride, Inositol, Guarana Seed Extract, Pyridoxine Hydrochloride (Vit. B6), Riboflavin (Vit. B2), Maltodextrin, Cyanocobalamin (Vit. B12)" },
  "m&ms":        { productName: "M&M's Milk Chocolate", brand: "M&M's (Mars Wrigley)", ingredients: "Milk Chocolate (Sugar, Chocolate, Skim Milk, Cocoa Butter, Lactose, Milkfat, Soy Lecithin, Salt, Artificial Flavors), Sugar, Cornstarch, Corn Syrup, Dextrin, Coloring (Blue 1 Lake, Yellow 6, Red 40, Yellow 5, Blue 1, Red 40 Lake, Yellow 6 Lake, Yellow 5 Lake, Blue 2 Lake), Carnauba Wax" },
  "m&m's":       { productName: "M&M's Milk Chocolate", brand: "M&M's (Mars Wrigley)", ingredients: "Milk Chocolate (Sugar, Chocolate, Skim Milk, Cocoa Butter, Lactose, Milkfat, Soy Lecithin, Salt, Artificial Flavors), Sugar, Cornstarch, Corn Syrup, Dextrin, Coloring (Blue 1 Lake, Yellow 6, Red 40, Yellow 5, Blue 1, Red 40 Lake, Yellow 6 Lake, Yellow 5 Lake, Blue 2 Lake), Carnauba Wax" },
  // ── Beer ──────────────────────────────────────────────────────────────────
  "carlsberg":   { productName: "Carlsberg Lager Beer", brand: "Carlsberg Group", ingredients: "Water, Barley Malt, Hops, Yeast" },
  "heineken":    { productName: "Heineken Premium Lager", brand: "Heineken International", ingredients: "Water, Malted Barley, Hops, Yeast" },
  "corona":      { productName: "Corona Extra Beer", brand: "Grupo Modelo (AB InBev)", ingredients: "Water, Barley Malt, Non-Malted Cereals (Corn, Rice), Hops, Yeast" },
  "budweiser":   { productName: "Budweiser Lager Beer", brand: "Anheuser-Busch InBev", ingredients: "Water, Barley Malt, Rice, Hops, Yeast, Natural Carbonation" },
  "guinness":    { productName: "Guinness Draught Stout", brand: "Guinness (Diageo)", ingredients: "Water, Barley, Roasted Barley, Hops, Yeast, Nitrogen" },
  "stella":      { productName: "Stella Artois Lager", brand: "Stella Artois (AB InBev)", ingredients: "Water, Barley Malt, Hops, Corn Grits, Yeast" },
  // ── Chocolate & confectionery ──────────────────────────────────────────────
  "bounty":      { productName: "Bounty Coconut Bar", brand: "Mars Inc.", ingredients: "Sugar, Desiccated Coconut, Glucose Syrup, Cocoa Butter, Cocoa Mass, Skimmed Milk Powder, Whey Powder, Invert Sugar Syrup, Butter Oil, Emulsifier (E471), Modified Starch, Vanillin" },
  "ferrero rocher": { productName: "Ferrero Rocher", brand: "Ferrero", ingredients: "Milk Chocolate 30% (Sugar, Cocoa Butter, Cocoa Mass, Skimmed Milk Powder, Whey Powder, Anhydrous Milk Fat, Soya Lecithin, Vanillin), Hazelnuts 28.5%, Sugar, Skimmed Milk Powder, Palm Oil, Wheat Flour, Cocoa Mass, Whey Powder, Low Fat Cocoa Powder, Sodium Bicarbonate, Soya Lecithin, Vanillin" },
  "kinder":      { productName: "Kinder Chocolate", brand: "Kinder (Ferrero)", ingredients: "Sugar, Skimmed Milk Powder, Vegetable Fats (Palm, Shea), Cocoa Butter, Whey Powder, Cocoa Mass, Emulsifier: Soya Lecithin, Vanillin" },
  "kinder bueno": { productName: "Kinder Bueno", brand: "Kinder (Ferrero)", ingredients: "Sugar, Wheat Flour, Palm Oil, Skimmed Milk Powder, Hazelnuts, Cocoa Butter, Cocoa Mass, Whey Powder, Emulsifier (Sunflower Lecithin), Cocoa Powder, Raising Agent (Sodium Bicarbonate), Vanillin, Salt" },
  "raffaello":   { productName: "Raffaello Coconut Almond", brand: "Ferrero", ingredients: "Vegetable Oil (Palm), Desiccated Coconut, Sugar, Almonds 8.5%, Skimmed Milk Powder, Enriched Wheat Flour, Whey Powder, Anhydrous Milk Fat, Soya Lecithin, Sodium Bicarbonate, Vanillin" },
  "toblerone":   { productName: "Toblerone Swiss Milk Chocolate", brand: "Mondelēz International", ingredients: "Sugar, Milk Chocolate (Cocoa Mass, Cocoa Butter, Honey, Skimmed Milk Powder, Milkfat, Whey Powder, Emulsifier E322, Vanillin), Almond Nougat (Almonds, Sugar, Honey), Milk, Hazelnuts" },
  "lindt":       { productName: "Lindt Excellence Dark 70%", brand: "Lindt & Sprüngli", ingredients: "Cocoa Mass, Sugar, Cocoa Butter, Vanilla Beans", nutriscore: "c" },
  "ritter sport": { productName: "Ritter Sport Milk Chocolate", brand: "Alfred Ritter GmbH", ingredients: "Sugar, Whole Milk Powder, Cocoa Butter, Cocoa Mass, Butterfat, Emulsifier: Sunflower Lecithin, Vanilla Extract" },
  "werther's":   { productName: "Werther's Original Classic", brand: "Storck", ingredients: "Sugar, Glucose Syrup, Cream, Butter (from Milk), Skimmed Milk Powder, Salt, Emulsifier: Soya Lecithin, Flavouring" },
  "mentos":      { productName: "Mentos Fresh Mint", brand: "Mentos (Perfetti Van Melle)", ingredients: "Sugar, Glucose Syrup, Hydrogenated Coconut Oil, Rice Starch, Natural Flavouring (Mint 0.6%), Concentrated Lemon Juice, Gum Arabic, Carnauba Wax, Beeswax" },
  "chupa chups": { productName: "Chupa Chups Cola Lollipop", brand: "Chupa Chups (Perfetti Van Melle)", ingredients: "Sugar, Glucose Syrup, Lactic Acid, Natural Flavouring, Caramel (E150d), Emulsifier (E322)" },
  "starburst":   { productName: "Starburst Original", brand: "Mars Wrigley", ingredients: "Corn Syrup, Sugar, Hydrogenated Palm Kernel Oil, Fruit Juice from Concentrate, Citric Acid, Tapioca Dextrin, Gelatin, Natural Flavors, Ascorbic Acid, Red 40, Yellow 6, Yellow 5, Blue 1" },
  "skittles tropical": { productName: "Skittles Tropical", brand: "Mars Wrigley", ingredients: "Sugar, Corn Syrup, Hydrogenated Palm Kernel Oil, Citric Acid, Tapioca Dextrin, Modified Corn Starch, Natural and Artificial Flavors, Coloring (Red 40, Yellow 5, Yellow 6, Blue 1, Titanium Dioxide)" },
  // ── Cereals ───────────────────────────────────────────────────────────────
  "cornflakes":  { productName: "Kellogg's Cornflakes", brand: "Kellogg's", ingredients: "Milled Corn, Sugar, Salt, Barley Malt Flavoring, Niacinamide, Iron, Vitamin B6, Riboflavin, Thiamin HCl, Vitamin A Palmitate, Folic Acid, Vitamin D3, Vitamin B12", nutriscore: "b" },
  "frosties":    { productName: "Kellogg's Frosties", brand: "Kellogg's", ingredients: "Sugar, Milled Corn, Malt Flavoring, Salt, Niacinamide, Iron, Vitamin B6, Riboflavin, Thiamin HCl, Folic Acid, Vitamin D3, Vitamin B12", nutriscore: "d" },
  "special k":   { productName: "Kellogg's Special K", brand: "Kellogg's", ingredients: "Rice, Wheat Gluten, Sugar, Wheat Bran, Defatted Wheat Germ, Salt, Malt Flavoring, Iron, Niacinamide, Vitamin B6, Riboflavin, Thiamin HCl, Folic Acid, Vitamin D3, Vitamin B12", nutriscore: "b" },
  "cheerios":    { productName: "Cheerios Oat Cereal", brand: "General Mills", ingredients: "Whole Grain Oats, Modified Corn Starch, Sugar, Salt, Calcium Carbonate, Oat Bran, Disodium Phosphate, Vitamin E (Mixed Tocopherols), Niacinamide, Zinc, Iron, Vitamin B6, Riboflavin, Thiamin HCl, Vitamin A, Folic Acid, Vitamin B12, Vitamin D3", nutriscore: "b" },
  "lucky charms": { productName: "Lucky Charms Cereal", brand: "General Mills", ingredients: "Whole Grain Oats, Sugar, Oat Flour, Corn Syrup, Modified Corn Starch, Salt, Gelatin, Trisodium Phosphate, Red 40, Yellow 5, Yellow 6, Blue 1, Artificial Flavor", nutriscore: "d" },
  // ── Crackers & biscuits ───────────────────────────────────────────────────
  "ritz":        { productName: "Ritz Crackers", brand: "Mondelēz International", ingredients: "Enriched Wheat Flour, Vegetable Oil (Palm, Soybean), Sugar, Salt, Leavening (Calcium Phosphate, Baking Soda), Soy Lecithin, Natural Flavor, BHT" },
  "digestive":   { productName: "McVitie's Digestive Biscuits", brand: "pladis (McVitie's)", ingredients: "Wholemeal Wheat Flour, Vegetable Oil (Palm, Rapeseed), Sugar, Partially Inverted Sugar Syrup, Oat Flour, Raising Agents (Sodium Bicarbonate, Malic Acid, Ammonium Bicarbonate), Salt" },
  "hobnobs":     { productName: "McVitie's Hobnobs", brand: "pladis (McVitie's)", ingredients: "Oats, Sugar, Vegetable Oil (Palm, Rapeseed), Wholemeal Wheat Flour, Golden Syrup, Raising Agents (Sodium Bicarbonate, Ammonium Bicarbonate), Salt" },
  "rich tea":    { productName: "McVitie's Rich Tea Biscuits", brand: "pladis (McVitie's)", ingredients: "Wheat Flour, Vegetable Oil (Palm), Sugar, Partially Inverted Sugar Syrup, Glucose Syrup, Raising Agent (Sodium Bicarbonate), Salt" },
  "oreo double stuf": { productName: "Oreo Double Stuf", brand: "Mondelēz International", ingredients: "Sugar, Enriched Flour, Palm Oil, Cocoa, High Fructose Corn Syrup, Leavening (Baking Soda, Calcium Phosphate), Salt, Soy Lecithin, Chocolate, Artificial Flavor, Blue 1", nutriscore: "e" },
  // ── Soft drinks ───────────────────────────────────────────────────────────
  "7up":         { productName: "7UP Lemon Lime", brand: "PepsiCo", ingredients: "Carbonated Water, High Fructose Corn Syrup, Citric Acid, Potassium Citrate, Natural Flavors, Calcium Disodium EDTA" },
  "dr pepper":   { productName: "Dr Pepper", brand: "Keurig Dr Pepper", ingredients: "Carbonated Water, High Fructose Corn Syrup, Caramel Color (E150d), Phosphoric Acid, Natural and Artificial Flavors, Sodium Benzoate, Caffeine" },
  "mountain dew": { productName: "Mountain Dew", brand: "PepsiCo", ingredients: "Carbonated Water, High Fructose Corn Syrup, Concentrated Orange Juice, Citric Acid, Natural Flavor, Sodium Benzoate, Caffeine, Sodium Citrate, Gum Arabic, Calcium Disodium EDTA, Brominated Vegetable Oil, Yellow 5", nutriscore: "e" },
  "mirinda":     { productName: "Mirinda Orange", brand: "PepsiCo", ingredients: "Carbonated Water, Sugar, Citric Acid, Sodium Benzoate (Preservative), Sweeteners (Acesulfame K, Sucralose), Natural Orange Flavouring, Sunset Yellow FCF (E110)" },
  "tonic water": { productName: "Schweppes Tonic Water", brand: "Schweppes (Coca-Cola Co.)", ingredients: "Carbonated Water, Sugar, Citric Acid, Quinine, Natural Flavourings" },
  // ── Energy drinks ─────────────────────────────────────────────────────────
  "burn":        { productName: "Burn Energy Drink", brand: "Burn (Coca-Cola Co.)", ingredients: "Carbonated Water, Sugar, Citric Acid, Taurine, Sodium Citrate, Natural and Artificial Flavors, Caffeine, Niacinamide, Pantothenic Acid, Inositol, Vitamin B6, Vitamin B12, Caramel Color (E150a), Guarana Extract" },
  // ── Gum & mints ───────────────────────────────────────────────────────────
  "orbit":       { productName: "Orbit Spearmint Gum", brand: "Mars Wrigley", ingredients: "Sorbitol, Gum Base, Glycerol, Natural and Artificial Flavors, Hydrogenated Starch Hydrolysate, Aspartame, Mannitol, Acesulfame K, Soy Lecithin, Xylitol, BHT, Blue 1 Lake" },
  "extra gum":   { productName: "Extra Spearmint Gum", brand: "Mars Wrigley", ingredients: "Sorbitol, Gum Base, Glycerol, Natural and Artificial Flavor, Hydrogenated Starch Hydrolysates, Aspartame, Soy Lecithin, Acesulfame K, BHT, Blue 1 Lake" },
  "tic tac":     { productName: "Tic Tac Fresh Mint", brand: "Ferrero", ingredients: "Sugar, Maltodextrin, Fructose, Rice Starch, Arabic Gum, Natural Mint Flavour, Glucose Syrup, Magnesium Salts of Fatty Acids" },
  "altoids":     { productName: "Altoids Classic Peppermint", brand: "Wrigley (Mars)", ingredients: "Sugar, Gelatin, Natural Flavor (Oil of Peppermint), Glucose Syrup, Corn Starch, Resinous Glaze (Shellac)" },
  // ── Yoghurt & dairy ───────────────────────────────────────────────────────
  "activia":     { productName: "Danone Activia Natural Yoghurt", brand: "Danone", ingredients: "Whole Milk, Skimmed Milk, Sugar, Modified Maize Starch, Cream, Pectin (E440), Live Cultures (S. thermophilus, L. bulgaricus, B. animalis lactis)", nutriscore: "b" },
  "muller":      { productName: "Müller Corner Strawberry Yoghurt", brand: "Müller", ingredients: "Whole Milk, Sugar, Strawberries 6.6%, Modified Starch, Citric Acid, Natural Strawberry Flavour, Pectin, Yoghurt Culture" },
  "yakult":      { productName: "Yakult Original", brand: "Yakult Honsha", ingredients: "Water, Skimmed Milk Powder, Glucose-Fructose Syrup, Sugar, Lactobacillus casei Shirota", nutriscore: "c" },
  "alpro":       { productName: "Alpro Soya Original Drink", brand: "Alpro (Danone)", ingredients: "Water, Hulled Soya Beans 7.5%, Calcium, Sea Salt, Vitamins (D2, B12, Riboflavin), Emulsifier (Sunflower Lecithin)", nutriscore: "a" },
  "oatly":       { productName: "Oatly Oat Drink Original", brand: "Oatly", ingredients: "Oat Base (Water, Oats 10%), Low Erucic Acid Rapeseed Oil, Dipotassium Phosphate, Calcium Carbonate, Iodised Salt, Vitamins (D2, Riboflavin, B12)", nutriscore: "a" },
  // ── Ice cream ─────────────────────────────────────────────────────────────
  "magnum":      { productName: "Magnum Classic Ice Cream Bar", brand: "Unilever", ingredients: "Water, Skim Milk, Sugar, Cream, Glucose Syrup, Chocolate (Cocoa Mass, Sugar, Cocoa Butter, Vanilla Bean Extracts), Milk Fat, Buttermilk Powder, Emulsifiers (E471, E476), Stabilisers (Locust Bean Gum, Guar Gum, Carrageenan), Vanilla Extract" },
  "cornetto":    { productName: "Cornetto Classic", brand: "Unilever", ingredients: "Water, Sugar, Skimmed Milk Powder, Wheat Flour, Vegetable Fats (Coconut, Palm Kernel), Cream, Cocoa Mass, Glucose Syrup, Butter, Cocoa Butter, Emulsifiers (E471, E472b, E476), Hazelnuts, Stabilisers (E412, E410, E407), Salt, Vanilla Extract" },
  // ── Healthy / protein bars ────────────────────────────────────────────────
  "nature valley": { productName: "Nature Valley Oats & Honey Bar", brand: "General Mills", ingredients: "Whole Grain Rolled Oats, Sugar, Canola Oil, Honey, Salt, Soy Lecithin, Baking Soda, Natural Flavor", nutriscore: "c" },
  "kind bar":    { productName: "KIND Dark Chocolate Nuts & Sea Salt", brand: "KIND Snacks", ingredients: "Almonds, Dark Chocolate (Sugar, Chocolate Liquor, Cocoa Butter, Milk Fat, Soy Lecithin, Vanilla), Peanuts, Chicory Root Fiber, Honey, Palm Kernel Oil, Sea Salt, Vanilla Extract", nutriscore: "b" },
  "rxbar":       { productName: "RXBAR Chocolate Sea Salt", brand: "RXBAR (Kellogg's)", ingredients: "Dates, Egg Whites, Almonds, Cashews, Chocolate, Cocoa, Sea Salt, Natural Flavors", nutriscore: "b" },
  "nakd":        { productName: "Nakd Cocoa Orange Bar", brand: "Natural Balance Foods", ingredients: "Dates, Cashews, Raisins, Cocoa Powder, Orange Oil", nutriscore: "a" },
  "grenade":     { productName: "Grenade Carb Killa Chocolate Brownie", brand: "Grenade", ingredients: "Protein Blend (Milk Protein, Whey Protein Concentrate, Calcium Caseinate), Glycerine, Water, Palm Kernel Oil, Cocoa Butter, Whole Milk Powder, Emulsifiers (Sunflower Lecithin, E476), Sugar, Inulin, Salt, Sucralose" },
  "quest bar":   { productName: "Quest Bar Chocolate Chip Cookie Dough", brand: "Quest Nutrition", ingredients: "Whey Protein Isolate, Milk Protein Isolate, Soluble Corn Fiber, Almonds, Water, Palm Oil, Erythritol, Cocoa Butter, Chocolate Liquor, Sea Salt, Sucralose, Sunflower Lecithin" },
  // ── Sauces & spreads ──────────────────────────────────────────────────────
  "heinz ketchup": { productName: "Heinz Tomato Ketchup", brand: "Heinz (Kraft Heinz)", ingredients: "Tomato Concentrate, Distilled Vinegar, High Fructose Corn Syrup, Corn Syrup, Salt, Spice, Onion Powder, Natural Flavoring", nutriscore: "d" },
  "heinz":       { productName: "Heinz Tomato Ketchup", brand: "Heinz (Kraft Heinz)", ingredients: "Tomato Concentrate, Distilled Vinegar, High Fructose Corn Syrup, Corn Syrup, Salt, Spice, Onion Powder, Natural Flavoring", nutriscore: "d" },
  "hellmann's":  { productName: "Hellmann's Real Mayonnaise", brand: "Unilever", ingredients: "Soybean Oil, Water, Whole Eggs and Egg Yolks, Vinegar, Salt, Sugar, Lemon Juice Concentrate, Calcium Disodium EDTA, Natural Flavors" },
  "hellmans":    { productName: "Hellmann's Real Mayonnaise", brand: "Unilever", ingredients: "Soybean Oil, Water, Whole Eggs and Egg Yolks, Vinegar, Salt, Sugar, Lemon Juice Concentrate, Calcium Disodium EDTA, Natural Flavors" },
  // ── Holy Picks — genuinely clean products ────────────────────────────────
  "nakd cocoa":  { productName: "Nakd Cocoa Orange Bar", brand: "Natural Balance Foods", ingredients: "Dates, Cashews, Raisins, Cocoa Powder, Orange Oil", nutriscore: "a" },
  "rx bar":      { productName: "RXBAR Chocolate Sea Salt", brand: "RXBAR (Kellogg's)", ingredients: "Dates, Egg Whites, Almonds, Cashews, Chocolate, Cocoa, Sea Salt, Natural Flavors", nutriscore: "b" },
  "lindt 90":    { productName: "Lindt Excellence 90% Cocoa", brand: "Lindt & Sprüngli", ingredients: "Cocoa Mass, Cocoa Powder, Cocoa Butter, Sugar, Vanilla Beans", nutriscore: "b" },
  "lindt dark":  { productName: "Lindt Excellence 70% Cocoa Dark", brand: "Lindt & Sprüngli", ingredients: "Cocoa Mass, Sugar, Cocoa Butter, Vanilla Beans", nutriscore: "c" },
  "larabar":     { productName: "Larabar Apple Pie Bar", brand: "Larabar (General Mills)", ingredients: "Dates, Almonds, Unsweetened Apples, Walnuts, Cinnamon", nutriscore: "a" },
  "graze":       { productName: "Graze Oat Bites Cinnamon", brand: "Graze", ingredients: "Oats, Pumpkin Seeds, Sunflower Seeds, Dried Cranberries, Honey, Cinnamon", nutriscore: "b" },
  "pip & nut":   { productName: "Pip & Nut Almond Butter", brand: "Pip & Nut", ingredients: "Almonds (100%)", nutriscore: "a" },
  "meridian":    { productName: "Meridian Smooth Peanut Butter", brand: "Meridian Foods", ingredients: "Peanuts (100%)", nutriscore: "a" },
  "trek":        { productName: "Trek Cocoa Chaos Protein Bar", brand: "Trek", ingredients: "Oats, Dates, Brown Rice Protein, Peanuts, Pumpkin Seeds, Sunflower Seeds, Dark Chocolate Chips (Cocoa Mass, Cocoa Butter, Raw Cane Sugar), Cocoa Powder, Sea Salt", nutriscore: "b" },
  "bear yoyos":  { productName: "Bear Yoyos Mango", brand: "Bear (Lotus Bakeries)", ingredients: "Mango (99%), Apple Juice Concentrate", nutriscore: "a" },
};

// ─── LITHUANIAN BRAND DATABASE ───────────────────────────────────────────────

type LTProduct = {
  name: string;
  nameLt: string;
  category: string;
  categoryLt: string;
  emoji: string;
  ingredients: string; // English — fed into scanText()
};

type LTBrand = {
  display: string;
  country: string; // flag emoji
  emoji: string;
  tagline: string;
  aliases: string[]; // diacritic-free lowercase search terms
  products: LTProduct[];
};

/** Strip Lithuanian diacritics for search normalization */
function normalizeForSearch(s: string): string {
  return s.toLowerCase()
    .replace(/ą/g, "a").replace(/č/g, "c").replace(/ę/g, "e").replace(/ė/g, "e")
    .replace(/į/g, "i").replace(/š/g, "s").replace(/ų/g, "u").replace(/ū/g, "u")
    .replace(/ž/g, "z").trim();
}

const LT_BRANDS: LTBrand[] = [
  {
    display: "Pergalė",
    country: "🇱🇹",
    emoji: "🍫",
    tagline: "AB Vilniaus Pergalė · Vilnius, Lithuania",
    aliases: ["pergale", "pergalė", "vilniaus pergale", "vilniaus pergalė", "pergale saldainiai"],
    products: [
      {
        name: "Pergalė Milk Chocolate",
        nameLt: "Pieniškas šokoladas PERGALĖ",
        category: "Chocolate Bar", categoryLt: "Šokolado plytelė", emoji: "🍫",
        ingredients: "Sugar, skimmed milk powder, cocoa butter, cocoa mass, milk fat, hazelnut paste, emulsifiers (polyglycerol polyricinoleate E476, soy lecithins E322), natural vanilla flavoring",
      },
      {
        name: "Pergalė Dark Chocolate",
        nameLt: "Juodasis šokoladas PERGALĖ",
        category: "Chocolate Bar", categoryLt: "Šokolado plytelė", emoji: "🍫",
        ingredients: "Sugar, cocoa mass, cocoa butter, emulsifiers (soy lecithins E322, polyglycerol polyricinoleate E476), flavoring",
      },
      {
        name: "Pergalė Dark Chocolate 72%",
        nameLt: "Juodasis šokoladas PERGALĖ 72%",
        category: "Chocolate Bar", categoryLt: "Šokolado plytelė", emoji: "🍫",
        ingredients: "Cocoa mass, sugar, cocoa butter, emulsifiers (soy lecithins E322, polyglycerol polyricinoleate E476), flavoring",
      },
      {
        name: "Pergalė Dark Chocolate with Hazelnuts 90%",
        nameLt: "Juodasis šokoladas PERGALĖ su sveikais lazdynų riešutais",
        category: "Chocolate Bar", categoryLt: "Šokolado plytelė", emoji: "🌰",
        ingredients: "Dark chocolate 90% (sugar, cocoa mass, cocoa butter, emulsifiers: soy lecithins E322, polyglycerol polyricinoleate E476, flavoring), roasted hazelnuts 10%",
      },
      {
        name: "Pergalė Dark Chocolate with Cranberries",
        nameLt: "Juodasis šokoladas PERGALĖ su spanguolių gabalėliais",
        category: "Chocolate Bar", categoryLt: "Šokolado plytelė", emoji: "🍒",
        ingredients: "Dark chocolate 83% (sugar, cocoa mass, cocoa butter, emulsifiers: soy lecithins E322, polyglycerol polyricinoleate E476; flavoring), dried cranberries 17% (cranberries 60%, cane sugar, rice flour, sunflower oil)",
      },
      {
        name: "Pergalė Milk Chocolate with Caramel & Salt",
        nameLt: "Pieniškas šokoladas PERGALĖ su traška karamele ir druska",
        category: "Chocolate Bar", categoryLt: "Šokolado plytelė", emoji: "🧂",
        ingredients: "Milk chocolate 82.6% (sugar, skimmed milk powder, cocoa butter, cocoa mass, milk fat, hazelnut paste, emulsifiers: polyglycerol polyricinoleate E476, soy lecithins E322; natural vanilla flavoring), crunchy caramel 17% (sugar, glucose syrup, butter, coconut oil, almond paste, salt, soy lecithin emulsifier), salt 0.4%",
      },
      {
        name: "Pergalė Vilnius Original Chocolates",
        nameLt: "Saldainiai PERGALĖ VILNIUS ORIGINAL",
        category: "Boxed Chocolates", categoryLt: "Saldainiai dėžutėje", emoji: "🎁",
        ingredients: "Chocolate 30% (sugar, cocoa mass, vegetable fats (palm oil), cocoa butter, emulsifiers (soy lecithin E322, polyglycerol polyricinoleate E476), flavoring), sugar, butter, cocoa mass, cocoa butter, pasteurized cream, ethyl alcohol 1.7%, flavoring",
      },
      {
        name: "Pergalė Classic Truffles",
        nameLt: "Triufeliai PERGALĖ Classic",
        category: "Truffles", categoryLt: "Triufeliai", emoji: "🫦",
        ingredients: "Vegetable fats (coconut oil), sugar, lean cocoa powder, milk whey powder, cocoa powder 1%, soy lecithin emulsifier, natural vanilla flavoring",
      },
      {
        name: "Pergalė Nomeda Bar",
        nameLt: "Batonėlis NOMEDA",
        category: "Candy Bar", categoryLt: "Batonėlis", emoji: "🍬",
        ingredients: "Sugar, apple puree 41% (mashed apples, potassium sorbate preservative), chopped roasted almonds 8%, wafer sheets 5% (wheat flour, water, rapeseed oil, raising agents: sodium carbonates, ammonium carbonates; salt, soy lecithin emulsifier), vegetable fats (shea butter, palm oil), lean cocoa powder 3.5%, chopped roasted peanuts 2%, acidity regulators: citric acid, trisodium citrate; pectin, flavoring",
      },
      {
        name: "Pergalė PUPA Bar",
        nameLt: "Batonėlis PUPA",
        category: "Candy Bar", categoryLt: "Batonėlis", emoji: "🍬",
        ingredients: "Sugar, coating 25% (sugar, partially hydrogenated vegetable fats (soybean oil, palm oil), lean cocoa powder, soy lecithin emulsifier, flavorings), partially hydrogenated vegetable fats (soybean oil, palm oil), skimmed milk powder, whey powder, wafer crumbs (wheat flour, water, soy lecithin emulsifier, raising agent E500, salt), lean cocoa powder, natural coffee 0.2%, soy lecithin emulsifier, flavorings",
      },
      {
        name: "Pergalė GAIDELIS Cheese Crackers",
        nameLt: "Krekeriai GAIDELIS SŪRIS",
        category: "Crackers", categoryLt: "Krekeriai", emoji: "🧀",
        ingredients: "Wheat flour, rapeseed oil, barley malt extract, glucose-fructose syrup, cheese flavor mixture (milk whey powder, skimmed milk powder, monosodium glutamate MSG, onion powder, powdered sugar, garlic powder, natural cheese flavoring, corn starch, cheese powder 0.05%, ground paprika, ground black pepper, silicon dioxide), salt, ammonium carbonates, sodium carbonates, soy lecithins, sodium metabisulfite, yeast extract, vegetable fats (palm oil), maltodextrin, flavoring",
      },
      {
        name: "Pergalė GAIDELIS Classic Cookies",
        nameLt: "Sausainiai GAIDELIS KLASIKA",
        category: "Cookies", categoryLt: "Sausainiai", emoji: "🍪",
        ingredients: "Wheat flour, sugar, vegetable fats (palm oil, shea butter; beta-carotene colorant, flavoring), glucose-fructose syrup, raising agents (sodium bicarbonate, ammonium bicarbonate), salt, cardamom, ginger, soy lecithin emulsifier",
      },
      {
        name: "Pergalė GAIDELIS Chocolate Cookies",
        nameLt: "Sausainiai GAIDELIS ŠOKOLADAS",
        category: "Cookies", categoryLt: "Sausainiai", emoji: "🍪",
        ingredients: "Wheat flour, sugar, vegetable fats (palm oil, shea butter; carotene colorant, flavoring), cocoa powder 3%, glucose-fructose syrup, chocolate chips 2% (cocoa mass, sugar, cocoa butter, soy lecithin emulsifier), wheat fiber, sweetened condensed milk 0.9%, milk whey powder, raising agents (sodium carbonates, ammonium carbonates), salt, flavorings, soy lecithin emulsifier",
      },
      {
        name: "Pergalė SOFFIA Vanilla Marshmallows",
        nameLt: "Zefyrai SOFFIA vanilinio skonio su kakaviniu glaistu",
        category: "Marshmallows", categoryLt: "Zefyrai", emoji: "☁️",
        ingredients: "Apple jam (sugar, apple puree 27% (mashed apples, sulfur dioxide preservative), glucose syrup, pectin, trisodium citrate), cocoa coating 30% (sugar, vegetable fats (fully hydrogenated palm kernel oil), lean cocoa powder 17%, emulsifiers: soy lecithins E322, polyglycerol polyricinoleate E476; flavoring), sugar, glucose syrup, egg white powder, lactic acid, invertase, sorbic acid preservative, vanillin flavoring",
      },
      {
        name: "Pergalė Pineapple Candies",
        nameLt: "Saldainiai ANANASINIAI",
        category: "Loose Candies", categoryLt: "Sveriami saldainiai", emoji: "🍍",
        ingredients: "Sugar, palm kernel oil, palm oil, wafer sheets (wheat flour, water, rapeseed oil, salt, soy lecithin emulsifier, raising agents: sodium carbonates, ammonium carbonates), fully hydrogenated palm kernel oil, lean cocoa powder, lactic acid, soy lecithin emulsifier, flavorings, pineapple powder 0.02%",
      },
    ],
  },
  {
    display: "Rūta",
    country: "🇱🇹",
    emoji: "🌹",
    tagline: "Saldainių fabrikas Rūta · Šiauliai, Lithuania",
    aliases: ["ruta", "rūta", "saldainiu fabrikas ruta", "saldainių fabrikas rūta"],
    products: [
      {
        name: "Rūta Milk Chocolate \"Little Miracles\"",
        nameLt: "Pieninis šokoladas RŪTA \"Mažų stebuklų\"",
        category: "Chocolate Bar", categoryLt: "Šokolado plytelė", emoji: "🍫",
        ingredients: "Sugar, cocoa butter, whole milk powder, cocoa mass, soy lecithin emulsifier, natural vanilla extract",
      },
      {
        name: "Rūta Dark Chocolate \"50 Magical Celebrations\"",
        nameLt: "Juodasis šokoladas RŪTA \"50 Pasakiškų švenčių\"",
        category: "Chocolate Bar", categoryLt: "Šokolado plytelė", emoji: "🍫",
        ingredients: "Cocoa mass, sugar, cocoa butter, soy lecithin emulsifier, natural vanilla extract",
      },
      {
        name: "Rūta Dark Chocolate 75% with Sea Salt",
        nameLt: "Juodasis šokoladas RŪTA (75%) su jūros druska",
        category: "Chocolate Bar", categoryLt: "Šokolado plytelė", emoji: "🧂",
        ingredients: "Cocoa mass, sugar, cocoa butter, emulsifiers (soy lecithins E322, polyglycerol polyricinoleate E476), natural vanilla extract, sea salt 0.5%",
      },
      {
        name: "Rūta Dark Chocolate with Nuts & Fruits",
        nameLt: "Juodasis šokoladas RŪTA su riešutais ir vaisiais",
        category: "Chocolate Bar", categoryLt: "Šokolado plytelė", emoji: "🌰",
        ingredients: "Dark chocolate 55% (cocoa mass, sugar, cocoa butter, emulsifiers: soy lecithins E322, polyglycerol polyricinoleate E476), almonds 12%, dried pineapple pieces 9%, raisins 11.1%, hazelnuts 2%",
      },
      {
        name: "Rūta Milk Chocolate with Raspberries & Blueberries",
        nameLt: "Pieninis šokoladas RŪTA su avietėmis ir mėlynėmis",
        category: "Chocolate Bar", categoryLt: "Šokolado plytelė", emoji: "🫐",
        ingredients: "Milk chocolate (sugar, cocoa butter, whole milk powder, cocoa mass, soy lecithin emulsifier, natural vanilla flavoring), raspberries, blueberries, sugar, glucose syrup",
      },
      {
        name: "Rūta \"Lietuva\" Chocolate Assortment",
        nameLt: "Šokoladiniai saldainiai RŪTA LIETUVA",
        category: "Boxed Chocolates", categoryLt: "Saldainiai dėžutėje", emoji: "🎁",
        ingredients: "Sugar, chocolate 24% (cocoa mass, sugar, cocoa butter, soy lecithin emulsifier, natural vanilla flavoring), vegetable fats (palm oil), cocoa mass 15.6%, skimmed milk powder, almonds 5.2%, caramel flakes 1.5% (sugar, glucose syrup, butter, cream), soy lecithin emulsifier, flavorings",
      },
    ],
  },
  {
    display: "Laima",
    country: "🇱🇻",
    emoji: "🌺",
    tagline: "Laima · Rīga, Latvia — sold across Lithuania",
    aliases: ["laima"],
    products: [
      {
        name: "Laima \"Lietuva\" Dark Chocolate Assortment",
        nameLt: "Juodojo šokolado saldainių rinkinys LAIMA LIETUVA",
        category: "Boxed Chocolates", categoryLt: "Saldainiai dėžutėje", emoji: "🎁",
        ingredients: "Sugar, cocoa mass, condensed milk, cocoa butter, glucose syrup, vegetable oils (palm oil), lean cocoa powder, emulsifiers (ammonium phosphatides E442, polyglycerol polyricinoleate E476, soy lecithins E322), potassium sorbate preservative, flavorings",
      },
      {
        name: "Laima \"Vilnius\" Chocolate Candies",
        nameLt: "Šokoladiniai saldainiai LAIMA VILNIUS",
        category: "Boxed Chocolates", categoryLt: "Saldainiai dėžutėje", emoji: "🎁",
        ingredients: "Sugar, water, dried whey, hazelnut, cocoa mass, glucose syrup, vegetable oils (palm kernel oil, palm oil), cocoa butter, lean cocoa powder, apples, blackcurrants, apricots, ethyl alcohol, emulsifiers (ammonium phosphatides E442, polyglycerol polyricinoleate E476, soy lecithins E322), pectin, citric acid, potassium sorbate preservative, flavorings",
      },
    ],
  },
  {
    display: "Selga",
    country: "🇱🇻",
    emoji: "🍪",
    tagline: "Selga (Orkla Latvia) · sold across Lithuania & Latvia",
    aliases: ["selga"],
    products: [
      {
        name: "Selga Classic Biscuits",
        nameLt: "Sausainiai SELGA CLASSIC",
        category: "Cookies", categoryLt: "Sausainiai", emoji: "🍪",
        ingredients: "Wheat flour, sugar, butter, vegetable fat (palm oil), milk, egg powder, raising agents (sodium bicarbonate, ammonium bicarbonate), salt, sunflower lecithin, flavoring",
      },
      {
        name: "Selga Chocolate Biscuits",
        nameLt: "Sausainiai SELGA šokolado skonio",
        category: "Cookies", categoryLt: "Sausainiai", emoji: "🍪",
        ingredients: "Wheat flour, sugar, vegetable oils (palm oil, sunflower oil), cocoa powder, caramel, egg powder, raising agents (sodium bicarbonate, ammonium bicarbonate), salt, chocolate 0.5%, natural and artificial flavors, soy lecithin emulsifier",
      },
      {
        name: "Selga Condensed Milk Biscuits",
        nameLt: "Sausainiai SELGA sutirštinto pieno skonio",
        category: "Cookies", categoryLt: "Sausainiai", emoji: "🍪",
        ingredients: "Wheat flour, sugar, butter, vegetable fat (palm oil), sweetened condensed milk with sugar, milk whey powder, egg powder, raising agents (sodium bicarbonate, ammonium bicarbonate), salt, sunflower lecithin, vanilla flavoring",
      },
      {
        name: "Selga Nature Oat Biscuits",
        nameLt: "Avižiniai sausainiai SELGA NATURE",
        category: "Cookies", categoryLt: "Sausainiai", emoji: "🌾",
        ingredients: "Whole grain oats 18%, wheat flour, sugar, margarine (vegetable fats (palm oil, sunflower oil), water, salt, emulsifiers, flavoring), egg powder, raising agents (sodium bicarbonate, ammonium bicarbonate), salt, oat bran, sunflower lecithin, flavoring",
      },
    ],
  },
  {
    display: "Estrella",
    country: "SE",
    emoji: "🥔",
    tagline: "Estrella (Calbee / PepsiCo Nordics) · Sweden — sold across Lithuanian supermarkets",
    aliases: ["estrella", "estrella chips", "estrella crisps"],
    products: [
      {
        name: "Estrella Lightly Salted Classic",
        nameLt: "Estrella Traškučiai su druska",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🥔",
        ingredients: "Potatoes, sunflower oil, rapeseed oil, salt",
      },
      {
        name: "Estrella Sourcream & Onion",
        nameLt: "Estrella Grietinėlės ir svogūnų skonio",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🧅",
        ingredients: "Potatoes, vegetable oils (sunflower oil, rapeseed oil in varying proportions), seasoning (whey powder (from milk), onion powder 1.8%, salt, natural flavoring, sugar, lactose, maltodextrin)",
      },
      {
        name: "Estrella Paprika",
        nameLt: "Estrella Paprikų skonio",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🫑",
        ingredients: "Potatoes, vegetable oils (sunflower oil, rapeseed oil in varying proportions), paprika seasoning (maltodextrin, salt, sugar, paprika powder, spices, natural flavoring, citric acid)",
      },
      {
        name: "Estrella Cheese & Onion",
        nameLt: "Estrella Sūrio ir svogūnų skonio",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🧀",
        ingredients: "Potatoes, sunflower oil, whey powder (from milk), salt, lactose, potato starch, maltodextrin, dextrose, cheese powder, natural flavoring",
      },
      {
        name: "Estrella Dill",
        nameLt: "Estrella Krapų skonio",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🌿",
        ingredients: "Potatoes, vegetable oils (sunflower oil, rapeseed oil in varying proportions), salt, natural flavoring (dill), whey permeate (from milk)",
      },
      {
        name: "Estrella Spring Onion",
        nameLt: "Estrella Pavasarinių svogūnų skonio",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🧅",
        ingredients: "Potatoes, vegetable oils (sunflower oil, rapeseed oil in varying proportions), onion powder 1.8%, maltodextrin, salt, sugar, milk powder, natural flavoring",
      },
      {
        name: "Estrella Crinkle Cut Dill",
        nameLt: "Estrella Raukšlėti krapų skonio",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🌿",
        ingredients: "Potatoes, vegetable oils (sunflower oil, rapeseed oil in varying proportions), salt, natural flavoring, whey permeate (from milk)",
      },
      {
        name: "Estrella Cheese Rings",
        nameLt: "Estrella Sūrio žiedai",
        category: "Corn Snacks", categoryLt: "Kukurūzų užkandžiai", emoji: "🫧",
        ingredients: "Corn flour, sunflower oil, cheese powder (milk), salt, maltodextrin, natural flavoring, whey powder (from milk), sugar, yeast extract",
      },
    ],
  },
  {
    display: "Chazz",
    country: "🇱🇹",
    emoji: "🌿",
    tagline: "Chazz · Premium artisan chips — Lithuania",
    aliases: ["chazz", "chazz chips", "chazz traškučiai"],
    products: [
      {
        name: "Chazz Cannabis Chips",
        nameLt: "Chazz Kanapes traškučiai",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🌿",
        ingredients: "65% potatoes, sunflower oil, maltodextrin, salt, sugar, natural flavoring, jalapeño pepper 0.8%, garlic, onions, tomatoes, cayenne pepper, hemp seeds 0.1%, spinach, parsley, rapeseed oil",
      },
      {
        name: "Chazz Pink Soup / Šaltibarščiai Chips",
        nameLt: "Chazz Šaltibarščių skonio traškučiai",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🩷",
        ingredients: "62% potatoes, sunflower oil, beets powder 2.3%, salt, spices (onions, dill, green onions), cream powder, yeast extract, skim milk powder, maltodextrin, flavorings (cucumber, natural sour cream, onion), lactic acid (acidity regulator), silicon dioxide (anti-caking agent), dill extract",
      },
      {
        name: "Chazz Kettle Chips",
        nameLt: "Chazz Katilo stiliaus traškučiai",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🥔",
        ingredients: "55% potatoes, rapeseed oil, whey powder 3% (from milk), salt, maltodextrin, sugar, onion, dextrose, spices (garlic, black pepper, dill, parsley), carrot powder, natural flavoring, lactic acid, citric acid, smoke flavoring, paprika extract",
      },
      {
        name: "Chazz Vegetable Chips",
        nameLt: "Chazz Daržovių traškučiai",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🥕",
        ingredients: "59% vegetables in varying proportions (potatoes, carrots, young beets), rapeseed oil, spice mix 7% (sugar, dextrose (maize), salt, sodium acetate (acidity regulator), citric acid, onion, maltodextrin (maize, potato), spices, yeast extract, natural flavoring, dill extract)",
      },
      {
        name: "Chazz Cannabis Tortilla Chips",
        nameLt: "Chazz Kanapes tortilijos traškučiai",
        category: "Tortilla Chips", categoryLt: "Tortilijos", emoji: "🌽",
        ingredients: "78% corn, sunflower oil, maltodextrin, salt, sugar, natural flavoring, jalapeño pepper 1%, garlic, onions, tomatoes, cayenne pepper, hemp seeds 0.2%, spinach, parsley, rapeseed oil",
      },
      {
        name: "Chazz Sour Cream & Onion",
        nameLt: "Chazz Grietinėlės ir svogūnų skonio",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🧅",
        ingredients: "Potatoes, sunflower oil, sour cream powder, onion powder, salt, sugar, maltodextrin, natural flavoring, lactic acid",
      },
      {
        name: "Chazz Bread Chips Cheddar",
        nameLt: "Chazz Duonos traškučiai čederio skonio",
        category: "Bread Chips", categoryLt: "Duonos traškučiai", emoji: "🍞",
        ingredients: "Wheat flour, sunflower oil, cheddar cheese seasoning (cheese powder, salt, sugar, maltodextrin, natural flavoring, whey powder), salt",
      },
      {
        name: "Chazz Caramelised Onion",
        nameLt: "Chazz Karamelizuotų svogūnų skonio",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🧅",
        ingredients: "Potatoes, sunflower oil, caramelised onion seasoning (onion powder, sugar, salt, maltodextrin, natural flavoring, lactic acid), salt",
      },
      {
        name: "Chazz Creamy Mushroom Chips",
        nameLt: "Chazz Kreminio grybų skonio traškučiai",
        category: "Chips", categoryLt: "Traškučiai", emoji: "🍄",
        ingredients: "Potatoes, sunflower oil, mushroom cream seasoning (mushroom powder, cream powder, salt, sugar, maltodextrin, natural flavoring, yeast extract, onion powder), salt",
      },
    ],
  },

  // ── BROLIAI LOKIAI ────────────────────────────────────────────────────────
  {
    display: "Broliai Lokiai",
    country: "🇱🇹",
    emoji: "🐻",
    tagline: "Broliai Lokiai (Brothers Bears) · Lithuanian gummies & candy — Vilnius",
    aliases: ["broliai lokiai", "broliu lokiai", "brothers bears", "lokiai", "broliai"],
    products: [
      {
        name: "Broliai Lokiai Apple Gummies",
        nameLt: "Broliai Lokiai Obuolių guminukai",
        category: "Gummies", categoryLt: "Guminukai", emoji: "🍏",
        ingredients: "Glucose syrup, sugar, gelatin, citric acid, apple juice concentrate 3%, natural apple flavoring, elderflower extract, color: copper chlorophyllin",
      },
      {
        name: "Broliai Lokiai Mixed Fruit Gummies",
        nameLt: "Broliai Lokiai Mišrūs vaisių guminukai",
        category: "Gummies", categoryLt: "Guminukai", emoji: "🍬",
        ingredients: "Glucose syrup, sugar, gelatin, citric acid, fruit juice concentrates (strawberry, raspberry, orange, lemon, blackcurrant) 5%, natural flavoring, colors: anthocyanins, beta-carotene, copper chlorophyllin",
      },
      {
        name: "Broliai Lokiai Sour Bears",
        nameLt: "Broliai Lokiai Rūgštūs lokiukai",
        category: "Gummies", categoryLt: "Guminukai", emoji: "🐻",
        ingredients: "Glucose syrup, sugar, gelatin, citric acid, malic acid, tartaric acid, natural flavoring, fruit juice concentrates 3%, colors: anthocyanins, beta-carotene, curcumin",
      },
      {
        name: "Broliai Lokiai Strawberry Gummies",
        nameLt: "Broliai Lokiai Braškių guminukai",
        category: "Gummies", categoryLt: "Guminukai", emoji: "🍓",
        ingredients: "Glucose syrup, sugar, gelatin, citric acid, strawberry juice concentrate 4%, natural strawberry flavoring, color: anthocyanins",
      },
      {
        name: "Broliai Lokiai Cola Bottles",
        nameLt: "Broliai Lokiai Kolos buteliukai",
        category: "Gummies", categoryLt: "Guminukai", emoji: "🥤",
        ingredients: "Glucose syrup, sugar, gelatin, citric acid, caramel color (E150a), natural cola flavoring, tartaric acid",
      },
      {
        name: "Broliai Lokiai Peach Rings",
        nameLt: "Broliai Lokiai Persikų žiedai",
        category: "Gummies", categoryLt: "Guminukai", emoji: "🍑",
        ingredients: "Glucose syrup, sugar, gelatin, citric acid, peach juice concentrate 3%, natural peach flavoring, colors: beta-carotene, anthocyanins, coating: carnauba wax",
      },
      {
        name: "Broliai Lokiai Worm Gummies",
        nameLt: "Broliai Lokiai Kirminukai",
        category: "Gummies", categoryLt: "Guminukai", emoji: "🐛",
        ingredients: "Glucose syrup, sugar, gelatin, citric acid, fruit juice concentrates (raspberry, lemon) 4%, natural flavoring, colors: anthocyanins, beta-carotene",
      },
      {
        name: "Broliai Lokiai Honey Bears",
        nameLt: "Broliai Lokiai Medaus lokiukai",
        category: "Gummies", categoryLt: "Guminukai", emoji: "🍯",
        ingredients: "Glucose syrup, sugar, honey 8%, gelatin, citric acid, natural honey flavoring, beeswax coating",
      },
    ],
  },

  // ── VILNIAUS DUONA ────────────────────────────────────────────────────────
  {
    display: "Vilniaus Duona",
    country: "🇱🇹",
    emoji: "🍞",
    tagline: "Vilniaus Duona · Lithuania's largest bread bakery — Vilnius, est. 1950",
    aliases: ["vilniaus duona", "vilniaus duona duona", "vd bread"],
    products: [
      {
        name: "Vilniaus Duona Palanga Rye Bread",
        nameLt: "Vilniaus Duona Palangos ruginė duona",
        category: "Bread", categoryLt: "Duona", emoji: "🍞",
        ingredients: "Whole rye flour, water, rye sourdough, salt, caraway seeds",
      },
      {
        name: "Vilniaus Duona Crispy Rye Crispbread",
        nameLt: "Vilniaus Duona Traški ruginė",
        category: "Crispbread", categoryLt: "Traški duona", emoji: "🫓",
        ingredients: "Whole rye flour 85%, water, salt, yeast",
      },
      {
        name: "Vilniaus Duona Toast Bread White",
        nameLt: "Vilniaus Duona Batonas",
        category: "Bread", categoryLt: "Duona", emoji: "🍞",
        ingredients: "Wheat flour, water, sugar, sunflower oil, yeast, salt, emulsifier: mono- and diglycerides of fatty acids (E471), preservative: calcium propionate (E282)",
      },
      {
        name: "Vilniaus Duona Borodino Dark Bread",
        nameLt: "Vilniaus Duona Borodino duona",
        category: "Bread", categoryLt: "Duona", emoji: "🍞",
        ingredients: "Peeled rye flour, water, rye sourdough, wheat flour, molasses, salt, coriander, caraway",
      },
      {
        name: "Vilniaus Duona Multi-Seed Bread",
        nameLt: "Vilniaus Duona Sėklų duona",
        category: "Bread", categoryLt: "Duona", emoji: "🫓",
        ingredients: "Whole wheat flour, water, rye flour, sunflower seeds 6%, flaxseeds 4%, sesame seeds 3%, pumpkin seeds 3%, oat flakes, yeast, salt, sunflower oil",
      },
    ],
  },

  // ── ROKISKIO ─────────────────────────────────────────────────────────────
  {
    display: "Rokiškio",
    country: "🇱🇹",
    emoji: "🧀",
    tagline: "Rokiškio sūris · Lithuania's largest dairy — Rokiškis, est. 1925",
    aliases: ["rokiskio", "rokiškio", "rokiskio suris", "rokiškio sūris", "ab rokiskio suris"],
    products: [
      {
        name: "Rokiškio Džiugas 12 Month Aged Cheese",
        nameLt: "Rokiškio Džiugas 12 mėnesių brandintas sūris",
        category: "Cheese", categoryLt: "Sūris", emoji: "🧀",
        ingredients: "Pasteurized cow's milk, salt, bacterial starter culture, rennet",
      },
      {
        name: "Rokiškio Mozzarella 45%",
        nameLt: "Rokiškio Mozzarella sūris 45%",
        category: "Cheese", categoryLt: "Sūris", emoji: "🧀",
        ingredients: "Pasteurized cow's milk, bacterial starter culture, salt, rennet",
      },
      {
        name: "Rokiškio Farmer Cheese",
        nameLt: "Rokiškio ūkininko sūris",
        category: "Cheese", categoryLt: "Sūris", emoji: "🧀",
        ingredients: "Pasteurized cultured cow's milk, preservative: potassium sorbate",
      },
      {
        name: "Rokiškio Sweet Cream Butter 82%",
        nameLt: "Rokiškio Sviestas 82%",
        category: "Dairy", categoryLt: "Pieno produktai", emoji: "🧈",
        ingredients: "Pasteurized sweet cream (cow's milk)",
      },
      {
        name: "Rokiškio Kefir 2.5%",
        nameLt: "Rokiškio Kefyras 2,5%",
        category: "Dairy", categoryLt: "Pieno produktai", emoji: "🥛",
        ingredients: "Pasteurized cow's milk, kefir grains culture",
      },
      {
        name: "Rokiškio Sour Cream 30%",
        nameLt: "Rokiškio Grietinė 30%",
        category: "Dairy", categoryLt: "Pieno produktai", emoji: "🫙",
        ingredients: "Pasteurized cow's cream, lactic acid bacterial culture",
      },
    ],
  },
];

/** Search Lithuanian brand database — returns matching brand or null */
function searchLTBrand(q: string): LTBrand | null {
  const norm = normalizeForSearch(q);
  if (norm.length < 3) return null;
  for (const brand of LT_BRANDS) {
    for (const alias of brand.aliases) {
      const normAlias = normalizeForSearch(alias);
      if (normAlias === norm || normAlias.startsWith(norm) || norm.startsWith(normAlias)) {
        return brand;
      }
    }
  }
  return null;
}

/** Heuristic: looks like a product name (short, no comma list) vs an ingredient list */
function looksLikeProductName(text: string) {
  const commas = (text.match(/,/g) || []).length;
  const words  = text.trim().split(/\s+/).length;
  return commas <= 1 && words <= 5;
}

// Good sugar compounds: "sugar" appearing inside these should NOT trigger Refined Sugar penalty
const GOOD_SUGAR_COMPOUNDS = [
  "coconut sugar", "coconut palm sugar", "coconut blossom sugar",
  "date sugar", "maple sugar", "palm sugar",
];

/** Bidirectional scan — returns bad threats AND good finds */
function scanText(text: string): { bad: ScanResult[]; good: GoodResult[] } {
  const lower = text.toLowerCase();

  // ── Scan bad ingredients ──
  const bad: ScanResult[] = [];
  for (const bi of BAD_INGREDIENTS) {
    const terms = [
      bi.name,
      ...(bi.alsoKnownAs ? bi.alsoKnownAs.split(/[,;]+/).map(s => s.trim()) : []),
      ...(bi.eNumber ? [bi.eNumber] : []),
    ];
    for (const term of terms) {
      const t = term.toLowerCase().trim();
      if (t.length <= 2) continue;
      if (!lower.includes(t)) continue;

      // ── Deconflict: if term is bare "sugar", only count it if it appears
      //    OUTSIDE of any known good sugar compound (e.g. "coconut sugar").
      if (t === "sugar") {
        let remaining = lower;
        for (const compound of GOOD_SUGAR_COMPOUNDS) {
          // Erase the compound from the text so the "sugar" inside it is gone
          remaining = remaining.split(compound).join(" ".repeat(compound.length));
        }
        if (!remaining.includes("sugar")) continue; // only appeared inside good compounds
      }

      if (!bad.find(f => f.ingredient.name === bi.name)) {
        bad.push({ ingredient: bi, matched: term });
      }
      break;
    }
  }
  bad.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.ingredient.danger] - order[b.ingredient.danger];
  });

  // ── Scan good ingredients ──
  const good: GoodResult[] = [];
  for (const gi of BONUS_INGREDIENTS) {
    for (const alias of gi.aliases) {
      if (alias.length > 2 && lower.includes(alias.toLowerCase())) {
        if (!good.find(f => f.ingredient.name === gi.name)) {
          good.push({ ingredient: gi, matched: alias });
        }
        break;
      }
    }
  }
  // Sort by bonus descending (best first)
  good.sort((a, b) => b.ingredient.bonus - a.ingredient.bonus);

  return { bad, good };
}

/** Compute deduction for a single bad result on 1000-pt scale.
 *  Uses ingredient-specific `points` override if set, else tier default. */
function badPts(r: ScanResult): number {
  return r.ingredient.points
    ?? (r.ingredient.danger === "high" ? 200 : r.ingredient.danger === "medium" ? 110 : 50);
}

/** Purity score — unclamped. Baseline 500, bad subtracts (with per-ingredient weights), good adds.
 *  Can go negative (very toxic) or above 1000 (exceptionally clean). */
function computeScore(bad: ScanResult[], good: GoodResult[]) {
  let score = 500;
  for (const r of bad)  score -= badPts(r);
  for (const r of good) score += r.ingredient.bonus;
  return score;
}

/** Eight-tier grade — unclamped score range (can be negative or above 1000) */
function getGrade(score: number): { label: string; labelLt: string; emoji: string; color: string } {
  if (score >= 1200) return { label: "Legendary", labelLt: "Legendinis", emoji: "⭐", color: "#e879f9" };
  if (score >= 900)  return { label: "Divine",    labelLt: "Dieviška",   emoji: "👑", color: "#f0c855" };
  if (score >= 750)  return { label: "Holy",      labelLt: "Šventa",     emoji: "✦",  color: "#22c55e" };
  if (score >= 550)  return { label: "Decent",    labelLt: "Neblogai",   emoji: "🌿", color: "#84cc16" };
  if (score >= 350)  return { label: "Neutral",   labelLt: "Neutralu",   emoji: "⚠️", color: "#f97316" };
  if (score >= 150)  return { label: "Poor",      labelLt: "Blogai",     emoji: "❌", color: "#ef4444" };
  if (score >= 0)    return { label: "Toxic",     labelLt: "Toksiška",   emoji: "☠️", color: "#7f1d1d" };
  return               { label: "Lethal",     labelLt: "Mirtina",    emoji: "☣️", color: "#3b0000" };
}

function IngredientScannerSection({ lang, user, onScanComplete }: {
  lang: "en" | "lt";
  user: User | null;
  onScanComplete: (productName: string, score: number) => void;
}) {
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
                        <a key={p.name} href="/products"
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
                    <a href="/products"
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

// ─── PRODUCT REVIEWS DISPLAY ─────────────────────────────────────────────────

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { display_name: string | null; avatar_url: string | null }[] | null;
};

function ProductReviews({ lang, productName }: { lang: "en" | "lt"; productName: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("product_reviews")
          .select("id, rating, comment, created_at, profiles(display_name, avatar_url)")
          .ilike("product_name", productName)
          .order("created_at", { ascending: false })
          .limit(10);
        setReviews((data as Review[]) ?? []);
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, [productName]);

  if (loading || reviews.length === 0) return null;

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-semibold text-white/80 text-sm">
          {lang === "en" ? "Community Reviews" : "Bendruomenės atsiliepimai"}
        </h3>
        <div className="flex items-center gap-1">
          <span className="text-[#f0c855] text-sm">{"★".repeat(Math.round(avgRating))}</span>
          <span className="text-white/30 text-xs ml-1">{avgRating.toFixed(1)} · {reviews.length}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <div key={r.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-white/[0.06] text-white/50 overflow-hidden">
              {r.profiles?.[0]?.avatar_url
                ? <img src={r.profiles[0].avatar_url!} alt="" className="w-full h-full object-cover" />
                : (r.profiles?.[0]?.display_name?.[0]?.toUpperCase() ?? "?")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-white/70">
                  {r.profiles?.[0]?.display_name ?? (lang === "en" ? "Anonymous" : "Anonimas")}
                </span>
                <span className="text-[#f0c855] text-xs">{"★".repeat(r.rating)}</span>
                <span className="text-white/20 text-[10px]">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.comment && (
                <p className="text-xs text-white/45 leading-relaxed">{r.comment}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── REVIEW FORM ──────────────────────────────────────────────────────────────

function ReviewForm({ id, lang, productName, brand, score, userId }: {
  id?: string;
  lang: "en" | "lt";
  productName: string;
  brand: string;
  score: number;
  userId: string;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    setStatus("sending");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("product_reviews").insert({
        user_id: userId,
        product_name: productName.trim(),
        brand: brand.trim() || null,
        purity_score: score,
        rating,
        comment: comment.trim() || null,
      });
      if (error) throw error;
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const labels = {
    en: { title: "Leave a review", sub: "Help the community with your experience", star: "stars", placeholder: "Share your experience with this product (optional)…", send: "Submit Review", done: "Thank you for your review! ✦", err: "Couldn't save — try again." },
    lt: { title: "Palikite atsiliepimą", sub: "Padėkite bendruomenei", star: "žvaigždutės", placeholder: "Pasidalinkite patirtimi apie šį produktą (nebūtina)…", send: "Pateikti atsiliepimą", done: "Ačiū už atsiliepimą! ✦", err: "Nepavyko išsaugoti — bandykite dar kartą." },
  }[lang];

  return (
    <div id={id} className="mt-8 rounded-2xl border border-[#f0c855]/15 bg-white/[0.03] p-6">
      <h3 className="font-[var(--font-playfair)] text-xl font-bold text-white/90 mb-1">{labels.title}</h3>
      <p className="text-sm text-white/35 mb-5">{labels.sub}</p>

      {status === "done" ? (
        <p className="text-[#22c55e] font-semibold text-center py-4">{labels.done}</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* Star picker */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
                className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                aria-label={`${s} ${labels.star}`}
              >
                <span style={{ filter: s <= (hovered || rating) ? "none" : "grayscale(1) opacity(0.25)" }}>⭐</span>
              </button>
            ))}
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={labels.placeholder}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-[#f0c855]/15 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#f0c855]/40 resize-none transition-colors"
          />

          {status === "error" && (
            <p className="text-red-400 text-sm">{labels.err}</p>
          )}

          <button
            type="submit"
            disabled={!rating || status === "sending"}
            className="self-start px-6 py-2.5 rounded-full text-sm font-bold text-[#0b1220] disabled:opacity-40 transition-opacity"
            style={{ background: "linear-gradient(to right, #d4a830, #fad55c)" }}
          >
            {status === "sending" ? "…" : labels.send}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── LEADERBOARD SECTION ──────────────────────────────────────────────────────

type LeaderEntry = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak_days: number;
};

function LeaderboardSection({ lang, currentUserId }: { lang: "en" | "lt"; currentUserId?: string }) {
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
          <p className="text-center text-white/30 py-12">
            {lang === "en" ? "No entries yet — be the first to scan!" : "Dar nėra įrašų — nuskanuokite pirmieji!"}
          </p>
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

// ─── PRODUCT QUIZ SECTION ─────────────────────────────────────────────────────

const QUIZ_STEPS = [
  {
    q: { en: "What's your main snack goal?", lt: "Koks jūsų pagrindinis užkandžių tikslas?" },
    options: [
      { en: "Pure treat / enjoyment", lt: "Malonumas",        emoji: "😋", cats: ["gummies", "chocolate"] },
      { en: "Energy & hydration",     lt: "Energija",         emoji: "⚡", cats: ["drinks", "snacks"] },
      { en: "Dental & oral health",   lt: "Dantų sveikata",   emoji: "🦷", cats: ["gums"] },
      { en: "Clean everyday snack",   lt: "Švarūs užkandžiai",emoji: "🌿", cats: ["snacks", "gummies"] },
    ],
  },
  {
    q: { en: "Favourite flavour direction?", lt: "Mėgiama skonio kryptis?" },
    options: [
      { en: "Sweet & fruity",  lt: "Saldus ir vaisinis",  emoji: "🍓", cats: ["gummies", "drinks"] },
      { en: "Rich & intense",  lt: "Sodrus ir intensyvus", emoji: "🍫", cats: ["chocolate"] },
      { en: "Salty & crunchy", lt: "Sūrus ir traškus",    emoji: "🧂", cats: ["snacks"] },
      { en: "Cool & fresh",    lt: "Gaivus ir šviežias",  emoji: "❄️", cats: ["gums", "drinks"] },
    ],
  },
  {
    q: { en: "Any dietary preference?", lt: "Kokia mityba?" },
    options: [
      { en: "Vegan / plant-based", lt: "Veganiška",   emoji: "🌱", cats: ["gummies", "snacks", "drinks", "gums"] },
      { en: "No added sugar",      lt: "Be cukraus",  emoji: "🚫", cats: ["gums", "drinks"] },
      { en: "High protein",        lt: "Daug baltymų",emoji: "💪", cats: ["snacks"] },
      { en: "No preference",       lt: "Nėra",        emoji: "✨", cats: ["gummies", "chocolate", "drinks", "snacks", "gums"] },
    ],
  },
];

// ─── GOOD PLANET PAGE ─────────────────────────────────────────────────────────

function GoodPlanetPage({ lang, onBack }: { lang: "en" | "lt"; onBack: () => void }) {
  const [visible, setVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const filtered = activeCategory === "all"
    ? GOOD_INGREDIENTS
    : GOOD_INGREDIENTS.filter(ing => ing.category === activeCategory);

  const highCount = GOOD_INGREDIENTS.filter(i => i.benefit === "high").length;
  const total = GOOD_INGREDIENTS.length;

  const benefitMeta = {
    high:   { label: "HIGH BENEFIT",   labelLt: "DIDELĖ NAUDA",    color: "#22c55e", border: "rgba(34,197,94,0.40)",  bg: "rgba(34,197,94,0.09)"  },
    medium: { label: "PROVEN BENEFIT", labelLt: "ĮRODYTA NAUDA",   color: "#84cc16", border: "rgba(132,204,22,0.35)", bg: "rgba(132,204,22,0.08)" },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#040e08" }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-emerald-950/40"
        style={{ background: "rgba(4,14,8,0.96)" }}>
        <button onClick={onBack} className="text-sm font-semibold text-emerald-400/55 hover:text-emerald-400 transition-colors">
          {lang === "en" ? "← Back to Universe" : "← Grįžti į visatą"}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-[var(--font-playfair)] text-lg font-bold" style={{ color: "#86efac" }}>
            {lang === "en" ? "The Good Planet" : "Geroji planeta"}
          </span>
        </div>
        <HolyLogo size="sm" />
      </div>

      {/* ── Hero ── */}
      <div className={`relative py-16 px-6 text-center overflow-hidden transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px]"
            style={{ background: "radial-gradient(ellipse, rgba(0,150,60,0.18) 0%, transparent 65%)" }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center animate-float"
            style={{
              background: "radial-gradient(circle at 35% 35%, #052e16, #14532d 55%, #052e16)",
              boxShadow: "0 0 90px 28px rgba(0,180,80,0.22), 0 0 40px 10px rgba(34,197,94,0.15), inset 0 0 30px rgba(0,0,0,0.6)",
              border: "2px solid rgba(34,197,94,0.28)",
            }}>
            <span className="text-5xl">🌿</span>
          </div>

          <p className="text-emerald-500/50 text-xs tracking-[0.3em] uppercase font-bold mb-4">
            ✦ {lang === "en" ? "Every bad ingredient has a clean alternative" : "Kiekvienam blogam ingredientui yra švari alternatyva"} ✦
          </p>
          <h1 className="font-[var(--font-playfair)] text-4xl md:text-6xl font-black mb-5 leading-tight"
            style={{ color: "#86efac", textShadow: "0 0 60px rgba(34,197,94,0.45)" }}>
            {lang === "en" ? "What Should Be in Your Snacks" : "Kas turėtų būti tavo užkandžiuose"}
          </h1>
          <p className="text-white/45 text-base md:text-lg leading-relaxed mb-10">
            {lang === "en"
              ? "For every toxic shortcut the food industry takes, nature already has a better answer. These are the ingredients that replace the bad ones — with proven science, not marketing."
              : "Kiekvienam toksiškam pramonės sprendimui gamta jau turi geresnį atsakymą. Tai ingredientai, kurie pakeičia blogus — su mokslo įrodymais, ne rinkodara."}
          </p>

          <div className="flex justify-center gap-5 md:gap-12 mb-10 flex-wrap">
            {[
              { num: total,     suffix: "", label: lang === "en" ? "Good Alternatives"  : "Gerų alternatyvų",  green: true  },
              { num: highCount, suffix: "", label: lang === "en" ? "High Benefit"        : "Didelė nauda",      green: true  },
              { num: 0,         suffix: "", label: lang === "en" ? "Artificial Additives" : "Sintetinių priedų", green: false },
            ].map((s, i) => (
              <div key={i} className="text-center px-4">
                <div className="font-[var(--font-playfair)] text-4xl font-black mb-1"
                  style={{ color: s.green ? "#22c55e" : "#f0c855" }}>
                  {s.num}{s.suffix}
                </div>
                <div className="text-xs text-white/30 tracking-widest uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 flex-wrap">
            {(["high", "medium"] as const).map(b => (
              <div key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
                style={{ background: benefitMeta[b].bg, border: `1px solid ${benefitMeta[b].border}`, color: benefitMeta[b].color }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: benefitMeta[b].color }} />
                {lang === "en" ? benefitMeta[b].label : benefitMeta[b].labelLt}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category filter tabs ── */}
      <div className="sticky top-[65px] z-10 border-b border-white/5"
        style={{ background: "rgba(4,14,8,0.98)", backdropFilter: "blur(12px)" }}>
        <div className="flex flex-wrap gap-2 px-6 py-3 justify-center">
          {GOOD_CATEGORIES.map(gc => {
            const count = gc.id === "all" ? GOOD_INGREDIENTS.length : GOOD_INGREDIENTS.filter(i => i.category === gc.id).length;
            const isActive = activeCategory === gc.id;
            return (
              <button key={gc.id} onClick={() => setActiveCategory(gc.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: isActive ? "rgba(34,197,94,0.20)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isActive ? "rgba(34,197,94,0.50)" : "rgba(255,255,255,0.08)"}`,
                  color: isActive ? "#22c55e" : "rgba(255,255,255,0.40)",
                }}>
                <span>{gc.icon}</span>
                <span>{lang === "en" ? gc.label : gc.labelLt}</span>
                <span className="ml-0.5 opacity-50">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ingredient cards ── */}
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ing) => {
          const isExpanded = expandedCard === ing.name;
          const bm = benefitMeta[ing.benefit];
          return (
            <div key={ing.name}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, rgba(4,14,8,0.95) 0%, rgba(5,46,22,0.4) 100%)`,
                border: `1px solid ${isExpanded ? "rgba(34,197,94,0.35)" : "rgba(34,197,94,0.12)"}`,
                boxShadow: isExpanded ? "0 0 30px rgba(34,197,94,0.12)" : "none",
              }}
              onClick={() => setExpandedCard(isExpanded ? null : ing.name)}
            >
              {/* Card header */}
              <div className="p-4 flex items-start gap-4">
                {/* Gradient sphere */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${ing.gradient} flex items-center justify-center flex-shrink-0`}
                  style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
                  <span className="text-2xl">{ing.emoji}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-[var(--font-playfair)] font-bold text-white text-base leading-tight">{ing.name}</h3>
                    <span className="text-white/30 text-lg flex-shrink-0 mt-0.5">{isExpanded ? "−" : "+"}</span>
                  </div>

                  {/* Benefit badge */}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ background: bm.bg, color: bm.color, border: `1px solid ${bm.border}` }}>
                      ✦ {lang === "en" ? bm.label : bm.labelLt}
                    </span>
                  </div>

                  {/* Replaces tag — always visible */}
                  <p className="text-[10px] text-white/35 mt-1.5 leading-relaxed">
                    <span className="text-red-400/60">Replaces: </span>
                    <span>{ing.replaces.split(",")[0]}{ing.replaces.includes(",") ? "…" : ""}</span>
                  </p>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-5 flex flex-col gap-3 border-t border-white/[0.06] pt-4">
                  {/* Replaces full */}
                  <div className="flex gap-2">
                    <span className="text-red-400 text-xs flex-shrink-0 mt-0.5">🚫</span>
                    <div>
                      <p className="text-[10px] text-red-400/60 font-bold uppercase tracking-wide mb-0.5">
                        {lang === "en" ? "Replaces" : "Pakeičia"}
                      </p>
                      <p className="text-xs text-white/50">{ing.replaces}</p>
                    </div>
                  </div>

                  {ing.alsoKnownAs && (
                    <div className="flex gap-2">
                      <span className="text-white/20 text-xs flex-shrink-0 mt-0.5">🏷</span>
                      <div>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-wide mb-0.5">
                          {lang === "en" ? "Also known as" : "Taip pat žinomas kaip"}
                        </p>
                        <p className="text-xs text-white/40 italic">{ing.alsoKnownAs}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <span className="text-emerald-400 text-xs flex-shrink-0 mt-0.5">✦</span>
                    <div>
                      <p className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-wide mb-0.5">
                        {lang === "en" ? "Why it's better" : "Kodėl geriau"}
                      </p>
                      <p className="text-xs text-white/55 leading-relaxed">{ing.whyGood}</p>
                    </div>
                  </div>

                  {ing.scienceFact && (
                    <div className="flex gap-2 rounded-lg px-3 py-2.5"
                      style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)" }}>
                      <span className="text-emerald-400 text-xs flex-shrink-0">🔬</span>
                      <p className="text-[11px] text-emerald-300/60 leading-relaxed italic">{ing.scienceFact}</p>
                    </div>
                  )}

                  <div className="flex gap-2 rounded-lg px-3 py-2.5 mt-1"
                    style={{ background: "rgba(240,200,85,0.06)", border: "1px solid rgba(240,200,85,0.15)" }}>
                    <span className="text-[#f0c855] text-xs flex-shrink-0">✦</span>
                    <div>
                      <p className="text-[9px] text-[#f0c855]/50 font-bold uppercase tracking-wide mb-0.5">Holy Promise</p>
                      <p className="text-[11px] text-white/45 leading-relaxed">{ing.holyUse}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductQuizSection({ lang, onSelectCategory }: { lang: "en" | "lt"; onSelectCategory: (cat: Category) => void }) {
  const anim = useInView(0.1);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  function pick(cats: string[]) {
    const next = { ...scores };
    cats.forEach(c => { next[c] = (next[c] || 0) + 1; });
    setScores(next);
    if (step + 1 >= QUIZ_STEPS.length) setDone(true);
    else setStep(s => s + 1);
  }

  function reset() { setStep(0); setScores({}); setDone(false); }

  const topCatId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCat   = CATEGORIES.find(c => c.id === topCatId);

  return (
    <section className="relative py-28 px-6 overflow-hidden" style={{ background: "radial-gradient(ellipse at 70% 40%, #120a18 0%, #0b1220 65%)" }}>
      <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }} />

      <div ref={anim.ref} className="max-w-2xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#c084fc" }}>
            ✦ {lang === "en" ? "Find Your Planet" : "Rask savo planetą"}
          </p>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-black text-white mb-4">
            {lang === "en" ? <>What's your<br /><span style={{ color: "#c084fc" }}>Holy Snack?</span></> : <>Koks tavo<br /><span style={{ color: "#c084fc" }}>šventasis užkandis?</span></>}
          </h2>
        </div>

        {!done ? (
          <div className={`transition-all duration-500 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Progress bar */}
            <div className="flex gap-1.5 mb-8">
              {QUIZ_STEPS.map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500"
                  style={{ background: i <= step ? "#c084fc" : "rgba(255,255,255,0.1)" }} />
              ))}
            </div>
            {/* Question */}
            <div className="rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(192,132,252,0.15)" }}>
              <p className="font-[var(--font-playfair)] text-2xl font-bold text-white mb-8 text-center">
                {QUIZ_STEPS[step].q[lang]}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {QUIZ_STEPS[step].options.map((opt, i) => (
                  <button key={i} onClick={() => pick(opt.cats)}
                    className="rounded-2xl p-4 text-left transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(192,132,252,0.12)" }}>
                    <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                    <span className="text-sm text-white/80 font-medium leading-snug">{opt[lang]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up text-center">
            {topCat ? (
              <>
                <p className="text-sm text-white/50 mb-6">{lang === "en" ? "Your perfect match is…" : "Jūsų idealus pasirinkimas…"}</p>
                <div className={`w-36 h-36 rounded-full bg-gradient-to-br ${topCat.gradient} flex items-center justify-center mx-auto mb-6`}
                  style={{ boxShadow: `0 0 60px 20px ${topCat.glow}, inset 0 0 30px rgba(255,255,255,0.2)`, border: "2px solid rgba(255,255,255,0.3)" }}>
                  <span style={{ fontSize: 52 }}>{topCat.icon}</span>
                </div>
                <h3 className="font-[var(--font-playfair)] text-4xl font-black text-white mb-2">{lang === "lt" ? topCat.labelLt : topCat.label}</h3>
                <p className="text-white/45 mb-8 text-sm max-w-xs mx-auto">
                  {lang === "en" ? "Based on your answers, this planet was made for you." : "Pagal jūsų atsakymus, ši planeta skirta jums."}
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => onSelectCategory(topCat)}
                    className="px-8 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${topCat.accentColor}, ${topCat.accentColor}cc)`, color: "#0b1220" }}>
                    {lang === "en" ? "Explore Planet →" : "Tyrinėti →"}
                  </button>
                  <button onClick={reset}
                    className="px-6 py-3 rounded-full font-semibold text-sm text-white/40 hover:text-white/70 transition-colors border border-white/10">
                    {lang === "en" ? "Retake" : "Bandyti dar"}
                  </button>
                </div>
              </>
            ) : (
              <button onClick={reset} className="text-white/50 underline">{lang === "en" ? "Try again" : "Bandyti dar kartą"}</button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── LOYALTY SECTION ──────────────────────────────────────────────────────────

// ─── NEWSLETTER SECTION ───────────────────────────────────────────────────────

function NewsletterSection({ lang }: { lang: "en" | "lt" }) {
  const anim = useInView();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const t = {
    en: { title: "Join the Chosen.", sub: "New flavours. Exclusive drops. Early access. No spam.", placeholder: "your@email.com", cta: "✦ Join the Movement", done: "You're in! ✦ Watch your inbox.", err: "Something went wrong — try again." },
    lt: { title: "Prisijunk prie išrinktųjų.", sub: "Nauji skoniai. Išskirtiniai leidimai. Ankstyva prieiga.", placeholder: "tavo@el.pastas.lt", cta: "✦ Prisijungti", done: "Prisijungta! ✦ Laukite žinučių.", err: "Klaida — bandykite dar kartą." },
  }[lang];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch { setStatus("error"); }
  }

  return (
    <section className="px-6 py-24 max-w-2xl mx-auto text-center">
      <div ref={anim.ref} className={`transition-all duration-700 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <span className="text-[#f0c855]/60 text-xs tracking-widest uppercase mb-4 block">✦ ✦ ✦</span>
        <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">{t.title}</h2>
        <p className="text-white/55 text-lg mb-10">{t.sub}</p>
        {status === "done" ? (
          <p className="text-[#f0c855] font-semibold text-lg">{t.done}</p>
        ) : (
          <>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={submit}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder={t.placeholder}
                className="flex-1 px-5 py-3.5 rounded-full bg-white/[0.04] border border-[#f0c855]/15 text-white placeholder-white/25 focus:outline-none focus:border-[#f0c855]/40 transition-colors text-sm" />
              <button type="submit" disabled={status === "sending"}
                className="px-6 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap text-[#0b1220] disabled:opacity-50"
                style={{ background: "linear-gradient(to right, #d4a830, #fad55c)" }}>
                {status === "sending" ? "…" : t.cta}
              </button>
            </form>
            {status === "error" && <p className="text-red-400 text-sm mt-3">{t.err}</p>}
          </>
        )}
      </div>
    </section>
  );
}

function LoyaltySection({ lang }: { lang: "en" | "lt" }) {
  const anim = useInView(0.1);
  const tiers = [
    {
      name: "Novice",       nameLt: "Naujokas",
      icon: "🌱", points: "0 – 499",
      color: "#86efac", glow: "rgba(134,239,172,0.3)",
      perks: lang === "en"
        ? ["Early access to new flavours", "5% off every order", "Monthly snack digest"]
        : ["Ankstyva prieiga prie naujų skonių", "5% nuolaida kiekvienam užsakymui", "Mėnesinis biuletenis"],
    },
    {
      name: "Apostle",      nameLt: "Apaštalas",
      icon: "⚡", points: "500 – 1 999",
      color: "#60a5fa", glow: "rgba(96,165,250,0.3)",
      perks: lang === "en"
        ? ["All Novice perks", "10% off + free shipping", "Exclusive limited drops", "Birthday gift box"]
        : ["Visos Naujoko naudos", "10% nuolaida + nemokamas pristatymas", "Išskirtiniai leidimai", "Gimtadienio dovanų dėžutė"],
    },
    {
      name: "Saint",        nameLt: "Šventasis",
      icon: "✦", points: "2 000 – 4 999",
      color: "#f0c855", glow: "rgba(240,200,85,0.35)",
      perks: lang === "en"
        ? ["All Apostle perks", "15% off everything", "Taste-tester invitations", "Personalised snack box"]
        : ["Visos Apaštalo naudos", "15% nuolaida viskam", "Skonio testerio kvietimai", "Personalizuota dėžutė"],
    },
    {
      name: "Divine",       nameLt: "Dieviškasis",
      icon: "👑", points: "5 000+",
      color: "#e879f9", glow: "rgba(232,121,249,0.35)",
      perks: lang === "en"
        ? ["All Saint perks", "20% off for life", "Co-create new products", "Annual divine retreat"]
        : ["Visos Šventojo naudos", "20% nuolaida visam laikui", "Kurkite produktus kartu", "Metinis susitikimas"],
    },
  ];

  return (
    <section className="relative py-28 px-6 overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% 0%, #0f0a18 0%, #0b1220 65%)" }}>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(240,200,85,0.2), transparent)" }} />

      <div ref={anim.ref} className="max-w-5xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-700 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#f0c855" }}>
            ✦ {lang === "en" ? "The Holy Circle" : "Šventasis ratas"}
          </p>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-black text-white mb-4">
            {lang === "en" ? <>Snack more.<br /><span style={{ color: "#f0c855" }}>Earn divinity.</span></> : <>Užkandžiauk daugiau.<br /><span style={{ color: "#f0c855" }}>Pelnauk dievystę.</span></>}
          </h2>
          <p className="text-white/40 max-w-md mx-auto text-sm">
            {lang === "en"
              ? "Every purchase earns Holy Points. Rise through the tiers, unlock exclusive perks, and become part of something greater."
              : "Kiekvienas pirkinys uždirba Holy taškų. Kopkite per lygius, atrakinkite išskirtines privilegijas."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier, i) => (
            <div key={i}
              className="rounded-3xl p-6 flex flex-col gap-5 hover:scale-[1.03]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${tier.color}22`,
                boxShadow: `0 0 30px ${tier.glow}`,
                opacity: anim.inView ? 1 : 0,
                transform: anim.inView ? "translateY(0) scale(1)" : "translateY(32px) scale(1)",
                transition: `opacity 0.6s ${i * 0.1}s, transform 0.6s ${i * 0.1}s, box-shadow 0.3s`,
              }}>
              {/* Icon + name */}
              <div>
                <div className="text-4xl mb-3">{tier.icon}</div>
                <div className="font-[var(--font-playfair)] text-xl font-black text-white">
                  {lang === "lt" ? tier.nameLt : tier.name}
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase mt-1" style={{ color: tier.color }}>
                  {tier.points} {lang === "en" ? "pts" : "tašk."}
                </div>
              </div>
              {/* Divider */}
              <div className="h-px w-full rounded-full opacity-20" style={{ background: tier.color }} />
              {/* Perks */}
              <ul className="space-y-2 flex-1">
                {tier.perks.map((perk, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-white/55 leading-snug">
                    <span className="mt-0.5 flex-shrink-0 w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-black"
                      style={{ background: `${tier.color}30`, color: tier.color }}>✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className={`text-center text-xs text-white/25 mt-10 transition-all duration-700 delay-500 ${anim.inView ? "opacity-100" : "opacity-0"}`}>
          {lang === "en" ? "✦ Launching with our first product drop — join the waitlist to start earning early." : "✦ Paleisime kartu su pirmuoju produktų paleidimu — prisijunkite prie laukimo sąrašo."}
        </p>
      </div>
    </section>
  );
}

// ─── COMPARISON SECTION ───────────────────────────────────────────────────────

function ComparisonSection({ lang }: { lang: "en" | "lt" }) {
  const anim = useInView();

  const rows = [
    {
      label:  lang === "en" ? "Sweetener"   : "Saldintuvas",
      bad:    lang === "en" ? "Refined sugar or high-fructose corn syrup" : "Rafinuotas cukrus arba HFCS",
      good:   lang === "en" ? "Coconut sugar or real fruit" : "Kokosų cukrus arba tikri vaisiai",
    },
    {
      label:  lang === "en" ? "Color"       : "Spalva",
      bad:    lang === "en" ? "Red 40, Yellow 5, Blue 1 (petroleum-derived)" : "Red 40, Yellow 5 (iš naftos)",
      good:   lang === "en" ? "Beet juice, turmeric, spirulina" : "Burokėliai, ciberžolė, spirulina",
    },
    {
      label:  lang === "en" ? "Preservative": "Konservantas",
      bad:    lang === "en" ? "Sodium Benzoate + BHA/BHT" : "Natrio benzoatas, BHA/BHT",
      good:   lang === "en" ? "Rosemary extract + citric acid" : "Rozmarino ekstraktas + citrinų rūgštis",
    },
    {
      label:  lang === "en" ? "Fat source"  : "Riebalai",
      bad:    lang === "en" ? "Palm oil or hydrogenated oils" : "Palmių aliejus arba hidrogenizuoti riebalai",
      good:   lang === "en" ? "Cold-pressed olive or coconut oil" : "Šaltai spaustas alyvuogių aliejus",
    },
    {
      label:  lang === "en" ? "Salt"        : "Druska",
      bad:    lang === "en" ? "Refined table salt + anti-caking agents" : "Rafinuota druska + priedai",
      good:   lang === "en" ? "Himalayan pink salt (80+ minerals)" : "Himalajų druska (80+ mineralų)",
    },
    {
      label:  lang === "en" ? "Transparency": "Skaidrumas",
      bad:    lang === "en" ? `"Natural flavors" — a legal black box` : `"Natūralus aromatas" — juridinė dėžutė`,
      good:   lang === "en" ? "Every ingredient named in plain language" : "Kiekvienas ingredientas pavadintas aiškiai",
    },
  ];

  return (
    <section className="px-6 py-24 border-t border-white/5">
      <div ref={anim.ref}
        className={`max-w-4xl mx-auto transition-all duration-700 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        <div className="text-center mb-14">
          <p className="text-[#f0c855]/45 text-xs tracking-widest uppercase mb-4">✦ ✦ ✦</p>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-white mb-4">
            {lang === "en" ? "HolySnacks vs The Rest" : "HolySnacks prieš kitus"}
          </h2>
          <p className="text-white/35 max-w-md mx-auto text-sm">
            {lang === "en" ? "Side by side. No spin. Just ingredients." : "Greta. Be apgaulės. Tik ingredientai."}
          </p>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[minmax(80px,1fr)_1.4fr_1.4fr] gap-3 mb-2">
          <div />
          <div className="text-center text-[10px] font-black tracking-widest uppercase px-3 py-2 rounded-xl"
            style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.15)", color: "#ef4444" }}>
            😈 {lang === "en" ? "Conventional" : "Įprasti"}
          </div>
          <div className="text-center text-[10px] font-black tracking-widest uppercase px-3 py-2 rounded-xl"
            style={{ background: "rgba(240,200,85,0.07)", border: "1px solid rgba(240,200,85,0.20)", color: "#f0c855" }}>
            ✦ HolySnacks
          </div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[minmax(80px,1fr)_1.4fr_1.4fr] gap-3 items-center">
              <div className="text-[11px] font-bold text-white/40 px-2 py-2">{row.label}</div>
              <div className="px-3.5 py-3 rounded-xl text-[11px] text-red-400/65 leading-relaxed"
                style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.10)" }}>
                ✗ {row.bad}
              </div>
              <div className="px-3.5 py-3 rounded-xl text-[11px] leading-relaxed"
                style={{ background: "rgba(240,200,85,0.05)", border: "1px solid rgba(240,200,85,0.13)", color: "rgba(240,200,85,0.75)" }}>
                ✓ {row.good}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/20 text-[10px] mt-8">
          {lang === "en"
            ? "Based on average ingredients found in top-selling conventional snack brands."
            : "Remiantis populiariausių įprastų užkandžių brandų ingredientų sąrašais."}
        </p>
      </div>
    </section>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────

function CartDrawer({ items, lang, onClose, onUpdateQty, onRemove }: {
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

// ─── PRODUCT DETAIL MODAL ─────────────────────────────────────────────────────

function ProductDetailModal({ product, cat, lang, onBack, onAddToCart }: {
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

// ─── AUTH MODAL ──────────────────────────────────────────────────────────────

function AuthModal({ lang, onClose, onAuthed }: { lang: "en" | "lt"; onClose: () => void; onAuthed: () => void }) {
  const [mode, setMode]         = useState<"signin" | "signup">("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);
  const supabase = createClient();

  async function handleGoogle() {
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
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
      else setSuccess("Check your email to verify your account!");
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
          {/* Google */}
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

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[11px] text-white/20">{lang === "en" ? "or" : "arba"}</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

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

          <p className="text-center text-xs text-white/25 pt-1">
            {mode === "signup" ? (lang === "en" ? "Already have an account? " : "Jau turite paskyrą? ") : (lang === "en" ? "New here? " : "Nauja? ")}
            <button onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(null); setSuccess(null); }}
              className="text-[#f0c855]/65 hover:text-[#f0c855] transition-colors">
              {mode === "signup" ? (lang === "en" ? "Sign in" : "Prisijungti") : (lang === "en" ? "Create account" : "Registruotis")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── USER PROFILE PANEL ──────────────────────────────────────────────────────

function UserProfilePanel({ profile, recentScans, lang, onClose, onSignOut }: {
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
  const newsletterAnim = useInView();

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
            <a href="#mission" className="hover:text-[#f0c855] transition-colors">{t.nav.about}</a>
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
            <a href="#mission" onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-[#f0c855] py-2">{t.nav.about}</a>
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

            {/* Removed: replaced by MobilePlanetScroller below */}

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
