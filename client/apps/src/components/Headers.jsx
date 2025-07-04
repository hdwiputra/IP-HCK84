"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout, initializeAuth } from "../store/authSlice";
import { useAuth } from "../hooks/useAuth";
import styles from "./css_modules/Header.module.css";

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Gunakan Redux state instead of localStorage
  const { isAuthenticated, user, initialized } = useAuth();

  // Initialize auth state when component mounts
  useEffect(() => {
    if (!initialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, initialized]);

  const handleLogout = () => {
    // Gunakan Redux logout action
    dispatch(logout());
    setShowMobileMenu(false); // Close mobile menu
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/login");
    setShowMobileMenu(false); // Close mobile menu
  };

  return (
    <header className={`${styles.anitrackHeader} sticky-top`}>
      <div className={`container-fluid ${styles.headerContainer}`}>
        <div className={styles.headerContent}>
          {/* Desktop Navigation - Left */}
          <nav className={`${styles.desktopNav} d-none d-md-flex`}>
            <Link to="/my-animes" className={styles.navLinkCustom}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className={styles.navIcon}
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
            <Link to={`/my-genres/`} className={styles.navLinkCustom}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className={styles.navIcon}
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
              My Genres
            </Link>
          </nav>

          {/* Logo Section - Center */}
          <div className={styles.logoSection}>
            <Link to="/" className={styles.logoLink}>
              <div className={styles.logoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                    fill="#FF6B9D"
                  />
                </svg>
              </div>
              <span className={styles.logoText}>AniTrack+</span>
            </Link>
          </div>

          {/* Auth Section - Right */}
          <div className={styles.authSection}>
            {isAuthenticated ? (
              <div className={styles.userSection}>
                {user?.fullName && (
                  <span className={styles.userName} style={{ marginRight: 15 }}>
                    Hi, {user.fullName}{" "}
                  </span>
                )}
                <button
                  className={`btn ${styles.authBtn} ${styles.logoutBtn}`}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                className={`btn ${styles.authBtn} ${styles.loginBtn}`}
                onClick={handleLogin}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`${styles.mobileMenuToggle} d-md-none btn`}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle mobile menu"
          >
            <div
              className={`${styles.hamburger} ${
                showMobileMenu ? styles.active : ""
              }`}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`${styles.mobileMenu} d-md-none ${
            showMobileMenu ? styles.show : ""
          }`}
        >
          <div className={styles.mobileNav}>
            <Link
              to="/my-animes"
              className={styles.mobileNavLink}
              onClick={() => setShowMobileMenu(false)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className={styles.navIcon}
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
            <Link
              to="/my-genres"
              className={styles.mobileNavLink}
              onClick={() => setShowMobileMenu(false)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className={styles.navIcon}
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
              My Genres
            </Link>
            <div className={styles.mobileAuth}>
              {isAuthenticated ? (
                <div className={styles.mobileUserSection}>
                  {user?.fullName && (
                    <span className={styles.mobileUserName}>
                      Hi, {user.fullName}
                    </span>
                  )}
                  <button
                    className={`btn ${styles.authBtn} ${styles.logoutBtn} ${styles.mobile}`}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  className={`btn ${styles.authBtn} ${styles.loginBtn} ${styles.mobile}`}
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
