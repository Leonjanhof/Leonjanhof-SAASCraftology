import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Bot, Vote, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import DrippingCircles from "./animations/DrippingCircles";
import TextAnimation from "./animations/TextAnimation";

interface Plan {
  id: string;
  object: string;
  active: boolean;
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  product: string;
  created: number;
  livemode: boolean;
  [key: string]: any;
}

const ProductsSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-get-plans",
      );

      if (error) {
        throw error;
      }

      setPlans(data || []);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      // Set default plans when API fails to prevent errors
      setPlans([
        {
          id: "price_1R1A9uGLqZ8YjU1vEkXXC79n",
          object: "price",
          active: true,
          amount: 500,
          currency: "usd",
          interval: "month",
          interval_count: 1,
          product: "Autovoter",
          created: Date.now(),
          livemode: false,
        },
        {
          id: "price_1R1AE1GLqZ8YjU1vUrS3ZSXJ",
          object: "price",
          active: true,
          amount: 2500,
          currency: "usd",
          interval: "month",
          interval_count: 1,
          product: "Factionsbot 1.18.2",
          created: Date.now(),
          livemode: false,
        },
        {
          id: "price_1R1AETGLqZ8YjU1vkuXGLxKY",
          object: "price",
          active: true,
          amount: 500,
          currency: "usd",
          interval: "month",
          interval_count: 1,
          product: "EMC captcha solver",
          created: Date.now(),
          livemode: false,
        },
      ]);
      // Don't show error toast in production as this is expected to fail without backend
      if (import.meta.env.DEV) {
        toast({
          title: "Error",
          description: "Failed to load plans. Using default data.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle checkout process
  const handleCheckout = async (priceId: string) => {
    if (!priceId) {
      toast({
        title: "Error",
        description: "Invalid product selection. Please try again.",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting checkout with price ID:", priceId);
    if (!user) {
      // Redirect to login if user is not authenticated
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan.",
        variant: "default",
      });
      window.location.href = "/login?redirect=pricing";
      return;
    }

    setIsLoading(true);
    setProcessingPlanId(priceId);

    try {
      console.log("Invoking create-checkout with:", {
        priceId,
        userId: user.id,
        returnUrl: `${window.location.origin}/success`,
        userEmail: user.email,
      });

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_id: priceId,
            user_id: user.id,
            return_url: `${window.location.origin}/success`,
          },
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

      console.log("Checkout response:", { data, error });

      if (error) {
        throw error;
      }

      // Redirect to Stripe checkout
      if (data?.url) {
        toast({
          title: "Redirecting to checkout",
          description:
            "You'll be redirected to Stripe to complete your purchase.",
          variant: "default",
        });
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Checkout failed",
        description:
          "There was an error creating your checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProcessingPlanId(null);
    }
  };

  // Find the corresponding plan ID for each product
  const findPlanIdByProductName = (productName: string) => {
    if (!productName) {
      console.error("Product name is required");
      return null;
    }

    const productMap: Record<string, string> = {
      // Use exact Stripe price IDs here
      Autovoter: "price_1R1A9uGLqZ8YjU1vEkXXC79n",
      "Factionsbot 1.18.2": "price_1R1AE1GLqZ8YjU1vUrS3ZSXJ",
      "EMC captcha solver": "price_1R1AETGLqZ8YjU1vkuXGLxKY",
    };

    // Get the price ID from the product map
    const priceId = productMap[productName];
    if (!priceId) {
      console.error(`No price ID found for product: ${productName}`);
      return null;
    }

    return priceId;
  };

  const products = [
    {
      title: "Autovoter",
      description: "Automated voting solution for your platform needs",
      price: "$5",
      features: [
        "Application with UI",
        "5 voting links per license",
        "Selectable voting websites",
        "One username per license",
        "Cloudfare turnstile bypass",
        "Captcha solving",
        "API integration",
      ],
      icon: <Vote className="h-6 w-6" />,
      accentColor: "green-400",
      popular: true,
    },
    {
      title: "Factionsbot 1.18.2",
      description: "Powerful bot for managing faction activities",
      price: "$25",
      features: [
        "Shard detection & tracking",
        "Balance detection & alerts",
        "Player detection system",
        "Fully configurable settings",
        "Easy 5-minute setup",
        "Faction member management",
        "Automated responses",
      ],
      icon: <Bot className="h-6 w-6" />,
      accentColor: "green-400",
    },
    {
      title: "EMC captcha solver",
      description: "Automated captcha solving for EMC platforms",
      price: "$5",
      features: [
        "High accuracy solving",
        "Fast processing time",
        "API integration",
        "Easy 5-minute setup",
        "Minecraft mod included",
        "Usage statistics",
        "Bulk solving capability",
      ],
      icon: <ShieldCheck className="h-6 w-6" />,
      accentColor: "green-400",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <section className="py-20 bg-white relative">
      {/* Dripping circles effect at the top of the section */}
      <DrippingCircles />
      <div className="container px-4 mx-auto relative z-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            <TextAnimation text="Our" type="letter" />{" "}
            <span className="text-green-400">
              <TextAnimation text="products" type="letter" isGreen={true} />
            </span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Explore our suite of powerful automation tools designed to
            streamline your workflow
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {products.map((product, index) => {
            const planId = findPlanIdByProductName(product.title);
            const isProcessing = processingPlanId === planId;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                id={
                  product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
                  "-card"
                }
                className="overflow-hidden rounded-lg"
              >
                <ProductCard
                  title={product.title}
                  description={product.description}
                  price={product.price}
                  features={product.features}
                  icon={product.icon}
                  accentColor={product.accentColor}
                  popular={product.popular}
                  onClick={() => planId && handleCheckout(planId)}
                  isLoading={isLoading && isProcessing}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsSection;
