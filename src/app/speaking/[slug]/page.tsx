import { getConfig } from "@/lib/config";
import { bp } from "@/lib/path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getConfig().content.speaking_topics
    .filter((t) => t.slug)
    .map((t) => ({ slug: t.slug as string }));
}

function findTopic(slug: string) {
  const topics = getConfig().content.speaking_topics;
  return topics.find((t) => {
    const s =
      t.slug ??
      t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return s === slug;
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = findTopic(slug);
  if (!topic) return { title: "Not Found" };
  return {
    title: topic.title,
    description: topic.description,
  };
}

export default async function TalkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = findTopic(slug);
  if (!topic) notFound();

  const { author } = getConfig();
  const [formatHead, formatTail] = topic.format.split(/\s*·\s*/, 2);

  return (
    <main className="s blog-page">
      <article className="post">
        <header className="post-header">
          <div className="s-head">Speaking</div>
          <h1 className="post-title">{topic.title}</h1>
          <div className="post-meta">
            <span>{formatHead}</span>
            {formatTail && <> · <span>{formatTail}</span></>}
            {topic.audience && <> · <span>{topic.audience}</span></>}
          </div>
        </header>
        <div className="prose">
          <p>{topic.description}</p>
        </div>
        <footer className="post-footer">
          <a href={`mailto:${author.email}`} className="btn-primary">
            Book this talk
          </a>
          <a href={bp("/") + "#topics"} className="blog-more">
            ← All talks
          </a>
        </footer>
      </article>
    </main>
  );
}
