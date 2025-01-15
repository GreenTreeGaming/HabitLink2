import { Habit } from "../types/Habits";

interface HabitListProps {
  habits: Habit[];
  updateProgress: (id: string, increment: number) => void;
}

export default function HabitList({ habits, updateProgress }: HabitListProps) {
  return (
    <div className="mt-10 w-3/4 max-w-md">
      <h2 className="text-xl font-semibold text-green-700">Your Habits</h2>
      {habits.length === 0 ? (
        <p className="text-gray-500 mt-4">No habits yet. Add one above!</p>
      ) : (
        <ul className="mt-4">
          {habits.map((habit) => {
            const remaining = habit.goal - habit.progress;

            return (
              <li
                key={habit.id}
                className={`flex flex-col md:flex-row justify-between items-start md:items-center py-2 px-4 border ${
                  remaining > 0 ? "border-green-300" : "border-green-500 bg-green-100"
                } rounded-md mb-2`}
              >
                <div className="mb-2 md:mb-0">
                  <p className="font-semibold text-lg text-gray-700">
                    {habit.name} {remaining <= 0 && "✔️"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Type: <span className="font-medium">{habit.unit}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Progress: {habit.progress}/{habit.goal} ({habit.frequency})
                  </p>
                  <p className="text-xs text-gray-400">
                    Target: {habit.frequency} goal - {habit.goal} ({habit.unit})
                  </p>
                </div>
                {remaining > 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="Add"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const increment = parseInt((e.target as HTMLInputElement).value);
                          if (!isNaN(increment) && increment > 0) {
                            updateProgress(habit.id, increment);
                            (e.target as HTMLInputElement).value = ""; // Clear input
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => updateProgress(habit.id, 1)}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      +1
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}