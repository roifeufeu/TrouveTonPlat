import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Header() {
  const [installPrompt, setInstallPrompt] = useState(null);

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
      <Link to="/" className="logo">
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
