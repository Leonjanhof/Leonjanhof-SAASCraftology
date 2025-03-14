import { ReactNode } from "react";
import GearsBackground from "../dashboard/GearsBackground";
import { motion } from "framer-motion";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <GearsBackground />
      <div className="max-w-md w-full px-4 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="inline-block">
              {"Craftology Inc.".split("").map((letter, index) => (
                <motion.span
                  key={index}
                  className={`inline-block ${letter === " " ? "mr-1" : ""} ${index >= 11 ? "text-green-400" : ""}`}
                  initial={{ y: 0 }}
                  animate={{ y: [-20, 0] }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    times: [0, 1],
                    ease: "easeOut",
                  }}
                >
                  {letter === " " ? "" : letter}
                </motion.span>
              ))}
            </span>
          </h1>
          <p className="text-gray-600 mt-2">
            powerful automation tools for your minecraft solutions
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
