import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import styles from "./css_modules/RegistrationPage.module.css";
import { loginUser, loginWithGoogle, clearError } from "../store/authSlice";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();

  // Create floating shapes animation
  const createFloatingShapes = () => {
    const container = document.querySelector(`.${styles.floatingShapes}`);
    if (!container) return;

    for (let i = 0; i < 20; i++) {
      const shape = document.createElement("div");
      shape.className = styles.floatingShape;
      shape.style.left = Math.random() * 100 + "%";
      shape.style.animationDelay = Math.random() * 10 + "s";
      shape.style.animationDuration = 10 + Math.random() * 20 + "s";
      container.appendChild(shape);
    }
  };

  // Handle Google OAuth response
  const handleCredentialResponse = async (response) => {
    try {
      const result = await dispatch(loginWithGoogle(response.credential));

      if (loginWithGoogle.fulfilled.match(result)) {
        Swal.fire({
          title: "Success",
          text: "Login successful!",
          icon: "success",
        });
        navigate("/");
      }
    } catch (error) {
      // Error is already handled in Redux, but we can show additional UI feedback here
      console.error("Google login error:", error);
    }
  };

  // Initialize Google OAuth
  const initializeGoogleAuth = () => {
    const VITE_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        {
          theme: "filled_black",
          size: "large",
          width: 500,
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
        }
      );
    }
  };

  // Add fade-in animation
  const addFadeInEffect = () => {
    const card = document.querySelector(`.${styles.registrationCard}`);
    setTimeout(() => {
      card?.classList.add(styles.fadeIn);
    }, 100);
  };

  // Initialize component
  useEffect(() => {
    // Check if user is already logged in using Redux state
    if (isAuthenticated) {
      Swal.fire({
        title: "Warning",
        text: "You are already logged in!",
        icon: "warning",
      });
      navigate("/");
      return;
    }

    initializeGoogleAuth();
    addFadeInEffect();
    createFloatingShapes();

    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  // Show error messages from Redux state
  useEffect(() => {
    if (error) {
      Swal.fire({
        title: "Error",
        text: error,
        icon: "error",
      });
      // Clear the error after showing it
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(result)) {
        Swal.fire({
          title: "Success",
          text: "Login successful!",
          icon: "success",
        });
        navigate("/");
      }
      // If the action was rejected, the error will be handled by the useEffect above
    } catch (error) {
      // This shouldn't happen with Redux Toolkit, but just in case
      console.error("Unexpected login error:", error);
    }
  };

  return (
    <div className={styles.registrationPage}>
      <div className={styles.backgroundPattern}></div>
      <div className={styles.floatingShapes}></div>

      <div className="container">
        <div className={styles.registrationCard}>
          <Link to="/" className={styles.backBtn}>
            ← Back
          </Link>

          <div className={styles.cardHeader}>
            <div className={styles.logoSection}>
              <div className={styles.logoIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#ff6b9d">
                  <path
                    d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                    fill="#FF6B9D"
                  />
                </svg>
              </div>
              <h1 className={styles.logoText}>AniTrack+</h1>
            </div>
            <p className={styles.subtitle}>
              Welcome back! Login to continue tracking your anime
            </p>
          </div>

          <form className={styles.registrationForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Username or Email</label>
              <input
                type="text"
                className={styles.formControl}
                placeholder="Enter your username or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading} // Disable input during loading
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Password</label>
              <input
                type="password"
                className={styles.formControl}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading} // Disable input during loading
              />
            </div>

            <button
              type="submit"
              className={styles.createAccountBtn}
              disabled={loading} // Use Redux loading state
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerText}>OR</span>
          </div>

          <div className={styles.googleButtonContainer}>
            <div id="buttonDiv"></div>
          </div>

          <div className={styles.cardFooter}>
            <p className={styles.signinLink}>
              Don't have an account?{" "}
              <Link to="/register" className={styles.link}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
