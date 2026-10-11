const FAVORITES_KEY = "trouvetonplat-favorites";
const HISTORY_KEY = "trouvetonplat-history";

const HISTORY_LIMIT = 20;

function readStorage(key) {
  try {
    const stored = localStorage.getItem(key);

    if (!stored) {
      return [];
    }

    const data = JSON.parse(stored);

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// FAVORIS

export function getFavorites() {
  return readStorage(FAVORITES_KEY);
}

export function isFavorite(id) {
  return getFavorites().some((recipe) => String(recipe.id) === String(id));
}

export function toggleFavorite(recipe) {
  const favorites = getFavorites();

  const alreadyFavorite = favorites.some(
    (favorite) => String(favorite.id) === String(recipe.id),
  );

  const updatedFavorites = alreadyFavorite
    ? favorites.filter((favorite) => String(favorite.id) !== String(recipe.id))
    : [
        ...favorites,
        {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
        },
      ];

  writeStorage(FAVORITES_KEY, updatedFavorites);

  return updatedFavorites;
}

// HISTORIQUE

export function getHistory() {
  return readStorage(HISTORY_KEY);
}

export function addToHistory(recipe) {
  const history = getHistory();

  const withoutCurrentRecipe = history.filter(
    (item) => String(item.id) !== String(recipe.id),
  );

  const updatedHistory = [
    {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
    },
    ...withoutCurrentRecipe,
  ].slice(0, HISTORY_LIMIT);

  writeStorage(HISTORY_KEY, updatedHistory);

  return updatedHistory;
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
