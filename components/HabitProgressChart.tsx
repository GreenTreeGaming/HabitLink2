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
}

export default function HabitProgressChart({ name, progress, goal }: HabitProgressChartProps) {
  const data = {
    labels: ["Progress", "Goal"],
    datasets: [
      {
        label: name,
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
    },
    layout: {
      padding: 10, // Adds padding to prevent clipping
    },
  };

  return (
    <div className="relative w-full max-w-md h-64">
      {/* Chart is wrapped in a constrained, responsive container */}
      <Bar data={data} options={options} />
    </div>
  );
}