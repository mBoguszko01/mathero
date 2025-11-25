import { Outlet } from "react-router";
import { Link, useLocation } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import "../styles/AppLayout.css";
export default function AppLayout() {
  const location = useLocation().pathname;
  return (
    <div className="app-layout">
      <div className="mobile-frame">
        <UserNavbar />
        <div className="app-layout-content">
          {location !== "/app/home" && (
            <Link to="/app/home" className="app-layout-logo">
              Strona główna
            </Link>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
