import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import PubLayout from "./layouts/PubLayout.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AnimeWatchlistCMS from "./pages/AnimeWatchlistCMS.jsx";
import PutMyAnime from "./pages/PutMyAnime.jsx";
import AnimeDetailsPage from "./pages/AnimeDetailsPage.jsx";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<PubLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/animes/:id" element={<AnimeDetailsPage />} />
            <Route path="/genres" element={<Home />} />
          </Route>

          <Route element={<MainLayout />}>
            <Route path="/my-animes" element={<AnimeWatchlistCMS />} />
            <Route path="/my-animes/:id" element={<PutMyAnime />} />
            <Route path="/my-genres" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
