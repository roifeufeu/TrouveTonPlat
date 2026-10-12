import { useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites, toggleFavorite } from "../services/storage";

function Favorites() {
  const [favorites, setFavorites] = useState(() => getFavorites());

  const handleRemoveFavorite = (recipe) => {
    const updatedFavorites = toggleFavorite(recipe);
    setFavorites(updatedFavorites);
  };

  return (
    <main className="collection-page">
      <div className="collection-header">
        <h1>Favoris</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="collection-empty">
          <h2>Aucun favori pour le moment.</h2>
          <p>Ajoutez une recette à vos favoris pour la retrouver ici.</p>
        </div>
      ) : (
        <div className="results-grid">
          {favorites.map((recipe) => (
            <div className="recipe-card favorite-card" key={recipe.id}>
              <Link to={`/recipe/${recipe.id}`} className="favorite-card-link">
                <img src={recipe.image} alt={recipe.title} />

                <div className="recipe-card-content">
                  <h2>{recipe.title}</h2>
                  <span className="recipe-link">Détails →</span>
                </div>
              </Link>

              <button
                type="button"
                className="favorite-card-remove"
                onClick={() => handleRemoveFavorite(recipe)}
                aria-label={`Retirer ${recipe.title} des favoris`}
                title="Retirer des favoris"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 21s-6.5-4.35-9.5-8.12C-.5 9.66 1.5 4.5 6 4.5c2.1 0 3.45 1.2 4.2 2.35C10.95 5.7 12.3 4.5 14.4 4.5c4.5 0 6.5 5.16 3.5 8.38C18.5 16.65 12 21 12 21Z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Favorites;
