import React from "react";
import Navbar from "../landing/Navbar";
import HeroSection from "../landing/HeroSection";
import ProductsSection from "../landing/ProductsSection";
import FeaturesSection from "../landing/FeaturesSection";
import TestimonialsSection from "../landing/TestimonialsSection";
import CTASection from "../landing/CTASection";
import Footer from "../landing/Footer";

export default function LandingPageStoryboard() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main>
        <HeroSection
          onPrimaryAction={() => console.log("Primary action clicked")}
          onSecondaryAction={() => console.log("Secondary action clicked")}
        />

        <div id="products-section">
          <ProductsSection />
        </div>

        <FeaturesSection />

        <TestimonialsSection />

        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
