import { getConfig } from "@/lib/config";
import { renderOg, ogSize, ogContentType } from "@/lib/og/render";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Talk";

export function generateStaticParams() {
  return getConfig()
    .content.speaking_topics.filter((t) => t.slug)
    .map((t) => ({ slug: t.slug as string }));
}

export default async function OG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getConfig().content.speaking_topics.find((t) => {
    const s =
      t.slug ??
      t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return s === slug;
  });
  if (!topic) notFound();
  return renderOg({ title: topic.title });
}
