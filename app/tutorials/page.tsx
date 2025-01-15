"use client";

import Sidebar from "@/components/Sidebar";
import React from "react";
import YouTube from "react-youtube";

const TutorialsPage = () => {
  return (
    <main className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gray-100 py-6 px-4">
      <Sidebar />
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-green-600 text-center mb-6">
          🎥 Operation Tutorials
        </h1>
        {/* Video Section 1 */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-full max-w-3xl">
            <YouTube
              videoId="nit8bwItjus"
              className="w-full h-full"
              iframeClassName="w-full aspect-video"
            />
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-green-600 text-center">
            Adding Habits - Team Members
          </h2>
        </div>
        {/* Video Section 2 */}
        <div className="flex flex-col items-center mt-10 space-y-6">
          <div className="w-full max-w-3xl">
            <YouTube
              videoId="AMPVYiikJxU"
              className="w-full h-full"
              iframeClassName="w-full aspect-video"
            />
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-green-600 text-center">
            Managing Teams - Team Captains
          </h2>
        </div>
      </div>
    </main>
  );
};

export default TutorialsPage;