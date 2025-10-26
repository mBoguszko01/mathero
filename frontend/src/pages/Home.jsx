import "../styles/Home.css";
import { Link } from "react-router";

const Home = () => {
  return (
    <>
      <div className="home-upper-container">
        <div className="hero-img-container">
          <img
            src="/heroPageImg.png"
            alt="MATHero Illustration"
            className="hero-img"
          />
        </div>

        <div className="home-upper-text-and-buttons-container">
          <div className="home-upper-text-and-buttons-inner-container">
            <div className="home-upper-text-container">
              <p className="home-upper-text-l">Poznaj świat matematyki!</p>
              <p className="home-upper-text-sm">Dołącz do nas i stań się</p>
              <h1>MATHero</h1>
            </div>

            <div className="home-buttons-container">
              <Link to="/signup">
                <button className="home-btn home-signup-btn">
                  Zarejestruj się
                </button>
              </Link>
              <Link to="/signin">
                <button className="home-btn home-signin-btn">
                  Zaloguj się
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="home-lower-container">
        <div className="home-lower-text-block-container">
          <h3>Nauka i zabawa jednocześnie?</h3>
          <p>Z nami to możliwe!</p>
          <p>
            MATHero to interaktywna platforma do nauki matematyki, która łączy
            codzienny trening umysłu z mechanizmami znanymi z gier. Rozwiązuj
            zadania, zdobywaj punkty i odznaki, odblokowuj nowe poziomy i śledź
            swoje postępy w przyjazny i nowoczesny sposób.
          </p>
        </div>
        <div className="home-lower-text-block-container">
          <h3>Dlaczego warto dołączyć?</h3>
          <p>
            ✅ Zadania matematyczne dopasowane do poziomu szkoły podstawowej
          </p>
          <p>🎮 Elementy grywalizacji, które zwiększają motywację do nauki</p>
          <p>📈 System punktów, poziomów i osiągnięć – jak w grze!</p>
          <p>📊 Statystyki postępów – widzisz, jak rośniesz w siłę</p>
          <p>🏆 Odznaki i nagrody za regularność i dobre wyniki</p>
          <p>🔐 Prosty i bezpieczny interfejs stworzony z myślą o dzieciach</p>
        </div>
      </div>
    </>
  );
};
export default Home;
