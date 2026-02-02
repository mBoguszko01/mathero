import { Outlet } from "react-router";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData } from "../store/userSlice";
import UserNavbar from "../components/UserNavbar";
import "../styles/AppLayout.css";
export default function AppLayout() {
  const location = useLocation().pathname;
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUserData(token));
    }
  }, [dispatch]);
  const user = useSelector((state) => state.user.data);
  if(!user){
    return <div>Pobieranie danych...</div>;
  }
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
