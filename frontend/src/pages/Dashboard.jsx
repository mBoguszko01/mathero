import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import tips from "../data/learningTips.json" with { type: "json" };
import "../styles/Dashboard.css";
const Dashboard = () => {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  const user = useSelector((state) => state.user.data);
  const generateProgressBars = () => {
    const bars = [];
    const totalBars = 4;
    const expPerBar = (user?.level * 100) / 4;
    let userExp = user?.exp;
    for (let i = 0; i < totalBars; i++) {
      const barValue = Math.min(userExp, expPerBar);
      bars.push(<progress key={i} max={expPerBar} value={barValue}></progress>);
      userExp -= barValue;
    }
    return bars;
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-container-main-panel">
          <Link to="/app/lessons-topics" className="dashboard-btn">
            <img src="../lessons.png" />
            Przejdź do nauki
          </Link>
          <Link to="/app/statistics" className="dashboard-btn">
            <img src="../stats.png" />
            Statystyki
          </Link>
          <Link
            to="/app/profile"
            className="dashboard-btn dashboard-btn-profile"
          >
            <img src={user.avatar} />
            Profil
          </Link>
          <Link to="/app/ranking" className="dashboard-btn">
            <img src="../rank.png" />
            Ranking
          </Link>
          <Link to="/app/badges" className="dashboard-btn">
            <img src="../badges.png" />
            Osiągnięcia
          </Link>
        </div>
        <div className="dashboard-container-sidebar">
          <div className="dashboard-container-sidebar-element dashboard-container-sidebar-exp">
            <span className="dashboard-container-sidebar-exp-lvl">
              Lv. {user?.level}
            </span>
            <div className="dashboard-container-sidebar-exp-details">
              <div className="dashboard-container-sidebar-exp-progressbar-container">
                {generateProgressBars()}
              </div>
              <span>
                {user?.exp}/{user?.level * 100} XP
              </span>
            </div>
          </div>
          <div className="dashboard-container-sidebar-element dashboard-container-sidebar-learning-tip">
            <span className="dashboard-container-sidebar-learning-tip-icon">
              {randomTip.icon}
            </span>
            <span>{randomTip.text}</span>
          </div>

          <div className="dashboard-container-sidebar-element dashboard-container-sidebar-stats">
            <div>
              <span>
                Dziś rozwiązałes już {user?.today_tasks_solved} zadań!
              </span>
              <span>
                Twój rekord wynosi {user?.best_daily_tasks_solved} zadań jednego
                dnia.
              </span>
            </div>
            <hr />
            <div>
              {(user?.streak_days < user?.highest_streak) && user?.streak_days !== 0  && (
                <>
                  <span className="dashboard-container-sidebar-stats-icon">
                    {user?.streak_days}🔥
                  </span>
                  <span>Twoja aktualna seria</span>
                  <span className="dashboard-container-sidebar-stats-icon dashboard-container-sidebar-stats-icon-grey">
                    {user?.highest_streak}🔥
                  </span>
                  <span>Twoja największa seria</span>
                </>
              )}
              {user?.streak_days === user?.highest_streak &&
                user?.streak_days != 0 && (
                  <>
                    <span className="dashboard-container-sidebar-stats-icon">
                      {user?.streak_days}🔥
                    </span>
                    <span>To Twoja rekordowa seria!</span>
                  </>
                )}
              {user?.streak_days === 0 && (
                <>
                  <span
                    className="dashboard-container-sidebar-stats-icon"
                    style={{ filter: "grayscale(1)" }}
                  >
                    {user?.streak_days}🔥
                  </span>
                  <span>
                    Rozwiązuj zadania codziennie i zwiększaj swoją serię!
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
