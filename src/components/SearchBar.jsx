import { useEffect, useRef, useState } from "react";

import { autocompleteRecipes } from "../services/recipeApi";

function SearchBar({ onSearch }) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const skipNextAutocomplete = useRef(false);

  useEffect(() => {
    const value = search.trim();

    // Quand on clique sur une suggestion,
    // on ne veut pas relancer immédiatement l'autocomplete.
    if (skipNextAutocomplete.current) {
      skipNextAutocomplete.current = false;
      return;
    }

    // Champ vide = aucune suggestion.
    if (value.length === 0) {
      setSuggestions([]);
      return;
    }

    // Debounce adaptatif.
    let delay = 300;

    if (value.length === 1) {
      delay = 500;
    } else if (value.length === 2) {
      delay = 400;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const data = await autocompleteRecipes(value, controller.signal);

        setSuggestions(data);
      } catch (error) {
        // Une requête annulée n'est pas une vraie erreur.
        if (error.name !== "AbortError") {
          console.error("Erreur autocomplete :", error);
          setSuggestions([]);
        }
      }
    }, delay);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search]);

  function handleSubmit(event) {
    event.preventDefault();

    const value = search.trim();

    if (value.length < 2) {
      return;
    }

    setSuggestions([]);
    onSearch(value);
  }

  function handleSuggestionClick(title) {
    skipNextAutocomplete.current = true;

    setSearch(title);
    setSuggestions([]);

    onSearch(title);
  }

  return (
    <div className="search-wrapper">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ex : Burger, pizza, tarte aux pommes..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          autoComplete="off"
        />

        <button type="submit">Rechercher</button>
      </form>

      {suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                onClick={() => handleSuggestionClick(suggestion.title)}
              >
                {suggestion.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
