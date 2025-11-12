import { Link } from "react-router-dom";
const MobileNavbar = () => {
  return (
    <nav className="user-mobile-navbar-wrapper">
      <div className="user-mobile-navbar-container">
        <div className="user-mobile-navbar-upper-section-container">
          <Link to="/app/profile">
            <div className="user-mobile-navbar-upper-section">
              <img src="../avatar1.png" alt="User Icon" />
            </div>
          </Link>
          <h1>Cześć Andrzej! 👋</h1>
          <div className="user-mobile-navbar-upper-section-stats-container">
            <div className="user-mobile-navbar-upper-section-stat">
              <div>5🔥</div>
            </div>
            <div className="user-mobile-navbar-upper-section-stat">
              <div>24🪙</div>
            </div>
          </div>
        </div>
        {/* <Link to="/app/home">Start</Link> */}
        <div className="user-mobile-navbar-lower-section-container">
          <div>
            <Link to="/app/missions">
              <div className="user-mobile-navbar-lower-section-sm-opt user-mobile-navbar-daily-missions">
                <img src="../daily-missions.png"></img>
              </div>
            </Link>
          </div>
          <div className="user-mobile-navbar-lower-section-lg-opt-wrapper">
            <Link to="/app/daily-goal">
              <div className="user-mobile-navbar-lower-section-lg-opt">
                <span>Dzienny cel</span>
                <progress max="100" value="70"></progress>
              </div>
            </Link>
          </div>
          <div>
            <Link to="/app/shop">
              <div className="user-mobile-navbar-lower-section-sm-opt user-mobile-navbar-store">
                <img src="../store.png"></img>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default MobileNavbar;
