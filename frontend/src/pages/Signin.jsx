import { useState } from "react";
import { Link } from "react-router";
import "../styles/Signin.css";
import {userApi} from "../api/userApi";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.email === "" || formData.password === "") {
      setMessage("Proszę wypełnić wszystkie pola.");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage("Nieprawidłowy format email.");
    };
    try {
      setMessage("");

      const res = await userApi.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if(res.requiresStep2){
        sessionStorage.setItem("signupName", res.name);
        sessionStorage.setItem("tempToken", res.tempToken);
        navigate("/signup/details");
        return;
      }

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      navigate("/app/home");

    }catch (error) {
      console.error("Błąd podczas logowania:", error);
      setMessage(error.response.data.message || "Wystąpił błąd podczas logowania.");
    }
  };
  return (
    <div className="signin-wrapper">
      <div className="signin-container">
        <h1 className="signin-page-title">Zaloguj się</h1>
        {message && <p>{message}</p>}
        <form className="signin-form" onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <input type="text" name="email" onChange={handleChange} />
          </div>
          <div>
            <label>Hasło</label>
            <input type="password" name="password" onChange={handleChange} />
          </div>
          <Link className="sign-in-reset-password" onClick={()=>{alert("Funkcjonalność niezaimplementowana")}}>Zresetuj hasło</Link>
          <button type="submit" className="signin-btn signin-main-btn">
            Zaloguj się
          </button>
        </form>
        <div style={{display:"flex", flexDirection:"column"}}>
          <Link to="/">
            <button className="signin-btn signin-second-btn">Wstecz</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Signin;
