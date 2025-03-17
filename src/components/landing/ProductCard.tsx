import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export interface ProductCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  icon: React.ReactNode;
  accentColor: string;
  popular?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  description,
  price,
  features,
  icon,
  accentColor,
  popular = false,
  onClick,
  isLoading = false,
}) => {
  // Safely apply Tailwind classes
  const getAccentColorClass = (prefix: string) => {
    // Always return green-400 for consistent green color
    return `${prefix}green-400`;
  };

  const getBorderClass = "border-gray-700";
  const getBgClass = getAccentColorClass("bg-");
  const getBgHoverClass = getAccentColorClass("hover:bg-") + "/90";
  const getBgLightClass = getAccentColorClass("bg-") + "/10";
  const getTextClass = getAccentColorClass("text-");

  return (
    <motion.div
      initial={{ rotateX: 180 }}
      whileInView={{ rotateX: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)" }}
      className="h-full overflow-hidden perspective-1000"
      style={{
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
      }}
    >
      <Card
        className={`h-full border-2 ${getBorderClass} bg-gray-900 backface-hidden`}
      >
        <div className={`h-2 w-full ${getBgClass} -mt-0.5`} />
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <motion.div
                className={`p-2 rounded-lg ${getBgLightClass} ${getTextClass}`}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {icon}
              </motion.div>
              <CardTitle className="text-white">{title}</CardTitle>
            </div>
            {popular && (
              <Badge className={`${getBgClass} ${getBgHoverClass} text-white`}>
                Popular
              </Badge>
            )}
          </div>
          <CardDescription className="mt-2 text-gray-300">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <span className="text-3xl font-bold text-white">{price}</span>
            <span className="text-gray-400 ml-1">/month</span>
          </div>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className={`h-5 w-5 mr-2 ${getTextClass} flex-shrink-0`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            onClick={onClick}
            disabled={isLoading}
            className="w-full bg-green-400 hover:text-green-400 text-white relative overflow-hidden group"
          >
            <span className="relative z-10 transition-colors duration-300">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Processing...
                </>
              ) : (
                "Get started"
              )}
            </span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
