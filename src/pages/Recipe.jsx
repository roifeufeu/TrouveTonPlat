import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { unitTranslations } from "./unitTranslations";

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

  return unitTranslations[normalizedUnit] || unit;
}

function Recipe() {
  const { id } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("ingredients");

  useEffect(() => {
    async function loadRecipe() {
      try {
        const data = await getRecipeById(id);

        setRecipe(data);
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

  function handlePrint() {
    const originalTitle = document.title;

    const safeTitle = recipe.title.replace(/[<>:"/\\|?*]/g, "").trim();

    document.title = safeTitle;

    window.print();

    document.title = originalTitle;
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

  const originalServings = recipe.servings || 1;
  const servingsRatio = servings / originalServings;

  const hasInstructions =
    recipe.instructions?.some((section) => section.steps?.length > 0) || false;

  return (
    <main className="recipe-page">
      <section className="recipe-hero screen-only">
        <div className="recipe-hero-image-wrapper">
          <img
            className="recipe-hero-image"
            src={recipe.image}
            alt={recipe.title}
          />
        </div>

        <div className="recipe-hero-content">
          <h1>{recipe.title}</h1>

          <div className="recipe-meta">
            {recipe.readyInMinutes && (
              <div className="recipe-meta-item">
                <span className="recipe-meta-label">Temps</span>

                <strong>{recipe.readyInMinutes} min</strong>
              </div>
            )}

            <div className="recipe-meta-item">
              <span className="recipe-meta-label">Portions</span>

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
          </div>

          <button
            type="button"
            className="print-recipe-button"
            onClick={handlePrint}
          >
            Imprimer / PDF
          </button>
        </div>
      </section>

      <section className="recipe-section recipe-details-card screen-only">
        <div className="recipe-tabs">
          <button
            type="button"
            className={`recipe-tab ${
              activeTab === "ingredients" ? "active" : ""
            }`}
            onClick={() => setActiveTab("ingredients")}
          >
            Ingrédients
          </button>

          <button
            type="button"
            className={`recipe-tab ${
              activeTab === "nutrition" ? "active" : ""
            }`}
            onClick={() => setActiveTab("nutrition")}
          >
            Nutrition
          </button>
        </div>

        <div className="recipe-tab-content">
          {activeTab === "ingredients" && (
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
          )}

          {activeTab === "nutrition" && (
            <>
              {recipe.nutrition?.length > 0 ? (
                <>
                  <div className="nutrition-grid">
                    {recipe.nutrition.map((nutrient) => (
                      <div className="nutrition-item" key={nutrient.name}>
                        <strong>{nutrient.name}</strong>

                        <span>
                          {Math.round(nutrient.amount * servingsRatio)}{" "}
                          {nutrient.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="empty-tab-message">
                  Informations nutritionnelles indisponibles.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {hasInstructions && (
        <section className="recipe-section screen-only">
          <h2>Préparation</h2>

          <div className="preparation-card">
            {recipe.instructions.map((section, sectionIndex) => (
              <div className="instruction-section" key={sectionIndex}>
                {section.name && (
                  <h3 className="instruction-section-title">{section.name}</h3>
                )}

                {section.steps.map((step, stepIndex) => (
                  <div
                    className="preparation-step"
                    key={`${sectionIndex}-${step.number}-${stepIndex}`}
                  >
                    <div className="preparation-step-number">{step.number}</div>

                    <div className="preparation-step-content">
                      <p>{step.step}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="print-only print-recipe">
        <div className="print-recipe-header">
          <div>
            <h1>{recipe.title}</h1>

            <div className="print-recipe-meta">
              {recipe.readyInMinutes && (
                <span>
                  <strong>Temps :</strong> {recipe.readyInMinutes} min
                </span>
              )}

              <span>
                <strong>Portions :</strong> {servings}
              </span>
            </div>
          </div>

          {recipe.image && (
            <img
              className="print-recipe-image"
              src={recipe.image}
              alt={recipe.title}
            />
          )}
        </div>

        <section className="print-section">
          <h2>Ingrédients</h2>

          <ul className="print-ingredients">
            {recipe.ingredients.map((ingredient, index) => {
              const adjustedAmount =
                ingredient.amount != null
                  ? ingredient.amount * servingsRatio
                  : null;

              return (
                <li key={`print-${ingredient.id}-${index}`}>
                  {ingredient.image && (
                    <img
                      src={`https://img.spoonacular.com/ingredients_100x100/${ingredient.image}`}
                      alt=""
                    />
                  )}

                  <div>
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
            <h2>Nutrition test v2</h2>

            <p className="nutrition-servings">
              Valeurs pour {servings} portion{servings > 1 ? "s" : ""}
            </p>

            <div className="nutrition-grid">
              {recipe.nutrition.map((nutrient) => (
                <div className="nutrition-item" key={nutrient.name}>
                  <strong>{nutrient.name}</strong>

                  <span>
                    {Math.round(nutrient.amount * servingsRatio)}{" "}
                    {nutrient.unit}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
        {hasInstructions && (
          <section className="print-section">
            <h2>Préparation</h2>

            <div className="print-instructions">
              {recipe.instructions.map((section, sectionIndex) => (
                <div key={`print-section-${sectionIndex}`}>
                  {section.name && <h3>{section.name}</h3>}

                  {section.steps.map((step, stepIndex) => (
                    <div
                      className="print-step"
                      key={`print-${sectionIndex}-${step.number}-${stepIndex}`}
                    >
                      <span>{step.number}</span>
                      <p>{step.step}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default Recipe;
