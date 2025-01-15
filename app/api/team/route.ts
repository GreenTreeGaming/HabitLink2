import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("habitlink");

  // Find the team that includes the current user
  const team = await db.collection("teams").findOne({ members: session.user.email });

  if (!team) {
    return new Response(JSON.stringify(null), { status: 200 });
  }

  // Fetch full user details for each member
  const memberDetails = await db
    .collection("users")
    .find({ email: { $in: team.members } })
    .project({ name: 1, email: 1, image: 1 })
    .toArray();

  return new Response(
    JSON.stringify({
      id: team._id,
      name: team.name,
      members: memberDetails,
      creatorEmail: team.creatorEmail, // Include creator email
    }),
    { status: 200 }
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("habitlink");

  const { teamName, members } = await req.json();

  if (!teamName || typeof teamName !== "string" || !teamName.trim()) {
    return new Response(JSON.stringify({ error: "Invalid team name" }), { status: 400 });
  }

  if (!Array.isArray(members)) {
    return new Response(JSON.stringify({ error: "Invalid members list" }), { status: 400 });
  }

  try {
    // Check if the user is already in a team
    const existingTeam = await db.collection("teams").findOne({ members: session.user.email });
    if (existingTeam) {
      return new Response(JSON.stringify({ error: "User is already in a team" }), { status: 400 });
    }

    // Fetch user emails for the selected member emails
    const emailList = members.filter((email: string) => typeof email === "string" && email.includes("@"));
    const memberEmails = await db
      .collection("users")
      .find({ email: { $in: emailList } }) // Fetch user documents by email
      .project({ email: 1 })
      .toArray();

    const validEmails = memberEmails.map((user) => user.email);

    // Create the new team
    const teamResult = await db.collection("teams").insertOne({
      name: teamName.trim(),
      members: [session.user.email], // Add the creator
      creatorEmail: session.user.email,
      createdAt: new Date(),
    });

    // Create invites
    const invites = validEmails.map((email: string) => ({
      from: session.user.email,
      to: email,
      teamId: teamResult.insertedId.toString(),
      status: "pending",
      createdAt: new Date(),
    }));

    await db.collection("invites").insertMany(invites);

    // Return the created team with full details
    const createdTeam = {
      id: teamResult.insertedId.toString(),
      name: teamName.trim(),
      members: [{ email: session.user.email, name: session.user.name }],
      creatorEmail: session.user.email,
    };

    return new Response(JSON.stringify(createdTeam), { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("habitlink");

  try {
    const { teamId, teamName, action, members, memberEmail, newCaptainEmail } = await req.json();

    if (!teamId || !action || !["add", "remove", "leave"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
    }

    const team = await db.collection("teams").findOne({ _id: new ObjectId(teamId) });
    if (!team) {
      return new Response(JSON.stringify({ error: "Team not found" }), { status: 404 });
    }

    if (action === "add") {
      if (team.creatorEmail !== session.user.email) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
      }

      if (!members || !Array.isArray(members) || members.some((email) => !email.includes("@"))) {
        return new Response(JSON.stringify({ error: "Invalid members list" }), { status: 400 });
      }

      const invites = members.map((email: string) => ({
        from: session.user.email,
        to: email,
        teamId,
        teamName, // Ensure this is correctly passed
        status: "pending",
        createdAt: new Date(),
      }));

      await db.collection("invites").insertMany(invites);
      return new Response(JSON.stringify({ message: "Invites sent" }), { status: 200 });
    }

    if (action === "remove") {
      if (team.creatorEmail !== session.user.email) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
      }

      if (!memberEmail || !memberEmail.includes("@")) {
        return new Response(JSON.stringify({ error: "Invalid member email" }), { status: 400 });
      }

      if (memberEmail === team.creatorEmail) {
        return new Response(JSON.stringify({ error: "Admin cannot remove themselves" }), { status: 403 });
      }

      await db.collection("teams").updateOne(
        { _id: new ObjectId(teamId) },
        { $pull: { members: memberEmail } }
      );

      const updatedTeam = await db.collection("teams").findOne({ _id: new ObjectId(teamId) });
      const memberDetails = await db
        .collection("users")
        .find({ email: { $in: updatedTeam.members } })
        .project({ name: 1, email: 1, image: 1 })
        .toArray();

      return new Response(
        JSON.stringify({
          id: updatedTeam._id,
          name: updatedTeam.name,
          creatorEmail: updatedTeam.creatorEmail,
          members: memberDetails,
        }),
        { status: 200 }
      );
    }

    if (action === "leave") {
      if (team.members.length === 1) {
        await db.collection("teams").deleteOne({ _id: new ObjectId(teamId) });
        return new Response(JSON.stringify({ message: "Team deleted" }), { status: 200 });
      }

      if (session.user.email === team.creatorEmail) {
        if (!newCaptainEmail || !team.members.includes(newCaptainEmail)) {
          return new Response(JSON.stringify({ error: "Invalid new captain email" }), { status: 400 });
        }

        await db.collection("teams").updateOne(
          { _id: new ObjectId(teamId) },
          {
            $set: { creatorEmail: newCaptainEmail },
            $pull: { members: session.user.email },
          }
        );
      } else {
        await db.collection("teams").updateOne(
          { _id: new ObjectId(teamId) },
          { $pull: { members: session.user.email } }
        );
      }

      const updatedTeam = await db.collection("teams").findOne({ _id: new ObjectId(teamId) });
      if (!updatedTeam) {
        return new Response(JSON.stringify({ message: "Team deleted" }), { status: 200 });
      }

      const memberDetails = await db
        .collection("users")
        .find({ email: { $in: updatedTeam.members } })
        .project({ name: 1, email: 1, image: 1 })
        .toArray();

      return new Response(
        JSON.stringify({
          id: updatedTeam._id,
          name: updatedTeam.name,
          creatorEmail: updatedTeam.creatorEmail,
          members: memberDetails,
        }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
  } catch (error) {
    console.error("Error in PATCH /api/team:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}