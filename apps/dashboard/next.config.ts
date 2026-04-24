import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Use a basePath so that we can rewrite from the web app
  basePath: "/dashboard",
  // Allow HMR/WebSocket connections from LAN mobile devices
  allowedDevOrigins: ['192.168.1.2'],
  transpilePackages: ["@workspace/ui", "@workspace/auth"],
  experimental: {
    // Cache fetch responses in Server Components across HMR refreshes — faster local dev
    // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/serverComponentsHmrCache
    serverComponentsHmrCache: true,
    // Optimize imports from these packages to avoid slow barrel-file compilation
    optimizePackageImports: ["lucide-react", "@workspace/ui"],
  },
  images: {
    // In dev, skip server-side optimization — avoids DNS failures when the
    // dev machine cannot reach res.cloudinary.com (isolated network / VPN).
    // Cloudinary's own URL-based transformations are still applied.
    unoptimized: process.env.NODE_ENV === 'development',
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
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
