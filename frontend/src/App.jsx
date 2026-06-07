import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./router/AppRouter";
import Footer from "./components/layout/Footer";

function App() {
  return (
    <BrowserRouter>
      <div className="AppContiner">
        <main>
          <AppRouter />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
