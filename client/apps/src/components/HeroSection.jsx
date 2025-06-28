"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import styles from "./css_modules/HeroSection.module.css";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    const nextSection = document.getElementById("main-content");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/register");
    }
  };

  return (
    <section className={styles.heroSection}>
      {/* Animated Background Elements */}
      <div className={styles.heroBackground}>
        <div className={styles.geometricPattern}></div>
        <div className={styles.floatingParticles}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={styles.particle}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            ></div>
          ))}
        </div>
        <div className={styles.waveOverlay}></div>
      </div>

      <div className="container h-100">
        <div className="row h-100 align-items-center">
          <div className="col-lg-8 col-xl-7">
            <div
              className={`${styles.heroContent} ${
                isVisible ? styles.fadeIn : ""
              }`}
            >
              {/* Japanese Tagline */}
              <div className={styles.japaneseTagline}>「私の視聴リスト」</div>

              {/* Main Title */}
              <h1 className={styles.heroTitle}>
                <span className={styles.titleAni}>ANI</span>
                <span className={styles.titleTrack}>TRACK+</span>
              </h1>

              {/* Description */}
              <p className={styles.heroDescription}>
                AniTrack+ is a personal project to help you keep track of your
                favorite anime and manga. You can manage your progress and
                discover new titles based on your preferences. Whether you're an
                anime enthusiast or a manga lover, this platform is for you.
              </p>

              {/* CTA Button */}
              <div className={styles.heroCta}>
                <button
                  className={`btn ${styles.ctaButton}`}
                  onClick={handleGetStarted}
                >
                  Get Started
                </button>
              </div>

              {/* Secondary Text */}
              <p className={styles.heroSecondary}>
                Join the community of fans and start building your watchlist
                today!
              </p>
            </div>
          </div>

          {/* Right Side Decoration */}
          <div className="col-lg-4 col-xl-5 d-none d-lg-block">
            <div className={styles.heroDecoration}>
              <svg
                className={styles.animeGraphic}
                viewBox="0 0 400 400"
                fill="none"
              >
                {/* Abstract anime-inspired shapes */}
                <circle
                  cx="200"
                  cy="150"
                  r="80"
                  fill="url(#gradient1)"
                  opacity="0.3"
                />
                <circle
                  cx="150"
                  cy="250"
                  r="60"
                  fill="url(#gradient2)"
                  opacity="0.4"
                />
                <circle
                  cx="280"
                  cy="220"
                  r="40"
                  fill="url(#gradient3)"
                  opacity="0.5"
                />

                {/* Geometric patterns */}
                <path
                  d="M100 100 L150 50 L200 100 L150 150 Z"
                  fill="url(#gradient1)"
                  opacity="0.2"
                />
                <path
                  d="M250 300 L300 250 L350 300 L300 350 Z"
                  fill="url(#gradient2)"
                  opacity="0.3"
                />

                <defs>
                  <linearGradient
                    id="gradient1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FF6B9D" />
                    <stop offset="100%" stopColor="#FFB7C5" />
                  </linearGradient>
                  <linearGradient
                    id="gradient2"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#B794F6" />
                    <stop offset="100%" stopColor="#FF6B9D" />
                  </linearGradient>
                  <linearGradient
                    id="gradient3"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFB7C5" />
                    <stop offset="100%" stopColor="#B794F6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
