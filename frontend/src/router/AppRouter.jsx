import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "../pages/Home.jsx";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
            </Routes>
        </BrowserRouter>
    );
} 