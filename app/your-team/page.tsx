"use client";

import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TeamContent from "@/components/TeamContent";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Team {
  id: string;
  name: string;
  members: User[];
  creatorEmail: string;
}

interface Invite {
  _id: string;
  from: string;
  to: string;
  teamId: string;
  status: string;
}

export default function YourTeam() {
  const [team, setTeam] = useState<Team | null>(null); // Stores the current user's team
  const [isCreatingTeam, setIsCreatingTeam] = useState(false); // To toggle the creation modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false); // To toggle the invite modal
  const [searchQuery, setSearchQuery] = useState(""); // For user search
  const [searchResults, setSearchResults] = useState<User[]>([]); // Search results
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]); // Users selected for a new team or invite
  const [invites, setInvites] = useState<Invite[]>([]); // Pending invites for the user
  const [isLeaving, setIsLeaving] = useState<Team | null>(null);
  const [newCaptainEmail, setNewCaptainEmail] = useState("");
  const [isChoosingNewAdmin, setIsChoosingNewAdmin] = useState(false);
  const [teamName, setTeamName] = useState("");

  const { data: session } = useSession();

  useEffect(() => {
    console.log("Session Data:", session); // Logs session data
  }, [session]);

  // Fetch team data
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/team"); // Fetch the current user's team
        const data = await res.json();
        if (data && data.name) {
          setTeam(data);
        } else {
          setTeam(null); // User is not part of a team
        }
      } catch (error) {
        console.error("Failed to fetch team:", error);
      }
    };

    fetchTeam();
  }, []); // Runs only on initial render

  // Fetch invites
  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await fetch("/api/invites");
        const data = await res.json();

        console.log("Fetched Invites:", data); // Logs the invites
        setInvites(data);
      } catch (error) {
        console.error("Failed to fetch invites:", error);
      }
    };

    fetchInvites();
  }, []); // Runs only on initial render

  const handleSearch = async () => {
    try {
      const res = await fetch(`/api/users?query=${searchQuery}`); // Search users
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Failed to search users:", error);
    }
  };

  const handleAddUser = (user: User) => {
    if (!selectedUsers.some((u) => u.email === user.email)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const handleLeaveTeam = async () => {
    try {
      if (!team) return; // Ensure the team data exists

      // If the user is the last member
      if (team.members.length === 1) {
        const res = await fetch("/api/team", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId: team.id,
            action: "leave",
          }),
        });

        if (res.ok) {
          setTeam(null); // Clear team state
          alert("You have left the team. The team has been deleted.");
        } else {
          console.error("Failed to leave the team");
          alert("An error occurred while trying to leave the team.");
        }
        return;
      }

      // If the current user is the admin and other members exist
      if (team.creatorEmail === session?.user?.email) {
        if (!newCaptainEmail) {
          alert("Please select a new team admin before leaving.");
          return;
        }

        const res = await fetch("/api/team", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId: team.id,
            action: "leave",
            newCaptainEmail,
          }),
        });

        if (res.ok) {
          setTeam(null); // Clear team state
          alert("You have successfully left the team.");
          setIsChoosingNewAdmin(false); // Reset admin selection state
        } else {
          console.error("Failed to leave the team");
          alert("An error occurred while trying to leave the team.");
        }
        return;
      }

      // For non-admin users leaving
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.id,
          action: "leave",
        }),
      });

      if (res.ok) {
        setTeam(null); // Clear team state
        alert("You have successfully left the team.");
      } else {
        console.error("Failed to leave the team");
        alert("An error occurred while trying to leave the team.");
      }
    } catch (error) {
      console.error("Error leaving the team:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleRemoveMember = async (memberEmail: string) => {
    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team?.id,
          action: "remove",
          memberEmail,
        }),
      });

      if (res.ok) {
        const updatedTeam = await res.json();
        setTeam(updatedTeam);
      } else {
        console.error("Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleInviteMembers = async () => {
    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team?.id,
          action: "add",
          members: selectedUsers.map((user) => user.email), // Ensure correct email is used
        }),
      });

      if (res.ok) {
        alert("Invites sent!");
        setIsInviteModalOpen(false); // Close the invite modal
        setSelectedUsers([]); // Clear selected users
      } else {
        console.error("Failed to send invites");
      }
    } catch (error) {
      console.error("Error inviting members:", error);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert("Please provide a valid team name.");
      return;
    }

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(), // Use the entered team name
          members: selectedUsers.map((user) => user.email), // Send user emails
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Failed to create team:", error);
        alert(`Error: ${error.error || "An unknown error occurred."}`);
        return;
      }

      const newTeam = await res.json();
      setTeam(newTeam); // Set the new team in state
      setIsCreatingTeam(false); // Close the modal
      setSelectedUsers([]); // Clear selected users
      setTeamName(""); // Reset the team name field
    } catch (error) {
      console.error("Failed to create team:", error);
      alert("An error occurred while creating the team.");
    }
  };

  const handleInviteResponse = async (inviteId: string, response: "accepted" | "declined") => {
    try {
      const res = await fetch("/api/invites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, response }),
      });

      if (res.ok) {
        if (response === "accepted") {
          const updatedTeam = await res.json();
          setTeam(updatedTeam); // Update the team with the accepted invite
        }
        setInvites((prev) => prev.filter((invite) => invite._id !== inviteId)); // Remove processed invite
      } else {
        console.error("Failed to process invite response");
      }
    } catch (error) {
      console.error("Failed to respond to invite:", error);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-4">
      <Sidebar />

      <TeamContent
        team={team}
        isCreatingTeam={isCreatingTeam}
        isInviteModalOpen={isInviteModalOpen}
        searchQuery={searchQuery}
        searchResults={searchResults}
        selectedUsers={selectedUsers}
        invites={invites}
        newCaptainEmail={newCaptainEmail}
        isChoosingNewAdmin={isChoosingNewAdmin}
        teamName={teamName}
        session={session}
        setIsCreatingTeam={setIsCreatingTeam}
        setIsInviteModalOpen={setIsInviteModalOpen}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        handleAddUser={handleAddUser}
        handleRemoveUser={handleRemoveUser}
        handleCreateTeam={handleCreateTeam}
        handleInviteResponse={handleInviteResponse}
        setTeamName={setTeamName}
        setNewCaptainEmail={setNewCaptainEmail}
        handleLeaveTeam={handleLeaveTeam}
        handleRemoveMember={handleRemoveMember}
        handleInviteMembers={handleInviteMembers}
        setIsChoosingNewAdmin={setIsChoosingNewAdmin}
      />
    </main>
  );
}