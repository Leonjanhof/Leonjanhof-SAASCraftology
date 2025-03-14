import React from "react";
import ProductCard from "../landing/ProductCard";
import { Vote } from "lucide-react";

export default function ProductCardStoryboard() {
  return (
    <div className="p-8 bg-gray-50">
      <ProductCard
        title="Autovoter"
        description="Automated voting solution for your platform needs"
        price="$5"
        features={[
          "Automated voting schedules",
          "Multiple account support",
          "Vote verification",
          "Analytics dashboard",
          "Email notifications",
        ]}
        icon={<Vote className="h-6 w-6" />}
        accentColor="blue-500"
        popular={true}
        onClick={() => console.log("Product card clicked")}
      />
    </div>
  );
}
