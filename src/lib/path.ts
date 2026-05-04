// Build-time basePath. Set via the BASE_PATH env var in next.config.ts.
// Used to prefix absolute URLs (e.g. /assets/photo.jpg) when the site is
// deployed at a subpath (github.io/<repo>/) instead of an apex custom domain.
export const basePath = process.env.BASE_PATH || "";

export function bp(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${basePath}${path}`;
}
