import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import Header from "../components/headers";
import HeroSection from "../components/HeroSection";
import ElegantAnimeCarousel from "../components/ElegantAnimeCarousel";

export default function PubLayout() {
  const [animeData, setAnimeData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnime = async () => {
    try {
      setLoading(true);
      const response = await axios({
        method: "get",
        url: "http://localhost:3000/pub/animes/popular",
      });
      console.log(response.data, "<<< getPubAnimes");

      // Transform the data to match AnimeCard component expectations
      const transformedData = response.data.map((anime) => ({
        id: anime.mal_id,
        title: anime.title,
        title_english: anime.title_english,
        image_url:
          anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url,
        score: anime.score,
        year: anime.year,
        episodes: anime.episodes || "Ongoing", // Show "Ongoing" instead of null
        genre: anime.genres?.map((g) => g.name) || [],
        synopsis: anime.synopsis,
        // Keep original data for reference
        original: anime,
      }));

      setAnimeData(transformedData);
    } catch (error) {
      console.log(error);
      let message = "Something went wrong";
      if (error && error.response && error.response.data) {
        message = error.response.data.message || message;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime();
  }, []);

  return (
    <>
      <Header />
      <HeroSection />
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading anime data...
        </div>
      ) : (
        <ElegantAnimeCarousel animeData={animeData} />
      )}
      <Outlet context={{ animeData }} />
    </>
  );
}
