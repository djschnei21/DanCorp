import type { NextConfig } from "next";

// Set by the Pages workflow via actions/configure-pages. Unset for `next dev`.
const basePath = process.env.PAGES_BASE_PATH;
const pagesExport = basePath !== undefined;

const nextConfig: NextConfig = pagesExport
  ? {
      output: "export",
      // User/org sites get an empty base path. Project sites get /<repo>.
      basePath: basePath || undefined,
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
