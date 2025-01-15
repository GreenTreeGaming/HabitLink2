"use client";

import Sidebar from "@/components/Sidebar";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {toast, ToastContainer} from "react-toastify";

interface Badge {
  _id: string;
  name: string;
  description: string;
  requirements: { habitsFinished: number };
  icon: string;
}

const BadgesPage = () => {
  const { data: session } = useSession();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [habitsFinished, setHabitsFinished] = useState<number>(0);
  const [userBadges, setUserBadges] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/badges", {
          headers: { "x-user-email": session?.user?.email || "" },
        });
        const data = await res.json();

        setBadges(data.badges || []);
        setHabitsFinished(data.user.habitsFinished || 0);
        setUserBadges(data.user.badgesCollected || []);
      } catch (error) {
        console.error("Failed to fetch badges:", error);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const awardBadge = async (badgeId) => {
    try {
      const res = await fetch("/api/badges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": session?.user?.email || "",
        },
        body: JSON.stringify({ badgeId }),
      });

      if (res.ok) {
        setUserBadges((prev) => [...prev, badgeId]);
      } else {
        console.error("Failed to award badge");
      }
    } catch (error) {
      console.error("Error awarding badge:", error);
    }
  };

  useEffect(() => {
    if (badges.length > 0 && habitsFinished > 0) {
      badges.forEach((badge) => {
        if (
          !userBadges.includes(badge._id) &&
          habitsFinished >= badge.requirements.habitsFinished
        ) {
          awardBadge(badge._id); // Automatically award badge if eligible
        }
      });
    }
  }, [badges, userBadges, habitsFinished]);

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-4">
      <Sidebar />
      <ToastContainer position="bottom-right" pauseOnFocusLoss={false}/>
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-green-600 text-center mb-6">
          🏅 Badges
        </h1>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const isCollected = userBadges.includes(badge._id);
            const canUnlock = habitsFinished >= badge.requirements.habitsFinished;

            return (
              <li
                key={badge._id}
                className={`flex flex-col items-center rounded-lg shadow-md p-4 ${
                  isCollected ? "bg-gray-50" : canUnlock ? "bg-white" : "bg-gray-200 opacity-50"
                }`}
              >
                <img
                  src={badge.icon}
                  alt={badge.name}
                  className="w-16 h-16 mb-4"
                />
                <h2
                  className={`font-semibold text-lg ${
                    isCollected ? "text-gray-800" : canUnlock ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {badge.name}
                </h2>
              </li>
            );
          })}
        </ul>
        {badges.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No badges available.</p>
        )}
      </div>
    </main>
  );
};

export default BadgesPage;