import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the dev badge away from the presenter's "Demo" button (bottom-left).
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
