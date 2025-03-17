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
    // New circles
    {
      size: 18,
      duration: 22,
      bottom: "5%",
      left: "45%",
      animate: {
        x: [0, 60, -40, 30, 0],
        y: [0, -40, 30, -25, 0],
      },
    },
    {
      size: 22,
      duration: 17,
      bottom: "30%",
      left: "10%",
      animate: {
        x: [0, -50, 35, -25, 0],
        y: [0, 25, -35, 15, 0],
      },
    },
    {
      size: 12,
      duration: 19,
      bottom: "45%",
      left: "85%",
      animate: {
        x: [0, 35, -25, 45, 0],
        y: [0, -25, 35, -15, 0],
      },
    },
    {
      size: 26,
      duration: 23,
      bottom: "8%",
      left: "55%",
      animate: {
        x: [0, -35, 25, -45, 0],
        y: [0, 35, -25, 15, 0],
      },
    },
    {
      size: 10,
      duration: 16,
      bottom: "38%",
      left: "20%",
      animate: {
        x: [0, 45, -35, 25, 0],
        y: [0, -25, 35, -15, 0],
      },
    },
    {
      size: 30,
      duration: 28,
      bottom: "18%",
      left: "90%",
      animate: {
        x: [0, -25, 35, -45, 0],
        y: [0, 35, -25, 15, 0],
      },
    },
    // 10 more circles
    {
      size: 15,
      duration: 21,
      bottom: "12%",
      left: "5%",
      animate: {
        x: [0, 55, -35, 25, 0],
        y: [0, -35, 25, -15, 0],
      },
    },
    {
      size: 19,
      duration: 24,
      bottom: "28%",
      left: "48%",
      animate: {
        x: [0, -45, 30, -20, 0],
        y: [0, 30, -40, 20, 0],
      },
    },
    {
      size: 27,
      duration: 19,
      bottom: "42%",
      left: "78%",
      animate: {
        x: [0, 40, -30, 35, 0],
        y: [0, -30, 25, -20, 0],
      },
    },
    {
      size: 13,
      duration: 26,
      bottom: "3%",
      left: "65%",
      animate: {
        x: [0, -35, 25, -30, 0],
        y: [0, 25, -35, 15, 0],
      },
    },
    {
      size: 21,
      duration: 18,
      bottom: "33%",
      left: "3%",
      animate: {
        x: [0, 50, -40, 30, 0],
        y: [0, -20, 30, -25, 0],
      },
    },
    {
      size: 17,
      duration: 22,
      bottom: "48%",
      left: "40%",
      animate: {
        x: [0, -30, 40, -35, 0],
        y: [0, 35, -25, 20, 0],
      },
    },
    {
      size: 23,
      duration: 27,
      bottom: "7%",
      left: "82%",
      animate: {
        x: [0, 45, -35, 25, 0],
        y: [0, -35, 30, -20, 0],
      },
    },
    {
      size: 11,
      duration: 15,
      bottom: "22%",
      left: "15%",
      animate: {
        x: [0, -40, 30, -25, 0],
        y: [0, 30, -20, 15, 0],
      },
    },
    {
      size: 25,
      duration: 20,
      bottom: "37%",
      left: "92%",
      animate: {
        x: [0, 35, -45, 30, 0],
        y: [0, -25, 35, -30, 0],
      },
    },
    {
      size: 9,
      duration: 23,
      bottom: "50%",
      left: "30%",
      animate: {
        x: [0, -30, 40, -20, 0],
        y: [0, 40, -30, 20, 0],
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
