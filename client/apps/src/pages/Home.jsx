import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import http from "../lib/http";
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

  const navigate = useNavigate(); // Add this hook
  const token = localStorage.getItem("access_token");

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
      original: anime,
    }));
  };

  const fetchRecommendations = async () => {
    if (!token) return;

    try {
      setLoadingRecommendations(true);
      const response = await http.get("/animes/recommendation", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data, "<<< setLoadingReccomendations");

      const transformedRecommendations = transformRecommendationData(
        response.data.recommendations || []
      );
      setRecommendationData(transformedRecommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);

      // Check if the error is about missing favorite genres
      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes("favorite genres")
      ) {
        // Automatically navigate to genres page
        navigate("/my-genres");
      } else {
        // Handle other errors normally
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message ||
            "Something went wrong loading recommendations",
        });
      }
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchAnime = async () => {
    try {
      setLoading(true);
      const response = await http.get("/pub/animes/popular");

      console.log(response.data, "<<< fetchAnime");

      const transformedData = response.data.map((anime) => ({
        id: anime.mal_id,
        title: anime.title,
        title_english: anime.title_english,
        image_url:
          anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url,
        score: anime.score,
        year: getAnimeYear(anime),
        episodes: anime.episodes || "Ongoing",
        genre: anime.genres?.map((g) => g.name) || [],
        synopsis: anime.synopsis,
        original: anime,
      }));

      setAnimeData(transformedData);
    } catch (error) {
      console.error("Error fetching anime:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "Something went wrong loading anime",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime();
  }, []);

  useEffect(() => {
    if (token) {
      fetchRecommendations();
    }
  }, []);

  return (
    <>
      <HeroSection />
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

      <AnimeSearchSection />
    </>
  );
}
