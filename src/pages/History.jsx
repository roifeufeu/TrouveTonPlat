import { useState } from "react";
import RecipeCard from "../components/RecipeCard";
import { clearHistory, getHistory } from "../services/storage";

function History() {
  const [history, setHistory] = useState(() => getHistory());

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <main className="collection-page">
      <div className="collection-header">
        <h1>Historique</h1>

        {history.length > 0 && (
          <button className="clear-history-button" onClick={handleClearHistory}>
            Vider l'historique
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="collection-empty">
          <h2>Votre historique est vide.</h2>
          <p>Les recettes que vous consultez apparaîtront ici.</p>
        </div>
      ) : (
        <div className="results-grid">
          {history.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              name={recipe.title}
              image={recipe.image}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default History;
