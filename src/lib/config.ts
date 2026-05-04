import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export type SiteConfig = {
  site: {
    title: string;
    short_name: string;
    tagline: string;
    headline: string;
    description: string;
    url: string;
    language: string;
  };
  author: {
    name: string;
    email: string;
    location: string;
    photo: string | null;
    credentials: string;
    current_role: string;
    current_org: string;
    socials: Record<string, string | null>;
  };
  sections: {
    thesis: boolean;
    track_record: boolean;
    numbers: boolean;
    speaking_topics: boolean;
    engagements: boolean;
    publications: boolean;
    publications_preview_count?: number;
    blog_preview: boolean;
    blog_preview_count: number;
  };
  features: {
    blog: boolean;
    rss: boolean;
    scheduled_posts: boolean;
    drafts: boolean;
    reading_time: boolean;
    open_graph: boolean;
    sitemap: boolean;
  };
  rendering: {
    blog_mode: "dynamic" | "static" | "isr";
    revalidate_seconds: number;
    revalidate_cron: string;
  };
  analytics: {
    provider: "plausible" | "umami" | null;
    plausible?: { domain: string; script_url: string };
    umami?: { website_id: string; script_url: string };
  };
  design: Record<string, string>;
  content: {
    thesis?: string;
    thesis_quote?: string;
    thesis_supporting?: string;
    numbers: Array<{ value: string; label: string; context?: string }>;
    speaking_topics: Array<{
      title: string;
      slug?: string;
      format: string;
      audience?: string;
      description: string;
    }>;
    cta: { heading: string; heading_html?: string; description: string };
  };
  nav: Array<{ label: string; href: string; requires?: string }>;
};

let _config: SiteConfig | null = null;

export function getConfig(): SiteConfig {
  if (_config) return _config;

  const configPath = path.join(process.cwd(), "site.config.yaml");
  const raw = fs.readFileSync(configPath, "utf8");
  _config = yaml.load(raw) as SiteConfig;
  return _config;
}

/**
 * Resolve a dot-path like "sections.publications" against the config.
 * Returns the value at that path, or undefined.
 */
export function resolveConfigFlag(dotPath: string): unknown {
  const config = getConfig();
  const parts = dotPath.split(".");
  let current: unknown = config;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Get active nav items (filters by requires flag).
 */
export function getActiveNav(): Array<{ label: string; href: string }> {
  const config = getConfig();
  return config.nav.filter((item) => {
    if (!item.requires) return true;
    return resolveConfigFlag(item.requires) === true;
  });
}

/**
 * Generate CSS custom properties from design tokens.
 */
export function getDesignTokensCSS(): string {
  const { design } = getConfig();
  const vars = Object.entries(design)
    .map(([key, value]) => {
      const cssVar = key.replace(/_/g, "-");
      return `--${cssVar}: ${value};`;
    })
    .join("\n    ");
  return `:root {\n    ${vars}\n  }`;
}
