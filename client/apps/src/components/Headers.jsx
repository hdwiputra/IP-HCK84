"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for access_token in localStorage
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className="anitrack-header sticky-top">
      <div className="container-fluid header-container">
        <div className="header-content">
          {/* Desktop Navigation - Left */}
          <nav className="desktop-nav d-none d-md-flex">
            <Link to={"/my-animes"} className="nav-link-custom">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="nav-icon"
              >
                <path
                  d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
                  fill="currentColor"
                />
                <path
                  d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z"
                  fill="currentColor"
                />
              </svg>
              My Watchlist
            </Link>
          </nav>

          {/* Logo Section - Center */}
          <div className="logo-section">
            <a href="/" className="logo-link">
              <div className="logo-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                    fill="#FF6B9D"
                  />
                </svg>
              </div>
              <span className="logo-text">AniTrack+</span>
            </a>
          </div>

          {/* Auth Section - Right */}
          <div className="auth-section">
            {isLoggedIn ? (
              <button
                className="btn auth-btn logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <button className="btn auth-btn login-btn" onClick={handleLogin}>
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle d-md-none btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle mobile menu"
          >
            <div className={`hamburger ${showMobileMenu ? "active" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`mobile-menu d-md-none ${showMobileMenu ? "show" : ""}`}
        >
          <div className="mobile-nav">
            <a href="/watchlist" className="mobile-nav-link">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="nav-icon"
              >
                <path
                  d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
                  fill="currentColor"
                />
                <path
                  d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z"
                  fill="currentColor"
                />
              </svg>
              My Watchlist
            </a>
            <div className="mobile-auth">
              {isLoggedIn ? (
                <button
                  className="btn auth-btn logout-btn mobile"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : (
                <button
                  className="btn auth-btn login-btn mobile"
                  onClick={handleLogin}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
