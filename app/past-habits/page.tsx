"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar"; // Import Sidebar

interface Habit {
  _id: string;
  name: string;
  goal: number;
  progress: number;
  archivedAt: string; // Timestamp when the habit was archived
}

const PastHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPastHabits = async () => {
      try {
        const res = await fetch("/api/past-habits");
        const data = await res.json();
        setHabits(data);
      } catch (error) {
        console.error("Failed to fetch past habits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPastHabits();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Sidebar /> {/* Add Sidebar */}
        <p className="text-gray-600">Loading past habits...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-4">
      <Sidebar /> {/* Add Sidebar */}
      <h2 className="text-4xl font-bold text-green-600 mb-6">Past Habits</h2>
      {habits.length === 0 ? (
        <p className="text-gray-600">No past habits found!</p>
      ) : (
        <ul className="w-full max-w-3xl space-y-4">
          {habits.map((habit) => (
            <li
              key={habit._id}
              className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg text-green-700">{habit.name}</h3>
                <p className="text-sm text-gray-500">
                  Progress: {habit.progress}/{habit.goal}
                </p>
                <p className="text-sm text-gray-400">
                  Finished on: {new Date(habit.archivedAt).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default PastHabits;