import path from "path";
import type { NextConfig } from "next";
import { getImageRemotePatterns } from "./src/lib/images";
import { legacyWordpressRedirects } from "./src/lib/legacy-redirects";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: getImageRemotePatterns(),
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  async redirects() {
    return [
      {
        source: "/tesla",
        destination: "/",
        permanent: true,
      },
      {
        source: "/apple-design",
        destination: "/",
        permanent: true,
      },
      ...legacyWordpressRedirects,
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
