import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, DETAIL_INGREDIENTS, DETAIL_CERTS, slugify, getProductBySlug } from "@/lib/products";

export async function generateStaticParams() {
  return CATEGORIES.flatMap((cat) =>
    cat.products.map((p) => ({ slug: slugify(p.name) }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const match = getProductBySlug(slug);
  if (!match) return {};
  const { product, category } = match;
  return {
    title: `${product.name} — ${product.flavor}`,
    description: `${product.desc} ${category.keyIngredients?.map((k) => k.name).join(", ") ?? ""} | HolySnacks`,
    openGraph: {
      title: `${product.emoji} ${product.name} | HolySnacks`,
      description: product.desc,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const match = getProductBySlug(slug);
  if (!match) notFound();

  const { product, category } = match;
  const ingredients = DETAIL_INGREDIENTS[category.id] ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.desc,
    offers: {
      "@type": "Offer",
      price: product.price.replace("€", ""),
      priceCurrency: "EUR",
      availability: product.badge === "Coming Soon"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock",
    },
    brand: { "@type": "Brand", name: "HolySnacks" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#0b1220] text-[#f5f0eb]">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-[#f5f0eb]/40 mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-[#f0c855] transition-colors">HolySnacks</Link>
            <span>/</span>
            <Link href={`/#${category.id}`} className="hover:text-[#f0c855] transition-colors">{category.label}</Link>
            <span>/</span>
            <span className="text-[#f5f0eb]/70">{product.name}</span>
          </nav>

          {/* Hero */}
          <div className={`rounded-3xl bg-gradient-to-br ${product.gradient} p-1 mb-8`}>
            <div className="rounded-[22px] bg-[#0b1220]/80 p-8 flex items-center gap-6">
              <span className="text-7xl">{product.emoji}</span>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  {product.badge && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#f0c855]/20 text-[#f0c855] border border-[#f0c855]/30">
                      {product.badge}
                    </span>
                  )}
                </div>
                <p className="text-[#f5f0eb]/60">{product.flavor}</p>
                <p className="text-2xl font-bold text-[#f0c855] mt-2">{product.price}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-[#f5f0eb]/80 leading-relaxed mb-10">{product.desc}</p>

          {/* Key Ingredients */}
          {category.keyIngredients && category.keyIngredients.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 text-[#f0c855]">Key Ingredients</h2>
              <div className="space-y-4">
                {category.keyIngredients.map((ki) => (
                  <div key={ki.name} className="flex gap-4 p-4 rounded-xl bg-white/5">
                    <span className="text-2xl flex-shrink-0">{ki.emoji}</span>
                    <div>
                      <h3 className="font-semibold mb-1">{ki.name}</h3>
                      <p className="text-sm text-[#f5f0eb]/60 leading-relaxed">{ki.benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Full Ingredient List */}
          {ingredients && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-3 text-[#f0c855]">Full Ingredient List</h2>
              <p className="text-sm text-[#f5f0eb]/70 leading-relaxed p-4 bg-white/5 rounded-xl font-mono">
                {ingredients}
              </p>
            </section>
          )}

          {/* Certifications */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-[#f0c855]">Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {DETAIL_CERTS.map((cert) => (
                <span key={cert} className="px-3 py-1.5 rounded-full text-sm bg-white/5 border border-white/10">
                  {cert}
                </span>
              ))}
            </div>
          </section>

          {/* Other products in category */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-[#f0c855]">More {category.label}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {category.products
                .filter((p) => slugify(p.name) !== slug)
                .map((p) => (
                  <Link
                    key={p.name}
                    href={`/products/${slugify(p.name)}`}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center"
                  >
                    <div className="text-2xl mb-1">{p.emoji}</div>
                    <div className="text-sm font-medium leading-tight">{p.name}</div>
                    <div className="text-xs text-[#f0c855] mt-1">{p.price}</div>
                  </Link>
                ))}
            </div>
          </section>

          {/* Back + Scan CTA */}
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
              Scan This Product →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
