import React from "react";

const TestComponent: React.FC = () => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f4ff",
        overflow: "hidden",
      }}
    >
      {/* Animated Logo Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "96px",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        {/* Logo slides from right */}
        <img
          src="/logo.svg"
          alt="UW Shuffle Logo"
          style={{
            width: "360px",
            height: "360px",
            animation: "slideFromRight 0.3s ease-out 0.05s forwards",
          }}
        />

        {/* Text slides from left */}
        <div
          style={{
            fontSize: "240px",
            fontWeight: "800",
            color: "#0f172a",
            animation: "slideFromLeft 0.3s ease-out 0.05s forwards",
            letterSpacing: "-0.025em",
            whiteSpace: "nowrap",
          }}
        >
          UW Shuffle
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideFromLeft {
            from {
              opacity: 0;
              transform: translateX(-200px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideFromRight {
            from {
              opacity: 0;
              transform: translateX(200px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default TestComponent;
