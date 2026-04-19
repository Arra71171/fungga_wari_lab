/* global process */
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't try to polyfill Node.js core modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
      };
    }

    // Completely ignore .node files so Webpack never errors on them
    config.module.rules.push({
      test: /\.node$/,
      type: "asset/resource",
      generator: {
        filename: "static/media/[name].[hash][ext]",
      },
    });

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
