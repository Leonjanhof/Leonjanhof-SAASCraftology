import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import GearsBackground from "../dashboard/GearsBackground";

export default function Success() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GearsBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center relative z-10"
      >
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
      </motion.div>
    </div>
  );
}
