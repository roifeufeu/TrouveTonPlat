import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [installPrompt, setInstallPrompt] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  function handleLogoClick() {
    if (location.pathname === "/") {
      window.dispatchEvent(new Event("reset-home"));
    }
  }

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();

      setInstallPrompt(event);
    }

    function handleAppInstalled() {
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();

    const result = await installPrompt.userChoice;

    if (result.outcome === "accepted") {
      setInstallPrompt(null);
    }
  }

  return (
    <header className="header">
      <Link to="/" className="logo" onClick={handleLogoClick}>
        TrouveTonPlat
      </Link>

      <div className="header-actions">
        {installPrompt && (
          <button className="install-button" onClick={handleInstall}>
            Installer l'application
          </button>
        )}

        <div className="burger-wrapper">
          <button
            className="burger-button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            aria-controls="header-menu"
          >
            ☰
          </button>

          {menuOpen && (
            <div className="burger-menu" id="header-menu">
              <Link to="/favoris" onClick={() => setMenuOpen(false)}>
                Favoris
              </Link>

              <Link to="/historique" onClick={() => setMenuOpen(false)}>
                Historique
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
