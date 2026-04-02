import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
const MobileNavbar = ({ streak, money }) => {
  const user = useSelector((state) => state.user.data);
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
    { icon: user.avatar, location: "/app/profile", marginTopValue: "0" },
  ];

  const classNameValue = "user-mobile-lower-navbar-tab-element";
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
                  index === 4
                    ? classNameValue +
                      " user-mobile-lower-navbar-tab-element--profile"
                    : classNameValue
                }
                style={{ marginTop: el.marginTopValue }}
              ></img>
            </Link>
          ))}
          <span>{streak}🔥</span>
          <span>{money}🪙</span>
        </div>
      </nav>
    </>
  );
};
export default MobileNavbar;
