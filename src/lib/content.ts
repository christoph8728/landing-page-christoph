import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { getConfig } from "./config";

const contentDir = path.join(process.cwd(), "content");

export type ContentMeta = {
  slug: string;
  title: string;
  date: string;
  draft?: boolean;
  tags?: string[];
  reading_time?: number;
  summary?: string;
  og_image?: string;
  [key: string]: unknown;
};

export type ContentItem = ContentMeta & {
  content: string; // rendered HTML
};

/**
 * Estimate reading time in minutes.
 */
function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

/**
 * Add target="_blank" and rel="noopener noreferrer" to external links in HTML.
 */
function processExternalLinks(htmlContent: string): string {
  return htmlContent.replace(
    /<a\s+href="(https?:\/\/[^"]+)"([^>]*)>/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"$2>'
  );
}

/**
 * Generate a summary from markdown content.
 * Truncates to ~160 characters at word boundary.
 */
function generateSummary(content: string): string {
  // Remove markdown formatting
  const plainText = content
    .replace(/^---[\s\S]*?---/, "") // Remove frontmatter if any
    .replace(/#{1,6}\s+/g, "") // Remove headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links
    .replace(/`(.+?)`/g, "$1") // Remove inline code
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .trim();

  // Truncate to ~160 chars at word boundary
  if (plainText.length <= 160) return plainText;

  const truncated = plainText.slice(0, 160);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0 ? truncated.slice(0, lastSpace) + "..." : truncated + "...";
}

/**
 * Check if a content item should be visible.
 * Respects draft and scheduled_posts config flags.
 */
function isVisible(data: Record<string, unknown>): boolean {
  const config = getConfig();

  // Filter drafts
  if (config.features.drafts && data.draft === true) {
    return false;
  }

  // Filter future-dated posts
  if (config.features.scheduled_posts && data.date) {
    const postDate = new Date(data.date as string);
    const now = new Date();
    // Compare date-only (ignore time) for day-level scheduling
    postDate.setHours(0, 0, 0, 0);
    now.setHours(23, 59, 59, 999);
    if (postDate > now) {
      return false;
    }
  }

  return true;
}

/**
 * Get all visible items from a content directory.
 * Returns metadata only (no rendered content), sorted by date descending.
 */
export function getAllContent(subdir: string): ContentMeta[] {
  const dir = path.join(contentDir, subdir);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  const items: ContentMeta[] = [];

  for (const filename of files) {
    const slug = filename.replace(/\.md$/, "");
    const filePath = path.join(dir, filename);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content: rawContent } = matter(raw);

    if (!isVisible(data)) continue;

    const meta: ContentMeta = {
      slug,
      title: (data.title as string) || slug,
      date: (data.date as string) || "",
      ...data,
    };

    if (getConfig().features.reading_time && rawContent.trim().length > 0) {
      meta.reading_time = estimateReadingTime(rawContent);
    }

    // Generate summary from frontmatter or content
    if (data.summary) {
      meta.summary = data.summary as string;
    } else if (rawContent.trim().length > 0) {
      meta.summary = generateSummary(rawContent);
    }

    items.push(meta);
  }

  return items.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get a single content item by slug, with rendered HTML body.
 */
export async function getContentBySlug(
  subdir: string,
  slug: string
): Promise<ContentItem | null> {
  const filePath = path.join(contentDir, subdir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content: rawContent } = matter(raw);

  if (!isVisible(data)) return null;

  const processed = await remark().use(html).process(rawContent);
  const htmlContent = processExternalLinks(processed.toString());

  const item: ContentItem = {
    slug,
    title: (data.title as string) || slug,
    date: (data.date as string) || "",
    content: htmlContent,
    reading_time: estimateReadingTime(rawContent),
    ...data,
  };

  // Generate summary from frontmatter or content
  if (data.summary) {
    item.summary = data.summary as string;
  } else if (rawContent.trim().length > 0) {
    item.summary = generateSummary(rawContent);
  }

  return item;
}

/**
 * Get all slugs for static params generation.
 * Only used when rendering.blog_mode is "static".
 */
export function getAllSlugs(subdir: string): string[] {
  const dir = path.join(contentDir, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

