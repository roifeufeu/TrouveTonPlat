import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [installPrompt, setInstallPrompt] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const location = useLocation();

  const [currentPath, setCurrentPath] = useState(location.pathname);

  if (currentPath !== location.pathname) {
    setCurrentPath(location.pathname);
    setMenuOpen(false);
  }

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

        <div className="burger-wrapper" ref={menuRef}>
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
