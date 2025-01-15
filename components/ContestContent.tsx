import React from "react";

export default function TeamContent({
  team,
  isCreatingTeam,
  isInviteModalOpen,
  searchQuery,
  searchResults,
  selectedTeams,
  invites,
  teamName,
  session,
  selectedUsers,
  setIsCreatingTeam,
  setIsInviteModalOpen,
  setSearchQuery,
  handleSearchTeams,
  handleAddTeam,
  handleRemoveTeam,
  handleCreateTeam,
  handleInviteResponse,
  setTeamName,
  handleLeaveTeam,
  handleRemoveMember,
}) {
  return (
    <>
      <h1 className="text-4xl font-bold text-green-600 mb-6">Contests</h1>

      {/* Invites Section */}
      {invites && invites.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Invites</h2>
          <ul>
            {invites.map((invite) => (
              <li key={invite._id} className="mb-2 flex justify-between items-center">
                <span>
                  Invitation from <strong>{invite.from}</strong> to join{" "}
                  <strong>{invite.teamName}</strong>.
                </span>
                <div>
                  <button
                    onClick={() => handleInviteResponse(invite._id, "accepted")}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 mr-2"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleInviteResponse(invite._id, "declined")}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-600 mb-4">No invites found.</p>
      )}

      {!team ? (
        <>
          <p className="text-gray-600 mb-4">You are not in a team yet.</p>
          <button
            onClick={() => setIsCreatingTeam(true)}
            className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600"
          >
            Create a Contest
          </button>
        </>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-2xl font-bold text-green-600 mb-4">{team?.name || "Your Contest"}</h2>
          {team.members && team.members.length > 0 ? (
            <ul className="space-y-2">
              {(selectedTeams || []).map((team) => (
                <li
                  key={team._id}
                  className="flex justify-between items-center p-2 border rounded-lg"
                >
                  <span>{team.name}</span>
                  <button
                    onClick={() => handleRemoveTeam(team._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No team members found.</p>
          )}
          <div className="mt-4">
            <button
              onClick={handleLeaveTeam}
              className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
            >
              Leave Team
            </button>
          </div>
        </div>
      )}

      {isCreatingTeam && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-bold text-green-600 mb-4">Create a Contest</h2>
            <input
              type="text"
              placeholder="Enter contest name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <input
              type="text"
              placeholder="Search for teams"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <button
              onClick={handleSearchTeams}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Search
            </button>
            <ul className="mt-4 space-y-2">
              {searchResults.map((team) => (
                <li
                  key={team._id}
                  className="flex justify-between items-center p-2 border rounded-lg"
                >
                  <span>{team.name}</span>
                  <button
                    onClick={() => handleAddTeam(team)}
                    className="px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-700 mb-2">Selected Teams:</h3>
              <ul className="space-y-2">
                {(selectedTeams || []).map((team) => (
                  <li
                    key={team._id}
                    className="flex justify-between items-center p-2 border rounded-lg"
                  >
                    <span>{team.name}</span>
                    <button
                      onClick={() => handleRemoveTeam(team._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setIsCreatingTeam(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}