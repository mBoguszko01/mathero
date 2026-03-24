import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function formatDayLabel(dateString) {
  const [year, month, day] = dateString.split("-");
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("pl-PL", { weekday: "short" });
}

export default function WeeklyTasksChart({ data = [] }) {
  const labels = data.map((item) => formatDayLabel(item.date));
  const values = data.map((item) => Number(item.tasks_solved) || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Liczba zadań",
        data: values,
        borderWidth: 1,
        borderRadius: 8,
         backgroundColor: [
          "#FF6B6B",
          "#FFD93D",
          "#6BCB77",
          "#4D96FF",
          "#845EC2",
          "#FF9671",
          "#00C9A7",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return data[index]?.date || "";
          },
          label: (context) => `Zadania: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        height: 320,
        background: "#fff",
        borderRadius: "16px",
        padding: "16px",
        paddingBottom: "60px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>
        Zadania z ostatnich 7 dni
      </h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}
