//jedyna strona vibecoded
import { useEffect, useMemo, useState } from "react";
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

function formatDayLabel(dateString, range) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "";

  if (range === "90") {
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
    });
  }

  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function getChartColors(length) {
  const palette = [
    "#6C63FF",
    "#FFB84D",
    "#4DD4AC",
    "#FF6B6B",
    "#5AA9FF",
    "#A66CFF",
    "#FFD93D",
  ];

  return Array.from({ length }, (_, index) => palette[index % palette.length]);
}

function SummaryCard({ title, value, subtitle }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
      {subtitle ? <div style={styles.cardSubtitle}>{subtitle}</div> : null}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 style={styles.sectionTitle}>{children}</h2>;
}

function EmptyBox({ text }) {
  return <div style={styles.emptyBox}>{text}</div>;
}

function DifficultyBar({ label, accuracy, attempts }) {
  return (
    <div style={styles.difficultyRow}>
      <div style={styles.difficultyHeader}>
        <span style={styles.difficultyLabel}>{label}</span>
        <span style={styles.difficultyMeta}>
          {formatPercent(accuracy)} · {attempts} prób
        </span>
      </div>
      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${Math.max(0, Math.min(100, Number(accuracy || 0)))}%`,
          }}
        />
      </div>
    </div>
  );
}

function StatList({ items, emptyText }) {
  if (!items?.length) {
    return <EmptyBox text={emptyText} />;
  }

  return (
    <div style={styles.listWrapper}>
      {items.map((item) => (
        <div key={item.subcategory_id} style={styles.listItem}>
          <div>
            <div style={styles.listItemTitle}>{item.subcategory_name}</div>
            <div style={styles.listItemSubtitle}>{item.category_name}</div>
          </div>
          <div style={styles.listItemRight}>
            <div style={styles.listItemAccuracy}>
              {formatPercent(item.accuracy)}
            </div>
            <div style={styles.listItemAttempts}>{item.attempts} prób</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Statistics() {
  const [statistics, setStatistics] = useState(null);
  const [chartRange, setChartRange] = useState("7");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(`${
        import.meta.env.VITE_API_URL
      }/api/statistics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Nie udało się pobrać statystyk");
        }

        setStatistics(data.data);
      } catch (err) {
        setError(err.message || "Wystąpił błąd");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const chartSource = useMemo(() => {
    if (!statistics?.activity_chart) return [];

    if (chartRange === "30")
      return statistics.activity_chart.last_30_days || [];
    if (chartRange === "90")
      return statistics.activity_chart.last_90_days || [];
    return statistics.activity_chart.last_7_days || [];
  }, [statistics, chartRange]);

  const chartData = useMemo(() => {
    const labels = chartSource.map((item) =>
      formatDayLabel(item.date, chartRange),
    );
    const values = chartSource.map((item) => Number(item.tasks_solved) || 0);

    return {
      labels,
      datasets: [
        {
          label: "Liczba zadań",
          data: values,
          backgroundColor: getChartColors(values.length),
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: chartRange === "90" ? 12 : 28,
        },
      ],
    };
  }, [chartSource, chartRange]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              const index = tooltipItems[0]?.dataIndex ?? 0;
              return chartSource[index]?.date || "";
            },
            label: (context) => `Zadania: ${context.raw}`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit:
              chartRange === "90" ? 12 : chartRange === "30" ? 10 : 7,
            color: "#667085",
            font: {
              size: 12,
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "#EEF2F6",
          },
          ticks: {
            stepSize: 1,
            precision: 0,
            color: "#667085",
          },
        },
      },
    };
  }, [chartSource, chartRange]);

  if (loading) {
    return (
      <div>
        <div style={styles.infoBox}>Ładowanie statystyk...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>{error}</div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div style={styles.page}>
        <div style={styles.infoBox}>Brak danych do wyświetlenia.</div>
      </div>
    );
  }

  const { summary, difficulty_stats, category_stats, subcategory_stats } =
    statistics;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Statystyki</h1>
          <p style={styles.subtitle}>
            Tu zobaczysz bardziej szczegółowy obraz postępów użytkownika.
          </p>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <SummaryCard
          title="Łącznie zadań"
          value={summary.total_tasks_solved}
          subtitle="Wszystkie rozwiązane zadania"
        />
        <SummaryCard
          title="Łącznie prób"
          value={summary.total_attempts}
          subtitle="Wszystkie podejścia"
        />
        <SummaryCard
          title="Skuteczność"
          value={formatPercent(summary.accuracy)}
          subtitle={`${summary.correct_attempts} poprawnych / ${summary.incorrect_attempts} błędnych`}
        />
        <SummaryCard
          title="Najlepszy streak"
          value={summary.highest_streak}
          subtitle={`Obecny streak: ${summary.current_streak}`}
        />
        <SummaryCard
          title="Najlepszy dzień"
          value={summary.best_daily_tasks_solved}
          subtitle={
            summary.best_day?.date
              ? `Data: ${summary.best_day.date}`
              : "Brak danych"
          }
        />
      </div>

      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <SectionTitle>Aktywność użytkownika</SectionTitle>

          <div style={styles.toggleGroup}>
            <button
              type="button"
              onClick={() => setChartRange("7")}
              style={{
                ...styles.toggleButton,
                ...(chartRange === "7" ? styles.toggleButtonActive : {}),
              }}
            >
              7 dni
            </button>
            <button
              type="button"
              onClick={() => setChartRange("30")}
              style={{
                ...styles.toggleButton,
                ...(chartRange === "30" ? styles.toggleButtonActive : {}),
              }}
            >
              30 dni
            </button>
            <button
              type="button"
              onClick={() => setChartRange("90")}
              style={{
                ...styles.toggleButton,
                ...(chartRange === "90" ? styles.toggleButtonActive : {}),
              }}
            >
              90 dni
            </button>
          </div>
        </div>

        <div style={styles.chartWrapper}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      <div style={styles.twoColumnGrid}>
        <div style={styles.sectionCard}>
          <SectionTitle>Mocne strony</SectionTitle>
          <StatList
            items={subcategory_stats?.strongest || []}
            emptyText="Za mało danych, żeby wyznaczyć najmocniejsze obszary."
          />
        </div>

        <div style={styles.sectionCard}>
          <SectionTitle>Do poćwiczenia</SectionTitle>
          <StatList
            items={subcategory_stats?.weakest || []}
            emptyText="Za mało danych, żeby wyznaczyć obszary do poprawy."
          />
        </div>
      </div>

      <div style={styles.sectionCard}>
        <SectionTitle>Skuteczność wg poziomu trudności</SectionTitle>

        {!difficulty_stats?.length ? (
          <EmptyBox text="Brak danych o poziomach trudności." />
        ) : (
          <div style={styles.difficultyList}>
            {difficulty_stats.map((item) => (
              <DifficultyBar
                key={item.difficulty_level}
                label={`Poziom ${item.difficulty_level}`}
                accuracy={item.accuracy}
                attempts={item.attempts}
              />
            ))}
          </div>
        )}
      </div>

      <div style={styles.sectionCard}>
        <SectionTitle>Kategorie</SectionTitle>

        {!category_stats?.length ? (
          <EmptyBox text="Brak danych o kategoriach." />
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Kategoria</th>
                  <th style={styles.th}>Próby</th>
                  <th style={styles.th}>Poprawne</th>
                  <th style={styles.th}>Błędne</th>
                  <th style={styles.th}>Skuteczność</th>
                </tr>
              </thead>
              <tbody>
                {category_stats.map((item) => (
                  <tr key={item.category_id}>
                    <td style={styles.tdStrong}>{item.category_name}</td>
                    <td style={styles.td}>{item.attempts}</td>
                    <td style={styles.td}>{item.correct_attempts}</td>
                    <td style={styles.td}>{item.incorrect_attempts}</td>
                    <td style={styles.td}>{formatPercent(item.accuracy)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 800,
    color: "#101828",
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#667085",
    fontSize: "15px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 6px 24px rgba(16, 24, 40, 0.06)",
    border: "1px solid #EEF2F6",
  },
  cardTitle: {
    color: "#667085",
    fontSize: "14px",
    marginBottom: "10px",
  },
  cardValue: {
    color: "#101828",
    fontSize: "30px",
    fontWeight: 800,
    lineHeight: 1.1,
  },
  cardSubtitle: {
    marginTop: "8px",
    color: "#98A2B3",
    fontSize: "13px",
  },
  sectionCard: {
    background: "#FFFFFF",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 6px 24px rgba(16, 24, 40, 0.06)",
    border: "1px solid #EEF2F6",
    marginBottom: "24px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#101828",
  },
  toggleGroup: {
    display: "flex",
    gap: "8px",
    background: "#F2F4F7",
    padding: "6px",
    borderRadius: "14px",
  },
  toggleButton: {
    border: "none",
    background: "transparent",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    color: "#667085",
  },
  toggleButtonActive: {
    background: "#FFFFFF",
    color: "#101828",
    boxShadow: "0 2px 10px rgba(16, 24, 40, 0.08)",
  },
  chartWrapper: {
    width: "100%",
    height: "360px",
  },
  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
    marginBottom: "0px",
  },
  listWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "#F8FAFC",
    border: "1px solid #EEF2F6",
  },
  listItemTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#101828",
  },
  listItemSubtitle: {
    marginTop: "4px",
    color: "#667085",
    fontSize: "13px",
  },
  listItemRight: {
    textAlign: "right",
    minWidth: "90px",
  },
  listItemAccuracy: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#101828",
  },
  listItemAttempts: {
    marginTop: "4px",
    fontSize: "12px",
    color: "#667085",
  },
  difficultyList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  difficultyRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  difficultyHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  difficultyLabel: {
    fontWeight: 700,
    color: "#101828",
  },
  difficultyMeta: {
    color: "#667085",
    fontSize: "14px",
  },
  progressTrack: {
    width: "100%",
    height: "12px",
    background: "#EEF2F6",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #6C63FF 0%, #4DD4AC 100%)",
    borderRadius: "999px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 8px",
    fontSize: "13px",
    color: "#667085",
    borderBottom: "1px solid #EEF2F6",
    fontWeight: 700,
  },
  td: {
    padding: "14px 8px",
    borderBottom: "1px solid #F2F4F7",
    color: "#475467",
    fontSize: "14px",
  },
  tdStrong: {
    padding: "14px 8px",
    borderBottom: "1px solid #F2F4F7",
    color: "#101828",
    fontSize: "14px",
    fontWeight: 700,
  },
  emptyBox: {
    padding: "20px",
    borderRadius: "16px",
    background: "#F8FAFC",
    border: "1px dashed #D0D5DD",
    color: "#667085",
  },
  infoBox: {
    background: "#FFFFFF",
    borderRadius: "20px",
    padding: "24px",
    color: "#344054",
    boxShadow: "0 6px 24px rgba(16, 24, 40, 0.06)",
  },
  errorBox: {
    background: "#FEF3F2",
    color: "#B42318",
    border: "1px solid #FECDCA",
    borderRadius: "20px",
    padding: "24px",
  },
};
