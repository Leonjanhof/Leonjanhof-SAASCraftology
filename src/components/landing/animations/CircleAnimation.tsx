import React from "react";
import { motion } from "framer-motion";

interface CircleAnimationProps {
  size: number;
  duration: number;
  bottom: string;
  left: string;
  animate: {
    x: number[];
    y: number[];
  };
}

const CircleAnimation: React.FC<CircleAnimationProps> = ({
  size,
  duration,
  bottom,
  left,
  animate,
}) => {
  return (
    <motion.div
      className={`absolute w-${size} h-${size} rounded-full bg-gray-400/10`}
      animate={animate}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        bottom,
        left,
      }}
    />
  );
};

export default CircleAnimation;
