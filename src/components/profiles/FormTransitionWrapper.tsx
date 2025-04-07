import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FormTransitionWrapperProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction: "forward" | "backward";
}

const slideVariants = {
  enterFromRight: {
    position: "absolute",
    x: "100%",
    opacity: 0,
  },
  enterFromLeft: {
    position: "absolute",
    x: "-100%",
    opacity: 0,
  },
  center: {
    position: "relative",
    x: 0,
    opacity: 1,
    zIndex: 1,
  },
  exitToLeft: {
    position: "absolute",
    x: "-100%",
    opacity: 0,
  },
  exitToRight: {
    position: "absolute",
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
    <AnimatePresence mode="wait" initial={false}>
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
