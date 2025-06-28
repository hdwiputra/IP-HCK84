"use client";

import { useState, useEffect } from "react";
import styles from "./css_modules/ElegantAnimeCarousel.module.css";

const ElegantAnimeCarousel = ({
  animeData = [],
  title = "Popular Airing Anime",
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(6);

  console.log(animeData, "<<< animeDataCarousel");

  // Calculate total pages
  const totalPages = Math.ceil(animeData.length / cardsPerView);

  const getDisplayYear = (anime) => {
    if (anime.year) return anime.year;
    if (anime.original?.aired_from) {
      return new Date(anime.original.aired_from).getFullYear();
    }
    if (anime.aired_from) {
      return new Date(anime.aired_from).getFullYear();
    }
    return "Unknown";
  };

  const updateCardsPerView = () => {
    if (window.innerWidth < 850) {
      setCardsPerView(2);
    } else if (window.innerWidth < 1475) {
      setCardsPerView(4);
    } else {
      setCardsPerView(6);
    }
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleCardClick = (animeId, e) => {
    e.preventDefault();

    // Open MAL page in new tab
    if (animeId) {
      window.open(`https://myanimelist.net/anime/${animeId}`, "_blank");
    } else {
      console.log("No MAL ID available");
    }
  };

  const getCurrentPageCards = () => {
    const startIndex = currentPage * cardsPerView;
    const endIndex = startIndex + cardsPerView;
    return animeData.slice(startIndex, endIndex);
  };

  useEffect(() => {
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

  // Reset currentPage when animeData changes
  useEffect(() => {
    setCurrentPage(0);
  }, [animeData]);

  return (
    <div className={styles.elegantAnimeCarousel}>
      <div className="container">
        <h2 className={styles.carouselTitle}>{title}</h2>

        <div className={styles.carouselWrapper}>
          {/* Navigation Arrows */}
          {totalPages > 1 && (
            <>
              <button
                className={`${styles.navArrow} ${styles.prevArrow}`}
                onClick={prevPage}
                aria-label="Previous page"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <button
                className={`${styles.navArrow} ${styles.nextArrow}`}
                onClick={nextPage}
                aria-label="Next page"
              >
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
          <div className={styles.cardsContainer} key={currentPage}>
            {getCurrentPageCards().map((anime, index) => {
              // Create a unique key that combines page and anime data
              const uniqueKey = `${currentPage}-${
                anime.id || anime.mal_id || index
              }-${anime.title}`;

              return (
                <div
                  key={uniqueKey}
                  className={styles.elegantCard}
                  onClick={(e) => handleCardClick(anime.id || anime.mal_id, e)}
                >
                  <div className={styles.cardImageWrapper}>
                    <img
                      src={
                        anime.image_url ||
                        anime.images?.jpg?.image_url ||
                        "/placeholder.svg?height=400&width=280"
                      }
                      alt={anime.title}
                      className={styles.cardPoster}
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=400&width=280";
                      }}
                    />

                    {/* Score Badge */}
                    {anime.score && (
                      <div className={styles.scoreBadge}>
                        <span className={styles.star}>⭐</span>
                        <span className={styles.rating}>{anime.score}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardTitle}>{anime.title}</h3>
                    <div className={styles.cardMeta}>
                      <span className={styles.year}>
                        {getDisplayYear(anime)}
                      </span>
                      {anime.episodes && (
                        <span className={styles.episodes}>
                          {anime.episodes} episodes
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Page Indicators */}
        {totalPages > 1 && (
          <div className={styles.pageIndicators}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                className={`${styles.pageDot} ${
                  index === currentPage ? styles.active : ""
                }`}
                onClick={() => setCurrentPage(index)}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ElegantAnimeCarousel;
