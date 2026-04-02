import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import "../styles/Profile.css";
import WeeklyTasksChart from "../components/WeeklyTasksChart/WeeklyTasksChart.jsx";
import SetAvatarModal from "../components/SetAvatarModal/SetAvatarModal.jsx";

const Profile = () => {
  const user = useSelector((state) => state.user.data);
  const [showSetAvatarModal, setShowSetAvatarModel] = useState(false);
  const level = user?.level ?? 1;
  const exp = user?.exp ?? 0;
  const expToNextLevel = level * 100;
  const expPerBar = expToNextLevel / 4;
  const progressPercent = Math.min((exp / expToNextLevel) * 100, 100);
  const avatar = user?.avatar || "/avatar1.png";
  const username = user?.username || "MATHero";

  const generateProgressBars = () => {
    const bars = [];
    let remainingExp = exp;

    for (let i = 0; i < 4; i++) {
      const barValue = Math.min(remainingExp, expPerBar);
      bars.push(
        <progress
          key={i}
          max={expPerBar}
          value={barValue}
          aria-hidden="true"
        />,
      );
      remainingExp -= barValue;
    }

    return bars;
  };

  const stats = [
    {
      label: "Aktualna seria",
      value: user?.streak_days ?? 0,
      suffix: "🔥",
    },
    {
      label: "Najlepsza seria",
      value: user?.highest_streak ?? 0,
      suffix: "🔥",
    },
    {
      label: "Zadania dzisiaj",
      value: user?.today_tasks_solved ?? 0,
      suffix: "☀️",
    },
    {
      label: "Rekord dzienny",
      value: user?.best_daily_tasks_solved ?? 0,
      suffix: "👑",
    },
    {
      label: "Wszystkich rozwiązanych zadań",
      value: user?.total_tasks_solved ?? 0,
      suffix: "🧠",
    },
  ];

  return (
    <>
    {showSetAvatarModal && <SetAvatarModal closeModalHandler={closeModal} />}
      <div className="profile-page">
        <div className="profile-hero-card">
          <div className="profile-hero-main">
            <div className="profile-avatar-shell" onClick={openModal}>
              <img src={avatar} alt={`Awatar użytkownika ${username}`} />
            </div>
            <div className="profile-hero-copy">
              <p className="profile-overline">Profil gracza</p>
              <h1>{username}</h1>
              <p className="profile-subtitle">
                Poziom {level} i {exp} XP zdobyte w matematycznej przygodzie.
              </p>
            </div>
          </div>

          <div className="profile-level-card">
            <div className="profile-level-card-heading">
              <span>Postęp do kolejnego poziomu</span>
              <strong>{Math.round(progressPercent)}%</strong>
            </div>
            <div className="profile-level-bars">{generateProgressBars()}</div>
            <div className="profile-level-card-footer">
              <span>
                {exp}/{expToNextLevel} XP
              </span>
              <span>Lv. {level}</span>
            </div>
          </div>
        </div>
        <div className="profile-section">
          <div className="profile-section-heading">
            <h2>Wyróżnione odznaki</h2>
            <div className="profile-badges-grid">
              {user.highlighted_badges.map((badge) => {
                return (
                  <div className="profile-badges-card ">
                    <img
                      className={`profile-badges-card-${badge.rarity}`}
                      src={`${badge.icon_url}`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="profile-link-wrapper">
              <Link to="/app/badges" className="profile-quick-link">
                Ustaw wyróżnione odznaki
              </Link>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-heading">
            <h2>Twoje statystyki</h2>
            <p>Najważniejsze liczby związane z Twoją aktywnością w MATHero.</p>
          </div>

          <div className="profile-stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className={"profile-stat-card"}>
                <span className="profile-stat-label">{stat.label}</span>
                <strong className="profile-stat-value">
                  {stat.value}
                  {stat.suffix && <span>{stat.suffix}</span>}
                </strong>
              </div>
            ))}
          </div>
          <WeeklyTasksChart data={user.last_7_days_tasks} />
          <div className="profile-link-wrapper">
            <Link to="/app/statistics" className="profile-quick-link">
              Pokaż więcej statystyk
            </Link>
          </div>
        </div>
      </div>
    </>
  );
  //utils
  function openModal() {
    setShowSetAvatarModel(true);
  }
  function closeModal() {
    setShowSetAvatarModel(false);
  }
};

export default Profile;
