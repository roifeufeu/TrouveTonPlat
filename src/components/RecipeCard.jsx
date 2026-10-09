import { Link } from "react-router-dom";

function RecipeCard({ id, name, image, onOpen }) {
  return (
    <Link to={`/recipe/${id}`} className="recipe-card" onClick={onOpen}>
      <img src={image} alt={name} />

      <div className="recipe-card-content">
        <h2>{name}</h2>

        <span className="recipe-link">Détails →</span>
      </div>
    </Link>
  );
}

export default RecipeCard;
