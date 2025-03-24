import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import {
  Bot,
  Vote,
  ShieldCheck,
  Package,
  Zap,
  Code,
  Cpu,
  Database,
  Globe,
  Rocket,
  Server,
  Terminal,
  Wrench,
  Gamepad2,
  Cog,
} from "lucide-react";
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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  price_id: string;
  features: string[];
  is_subscription: boolean;
  is_popular: boolean;
  icon_name: string;
  created_at: string;
  updated_at: string;
}

const ProductsSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("Fetched products from database:", data ? data.length : 0);
      setProducts(data || []);

      // If we have products, update the plans with the correct price_ids
      if (data && data.length > 0) {
        // Create a mapping of price_ids to products
        const productsByPriceId = data.reduce(
          (acc, product) => {
            if (product.price_id) {
              acc[product.price_id] = product;
            }
            return acc;
          },
          {} as Record<string, Product>,
        );

        // Update plans with product information if available
        const updatedPlans = plans.map((plan) => {
          const matchingProduct = productsByPriceId[plan.id];
          if (matchingProduct) {
            return {
              ...plan,
              product: matchingProduct.name,
              amount: matchingProduct.price,
            };
          }
          return plan;
        });

        setPlans(updatedPlans);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      // Don't show error toast in production
      if (import.meta.env.DEV) {
        toast({
          title: "Error",
          description: "Failed to load products. Using default data.",
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

  // Function to format price as currency
  const formatPrice = (price: number) => {
    return `${price}`;
  };

  // Function to get the appropriate icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Vote":
        return <Vote className="h-6 w-6" />;
      case "Bot":
        return <Bot className="h-6 w-6" />;
      case "ShieldCheck":
        return <ShieldCheck className="h-6 w-6" />;
      case "Zap":
        return <Zap className="h-6 w-6" />;
      case "Code":
        return <Code className="h-6 w-6" />;
      case "Cpu":
        return <Cpu className="h-6 w-6" />;
      case "Database":
        return <Database className="h-6 w-6" />;
      case "Globe":
        return <Globe className="h-6 w-6" />;
      case "Rocket":
        return <Rocket className="h-6 w-6" />;
      case "Server":
        return <Server className="h-6 w-6" />;
      case "Terminal":
        return <Terminal className="h-6 w-6" />;
      case "Wrench":
        return <Wrench className="h-6 w-6" />;
      case "Gamepad2":
        return <Gamepad2 className="h-6 w-6" />;
      case "Cog":
        return <Cog className="h-6 w-6" />;
      case "Package":
      default:
        return <Package className="h-6 w-6" />;
    }
  };

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
          {products.length > 0 ? (
            // Display products from database
            products.map((product) => {
              const isProcessing = processingPlanId === product.price_id;

              return (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  id={
                    product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
                    "-card"
                  }
                  className="overflow-hidden rounded-lg"
                >
                  <ProductCard
                    title={product.name}
                    description={product.description}
                    price={formatPrice(product.price)}
                    features={product.features}
                    icon={getIconComponent(product.icon_name)}
                    accentColor="green-400"
                    popular={product.is_popular}
                    onClick={() =>
                      product.price_id && handleCheckout(product.price_id)
                    }
                    isLoading={isLoading && isProcessing}
                  />
                </motion.div>
              );
            })
          ) : (
            // Display message when no products are available
            <div className="col-span-3 text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No products available
              </h3>
              <p className="text-gray-500">
                Products will appear here once they are added by an
                administrator.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsSection;
