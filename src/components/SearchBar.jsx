import { useEffect, useRef, useState } from "react";
import searchTerms from "../data/searchTerms.json";

function SearchBar({ onSearch }) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchWrapperRef = useRef(null);

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function getSuggestions(value) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    if (trimmedValue.length < 2) {
      return [];
    }

    const normalizedValue = normalizeText(trimmedValue);

    return [...new Set(searchTerms)]
      .filter((term) => normalizeText(term).startsWith(normalizedValue))
      .sort((a, b) => {
        if (a.length !== b.length) {
          return a.length - b.length;
        }

        return a.localeCompare(b, "fr");
      })
      .slice(0, 5);
  }

  function handleChange(event) {
    const value = event.target.value;

    setSearch(value);
    setSuggestions(getSuggestions(value));
    setActiveIndex(-1);
  }

  function selectSuggestion(suggestion) {
    setSearch(suggestion);
    setSuggestions([]);
    setActiveIndex(-1);
  }

  function handleKeyDown(event) {
    if (suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((currentIndex) =>
        currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((currentIndex) =>
        currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1,
      );
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    }

    if (event.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const value = search.trim();

    if (value.length < 2) return;

    setSuggestions([]);
    setActiveIndex(-1);

    onSearch(value);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target)
      ) {
        setSuggestions([]);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="search-wrapper" ref={searchWrapperRef}>
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ex : Burger, pizza, tarte aux pommes..."
          value={search}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        <button type="submit">Rechercher</button>
      </form>

      {suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <li key={suggestion}>
              <button
                type="button"
                className={index === activeIndex ? "suggestion-active" : ""}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectSuggestion(suggestion)}
              >
                <span>
                  {suggestion.slice(0, search.trim().length)}
                  <strong>{suggestion.slice(search.trim().length)}</strong>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
