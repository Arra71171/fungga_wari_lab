/* global process */
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/dashboard",
        destination: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/dashboard`,
      },
      {
        source: "/dashboard/:path*",
        destination: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/dashboard/:path*`,
      },
    ];
  },
  // Allow HMR/WebSocket connections from LAN mobile devices
  allowedDevOrigins: ['192.168.1.2'],
  transpilePackages: ["@workspace/ui"],
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
