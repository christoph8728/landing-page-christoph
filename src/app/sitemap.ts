import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/content";
import { getConfig } from "@/lib/config";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = getConfig();
  const baseUrl = config.site.url;

  // Get all published blog posts (already filtered for drafts and future dates)
  const posts = getAllContent("blog");

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      // Trailing slashes match next.config `trailingSlash: true` and the
      // per-page canonical URLs, so crawlers don't hit 308 redirects.
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/publications/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Blog posts
  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}/`,
    lastModified: new Date(post.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  // Speaking topic pages — mirror the route's generateStaticParams
  // (src/app/speaking/[slug]/page.tsx), which only renders topics with a slug.
  const speakingPages: MetadataRoute.Sitemap = config.content.speaking_topics
    .filter((t) => t.slug)
    .map((t) => ({
      url: `${baseUrl}/speaking/${t.slug}/`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    }));

  return [...staticPages, ...blogPosts, ...speakingPages];
}
