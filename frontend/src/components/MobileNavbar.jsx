import { Link, useLocation } from "react-router-dom";
const MobileNavbar = () => {
  const bottomNavSlots = [
    {
      icon: "../house.png",
      location: "/app/home",
      marginTopValue: "6px",
    },
    {
      icon: "../daily-missions.png",
      location: "/app/missions",
      marginTopValue: "8px",
    },
    {
      icon: "../day-mode.png",
      location: "/app/daily-goal",
      marginTopValue: "8px",
    },
    { icon: "../store.png", location: "/app/shop", marginTopValue: "11px" },
    { icon: "../avatar1.png", location: "/app/profile", marginTopValue: "0" },
  ];
  const locations = [
    "/app/statistics",
    "/app/profile",
    "/app/ranking",
    "/app/badges",
  ];

  const location = useLocation().pathname;
  return (
    <>
      <nav
        className="user-mobile-navbar-wrapper-bottom"
        aria-label="Dolny pasek nawigacji"
      >
        <div className="user-mobile-navbar-inner user-mobile-navbar-inner--bottom">
          {bottomNavSlots.map((el, index) => (
            <Link
              to={el.location}
              key={index}
              className="user-mobile-lower-navbar-tab-link"
            >
              <img
                src={el.icon}
                className={
                  (location === el.location ||
                  (location === "/app/lessons-topics" &&
                    el.location === "/app/home") ||
                  (locations.includes(location) && index === 4)
                    ? "user-mobile-lower-navbar-tab-element user-mobile-lower-navbar-tab-element-active"
                    : "user-mobile-lower-navbar-tab-element") +
                  (index === 4
                    ? " user-mobile-lower-navbar-tab-element--profile"
                    : "")
                }
                style={{ marginTop: el.marginTopValue }}
              ></img>
            </Link>
          ))}
          <span>5🔥</span>
          <span>24🪙</span>
        </div>
      </nav>
    </>
  );
};
export default MobileNavbar;
