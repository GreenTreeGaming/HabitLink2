import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const client = await clientPromise;
  const db = client.db("habitlink");

  const url = new URL(req.url);
  const query = url.searchParams.get("query") || "";

  // Search for users whose name or email matches the query (case-insensitive)
  const users = await db
    .collection("users")
    .find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
    .project({ id: "$_id", name: 1, email: 1 }) // Include name, email, and id in the results
    .toArray();

  return new Response(JSON.stringify(users), { status: 200 });
}