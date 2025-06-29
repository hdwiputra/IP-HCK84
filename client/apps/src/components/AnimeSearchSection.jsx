import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import LoadingSpinner from "./LoadingSpinner";
import "./AnimeSearchSection.css";
import { Link, useNavigate } from "react-router";

const AnimeSearchSection = () => {
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalData: 0,
    totalPage: 0,
    dataPerPage: 15,
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch genres on component mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch anime whenever search params change
  useEffect(() => {
    fetchAnime();
  }, [searchQuery, selectedGenre, sortBy, sortOrder, pagination.page]);

  const fetchGenres = async () => {
    try {
      const response = await axios.get("http://localhost:3000/pub/genres");
      setGenres(response.data);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchAnime = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);
      if (selectedGenre) params.append("filter", selectedGenre);

      // Handle sorting
      const sortParam = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      params.append("sort", sortParam);

      // Pagination
      params.append("page[number]", pagination.page);
      params.append("page[size]", pagination.dataPerPage);

      const response = await axios.get(
        `http://localhost:3000/pub/animes?${params}`
      );
      console.log(response.data, "<<==fetchAnime");

      setAnimeList(response.data.data);
      setPagination((prev) => ({
        ...prev,
        totalData: response.data.totalData,
        totalPage: response.data.totalPage,
      }));
    } catch (error) {
      console.error("Error fetching anime:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch anime data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    fetchAnime();
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // New field, default to ascending
      setSortBy(field);
      setSortOrder("asc");
    }
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenre("");
    setSortBy("id");
    setSortOrder("asc");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAddToWatchlist = async (anime, e) => {
    e.preventDefault(); // Prevent navigation when clicking watchlist button
    e.stopPropagation();
    // console.log("Added to watchlist:", anime.title);
    // Add your watchlist logic here
    try {
      if (!token) {
        navigate("/login");
        Swal.fire({
          icon: "warning",
          title: "You are not logged in!",
          text: `You need to login first before adding data to watch list!`,
        });
      } else {
        const response = await axios({
          method: "post",
          url: `http://localhost:3000/animes/${anime.id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data, "<<< addToWatchlist");
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `${anime.title} has been added to your watchlist!`,
        });
      }
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
    }
  };

  return (
    <section className="anime-search-section">
      <div className="container">
        <h2 className="section-title">Explore Anime Collection</h2>

        {/* Search and Filter Controls */}
        <div className="search-controls">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search anime titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
          </form>

          <div className="filter-controls">
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="filter-select"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.name}>
                  {genre.name}
                </option>
              ))}
            </select>

            <div className="sort-controls">
              <label>Sort by:</label>
              <button
                onClick={() => handleSortChange("title")}
                className={`sort-button ${sortBy === "title" ? "active" : ""}`}
              >
                Title {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSortChange("score")}
                className={`sort-button ${sortBy === "score" ? "active" : ""}`}
              >
                Score {sortBy === "score" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSortChange("aired_from")}
                className={`sort-button ${
                  sortBy === "aired_from" ? "active" : ""
                }`}
              >
                Year{" "}
                {sortBy === "aired_from" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
            </div>

            <button onClick={clearFilters} className="clear-filters-button">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          <p>
            Showing {animeList.length} of {pagination.totalData} anime
            {searchQuery && ` for "${searchQuery}"`}
            {selectedGenre && ` in ${selectedGenre}`}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner
            text="Searching Anime"
            subtext="Finding the perfect anime for you"
          />
        ) : (
          <>
            {/* Anime Grid */}
            <div className="anime-grid">
              {animeList.map((anime) => (
                <Link
                  to={`/animes/${anime.id}`}
                  key={anime.id}
                  className="anime-card-link"
                >
                  <div className="anime-card">
                    <div className="card-image">
                      <img
                        src={
                          anime.image_url ||
                          "/placeholder.svg?height=300&width=200"
                        }
                        alt={anime.title}
                        onError={(e) => {
                          e.target.src =
                            "/placeholder.svg?height=300&width=200";
                        }}
                      />
                      {anime.score && (
                        <div className="score-badge">
                          <span>⭐ {anime.score}</span>
                        </div>
                      )}

                      {/* THIS IS THE NEW HOVER OVERLAY WITH WATCHLIST BUTTON */}
                      <div className="hover-overlay">
                        <button
                          className="watchlist-button"
                          onClick={(e) => handleAddToWatchlist(anime, e)}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                          </svg>
                          Add to Watchlist
                        </button>
                      </div>
                      {/* END OF NEW HOVER OVERLAY */}
                    </div>
                    <div className="card-content">
                      <h3 className="anime-title">{anime.title}</h3>
                      {anime.title_english &&
                        anime.title_english !== anime.title && (
                          <p className="anime-title-english">
                            {anime.title_english}
                          </p>
                        )}
                      <div className="anime-meta">
                        <span className="year">
                          {anime.year ||
                            (anime.aired_from
                              ? new Date(anime.aired_from).getFullYear()
                              : "Unknown")}
                        </span>
                        <span className="episodes">
                          {anime.episodes} episodes
                        </span>
                        <span className="status">{anime.status}</span>
                      </div>
                      <div className="anime-genres">
                        {anime.genre?.slice(0, 3).map((genre, index) => (
                          <span key={index} className="genre-tag">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* No Results */}
            {animeList.length === 0 && (
              <div className="no-results">
                <p>No anime found matching your criteria.</p>
                <button onClick={clearFilters} className="clear-filters-button">
                  Clear filters and try again
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPage > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="pagination-button"
                >
                  Previous
                </button>

                <div className="pagination-info">
                  <span>
                    Page {pagination.page} of {pagination.totalPage}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPage}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default AnimeSearchSection;
