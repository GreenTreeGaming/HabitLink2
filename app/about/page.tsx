import Sidebar from '@/components/Sidebar'
import React from 'react'

const page = () => {
  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-4">
      <Sidebar />
      <div className="mt-20 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-6">About Us</h1>
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold text-gray-700">Chapter Name</h2>
          <p className="text-lg text-gray-600 mb-4">Wayzata BPA</p>
          <h2 className="text-xl font-semibold text-gray-700">Team Members</h2>
          <ul className="text-lg text-gray-600 list-disc list-inside mb-4">
            <li>Sarvajith Karun</li>
            <li>Shubham Panchal</li>
            <li>Aaron Zou</li>
            <li>Jasper Fang</li>
          </ul>
          <h2 className="text-xl font-semibold text-gray-700">Team Number</h2>
          <p className="text-lg text-gray-600">V04-WAT-S~30-0051-1</p>
        </div>
      </div>
    </main>
  )
}

export default page