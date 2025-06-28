import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import styles from "./css_modules/RegistrationPage.module.css";

export default function PutMyAnime() {
  const [score, setScore] = useState("");
  const [episodesWatched, setEpisodesWatched] = useState("");
  const [notes, setNotes] = useState("");
  const [watchStatus, setWatchStatus] = useState("In Progress");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [animeData, setAnimeData] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("access_token");

  const createFloatingShapes = () => {
    const container = document.querySelector(`.${styles.floatingShapes}`);
    if (container) {
      container.innerHTML = "";
      for (let i = 0; i < 20; i++) {
        const shape = document.createElement("div");
        shape.className = styles.floatingShape;
        shape.style.left = Math.random() * 100 + "%";
        shape.style.animationDelay = Math.random() * 10 + "s";
        shape.style.animationDuration = 10 + Math.random() * 20 + "s";
        container.appendChild(shape);
      }
    }
  };

  const fetchMyAnimeId = async () => {
    if (!id || !token) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3000/animes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const anime = response.data;
      console.log(anime, "<<< fetchMyAnimesId");

      setAnimeData(anime);
      setScore(anime.score || "");
      setEpisodesWatched(anime.episodes_watched || "");
      setNotes(anime.notes || "");
      setWatchStatus(anime.watch_status || "In Progress");
    } catch (error) {
      console.error("Error fetching anime:", error);

      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Something went wrong!",
        icon: "error",
      });

      navigate("/my-animes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      Swal.fire({
        title: "Error",
        text: "Anime ID is missing!",
        icon: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `http://localhost:3000/animes/${id}`,
        {
          score: score ? parseInt(score) : null,
          episodes_watched: episodesWatched ? parseInt(episodesWatched) : 0,
          notes: notes,
          watch_status: watchStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data, "<<< handleSubmit");

      Swal.fire({
        title: "Success",
        text: "Anime updated successfully!",
        icon: "success",
      });

      navigate("/my-animes");
    } catch (error) {
      console.error("Error updating anime:", error);

      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Something went wrong!",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Fetch anime data
    fetchMyAnimeId();

    // Add fade-in effect
    const timer = setTimeout(() => {
      const card = document.querySelector(`.${styles.registrationCard}`);
      card?.classList.add(styles.fadeIn);
    }, 100);

    // Create floating shapes
    createFloatingShapes();

    return () => clearTimeout(timer);
  }, [id]); // Remove token from dependencies to fix the loading issue

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={styles.registrationPage}>
        <div className={styles.backgroundPattern}></div>
        <div className="container">
          <div className={`${styles.registrationCard} ${styles.fadeIn}`}>
            <div className={styles.cardHeader}>
              <div className={styles.logoSection}>
                <div className={styles.logoIcon}>
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="#ff6b9d"
                  >
                    <path
                      d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                      fill="#FF6B9D"
                    />
                  </svg>
                </div>
                <h1 className={styles.logoText}>AniTrack+</h1>
              </div>
              <p className={styles.subtitle}>Loading anime data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.registrationPage}>
      <div className={styles.backgroundPattern}></div>
      <div className={styles.floatingShapes}></div>

      <div className="container">
        <div className={styles.registrationCard}>
          <Link to="/my-animes" className={styles.backBtn}>
            ← Back to My List
          </Link>

          <div className={styles.cardHeader}>
            <div className={styles.logoSection}>
              <div className={styles.logoIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#ff6b9d">
                  <path
                    d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                    fill="#FF6B9D"
                  />
                </svg>
              </div>
              <h1 className={styles.logoText}>AniTrack+</h1>
            </div>
            <p className={styles.subtitle}>
              Update your anime watch list information here!
            </p>
            {animeData?.Anime && (
              <p
                className={styles.animeTitle}
                style={{
                  color: "#ff6b9d",
                  fontWeight: "bold",
                  marginTop: "10px",
                }}
              >
                Editing: {animeData.Anime.title}
              </p>
            )}
          </div>

          <form className={styles.registrationForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Watch Status</label>
              <select
                className={styles.formControl}
                value={watchStatus}
                onChange={(e) => setWatchStatus(e.target.value)}
                required
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Anime Score (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                className={styles.formControl}
                placeholder="Enter your personal score for this Anime (1-10)"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Episodes Watched</label>
              <input
                type="number"
                min="0"
                max={animeData?.Anime?.episodes || 9999}
                className={styles.formControl}
                placeholder="Enter how many episodes you have watched"
                value={episodesWatched}
                onChange={(e) => setEpisodesWatched(e.target.value)}
                required
              />
              {animeData?.Anime?.episodes && (
                <small style={{ color: "#888", fontSize: "12px" }}>
                  Total episodes: {animeData.Anime.episodes}
                </small>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Notes</label>
              <textarea
                className={styles.formControl}
                rows="4"
                placeholder="What do you want to say about this Anime?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ resize: "vertical", minHeight: "80px" }}
              />
            </div>

            <button
              type="submit"
              className={styles.createAccountBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Anime"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
