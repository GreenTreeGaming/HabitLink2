import React from 'react'

export default function TeamContent({
  team,
  isCreatingTeam,
  isInviteModalOpen,
  searchQuery,
  searchResults,
  selectedUsers,
  invites,
  newCaptainEmail,
  isChoosingNewAdmin,
  teamName,
  session,
  setIsCreatingTeam,
  setIsInviteModalOpen,
  setSearchQuery,
  handleSearch,
  handleAddUser,
  handleRemoveUser,
  handleCreateTeam,
  handleInviteResponse,
  setTeamName,
  setNewCaptainEmail,
  handleLeaveTeam,
  handleRemoveMember,
  handleInviteMembers,
  setIsChoosingNewAdmin,
}) {
  return (
    <>
      <h1 className="text-4xl font-bold text-green-600 mb-6">Your Team</h1>

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
            Create a Team
          </button>
        </>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-2xl font-bold text-green-600 mb-4">{team?.name || "Your Team"}</h2>
          {team.members && team.members.length > 0 ? (
            <ul className="space-y-2">
              {team.members.map((member, index) => {
                const isCurrentUser = session?.user?.email === member.email;
                const isAdmin = team.creatorEmail === member.email; // Determine if the member is the admin
                const isTeamCreator = session?.user?.email === team.creatorEmail; // Check if the current user is the admin

                return (
                  <li
                    key={member.email || index}
                    className={`text-gray-700 flex items-center gap-3 ${
                      isCurrentUser ? "text-green-600 font-bold" : ""
                    }`}
                  >
                    <img
                      src={member.image}
                      alt={`${member.name}'s avatar`}
                      className="w-8 h-8 rounded-full"
                    />
                    <span>
                      {member.name} ({member.email})
                      {isCurrentUser && " (You)"}
                      {isAdmin && " (Team Captain)"}
                    </span>
                    {/* Show "Invite Members" button only for the admin */}
                    {isTeamCreator && isCurrentUser && (
                      <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Invite Members
                      </button>
                    )}
                    {/* Show "Remove" button only for the admin, excluding themselves */}
                    {isTeamCreator && !isCurrentUser && (
                      <button
                        onClick={() => handleRemoveMember(member.email)}
                        className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-600">No team members found.</p>
          )}
          {/* Leave Team Logic */}
          <div className="mt-4">
            {session?.user?.email === team.creatorEmail ? (
              <>
                {!isChoosingNewAdmin ? (
                  <button
                    onClick={() => setIsChoosingNewAdmin(true)}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
                  >
                    Leave Team
                  </button>
                ) : team.members.length === 1 ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      You are the last member of the team. Leaving will delete the team.
                    </p>
                    <button
                      onClick={handleLeaveTeam}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
                    >
                      Confirm & Leave
                    </button>
                    <button
                      onClick={() => setIsChoosingNewAdmin(false)}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 ml-4"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">
                      As the team captain, you must select a new team captain before leaving.
                    </p>
                    <select
                      value={newCaptainEmail}
                      onChange={(e) => setNewCaptainEmail(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 mb-4 w-full"
                    >
                      <option value="">Select new team captain</option>
                      {team.members
                        .filter((member) => member.email !== team.creatorEmail)
                        .map((member) => (
                          <option key={member.email} value={member.email}>
                            {member.name} ({member.email})
                          </option>
                        ))}
                    </select>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleLeaveTeam}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
                        disabled={!newCaptainEmail}
                      >
                        Confirm & Leave
                      </button>
                      <button
                        onClick={() => setIsChoosingNewAdmin(false)}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <button
                onClick={handleLeaveTeam}
                className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
              >
                Leave Team
              </button>
            )}
          </div>
        </div>
      )}

      {/* Team Creation Modal */}
      {isCreatingTeam && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-bold text-green-600 mb-4">Create a Team</h2>
            <input
              type="text"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <input
              type="text"
              placeholder="Search for users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Search
            </button>
            <ul className="mt-4 space-y-2">
              {searchResults.map((user) => (
                <li
                  key={user.email}
                  className="flex justify-between items-center p-2 border rounded-lg"
                >
                  <span>
                    {user.name} ({user.email})
                  </span>
                  <button
                    onClick={() => handleAddUser(user)}
                    className="px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-700 mb-2">Selected Users:</h3>
              <ul className="space-y-2">
                {selectedUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex justify-between items-center p-2 border rounded-lg"
                  >
                    <span>
                      {user.name} ({user.email})
                    </span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
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

      {/* Invite Members Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-bold text-green-600 mb-4">Invite Members</h2>
            <input
              type="text"
              placeholder="Search for users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Search
            </button>
            <ul className="mt-4 space-y-2">
              {searchResults.map((user) => (
                <li
                  key={user.id}
                  className="flex justify-between items-center p-2 border rounded-lg"
                >
                  <span>
                    {user.name} ({user.email})
                  </span>
                  <button
                    onClick={() => handleAddUser(user)}
                    className="px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-700 mb-2">Selected Users:</h3>
              <ul className="space-y-2">
                {selectedUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex justify-between items-center p-2 border rounded-lg"
                  >
                    <span>
                      {user.name} ({user.email})
                    </span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
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
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMembers}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}