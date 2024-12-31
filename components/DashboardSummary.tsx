"use client";

interface DashboardSummaryProps {
  totalHabits: number;
  habitsCompletedToday: number;
  goalAchievement: number;
}

export default function DashboardSummary({
  totalHabits,
  habitsCompletedToday,
  goalAchievement,
}: DashboardSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 bg-blue-100 text-blue-800 rounded-lg shadow-md">
        <h3 className="text-lg font-bold">Total Habits</h3>
        <p className="text-2xl">{totalHabits}</p>
      </div>
      <div className="p-4 bg-green-100 text-green-800 rounded-lg shadow-md">
        <h3 className="text-lg font-bold">Habits Completed Today</h3>
        <p className="text-2xl">{habitsCompletedToday}</p>
      </div>
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow-md">
        <h3 className="text-lg font-bold">Goal Achievement</h3>
        <p className="text-2xl">{goalAchievement}%</p>
      </div>
    </div>
  );
}