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

  const getAnimation = (index: number) => {
    if (animation === "bounce") {
      return {
        initial: { y: 0 },
        animate: { y: [-20, 0] },
        transition: {
          delay: delay + index * 0.1,
          duration: 0.5,
          times: [0, 1],
          ease: "easeOut",
        },
      };
    }

    return {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: {
        delay: delay + index * (type === "letter" ? 0.05 : 0.03),
        duration: 0.5,
        ease: "easeOut",
      },
      viewport: { once: true, margin: "-100px" },
    };
  };

  return (
    <span className={`${isGreen ? "text-green-400" : ""} ${className}`}>
      {items.map((item, index) => (
        <motion.span
          key={`${text}-${index}`}
          className={`inline-block ${type === "word" ? "mr-[0.25em]" : ""}`}
          initial="hidden"
          whileInView="visible"
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: {
                delay: delay + index * (type === "letter" ? 0.05 : 0.03),
                duration: 0.5,
                ease: "easeOut",
              },
            },
          }}
          viewport={{ once: true, margin: "-100px" }}
        >
          {item}
        </motion.span>
      ))}
    </span>
  );
};

export default TextAnimation;
