import { getConfig } from "@/lib/config";
import { renderOg, ogSize, ogContentType } from "@/lib/og/render";

export const dynamic = "force-static";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Christoph Hollauer";

export default async function OG() {
  const { site } = getConfig();
  const cleanHeadline = site.headline
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
  return renderOg({ title: cleanHeadline });
}
