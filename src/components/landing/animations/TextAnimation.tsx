import React from "react";
import { motion } from "framer-motion";

interface TextAnimationProps {
  text: string;
  className?: string;
  isGreen?: boolean;
  delay?: number;
  type?: "letter" | "word";
  animation?: "slideUp" | "bounce";
}

const TextAnimation: React.FC<TextAnimationProps> = ({
  text,
  className = "",
  isGreen = false,
  delay = 0,
  type = "letter",
  animation = "slideUp",
}) => {
  const items = type === "letter" ? text.split("") : text.split(" ");

  return (
    <span className={`${isGreen ? "text-green-400" : ""} ${className}`}>
      {items.map((item, index) => (
        <motion.span
          key={`${text}-${index}`}
          className={`inline-block ${type === "word" ? "mr-[0.25em]" : ""}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: delay + index * (type === "letter" ? 0.05 : 0.03),
            duration: 0.5,
            ease: "easeOut",
          }}
          // Using animate instead of whileInView ensures the animation happens once and stays in place
          // No exit animation or continuous effects
        >
          {item}
        </motion.span>
      ))}
    </span>
  );
};

export default TextAnimation;
