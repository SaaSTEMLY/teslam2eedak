import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link/customLink";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RichText } from "@/components/blog/rich-text";
import { Badge } from "@/components/ui/badge";
import { resolveMedia } from "@/lib/utils";
import { getLocale } from "@/lib/locale";
import { getMessages } from "@/lib/i18n";
import { baseMetadata } from "@/lib/seo";
import { createServerApiClient } from "@/lib/api/client";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(date: string | null | undefined, locale: string): string {
  if (!date) return "";
  // Map to specific locales that include proper number systems
  const localeMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    ar: "ar-SA", // Uses Arabic-Indic numerals (٠-٩)
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

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const m = await getMessages("blogs");
  const { slug } = await params;
  const locale = await getLocale();
  const api = await createServerApiClient();
  const { data } = await api.GET("/api/blogs", {
    params: {
      query: {
        locale,
        where: {
          slug: { equals: slug },
          status: { equals: "published" },
        },
        limit: 1,
      },
    },
  });

  const post = data?.docs?.[0];

  if (!post) {
    return {
      title: m.postNotFoundTitle,
    };
  }

  // Use SEO plugin fields if available, fallback to post fields
  const seo = (
    post as typeof post & {
      meta?: { title?: string; description?: string; image?: unknown };
    }
  ).meta;
  const seoTitle = seo?.title || `${post.title} | Koffee Kulture Blog`;
  const seoDescription = seo?.description || post.excerpt;
  const seoImage = resolveMedia(seo?.image) ?? resolveMedia(post.coverImage);

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      ...baseMetadata.openGraph,
      title: seoTitle,
      description: seoDescription,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      authors: [post.author],
      ...(seoImage ? { images: [{ url: seoImage.url }] } : {}),
    },
  };
}

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const api = await createServerApiClient();
    const { data } = await api.GET("/api/blogs", {
      params: {
        query: {
          where: {
            status: { equals: "published" },
          },
          limit: 100,
        },
      },
    });

    return (data?.docs ?? []).map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.warn("Failed to generate static params for blogs:", error);
    return [];
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const m = await getMessages("blogs");
  const { slug } = await params;
  const locale = await getLocale();
  const api = await createServerApiClient();
  const { data } = await api.GET("/api/blogs", {
    params: {
      query: {
        locale,
        where: {
          slug: { equals: slug },
          status: { equals: "published" },
        },
        limit: 1,
      },
    },
  });

  const post = data?.docs?.[0];

  if (!post) {
    notFound();
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

  const coverImg = resolveMedia(post.coverImage);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${baseUrl}/blogs/${post.slug}`,
    ...(coverImg ? { image: `${baseUrl}${coverImg.url}` } : {}),
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Koffee Kulture",
    },
    datePublished: post.publishedAt || undefined,
  };

  return (
    <main id="main-content" className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="size-4" />
          {m.backToBlog}
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            <span className="font-medium uppercase tracking-wider">
              {getCategoryLabel(post.category, m)}
            </span>
            {post.publishedAt && (
              <>
                <span className="text-border">/</span>
                <span>{formatDate(post.publishedAt, locale)}</span>
              </>
            )}
            <span className="text-border">/</span>
            <span>{post.author}</span>
          </div>

          <h1 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-foreground">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        {(() => {
          const img = resolveMedia(post.coverImage);
          if (!img) return null;
          return (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted mb-12">
              <Image
                src={img.url}
                alt={img.alt || post.title}
                fill
                className="object-cover"
              />
            </div>
          );
        })()}

        <article className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6 prose-li:text-muted-foreground prose-ul:my-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
          <RichText data={post.content} />
        </article>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-border/50">
            {post.tags.map((tagItem, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tagItem.tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-border/50 flex items-center justify-between">
          <Link
            href="/blogs"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {m.morePosts}
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {m.getInTouch}
          </Link>
        </div>
      </div>
    </main>
  );
}
