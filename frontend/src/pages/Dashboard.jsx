import { Link } from "react-router-dom";
import tips from '../data/learningTips.json' with { type: 'json' };
import "../styles/Dashboard.css";
const Dashboard = () => {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
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
            <img src="../avatar1.png" />
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
            <span className="dashboard-container-sidebar-exp-lvl">Lv. 12</span>
            <div className="dashboard-container-sidebar-exp-details">
              <div className="dashboard-container-sidebar-exp-progressbar-container">
                <progress max="25" value="25"></progress>
                <progress max="25" value="25"></progress>
                <progress max="25" value="20"></progress>
                <progress max="25" value="0"></progress>
              </div>
              <span>70/100 XP</span>
            </div>
          </div>
          <div className="dashboard-container-sidebar-element dashboard-container-sidebar-learning-tip">
            <span className="dashboard-container-sidebar-learning-tip-icon">{randomTip.icon}</span>
            <span>{randomTip.text}</span>
          </div>
          <div className="dashboard-container-sidebar-element dashboard-container-sidebar-quick-menu">
            <span>Ostatnio rozwiązywałeś zadania z działu</span>
            <span>Dodawanie poziom: łatwy - klasa 3</span>
            <button>Przejdź do zadań</button>
          </div>
          <div className="dashboard-container-sidebar-element dashboard-container-sidebar-stats">
            <div>
              <span>Dziś rozwiązałes już 15 zadań!</span>
              <span>Twój rekord wynosi 47 zadań jednego dnia.</span>
            </div>
            <hr />
            <div>
              <span className="dashboard-container-sidebar-stats-icon">5🔥</span>
              <span>Twoja aktualna seria</span>
              <span className="dashboard-container-sidebar-stats-icon dashboard-container-sidebar-stats-icon-grey">21🔥</span>
              <span>Twoja największa seria</span>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
