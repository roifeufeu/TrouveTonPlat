import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

const GOOGLE_TRANSLATE_URL =
  "https://translation.googleapis.com/language/translate/v2";

/* -------------------- VÉRIFICATION DES CLÉS -------------------- */

if (!SPOONACULAR_API_KEY || !GOOGLE_TRANSLATE_API_KEY) {
  console.error("Erreur : clés API manquantes dans le fichier .env.");
  process.exit(1);
}

/* -------------------- CORS -------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Autorise les requêtes sans Origin
      // comme Postman ou certaines requêtes serveur.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Autorise le réseau local pendant le développement.
      const isLocalNetwork =
        /^http:\/\/192\.168\.\d+\.\d+:(5173|4173)$/.test(origin) ||
        /^http:\/\/10\.\d+\.\d+\.\d+:(5173|4173)$/.test(origin) ||
        /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:(5173|4173)$/.test(origin);

      if (process.env.NODE_ENV !== "production" && isLocalNetwork) {
        return callback(null, true);
      }

      return callback(new Error("Origine non autorisée par CORS."));
    },
  }),
);

app.use(express.json());

/* -------------------- RATE LIMIT -------------------- */

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    error: "Trop de requêtes. Réessayez dans quelques instants.",
  },
});

app.use("/api", apiLimiter);

/* -------------------- TRADUCTION -------------------- */

async function translateText(text, source, target) {
  const response = await fetch(GOOGLE_TRANSLATE_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GOOGLE_TRANSLATE_API_KEY,
    },

    body: JSON.stringify({
      q: text,
      source,
      target,
      format: "text",
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();

    console.error("Erreur Google Translation :", errorData);

    throw new Error("Erreur Google Translation");
  }

  const data = await response.json();

  return data.data.translations[0].translatedText;
}

async function translateTexts(texts, source, target) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const response = await fetch(GOOGLE_TRANSLATE_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GOOGLE_TRANSLATE_API_KEY,
    },

    body: JSON.stringify({
      q: texts,
      source,
      target,
      format: "text",
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();

    console.error("Erreur Google Translation :", errorData);

    throw new Error("Erreur Google Translation");
  }

  const data = await response.json();

  return data.data.translations.map(
    (translation) => translation.translatedText,
  );
}

/* -------------------- TEST BACKEND -------------------- */

app.get("/api/test", (req, res) => {
  res.json({
    message: "Le backend fonctionne !",
  });
});

/* -------------------- RECHERCHE DE RECETTES -------------------- */

app.get("/api/recipes/search", async (req, res) => {
  const query = String(req.query.q || "").trim();
  const offset = Number(req.query.offset || 0);
  const vegetarian = req.query.vegetarian === "true";
  const vegan = req.query.vegan === "true";
  const noPork = req.query.noPork === "true";
  const glutenFree = req.query.glutenFree === "true";
  const dairyFree = req.query.dairyFree === "true";

  if (query.length < 2 || query.length > 100) {
    return res.status(400).json({
      error: "Recherche invalide.",
    });
  }

  if (!Number.isInteger(offset) || offset < 0 || offset > 1000) {
    return res.status(400).json({
      error: "Offset invalide.",
    });
  }

  try {
    const translatedQuery = await translateText(query, "fr", "en");

    const params = new URLSearchParams({
      query: translatedQuery,
      number: "27",
      offset: String(offset),
      apiKey: SPOONACULAR_API_KEY,
    });

    if (vegan) {
      params.set("diet", "vegan");
    } else if (vegetarian) {
      params.set("diet", "vegetarian");
    }

    if (noPork) {
      params.set("excludeIngredients", "pork");
    }

    const intolerances = [];

    if (glutenFree) {
      intolerances.push("gluten");
    }

    if (dairyFree) {
      intolerances.push("dairy");
    }

    if (intolerances.length > 0) {
      params.set("intolerances", intolerances.join(","));
    }

    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/recipes/complexSearch?${params}`,
    );

    if (!response.ok) {
      if (response.status === 402) {
        return res.status(503).json({
          error: "Quota Spoonacular atteint. Réessayez plus tard.",
        });
      }

      const errorText = await response.text();

      console.error("Erreur Spoonacular :", errorText);

      throw new Error("Erreur Spoonacular");
    }

    const data = await response.json();

    const results = Array.isArray(data.results) ? data.results : [];

    const titles = results.map((recipe) => recipe.title);

    const translatedTitles = await translateTexts(titles, "en", "fr");

    const recipes = results.map((recipe, index) => ({
      id: recipe.id,
      title: translatedTitles[index] || recipe.title,
      image: recipe.image,
    }));

    return res.json({
      results: recipes,
      totalResults: data.totalResults || 0,
    });
  } catch (error) {
    console.error("Erreur recherche :", error);

    return res.status(500).json({
      error: "Impossible de récupérer les recettes.",
    });
  }
});

/* -------------------- DÉTAIL D'UNE RECETTE -------------------- */

app.get("/api/recipes/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Identifiant de recette invalide.",
    });
  }

  try {
    const params = new URLSearchParams({
      includeNutrition: "true",
      apiKey: SPOONACULAR_API_KEY,
    });

    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/recipes/${id}/information?${params}`,
    );

    if (!response.ok) {
      if (response.status === 402) {
        return res.status(503).json({
          error: "Quota Spoonacular atteint. Réessayez plus tard.",
        });
      }

      if (response.status === 404) {
        return res.status(404).json({
          error: "Recette introuvable.",
        });
      }

      const errorText = await response.text();

      console.error("Erreur Spoonacular :", errorText);

      throw new Error("Erreur Spoonacular");
    }

    const data = await response.json();

    const ingredients = Array.isArray(data.extendedIngredients)
      ? data.extendedIngredients
      : [];

    const ingredientNames = ingredients.map(
      (ingredient) => ingredient.nameClean || ingredient.name || "",
    );

    const textsToTranslate = [data.title || "", ...ingredientNames];

    const translatedTexts = await translateTexts(textsToTranslate, "en", "fr");

    const translatedTitle = translatedTexts[0] || data.title;

    const translatedIngredients = translatedTexts.slice(1);

    const nutrientTranslations = {
      Calories: "Calories",
      Protein: "Protéines",
      Fat: "Lipides",
      Carbohydrates: "Glucides",
      Sugar: "Sucres",
      Fiber: "Fibres",
      Sodium: "Sodium",
    };

    const recipe = {
      id: data.id,
      title: translatedTitle,
      image: data.image,
      servings: data.servings,
      readyInMinutes: data.readyInMinutes,

      ingredients: ingredients.map((ingredient, index) => {
        const metric = ingredient.measures?.metric;

        return {
          id: ingredient.id,

          name:
            translatedIngredients[index] ||
            ingredient.nameClean ||
            ingredient.name,

          amount: metric?.amount ?? ingredient.amount ?? null,

          unit: metric?.unitShort || ingredient.unit || "",
        };
      }),

      nutrition:
        data.nutrition?.nutrients
          ?.filter((nutrient) =>
            [
              "Calories",
              "Protein",
              "Fat",
              "Carbohydrates",
              "Sugar",
              "Fiber",
              "Sodium",
            ].includes(nutrient.name),
          )
          .map((nutrient) => ({
            name: nutrientTranslations[nutrient.name] || nutrient.name,

            amount: nutrient.amount,
            unit: nutrient.unit,
          })) || [],
    };

    return res.json(recipe);
  } catch (error) {
    console.error("Erreur recette :", error);

    return res.status(500).json({
      error: "Impossible de récupérer la recette.",
    });
  }
});

/* -------------------- ROUTE INCONNUE -------------------- */

app.use((req, res) => {
  res.status(404).json({
    error: "Route introuvable.",
  });
});

/* -------------------- DÉMARRAGE -------------------- */

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
