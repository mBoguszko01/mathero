import { useEffect, useState } from "react";

function App() {
  const [ping, setPing] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/ping`)
      .then((res) => res.json())
      .then((data) => setPing(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>MATHero 🧮</h1>
      <p>Połączenie z backendem: <strong>{ping || "Łączenie..."}</strong></p>
    </div>
  );
}

export default App;
