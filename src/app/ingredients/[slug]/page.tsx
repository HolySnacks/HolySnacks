import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { INGREDIENTS, getIngredientBySlug } from "@/lib/ingredients";

export async function generateStaticParams() {
  return INGREDIENTS.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ingredient = getIngredientBySlug(slug);
  if (!ingredient) return {};
  const verb = ingredient.type === "bad" ? "Why to Avoid" : "Why It's Clean";
  return {
    title: `${ingredient.name} — ${verb}`,
    description: `${ingredient.summary} | HolySnacks Ingredient Guide`,
    keywords: [ingredient.name, ingredient.alsoKnownAs ?? "", ingredient.category, "food ingredients", "ingredient guide"].filter(Boolean),
    openGraph: {
      title: `${ingredient.emoji} ${ingredient.name} | HolySnacks`,
      description: ingredient.summary,
      type: "article",
    },
  };
}

const dangerColors = { high: "#ef4444", medium: "#f97316", low: "#eab308" };
const dangerLabels = { high: "High Concern", medium: "Medium Concern", low: "Low Concern" };

export default async function IngredientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ingredient = getIngredientBySlug(slug);
  if (!ingredient) notFound();

  const isBad = ingredient.type === "bad";
  const borderColor = isBad
    ? (dangerColors[ingredient.danger ?? "medium"])
    : "#22c55e";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${ingredient.name} — ${isBad ? "Why to Avoid" : "Why It's Clean"}`,
    description: ingredient.summary,
    publisher: { "@type": "Organization", name: "HolySnacks", url: "https://holysnacks.com" },
    about: { "@type": "Thing", name: ingredient.name },
  };

  const otherIngredients = INGREDIENTS.filter(
    (i) => i.type === ingredient.type && i.slug !== slug
  ).slice(0, 6);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#0b1220] text-[#f5f0eb]">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-[#f5f0eb]/40 mb-8 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-[#f0c855] transition-colors">HolySnacks</Link>
            <span>/</span>
            <Link href="/ingredients" className="hover:text-[#f0c855] transition-colors">Ingredients</Link>
            <span>/</span>
            <span className="text-[#f5f0eb]/70">{ingredient.name}</span>
          </nav>

          {/* Hero */}
          <div
            className="rounded-3xl p-6 mb-8 border-2"
            style={{
              borderColor,
              background: `${borderColor}10`,
            }}
          >
            <div className="flex items-start gap-4">
              <span className="text-5xl">{ingredient.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-2xl font-bold">{ingredient.name}</h1>
                  {isBad && ingredient.danger && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold border"
                      style={{ borderColor, color: borderColor, background: `${borderColor}15` }}
                    >
                      {dangerLabels[ingredient.danger]}
                    </span>
                  )}
                  {!isBad && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold border border-green-500/50 text-green-400 bg-green-500/10">
                      ✓ Clean Ingredient
                    </span>
                  )}
                </div>
                <p className="text-[#f5f0eb]/60 text-sm">{ingredient.category}</p>
                {ingredient.eNumber && (
                  <p className="text-[#f5f0eb]/40 text-xs mt-1">E-Number: {ingredient.eNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="text-lg text-[#f5f0eb]/80 leading-relaxed mb-8">{ingredient.summary}</p>

          {/* Also Known As */}
          {ingredient.alsoKnownAs && (
            <div className="mb-8 p-4 bg-white/5 rounded-xl">
              <h2 className="text-sm font-semibold text-[#f5f0eb]/50 mb-2 uppercase tracking-wide">Also known as</h2>
              <p className="text-sm text-[#f5f0eb]/70">{ingredient.alsoKnownAs}</p>
            </div>
          )}

          {/* Full explanation */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3" style={{ color: isBad ? "#ef4444" : "#22c55e" }}>
              {isBad ? "Why We Flag It" : "Why It's Beneficial"}
            </h2>
            <p className="text-[#f5f0eb]/80 leading-relaxed">{ingredient.why}</p>
          </section>

          {/* Science fact */}
          {ingredient.scienceFact && (
            <div className="mb-8 p-4 rounded-xl border border-[#f0c855]/20 bg-[#f0c855]/5">
              <h3 className="text-sm font-bold text-[#f0c855] mb-2">📊 Science Fact</h3>
              <p className="text-sm text-[#f5f0eb]/70 leading-relaxed">{ingredient.scienceFact}</p>
            </div>
          )}

          {/* Found in / Replaced by */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {ingredient.foundIn && (
              <div className="p-4 bg-white/5 rounded-xl">
                <h3 className="text-sm font-semibold text-[#f5f0eb]/50 mb-2 uppercase tracking-wide">
                  {isBad ? "🚫 Commonly found in" : "✅ Found in"}
                </h3>
                <p className="text-sm text-[#f5f0eb]/70 leading-relaxed">{ingredient.foundIn}</p>
              </div>
            )}
            {ingredient.replacedBy && (
              <div className="p-4 bg-white/5 rounded-xl">
                <h3 className="text-sm font-semibold text-[#f5f0eb]/50 mb-2 uppercase tracking-wide">
                  {isBad ? "✅ HolySnacks uses instead" : "Replaces"}
                </h3>
                <p className="text-sm text-[#f5f0eb]/70 leading-relaxed">{ingredient.replacedBy}</p>
              </div>
            )}
          </div>

          {/* Related ingredients */}
          {otherIngredients.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 text-[#f0c855]">
                More {isBad ? "Ingredients to Watch" : "Clean Ingredients"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {otherIngredients.map((i) => (
                  <Link
                    key={i.slug}
                    href={`/ingredients/${i.slug}`}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="text-xl mb-1">{i.emoji}</div>
                    <div className="text-sm font-medium leading-tight">{i.name}</div>
                    <div className="text-xs text-[#f5f0eb]/40 mt-1">{i.category}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 py-3 px-6 rounded-full border border-white/20 text-center hover:border-white/40 transition-colors"
            >
              ← Back to HolySnacks
            </Link>
            <Link
              href="/#scanner"
              className="flex-1 py-3 px-6 rounded-full bg-[#f0c855] text-[#0b1220] font-bold text-center hover:bg-[#f0c855]/90 transition-colors"
            >
              Scan Your Food →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
