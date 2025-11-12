import "../../styles/Footer.css";
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer>
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
