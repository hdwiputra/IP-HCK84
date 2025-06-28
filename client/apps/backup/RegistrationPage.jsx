import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styles from "./css_modules/RegistrationPage.module.css";
import http from "../lib/http";

export default function RegistrationPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Check if user is already logged in
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

  // Handle Google OAuth response
  const handleCredentialResponse = async (response) => {
    try {
      const res = await http.post("/login/google", {
        googleToken: response.credential,
      });

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      Swal.fire({
        title: "Success",
        text: "Account created successfully!",
        icon: "success",
      });

      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Something went wrong!",
        icon: "error",
      });
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
          text: "signup_with",
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
    checkExistingToken();
    initializeGoogleAuth();
    addFadeInEffect();
    createFloatingShapes();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreeToTerms) {
      Swal.fire({
        title: "Error",
        text: "Please agree to the terms and conditions",
        icon: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await http.post("/register", {
        fullName,
        username,
        email,
        password,
      });

      Swal.fire({
        title: "Success",
        text: "Account created successfully!",
        icon: "success",
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
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
              Create your account and start anime tracking+
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.registrationForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name</label>
              <input
                type="text"
                className={styles.formControl}
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Username</label>
              <input
                type="text"
                className={styles.formControl}
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input
                type="email"
                className={styles.formControl}
                placeholder="Enter your email"
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formCheck}>
                <input
                  type="checkbox"
                  className={styles.formCheckInput}
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
                <label className={styles.formCheckLabel} htmlFor="terms">
                  I agree to the{" "}
                  <a href="#" className={styles.termsLink}>
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className={styles.termsLink}>
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className={styles.createAccountBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
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
              Already have an account?{" "}
              <Link to="/login" className={styles.link}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
