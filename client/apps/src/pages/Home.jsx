import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";

export default function Home() {
  const [anime, setAnime] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchTopAnime = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios({
        method: "GET",
        url: "https://api.jikan.moe/v4/top/anime",
        params: {
          page: page,
          limit: 25,
        },
      });

      // Check for duplicates
      const seenIds = new Set();
      const uniqueAnime = response.data.data.filter((item) => {
        if (seenIds.has(item.mal_id)) {
          console.warn(
            `Duplicate anime found: ${item.title} (ID: ${item.mal_id})`
          );
          return false;
        }
        seenIds.add(item.mal_id);
        return true;
      });

      setAnime(uniqueAnime);
      setPagination(response.data.pagination);
    } catch (error) {
      let message = "Something went wrong!";
      if (error && error.response && error.response.data) {
        message = error.response.data.message || message;
      }
      console.log(error);
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
    fetchTopAnime(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(
      pagination.last_visible_page,
      startPage + maxVisiblePages - 1
    );

    // Previous button
    if (currentPage > 1) {
      buttons.push(
        <button
          key="prev"
          className="btn btn-outline-primary me-2"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={loading}
        >
          Previous
        </button>
      );
    }

    // First page button
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          className="btn btn-outline-secondary me-1"
          onClick={() => handlePageChange(1)}
          disabled={loading}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots1" className="me-2">
            ...
          </span>
        );
      }
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`btn me-1 ${
            i === currentPage ? "btn-primary" : "btn-outline-secondary"
          }`}
          onClick={() => handlePageChange(i)}
          disabled={loading}
        >
          {i}
        </button>
      );
    }

    // Last page button
    if (endPage < pagination.last_visible_page) {
      if (endPage < pagination.last_visible_page - 1) {
        buttons.push(
          <span key="dots2" className="me-2">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={pagination.last_visible_page}
          className="btn btn-outline-secondary me-2"
          onClick={() => handlePageChange(pagination.last_visible_page)}
          disabled={loading}
        >
          {pagination.last_visible_page}
        </button>
      );
    }

    // Next button
    if (
      pagination.has_next_page &&
      currentPage < pagination.last_visible_page
    ) {
      buttons.push(
        <button
          key="next"
          className="btn btn-outline-primary"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={loading}
        >
          Next
        </button>
      );
    }

    return buttons;
  };

  return (
    <>
      <h1>Home</h1>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center mb-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Pagination info */}
      {pagination.items && (
        <div className="text-center mb-3">
          <small className="text-muted">
            Showing {pagination.items.count} of{" "}
            {pagination.items.total.toLocaleString()} anime (Page {currentPage}{" "}
            of {pagination.last_visible_page})
          </small>
        </div>
      )}

      <div className="d-flex flex-row flex-wrap gap-3 justify-content-center">
        {anime.map((el) => {
          return (
            <div
              key={`${el.mal_id}-${el.title}`} // More unique key
              className="card mb-3"
              style={{ maxWidth: 540 }}
            >
              <div className="row g-0">
                <div className="col-md-4">
                  <img
                    src={el.images.jpg.large_image_url}
                    className="img-fluid rounded-start h-100 object-fit-cover"
                    alt={el.title_english || el.title || "Anime"}
                  />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{el.title}</h5>
                    <div className="mb-2">
                      <span className="badge bg-primary me-2">
                        Rating: {el.score || "N/A"}
                      </span>
                      <span className="badge bg-success">
                        Episodes: {el.episodes || "N/A"}
                      </span>
                    </div>
                    <p className="card-text small mb-1">
                      <strong>Status:</strong> {el.status || "Unknown"}
                    </p>
                    <p className="card-text small mb-2">
                      <strong>Genres:</strong>{" "}
                      {el.genres && el.genres.length > 0
                        ? el.genres.map((genre) => genre.name).join(", ")
                        : "N/A"}
                    </p>
                    <p className="card-text" style={{ fontSize: "0.9rem" }}>
                      {el.synopsis
                        ? el.synopsis.length > 150
                          ? el.synopsis.substring(0, 150) + "..."
                          : el.synopsis
                        : "No synopsis available."}
                    </p>
                    <div className="d-flex justify-content-end">
                      <Link to={el.url} target="_blank" className="me-2">
                        <button className="btn btn-outline-primary btn-sm">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination controls */}
      {pagination.last_visible_page > 1 && (
        <div className="d-flex justify-content-center mt-4 mb-4">
          <div className="d-flex flex-wrap justify-content-center align-items-center">
            {renderPaginationButtons()}
          </div>
        </div>
      )}
    </>
  );
}
