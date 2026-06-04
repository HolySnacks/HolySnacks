export const T = {
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
        { icon: "🌿", title: "100% Natural",    desc: "Every ingredient is traceable, natural, and honest." },
        { icon: "✦",  title: "Premium Quality", desc: "We don't cut corners. Ever." },
        { icon: "🚫", title: "No Junk",          desc: "No artificial colors, flavors, or preservatives." },
        { icon: "♻️", title: "Sustainable",      desc: "Eco-conscious packaging and responsible sourcing." },
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
        { icon: "🌿", title: "100% Natūralu",  desc: "Kiekvienas ingredientas yra atsekamas ir sąžiningas." },
        { icon: "✦",  title: "Premium kokybė", desc: "Mes niekada nekerpame kampų." },
        { icon: "🚫", title: "Be šlamšto",      desc: "Jokių dirbtinių dažų, aromatų ar konservantų." },
        { icon: "♻️", title: "Tvaru",            desc: "Ekologiška pakuotė ir atsakingas tiekimas." },
      ],
    },
    newsletter: { title: "Prisijunk prie išrinktųjų.", sub: "Nauji skoniai. Išskirtiniai leidimai. Ankstyva prieiga.", placeholder: "tavo@el.pastas.lt", cta: "✦ Prisijungti" },
    footer: { tagline: "Snack Holy. Live Wholly.", copy: "© 2025 HolySnacks. Visos teisės saugomos.", links: ["Produktai", "Apie mus", "Kontaktai", "Privatumo politika"] },
  },
} as const;

export type Lang = keyof typeof T;
