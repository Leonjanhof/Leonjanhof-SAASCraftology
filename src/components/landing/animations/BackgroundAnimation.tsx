import React from "react";
import CircleAnimation from "./CircleAnimation";

const BackgroundAnimation: React.FC = () => {
  // Static circles that move around
  const staticCircles = [
    {
      size: 20,
      duration: 15,
      bottom: "10%",
      left: "15%",
      animate: {
        x: [0, 50, -30, 20, 0],
        y: [0, -30, 20, -20, 0],
      },
    },
    {
      size: 32,
      duration: 20,
      bottom: "25%",
      left: "35%",
      animate: {
        x: [0, -40, 30, -20, 0],
        y: [0, 20, -30, 10, 0],
      },
    },
    {
      size: 16,
      duration: 12,
      bottom: "40%",
      left: "60%",
      animate: {
        x: [0, 30, -20, 40, 0],
        y: [0, -20, 30, -10, 0],
      },
    },
    {
      size: 24,
      duration: 18,
      bottom: "15%",
      left: "75%",
      animate: {
        x: [0, -30, 20, -40, 0],
        y: [0, 30, -20, 10, 0],
      },
    },
    {
      size: 28,
      duration: 25,
      bottom: "20%",
      left: "25%",
      animate: {
        x: [0, 40, -30, 20, 0],
        y: [0, -20, 30, -10, 0],
      },
    },
    {
      size: 14,
      duration: 14,
      bottom: "35%",
      left: "70%",
      animate: {
        x: [0, -20, 30, -40, 0],
        y: [0, 30, -20, 10, 0],
      },
    },
  ];

  // Falling circles that move downward
  const fallingCircles = Array.from({ length: 8 }, (_, index) => ({
    size: Math.random() * 18 + 10, // Random size between 10 and 28
    duration: Math.random() * 8 + 12, // Random duration between 12 and 20 seconds
    bottom: `${80 + Math.random() * 20}%`, // Start near the bottom
    left: `${Math.random() * 100}%`, // Random horizontal position
    animate: {
      y: [-30, 300], // Move downward
      opacity: [1, 0], // Fade out as it falls
    },
    transition: {
      repeat: Infinity,
      repeatDelay: Math.random() * 4,
      duration: Math.random() * 5 + 5,
    },
  }));

  return (
    <div className="absolute bottom-0 left-0 w-full h-[60%] overflow-visible">
      {/* Static circles */}
      {staticCircles.map((circle, index) => (
        <CircleAnimation key={`static-${index}`} {...circle} />
      ))}

      {/* Falling circles */}
      {fallingCircles.map((circle, index) => (
        <CircleAnimation
          key={`falling-${index}`}
          {...circle}
          isFalling={true}
        />
      ))}
    </div>
  );
};

export default BackgroundAnimation;
