"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaHistory, FaHome, FaUsers, FaTrophy, FaMedal, FaStar, FaVideo } from "react-icons/fa"; // Import FaMedal for Badges
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // Initialize the router

  return (
    <div>
      {/* Hamburger Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-500 text-white rounded-md fixed top-4 left-4 z-50 px-4 py-2"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300`}
      >
        <div className="p-4 relative">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-green-500 bg-green-100 rounded-md px-4 py-2 hover:bg-green-200"
            aria-label="Close menu"
          >
            ✕
          </button>

          {/* Menu Header */}
          <h2 className="text-2xl font-bold text-green-600 mb-4">Menu</h2>

          {/* Menu Items */}
          <ul className="space-y-4">
            {/* Home Button */}
            <li>
              <button
                onClick={() => {
                  setIsOpen(false); // Close the sidebar
                  router.push("/"); // Navigate to Home
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-2 bg-green-100 rounded-lg hover:bg-green-200"
              >
                <FaHome className="text-green-600" /> {/* Home Icon */}
                <span>Home</span>
              </button>
            </li>
            {/* Past Habits Button */}
            <li>
              <button
                onClick={() => {
                  setIsOpen(false); // Close the sidebar
                  router.push("/past-habits"); // Navigate to Past Habits
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-2 bg-green-100 rounded-lg hover:bg-green-200"
              >
                <FaHistory className="text-green-600" /> {/* Past Habits Icon */}
                <span>Past Habits</span>
              </button>
            </li>
            {/* Your Team Button */}
            <li>
              <button
                onClick={() => {
                  setIsOpen(false); // Close the sidebar
                  router.push("/your-team"); // Navigate to Your Team
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-2 bg-green-100 rounded-lg hover:bg-green-200"
              >
                <FaUsers className="text-green-600" /> {/* Your Team Icon */}
                <span>Your Team</span>
              </button>
            </li>
            {/* Leaderboard Button */}
            <li>
              <button
                onClick={() => {
                  setIsOpen(false); // Close the sidebar
                  router.push("/leaderboard"); // Navigate to Leaderboard
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-2 bg-green-100 rounded-lg hover:bg-green-200"
              >
                <FaTrophy className="text-green-600" /> {/* Leaderboard Icon */}
                <span>Leaderboard</span>
              </button>
            </li>
            {/* Badges Button */}
            <li>
              <button
                onClick={() => {
                  setIsOpen(false); // Close the sidebar
                  router.push("/badges"); // Navigate to Badges
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-2 bg-green-100 rounded-lg hover:bg-green-200"
              >
                <FaMedal className="text-green-600" /> {/* Badges Icon */}
                <span>Badges</span>
              </button>
            </li>
            {/*Tutorials */}
            <li>
              <button
                onClick={() => {
                  setIsOpen(false); // Close the sidebar
                  router.push("/tutorials"); // Navigate to Badges
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-2 bg-green-100 rounded-lg hover:bg-green-200"
              >
                <FaVideo className="text-green-600" /> {/* Badges Icon */}
                <span>Operational Tutorials</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}