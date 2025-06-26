import React from "react";

const LoadingSpinner = ({
  text = "Loading",
  subtext = "",
  size = "50px",
  showDots = true,
}) => {
  return (
    <div className="loading-container">
      <div
        className="loading-spinner"
        style={{ width: size, height: size }}
      ></div>
      <div className="loading-text">
        {text}
        {showDots && (
          <span className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
        )}
      </div>
      {subtext && <div className="loading-subtext">{subtext}</div>}
    </div>
  );
};

export default LoadingSpinner;
