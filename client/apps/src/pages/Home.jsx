import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import HeroSection from "../components/HeroSection";
import ElegantAnimeCarousel from "../components/ElegantAnimeCarousel";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimeSearchSection from "../components/AnimeSearchSection";

export default function Home() {
  const [animeData, setAnimeData] = useState([]);
  const [recommendationData, setRecommendationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // const token = localStorage.getItem("access_token");
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzUwODc4MjI5fQ.WYyCrbEb1ww_MsCOjx-xkfZ5CV3Bk2dpXmDEqd8Kjek";

  // Helper function to extract year from aired_from or use existing year
  const getAnimeYear = (anime) => {
    if (anime.year) return anime.year;
    if (anime.aired_from) {
      return new Date(anime.aired_from).getFullYear();
    }
    return null;
  };

  // Transform recommendation data to match carousel format
  const transformRecommendationData = (recommendations) => {
    return recommendations.map((anime) => ({
      id: anime.mal_id,
      title: anime.title,
      title_english: anime.title_english,
      image_url: anime.image_url,
      score: anime.score,
      year: getAnimeYear(anime),
      episodes: anime.episodes || "Ongoing",
      genre: anime.genre || [],
      synopsis: anime.synopsis,
      // Keep original data for reference
      original: anime,
    }));
  };

  const fetchRecommendations = async () => {
    if (!token) return;

    try {
      setLoadingRecommendations(true);
      const response = await axios({
        method: "get",
        url: "http://localhost:3000/animes/recommendation",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data, "<<< getRecommendations");

      // Transform recommendations data
      const transformedRecommendations = transformRecommendationData(
        response.data.recommendations || []
      );
      setRecommendationData(transformedRecommendations);
    } catch (error) {
      console.log(error);
      let message = "Something went wrong loading recommendations";
      if (error && error.response && error.response.data) {
        message = error.response.data.message || message;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      setLoadingRecommendations(false);
    }
  };

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
        year: getAnimeYear(anime),
        episodes: anime.episodes || "Ongoing", // Show "Ongoing" instead of null
        genre: anime.genres?.map((g) => g.name) || [],
        synopsis: anime.synopsis,
        // Keep original data for reference
        original: anime,
      }));

      setAnimeData(transformedData);
    } catch (error) {
      console.log(error);
      let message = "Something went wrong loading anime";
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

  useEffect(() => {
    fetchRecommendations();
  }, [token]);

  return (
    <>
      <HeroSection />

      {/* Recommendations Section */}
      {token && (
        <>
          {loadingRecommendations ? (
            <LoadingSpinner
              text="Loading Recommendations"
              subtext="Personalizing anime suggestions based on your preferences"
            />
          ) : recommendationData.length > 0 ? (
            <ElegantAnimeCarousel
              animeData={recommendationData}
              title="Recommended for You"
            />
          ) : null}
        </>
      )}

      {/* Popular Anime Section */}
      {loading ? (
        <LoadingSpinner
          text="Loading Popular Anime"
          subtext="Fetching the most popular anime series for you"
        />
      ) : (
        <ElegantAnimeCarousel
          animeData={animeData}
          title="Popular Airing Anime"
        />
      )}

      {/* Debug info - you can remove this later */}
      <div style={{ padding: "2rem", textAlign: "center", color: "#fffafa" }}>
        <p>Popular anime loaded: {animeData.length}</p>
        {recommendationData.length > 0 && (
          <p>Recommendations loaded: {recommendationData.length}</p>
        )}
      </div>

      {/* Anime Search Section */}
      <AnimeSearchSection />
    </>
  );
}
