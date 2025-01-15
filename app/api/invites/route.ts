import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("habitlink");

  const { email, teamId } = await req.json();

  console.log("Creating invite for:", email);

  // Find the invitee
  const invitee = await db.collection("users").findOne({ email });
  if (!invitee) {
    return new Response(
      JSON.stringify({ error: "Invitee not found" }),
      { status: 404 }
    );
  }

  const existingInvite = await db
    .collection("invites")
    .findOne({ to: email, teamId, status: "pending" });

  if (existingInvite) {
    return new Response(
      JSON.stringify({ error: "User already invited" }),
      { status: 400 }
    );
  }

  // Get the team name
  const team = await db.collection("teams").findOne({ _id: new ObjectId(teamId) });
  if (!team) {
    return new Response(
      JSON.stringify({ error: "Team not found" }),
      { status: 404 }
    );
  }

  // Insert invite with team name
  console.log("Invite details - sender email, invitee email, team name:", session.user.email, invitee.email, team.name);
  const result = await db.collection("invites").insertOne({
    from: session.user.email,
    to: invitee.email,
    teamId,
    teamName: team.name, // Include the team name
    status: "pending",
    createdAt: new Date(),
  });

  console.log("Invite created:", result.insertedId);

  return new Response(
    JSON.stringify({ inviteId: result.insertedId }),
    { status: 201 }
  );
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("habitlink");

  console.log("Fetching invites for:", session.user.email);

  try {
    // Fetch invites for the logged-in user's email
    const invites = await db.collection("invites").find({ to: session.user.email }).toArray();

    // Include team names for invites
    const teamIds = invites.map((invite) => new ObjectId(invite.teamId));
    const teams = await db.collection("teams").find({ _id: { $in: teamIds } }).toArray();
    const teamMap = teams.reduce((map, team) => {
      map[team._id.toString()] = team.name;
      return map;
    }, {} as Record<string, string>);

    const invitesWithTeamNames = invites.map((invite) => ({
      ...invite,
      teamName: teamMap[invite.teamId] || "Unknown Team", // Fallback if team not found
    }));

    console.log("Fetched invites with team names:", invitesWithTeamNames);

    return new Response(JSON.stringify(invitesWithTeamNames), { status: 200 });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return new Response("Error fetching invites", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("habitlink");

  const { inviteId, response } = await req.json();

  // Fetch the invite
  const invite = await db.collection("invites").findOne({ _id: new ObjectId(inviteId) });

  if (!invite || invite.to !== session.user.email) {
    return new Response("Invite not found or unauthorized", { status: 404 });
  }

  if (response === "accepted") {
    // Add the user to the team
    await db
      .collection("teams")
      .updateOne(
        { _id: new ObjectId(invite.teamId) },
        { $addToSet: { members: session.user.email } } // Use `$addToSet` to ensure no duplicates
      );

    // Delete the invite after acceptance
    await db.collection("invites").deleteOne({ _id: new ObjectId(inviteId) });

    // Return the updated team
    const updatedTeam = await db
      .collection("teams")
      .findOne({ _id: new ObjectId(invite.teamId) });

    return new Response(JSON.stringify(updatedTeam), { status: 200 });
  } else if (response === "declined") {
    // Just delete the invite
    await db.collection("invites").deleteOne({ _id: new ObjectId(inviteId) });
    return new Response("Invite declined", { status: 200 });
  }

  return new Response("Invalid response", { status: 400 });
}