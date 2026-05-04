import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import matter from "gray-matter";

const root = process.cwd();
const config = yaml.load(fs.readFileSync(path.join(root, "site.config.yaml"), "utf8"));

if (!config.features?.rss) {
  console.log("[build-feeds] RSS disabled in config — skipping");
  process.exit(0);
}

const blogDir = path.join(root, "content", "blog");
const files = fs.existsSync(blogDir)
  ? fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"))
  : [];

const now = new Date();

const posts = files
  .map((f) => {
    const slug = f.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(blogDir, f), "utf8");
    const { data, content } = matter(raw);
    return { slug, data, content };
  })
  .filter(({ data }) => {
    if (config.features?.drafts && data.draft) return false;
    if (config.features?.scheduled_posts && new Date(data.date) > now) return false;
    return true;
  })
  .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
  .slice(0, 20);

const escapeXml = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const summaryFor = ({ data, content }) => {
  if (data.summary) return data.summary;
  return content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`~\[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
};

const baseUrl = config.site.url.replace(/\/$/, "");

const rssItems = posts
  .map((p) => {
    const link = `${baseUrl}/blog/${p.slug}/`;
    const tags = Array.isArray(p.data.tags)
      ? p.data.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join("\n")
      : "";
    return `    <item>
      <title>${escapeXml(p.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(p.data.date).toUTCString()}</pubDate>
      <description>${escapeXml(summaryFor(p))}</description>${tags ? "\n" + tags : ""}
    </item>`;
  })
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.site.title)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(config.site.description)}</description>
    <language>${config.site.language}</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>
`;

const atomEntries = posts
  .map((p) => {
    const link = `${baseUrl}/blog/${p.slug}/`;
    const tags = Array.isArray(p.data.tags)
      ? p.data.tags.map((t) => `    <category term="${escapeXml(t)}" />`).join("\n")
      : "";
    return `  <entry>
    <title>${escapeXml(p.data.title)}</title>
    <link href="${link}" />
    <id>${link}</id>
    <published>${new Date(p.data.date).toISOString()}</published>
    <updated>${new Date(p.data.date).toISOString()}</updated>
    <summary>${escapeXml(summaryFor(p))}</summary>
    <author>
      <name>${escapeXml(config.author.name)}</name>
      <uri>${baseUrl}</uri>
    </author>${tags ? "\n" + tags : ""}
  </entry>`;
  })
  .join("\n");

const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(config.site.title)}</title>
  <link href="${baseUrl}" />
  <link href="${baseUrl}/atom.xml" rel="self" />
  <id>${baseUrl}</id>
  <updated>${now.toISOString()}</updated>
  <subtitle>${escapeXml(config.site.description)}</subtitle>
  <author>
    <name>${escapeXml(config.author.name)}</name>
    <uri>${baseUrl}</uri>
  </author>
${atomEntries}
</feed>
`;

const outDir = path.join(root, "public");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "feed.xml"), rss);
fs.writeFileSync(path.join(outDir, "atom.xml"), atom);

console.log(`[build-feeds] Wrote public/feed.xml + public/atom.xml (${posts.length} posts)`);
