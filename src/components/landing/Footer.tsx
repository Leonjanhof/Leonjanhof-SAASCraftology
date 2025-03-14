import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  // Function to scroll to element with offset
  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const headerHeight = 80; // Approximate navbar height
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      // Add a 75px gap between navbar and the title
      const offsetPosition = elementPosition - headerHeight - 75;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Letter animation variants
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
      },
    }),
  };

  // Function to create animated text
  const AnimatedText = ({
    text,
    className,
  }: {
    text: string;
    className: string;
  }) => {
    return (
      <motion.h3
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {text.split("").map((char, index) => (
          <motion.span
            key={index}
            custom={index}
            variants={letterVariants}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.h3>
    );
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container px-4 mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="text-xl font-bold mb-4 text-white"
            >
              {"Craftology".split("").map((char, index) => (
                <motion.span
                  key={index}
                  custom={index}
                  variants={letterVariants}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
              <motion.span
                className="inline-block"
                custom={10}
                variants={letterVariants}
              >
                &nbsp;
              </motion.span>
              {"Inc.".split("").map((char, index) => (
                <motion.span
                  key={index + 11}
                  custom={index + 11}
                  variants={letterVariants}
                  className="inline-block text-green-400"
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
            <p className="mb-4">
              Empowering users with powerful automation tools to streamline
              workflows and boost{" "}
              <span className="text-green-400">productivity</span>.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://discord.gg/5MbAqAhaCR"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-white transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <AnimatedText
              text="Products"
              className="text-lg font-semibold mb-4 text-green-400"
            />
            <ul className="space-y-2">
              <li>
                <Link
                  to="/#products-section"
                  className="hover:text-green-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToElement("autovoter-card");
                  }}
                >
                  autovoter
                </Link>
              </li>
              <li>
                <Link
                  to="/#products-section"
                  className="hover:text-green-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToElement("factionsbot-1-18-2-card");
                  }}
                >
                  factionsbot 1.18.2
                </Link>
              </li>
              <li>
                <Link
                  to="/#products-section"
                  className="hover:text-green-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToElement("emc-captcha-solver-card");
                  }}
                >
                  emc captcha solver
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <AnimatedText
              text="Company"
              className="text-lg font-semibold mb-4 text-green-400"
            />
            <ul className="space-y-2">
              <li>
                <Link to="#" className="hover:text-green-400 transition-colors">
                  about us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-green-400 transition-colors">
                  careers
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-green-400 transition-colors">
                  blog
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-green-400 transition-colors">
                  legal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <AnimatedText
              text="Contact"
              className="text-lg font-semibold mb-4 text-green-400"
            />
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-green-400" />
                <span>123 Innovation Drive, Tech City, TC 10101</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0 text-green-400" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0 text-green-400" />
                <span>info@craftology.com</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            © {new Date().getFullYear()}{" "}
            <span className="text-green-400">Craftology Inc.</span> All rights
            reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="#"
              className="text-sm hover:text-green-400 transition-colors"
            >
              privacy policy
            </Link>
            <Link
              to="#"
              className="text-sm hover:text-green-400 transition-colors"
            >
              terms of service
            </Link>
            <Link
              to="#"
              className="text-sm hover:text-green-400 transition-colors"
            >
              cookie policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
