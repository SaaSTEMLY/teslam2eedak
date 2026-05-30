import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/menu`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blogs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/api/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/to-humans.md`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const payload = await getPayload({ config });

    // Menu items live in the `products` collection (per ADR-0003) but
    // we expose them only via /menu — no individual /menu/[slug] page
    // in MVP. So the dynamic-route sweep only covers blogs.
    const blogs = await payload.find({
      collection: "blogs",
      where: { status: { equals: "published" } },
      limit: 1000,
      select: { slug: true, updatedAt: true },
    });

    const blogRoutes: MetadataRoute.Sitemap = blogs.docs
      .filter((doc) => doc.slug)
      .map((doc) => ({
        url: `${SITE_URL}/blogs/${doc.slug}`,
        lastModified: new Date(doc.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));

    dynamicRoutes = blogRoutes;
  } catch {
    // Database may not be available during build
  }

  return [...staticRoutes, ...dynamicRoutes];
}
