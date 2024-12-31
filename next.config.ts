import type { NextConfig } from "next";

async function triggerScheduler() {
  if (typeof window === "undefined") {
    // Make a request to initialize the scheduler
    await fetch("http://localhost:3000/api/scheduler").catch((err) => {
      console.error("Failed to initialize scheduler:", err);
    });
  }
}

triggerScheduler();

const nextConfig: NextConfig = {
  /* config options */
};

export default nextConfig;