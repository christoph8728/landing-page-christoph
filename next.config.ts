import type { NextConfig } from "next";

// BASE_PATH is set in CI so the site renders at github.io subpath.
// When deploying to the apex custom domain, leave it unset.
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
