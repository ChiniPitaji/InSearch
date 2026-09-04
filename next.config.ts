import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keeps Next.js focused on this folder, not the parent Downloads folder.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
