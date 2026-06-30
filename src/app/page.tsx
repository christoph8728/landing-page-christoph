// src/app/page.tsx — REDESIGNED homepage
// Drop-in replacement. All content still flows from site.config.yaml + content/*.md.
//
// Notable structural changes from the original:
//   - Hero: byline + headline + intro (removed hero-facts; data lives in byline + thesis)
//   - Thesis: pull-quote layout with serif italic; uses new `quote` + `description`
//             fields if present, else falls back to splitting the existing string.
//   - Numbers: 2-cell dark band; uses `value`, `label`, optional `context`.
//   - Track record: vertical timeline; first role gets `.current` className.
//   - Speaking topics: numbered cards with `<a>` wrapper anchored to #contact.
//   - CTA: dark inverse card; reads same fields as before.

import type { Metadata } from "next";
import { getConfig, isComingSoon } from "@/lib/config";
import { getAllContent } from "@/lib/content";
import { bp } from "@/lib/path";
import ComingSoon from "@/components/ComingSoon";

// Canonical for the homepage. Resolved against metadataBase (site.url) set in
// the root layout. Trailing slash matches next.config `trailingSlash: true`.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  if (isComingSoon()) return <ComingSoon />;

  const config = getConfig();
  const { sections, author } = config;

  const speaking = sections.engagements ? getAllContent("speaking") : [];
  const publications = sections.publications
    ? getAllContent("publications")
    : [];
  const blogPosts =
    sections.blog_preview && config.features.blog
      ? getAllContent("blog").slice(0, sections.blog_preview_count)
      : [];
  const trackRecord = sections.track_record
    ? getAllContent("track-record")
    : [];

  const highlightedPubs = publications.filter((p) => p.highlight);
  const regularPubs = publications.filter((p) => !p.highlight);

  // Thesis: prefer structured `thesis_quote` + `thesis_supporting`, fall back to
  // splitting the original `thesis` string at the first sentence.
  const thesisRaw = (config.content as any).thesis as string | undefined;
  const thesisQuote =
    (config.content as any).thesis_quote ??
    (thesisRaw ? thesisRaw.split(/(?<=[.!?])\s+/)[0] : "");
  const thesisSupporting =
    (config.content as any).thesis_supporting ??
    (thesisRaw
      ? thesisRaw.split(/(?<=[.!?])\s+/).slice(1).join(" ")
      : "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.site.title,
    url: config.site.url,
    author: { "@type": "Person", name: config.author.name },
    description: config.site.description,
  };

  // Person schema for entity/knowledge-graph recognition. Driven by site.config.yaml.
  // `sameAs` is built only from real social URLs — placeholder values shipped in the
  // config (…/your-profile) are filtered out so we never publish fake profiles.
  // TODO: add real LinkedIn + GitHub URLs under author.socials in site.config.yaml;
  //       they will then flow into sameAs automatically (and into the footer).
  const sameAs = [author.socials.linkedin, author.socials.github].filter(
    (u): u is string => !!u && !u.includes("your-profile")
  );

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.current_role, // "COO & Co-Founder"
    worksFor: { "@type": "Organization", name: author.current_org },
    description:
      "Operations and turnaround leadership in industrial and production services; previously SVP Operations at ARRI Lighting.",
    url: config.site.url,
    ...(author.credentials ? { honorificSuffix: author.credentials } : {}),
    ...(author.location ? { homeLocation: author.location } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />

      {/* ===== HERO ===== */}
      <header className="hero" id="top">
        <div className="hero-content">
          <div className="hero-byline">
            {(config.site.tagline as string)
              .split(/\s*[·•|]\s*/)
              .map((t, i, arr) => (
                <span key={i} style={{ display: "contents" }}>
                  <b>{t}</b>
                  {i < arr.length - 1 && <i />}
                </span>
              ))}
            {author.location && (
              <>
                <i />
                <span>{author.location}</span>
              </>
            )}
            {author.credentials && (
              <>
                <i />
                <span>{author.credentials}</span>
              </>
            )}
          </div>
          <h1
            dangerouslySetInnerHTML={{ __html: config.site.headline }}
          />
          <p className="hero-intro">{config.site.description}</p>
        </div>
        {author.photo ? (
          <div className="hero-photo">
            <img src={bp(author.photo as string)} alt={author.name} />
            <span className="ringmark">01</span>
            <div className="stamp">
              <b>{author.name}</b>
              Portrait · {author.location}
            </div>
          </div>
        ) : (
          <div className="hero-photo">
            <div className="hero-photo-placeholder" />
            <span className="ringmark">01</span>
            <div className="stamp">
              <b>{author.name}</b>
              Portrait · {author.location}
            </div>
          </div>
        )}
      </header>

      {/* ===== THESIS ===== */}
      {sections.thesis && (
        <section className="thesis" id="thesis">
          <div className="thesis-mark" aria-hidden="true">
            &ldquo;
          </div>
          <div className="thesis-body">
            <div className="thesis-label">
              Thesis · {new Date().getFullYear()}
            </div>
            <p
              className="thesis-quote"
              dangerouslySetInnerHTML={{ __html: thesisQuote }}
            />
            {thesisSupporting && (
              <p
                className="thesis-supporting"
                dangerouslySetInnerHTML={{ __html: thesisSupporting }}
              />
            )}
          </div>
        </section>
      )}

      {/* ===== TRACK RECORD ===== */}
      {sections.track_record && trackRecord.length > 0 && (
        <section className="s" id="record">
          <div className="s-head">Track Record</div>
          <h2 className="s-title">
            Where I&rsquo;ve been, <b>and what I did there.</b>
          </h2>

          <div className="timeline">
            {trackRecord.map((role, idx) => {
              const period = role.period as string;
              const [start, end] = period
                .split(/\s*[–-]\s*/)
                .map((s) => s.trim());
              return (
                <div
                  className={`role ${idx === 0 ? "current" : "past"}`}
                  key={role.slug}
                >
                  <span className="role-dot" />
                  <div className="role-when">
                    {start}
                    <i>{end || "now"}</i>
                  </div>
                  <div className="role-body">
                    <div className="role-org">
                      {role.organization as string}
                    </div>
                    <div className="role-title">{role.title}</div>
                    <p className="role-desc">{role.description as string}</p>
                    <div className="role-pills">
                      {(role.tags as string[])?.map((tag) => (
                        <span className="pill" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== NUMBERS — dark band ===== */}
      {sections.numbers && (
        <div className="numbers-band">
          <div className="s-inner">
            <div className="s-head">Numbers</div>
            <h2 className="s-title">
              A few <b>that stuck with me.</b>
            </h2>

            <div className="numbers-grid">
              {(config.content.numbers as Array<{
                value: string;
                label: string;
                context?: string;
              }>).map((item, index, arr) => (
                <div className="num-cell" key={index}>
                  <span className="idx">
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {String(arr.length).padStart(2, "0")}
                  </span>
                  <span
                    className="num-val"
                    dangerouslySetInnerHTML={{ __html: item.value }}
                  />
                  <span className="num-label">{item.label}</span>
                  {item.context && (
                    <span className="num-context">{item.context}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== SPEAKING TOPICS ===== */}
      {sections.speaking_topics && (
        <section className="s" id="topics">
          <div className="s-head">Speaking &amp; Advisory</div>
          <h2 className="s-title">
            Three talks I&rsquo;m <b>currently giving.</b>
          </h2>

          <div className="topic-list">
            {(config.content.speaking_topics as Array<{
              title: string;
              slug?: string;
              format: string;
              description: string;
              audience?: string;
            }>).map((topic, index) => {
              const [formatHead, formatTail] = topic.format
                .split(/\s*·\s*/, 2);
              const slug =
                topic.slug ??
                topic.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "");
              return (
                <a href={bp(`/speaking/${slug}`)} className="topic" key={index}>
                  <span className="topic-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="topic-title">{topic.title}</div>
                    <div className="topic-meta">
                      <b>{formatHead}</b>
                      {formatTail && (
                        <>
                          <i />
                          <span>{formatTail}</span>
                        </>
                      )}
                      {topic.audience && (
                        <>
                          <i />
                          <span>{topic.audience}</span>
                        </>
                      )}
                    </div>
                    <p className="topic-desc">{topic.description}</p>
                  </div>
                  <span className="topic-arrow">→</span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== ENGAGEMENTS ===== */}
      {sections.engagements && speaking.length > 0 && (
        <section className="s" id="engagements">
          <div className="s-head">Upcoming &amp; Recent Engagements</div>
          <h2 className="s-title">
            Where to <b>catch me live.</b>
          </h2>
          <div className="engage-list">
            {speaking.map((entry) => (
              <div className="engage" key={entry.slug}>
                <div className="engage-date">
                  {new Date(entry.date).toLocaleDateString("en-GB", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div className="engage-info">
                  <h4>{entry.title}</h4>
                  <div className="engage-venue">
                    {(entry.event as string) || ""}
                    {entry.location ? ` · ${entry.location}` : ""}
                  </div>
                </div>
                <span className="engage-type">
                  {(entry.type as string) || "Speaking"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== PUBLICATIONS ===== */}
      {sections.publications && publications.length > 0 && (
        <section className="s" id="publications">
          <div className="s-head">Selected Publications</div>
          <h2 className="s-title">
            A few from <b>40+ peer-reviewed papers.</b>
          </h2>

          {highlightedPubs.map((pub) => (
            <div className="pub-highlight" key={pub.slug}>
              <div className="pub-yr">{pub.year as number}</div>
              <div>
                <div className="pub-label">
                  {(pub.type as string) || "Publication"}
                </div>
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
            </div>
          ))}

          <div className="pub-list">
            {regularPubs.slice(0, (sections as any).publications_preview_count ?? 5).map((pub) => (
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

          {regularPubs.length > ((sections as any).publications_preview_count ?? 5) && (
            <a
              href={bp("/publications")}
              className="blog-more"
              style={{ marginTop: "2rem" }}
            >
              All {publications.length}+ publications
            </a>
          )}
        </section>
      )}

      {/* ===== BLOG PREVIEW ===== */}
      {sections.blog_preview && blogPosts.length > 0 && (
        <div className="s-alt">
          <div className="s-inner" id="writing">
            <div className="s-head">Writing</div>
            <h2 className="s-title">
              Recent <b>posts.</b>
            </h2>
            <div className="blog-list">
              {blogPosts.map((post) => (
                <a
                  href={bp(`/blog/${post.slug}`)}
                  className="blog-entry"
                  key={post.slug}
                >
                  <span className="blog-title">{post.title}</span>
                  <span className="blog-date">
                    {new Date(post.date).toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })}
                    {config.features.reading_time && post.reading_time && (
                      <> · {post.reading_time} min</>
                    )}
                  </span>
                </a>
              ))}
            </div>
            <a href={bp("/blog")} className="blog-more">
              All posts
            </a>
          </div>
        </div>
      )}

      {/* ===== CTA ===== */}
      <section className="cta" id="contact">
        <div className="cta-card">
          <div className="cta-text">
            <div className="cta-kicker">Contact · {author.location}</div>
            <h2
              dangerouslySetInnerHTML={{
                __html:
                  (config.content as any).cta.heading_html ??
                  config.content.cta.heading,
              }}
            />
            <p>{config.content.cta.description}</p>
          </div>
          <div className="cta-actions">
            <a href={`mailto:${author.email}`} className="btn-primary">
              {author.email}
            </a>
            {author.socials.linkedin && (
              <a href={author.socials.linkedin} className="btn-secondary">
                LinkedIn ↗
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
