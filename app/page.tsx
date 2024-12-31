"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import HabitProgressChart from "@/components/HabitProgressChart";
import Confetti from "react-confetti";
import SignIn from "@/components/SignIn";
import Sidebar from "@/components/Sidebar";

interface Habit {
  _id: string;
  name: string;
  goal: number;
  progress: number;
  createdAt: string; // Add the createdAt property
}

export default function Home() {
  const { data: session } = useSession();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitName, setHabitName] = useState("");
  const [habitGoal, setHabitGoal] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [habitFrequency, setHabitFrequency] = useState("");
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  useEffect(() => {
    if (session) {
      const fetchHabits = async () => {
        try {
          const res = await fetch("/api/habits", {
            headers: { Authorization: `Bearer ${session.user?.id}` },
          });
          const data = await res.json();
          if (Array.isArray(data)) {
            setHabits(data);
          } else {
            console.error("Unexpected API response:", data);
            setHabits([]);
          }
        } catch (error) {
          console.error("Failed to fetch habits:", error);
          setHabits([]);
        }
      };

      fetchHabits();
    }
  }, [session]);

  const [goalType, setGoalType] = useState<string>("count");
  const [timeFrame, setTimeFrame] = useState<string>("daily");

  const addHabit = async () => {
    if (!habitName.trim() || habitGoal <= 0 || !["daily", "weekly", "monthly"].includes(timeFrame)) {
      alert("Please enter valid details for the habit.");
      return;
    }

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.id}`,
        },
        body: JSON.stringify({ habitName, goal: habitGoal, frequency: timeFrame }),
      });

      const result = await res.json();
      if (res.ok) {
        setHabits((prev) => [
          ...prev,
          {
            name: habitName,
            goal: habitGoal,
            frequency: timeFrame,
            progress: 0,
            _id: result.habitId,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        console.error("Error adding habit:", result.error || "Unknown error");
        alert(result.error || "An error occurred while adding the habit.");
      }
    } catch (error) {
      console.error("Error adding habit:", error);
      alert("An error occurred while adding the habit.");
    }
  };

  const incrementProgress = async (id: string, amount: number) => {
    const habit = habits.find((h) => h._id === id);
    if (!habit || habit.progress >= habit.goal) return;

    setHabits((prev) =>
      prev.map((h) =>
        h._id === id ? { ...h, progress: Math.min(h.progress + amount, h.goal) } : h
      )
    );

    try {
      const res = await fetch("/api/habits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.id}`,
        },
        body: JSON.stringify({ _id: id, increment: amount }),
      });

      const result = await res.json();
      if (result.status !== "success") {
        throw new Error("Failed to increment progress");
      }

      // Trigger confetti if the habit is completed
      const updatedHabit = habits.find((h) => h._id === id);
      if (updatedHabit && updatedHabit.progress + amount >= updatedHabit.goal) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // Show confetti for 5 seconds
      }
    } catch (error) {
      console.error("Error incrementing progress:", error);
      alert("An error occurred while updating progress.");
      setHabits((prev) =>
        prev.map((h) =>
          h._id === id ? { ...h, progress: Math.max(h.progress - amount, 0) } : h
        )
      );
    }
  };

  const deleteHabit = async (id: string) => {
    // Optimistically update the UI by removing the habit
    setHabits((prev) => prev.filter((habit) => habit._id !== id));

    try {
      const res = await fetch("/api/habits", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.id}`,
        },
        body: JSON.stringify({ _id: id }),
      });

      const result = await res.json();
      if (result.status !== "success") {
        throw new Error("Failed to delete habit");
      }
    } catch (error) {
      console.error("Error deleting habit:", error);

      // Revert the UI if the backend call fails
      setHabits((prev) => [...prev, habits.find((habit) => habit._id === id)!]);
      alert("An error occurred while deleting the habit. Please try again.");
    }
  };

  if (!session) {
    return <SignIn />;
  }






  return (
    <main className="flex flex-col items-center bg-gradient-to-b from-green-100 to-green-300 min-h-screen py-10 px-4">
      <Sidebar />

      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <button
        onClick={() => signOut()}
        className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Sign Out
      </button>
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-4xl font-bold text-green-600 mb-6 text-center">
          🌟 Welcome, {session.user?.name}
        </h1>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Enter habit name"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            className="flex-1 px-4 py-2 border border-green-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Enter goal"
            value={habitGoal}
            onChange={(e) => setHabitGoal(parseInt(e.target.value))}
            className="flex-1 px-4 py-2 border border-green-300 rounded-lg"
          />
          <select
            value={habitFrequency}
            onChange={(e) => setHabitFrequency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button
            onClick={addHabit}
            className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600"
          >
            Add Habit
          </button>
        </div>
        {habits.length === 0 ? (
          <p className="text-gray-600 text-center mt-4">
            No habits yet. Add one above!
          </p>
        ) : (
          <ul className="space-y-4">
            {habits.map((habit) => (
              <li
                key={habit._id}
                className={`bg-gray-50 shadow-md rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4 ${
                  habit.progress >= habit.goal && "bg-green-100 border-green-600"
                }`}
              >
                <div>
                  <h2
                    className={`font-semibold text-lg ${
                      habit.progress >= habit.goal ? "text-green-700" : "text-gray-800"
                    }`}
                  >
                    {habit.name} {habit.progress >= habit.goal && "✔️"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Progress: {habit.progress}/{habit.goal}
                  </p>
                  <p className="text-sm text-gray-400">
                    Created on: {new Date(habit.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <HabitProgressChart name={habit.name} progress={habit.progress} goal={habit.goal} />
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  {habit.progress < habit.goal && (
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="Amount"
                        min="1"
                        className="px-4 py-2 border border-gray-300 rounded-lg w-20"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = parseInt((e.target as HTMLInputElement).value);
                            if (!isNaN(value) && value > 0) {
                              incrementProgress(habit._id, value);
                              (e.target as HTMLInputElement).value = ""; // Clear input
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => incrementProgress(habit._id, 1)} // Defaults to +1 if clicked
                        className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600"
                      >
                        +1
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setHabitToDelete(habit)}
                    className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}

            {habitToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete the habit <strong>{habitToDelete.name}</strong>? This
                    habit will not be recurring again.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setHabitToDelete(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        deleteHabit(habitToDelete._id);
                        setHabitToDelete(null);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </ul>

        )}
      </div>
    </main>
  );
}