"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import HabitProgressChart from "@/components/HabitProgressChart";
import Confetti from "react-confetti";
import SignIn from "@/components/SignIn";
import Sidebar from "@/components/Sidebar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
  const [habitUnit, setHabitUnit] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [habitFrequency, setHabitFrequency] = useState("");
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const shownReminders = useRef<Set<string>>(new Set());
  const lastFetchedTime = useRef<number>(Date.now());


  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const now = Date.now();

        // Reset `shownReminders` every 5 minutes (300000ms)
        if (now - lastFetchedTime.current > 3_600_000) {
          shownReminders.current.clear();
          lastFetchedTime.current = now;
        }

        const res = await fetch("/api/reminders");
        if (!res.ok) throw new Error("Failed to fetch reminders");

        const data = await res.json();
        console.log("[fetchReminders] Received reminders:", data);

        if (data.reminders && Array.isArray(data.reminders)) {
          data.reminders.forEach((reminder) => {
            if (!shownReminders.current.has(reminder)) {
              // Show the toast
              toast.info(reminder, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
              });

              // Add to the shown reminders set
              shownReminders.current.add(reminder);
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch reminders:", error);
      }
    };

    if (session) {
      fetchReminders(); // Initial call
      const intervalId = setInterval(fetchReminders, 3_600_000); // Poll every 5 seconds

      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [session]);

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

  const addHabit = async () => {
    if (!habitName.trim() || !habitUnit.trim() || habitGoal <= 0 || !["daily", "weekly", "monthly"].includes(habitFrequency)) {
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
        body: JSON.stringify({ habitName, unit: habitUnit, goal: habitGoal, frequency: habitFrequency }),
      });

      const result = await res.json();
      if (res.ok) {
        setHabits((prev) => [
          ...prev,
          {
            name: habitName,
            unit: habitUnit,
            goal: habitGoal,
            frequency: habitFrequency,
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

  const decrementProgress = async (id: string, amount: number) => {
    const habit = habits.find((h) => h._id === id);
    if (!habit || habit.progress <= 0) return;

    setHabits((prev) =>
      prev.map((h) =>
        h._id === id ? { ...h, progress: Math.max(h.progress - amount, 0) } : h
      )
    );

    try {
      const res = await fetch("/api/habits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.id}`,
        },
        body: JSON.stringify({ _id: id, decrement: amount }),
      });

      const result = await res.json();
      console.log("API Response:", result); // Log the API response

      if (result.status !== "success") {
        throw new Error(result.error || "Failed to decrement progress");
      }
    } catch (error) {
      console.error("Error decrementing progress:", error);
      alert("An error occurred while updating progress.");
      setHabits((prev) =>
        prev.map((h) =>
          h._id === id ? { ...h, progress: Math.min(h.progress + amount, h.goal) } : h
        )
      );
    }
  };

  const deleteHabit = async (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit._id !== id)); // Optimistic UI update

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
      <ToastContainer position="bottom-right" pauseOnFocusLoss={false}/>
      <button
        onClick={() => signOut()}
        className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Sign Out
      </button>
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6 flex-wrap">
        <h1 className="text-4xl font-bold text-green-600 mb-6 text-center">
          🌟 Welcome, {session.user?.name}
        </h1>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full mb-6">
          <input
            type="text"
            placeholder="Habit Name"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            className="px-4 py-2 border border-green-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Amount"
            value={habitGoal}
            onChange={(e) => setHabitGoal(parseInt(e.target.value))}
            className="px-4 py-2 border border-green-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Units"
            value={habitUnit}
            onChange={(e) => setHabitUnit(e.target.value)}
            className="px-4 py-2 border border-green-300 rounded-lg"
          />
          <select
            value={habitFrequency}
            onChange={(e) => setHabitFrequency(e.target.value)}
            className="px-2 py-2 border border-green-300 rounded-lg bg-white"
          >
            <option value="" disabled>Select Frequency</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-center">
            <button
              onClick={addHabit}
              className="w-full lg:w-auto px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600"
            >
              Add Habit
            </button>
          </div>
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
                  {/* Add the occurrence text with icons */}
                  <p className="text-sm text-gray-500 mt-1">
                    Occurs: {habit.frequency === "daily" ? "☀️ Daily" : habit.frequency === "weekly" ? "📅 Weekly" : "🌙 Monthly"}
                  </p>
                </div>
                <HabitProgressChart
          name={habit.name}
          progress={habit.progress}
          goal={habit.goal}
          unit={habit.unit}
        />
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-4">
          {habit.progress < habit.goal && (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="#"
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
                onClick={() => incrementProgress(habit._id, 1)}
                className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600"
              >
                +1
              </button>
              <button
                onClick={() => decrementProgress(habit._id, 1)}
                className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow hover:bg-yellow-600"
              >
                -1
              </button>
            </div>
          )}
          <button
            onClick={() => setHabitToDelete(habit)}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600"
          >
            Finish
          </button>
        </div>
              </li>
            ))}

            {habitToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to finish the habit <strong>{habitToDelete.name}</strong>? This
                    habit will not be recurring again. It will be added to your total finished
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