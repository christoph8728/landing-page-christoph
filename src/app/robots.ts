import type { MetadataRoute } from "next";
import { getConfig, isComingSoon } from "@/lib/config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const config = getConfig();
  const baseUrl = config.site.url;

  // While sealed behind the Coming Soon page, ask crawlers to stay out entirely.
  if (isComingSoon()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
