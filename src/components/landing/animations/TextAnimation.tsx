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

  // For word type animations, we need to group words for mobile responsiveness
  if (type === "word") {
    return (
      <div
        className={`${isGreen ? "text-green-400" : ""} ${className} flex flex-wrap justify-center`}
      >
        {items.map((item, index) => {
          // Calculate which group this word belongs to (for mobile, 2 words per row)
          const groupIndex = Math.floor(index / 2);
          // Calculate delay based on group index instead of individual word index for mobile
          const mobileDelay = delay + groupIndex * 0.1;
          // Use regular delay for larger screens
          const desktopDelay = delay + index * 0.03;

          return (
            <motion.span
              key={`${text}-${index}`}
              className="inline-block px-1 py-0.5"
              initial="hidden"
              whileInView="visible"
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: {
                    // Use different delays based on screen size
                    delay: `clamp(${mobileDelay}s, (100vw - 640px) * 1000, ${desktopDelay}s)`,
                    duration: 0.5,
                    ease: "easeOut",
                  },
                },
              }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {item}
            </motion.span>
          );
        })}
      </div>
    );
  }

  // For letter animations, keep the original implementation
  return (
    <span className={`${isGreen ? "text-green-400" : ""} ${className}`}>
      {items.map((item, index) => (
        <motion.span
          key={`${text}-${index}`}
          className="inline-block"
          initial="hidden"
          whileInView="visible"
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: {
                delay: delay + index * 0.05,
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
