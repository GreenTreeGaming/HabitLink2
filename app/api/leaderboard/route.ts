import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  const client = await clientPromise;
  const db = client.db("habitlink");

  const email = req.headers.get("x-user-email");

  try {
    // Fetch individual leaderboard
    const individualLeaderboard = await db
      .collection("users")
      .find({ habitsFinished: { $gt: 0 } })
      .sort({ habitsFinished: -1 })
      .limit(15)
      .project({ _id: 1, name: 1, email: 1, image: 1, habitsFinished: 1 })
      .toArray();

    // Fetch team leaderboard
    const teams = await db.collection("teams").find().toArray();
    const teamLeaderboard = [];

    for (const team of teams) {
      const teamMembers = await db
        .collection("users")
        .find({ email: { $in: team.members } })
        .project({ habitsFinished: 1 })
        .toArray();

      const totalHabitsFinished = teamMembers.reduce(
        (sum, member) => sum + (member.habitsFinished || 0),
        0
      );

      teamLeaderboard.push({
        _id: team._id.toString(),
        name: team.name,
        habitsFinished: totalHabitsFinished,
      });
    }

    // Sort teams by habitsFinished in descending order
    teamLeaderboard.sort((a, b) => b.habitsFinished - a.habitsFinished);

    // Fetch the current user's data
    let user = null;
    if (email) {
      user = await db.collection("users").findOne(
        { email },
        { projection: { habitsFinished: 1 } }
      );
    }

    return new Response(
      JSON.stringify({
        teamLeaderboard,
        individualLeaderboard,
        user: {
          habitsFinished: user?.habitsFinished || 0,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch leaderboard" }),
      { status: 500 }
    );
  }
}