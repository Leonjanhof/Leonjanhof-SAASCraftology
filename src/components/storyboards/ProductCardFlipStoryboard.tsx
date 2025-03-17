import React from "react";
import ProductCard from "../landing/ProductCard";
import { Vote } from "lucide-react";

export default function ProductCardFlipStoryboard() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <ProductCard
          title="Autovoter"
          description="Automated voting solution for your platform needs"
          price="$5"
          features={[
            "Application with UI",
            "5 voting links per license",
            "Selectable voting websites",
            "One username per license",
            "Cloudfare turnstile bypass",
            "Captcha solving",
            "API integration",
          ]}
          icon={<Vote className="h-6 w-6" />}
          accentColor="green-400"
          popular={true}
          onClick={() => console.log("Card clicked")}
        />
      </div>
    </div>
  );
}
