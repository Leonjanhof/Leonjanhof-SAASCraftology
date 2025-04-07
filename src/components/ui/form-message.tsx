import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type MessageType = "error" | "success" | "warning";

interface FormMessageProps {
  type?: MessageType;
  message?: string;
  className?: string;
}

const iconMap = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
};

const colorMap = {
  error: "text-red-500 bg-red-50 border-red-200",
  success: "text-green-500 bg-green-50 border-green-200",
  warning: "text-yellow-500 bg-yellow-50 border-yellow-200",
};

const FormMessage: React.FC<FormMessageProps> = ({
  type = "error",
  message,
  className,
}) => {
  const Icon = iconMap[type];

  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-md border",
            colorMap[type],
            className,
          )}
          role="alert"
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FormMessage;
