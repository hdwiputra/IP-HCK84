"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import "./AnimeWatchlistCMS.css";

const AnimeWatchlistCMS = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const fetchMyAnime = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/animes/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data, "<<< fetchMyAnime");
      setAnimeList(response.data);
    } catch (error) {
      console.error("Error fetching anime:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (animeId) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/animes/${animeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data, "<<< handleDelete");

      Swal.fire({
        title: "Success",
        text: "Anime successfully dropped!",
        icon: "success",
      });

      fetchMyAnime();
    } catch (error) {
      console.error("Error deleting anime:", error);

      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Something went wrong!",
        icon: "error",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Completed: "status-completed",
      "In Progress": "status-on-hold",
    };

    return (
      <span className={`status-badge ${statusClasses[status] || ""}`}>
        {status}
      </span>
    );
  };

  const getScoreDisplay = (score) => {
    if (score === null) return <span className="no-score">—</span>;
    return (
      <div className="score-display">
        <span className="star">⭐</span>
        <span className="score-value">{score}</span>
      </div>
    );
  };

  useEffect(() => {
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Not Logged In",
        text: "Please login to view your watchlist",
      });
      navigate("/login");
      return;
    }

    fetchMyAnime();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="anime-cms">
        <div className="container">
          <div className="cms-header">
            <h1 className="cms-title">My Anime Watchlist</h1>
            <p className="cms-subtitle">Loading your anime...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="anime-cms">
      <div className="container">
        <div className="cms-header">
          <h1 className="cms-title">My Anime Watchlist</h1>
          <p className="cms-subtitle">
            Manage your anime tracking and progress
          </p>
        </div>

        {animeList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📺</div>
            <h3>No anime in your watchlist</h3>
            <p>Start adding anime to track your progress!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="anime-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Anime Name</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Episodes Watched</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {animeList.map((anime, index) => (
                  <tr key={anime.id} className="anime-row">
                    <td className="anime-number">{index + 1}</td>
                    <td className="anime-name">
                      <div className="name-cell">
                        <img
                          src={anime.Anime.image_url || "/placeholder.svg"}
                          alt={anime.Anime.title}
                          className="anime-thumbnail"
                        />
                        <span className="name-text">{anime.Anime.title}</span>
                      </div>
                    </td>
                    <td className="anime-status">
                      {getStatusBadge(anime.watch_status)}
                    </td>
                    <td className="anime-score">
                      {getScoreDisplay(anime.score)}
                    </td>
                    <td className="anime-episodes">
                      <span className="episode-progress">
                        {anime.episodes_watched} / {anime.Anime.episodes}
                      </span>
                    </td>
                    <td className="anime-notes">
                      <div className="notes-cell">
                        <span className="notes-text">{anime.notes}</span>
                      </div>
                    </td>
                    <td className="anime-actions">
                      <div className="action-buttons">
                        <button
                          className="action-btn details-btn"
                          onClick={() => navigate(`/animes/${anime.AnimeId}`)}
                          title="View Details"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                          Details
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => navigate(`/my-animes/${anime.id}`)}
                          title="Edit"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(anime.id)}
                          title="Delete"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <polyline
                              points="3,6 5,6 21,6"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                          Drop
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeWatchlistCMS;
