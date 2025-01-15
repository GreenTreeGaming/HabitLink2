import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";
import { toast } from "react-toastify";

export async function recreateHabits() {
  const client = await clientPromise;
  const db = client.db("habitlink");

  const now = new Date();
  console.log("[RecreateHabits] Starting habit recreation process...");

  const habits = await db.collection("habits").find().toArray();
  console.log(`[RecreateHabits] Fetched ${habits.length} habits from the database.`);

  for (const habit of habits) {
    const nextOccurrence = new Date(habit.lastReset || habit.createdAt);

    // Set wait times to real-world intervals
    if (habit.frequency === "daily") {
      nextOccurrence.setDate(nextOccurrence.getDate() + 1); // Add 1 day
    } else if (habit.frequency === "weekly") {
      nextOccurrence.setDate(nextOccurrence.getDate() + 7); // Add 7 days
    } else if (habit.frequency === "monthly") {
      nextOccurrence.setMonth(nextOccurrence.getMonth() + 1); // Add 1 month
    }

    console.log(
      `[RecreateHabits] Habit "${habit.name}" (ID: ${habit._id}) next occurrence scheduled for ${nextOccurrence.toISOString()}.`
    );

    // If it's time for the next occurrence
    if (nextOccurrence <= now) {
      if (habit.completed) {
        console.log(`[RecreateHabits] Recreating completed habit "${habit.name}" for user ${habit.userId}.`);
        // Recreate the habit if it's completed
        const newHabit = {
          name: habit.name,
          goal: habit.goal,
          frequency: habit.frequency,
          userId: habit.userId,
          createdAt: new Date(),
          progress: 0,
          completed: false,
          lastReset: now,
        };

        await db.collection("habits").insertOne(newHabit);

        // Delete the old habit after recreating it
        await db.collection("habits").deleteOne({ _id: habit._id });
        console.log(`[RecreateHabits] Deleted old habit "${habit.name}" (ID: ${habit._id}).`);
      } else {
        console.log(`[RecreateHabits] Resetting progress for incomplete habit "${habit.name}" for user ${habit.userId}.`);
        // Otherwise, reset its progress
        await db.collection("habits").updateOne(
          { _id: habit._id },
          { $set: { progress: 0, lastReset: now } }
        );
      }
    }
  }

  console.log("[RecreateHabits] Habit recreation process completed.");
}

export function calculateDefaultReminder(frequency: string, createdAt: Date): string {
  const reminder = new Date(createdAt);
  reminder.setSeconds(reminder.getHours() + 1); // For testing: 5 seconds from now
  return reminder.toISOString();
}

export async function checkReminders() {
  console.log("[Notification System] Starting reminder check...");
  const client = await clientPromise;
  const db = client.db("habitlink");
  const now = new Date();

  try {
    const habits = await db.collection("habits").find().toArray();
    console.log(`[Notification System] Found ${habits.length} habits to check.`);

    const reminders = [];

    for (const habit of habits) {
      console.log(`[Notification System] Checking habit "${habit.name}" with reminderTime "${habit.reminderTime}".`);

      if (habit.reminderTime && new Date(habit.reminderTime) <= now) {
        const toGo = habit.goal - habit.progress;
        const reminderMessage = `Reminder: It's time to complete your habit "${habit.name}"! You only have ${toGo} ${habit.unit} left to go!`;
        console.log(`[Notification System] Reminder: ${reminderMessage}`);

        reminders.push(reminderMessage);

        const nextReminderTime = new Date();
        nextReminderTime.setHours(nextReminderTime.getHours() + 1);
        await db.collection("habits").updateOne(
          { _id: habit._id },
          { $set: { reminderTime: nextReminderTime.toISOString() } }
        );
        console.log(
          `[Notification System] Setting next reminderTime for habit "${habit.name}" to "${nextReminderTime.toISOString()}".`
        );
      }
    }

    console.log("[Notification System] Reminder check complete.");
    return reminders; // Return reminders
  } catch (error) {
    console.error("[Notification System] Error during reminder check:", error);
    return [];
  }
}