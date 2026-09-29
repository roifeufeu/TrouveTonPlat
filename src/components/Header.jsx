import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [installPrompt, setInstallPrompt] = useState(null);

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
    <header className={`header ${!installPrompt ? "header-centered" : ""}`}>
      <Link to="/" className="logo" onClick={handleLogoClick}>
        TrouveTonPlat
      </Link>

      {installPrompt && (
        <button className="install-button" onClick={handleInstall}>
          Installer l'application
        </button>
      )}
    </header>
  );
}

export default Header;
