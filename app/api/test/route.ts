import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("habitlink");

    // Insert a sample habit
    const result = await db.collection("habits").insertOne({
      name: "Sample Habit",
      goal: 5,
      progress: 0,
    });

    const habits = await db.collection("habits").find({}).toArray();

    return NextResponse.json({
      status: "success",
      insertedId: result.insertedId,
      habits,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "error", error: error.message });
  }
}