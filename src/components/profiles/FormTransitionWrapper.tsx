import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FormTransitionWrapperProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction: "forward" | "backward";
}

const slideVariants = {
  enterFromRight: {
    x: "100%",
    opacity: 0,
  },
  enterFromLeft: {
    x: "-100%",
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exitToLeft: {
    x: "-100%",
    opacity: 0,
  },
  exitToRight: {
    x: "100%",
    opacity: 0,
  },
};

const FormTransitionWrapper: React.FC<FormTransitionWrapperProps> = ({
  children,
  isVisible,
  direction,
}) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={direction === "forward" ? "enterFromRight" : "enterFromLeft"}
          animate="center"
          exit={direction === "forward" ? "exitToLeft" : "exitToRight"}
          variants={slideVariants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ width: "100%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FormTransitionWrapper;
