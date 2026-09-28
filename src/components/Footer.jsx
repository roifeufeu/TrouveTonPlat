function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>TrouveTonPlat</h2>

          <p>Trouvez facilement une recette adaptée à vos envies.</p>
        </div>

        <div className="footer-links">
          <a
            href="https://spoonacular.com/food-api"
            target="_blank"
            rel="noopener noreferrer"
          >
            Recettes fournies par Spoonacular
          </a>

          <span>•</span>

          <a
            href="https://github.com/roifeufeu"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>

          <span>•</span>

          <a href="mailto:jorickbolivar@gmail.com">Contact</a>
        </div>

        <p className="footer-note">
          Les recettes restent la propriété de leurs sources respectives.
        </p>

        <p className="footer-copyright">© 2026 TrouveTonPlat</p>
      </div>
    </footer>
  );
}

export default Footer;
