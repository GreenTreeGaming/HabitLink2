"use client";

import Sidebar from "@/components/Sidebar";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface User {
  _id: string;
  name: string;
  image: string;
  email: string;
  habitsFinished: number;
}

interface Team {
  _id: string;
  name: string;
  habitsFinished: number;
}

const Leaderboard = () => {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [habitsFinished, setHabitsFinished] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard", {
          headers: { "x-user-email": session?.user?.email || "" },
        });
        const data = await res.json();

        setTeams(data.teamLeaderboard || []);
        setUsers(data.individualLeaderboard || []);
        setHabitsFinished(data.user?.habitsFinished || 0);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
    };

    if (session?.user?.email) {
      fetchLeaderboard();
    }
  }, [session]);

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-4">
      <Sidebar />
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-green-600 text-center mb-6">
          🏆 Leaderboard
        </h1>
        <div className="flex flex-wrap gap-6">
          {/* First Leaderboard: Teams */}
          <div className="my-4 p-4 bg-green-50 rounded-lg shadow-md flex-1">
            <h2 className="text-2xl font-semibold text-green-600 text-center">
              Teams
            </h2>
            <ul className="space-y-4">
              {teams.map((team, index) => (
                <li
                  key={team._id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-md"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full font-bold">
                    {index + 1} {/* Ranking */}
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-gray-800">
                      {team.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Habits Finished: {team.habitsFinished}
                    </p>
                  </div>
                </li>
              ))}
              {teams.length === 0 && (
                <p className="text-center text-gray-500 mt-4">
                  No team leaderboard data available.
                </p>
              )}
            </ul>
          </div>

          {/* Second Leaderboard: Individuals */}
          <div className="my-4 p-4 bg-green-50 rounded-lg shadow-md flex-1">
            <h2 className="text-2xl font-semibold text-green-600 text-center">
              Individuals
            </h2>
            <ul className="space-y-4">
              {users.map((user, index) => {
                const isCurrentUser = session?.user?.email === user.email; // Match using email
                return (
                  <li
                    key={user._id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-md"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full font-bold">
                      {index + 1} {/* Ranking */}
                    </div>
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h2
                        className={`font-semibold text-lg ${
                          isCurrentUser ? "text-green-600" : "text-gray-800"
                        }`}
                      >
                        {user.name} {isCurrentUser && <span>(You)</span>}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Habits Finished: {user.habitsFinished}
                      </p>
                    </div>
                  </li>
                );
              })}
              {users.length === 0 && (
                <p className="text-center text-gray-500 mt-4">
                  No individual leaderboard data available.
                </p>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-8 p-4 bg-green-50 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-green-600">
            Your Total Finished Habits:{" "}
            {habitsFinished !== null ? habitsFinished : "Loading..."}
          </h2>
        </div>
      </div>
    </main>
  );
};

export default Leaderboard;