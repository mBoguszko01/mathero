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
      </div>
            <div>
        <p>Autor: Michał Boguszko</p>
        <p>Promotor: dr Barbara Gocławska</p>
      </div>
    </footer>
  );
}
