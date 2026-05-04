import type { MetadataRoute } from "next";
import { getConfig } from "@/lib/config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const config = getConfig();
  const baseUrl = config.site.url;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
