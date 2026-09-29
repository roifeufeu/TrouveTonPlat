// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import SearchBar from "../components/SearchBar";

afterEach(() => {
  cleanup();
});

describe("SearchBar", () => {
  it("affiche le champ de recherche et le bouton", () => {
    render(<SearchBar onSearch={() => {}} />);

    expect(
      screen.getByPlaceholderText("Ex : Tarte, lasagnes, Pizza..."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Rechercher" }),
    ).toBeInTheDocument();
  });

  it("ne lance pas de recherche avec moins de 2 caractères", () => {
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText("Ex : Tarte, lasagnes, Pizza...");

    fireEvent.change(input, {
      target: {
        value: "a",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("lance une recherche valide", () => {
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText("Ex : Tarte, lasagnes, Pizza...");

    fireEvent.change(input, {
      target: {
        value: "lasagnes",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    expect(onSearch).toHaveBeenCalledWith("lasagnes");
  });
});
