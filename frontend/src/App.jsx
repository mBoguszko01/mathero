import { useEffect, useState } from "react";
import { AppRouter } from "./router/AppRouter";
import Footer from "./components/layout/Footer";
import GlobalWarning from "./components/GlobalWarning";
function App() {
  const [ping, setPing] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/ping`)
      .then((res) => res.json())
      .then((data) => setPing(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="AppContiner">
      <header>{!ping && <GlobalWarning />}</header>
      <main>
        <AppRouter />
      </main>
      <p>{ping ? `Server says: ${ping}` : "Pinging server..."}</p>
      <Footer /> 
    </div>
  );
}

export default App;
