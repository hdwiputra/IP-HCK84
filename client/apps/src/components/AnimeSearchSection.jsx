import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import http from "../lib/http";
import Swal from "sweetalert2";
import LoadingSpinner from "./LoadingSpinner";
import styles from "./css_modules/AnimeSearchSection.module.css";

const AnimeSearchSection = () => {
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

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const fetchGenres = async () => {
    try {
      const response = await http.get("/pub/genres");
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

      const response = await http.get(`/pub/animes?${params}`);
      console.log(response.data, "<<< fetchAnimeComponent");

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
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenre("");
    setSortBy("id");
    setSortOrder("asc");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAddToWatchlist = async (anime, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Authentication Required",
        text: "You need to login first before adding anime to your watchlist!",
      });
      navigate("/login");
      return;
    }

    try {
      const response = await http.post(
        `/animes/${anime.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data, "<<< handleAddToWatchList");

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

  // Fetch genres on mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch anime whenever search params change
  useEffect(() => {
    fetchAnime();
  }, [searchQuery, selectedGenre, sortBy, sortOrder, pagination.page]);

  return (
    <section className={styles.animeSearchSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Explore Anime Collection</h2>

        {/* Search and Filter Controls */}
        <div className={styles.searchControls}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <div className={styles.searchInputGroup}>
              <input
                type="text"
                placeholder="Search anime titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
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

          <div className={styles.filterControls}>
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={styles.filterSelect}
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.name}>
                  {genre.name}
                </option>
              ))}
            </select>

            <div className={styles.sortControls}>
              <label>Sort by:</label>
              <button
                onClick={() => handleSortChange("title")}
                className={`${styles.sortButton} ${
                  sortBy === "title" ? styles.active : ""
                }`}
              >
                Title {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSortChange("score")}
                className={`${styles.sortButton} ${
                  sortBy === "score" ? styles.active : ""
                }`}
              >
                Score {sortBy === "score" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSortChange("aired_from")}
                className={`${styles.sortButton} ${
                  sortBy === "aired_from" ? styles.active : ""
                }`}
              >
                Year{" "}
                {sortBy === "aired_from" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
            </div>

            <button
              onClick={clearFilters}
              className={styles.clearFiltersButton}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className={styles.resultsInfo}>
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
            <div className={styles.animeGrid}>
              {animeList.map((anime) => (
                <Link
                  to={`/animes/${anime.id}`}
                  key={anime.id}
                  className={styles.animeCardLink}
                >
                  <div className={styles.animeCard}>
                    <div className={styles.cardImage}>
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
                        <div className={styles.scoreBadge}>
                          <span>⭐ {anime.score}</span>
                        </div>
                      )}

                      <div className={styles.hoverOverlay}>
                        <button
                          className={styles.watchlistButton}
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
                    </div>
                    <div className={styles.cardContent}>
                      <h3 className={styles.animeTitle}>{anime.title}</h3>
                      {anime.title_english &&
                        anime.title_english !== anime.title && (
                          <p className={styles.animeTitleEnglish}>
                            {anime.title_english}
                          </p>
                        )}
                      <div className={styles.animeMeta}>
                        <span className={styles.year}>
                          {anime.year ||
                            (anime.aired_from
                              ? new Date(anime.aired_from).getFullYear()
                              : "Unknown")}
                        </span>
                        <span className={styles.episodes}>
                          {anime.episodes} episodes
                        </span>
                        <span className={styles.status}>{anime.status}</span>
                      </div>
                      <div className={styles.animeGenres}>
                        {anime.genre?.slice(0, 3).map((genre, index) => (
                          <span key={index} className={styles.genreTag}>
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
              <div className={styles.noResults}>
                <p>No anime found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className={styles.clearFiltersButton}
                >
                  Clear filters and try again
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPage > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={styles.paginationButton}
                >
                  Previous
                </button>

                <div className={styles.paginationInfo}>
                  <span>
                    Page {pagination.page} of {pagination.totalPage}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPage}
                  className={styles.paginationButton}
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
