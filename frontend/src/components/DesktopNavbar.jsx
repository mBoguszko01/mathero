import { Link, useLocation } from "react-router-dom";
const DesktopNavbar = () => {
  const location = useLocation().pathname;
  console.log(location);
  return (
    <nav className="user-desktop-navbar-wrapper">
      <div className="user-desktop-navbar-container">
        <Link
          to="/app/home"
          className={
            location === "/app/home"
              ? "user-desktop-navbar-btn user-desktop-navbar-btn-active"
              : "user-desktop-navbar-btn"
          }
        >
          <img src="../house.png"></img>
          Strona główna
        </Link>
        <Link
          to="/app/missions"
          className={
            location === "/app/missions"
              ? "user-desktop-navbar-btn user-desktop-navbar-btn-active"
              : "user-desktop-navbar-btn"
          }
        >
          <img src="../daily-missions.png"></img>
          Codzienne misje
        </Link>
        <Link
          to="/app/daily-goal"
          className={
            location === "/app/daily-goal"
              ? "user-desktop-navbar-btn user-desktop-navbar-btn-active"
              : "user-desktop-navbar-btn"
          }
        >
          <img src="../day-mode.png"></img>
          Dzienny cel
        </Link>
        <Link
          to="/app/shop"
          className={
            location === "/app/shop"
              ? "user-desktop-navbar-btn user-desktop-navbar-btn-active"
              : "user-desktop-navbar-btn"
          }
        >
          <img src="../store.png"></img>
          Sklep
        </Link>
        <div className="user-desktop-navbar-coins-streaks-container">
          <div>5🔥</div>
          <div>24🪙</div>
        </div>

        <Link to="/app/profile" tabIndex={-1}>
          <img
            src="../avatar1.png"
            className="user-desktop-navbar-profile-pic"
          />
        </Link>
      </div>
    </nav>
  );
};
export default DesktopNavbar;
