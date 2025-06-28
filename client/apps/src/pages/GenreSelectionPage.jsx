"use client";

import { useState, useEffect } from "react";
import styles from "./css_modules/GenreSelectionPage.module.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const GenreSelectionPage = () => {
  const [genres, setGenres] = useState([]);
  const [addedGenres, setAddedGenres] = useState(new Set());
  const [loadingGenres, setLoadingGenres] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");

  const fetchGenres = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "http://localhost:3000/pub/genres",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data, "<<< fetchGenresComponent");
      setGenres(response.data);
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load genres",
      });
    }
  };

  const fetchMyGenres = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "http://localhost:3000/animes/genres",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data, "<<< fetchMyGenresComponent");

      // Extract genre IDs from the response and add to addedGenres
      const userGenreIds = response.data.map((item) => item.Genre.id);
      setAddedGenres(new Set(userGenreIds));
    } catch (error) {
      console.log(error);
      // Don't show error if user just hasn't selected any genres yet
      if (error?.response?.status !== 404) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load your favorite genres",
        });
      }
    }
  };

  // Add genre to user's favorites
  const handleAddGenre = async (genre) => {
    try {
      // Add to loading state (this shows the spinner)
      setLoadingGenres((prev) => new Set([...prev, genre.id]));

      const response = await axios({
        method: "POST",
        url: `http://localhost:3000/animes/genres/${genre.id}`, // Fixed the URL
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Add to added genres set
      setAddedGenres((prev) => new Set([...prev, genre.id]));

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `${genre.name} added to your favorites!`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      let message = "Failed to add genre";
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      // Remove from loading state
      setLoadingGenres((prev) => {
        const newSet = new Set(prev);
        newSet.delete(genre.id);
        return newSet;
      });
    }
  };

  // Remove genre from user's favorites
  const handleRemoveGenre = async (genre) => {
    try {
      setLoadingGenres((prev) => new Set([...prev, genre.id]));

      const response = await axios({
        method: "DELETE",
        url: `http://localhost:3000/animes/genres/${genre.id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove from added genres set
      setAddedGenres((prev) => {
        const newSet = new Set(prev);
        newSet.delete(genre.id);
        return newSet;
      });

      Swal.fire({
        icon: "success",
        title: "Removed!",
        text: `${genre.name} removed from your favorites`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      let message = "Failed to remove genre";
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      setLoadingGenres((prev) => {
        const newSet = new Set(prev);
        newSet.delete(genre.id);
        return newSet;
      });
    }
  };

  const handleContinue = () => {
    if (addedGenres.size === 0) {
      Swal.fire({
        icon: "warning",
        title: "No genres selected",
        text: "Please add at least one genre to continue",
      });
      return;
    }

    // Navigate to next page - you can add your navigation logic here
    navigate("/");
    console.log("Continuing with genres:", Array.from(addedGenres));
    // Example: navigate('/next-page') or window.location.href = '/next-page'
  };

  useEffect(() => {
    fetchGenres();
    fetchMyGenres();

    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.genreSelectionPage}>
      {/* Background Effects */}
      <div className={styles.backgroundPattern}></div>
      <div className={styles.floatingParticles}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} ${isVisible ? styles.fadeIn : ""}`}>
          <h1 className={styles.title}>Choose Your Favorite Genres</h1>
          <p className={styles.subtitle}>
            Add anime genres you enjoy to personalize your experience and get
            better recommendations.
          </p>
          <p className={styles.instruction}>
            Click "Add to Favorites" to save each genre to your preferences.
          </p>
        </div>

        {/* Selection Info */}
        {addedGenres.size > 0 && (
          <div
            className={`${styles.selectionInfo} ${
              isVisible ? styles.fadeIn : ""
            }`}
          >
            <div className={styles.selectionCount}>
              {addedGenres.size} genre{addedGenres.size !== 1 ? "s" : ""} added
            </div>
            <div className={styles.selectionText}>
              Added:{" "}
              {Array.from(addedGenres)
                .map((id) => genres.find((g) => g.id === id)?.name)
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
        )}

        {/* Genre Grid */}
        <div
          className={`${styles.genreGrid} ${isVisible ? styles.fadeIn : ""}`}
        >
          {genres.map((genre, index) => {
            const isAdded = addedGenres.has(genre.id);
            const isLoading = loadingGenres.has(genre.id);

            return (
              <div
                key={genre.id}
                className={`${styles.genreCard} ${isAdded ? styles.added : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {isAdded && <div className={styles.addedCheck}>✓</div>}
                <div className={styles.genreIcon}>{genre.icon}</div>
                <h3 className={styles.genreName}>{genre.name}</h3>
                <p className={styles.genreDescription}>{genre.description}</p>

                {/* Action Button */}
                <div className={styles.genreActions}>
                  {isAdded ? (
                    <button
                      className={`${styles.genreBtn} ${styles.removeBtn}`}
                      onClick={() => handleRemoveGenre(genre)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className={styles.spinner}></span>
                          Removing...
                        </>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M18 6L6 18M6 6l12 12"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          Remove
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className={`${styles.genreBtn} ${styles.addBtn}`}
                      onClick={() => handleAddGenre(genre)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className={styles.spinner}></span>
                          Adding...
                        </>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 5v14M5 12h14"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          Add to Favorites
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div
          className={`${styles.actionButtons} ${
            isVisible ? styles.fadeIn : ""
          }`}
        >
          <button
            className={`${styles.actionBtn} ${styles.continueBtn}`}
            onClick={handleContinue}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenreSelectionPage;
