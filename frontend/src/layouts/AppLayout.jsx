import { Outlet } from "react-router";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData } from "../store/userSlice";
import UserNavbar from "../components/UserNavbar";
import "../styles/AppLayout.css";
export default function AppLayout() {
  const dispatch = useDispatch();
  const [showBetaNotice, setShowBetaNotice] = useState(true);

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
        {showBetaNotice && (
          <div className="beta-notice" role="status">
            <p>
              To jest wersja beta aplikacji. W przypadku wykrycia błędu proszę o przesłanie zgłoszenia na adres e-mail: mic.boguszko@gmail.com
            </p>
            <button
              type="button"
              className="beta-notice-close"
              aria-label="Zamknij komunikat beta"
              onClick={() => setShowBetaNotice(false)}
            >
              x
            </button>
          </div>
        )}
        <div className="app-layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
