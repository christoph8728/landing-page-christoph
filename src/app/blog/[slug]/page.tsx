import { getConfig } from "@/lib/config";
import { getContentBySlug, getAllSlugs } from "@/lib/content";
import { bp } from "@/lib/path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ImageLightbox from "@/components/ImageLightbox";
import ReadingProgress from "@/components/ReadingProgress";

export async function generateStaticParams() {
  return getAllSlugs("blog").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const config = getConfig();
  const { slug } = await params;
  const post = await getContentBySlug("blog", slug);
  if (!post) return { title: "Not Found" };

  const description = post.summary || post.excerpt
    ? (post.summary as string || post.excerpt as string)
    : `${post.title} — ${config.site.short_name}`;

  // Custom OG image override (frontmatter); otherwise the colocated
  // opengraph-image.tsx is auto-detected by Next.js at build time.
  const customOg = post.og_image as string | undefined;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${slug}/` },
    openGraph: config.features.open_graph
      ? {
          title: post.title,
          description,
          type: "article",
          publishedTime: post.date,
          tags: post.tags as string[],
          ...(customOg
            ? { images: [{ url: customOg, width: 1200, height: 630, alt: post.title }] }
            : {}),
        }
      : undefined,
    twitter: config.features.open_graph
      ? {
          card: "summary_large_image",
          title: post.title,
          description,
          ...(customOg ? { images: [customOg] } : {}),
        }
      : undefined,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const config = getConfig();
  const { slug } = await params;
  const post = await getContentBySlug("blog", slug);

  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate JSON-LD structured data. The colocated opengraph-image.tsx
  // emits a static PNG at /blog/<slug>/opengraph-image.png at build time;
  // a frontmatter `og_image` overrides that.
  const ogImage = (post.og_image as string | undefined)
    ?? bp(`/blog/${post.slug}/opengraph-image.png`);
  const description =
    (post.summary as string) ||
    (post.excerpt as string) ||
    `${post.title} — ${config.site.short_name}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: config.author.name,
      url: config.site.url,
    },
    description: description,
    url: `${config.site.url}/blog/${post.slug}`,
    image: `${config.site.url}${ogImage}`,
  };

  return (
    <>
      <ReadingProgress />
      <main className="s blog-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="post">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <time dateTime={post.date}>{formattedDate}</time>
            {config.features.reading_time && post.reading_time && (
              <span> · {post.reading_time} min read</span>
            )}
          </div>
        </header>
        <ImageLightbox>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </ImageLightbox>
        <footer className="post-footer">
          <a href={bp("/blog")} className="blog-more">
            ← All posts
          </a>
        </footer>
      </article>
    </main>
    </>
  );
}
