import React from "react";
import CircleAnimation from "./CircleAnimation";

const BackgroundAnimation: React.FC = () => {
  const circles = [
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

  return (
    <div className="absolute bottom-0 left-0 w-full h-[60%] overflow-hidden">
      {circles.map((circle, index) => (
        <CircleAnimation key={index} {...circle} />
      ))}
    </div>
  );
};

export default BackgroundAnimation;
