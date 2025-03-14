import React from "react";
import { motion } from "framer-motion";
import { Clock, Zap, Shield, BarChart, Workflow, Code } from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => {
  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow">
      <motion.div
        className="h-12 w-12 rounded-lg bg-green-400 text-white flex items-center justify-center mb-4"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Time saving",
      description:
        "Automate repetitive tasks and save hours of manual work with our intelligent tools.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning fast",
      description:
        "Our tools are optimized for performance, ensuring quick execution of all your tasks.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & reliable",
      description:
        "Built with security in mind, your data and operations are always protected.",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Detailed analytics",
      description:
        "Track performance and results with comprehensive analytics and reporting.",
    },
    {
      icon: <Workflow className="h-6 w-6" />,
      title: "Customizable workflows",
      description:
        "Create custom workflows tailored to your specific needs and requirements.",
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Api integration",
      description:
        "Seamlessly integrate with other tools and platforms through our robust API.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-20 bg-gray-100">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why <span className="text-green-400">choose</span> our{" "}
            <span className="text-green-400">tools</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our automation tools are designed to make your workflow more
            efficient and productive
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Feature
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
