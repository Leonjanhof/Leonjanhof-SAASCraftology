import React from "react";
import DrippingCircles from "../landing/animations/DrippingCircles";

export default function DrippingCirclesStoryboard() {
  return (
    <div className="bg-white min-h-screen relative">
      <DrippingCircles />
      <div className="container mx-auto p-8 relative z-20">
        <h1 className="text-3xl font-bold mb-4">Dripping Circles Effect</h1>
        <p className="mb-8">
          This demonstrates the dripping circles animation that appears at the
          top of the products section.
        </p>

        <div className="p-6 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Content Example</h2>
          <p className="text-gray-600">
            The circles appear to drip from above, creating a visual connection
            between the hero section and the products section.
          </p>
        </div>
      </div>
    </div>
  );
}
