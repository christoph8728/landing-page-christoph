import type { Metadata } from "next";
import Script from "next/script";
import { getConfig, getActiveNav, isComingSoon } from "@/lib/config";
import { bp } from "@/lib/path";
import "./globals.css";

export function generateMetadata(): Metadata {
  const { site, author } = getConfig();

  return {
    title: { default: site.title, template: `%s — ${site.short_name}` },
    description: site.description,
    metadataBase: new URL(site.url),
    // While in Coming Soon mode, keep the placeholder out of search results.
    ...(isComingSoon() ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: site.title,
      description: site.description,
      url: site.url,
      siteName: site.title,
      locale: site.language,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
    },
    authors: [{ name: author.name }],
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getConfig();
  const navItems = getActiveNav();
  const comingSoon = isComingSoon();
  const activeSocials = Object.entries(config.author.socials).filter(
    ([, v]) => v != null
  );

  return (
    <html lang={config.site.language}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href={`https://fonts.googleapis.com/css2?family=${config.design.font_body.replace(/ /g, "+")}:wght@200;300;400;500;600;700&family=${config.design.font_mono.replace(/ /g, "+")}:wght@400;500&display=swap`}
          rel="stylesheet"
        />
        {config.features.rss && (
          <>
            <link
              rel="alternate"
              type="application/rss+xml"
              title={`${config.site.title} - RSS`}
              href={bp("/feed.xml")}
            />
            <link
              rel="alternate"
              type="application/atom+xml"
              title={`${config.site.title} - Atom`}
              href={bp("/atom.xml")}
            />
          </>
        )}
        {config.analytics.provider === "plausible" &&
          config.analytics.plausible && (
            <>
              <script async src={config.analytics.plausible.script_url} />
              <script
                dangerouslySetInnerHTML={{
                  __html:
                    "window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()",
                }}
              />
            </>
          )}
        {config.analytics.provider === "umami" &&
          config.analytics.umami && (
            <script
              defer
              data-website-id={config.analytics.umami.website_id}
              src={config.analytics.umami.script_url}
            />
          )}
      </head>
      <body>
        {!comingSoon && (
        <>
        <nav className="site-nav" aria-label="Primary">
          <div className="nav-inner">
            <a href={bp("/") + "#top"} className="nav-brand">
              <span className="dot" />
              {config.site.title}
            </a>
            <ul className="nav-links">
              {navItems
                .filter((item) => item.href !== "/#contact")
                .map((item) => {
                  const sectionId = item.href.replace(/^.*#/, "");
                  return (
                    <li key={item.href}>
                      <a href={bp(item.href)} data-section={sectionId}>
                        {item.label}
                      </a>
                    </li>
                  );
                })}
            </ul>
            <a href={bp("/") + "#contact"} className="nav-cta always">
              Get in touch
            </a>
          </div>
        </nav>

        <Script id="nav-scrollspy" strategy="afterInteractive">{`
          (function(){
            var links = document.querySelectorAll('.nav-links a[data-section]');
            var sections = Array.from(links).map(function(a){
              var id = a.getAttribute('href').replace(/^.*#/, '');
              return { id: id, link: a, el: document.getElementById(id) };
            }).filter(function(s){ return s.el; });

            function update(){
              var y = window.scrollY + 140;
              var current = sections[0];
              for (var i = 0; i < sections.length; i++){
                if (sections[i].el.offsetTop <= y) current = sections[i];
              }
              links.forEach(function(l){ l.classList.remove('active'); });
              if (current) current.link.classList.add('active');
            }
            update();
            window.addEventListener('scroll', update, { passive: true });
          })();
        `}</Script>
        </>
        )}

        {children}

        {!comingSoon && (
        <footer>
          <div className="foot-links">
            {activeSocials.map(([key, url]) => (
              <a key={key} href={url!}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </a>
            ))}
          </div>
          <span className="foot-copy">
            © {new Date().getFullYear()} {config.author.name} ·{" "}
            {config.author.location}
          </span>
        </footer>
        )}
      </body>
    </html>
  );
}
