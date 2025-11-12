import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import Home from "../pages/Home.jsx";
import SignupStep1 from "../pages/SignupStep1.jsx";
import SignupStep2 from "../pages/SignupStep2.jsx";
import Signin from "../pages/Signin.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Missions from "../pages/Missions";
import DailyGoal from "../pages/DailyGoal";
import Shop from "../pages/Shop";
import Profile from "../pages/Profile";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignupStep1 />} />
          <Route path="/signup/details" element={<SignupStep2 />} />
          <Route path="/signin" element={<Signin />} />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/app/home" element={<Dashboard />} />
          <Route path="/app/missions" element={<Missions />} />
          <Route path="/app/daily-goal" element={<DailyGoal />} />
          <Route path="/app/shop" element={<Shop />} />
          <Route path="/app/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
