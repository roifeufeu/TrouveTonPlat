import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { getDiscoveries } from "../services/recipeApi";

const STORAGE_KEY = "trouvetonplat-discoveries";

const DEFAULT_PREFERENCES = {
  vegetarian: false,
  vegan: false,
  noPork: false,
  glutenFree: false,
  dairyFree: false,
};

const PREFERENCE_OPTIONS = [
  { key: "vegetarian", label: "Végétarien" },
  { key: "vegan", label: "Vegan" },
  { key: "noPork", label: "Sans porc" },
  { key: "glutenFree", label: "Sans gluten" },
  { key: "dairyFree", label: "Sans produits laitiers" },
];

function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPreferencesKey(preferences) {
  return [
    preferences.vegetarian,
    preferences.vegan,
    preferences.noPork,
    preferences.glutenFree,
    preferences.dairyFree,
  ]
    .map((value) => (value ? "1" : "0"))
    .join("");
}

function DailyDiscoveries() {
  const [recipes, setRecipes] = useState([]);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [draftPreferences, setDraftPreferences] = useState(DEFAULT_PREFERENCES);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (window.innerWidth <= 600) {
      return 1;
    }

    if (window.innerWidth <= 900) {
      return 2;
    }

    return 3;
  });
  const viewportRef = useRef(null);

  const [carouselWidth, setCarouselWidth] = useState(0);

  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    async function loadDiscoveries() {
      const today = getToday();

      try {
        const stored = localStorage.getItem(STORAGE_KEY);

        let savedPreferences = DEFAULT_PREFERENCES;
        let recipeSets = {};
        let sameDay = false;

        if (stored) {
          const parsed = JSON.parse(stored);

          savedPreferences = {
            ...DEFAULT_PREFERENCES,
            ...(parsed.preferences || {}),
          };

          setPreferences(savedPreferences);
          setDraftPreferences(savedPreferences);

          if (parsed.date === today && parsed.recipeSets) {
            sameDay = true;
            recipeSets = parsed.recipeSets;

            const currentKey = getPreferencesKey(savedPreferences);

            if (recipeSets[currentKey]) {
              setRecipes(recipeSets[currentKey]);
              return;
            }
          }
        }

        const newRecipes = await getDiscoveries(savedPreferences);

        const currentKey = getPreferencesKey(savedPreferences);

        // Nouveau jour :
        // on supprime les anciens jeux de recettes.
        if (!sameDay) {
          recipeSets = {};
        }

        recipeSets[currentKey] = newRecipes;

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            date: today,
            preferences: savedPreferences,
            recipeSets,
          }),
        );

        setRecipes(newRecipes);
      } catch (error) {
        console.error(error);

        setError("Impossible de charger les découvertes.");
      } finally {
        setLoading(false);
      }
    }

    loadDiscoveries();
  }, []);

  useEffect(() => {
    function updateItemsPerPage() {
      if (window.innerWidth <= 600) {
        setItemsPerPage(1);
      } else if (window.innerWidth <= 900) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    }

    updateItemsPerPage();

    window.addEventListener("resize", updateItemsPerPage);

    return () => {
      window.removeEventListener("resize", updateItemsPerPage);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    function updateCarouselWidth() {
      setCarouselWidth(viewport.getBoundingClientRect().width);
    }

    updateCarouselWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateCarouselWidth();
    });

    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, [loading]);

  useEffect(() => {
    function updateItemsPerPage() {
      let newItemsPerPage;

      if (window.innerWidth <= 600) {
        newItemsPerPage = 1;
      } else if (window.innerWidth <= 900) {
        newItemsPerPage = 2;
      } else {
        newItemsPerPage = 3;
      }

      setItemsPerPage((current) => {
        if (current !== newItemsPerPage) {
          setCurrentPage(0);
          return newItemsPerPage;
        }

        return current;
      });
    }

    window.addEventListener("resize", updateItemsPerPage);

    return () => {
      window.removeEventListener("resize", updateItemsPerPage);
    };
  }, []);
  const pages = [];

  for (let i = 0; i < recipes.length; i += itemsPerPage) {
    pages.push(recipes.slice(i, i + itemsPerPage));
  }

  const totalPages = pages.length;

  function previousPage() {
    if (totalPages === 0) {
      return;
    }

    setCurrentPage((current) => (current === 0 ? totalPages - 1 : current - 1));
  }

  function nextPage() {
    if (totalPages === 0) {
      return;
    }

    setCurrentPage((current) => (current === totalPages - 1 ? 0 : current + 1));
  }

  function handlePointerDown(event) {
    setDragStart(event.clientX);
    setDragOffset(0);
    setIsDragging(true);
  }

  function handlePointerMove(event) {
    if (!isDragging || dragStart === null) {
      return;
    }

    setDragOffset(event.clientX - dragStart);
  }

  function handlePointerUp() {
    if (!isDragging) {
      return;
    }

    const minimumDistance = 60;

    if (dragOffset < -minimumDistance) {
      nextPage();
    } else if (dragOffset > minimumDistance) {
      previousPage();
    }

    setDragStart(null);
    setDragOffset(0);
    setIsDragging(false);
  }

  const activePreferenceLabels = PREFERENCE_OPTIONS.filter(
    (option) => preferences[option.key],
  ).map((option) => option.label);

  const preferencesText =
    activePreferenceLabels.length > 0
      ? activePreferenceLabels.join(", ")
      : "Aucun";

  async function applyPreferences() {
    if (refreshing) {
      return;
    }

    const samePreferences =
      JSON.stringify(draftPreferences) === JSON.stringify(preferences);

    setPreferencesOpen(false);

    if (samePreferences) {
      return;
    }

    const newPreferences = {
      ...draftPreferences,
    };

    const newKey = getPreferencesKey(newPreferences);

    try {
      const today = getToday();

      const stored = localStorage.getItem(STORAGE_KEY);

      let recipeSets = {};

      if (stored) {
        const parsed = JSON.parse(stored);

        if (parsed.date === today && parsed.recipeSets) {
          recipeSets = parsed.recipeSets;
        }
      }

      setCurrentPage(0);

      // Cette combinaison existe déjà aujourd'hui :
      // on récupère exactement les mêmes recettes.
      if (recipeSets[newKey]) {
        setPreferences(newPreferences);
        setRecipes(recipeSets[newKey]);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            date: today,
            preferences: newPreferences,
            recipeSets,
          }),
        );

        return;
      }

      // Nouvelle combinaison :
      // on génère un nouveau jeu une seule fois.
      setRefreshing(true);

      const newRecipes = await getDiscoveries(newPreferences);

      recipeSets[newKey] = newRecipes;

      setPreferences(newPreferences);
      setRecipes(newRecipes);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date: today,
          preferences: newPreferences,
          recipeSets,
        }),
      );
    } catch (error) {
      console.error(error);

      // En cas d'erreur, on garde les
      // préférences réellement appliquées.
      setDraftPreferences(preferences);
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return <p>Chargement des découvertes...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="discoveries-section">
      <div className="discoveries-header">
        <h2>À découvrir aujourd'hui</h2>

        <p>Une sélection de recettes choisies pour vous.</p>
      </div>

      <div className="discoveries-preferences">
        <div className="discoveries-preferences-summary">
          <span>
            Vos régimes : <strong>{preferencesText}</strong>
          </span>

          <button
            type="button"
            className="preferences-edit-button"
            disabled={refreshing}
            onClick={() => {
              if (preferencesOpen) {
                applyPreferences();
              } else {
                setDraftPreferences(preferences);
                setPreferencesOpen(true);
              }
            }}
          >
            {preferencesOpen ? "Terminer" : "Modifier"}
          </button>
        </div>

        {preferencesOpen && (
          <div className="discoveries-preferences-panel">
            {PREFERENCE_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`preference-button ${
                  draftPreferences[option.key] ? "active" : ""
                }`}
                onClick={() =>
                  setDraftPreferences((current) => ({
                    ...current,
                    [option.key]: !current[option.key],
                  }))
                }
                disabled={refreshing}
                aria-pressed={draftPreferences[option.key]}
              >
                {draftPreferences[option.key] && "✓ "}
                {option.label}
              </button>
            ))}
          </div>
        )}

        {refreshing && (
          <p className="discoveries-refreshing">
            Mise à jour des découvertes...
          </p>
        )}
      </div>

      <div className="discoveries-carousel">
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={previousPage}
          aria-label="Recettes précédentes"
        >
          ‹
        </button>

        <div
          className="discoveries-viewport"
          ref={viewportRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className={`discoveries-track ${isDragging ? "dragging" : ""}`}
            style={{
              transform: `translateX(${
                -(currentPage * carouselWidth) + dragOffset
              }px)`,
            }}
          >
            {pages.map((page, pageIndex) => (
              <div
                className="discoveries-page"
                key={pageIndex}
                style={{
                  gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))`,
                }}
              >
                {page.map((recipe) => (
                  <Link
                    key={recipe.id}
                    to={`/recipe/${recipe.id}`}
                    className="discovery-card"
                    draggable="false"
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      draggable="false"
                    />

                    <div className="discovery-card-content">
                      <h3>{recipe.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={nextPage}
          aria-label="Recettes suivantes"
        >
          ›
        </button>
      </div>

      <div className="carousel-dots">
        {Array.from({
          length: totalPages,
        }).map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${currentPage === index ? "active" : ""}`}
            onClick={() => setCurrentPage(index)}
            aria-label={`Aller à la page ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default DailyDiscoveries;
