import React from "react";
import HeroSection from "../landing/HeroSection";

export default function HeroSectionStoryboard() {
  return (
    <HeroSection
      onPrimaryAction={() => console.log("Primary action clicked")}
      onSecondaryAction={() => console.log("Secondary action clicked")}
    />
  );
}
