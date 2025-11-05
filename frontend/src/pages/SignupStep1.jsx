import { useState } from "react";
import "../styles/Signup.css";
import { Link } from "react-router";
import { userApi } from "../api/userApi.js";
import Info from "../components/Info.jsx";
import { useNavigate } from "react-router";

const SignupStep1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
  });
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const [message, setMessage] = useState("");
  const [responseCode, setResponseCode] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!formData.name) {
      validationErrors["name"] = "Imię jest wymagane.";
    }
    if (!formData.email) {
      validationErrors["email"] = "Email jest wymagany.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors["email"] = "Nieprawidłowy format email.";
    }
    if (!formData.password) {
      validationErrors["password"] = "Hasło jest wymagane.";
    } else if (formData.password !== formData.confirmPassword) {
      validationErrors["password"] = "Hasła nie są zgodne.";
    }
    if (!formData.birthDate) {
      validationErrors["birthDate"] = "Data urodzenia jest wymagana.";
    }
    if (Object.keys(validationErrors).length === 0) {
      setErrors({});
    } else {
      setErrors({ ...validationErrors });
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await userApi.registerStep1({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        birthDate: formData.birthDate,
      });
      sessionStorage.setItem("tempToken", res.tempToken);
      sessionStorage.setItem("signupName", formData.name);
      navigate("/signup/details");
      
    } catch (err) {
      setResponseCode(err.response.status);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Wystąpił błąd podczas rejestracji.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <h1 className="signup-page-title">Zarejestruj się</h1>
        {message && (
          <Info message={message} code={responseCode}/>
        )}
        <form className="signup-form" onSubmit={handleSubmit}>
          <div>
            <label>Imię</label>
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
            <input
              type="text"
              name="name"
              onChange={handleChange}
              className={errors.name && "input-error"}
            />
          </div>
          <div>
            <label>Email</label>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
            <input
              type="text"
              name="email"
              onChange={handleChange}
              className={errors.email && "input-error"}
            />
          </div>
          <div>
            <label>Hasło</label>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            <input
              type="password"
              name="password"
              onChange={handleChange}
              className={errors.password && "input-error"}
            />
          </div>
          <div>
            <label>Powtórz hasło</label>
            <input
              type="password"
              name="confirmPassword"
              onChange={handleChange}
              className={errors.password && "input-error"}
            />
          </div>
          <div>
            <label>Podaj datę urodzenia</label>
            <input
              type="date"
              name="birthDate"
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className={errors.birthDate && "input-error"}
            />
          </div>
          <button type="submit" className="signup-btn signup-main-btn">
            Stwórz swoje konto
          </button>

          <Link to="/">
            <button className="signup-btn signup-second-btn">Wstecz</button>
          </Link>
        </form>
      </div>
    </div>
  );
};
export default SignupStep1;
