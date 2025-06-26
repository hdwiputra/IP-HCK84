"use client";

import "./SimpleFooter.css";

const SimpleFooter = () => {
  return (
    <footer className="simple-footer">
      <div className="container">
        <div className="footer-content">
          {/* Centered Logo */}
          <div className="footer-logo">
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
          </div>

          {/* Copyright */}
          <p className="copyright">© 2005 AniTrack+</p>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
