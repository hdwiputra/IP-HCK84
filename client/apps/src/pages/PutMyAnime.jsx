import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./RegistrationPage.css"; // Using the same CSS file

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

  // Check if user is authenticated
  useEffect(() => {
    if (!token) {
      Swal.fire({
        title: "Authentication Required",
        text: "Please login to access this page",
        icon: "warning",
      });
      navigate("/login");
      return;
    }
  }, [token, navigate]);

  const fetchMyAnimeId = async (id) => {
    try {
      const response = await axios({
        method: "GET",
        url: `http://localhost:3000/animes/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const anime = response.data;
      setAnimeData(anime);

      // Populate form with existing data
      setScore(anime.score || "");
      setEpisodesWatched(anime.episodes_watched || "");
      setNotes(anime.notes || "");
      setWatchStatus(anime.watch_status || "In Progress");

      console.log(response.data, "<<< fetchMyAnimesId");
    } catch (error) {
      let message = "Something went wrong!";
      if (error && error.response && error.response.data) {
        message = error.response.data.message;
      }
      console.log(error);

      Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
      });
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
      const response = await axios({
        method: "PUT",
        url: `http://localhost:3000/animes/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          score: score ? parseInt(score) : null,
          episodes_watched: episodesWatched ? parseInt(episodesWatched) : 0,
          notes: notes,
          watch_status: watchStatus,
        },
      });

      console.log(response, "<<===putMyAnimes");

      Swal.fire({
        title: "Success",
        text: "Anime updated successfully!",
        icon: "success",
      });

      navigate("/my-animes");
    } catch (error) {
      let message = "Something went wrong!";
      if (error && error.response && error.response.data) {
        message = error.response.data.message;
      }
      console.log(error);

      Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchMyAnimeId(id);
    }

    // Add fade-in effect
    const timer = setTimeout(() => {
      const card = document.querySelector(".registration-card");
      card?.classList.add("fade-in");
    }, 100);

    // Create floating shapes
    const container = document.querySelector(".floating-shapes");
    if (container) {
      // Clear existing shapes first
      container.innerHTML = "";
      for (let i = 0; i < 20; i++) {
        const shape = document.createElement("div");
        shape.className = "floating-shape";
        shape.style.left = Math.random() * 100 + "%";
        shape.style.animationDelay = Math.random() * 10 + "s";
        shape.style.animationDuration = 10 + Math.random() * 20 + "s";
        container.appendChild(shape);
      }
    }

    return () => clearTimeout(timer);
  }, [id, token]);

  // Don't render anything if no token
  if (!token) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="registration-page">
        <div className="background-pattern"></div>
        <div className="container">
          <div className="registration-card">
            <div className="card-header">
              <div className="logo-section">
                <div className="logo-icon">
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
                <h1 className="logo-text">AniTrack+</h1>
              </div>
              <br />
              <p className="subtitle">Loading anime data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-page">
      <div className="background-pattern"></div>
      <div className="floating-shapes"></div>

      <div className="container">
        <div className="registration-card">
          <Link
            to={"/my-animes"}
            className="back-btn"
            style={{ textDecoration: "none", color: "white" }}
          >
            <p>← Back to My List</p>
          </Link>
          <div className="card-header">
            <div className="logo-section">
              <div className="logo-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#ff6b9d">
                  <path
                    d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                    fill="#FF6B9D"
                  />
                </svg>
              </div>
              <h1 className="logo-text">AniTrack+</h1>
            </div>
            <br />
            <br />
            <p className="subtitle">
              Update your anime watch list information here!
            </p>
            {animeData && animeData.Anime && (
              <p
                className="anime-title"
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

          <form className="registration-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Watch Status</label>
              <select
                className="form-control"
                value={watchStatus}
                onChange={(e) => setWatchStatus(e.target.value)}
                required
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Anime Score (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-control"
                placeholder="Enter your personal score for this Anime (1-10)"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Episodes Watched (Max: {animeData.Anime.episodes})
              </label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Enter how many episodes you have watched"
                value={episodesWatched}
                onChange={(e) => setEpisodesWatched(e.target.value)}
                required
              />
              {animeData && animeData.Anime && animeData.Anime.episodes && (
                <small style={{ color: "#888", fontSize: "12px" }}>
                  Total episodes: {animeData.Anime.episodes}
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="What do you want to say about this Anime?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ resize: "vertical", minHeight: "80px" }}
              />
            </div>
            <br />

            <button
              type="submit"
              className="create-account-btn"
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
