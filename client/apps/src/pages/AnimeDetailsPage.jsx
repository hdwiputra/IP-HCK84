"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import http from "../lib/http";
import Swal from "sweetalert2";
import styles from "./css_modules/AnimeDetailsPage.module.css";

const AnimeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const token = localStorage.getItem("access_token");

  const fetchAnime = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/pub/animes/${id}`);
      setAnime(response.data);
      setIsVisible(true);
    } catch (err) {
      console.error("Error fetching anime:", err);

      Swal.fire({
        title: "Anime Not Found!",
        text:
          err.response?.status === 404
            ? "The anime you are looking for does not exist."
            : "Failed to load anime data. Please try again later.",
        icon: "error",
        confirmButtonText: "Go Back to My Animes",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        navigate("/my-animes");
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Early return if no ID
    if (!id) {
      Swal.fire({
        title: "Invalid Request!",
        text: "No anime ID provided.",
        icon: "error",
        confirmButtonText: "Go Back to My Animes",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        navigate("/my-animes");
      });
      return;
    }

    fetchAnime();
  }, [id, navigate]);

  const handleAddToWatchlist = async () => {
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "You are not logged in!",
        text: "You need to login first before adding data to watch list!",
      });
      navigate("/login");
      return;
    }

    try {
      await http.post(
        `/animes/${anime.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `${anime.title} has been added to your watchlist!`,
      });
    } catch (error) {
      console.error("Error adding to watchlist:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={styles.animeDetailsPage}>
        <div className="container">
          <div className={styles.loadingSkeleton}>
            <div className={styles.skeletonHeader}></div>
            <div className="row">
              <div className="col-lg-8">
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonBadges}></div>
                <div className={styles.skeletonSynopsis}></div>
                <div className={styles.skeletonGrid}></div>
              </div>
              <div className="col-lg-4">
                <div className={styles.skeletonImage}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Early return if no anime data
  if (!anime) return null;

  return (
    <div className={styles.animeDetailsPage}>
      <div className={styles.backgroundPattern}></div>

      <div className="container">
        <button
          className={styles.backButton}
          onClick={() => navigate("/")}
          style={{ marginTop: "2rem" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Back
        </button>

        <div
          className={`${styles.animeContent} ${isVisible ? styles.fadeIn : ""}`}
        >
          <div className="row">
            {/* Left Column - Main Content */}
            <div className="col-lg-8">
              {/* Title Section */}
              <div className={styles.titleSection}>
                <h1 className={styles.mainTitle}>
                  {anime.title_english || anime.title}
                </h1>
                {anime.title_japanese && (
                  <h2 className={styles.japaneseTitle}>
                    {anime.title_japanese}
                  </h2>
                )}

                {/* Badge Row */}
                <div className={styles.badgeRow}>
                  {anime.score && (
                    <div className={styles.scoreBadge}>
                      <span className={styles.star}>⭐</span>
                      <span className={styles.score}>{anime.score}</span>
                      <span className={styles.scoreText}>
                        ({anime.score}/10)
                      </span>
                    </div>
                  )}
                  {anime.rating && (
                    <div className={styles.ratingBadge}>{anime.rating}</div>
                  )}
                  {anime.status && (
                    <div className={styles.statusBadge}>{anime.status}</div>
                  )}
                  {anime.season && anime.year && (
                    <div className={styles.seasonBadge}>
                      {anime.season} {anime.year}
                    </div>
                  )}
                </div>
              </div>

              {/* Synopsis Section */}
              {anime.synopsis && (
                <div className={styles.synopsisSection}>
                  <h3 className={styles.sectionTitle}>Synopsis</h3>
                  <div className={styles.synopsisContent}>
                    <p className={styles.synopsisText}>
                      {anime.synopsis.replace(/\[Written by.*?\]/gi, "").trim()}
                    </p>
                  </div>
                </div>
              )}

              {/* Information Grid */}
              <div className={styles.infoGrid}>
                {anime.aired_from && (
                  <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>📅</div>
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>Aired</div>
                      <div className={styles.infoValue}>
                        {formatDate(anime.aired_from)}
                        {anime.aired_to && ` to ${formatDate(anime.aired_to)}`}
                      </div>
                    </div>
                  </div>
                )}

                {anime.duration && (
                  <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>⏱️</div>
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>Duration</div>
                      <div className={styles.infoValue}>{anime.duration}</div>
                    </div>
                  </div>
                )}

                {anime.episodes && (
                  <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>📺</div>
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>Episodes</div>
                      <div className={styles.infoValue}>{anime.episodes}</div>
                    </div>
                  </div>
                )}

                {anime.rank && (
                  <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>📊</div>
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>Rank</div>
                      <div className={styles.infoValue}>#{anime.rank}</div>
                    </div>
                  </div>
                )}

                {anime.popularity && (
                  <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>🎯</div>
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>Popularity</div>
                      <div className={styles.infoValue}>
                        #{anime.popularity}
                      </div>
                    </div>
                  </div>
                )}

                {anime.source && (
                  <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>📚</div>
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>Source</div>
                      <div className={styles.infoValue}>{anime.source}</div>
                    </div>
                  </div>
                )}

                {anime.type && (
                  <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>🎬</div>
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>Type</div>
                      <div className={styles.infoValue}>{anime.type}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Genres Section */}
              {anime.genre && anime.genre.length > 0 && (
                <div className={styles.genresSection}>
                  <h3 className={styles.sectionTitle}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={styles.sectionIcon}
                    >
                      <path
                        d="M7 7h10v10H7z M3 3h18v18H3z"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                    Genres
                  </h3>
                  <div className={styles.genresList}>
                    {anime.genre.map((genre, index) => (
                      <span key={index} className={styles.genreTag}>
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Media Section */}
            <div className="col-lg-4">
              <div className={styles.mediaSection}>
                <div className={styles.posterContainer}>
                  <img
                    src={anime.image_url || "/placeholder.svg"}
                    alt={anime.title_english || anime.title}
                    className={styles.animePoster}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                  {anime.url && (
                    <a
                      href={anime.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.actionBtn} ${styles.malBtn}`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      View on MyAnimeList
                    </a>
                  )}

                  <button
                    className={`${styles.actionBtn} ${styles.watchlistBtn}`}
                    onClick={handleAddToWatchlist}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Add to Watchlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailsPage;
