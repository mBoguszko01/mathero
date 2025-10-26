import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "../pages/Home.jsx";
import Signup from "../pages/Signup.jsx";
import Signin from "../pages/Signin.jsx";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/signup" element={<Signup />}/>
                <Route path="/signin" element={<Signin />}/>
            </Routes>
        </BrowserRouter>
    );
} 