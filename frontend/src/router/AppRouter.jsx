import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "../pages/Home.jsx";
import SignupStep1 from "../pages/SignupStep1.jsx";
import SignupStep2 from "../pages/SignupStep2.jsx";
import Signin from "../pages/Signin.jsx";
import Dashboard from "../pages/Dashboard.jsx";
export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/signup" element={<SignupStep1 />}/>
                <Route path="/signup/details" element={<SignupStep2 />}/>
                <Route path="/signin" element={<Signin />}/>
                <Route path="/dashboard" element={<Dashboard />}/>
            </Routes>
        </BrowserRouter>
    );
} 