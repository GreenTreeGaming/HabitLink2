import { NextResponse } from "next/server";
import cron from "node-cron";
import { recreateHabits, checkReminders } from "@/lib/habitUtils";

let isSchedulerRunning = false; // Ensure the scheduler doesn't initialize multiple times

export async function GET() {
  // Initialize the scheduler only once
  if (!isSchedulerRunning) {
    console.log("Initializing server-side scheduler...");
    isSchedulerRunning = true;

    // Schedule the habit recreation job
    cron.schedule("0 0 * * *", async () => { // Runs daily at midnight
      console.log("[Scheduler] Running habit recreation job...");
      try {
        await recreateHabits();
        console.log("[Scheduler] Habit recreation completed.");
      } catch (error) {
        console.error("[Scheduler] Error during habit recreation job:", error);
      }
    });

    // Schedule the notification/reminder job
    cron.schedule("*/10 * * * * *", async () => { // Runs every 10 seconds for testing
      console.log("[Scheduler] Running notification/reminder job...");
      try {
        await checkReminders();
        console.log("[Scheduler] Notification/reminder check completed.");
      } catch (error) {
        console.error("[Scheduler] Error during notification/reminder job:", error);
      }
    });
  }

  return NextResponse.json({ status: "Scheduler is running" });
}