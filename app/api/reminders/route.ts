import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("habitlink");

  try {
    const now = new Date();
    const userId = session.user.id; // Ensure we're filtering by the logged-in user's ID

    // Fetch habits needing reminders for the current user
    const habits = await db.collection("habits").find({
      userId: userId, // Match only the current user's habits
      reminderTime: { $lte: now.toISOString() }, // Reminder time is due or past
      completed: false, // Exclude completed habits
    }).toArray();

    const reminders = habits.map((habit) => `Reminder: It's time to complete your habit "${habit.name}"! You only have ${habit.goal - habit.progress} ${habit.unit} left to go!`);

    return new Response(JSON.stringify({ reminders }), { status: 200 });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch reminders." }), { status: 500 });
  }
}