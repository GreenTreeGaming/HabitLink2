import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb"; // Required for handling MongoDB ObjectIds

export async function GET(req: Request) {
  const client = await clientPromise;
  const db = client.db("habitlink");

  const url = new URL(req.url);
  const id = url.searchParams.get("id"); // Get the user ID from the query parameters
  const query = url.searchParams.get("query") || "";

  try {
    if (id) {
      // Fetch a specific user by their ID
      const user = await db.collection("users").findOne(
        { _id: new ObjectId(id) }, // Convert string ID to ObjectId
        { projection: { name: 1, email: 1, image: 1, habitsFinished: 1, badgesCollected: 1 } } // Include badgesCollected
      );

      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
      }

      return new Response(JSON.stringify(user), { status: 200 });
    } else if (query) {
      // Fetch users whose name or email matches the query (case-insensitive)
      const users = await db
        .collection("users")
        .find({
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        })
        .project({ id: "$_id", name: 1, email: 1, image: 1, habitsFinished: 1 }) // Include habitsFinished
        .toArray();

      return new Response(JSON.stringify(users), { status: 200 });
    } else {
      // If neither ID nor query is provided, return all users
      const users = await db.collection("users").find({}).toArray();
      return new Response(JSON.stringify(users), { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
  }
}