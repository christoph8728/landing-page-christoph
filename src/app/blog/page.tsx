import { getConfig } from "@/lib/config";
import { getAllContent } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
};

export default function BlogIndex() {
  const config = getConfig();
  const posts = getAllContent("blog");

  if (posts.length === 0) {
    return (
      <main className="s blog-page">
        <h1 className="blog-page-title">Writing</h1>
        <p className="blog-empty">Nothing here yet.</p>
      </main>
    );
  }

  // Group posts by year
  const byYear: Record<string, typeof posts> = {};
  for (const post of posts) {
    const year = new Date(post.date).getFullYear().toString();
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(post);
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <main className="s blog-page">
      <h1 className="blog-page-title">Writing</h1>

      {years.map((year) => (
        <div key={year} className="blog-year-group">
          <div className="blog-year-label">{year}</div>
          <div className="blog-list">
            {byYear[year].map((post) => (
              <a
                href={`/blog/${post.slug}`}
                className="blog-entry"
                key={post.slug}
              >
                <div>
                  <span className="blog-title">{post.title}</span>
                  {post.summary && (
                    <p className="blog-excerpt">{post.summary as string}</p>
                  )}
                </div>
                <span className="blog-date">
                  {new Date(post.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                  {config.features.reading_time && post.reading_time && (
                    <> · {post.reading_time} min</>
                  )}
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
