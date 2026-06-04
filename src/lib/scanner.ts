import type { BadIngredient } from "./badIngredients";
import { BAD_INGREDIENTS } from "./badIngredients";

export type ScanResult = { ingredient: BadIngredient; matched: string };

// ─── BONUS INGREDIENTS DATABASE (scanner — awards bonus purity points) ────────

export type BonusIngredient = {
  name: string;
  emoji: string;
  bonus: number;        // points ADDED to purity score
  aliases: string[];    // terms to match in ingredient lists
  whyGood: string;
};

export type GoodResult = { ingredient: BonusIngredient; matched: string };

export type FetchedProduct = { productName: string; brand: string; ingredients: string; nutriscore: string | null; image: string | null };
export type ScanHistoryItem = { query: string; productName: string; score: number; timestamp: number };

export const BONUS_INGREDIENTS: BonusIngredient[] = [
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

export const KNOWN_BRANDS: Record<string, Omit<FetchedProduct, "nutriscore"|"image"> & { nutriscore?: string }> = {
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

export type LTProduct = {
  name: string;
  nameLt: string;
  category: string;
  categoryLt: string;
  emoji: string;
  ingredients: string; // English — fed into scanText()
};

export type LTBrand = {
  display: string;
  country: string; // flag emoji
  emoji: string;
  tagline: string;
  aliases: string[]; // diacritic-free lowercase search terms
  products: LTProduct[];
};

/** Strip Lithuanian diacritics for search normalization */
export function normalizeForSearch(s: string): string {
  return s.toLowerCase()
    .replace(/ą/g, "a").replace(/č/g, "c").replace(/ę/g, "e").replace(/ė/g, "e")
    .replace(/į/g, "i").replace(/š/g, "s").replace(/ų/g, "u").replace(/ū/g, "u")
    .replace(/ž/g, "z").trim();
}

export const LT_BRANDS: LTBrand[] = [
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
export function searchLTBrand(q: string): LTBrand | null {
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
export function looksLikeProductName(text: string) {
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
export function scanText(text: string): { bad: ScanResult[]; good: GoodResult[] } {
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
export function badPts(r: ScanResult): number {
  return r.ingredient.points
    ?? (r.ingredient.danger === "high" ? 200 : r.ingredient.danger === "medium" ? 110 : 50);
}

/** Purity score — unclamped. Baseline 500, bad subtracts (with per-ingredient weights), good adds.
 *  Can go negative (very toxic) or above 1000 (exceptionally clean). */
export function computeScore(bad: ScanResult[], good: GoodResult[]) {
  let score = 500;
  for (const r of bad)  score -= badPts(r);
  for (const r of good) score += r.ingredient.bonus;
  return score;
}

/** Eight-tier grade — unclamped score range (can be negative or above 1000) */
export function getGrade(score: number): { label: string; labelLt: string; emoji: string; color: string } {
  if (score >= 1200) return { label: "Legendary", labelLt: "Legendinis", emoji: "⭐", color: "#e879f9" };
  if (score >= 900)  return { label: "Divine",    labelLt: "Dieviška",   emoji: "👑", color: "#f0c855" };
  if (score >= 750)  return { label: "Holy",      labelLt: "Šventa",     emoji: "✦",  color: "#22c55e" };
  if (score >= 550)  return { label: "Decent",    labelLt: "Neblogai",   emoji: "🌿", color: "#84cc16" };
  if (score >= 350)  return { label: "Neutral",   labelLt: "Neutralu",   emoji: "⚠️", color: "#f97316" };
  if (score >= 150)  return { label: "Poor",      labelLt: "Blogai",     emoji: "❌", color: "#ef4444" };
  if (score >= 0)    return { label: "Toxic",     labelLt: "Toksiška",   emoji: "☠️", color: "#7f1d1d" };
  return               { label: "Lethal",     labelLt: "Mirtina",    emoji: "☣️", color: "#3b0000" };
}
