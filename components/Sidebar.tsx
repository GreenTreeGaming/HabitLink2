"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { FaHistory, FaHome, FaUsers } from "react-icons/fa"; // Import the icons

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // Initialize the router

  return (
    <div>
      {/* Hamburger Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-green-500 text-white rounded-md fixed top-4 left-4 z-50"
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
            className="absolute top-4 right-4 text-green-500 bg-green-100 rounded-md p-2 hover:bg-green-200"
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
          </ul>
        </div>
      </div>
    </div>
  );
}