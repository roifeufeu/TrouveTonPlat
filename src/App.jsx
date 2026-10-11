import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Recipe from "./pages/Recipe";

import History from "./pages/History";
import Favorites from "./pages/Favorites";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Header />

        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipe/:id" element={<Recipe />} />
            <Route path="/historique" element={<History />} />
            <Route path="/favoris" element={<Favorites />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
