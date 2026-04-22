import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/profile", destination: "/account/preferences", permanent: false }];
  },
};

export default nextConfig;
