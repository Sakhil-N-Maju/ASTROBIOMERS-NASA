import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Benefits from "@/components/Benefits";
import ImageCarousel from "@/components/ImageCarousel";
import Footer from "@/components/Footer";
import PlanetsCarousel from "@/components/PlanetsCarousel";
import SectionBackground from "@/components/SectionBackground";
import { GuidedTour } from "@/components/GuidedTour";
import { tourSteps, quickTourSteps } from "@/data/tourScript";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

const Index = () => {
  const [showTour, setShowTour] = useState(false);
  const hasCompletedTour = localStorage.getItem('astrobiomers_tour_completed');

  return (
    <div className="min-h-screen">
      <Navigation />
      <main id="main-content" role="main" aria-label="Homepage - Astrobiomers Space Biology Research Engine">
      
      {/* Floating Start Tour Button */}
      <Button
        onClick={() => setShowTour(true)}
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 shadow-2xl rounded-full p-4"
        size="lg"
        data-tour="tour-button"
        aria-label={hasCompletedTour ? 'Take interactive tour again' : 'Start interactive tour of Astrobiomers features'}
      >
        <Compass className="w-6 h-6 mr-2" aria-hidden="true" />
        {hasCompletedTour ? 'Take Tour Again' : 'Start Tour'}
      </Button>
      
      <Hero />
      {/* Post-hero sections with atmospheric background */}
      <div className="relative with-section-atmosphere z-0">
        <SectionBackground />
        <div className="relative z-10 space-y-0">{/* content sits above background layers */}
          <Features />
          <PlanetsCarousel />
          <Benefits />
          <ImageCarousel />
          <Footer />
        </div>
      </div>
      
      {/* Guided Tour */}
      {showTour && (
        <GuidedTour
          steps={hasCompletedTour ? quickTourSteps : tourSteps}
          onComplete={() => {
            setShowTour(false);
            localStorage.setItem('astrobiomers_tour_completed', 'true');
          }}
          autoStart={true}
        />
      )}
      </main>
    </div>
  );
};

export default Index;
