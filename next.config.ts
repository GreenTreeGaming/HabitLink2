import type { NextConfig } from "next";

async function triggerScheduler() {
 if (typeof window === "undefined") {
    const baseUrl =
      process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    try {
      // Use the base URL to make a request
      await fetch(`${baseUrl}/api/scheduler`);
    } catch (err) {
      console.error("Failed to initialize scheduler:", err);
    }
  }
}

triggerScheduler();

const nextConfig: NextConfig = {
  /* config options */
  ignoreBuildErrors: true,
};

export default nextConfig;
