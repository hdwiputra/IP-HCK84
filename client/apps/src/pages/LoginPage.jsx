import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import styles from "./css_modules/RegistrationPage.module.css"; // Using the same CSS module

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const createFloatingShapes = () => {
    const container = document.querySelector(`.${styles.floatingShapes}`);
    if (container) {
      for (let i = 0; i < 20; i++) {
        const shape = document.createElement("div");
        shape.className = styles.floatingShape;
        shape.style.left = Math.random() * 100 + "%";
        shape.style.animationDelay = Math.random() * 10 + "s";
        shape.style.animationDuration = 10 + Math.random() * 20 + "s";
        container.appendChild(shape);
      }
    }
  };

  const checkExistingToken = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      Swal.fire({
        title: "Warning",
        text: "You are already logged in!",
        icon: "warning",
      });
      navigate("/");
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    checkExistingToken();

    // Add fade-in effect
    const card = document.querySelector(`.${styles.registrationCard}`);
    setTimeout(() => {
      card?.classList.add(styles.fadeIn);
    }, 100);

    // Create floating shapes
    createFloatingShapes();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if input is email or username
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const body = isEmail
        ? { email, password }
        : { username: email, password };

      const response = await axios.post("http://localhost:3000/login", body);

      console.log(response.data, "<<< handleSubmit");

      localStorage.setItem("access_token", response.data.access_token);

      Swal.fire({
        title: "Success",
        text: "Login successful!",
        icon: "success",
      });

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Something went wrong!",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
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
              />
            </div>

            <button
              type="submit"
              className={styles.createAccountBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerText}>OR</span>
          </div>

          <button className={styles.googleBtn}>
            <svg width="20" height="20" viewBox="0 0 20 20" className="me-2">
              <path
                fill="#4285F4"
                d="M19.6 10.23c0-.82-.07-1.43-.2-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
              />
              <path
                fill="#34A853"
                d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
              />
              <path
                fill="#FBBC05"
                d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
              />
              <path
                fill="#EA4335"
                d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
              />
            </svg>
            Continue with Google
          </button>

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
