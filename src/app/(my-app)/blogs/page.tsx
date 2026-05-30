import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link/customLink";
import { resolveMedia } from "@/lib/utils";
import { getLocale } from "@/lib/locale";
import { getMessages } from "@/lib/i18n";
import { baseMetadata } from "@/lib/seo";
import { BlogFilters } from "@/components/blogs/blog-filters";
import { createServerApiClient } from "@/lib/api/client";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages("blogs");

  return {
    title: m.metaTitle,
    description: m.metaDescription,
    alternates: {
      canonical: "/blogs",
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: m.metaTitle,
      description: m.metaDescription,
      url: "/blogs",
    },
  };
}

function formatDate(date: string | null | undefined, locale: string): string {
  if (!date) return "";
  const localeMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    ar: "ar-SA",
  };
  return new Date(date).toLocaleDateString(localeMap[locale] || locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getCategoryLabel(
  category: string,
  messages: { [key: string]: string },
): string {
  const key = `category${category.charAt(0).toUpperCase()}${category.slice(1)}`;
  return messages[key] || category;
}

const BLOG_CATEGORIES = [
  "engineering",
  "product",
  "company",
  "tutorial",
  "announcement",
] as const;

type SortOption = "newest" | "oldest" | "title_asc";

function getSortParam(sort: SortOption): string {
  switch (sort) {
    case "oldest":
      return "publishedAt";
    case "title_asc":
      return "title";
    default:
      return "-publishedAt";
  }
}

interface BlogsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const m = await getMessages("blogs");
  const locale = await getLocale();
  const params = await searchParams;
  const searchQuery = params.q?.trim() ?? "";
  const categoryFilter = params.category ?? "";
  const sortOption = (params.sort as SortOption) || "newest";

  // Build dynamic where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereConditions: Record<string, any>[] = [
    { status: { equals: "published" } },
  ];

  if (searchQuery) {
    whereConditions.push({
      or: [
        { title: { contains: searchQuery } },
        { excerpt: { contains: searchQuery } },
      ],
    });
  }

  if (
    categoryFilter &&
    BLOG_CATEGORIES.includes(categoryFilter as (typeof BLOG_CATEGORIES)[number])
  ) {
    whereConditions.push({ category: { equals: categoryFilter } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any =
    whereConditions.length === 1
      ? whereConditions[0]
      : { and: whereConditions };

  const api = await createServerApiClient();
  const { data } = await api.GET("/api/blogs", {
    params: {
      query: {
        locale,
        where,
        sort: getSortParam(sortOption) as "-createdAt",
        limit: 50,
      },
    },
  });

  const posts = data?.docs ?? [];

  const categories = BLOG_CATEGORIES.map((value) => ({
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

        <BlogFilters translations={m} categories={categories} />

        {posts.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-12 sm:mt-14 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {posts.map((post) => (
              <article key={post.id} className="group">
                {(() => {
                  const img = resolveMedia(post.coverImage);
                  if (!img) return null;
                  return (
                    <Link
                      href={`/blogs/${post.slug}`}
                      className="relative block aspect-video w-full overflow-hidden rounded-xl bg-muted mb-4"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                  );
                })()}

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="font-medium uppercase tracking-wider">
                    {getCategoryLabel(post.category, m)}
                  </span>
                  {post.publishedAt && (
                    <>
                      <span className="text-border">/</span>
                      <span>{formatDate(post.publishedAt, locale)}</span>
                    </>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-foreground group-hover:text-muted-foreground transition-colors">
                  <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-20 text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {hasActiveFilters ? m.noResults : m.noPostsTitle}
            </h2>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters ? m.noResultsDescription : m.noPostsDescription}
            </p>
            <Link
              href={hasActiveFilters ? "/blogs" : "/"}
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
