import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { userApi } from "../api/userApi";
import Info from "../components/Info.jsx";

const SignupStep2 = () => {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: "" });
    if (name === "username") setUsername(value);
  };

  useEffect(() => {
    const storedName = sessionStorage.getItem("signupName");
    const tempToken = sessionStorage.getItem("tempToken");

    if (!storedName || !tempToken) {
      navigate("/signup");
      return;
    }

    setName(storedName);
    const avatarList = Array.from(
      { length: 10 },
      (_, i) => `/avatar${i + 1}.png`
    );
    setAvatars(avatarList);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tempToken = sessionStorage.getItem("tempToken");

    if (!username || !selectedAvatar) {
      !username &&
        setErrors((prev) => ({
          ...prev,
          username: "Nazwa użytkownika jest wymagana.",
        }));
      !selectedAvatar &&
        setErrors((prev) => ({
          ...prev,
          avatar: "Należy wybrać awatar.",
        }));
      return;
    }

    try {
      await userApi.registerStep2(
        { username, avatar: selectedAvatar },
        tempToken
      );

      sessionStorage.removeItem("signupName");
      sessionStorage.removeItem("tempToken");

      navigate("/signin");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
        setErrors((prev) => ({
          ...prev,
          username:
            err.response.data.message || "Wystąpił błąd podczas rejestracji.",
        }));
      } else if (
        err.response?.status === 401 &&
        err.response.data?.expired === true
      ) {
        setErrors((prev) => ({
          ...prev,
          session: (
            <>
              Twoja sesja wygasła.
              Aby dokończyć proces rejestracji, prosimy o ponowne <a href="/signin" style={{ color: "#a82c1f" }}>
                zalogowanie się
              </a>.
            </>
          ),
        }));
        // sessionStorage.removeItem("signupName");
        // sessionStorage.removeItem("tempToken");
        // navigate("/signup");
        //
        //
        //
        return;
      } else {
        alert(
          "Wystąpił błąd podczas rejestracji. Skontaktuj się z administratorem."
        );
      }
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <h1 className="signup-page-title">{`Cześć ${name}!👋`}</h1>
        <p>Cieszymy się że do nas dołączasz.</p>
        <p>
          Zanim przejdziemy dalej, każdy Mathero musi posiadać swoją nazwę{" "}
          <b>Super bohatera!</b>
        </p>
        {errors.session && <Info message={errors.session} type="warning" />}
        <form className="signup-form" onSubmit={handleSubmit}>
          <label>Nazwa użytkownika</label>
          {errors.username && (
            <span className="error-message">{errors.username}</span>
          )}
          <input
            type="text"
            name="username"
            value={username}
            onChange={handleChange}
            className={errors.username && "input-error"}
            autoComplete="off"
          />
          <div className="signup-avatar-select">
            <p>Wybierz swój awatar:</p>
            {errors.avatar && (
              <span className="error-message">{errors.avatar}</span>
            )}
            <div className="signup-avatar-grid">
              {avatars.map((avatar, index) => (
                <button
                  type="button"
                  className={`signup-avatar-option ${
                    selectedAvatar === avatar ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => {
                    setSelectedAvatar(avatar);
                  }}
                  aria-pressed={selectedAvatar === avatar}
                >
                  <img
                    src={avatar}
                    alt={`avatar${index + 1}`}
                    draggable="false"
                  />
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="signup-btn signup-main-btn">
            Zakończ rejestrację
          </button>
        </form>
      </div>
    </div>
  );
};
export default SignupStep2;
