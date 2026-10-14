import { useEffect, useState } from "react";
import searchFallbacks from "../data/searchFallbacks.json";

import SearchBar from "../components/SearchBar";
import RecipeCard from "../components/RecipeCard";
import DailyDiscoveries from "../components/DailyDiscoveries.jsx";

import { searchRecipes } from "../services/recipeApi";

const SEARCH_STATE_KEY = "trouvetonplat-search-state";

const DEFAULT_FILTERS = {
  vegetarian: false,
  vegan: false,
  noPork: false,
  glutenFree: false,
  dairyFree: false,
};

function normalizeSearchText(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSearchFallback(query) {
  const normalizedQuery = normalizeSearchText(query);

  const match = Object.entries(searchFallbacks).find(
    ([term]) => normalizeSearchText(term) === normalizedQuery,
  );

  return match ? match[1] : null;
}

function Home() {
  const [savedSearchState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(SEARCH_STATE_KEY);

      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [search, setSearch] = useState(savedSearchState?.search || "");

  const [activeSearchQuery, setActiveSearchQuery] = useState(
    savedSearchState?.activeSearchQuery || savedSearchState?.search || "",
  );

  const [fallbackTerm, setFallbackTerm] = useState(
    savedSearchState?.fallbackTerm || "",
  );

  const [recipes, setRecipes] = useState(savedSearchState?.recipes || []);

  const [visibleCount, setVisibleCount] = useState(
    savedSearchState?.visibleCount || 9,
  );

  const [totalResults, setTotalResults] = useState(
    savedSearchState?.totalResults || 0,
  );

  const [searchBarKey, setSearchBarKey] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [vegetarian, setVegetarian] = useState(
    savedSearchState?.filters?.vegetarian || false,
  );

  const [vegan, setVegan] = useState(savedSearchState?.filters?.vegan || false);

  const [noPork, setNoPork] = useState(
    savedSearchState?.filters?.noPork || false,
  );

  const [glutenFree, setGlutenFree] = useState(
    savedSearchState?.filters?.glutenFree || false,
  );

  const [dairyFree, setDairyFree] = useState(
    savedSearchState?.filters?.dairyFree || false,
  );

  const [activeFilters, setActiveFilters] = useState(
    savedSearchState?.activeFilters || DEFAULT_FILTERS,
  );

  useEffect(() => {
    function resetHome() {
      sessionStorage.removeItem(SEARCH_STATE_KEY);

      setSearch("");
      setActiveSearchQuery("");
      setFallbackTerm("");
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

      setActiveFilters(DEFAULT_FILTERS);

      setSearchBarKey((current) => current + 1);

      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }

    window.addEventListener("reset-home", resetHome);

    return () => {
      window.removeEventListener("reset-home", resetHome);
    };
  }, []);

  useEffect(() => {
    if (savedSearchState?.scrollY == null) {
      return;
    }

    requestAnimationFrame(() => {
      window.scrollTo({
        top: savedSearchState.scrollY,
        behavior: "instant",
      });
    });
  }, [savedSearchState]);

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
    setActiveSearchQuery(query);
    setFallbackTerm("");

    setLoading(true);
    setError("");

    setRecipes([]);
    setVisibleCount(9);
    setTotalResults(0);

    try {
      const data = await searchRecipes(query, 0, filters);

      // La recherche exacte a trouvé quelque chose
      if (data.results.length > 0) {
        setRecipes(data.results);
        setTotalResults(data.totalResults);
        setActiveSearchQuery(query);
        return;
      }

      // Aucun résultat exact : on regarde si un fallback existe
      const fallback = getSearchFallback(query);

      if (!fallback) {
        setRecipes([]);
        setTotalResults(0);
        return;
      }

      // Deuxième recherche avec le terme plus général
      const fallbackData = await searchRecipes(fallback, 0, filters);

      if (fallbackData.results.length === 0) {
        setRecipes([]);
        setTotalResults(0);
        return;
      }

      setRecipes(fallbackData.results);
      setTotalResults(fallbackData.totalResults);

      setActiveSearchQuery(fallback);
      setFallbackTerm(fallback);
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
    if (visibleCount < recipes.length) {
      setVisibleCount((current) => Math.min(current + 9, recipes.length));

      return;
    }

    if (recipes.length >= totalResults) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await searchRecipes(
        activeSearchQuery,
        recipes.length,
        activeFilters,
      );

      if (data.results.length === 0) {
        setTotalResults(recipes.length);
        return;
      }

      setRecipes((currentRecipes) => [...currentRecipes, ...data.results]);

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

  function saveSearchState() {
    if ((!search, activeSearchQuery, fallbackTerm)) {
      return;
    }

    sessionStorage.setItem(
      SEARCH_STATE_KEY,
      JSON.stringify({
        search,
        recipes,
        visibleCount,
        totalResults,

        filters: {
          vegetarian,
          vegan,
          noPork,
          glutenFree,
          dairyFree,
        },

        activeFilters,

        scrollY: window.scrollY,
      }),
    );
  }

  const visibleRecipes = recipes.slice(0, visibleCount);

  const hasMoreRecipes =
    visibleCount < recipes.length || recipes.length < totalResults;

  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  return (
    <>
      <main>
        <section className="hero">
          <h1>Trouvez la recette qu'il vous faut</h1>

          <p>
            Entrez le nom d'un plat pour découvrir ses ingrédients et les
            quantités nécessaires.
          </p>

          <SearchBar
            key={searchBarKey}
            onSearch={handleSearch}
            initialValue={search}
          />

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
            {fallbackTerm && !loading && recipes.length > 0 && (
              <div className="fallback-results">
                <strong>Aucun résultat exact pour "{search}".</strong>
                <p>
                  Voici des recettes de {fallbackTerm} qui pourraient vous
                  intéresser.
                </p>
              </div>
            )}

            <h2>
              Résultats pour "{fallbackTerm || search}"
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
                      onOpen={saveSearchState}
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
              <div className="empty-results">
                <strong>Aucune recette trouvée pour "{search}"</strong>

                {hasActiveFilters ? (
                  <p>
                    Essayez de retirer un ou plusieurs filtres, ou recherchez un
                    nom de plat plus général.
                  </p>
                ) : (
                  <p>
                    Vérifiez l'orthographe ou essayez un nom de plat plus
                    général.
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        <DailyDiscoveries />
      </main>
    </>
  );
}

export default Home;
