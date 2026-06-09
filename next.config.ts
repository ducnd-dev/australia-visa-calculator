import type { NextConfig } from "next";

function r2ImagePattern(): { protocol: "https"; hostname: string; pathname: string } | null {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim();
  if (!base) return null;
  try {
    const { hostname } = new URL(base);
    return { protocol: "https", hostname, pathname: "/**" };
  } catch {
    return null;
  }
}

const r2Pattern = r2ImagePattern();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(r2Pattern ? [r2Pattern] : []),
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
