"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-800">Welcome to Habit Tracker</h1>
      <button
        onClick={() => signIn("google")}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
      >
        Sign in with Google
      </button>
    </div>
  );
}