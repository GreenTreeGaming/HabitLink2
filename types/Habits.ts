export interface Habit {
  id: string; // Unique identifier
  name: string; // Habit name
  goal: number; // Goal in number
  frequency: string; // Frequency of the habit (e.g., "daily", "weekly", "monthly")
  unit: string; // Unit of the goal (e.g., "miles", "hours")
  progress: number; // Progress towards the goal
  userId: string; // ID of the user who owns the habit
  createdAt: Date; // Date when the habit was created
  reminderTime: string; // ISO string representing the reminder time
  completed: boolean; // Whether the habit is completed or not
}