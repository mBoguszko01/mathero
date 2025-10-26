import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "../pages/Home.jsx";
import Signup from "../pages/Signup.jsx";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/signup" element={<Signup />}/>
                <Route path="/signin" element={<div>Signin Page</div>}/>
            </Routes>
        </BrowserRouter>
    );
} 