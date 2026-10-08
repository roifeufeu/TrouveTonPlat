const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function searchRecipes(query, offset = 0, filters = {}) {
  const params = new URLSearchParams({
    q: query,
    offset: String(offset),
  });

  if (filters.vegetarian) {
    params.set("vegetarian", "true");
  }

  if (filters.vegan) {
    params.set("vegan", "true");
  }

  if (filters.noPork) {
    params.set("noPork", "true");
  }
  if (filters.glutenFree) {
    params.set("glutenFree", "true");
  }

  if (filters.dairyFree) {
    params.set("dairyFree", "true");
  }

  const response = await fetch(`${BASE_URL}/api/recipes/search?${params}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(data.error || "Erreur lors de la recherche des recettes");
  }

  return response.json();
}

export async function getRecipeById(id) {
  const response = await fetch(`${BASE_URL}/api/recipes/${id}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.error || "Erreur lors de la récupération de la recette",
    );
  }

  return response.json();
}
export async function getDiscoveries(filters = {}) {
  const params = new URLSearchParams();

  if (filters.vegetarian) {
    params.set("vegetarian", "true");
  }

  if (filters.vegan) {
    params.set("vegan", "true");
  }

  if (filters.noPork) {
    params.set("noPork", "true");
  }

  if (filters.glutenFree) {
    params.set("glutenFree", "true");
  }

  if (filters.dairyFree) {
    params.set("dairyFree", "true");
  }

  const response = await fetch(`${BASE_URL}/api/recipes/discover?${params}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.error || "Erreur lors de la récupération des découvertes",
    );
  }

  return response.json();
}
