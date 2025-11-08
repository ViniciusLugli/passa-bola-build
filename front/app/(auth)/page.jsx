"use client";

import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import SocialProofSection from "./components/SocialProofSection";
import Footer from "./components/Footer";

export default function HomePage() {
  const scrollToFeatures = (e) => {
    e.preventDefault();
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      featuresSection.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="min-h-screen bg-page">
      {/* Skip Navigation */}
      <a
        href="#main-content"
        className="
          sr-only
          focus:not-sr-only
          focus:absolute
          focus:top-4
          focus:left-4
          focus:z-50
          focus:px-4
          focus:py-2
          focus:bg-accent
          focus:text-on-brand
          focus:rounded-lg
          focus:shadow-elevated
          focus:outline-none
          focus:ring-4
          focus:ring-accent/50
        "
      >
        Pular para o conteúdo principal
      </a>

      <HeroSection scrollToFeatures={scrollToFeatures} />
      <FeaturesSection />
      <SocialProofSection />
      <Footer />
    </div>
  );
}
