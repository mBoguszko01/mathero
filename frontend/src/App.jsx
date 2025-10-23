import { useEffect, useState } from "react";
import { AppRouter } from "./router/AppRouter";
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
      <footer>
        <p>{ping ? `Server says: ${ping}` : "Pinging server..."}</p>
      </footer>
    </div>
  );
}

export default App;
