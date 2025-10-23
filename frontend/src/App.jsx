import { useEffect, useState } from "react";
import { AppRouter } from "./router/AppRouter";
import Footer from "./components/layout/Footer";
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
      <main>
        <AppRouter />
      </main>
      <p>{ping ? `Server says: ${ping}` : "Pinging server..."}</p>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
