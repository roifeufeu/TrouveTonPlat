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

function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function DailyDiscoveries() {
  const [recipes, setRecipes] = useState([]);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

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

        if (stored) {
          const parsed = JSON.parse(stored);

          if (
            parsed.date === today &&
            Array.isArray(parsed.recipes) &&
            parsed.recipes.length === 6
          ) {
            setRecipes(parsed.recipes);
            setPreferences(parsed.preferences || DEFAULT_PREFERENCES);
            setLoading(false);

            return;
          }
        }

        const newRecipes = await getDiscoveries(DEFAULT_PREFERENCES);

        const dataToStore = {
          date: today,
          preferences: DEFAULT_PREFERENCES,
          recipes: newRecipes,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));

        setRecipes(newRecipes);
        setPreferences(DEFAULT_PREFERENCES);
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
    function updateCarouselWidth() {
      if (viewportRef.current) {
        setCarouselWidth(viewportRef.current.offsetWidth);
      }
    }

    updateCarouselWidth();

    window.addEventListener("resize", updateCarouselWidth);

    return () => {
      window.removeEventListener("resize", updateCarouselWidth);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [itemsPerPage]);

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

    event.currentTarget.setPointerCapture(event.pointerId);
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
        {Array.from({ length: totalPages }).map((_, index) => (
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
