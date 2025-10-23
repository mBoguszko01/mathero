import "../styles/Home.css";
const Home = () => {
  return (
    <>
      <div className="home-upper-container">
        <img
          src="/heroPageImg.png"
          alt="MATHero Illustration"
          className="hero-img"
        />
        <div className="home-upper-text-container">
          <p className="home-upper-text-l">Poznaj świat matematyki!</p>
          <p className="home-upper-text-sm">Dołącz do nas i stań się</p>
          <h1>MATHero</h1>
        </div>

        <div className="home-buttons-container">
          <button className="home-btn home-signup-btn">Zarejestruj się</button>
          <button className="home-btn home-signin-btn">Zaloguj się</button>
        </div>
      </div>
      <div className="home-lower-container">
        <h3>Nauka i zabawa jednocześnie?</h3>
        <p>Z nami to możliwe!</p>
        <p>
          MATHero to interaktywna platforma do nauki matematyki, która łączy
          codzienny trening umysłu z mechanizmami znanymi z gier. Rozwiązuj
          zadania, zdobywaj punkty i odznaki, odblokowuj nowe poziomy i śledź
          swoje postępy w przyjazny i nowoczesny sposób.
        </p>
        <h3>Dlaczego warto dołączyć?</h3>
        <p>✅ Zadania matematyczne dopasowane do poziomu szkoły podstawowej</p>
        <p>🎮 Elementy grywalizacji, które zwiększają motywację do nauki</p>
        <p>📈 System punktów, poziomów i osiągnięć – jak w grze!</p>
        <p>📊 Statystyki postępów – widzisz, jak rośniesz w siłę</p>
        <p>🏆 Odznaki i nagrody za regularność i dobre wyniki</p>
        <p>🔐 Prosty i bezpieczny interfejs stworzony z myślą o dzieciach</p>
      </div>
    </>
  );
};
export default Home;
