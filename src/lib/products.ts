import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "gummies",
    radius: 105, duration: 9, size: 84, startAngle: 0,
    icon: "🍬", label: "Gummies", labelLt: "Guminukai",
    gradient: "from-pink-500 via-orange-400 to-yellow-400",
    glow: "rgba(251,146,60,0.45)", ring: "rgba(251,146,60,0.15)",
    bgFrom: "#1a0a10", accentColor: "#fb923c",
    keyIngredients: [
      { emoji: "🍎", name: "Apple Pectin", benefit: "Premium French confectionery standard. A natural plant-based gelling agent extracted from apple skins — creates a perfect chew without gelatin, corn syrup, or synthetic binders." },
      { emoji: "🌾", name: "Tapioca Starch", benefit: "Adds body, bounce, and that satisfying chew. Naturally gluten-free, derived from cassava root. The secret to a gummy that holds its shape without artificial stiffeners." },
      { emoji: "🌊", name: "Natural Agar", benefit: "A secondary texture stabiliser from red algae. Keeps gummies firm at room temperature, vegan-certified, and adds nothing synthetic to the formula." },
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
    glow: "rgba(180,100,30,0.45)", ring: "rgba(180,100,30,0.18)",
    bgFrom: "#120a00", accentColor: "#d4a830",
    keyIngredients: [
      { emoji: "🍫", name: "Single-Origin Cacao", benefit: "Traceable from farm to bar — no blended commodity cacao, no mystery origins. Rich in flavonoids and natural antioxidants that conventional chocolate processing destroys." },
      { emoji: "🌿", name: "Natural & Organic Sweeteners", benefit: "Coconut sugar, raw honey, organic stevia and other nature-derived sources only. Never refined white sugar, never artificial sweeteners. Sweetness with intention." },
      { emoji: "🌸", name: "Bourbon Vanilla Pod", benefit: "Real vanilla bean extract — not synthetic vanillin derived from petrochemicals. The flavour is richer, rounder, and takes weeks to develop properly. Worth every second." },
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
    glow: "rgba(99,179,237,0.45)", ring: "rgba(99,179,237,0.18)",
    bgFrom: "#000d1a", accentColor: "#60a5fa",
    keyIngredients: [
      { emoji: "⚡", name: "Natural Electrolytes", benefit: "Calcium, magnesium and potassium sourced from mineral deposits — not synthetic lab salts. Replenish what you actually lose during exercise, without the neon dye." },
      { emoji: "🦠", name: "Live Probiotics", benefit: "Gut-friendly cultures that survive the journey to your microbiome. Supports immunity, digestion, and mood — because what you drink shapes your whole body, not just your thirst." },
      { emoji: "🌿", name: "Organic Stevia Leaf", benefit: "300× sweeter than sugar with zero calories and zero glycaemic impact. Extracted from the whole leaf — not chemically isolated rebaudioside. Sweet the way nature intended." },
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
    glow: "rgba(249,115,22,0.45)", ring: "rgba(249,115,22,0.18)",
    bgFrom: "#150800", accentColor: "#f97316",
    keyIngredients: [
      { emoji: "🫒", name: "Extra-Virgin Cold-Pressed Olive Oil", benefit: "First cold press only — full polyphenols, antioxidants and oleocanthal intact. Conventional snack oils are refined, bleached and deodorised until nothing beneficial remains." },
      { emoji: "🧂", name: "Himalayan Pink Salt", benefit: "Hand-harvested from ancient sea beds 500 million years old. Contains 84 naturally occurring trace minerals. Not chemically processed like standard table salt." },
      { emoji: "🌿", name: "Rosemary Extract", benefit: "A potent natural antioxidant that keeps snacks fresh without synthetic preservatives. Replaces BHA and BHT — two petrochemical preservatives banned in several countries." },
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
    glow: "rgba(52,211,153,0.55)", ring: "rgba(52,211,153,0.20)",
    bgFrom: "#001810", accentColor: "#34d399",
    keyIngredients: [
      { emoji: "📋", name: "≤5 Ingredients", benefit: "The golden rule of clean eating: if you can't pronounce it, your body probably can't process it. Every Holy Pick product has a label you can read in seconds — whole foods only." },
      { emoji: "🚫", name: "Zero Artificial Additives", benefit: "No E-numbers from the danger list, no synthetic colours, no artificial preservatives. Every ingredient on the label is either a whole food or a recognised safe natural extract." },
      { emoji: "🌍", name: "Minimal Processing", benefit: "Cold-pressed, stone-ground, or simply mixed — never extruded, never chemically modified. The closer to nature the process, the more nutrients reach your cells intact." },
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
    glow: "rgba(45,212,191,0.45)", ring: "rgba(45,212,191,0.18)",
    bgFrom: "#001818", accentColor: "#2dd4bf",
    keyIngredients: [
      { emoji: "🔬", name: "Nano-Hydroxyapatite", benefit: "The exact mineral your teeth are made of — remineralises enamel at the nano scale. Clinically proven fluoride alternative used in Japanese dentistry since the 1980s." },
      { emoji: "🌿", name: "Birch Xylitol", benefit: "Starves cavity-causing bacteria without harming your gut microbiome. Zero glycaemic impact, derived from sustainably harvested birch trees." },
      { emoji: "🌱", name: "Chicle Gum Base", benefit: "Ancient natural resin from the Sapodilla tree. No synthetic polymers, no petrochemicals — just the way gum was chewed for thousands of years." },
    ],
    products: [
      { name: "HolyGum Classic", flavor: "Pure Peppermint", price: "€3.99", emoji: "🌿", badge: "Bestseller", desc: "12-piece pack. Xylitol + Nano-Hydroxyapatite — remineralises your enamel with every chew. Zero aspartame, zero sugar, zero compromise.", gradient: "from-teal-500 to-cyan-400" },
      { name: "HolyGum Spearmint", flavor: "Cool Spearmint", price: "€3.99", emoji: "🫧", desc: "Gentle spearmint coolness. Birch xylitol sweetened, naturally fresh. Enamel-safe, pH-neutral, dentist-approved.", gradient: "from-cyan-400 to-sky-400" },
      { name: "HolyGum Charcoal", flavor: "Activated Charcoal & Mint", price: "€4.49", emoji: "🖤", badge: "New", desc: "Activated charcoal + Nano-Hydroxyapatite for surface whitening support. The cleanest chew on the planet.", gradient: "from-slate-700 via-slate-600 to-teal-500" },
      { name: "HolyGum Berry Fresh", flavor: "Wild Berry & Mint", price: "€4.49", emoji: "🫐", badge: "Coming Soon", desc: "Wild berry freshness meets dental science. The guilt-free gum that actually protects your teeth while you enjoy it.", gradient: "from-purple-600 to-teal-400" },
    ],
  },
];

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getProductBySlug(slug: string): { product: (typeof CATEGORIES[0]["products"][0]); category: Category } | null {
  for (const cat of CATEGORIES) {
    for (const product of cat.products) {
      if (slugify(product.name) === slug) return { product, category: cat };
    }
  }
  return null;
}

export const DETAIL_INGREDIENTS: Record<string, string> = {
  gummies:   "Organic Fruit Juice Concentrate, Coconut Sugar, Apple Pectin, Tapioca Starch, Natural Agar (texture stabiliser), Citric Acid (from lemons), Natural Colors (Beet Juice Powder, Turmeric, Spirulina Extract), Sunflower Wax (natural glaze)",
  chocolate: "Organic Cacao Mass (72%), Coconut Sugar, Organic Cacao Butter, Bourbon Vanilla Pod Extract, Himalayan Pink Salt",
  drinks:    "Purified Spring Water, Natural Electrolytes (Calcium Chloride, Magnesium Chloride, Potassium Chloride), Citric Acid, Natural Fruit Flavor, Organic Stevia Leaf Extract",
  snacks:    "Organic Potatoes, Extra-Virgin Cold-Pressed Olive Oil, Himalayan Pink Salt, Rosemary Extract (natural preservative)",
  gums:      "Xylitol (from Birch Wood), Gum Base (Chicle Natural Resin, Candelilla Wax), Nano-Hydroxyapatite, Calcium Carbonate, Natural Peppermint Oil, Sunflower Lecithin, Carnauba Wax (natural glaze), Spearmint Extract",
};

export const DETAIL_CERTS = ["🌱 Vegan", "🌿 Non-GMO", "🚫 No Artificial Colors", "🔬 No Synthetic Preservatives", "🌾 Gluten-Free"];

export const TESTIMONIALS = [
  { name: "Emma R.",    location: "Amsterdam, NL", rating: 5, productName: "KubiX Classic",  catIcon: "🍬", text: "Finally found gummies my kids actually beg for — and I'm happy to give them. No corn syrup, no artificial dyes. Just strawberry. We go through a bag a week." },
  { name: "Lukas M.",   location: "Berlin, DE",    rating: 5, productName: "Holy Dark 72%",  catIcon: "🍫", text: "I've been hunting for clean dark chocolate for years. No waxy aftertaste, no weird sweeteners. Just pure cacao. Ordered six bars already." },
  { name: "Sofija K.",  location: "Vilnius, LT",   rating: 5, productName: "Holy Hydrate",   catIcon: "💧", text: "Nebegaliu gerti įprastų izotonikų po to, kaip radau Holy Hydrate. Tinka po treniruočių, nėra to saldaus sirupo pojūčio. Rekomenduoju visiems." },
  { name: "James T.",   location: "London, UK",    rating: 5, productName: "Holy Chips",      catIcon: "🥔", text: "Baked, not fried, genuinely crispy, and the ingredient list is four words long. I was deeply sceptical. I'm now a subscriber." },
  { name: "Marta W.",   location: "Warsaw, PL",    rating: 5, productName: "Golden Elixir",  catIcon: "✨", text: "The turmeric drink is my morning ritual now. Anti-inflammatory, beautifully warming, and the colour alone makes me happy every single day." },
  { name: "Andrius P.", location: "Kaunas, LT",    rating: 5, productName: "Berry Bliss",    catIcon: "🫐", text: "Pirkau kaip dovaną mamai. Ji dabar užsako pati ir rekomenduoja draugėms. Tai geriausia rekomendacija, kurią galiu duoti." },
];
