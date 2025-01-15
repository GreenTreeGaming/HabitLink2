import { NextResponse } from "next/server";
import cron from "node-cron";
import { recreateHabits, checkReminders } from "@/lib/habitUtils";

let isSchedulerRunning = false;

export async function GET() {
  if (!isSchedulerRunning) {
    console.log("Initializing server-side scheduler...");
    isSchedulerRunning = true;

    // Schedule the notification/reminder job to run every hour
    cron.schedule("0 * * * *", async () => {
      console.log("[Scheduler] Running notification/reminder job...");
      await checkReminders();
    });
  }

  return NextResponse.json({ status: "Scheduler is running" });
}