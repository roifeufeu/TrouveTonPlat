export const customRecipes = [
  {
    id: "custom-rougail-saucisse",
    title: "Rougail saucisse",
    image: "/recipes/rougail-saucisse.webp",

    servings: 4,
    readyInMinutes: 50,

    vegetarian: false,
    vegan: false,
    noPork: false,
    glutenFree: true,
    dairyFree: true,

    searchTerms: ["rougail", "rougail saucisse", "rougail saucisses"],

    ingredients: [
      {
        id: 1017063,
        name: "Saucisses",
        amount: 4,
        unit: "",
        image: "raw-pork-sausage.png",
      },
      {
        id: "tomato",
        name: "Tomates",
        amount: 4,
        unit: "",
        image: "tomato.png",
      },
      {
        id: "onion",
        name: "Oignons",
        amount: 2,
        unit: "",
        image: "brown-onion.png",
      },
      {
        id: "garlic",
        name: "Ail",
        amount: 2,
        unit: "gousses",
        image: "garlic.png",
      },
      {
        id: "ginger",
        name: "Gingembre",
        amount: 10,
        unit: "g",
        image: "ginger.png",
      },
      {
        id: "oil",
        name: "Huile",
        amount: 2,
        unit: "c. à soupe",
        image: "olive-oil.jpg",
      },
    ],

    nutrition: [
      {
        name: "Calories",
        amount: 453.77,
        unit: "kcal",
      },
      {
        name: "Protéines",
        amount: 18.88,
        unit: "g",
      },
      {
        name: "Lipides",
        amount: 37.31,
        unit: "g",
      },
      {
        name: "Glucides",
        amount: 10.86,
        unit: "g",
      },
      {
        name: "Sucres",
        amount: 5.62,
        unit: "g",
      },
      {
        name: "Fibres",
        amount: 2.49,
        unit: "g",
      },
      {
        name: "Sodium",
        amount: 727.75,
        unit: "mg",
      },
    ],

    instructions: [
      {
        name: "",
        steps: [
          {
            number: 1,
            step: "Coupez les saucisses en morceaux.",
          },
          {
            number: 2,
            step: "Émincez les oignons, l'ail et le gingembre.",
          },
          {
            number: 3,
            step: "Faites revenir les saucisses dans une casserole avec l'huile.",
          },
          {
            number: 4,
            step: "Ajoutez les oignons, l'ail et le gingembre, puis laissez revenir quelques minutes.",
          },
          {
            number: 5,
            step: "Ajoutez les tomates coupées en morceaux.",
          },
          {
            number: 6,
            step: "Laissez mijoter à feu doux pendant environ 25 à 30 minutes.",
          },
        ],
      },
    ],
  },

  {
    id: "custom-tartiflette",
    title: "Tartiflette",
    image: "/recipes/tartiflette.webp",

    servings: 4,
    readyInMinutes: 60,

    vegetarian: false,
    vegan: false,
    noPork: false,
    glutenFree: true,
    dairyFree: false,

    searchTerms: ["tartiflette"],

    ingredients: [
      {
        id: "potato",
        name: "Pommes de terre",
        amount: 1,
        unit: "kg",
        image: "potatoes-yukon-gold.png",
      },
      {
        id: "reblochon",
        name: "Reblochon",
        amount: 450,
        unit: "g",
        image: "/ingredients/reblochon.webp",
      },
      {
        id: "bacon",
        name: "Lardons",
        amount: 200,
        unit: "g",
        image: "raw-bacon.png",
      },
      {
        id: "onion",
        name: "Oignons",
        amount: 2,
        unit: "",
        image: "brown-onion.png",
      },
      {
        id: "cream",
        name: "Crème fraîche",
        amount: 20,
        unit: "cl",
        image: "sour-cream.jpg",
      },
      {
        id: "garlic",
        name: "Ail",
        amount: 1,
        unit: "gousse",
        image: "garlic.png",
      },
    ],

    nutrition: [
      {
        name: "Calories",
        amount: 979.36,
        unit: "kcal",
      },
      {
        name: "Protéines",
        amount: 39.41,
        unit: "g",
      },
      {
        name: "Lipides",
        amount: 67.81,
        unit: "g",
      },
      {
        name: "Glucides",
        amount: 54.7,
        unit: "g",
      },
      {
        name: "Sucres",
        amount: 6.32,
        unit: "g",
      },
      {
        name: "Fibres",
        amount: 6.45,
        unit: "g",
      },
      {
        name: "Sodium",
        amount: 1099.15,
        unit: "mg",
      },
    ],

    instructions: [
      {
        name: "",
        steps: [
          {
            number: 1,
            step: "Épluchez les pommes de terre puis faites-les cuire dans de l’eau salée jusqu’à ce qu’elles soient juste tendres.",
          },
          {
            number: 2,
            step: "Égouttez-les puis coupez-les en rondelles.",
          },
          {
            number: 3,
            step: "Faites revenir les lardons avec les oignons émincés pendant quelques minutes.",
          },
          {
            number: 4,
            step: "Frottez un plat à gratin avec la gousse d’ail.",
          },
          {
            number: 5,
            step: "Disposez une couche de pommes de terre, puis ajoutez les lardons et les oignons.",
          },
          {
            number: 6,
            step: "Ajoutez la crème fraîche puis disposez le reblochon coupé en deux sur le dessus.",
          },
          {
            number: 7,
            step: "Enfournez à 200 °C pendant environ 20 minutes, jusqu’à ce que le fromage soit bien fondu et gratiné.",
          },
        ],
      },
    ],
  },
  {
    id: "custom-tartiflette-sans-porc",
    title: "Tartiflette sans porc",
    image: "/recipes/tartiflette-sans-porc.webp",

    servings: 4,
    readyInMinutes: 60,

    vegetarian: false,
    vegan: false,
    noPork: true,
    glutenFree: true,
    dairyFree: false,

    searchTerms: ["tartiflette", "tartiflette sans porc"],

    ingredients: [
      {
        id: "potato",
        name: "Pommes de terre",
        amount: 1,
        unit: "kg",
        image: "potatoes-yukon-gold.png",
      },
      {
        id: "reblochon",
        name: "Reblochon",
        amount: 450,
        unit: "g",
        image: "/ingredients/reblochon.webp",
      },
      {
        id: 42130,
        name: "Lardons de volaille",
        amount: 200,
        unit: "g",
        image: "bacon-turkey.jpg",
      },
      {
        id: "onion",
        name: "Oignons",
        amount: 2,
        unit: "",
        image: "brown-onion.png",
      },
      {
        id: "cream",
        name: "Crème fraîche",
        amount: 20,
        unit: "cl",
        image: "sour-cream.jpg",
      },
      {
        id: "garlic",
        name: "Ail",
        amount: 1,
        unit: "gousse",
        image: "garlic.png",
      },
    ],

    nutrition: [
      {
        name: "Calories",
        amount: 961.86,
        unit: "kcal",
      },
      {
        name: "Protéines",
        amount: 47.9,
        unit: "g",
      },
      {
        name: "Lipides",
        amount: 61.91,
        unit: "g",
      },
      {
        name: "Glucides",
        amount: 55.61,
        unit: "g",
      },
      {
        name: "Sucres",
        amount: 6.32,
        unit: "g",
      },
      {
        name: "Fibres",
        amount: 6.45,
        unit: "g",
      },
      {
        name: "Sodium",
        amount: 1910.65,
        unit: "mg",
      },
    ],

    instructions: [
      {
        name: "",
        steps: [
          {
            number: 1,
            step: "Épluchez les pommes de terre puis faites-les cuire dans de l’eau salée jusqu’à ce qu’elles soient juste tendres.",
          },
          {
            number: 2,
            step: "Égouttez-les puis coupez-les en rondelles.",
          },
          {
            number: 3,
            step: "Faites revenir les lardons de volaille avec les oignons émincés pendant quelques minutes.",
          },
          {
            number: 4,
            step: "Frottez un plat à gratin avec la gousse d’ail.",
          },
          {
            number: 5,
            step: "Disposez une couche de pommes de terre, puis ajoutez les lardons de volaille et les oignons.",
          },
          {
            number: 6,
            step: "Ajoutez la crème fraîche puis disposez le reblochon coupé en deux sur le dessus.",
          },
          {
            number: 7,
            step: "Enfournez à 200 °C pendant environ 20 minutes, jusqu’à ce que le fromage soit bien fondu et gratiné.",
          },
        ],
      },
    ],
  },
];
