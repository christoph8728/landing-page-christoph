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
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Blog posts
  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticPages, ...blogPosts];
}
