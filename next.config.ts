import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options */
  ignoreBuildErrors: true,
};

const triggerScheduler = async () => {
  if (typeof window === "undefined") {
    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}` // Ensure https protocol
        : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    try {
      // Use the base URL to make a request
      await fetch(`${baseUrl}/api/scheduler`);
    } catch (err) {
      console.error("Failed to initialize scheduler:", err);
    }
  }
};

// Ensure scheduler is triggered as part of the server lifecycle
triggerScheduler();

export default nextConfig;
