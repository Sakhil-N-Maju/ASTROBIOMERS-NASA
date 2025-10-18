import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroVideo from "@/assets/hero-video.mp4";

const Hero = () => {
  return (
  <section className="hero relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover hero-video"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* No overlay - heading will be transparent to reveal the video behind it */}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-52">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8 animate-fade-in-up transform translate-y-16 -translate-x-12">
            {/* Badge removed */}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white hero-title">
              BIOLOGY SPACE<br />
              RESEARCH ENGINE
            </h1>

            <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl">
              Your intelligent gateway to space biology experiments, research papers, and 
              groundbreaking discoveries. Powered by AI to help scientists, investors, and 
              architects explore the frontier of space research.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 text-lg group font-semibold"
              >
                Explore Research
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Stats removed */}
          </div>

          {/* Right Side - Let video show through */}
          <div className="hidden lg:block relative">
            {/* Intentionally empty to let video background shine */}
          </div>
        </div>
      </div>

      {/* Gradient blend for smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent via-black/80 to-black z-[5]" />
    </section>
  );
};

export default Hero;
