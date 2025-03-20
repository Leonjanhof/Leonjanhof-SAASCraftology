import React from "react";
import { motion } from "framer-motion";

interface CircleAnimationProps {
  size: number;
  duration: number;
  bottom: string;
  left: string;
  animate: {
    x?: number[];
    y?: number[];
    opacity?: number[];
  };
  isFalling?: boolean;
  transition?: {
    repeat?: number | "Infinity";
    repeatDelay?: number;
    duration?: number;
    ease?: string;
  };
}

const CircleAnimation: React.FC<CircleAnimationProps> = ({
  size,
  duration,
  bottom,
  left,
  animate,
  isFalling = false,
  transition,
}) => {
  const defaultTransition = {
    duration,
    repeat: Infinity,
    ease: isFalling ? "easeIn" : "linear",
    ...transition,
  };

  return (
    <motion.div
      className="absolute rounded-full bg-gray-400/10"
      animate={animate}
      transition={defaultTransition}
      style={{
        bottom,
        left,
        width: `${size}px`,
        height: `${size}px`,
        zIndex: isFalling ? 20 : 10,
      }}
    />
  );
};

export default CircleAnimation;
