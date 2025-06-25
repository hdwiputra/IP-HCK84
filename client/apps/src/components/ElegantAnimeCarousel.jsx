"use client";

import { useState, useEffect } from "react";
import "./ElegantAnimeCarousel.css";
import { Link } from "react-router";

const ElegantAnimeCarousel = ({ animeData = [] }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(6);

  // Calculate total pages
  const totalPages = Math.ceil(animeData.length / cardsPerView);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 850) {
        setCardsPerView(2);
      } else if (window.innerWidth < 1475) {
        setCardsPerView(4);
      } else {
        setCardsPerView(6);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  // Reset to first page if current page exceeds total pages
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0);
    }
  }, [currentPage, totalPages]);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleAddToWatchlist = (anime, e) => {
    e.stopPropagation();
    console.log("Added to watchlist:", anime.title);
    // Add subtle feedback here
  };

  // Get current page cards
  const getCurrentPageCards = () => {
    const startIndex = currentPage * cardsPerView;
    const endIndex = startIndex + cardsPerView;
    return animeData.slice(startIndex, endIndex);
  };

  return (
    <div className="elegant-anime-carousel">
      <div className="container">
        <h2 className="carousel-title">Popular Airing Anime</h2>

        <div className="carousel-wrapper">
          {/* Navigation Arrows */}
          {totalPages > 1 && (
            <>
              <button className="nav-arrow prev-arrow" onClick={prevPage}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <button className="nav-arrow next-arrow" onClick={nextPage}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Cards Container */}
          <div className="cards-container">
            {getCurrentPageCards().map((anime, index) => (
              <div key={anime.id || index} className="elegant-card">
                <div className="card-image-wrapper">
                  <img
                    src={
                      anime.image_url || "/placeholder.svg?height=400&width=280"
                    }
                    alt={anime.title}
                    className="card-poster"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=400&width=280";
                    }}
                  />

                  {/* Score Badge */}
                  {anime.score && (
                    <div className="score-badge">
                      <span className="star">⭐</span>
                      <span className="rating">{anime.score}</span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="hover-overlay">
                    <button
                      className="watchlist-button"
                      onClick={(e) => handleAddToWatchlist(anime, e)}
                    >
                      <svg
                        width="20"
                        height="20"
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

                {/* Card Info */}
                <div className="card-info">
                  <h3 className="card-title">{anime.title}</h3>
                  <div className="card-meta">
                    <span className="year">{anime.year}</span>
                    {anime.episodes && (
                      <span className="episodes">
                        {anime.episodes} episodes
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simple Page Indicators */}
        {totalPages > 1 && (
          <div className="page-indicators">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                className={`page-dot ${index === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ElegantAnimeCarousel;
