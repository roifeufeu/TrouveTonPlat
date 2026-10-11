import { useState } from "react";
import RecipeCard from "../components/RecipeCard";
import { getFavorites } from "../services/storage";

function Favorites() {
  const [favorites] = useState(() => getFavorites());

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
        <div className="results">
          {favorites.map((recipe) => (
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

export default Favorites;
