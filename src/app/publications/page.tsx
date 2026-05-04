import { getAllContent } from "@/lib/content";
import { bp } from "@/lib/path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publications",
};

export default function PublicationsIndex() {
  const publications = getAllContent("publications");

  if (publications.length === 0) {
    return (
      <main className="s blog-page">
        <h1 className="blog-page-title">Publications</h1>
        <p className="blog-empty">Nothing here yet.</p>
      </main>
    );
  }

  const byYear: Record<string, typeof publications> = {};
  for (const pub of publications) {
    const y = String(pub.year ?? new Date(pub.date).getFullYear());
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(pub);
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <main className="s blog-page">
      <h1 className="blog-page-title">Publications</h1>
      <p className="blog-page-intro">
        Peer-reviewed work from a decade at TUM — engineering design,
        complexity in technical systems, product-service systems.
      </p>

      {years.map((year) => (
        <div key={year} className="blog-year-group">
          <div className="blog-year-label">{year}</div>
          <div className="pub-list">
            {byYear[year].map((pub) => (
              <div className="pub" key={pub.slug}>
                <div className="pub-yr">{pub.year as number}</div>
                <div>
                  <div className="pub-title">
                    {pub.doi ? (
                      <a href={`https://doi.org/${pub.doi}`}>{pub.title}</a>
                    ) : pub.url ? (
                      <a href={pub.url as string}>{pub.title}</a>
                    ) : (
                      pub.title
                    )}
                  </div>
                  <div className="pub-meta">
                    {(pub.authors as string[])?.join(", ")} ·{" "}
                    <span className="venue">{pub.venue as string}</span>,{" "}
                    {pub.year as number}.
                  </div>
                </div>
                <span className="pub-type-tag">
                  {(pub.type as string) || "Publication"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <a href={bp("/")} className="blog-more" style={{ marginTop: "2rem" }}>
        ← Home
      </a>
    </main>
  );
}
