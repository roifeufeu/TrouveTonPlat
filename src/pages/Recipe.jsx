import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getRecipeById } from "../services/recipeApi";

function formatAmount(amount) {
  if (amount >= 100) {
    return Math.round(amount);
  }

  if (Number.isInteger(amount)) {
    return amount;
  }

  return Math.round(amount * 10) / 10;
}

function formatUnit(unit) {
  if (!unit) {
    return "";
  }

  const normalizedUnit = unit.toLowerCase();

  const units = {
    tsp: "cuillère à café",
    tsps: "cuillères à café",

    tbsp: "cuillère à soupe",
    tbsps: "cuillères à soupe",

    cup: "tasse",
    cups: "tasses",

    serving: "portion",
    servings: "portions",

    piece: "pièce",
    pieces: "pièces",

    large: "grande",
    small: "petite",
    medium: "moyenne",

    clove: "gousse",
    cloves: "gousses",

    link: "saucisse",
    links: "saucisses",
    g: "g",
    kg: "kg",
    ml: "ml",
    l: "l",
  };

  return units[normalizedUnit] || unit;
}

function Recipe() {
  const { id } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecipe() {
      try {
        const data = await getRecipeById(id);

        setRecipe(data);

        // On utilise le nombre de portions fourni par Spoonacular
        // comme valeur de départ.
        setServings(data.servings || 1);
      } catch (error) {
        console.error(error);

        setError(
          "La recette n'a pas pu être chargée. Vérifiez votre connexion et réessayez.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [id]);

  function decreaseServings() {
    setServings((currentServings) => Math.max(1, currentServings - 1));
  }

  function increaseServings() {
    setServings((currentServings) => currentServings + 1);
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Chargement de la recette...</p>
      </div>
    );
  }

  if (error) {
    return (
      <main className="recipe-page">
        <div className="error-state">
          <strong>Impossible de charger la recette</strong>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="recipe-page">
        <div className="error-state">
          <strong>Recette introuvable</strong>
          <p>Cette recette n'existe pas ou n'est plus disponible.</p>
        </div>
      </main>
    );
  }

  // Ratio entre les portions choisies par l'utilisateur
  // et les portions originales de la recette.
  const originalServings = recipe.servings || 1;
  const servingsRatio = servings / originalServings;

  return (
    <main className="recipe-page">
      <section className="recipe-header">
        <img className="recipe-image" src={recipe.image} alt={recipe.title} />

        <div className="recipe-summary">
          <h1>{recipe.title}</h1>

          <div className="servings-control">
            <strong>Portions :</strong>

            <div className="servings-selector">
              <button
                type="button"
                onClick={decreaseServings}
                disabled={servings <= 1}
                aria-label="Réduire le nombre de portions"
              >
                −
              </button>

              <span>{servings}</span>

              <button
                type="button"
                onClick={increaseServings}
                aria-label="Augmenter le nombre de portions"
              >
                +
              </button>
            </div>
          </div>

          {recipe.readyInMinutes && (
            <p>
              <strong>Temps :</strong> {recipe.readyInMinutes} min
            </p>
          )}
        </div>
      </section>

      <section className="recipe-section">
        <h2>Ingrédients</h2>

        <ul className="ingredients-list">
          {recipe.ingredients.map((ingredient, index) => {
            const adjustedAmount =
              ingredient.amount != null
                ? ingredient.amount * servingsRatio
                : null;

            return (
              <li key={`${ingredient.id}-${index}`}>
                {ingredient.image && (
                  <img
                    className="ingredient-image"
                    src={`https://img.spoonacular.com/ingredients_100x100/${ingredient.image}`}
                    alt={ingredient.name}
                  />
                )}

                <div className="ingredient-info">
                  <strong>{ingredient.name}</strong>

                  {adjustedAmount != null && (
                    <span>
                      {formatAmount(adjustedAmount)}{" "}
                      {formatUnit(ingredient.unit)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {recipe.nutrition.length > 0 && (
        <section className="recipe-section">
          <h2>Nutrition</h2>

          <div className="nutrition-grid">
            {recipe.nutrition.map((nutrient) => (
              <div className="nutrition-item" key={nutrient.name}>
                <strong>{nutrient.name}</strong>

                <span>
                  {Math.round(nutrient.amount)} {nutrient.unit}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default Recipe;
