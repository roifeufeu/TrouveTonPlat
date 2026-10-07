import { useState } from "react";

function SearchBar({ onSearch }) {
  const [search, setSearch] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const value = search.trim();

    if (value.length < 2) return;

    onSearch(value);
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
    </div>
  );
}

export default SearchBar;
