import { Outlet } from "react-router";
import UserNavbar from "../components/UserNavbar";
import "../styles/AppLayout.css";
export default function AppLayout() {
  return (
    <div className="app-layout">
      <UserNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}