import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("habitlink");

    // Extract user email from headers for authentication
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "User email is missing" }, { status: 400 });
    }

    // Fetch all badges from the "badges" collection
    const badges = await db.collection("badges").find().toArray();
    const formattedBadges = badges.map((badge) => ({
      ...badge,
      _id: badge._id.toString(),
    }));

    // Fetch the user and their habitsFinished and badgesCollected
    const user = await db.collection("users").findOne(
      { email: userEmail },
      { projection: { habitsFinished: 1, badgesCollected: 1 } }
    );

    return NextResponse.json({
      badges: formattedBadges,
      user: {
        habitsFinished: user?.habitsFinished || 0,
        badgesCollected: user?.badgesCollected || [],
      },
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { badgeId } = await req.json();
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail || !badgeId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("habitlink");

    // Update the user's badgesCollected
    await db.collection("users").updateOne(
      { email: userEmail },
      { $addToSet: { badgesCollected: badgeId } }
    );

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error updating badges:", error);
    return NextResponse.json({ error: "Failed to update badges" }, { status: 500 });
  }
}