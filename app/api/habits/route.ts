import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("habitlink");

  const habits = await db.collection("habits").find({ userId: session.user.id }).toArray();

  // Reset progress if the goal's time frame has passed
  const now = new Date();
  const updatedHabits = habits.map((habit) => {
    let resetRequired = false;

    if (habit.timeFrame === "daily") {
      resetRequired = new Date(habit.lastReset).toDateString() !== now.toDateString();
    } else if (habit.timeFrame === "weekly") {
      const weekOfYear = (date: Date) =>
        Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
      resetRequired = weekOfYear(new Date(habit.lastReset)) !== weekOfYear(now);
    } else if (habit.timeFrame === "monthly") {
      resetRequired = new Date(habit.lastReset).getMonth() !== now.getMonth();
    }

    if (resetRequired) {
      habit.progress = 0;
      habit.lastReset = now;
    }

    return habit;
  });

  // Save any updated habits back to the database
  await Promise.all(
    updatedHabits.map((habit) =>
      db.collection("habits").updateOne({ _id: habit._id }, { $set: habit })
    )
  );

  return new Response(JSON.stringify(updatedHabits), { status: 200 });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("habitlink");

  try {
    const { habitName, goal, frequency, unit } = await req.json();

    console.log("Received Payload:", { habitName, goal, frequency, unit }); // Debugging log

    // Validation logic
    if (!habitName || typeof habitName !== "string" || habitName.trim() === "") {
      return new Response(JSON.stringify({ error: "Invalid habit name" }), { status: 400 });
    }

    if (!goal || typeof goal !== "number" || goal <= 0) {
      return new Response(JSON.stringify({ error: "Invalid goal value" }), { status: 400 });
    }

    if (!frequency || !["daily", "weekly", "monthly"].includes(frequency)) {
      return new Response(JSON.stringify({ error: "Invalid frequency value" }), { status: 400 });
    }

    if (!unit || typeof unit !== "string" || unit.trim() === "") {
      return new Response(JSON.stringify({ error: "Invalid unit" }), { status: 400 });
    }

    const createdAt = new Date();

    // Set initial reminder time for testing: 5 seconds after creation
    const reminderTime = new Date();
    reminderTime.setSeconds(reminderTime.getHours() + 1);

    const habit = {
      name: habitName,
      goal,
      frequency,
      unit, // Save the unit
      progress: 0,
      userId: session.user.id,
      createdAt,
      reminderTime: reminderTime.toISOString(),
      completed: false,
    };

    const result = await db.collection("habits").insertOne(habit);
    console.log("Saved Habit to Database:", habit); // Debugging log

    return new Response(JSON.stringify({ status: "success", habitId: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/habits:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500 }
    );
  }
}

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
//   }

//   const client = await clientPromise;
//   const db = client.db("habitlink");

//   try {
//     const { habitName, goal, frequency, habitUnit } = await req.json();

//     // Validation logic
//     if (!habitName || typeof habitName !== "string" || habitName.trim() === "") {
//       return new Response(JSON.stringify({ error: "Invalid habit name" }), { status: 400 });
//     }

//     if (!goal || typeof goal !== "number" || goal <= 0) {
//       return new Response(JSON.stringify({ error: "Invalid goal value" }), { status: 400 });
//     }

//     if (!frequency || !["daily", "weekly", "monthly"].includes(frequency)) {
//       return new Response(JSON.stringify({ error: "Invalid frequency value" }), { status: 400 });
//     }

//     if (!habitUnit || typeof habitUnit !== "string" || habitUnit.trim() === "") {
//       return new Response(JSON.stringify({ error: "Invalid unit of measure" }), { status: 400 });
//     }

//     const createdAt = new Date();

//     // Calculate default reminder time based on frequency
//     const reminderTime = calculateDefaultReminder(frequency, createdAt);
//     console.log(`[POST Habit] Calculated reminder time: ${reminderTime}`);

//     const habit = {
//       name: habitName,
//       goal,
//       frequency,
//       unit: habitUnit, // Include the unit in the habit object
//       progress: 0, // Initialize progress to 0
//       userId: session.user.id,
//       createdAt,
//       reminderTime, // Add reminder time
//       completed: false,
//     };

//     const result = await db.collection("habits").insertOne(habit);

//     return new Response(JSON.stringify({ status: "success", habitId: result.insertedId }), { status: 201 });
//   } catch (error) {
//     console.error("Error in POST /api/habits:", error);
//     return new Response(
//       JSON.stringify({ error: "An unexpected error occurred." }),
//       { status: 500 }
//     );
//   }
// }

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("habitlink");

    const { _id, increment, decrement } = await req.json();

    // Validate input
    if ((!increment && !decrement) || (increment && increment < 0) || (decrement && decrement < 0)) {
      return NextResponse.json({ error: "Invalid increment or decrement value" }, { status: 400 });
    }

    const habit = await db.collection("habits").findOne({ _id: new ObjectId(_id), userId: session.user.id });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    let newProgress = habit.progress || 0;

    if (increment) {
      newProgress += increment;
    } else if (decrement) {
      newProgress = Math.max(newProgress - decrement, 0); // Ensure progress doesn't go below 0
    }

    const updatedFields: any = { progress: newProgress };
    if (newProgress >= habit.goal) {
      updatedFields.completed = true;
    }

    const result = await db.collection("habits").updateOne(
      { _id: new ObjectId(_id), userId: session.user.id },
      { $set: updatedFields }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made" }, { status: 400 });
    }

    return NextResponse.json({ status: "success", modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "error", error: error.message });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("habitlink");

  try {
    const { _id } = await req.json();

    // Validate habit ID
    if (!_id) {
      return new Response("Habit ID is required", { status: 400 });
    }

    const habit = await db.collection("habits").findOne({
      _id: new ObjectId(_id),
      userId: session.user.id,
    });

    if (!habit) {
      return new Response("Habit not found", { status: 404 });
    }

    // Add habit to pastHabits collection
    await db.collection("pastHabits").insertOne({
      ...habit,
      archivedAt: new Date().toISOString(),
    });

    // Increment the user's habitsFinished count
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $inc: { habitsFinished: 1 } }
    );

    // Delete the habit from the habits collection
    const result = await db.collection("habits").deleteOne({
      _id: new ObjectId(_id),
    });

    if (result.deletedCount === 0) {
      throw new Error("Failed to delete habit");
    }

    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/habits:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500 }
    );
  }
}