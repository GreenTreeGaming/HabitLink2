import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("habitlink");

  // Fetch past habits for the logged-in user
  const pastHabits = await db
    .collection("pastHabits")
    .find({ userId: session.user.id })
    .toArray();

  return NextResponse.json(pastHabits, { status: 200 });
}