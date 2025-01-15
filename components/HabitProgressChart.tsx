import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface HabitProgressChartProps {
  name: string;
  progress: number;
  goal: number;
  unit: string; // Add a new unit prop
}

export default function HabitProgressChart({ name, progress, goal, unit }: HabitProgressChartProps) {
  const data = {
    labels: ["Progress", "Goal"],
    datasets: [
      {
        label: `${name} (${unit})`, // Add units to the dataset label
        data: [progress, goal],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(153, 102, 255, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows chart to adapt to container dimensions
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${name} Progress`,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            // Customize tooltip label to include units
            const value = context.raw;
            return `${context.dataset.label}: ${value} ${unit}`;
          },
        },
      },
    },
    layout: {
      padding: 10, // Adds padding to prevent clipping
    },
  };

  return (
    <div className="relative w-full sm:w-3/4 md:w-1/2 lg:w-1/3 max-w-lg mx-auto h-64 p-4">
      {/* Responsive wrapper for the chart */}
      <Bar data={data} options={options} />
    </div>
  );
}