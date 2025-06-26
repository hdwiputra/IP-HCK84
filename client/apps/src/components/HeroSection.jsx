"use client";

import { useState, useEffect } from "react";
import "./HeroSection.css";
import { useNavigate } from "react-router";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger fade-in animation on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    // Smooth scroll to next section or navigate to signup
    const nextSection = document.getElementById("main-content");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to signup/login page
      navigate("/register");
      console.log("Navigate to get started");
    }
  };

  return (
    <section className="hero-section">
      {/* Animated Background Elements */}
      <div className="hero-background">
        <div className="geometric-pattern"></div>
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            ></div>
          ))}
        </div>
        <div className="wave-overlay"></div>
      </div>

      <div className="container h-100">
        <div className="row h-100 align-items-center">
          <div className="col-lg-8 col-xl-7">
            <div className={`hero-content ${isVisible ? "fade-in" : ""}`}>
              {/* Japanese Tagline */}
              <div className="japanese-tagline">「私の視聴リスト」</div>

              {/* Main Title */}
              <h1 className="hero-title">
                <span className="title-ani">ANI</span>
                <span className="title-track">TRACK+</span>
              </h1>

              {/* Description */}
              <p className="hero-description">
                AniTrack+ is a personal project to help you keep track of your
                favorite anime and manga. You can manage your progress and
                discover new titles based on your preferences. Whether you're an
                anime enthusiast or a manga lover, this platform is for you.
              </p>

              {/* CTA Button */}
              <div className="hero-cta">
                <button className="btn cta-button" onClick={handleGetStarted}>
                  Get Started
                </button>
              </div>

              {/* Secondary Text */}
              <p className="hero-secondary">
                Join the community of fans and start building your watchlist
                today!
              </p>
            </div>
          </div>

          {/* Right Side Decoration */}
          <div className="col-lg-4 col-xl-5 d-none d-lg-block">
            <div className="hero-decoration">
              <svg
                className="anime-graphic"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
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
