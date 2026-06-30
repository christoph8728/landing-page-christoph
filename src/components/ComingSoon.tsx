import { getConfig } from "@/lib/config";

// Minimal standalone "Coming Soon" screen. Rendered in place of the real site
// when features.coming_soon is true. Uses the existing design tokens (Outfit
// body font, IBM Plex Mono, amber accent, site background) — no new design
// language. Styles are scoped here so they don't touch the shared stylesheet.
export default function ComingSoon() {
  const { site, author } = getConfig();

  return (
    <main className="cs">
      <div className="cs-inner">
        <p className="cs-eyebrow">
          <span className="cs-dot" /> Coming soon
        </p>
        <h1 className="cs-name">{author.name}</h1>
        {site.tagline && <p className="cs-tagline">{site.tagline}</p>}
        {author.email && (
          <a className="cs-email" href={`mailto:${author.email}`}>
            {author.email}
          </a>
        )}
      </div>

      <style>{`
        .cs {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem;
          background: var(--color-bg);
          color: var(--color-text);
        }
        .cs-inner {
          width: min(100%, var(--max-width, 820px));
          text-align: center;
        }
        .cs-eyebrow {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin: 0 0 1.6rem;
        }
        .cs-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-accent);
          display: inline-block;
        }
        .cs-name {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: clamp(2.4rem, 7vw, 4.2rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .cs-tagline {
          font-family: var(--font-body);
          font-size: clamp(1rem, 2.4vw, 1.2rem);
          color: var(--color-text-mid);
          margin: 1.1rem 0 2.2rem;
        }
        .cs-email {
          font-family: var(--font-mono);
          font-size: 14px;
          letter-spacing: .01em;
          color: var(--color-accent);
          text-decoration: none;
          border-bottom: 1px solid var(--accent-border, rgba(159, 88, 10, 0.18));
          padding-bottom: 2px;
          transition: color .15s ease, border-color .15s ease;
        }
        .cs-email:hover {
          color: var(--color-accent-hover);
          border-color: var(--color-accent-hover);
        }
      `}</style>
    </main>
  );
}
