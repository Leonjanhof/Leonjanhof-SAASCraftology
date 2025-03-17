import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ParticleBackground from "./ParticleBackground";
import BackgroundAnimation from "./animations/BackgroundAnimation";
import TextAnimation from "./animations/TextAnimation";

interface HeroSectionProps {
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onPrimaryAction,
  onSecondaryAction,
}) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle animation background */}
      <ParticleBackground />

      {/* Diagonal split background - positioned below content */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-tr from-green-900 to-gray-800 clip-path-diagonal" />

        {/* Subtle grey circles animation for the bottom background */}
        <BackgroundAnimation />
      </div>

      {/* Content */}
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              <TextAnimation text="Minecraft" type="letter" />{" "}
              <TextAnimation
                text="software"
                type="letter"
                isGreen
                delay={0.3}
              />{" "}
              <TextAnimation text="solutions" type="letter" delay={0.6} />
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-300">
              <TextAnimation
                text="Craftology Inc.'s automation tools help you work smarter, not harder. Streamline your processes and increase productivity today."
                type="word"
                delay={1.2}
              />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="ghost"
                onClick={onPrimaryAction}
                className="text-white hover:text-green-400 px-8 py-6 text-lg relative overflow-hidden group"
              >
                <span className="relative z-10 transition-colors duration-300">
                  Get started
                </span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={onSecondaryAction}
                className="bg-green-400 hover:text-green-400 text-white px-8 py-6 text-lg relative overflow-hidden group"
              >
                <span className="relative z-10 transition-colors duration-300">
                  View products
                </span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-900 to-transparent z-5" />

      {/* Custom style for diagonal clip path */}
      <style>{`
        .clip-path-diagonal {
          clip-path: polygon(0 20%, 100% 0, 100% 100%, 0% 100%);
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
