import { useLocation } from "react-router-dom";
import "../../styles/Footer.css";
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/signin" || pathname.startsWith("/signup") || pathname === "/";

  return (
    <footer className={isAuthPage ? "footer--auth-page" : undefined}>
      <div>
        <p>Projekt pracy magisterskiej.</p>
      </div>
      <div className="footer-copyright">
        <p>© MatHero {currentYear}</p>
        <a
          href="https://www.flaticon.com/free-icons/document"
          title="document icons"
        >
          Document icons created by Freepik - Flaticon
        </a>
      </div>
      <div>
        <p>Autor: Michał Boguszko</p>
        <p>Promotor: dr Barbara Gocławska, prof. WSPA</p>
      </div>
    </footer>
  );
}
