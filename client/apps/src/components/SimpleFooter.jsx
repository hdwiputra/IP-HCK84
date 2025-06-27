"use client";

import styles from "./css_modules/SimpleFooter.module.css";

const SimpleFooter = () => {
  return (
    <footer className={styles.simpleFooter}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <div className={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                  fill="#FF6B9D"
                />
              </svg>
            </div>
            <span className={styles.logoText}>AniTrack+</span>
          </div>

          <p className={styles.copyright}>© 2025 AniTrack+</p>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
