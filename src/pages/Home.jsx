import { useEffect, useState } from "react";

import SearchBar from "../components/SearchBar";
import RecipeCard from "../components/RecipeCard";

import { searchRecipes } from "../services/recipeApi";

function Home() {
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [searchBarKey, setSearchBarKey] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalResults, setTotalResults] = useState(0);

  const [vegetarian, setVegetarian] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [noPork, setNoPork] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [dairyFree, setDairyFree] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    vegetarian: false,
    vegan: false,
    noPork: false,
    glutenFree: false,
    dairyFree: false,
  });

  useEffect(() => {
    function resetHome() {
      setSearch("");
      setRecipes([]);
      setVisibleCount(9);
      setLoading(false);
      setError("");
      setTotalResults(0);

      setVegetarian(false);
      setVegan(false);
      setNoPork(false);
      setGlutenFree(false);
      setDairyFree(false);

      setActiveFilters({
        vegetarian: false,
        vegan: false,
        noPork: false,
        glutenFree: false,
        dairyFree: false,
      });

      setSearchBarKey((current) => current + 1);
    }

    window.addEventListener("reset-home", resetHome);

    return () => {
      window.removeEventListener("reset-home", resetHome);
    };
  }, []);

  async function handleSearch(query) {
    const filters = {
      vegetarian,
      vegan,
      noPork,
      glutenFree,
      dairyFree,
    };

    setActiveFilters(filters);

    setSearch(query);
    setLoading(true);
    setError("");

    setRecipes([]);
    setVisibleCount(9);
    setTotalResults(0);

    try {
      const data = await searchRecipes(query, 0, filters);

      setRecipes(data.results);
      setTotalResults(data.totalResults);
    } catch (error) {
      console.error(error);

      setError(
        "Impossible de récupérer les recettes. Vérifiez votre connexion et réessayez.",
      );

      setRecipes([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadMore() {
    // Il reste déjà des recettes chargées en mémoire :
    // aucune requête API nécessaire.
    if (visibleCount < recipes.length) {
      setVisibleCount((current) => Math.min(current + 9, recipes.length));

      return;
    }

    // Toutes les recettes récupérées sont déjà affichées
    // et il n'existe rien d'autre côté Spoonacular.
    if (recipes.length >= totalResults) {
      return;
    }

    // Il faut récupérer le prochain lot de 27 recettes.
    setLoading(true);
    setError("");

    try {
      const data = await searchRecipes(search, recipes.length, activeFilters);

      if (data.results.length === 0) {
        setTotalResults(recipes.length);
        return;
      }

      setRecipes((currentRecipes) => [...currentRecipes, ...data.results]);

      // On n'affiche que 9 recettes du nouveau lot.
      setVisibleCount((current) => current + 9);
    } catch (error) {
      console.error(error);

      setError(
        "Impossible de récupérer les recettes. Vérifiez votre connexion et réessayez.",
      );
    } finally {
      setLoading(false);
    }
  }

  const visibleRecipes = recipes.slice(0, visibleCount);

  const hasMoreRecipes =
    visibleCount < recipes.length || recipes.length < totalResults;

  return (
    <>
      <main>
        <section className="hero">
          <h1>Trouvez la recette qu'il vous faut</h1>

          <p>
            Entrez le nom d'un plat pour découvrir ses ingrédients et les
            quantités nécessaires.
          </p>

          <SearchBar key={searchBarKey} onSearch={handleSearch} />

          <div className="search-filters">
            <label>
              <input
                type="checkbox"
                checked={vegetarian}
                onChange={(event) => setVegetarian(event.target.checked)}
              />
              Végétarien
            </label>

            <label>
              <input
                type="checkbox"
                checked={vegan}
                onChange={(event) => setVegan(event.target.checked)}
              />
              Vegan
            </label>

            <label>
              <input
                type="checkbox"
                checked={noPork}
                onChange={(event) => setNoPork(event.target.checked)}
              />
              Sans porc
            </label>
            <label>
              <input
                type="checkbox"
                checked={glutenFree}
                onChange={(event) => setGlutenFree(event.target.checked)}
              />
              Sans gluten
            </label>

            <label>
              <input
                type="checkbox"
                checked={dairyFree}
                onChange={(event) => setDairyFree(event.target.checked)}
              />
              Sans produits laitiers
            </label>
          </div>
        </section>

        {search && (
          <section className="results">
            <h2>
              Résultats pour "{search}"
              {!loading && (
                <>
                  {" "}
                  <span className="result-count">({totalResults})</span>
                </>
              )}
            </h2>

            {loading && recipes.length === 0 && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Recherche des recettes...</p>
              </div>
            )}
            {error && (
              <div className="error-state">
                <strong>Une erreur est survenue</strong>
                <p>{error}</p>
              </div>
            )}

            {!error && recipes.length > 0 && (
              <>
                <div className="results-grid">
                  {visibleRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      id={recipe.id}
                      name={recipe.title}
                      image={recipe.image}
                    />
                  ))}
                </div>

                {hasMoreRecipes && (
                  <button
                    className="load-more"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? "Chargement..." : "Voir plus"}
                  </button>
                )}
              </>
            )}

            {!loading && !error && recipes.length === 0 && (
              <div className="empty-results">Aucune recette trouvée.</div>
            )}
          </section>
        )}
      </main>
    </>
  );
}

export default Home;
