import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/auth"],
  experimental: {
    // Cache fetch responses in Server Components across HMR refreshes — faster local dev
    // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/serverComponentsHmrCache
    serverComponentsHmrCache: true,
    // Optimize imports from these packages to avoid slow barrel-file compilation
    optimizePackageImports: ["lucide-react", "@workspace/ui"],
  },
  images: {
    qualities: [25, 50, 75, 90, 100],
    // placehold.co returns SVG — must be enabled at the top level in Next.js 15+
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Cloudinary CDN — primary media provider
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // CMS placeholder images (development / seeded data)
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      // Clerk user avatars
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
