import { useEffect, useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "../landing/ErrorBoundary";

// Landing page components
import Navbar from "../landing/Navbar";
import HeroSection from "../landing/HeroSection";
import ProductsSection from "../landing/ProductsSection";
import FeaturesSection from "../landing/FeaturesSection";
import TestimonialsSection from "../landing/TestimonialsSection";
import CTASection from "../landing/CTASection";
import Footer from "../landing/Footer";

// Define the Plan type
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

export default function LandingPage() {
  console.log("Rendering LandingPage component");
  useEffect(() => {
    console.log("LandingPage mounted");
    return () => console.log("LandingPage unmounted");
  }, []);
  const { user } = useAuth();
  const { toast } = useToast();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Use the Supabase client to call the Edge Function
      const { data, error } = await supabase.functions.invoke("get-plans");

      if (error) {
        throw error;
      }

      setPlans(data || []);
      setError("");
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      setError("Failed to load plans. Please try again later.");
    }
  };

  // Handle checkout process
  const handleCheckout = async (priceId: string) => {
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
    setError("");

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: {
            price_id: priceId,
            user_id: user.id,
            return_url: `${window.location.origin}/dashboard`,
          },
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

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
      setError("Failed to create checkout session. Please try again.");
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

  const handlePrimaryAction = () => {
    if (user) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/signup";
    }
  };

  const handleSecondaryAction = () => {
    // Scroll to products section
    const productsSection = document.getElementById("products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (
    !Navbar ||
    !HeroSection ||
    !ProductsSection ||
    !FeaturesSection ||
    !TestimonialsSection ||
    !CTASection ||
    !Footer
  ) {
    console.error("Missing component:", {
      Navbar,
      HeroSection,
      ProductsSection,
      FeaturesSection,
      TestimonialsSection,
      CTASection,
      Footer,
    });
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-red-600">Error loading components</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900" style={{ minHeight: "100vh" }}>
        <Navbar />

        <main>
          <HeroSection
            onPrimaryAction={handlePrimaryAction}
            onSecondaryAction={handleSecondaryAction}
          />

          <div id="products-section">
            <ProductsSection />
          </div>

          <FeaturesSection />

          <ErrorBoundary
            fallback={
              <div className="py-20 bg-white text-center">
                Unable to load testimonials
              </div>
            }
          >
            <TestimonialsSection />
          </ErrorBoundary>

          <CTASection />
        </main>

        <Footer />
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
