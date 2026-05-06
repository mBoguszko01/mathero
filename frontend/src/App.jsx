import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
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
    <BrowserRouter>
      <div className="AppContiner">
        <header>{!ping && <GlobalWarning />}</header>
        <main>
          <AppRouter />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
