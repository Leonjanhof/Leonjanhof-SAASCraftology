import React from "react";
import { motion } from "framer-motion";

interface DrippingCircleProps {
  size: number;
  duration: number;
  delay: number;
  left: string;
}

const DrippingCircle: React.FC<DrippingCircleProps> = ({
  size,
  duration,
  delay,
  left,
}) => {
  return (
    <motion.div
      className="absolute rounded-full bg-gray-400/10"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 300, opacity: [0, 1, 1, 0.7, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 5 + 2,
        ease: "easeIn",
      }}
      style={{
        top: "-20px",
        left,
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};

const DrippingCircles: React.FC = () => {
  // Create an array of dripping circles with different properties
  const drippingCircles = Array.from({ length: 12 }, (_, index) => ({
    id: index,
    size: Math.random() * 20 + 8, // Random size between 8 and 28
    duration: Math.random() * 4 + 3, // Random duration between 3 and 7 seconds
    delay: Math.random() * 5, // Random delay between 0 and 5 seconds
    left: `${Math.random() * 100}%`, // Random horizontal position
  }));

  return (
    <div className="absolute top-0 left-0 w-full overflow-hidden h-32 z-10 pointer-events-none">
      {drippingCircles.map((circle) => (
        <DrippingCircle
          key={circle.id}
          size={circle.size}
          duration={circle.duration}
          delay={circle.delay}
          left={circle.left}
        />
      ))}
    </div>
  );
};

export default DrippingCircles;
