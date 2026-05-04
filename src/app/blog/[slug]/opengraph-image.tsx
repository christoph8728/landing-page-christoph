import { getContentBySlug, getAllSlugs } from "@/lib/content";
import { renderOg, ogSize, ogContentType } from "@/lib/og/render";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Blog post";

export async function generateStaticParams() {
  return getAllSlugs("blog").map((slug) => ({ slug }));
}

export default async function OG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getContentBySlug("blog", slug);
  if (!post) notFound();
  return renderOg({
    title: post.title,
    tags: (post.tags as string[] | undefined) ?? [],
  });
}
