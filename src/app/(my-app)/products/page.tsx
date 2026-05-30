import type { Metadata } from "next";
import Link from "@/components/Link/customLink";
import { createServerApiClient } from "@/lib/api/client";
import { ProductFilters } from "@/components/products/product-filters";
import {
  ProductCard,
  type ProductCardData,
} from "@/components/products/product-card";
import { getLocale } from "@/lib/locale";
import { getMessages } from "@/lib/i18n";
import { baseMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages("products");

  return {
    title: m.metaTitle,
    description: m.metaDescription,
    alternates: {
      canonical: "/products",
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: m.metaTitle,
      description: m.metaDescription,
      url: "/products",
    },
  };
}

function getCategoryLabel(
  category: string | null | undefined,
  messages: { [key: string]: string },
): string {
  if (!category) return "";
  const key = `category${category.charAt(0).toUpperCase()}${category.slice(1)}`;
  return messages[key] || category;
}

interface ProductVariant {
  id: string | number;
  images?: unknown[] | null;
  priceInUSD?: number | null;
  priceInUSDEnabled?: boolean | null;
  inventory?: number | null;
}

interface Product {
  id: string | number;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  images?: unknown[] | null;
  category?: string | null;
  featured?: boolean | null;
  priceInUSD?: number | null;
  enableVariants?: boolean | null;
  _status?: string | null;
  _variants?: ProductVariant[];
  averageRating?: number;
}

const PRODUCT_CATEGORIES = [
  "software",
  "templates",
  "courses",
  "services",
  "other",
] as const;

type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc";

function getSortParam(sort: SortOption): string {
  switch (sort) {
    case "price_asc":
      return "priceInUSD";
    case "price_desc":
      return "-priceInUSD";
    case "name_asc":
      return "name";
    default:
      return "-createdAt";
  }
}

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const m = await getMessages("products");
  const params = await searchParams;
  const searchQuery = params.q?.trim() ?? "";
  const categoryFilter = params.category ?? "";
  const sortOption = (params.sort as SortOption) || "newest";

  let products: Product[] = [];
  const locale = await getLocale();

  try {
    const api = await createServerApiClient();

    // Build dynamic where clause
    const whereConditions: Record<string, unknown>[] = [
      { _status: { equals: "published" } },
    ];

    if (searchQuery) {
      whereConditions.push({
        or: [
          { name: { contains: searchQuery } },
          { description: { contains: searchQuery } },
        ],
      });
    }

    if (
      categoryFilter &&
      PRODUCT_CATEGORIES.includes(
        categoryFilter as (typeof PRODUCT_CATEGORIES)[number],
      )
    ) {
      whereConditions.push({ category: { equals: categoryFilter } });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any =
      whereConditions.length === 1
        ? whereConditions[0]
        : { and: whereConditions };

    const { data } = await api.GET("/api/products", {
      params: {
        query: {
          locale,
          where,
          sort: getSortParam(sortOption) as "-createdAt",
          limit: 50,
        },
      },
    });

    const productList = (data?.docs ?? []) as Product[];

    const variantProductIds = productList
      .filter((p) => p.enableVariants)
      .map((p) => p.id);

    if (variantProductIds.length > 0) {
      const { data: variantData } = await api.GET("/api/variants", {
        params: {
          query: {
            locale,
            where: {
              product: { in: variantProductIds },
              _status: { equals: "published" },
            },
            limit: 500,
            depth: 1,
          },
        },
      });

      const variantsByProduct = new Map<string | number, ProductVariant[]>();
      for (const v of (variantData?.docs ?? []) as Array<
        ProductVariant & {
          product?: string | number | { id?: string | number };
        }
      >) {
        const productId =
          typeof v.product === "number" || typeof v.product === "string"
            ? v.product
            : v.product?.id;
        if (!productId) continue;
        const list = variantsByProduct.get(productId) || [];
        list.push(v);
        variantsByProduct.set(productId, list);
      }

      for (const p of productList) {
        p._variants = variantsByProduct.get(p.id) || [];
      }
    }

    products = productList;
  } catch {
    // Products collection may not exist yet
  }

  const categories = PRODUCT_CATEGORIES.map((value) => ({
    value,
    label: getCategoryLabel(value, m),
  }));

  const hasActiveFilters = searchQuery || categoryFilter;

  return (
    <main id="main-content" className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tracking-tight text-foreground">
          {m.pageTitle}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{m.pageSubtitle}</p>

        <ProductFilters translations={m} categories={categories} />

        {products.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product as ProductCardData}
                locale={locale}
                translations={{
                  featured: m.featured,
                  selectOptions: m.selectOptions,
                  addToCart: m.addToCart,
                  added: m.added,
                  details: m.details,
                  free: m.free,
                  from: m.from,
                }}
                getCategoryLabel={(cat) => getCategoryLabel(cat, m)}
                showRating
              />
            ))}
          </div>
        ) : (
          <div className="mt-20 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {hasActiveFilters ? m.noResults : m.noProductsTitle}
            </h2>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? m.noResultsDescription
                : m.noProductsDescription}
            </p>
            <Link
              href={hasActiveFilters ? "/products" : "/"}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {hasActiveFilters ? m.clearFilters : m.backToHome}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
