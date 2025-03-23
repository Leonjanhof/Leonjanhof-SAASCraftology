import { CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import GearsBackground from "../dashboard/GearsBackground";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Success() {
  const location = useLocation();
  const [isCanceled, setIsCanceled] = useState(false);

  useEffect(() => {
    // Check if the URL has a canceled=true parameter
    const params = new URLSearchParams(location.search);
    setIsCanceled(params.get("canceled") === "true");
  }, [location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GearsBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center relative z-10"
      >
        {isCanceled ? (
          // Payment canceled content
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-gray-800 mb-4"
            >
              Payment canceled
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 mb-6"
            >
              Your purchase has been canceled. No payment has been processed.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <a
                href="/"
                className="inline-block bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:text-amber-500 relative overflow-hidden group"
              >
                <span className="relative z-10 transition-colors duration-300">
                  Return to home
                </span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </a>
            </motion.div>
          </>
        ) : (
          // Payment successful content
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-gray-800 mb-4"
            >
              Payment successful!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 mb-6"
            >
              Thank you for your purchase. You will receive a confirmation email
              shortly.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <a
                href="/dashboard"
                className="inline-block bg-green-400 text-white px-6 py-3 rounded-lg font-semibold hover:text-green-400 relative overflow-hidden group"
              >
                <span className="relative z-10 transition-colors duration-300">
                  View my licenses
                </span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </a>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
