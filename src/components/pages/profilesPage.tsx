import React from "react";
import GearsBackground from "../dashboard/GearsBackground";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const ProfilesPage = () => {
  const openDiscord = () => {
    window.open("https://discord.gg/5MbAqAhaCR", "_blank");
  };

  return (
    <div className="min-h-screen">
      <GearsBackground />
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {"Your profiles".split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block">
                  {word.split("").map((letter, index) => (
                    <motion.span
                      key={index}
                      className={`inline-block ${wordIndex === 1 && index < 8 ? "text-green-400" : ""}`}
                      initial={{ y: 0 }}
                      animate={{ y: [-20, 0] }}
                      transition={{
                        delay: (wordIndex * word.length + index) * 0.05,
                        duration: 0.5,
                        times: [0, 1],
                        ease: "easeOut",
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                  {wordIndex === 0 && (
                    <span className="inline-block">&nbsp;</span>
                  )}
                </span>
              ))}
            </motion.h1>
            <p className="text-gray-600">Manage your profiles</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => (window.location.href = "/")}
              className="text-white h-9 w-9 p-0 flex items-center justify-center rounded-md group relative overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-300">
                <svg
                  className="h-5 w-5 transition-colors duration-300 group-hover:text-green-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="text-white h-9 w-9 p-0 flex items-center justify-center rounded-md group relative overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-300">
                <svg
                  className="h-5 w-5 transition-colors duration-300 group-hover:text-green-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
            <Button
              onClick={openDiscord}
              className="text-white h-9 w-9 p-0 flex items-center justify-center rounded-md group relative overflow-hidden"
            >
              <span className="relative z-10 transition-colors duration-300">
                <svg
                  className="h-5 w-5 transition-colors duration-300 group-hover:text-green-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </div>
        </div>

        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your profiles will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilesPage;
