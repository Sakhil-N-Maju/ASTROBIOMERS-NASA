import React, { useEffect, useState, useRef, useCallback } from 'react';
import SectionBackground from '@/components/SectionBackground';

/*
  PlanetsCarousel
  - Shows 3 visible images (prev, active, next)
  - Center image larger, crisp; side images scaled down, blurred, and tucked behind via z-index & translate.
  - Auto-advances every 3s; pauses on hover / focus for accessibility.
  - Loops infinitely through provided images (from public/ directory).
  - Visual showcase only - does not navigate to research pages
*/

const PLANET_IMAGES: { src: string; name: string }[] = [
  { src: '/mercury.png', name: 'Mercury' },
  { src: '/venus.png', name: 'Venus' },
  { src: '/earth.jpg', name: 'Earth' },
  { src: '/mars.png', name: 'Mars' },
  { src: '/jupyter.png', name: 'Jupiter' }, // file in public folder is named jupyter.png
  { src: '/saturn.png', name: 'Saturn' },
  { src: '/uranus.png', name: 'Uranus' },
  { src: '/neptune.png', name: 'Neptune' },
];

// Filter out any images that do not actually exist? We can't access FS here at runtime, so assume present.

const ADVANCE_INTERVAL = 3000;

const PlanetsCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const length = PLANET_IMAGES.length;

  const advance = useCallback(() => {
    setIndex(i => (i + 1) % length);
  }, [length]);

  useEffect(() => {
    const start = () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(advance, ADVANCE_INTERVAL);
    };
    start();
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [advance]);

  const pause = () => { if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; } };
  const resume = () => { if (!timerRef.current) { timerRef.current = window.setInterval(advance, ADVANCE_INTERVAL); } };

  // Compute previous and next indexes
  const prev = (index - 1 + length) % length;
  const next = (index + 1) % length;

  return (
    <section aria-label="Planetary showcase" className="relative py-20 overflow-hidden bg-black with-section-atmosphere">
      {/* Top gradient blend from Features section */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-black via-black/90 via-black/60 to-transparent z-[2]" />
      
      {/* Background Image */}
      <div className="absolute inset-0 z-[1]">
        <img 
          src="/bg1.jpeg" 
          alt="" 
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <SectionBackground />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Explore the Solar System</h2>
          <p className="text-white/65 max-w-2xl mx-auto text-base sm:text-lg">Discover the diverse environments across our solar system. Each world presents unique challenges and opportunities for space biology research.</p>
        </div>

        <div
          className="relative flex items-center justify-center h-[420px] md:h-[480px] select-none"
          ref={containerRef}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
        >
          {/* Track for layering */}
          <div className="absolute inset-0 flex items-center justify-center">
            {PLANET_IMAGES.map((planet, i) => {
              // Determine role
              const isActive = i === index;
              const isPrev = i === prev;
              const isNext = i === next;
              if (!isActive && !isPrev && !isNext) return null; // only render 3

              const baseClasses = 'absolute transition-all duration-700 ease-[cubic-bezier(.4,0,.2,1)] will-change-transform';

              let styleClasses = '';
              if (isActive) {
                styleClasses = 'z-30 scale-100 opacity-100 blur-0';
              } else if (isPrev) {
                styleClasses = 'z-20 -translate-x-[55%] scale-80 opacity-65 blur-sm';
              } else if (isNext) {
                styleClasses = 'z-20 translate-x-[55%] scale-80 opacity-65 blur-sm';
              }

              return (
                <figure
                  key={planet.name}
                  className={`${baseClasses} ${styleClasses} flex flex-col items-center justify-center`}
                  aria-hidden={!isActive}
                >
                  {/* Image directly, no circular mask */}
                  <img
                    src={planet.src}
                    alt={planet.name}
                    draggable={false}
                    onError={(e) => { if (!(e.currentTarget as HTMLImageElement).dataset.fallback) { (e.currentTarget as HTMLImageElement).dataset.fallback = '1'; (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; } }}
                    className={`transition-all duration-[900ms] object-contain drop-shadow-[0_25px_55px_-20px_rgba(0,0,0,0.85)] w-[300px] h-[300px] md:w-[380px] md:h-[380px] ${isActive ? 'scale-[1.15] saturate-125' : 'scale-95 opacity-90'} `}
                  />
                  <figcaption className={`mt-4 text-xs tracking-wide font-medium px-3 py-1 rounded-full bg-black/70 backdrop-blur border border-white/10 ${isActive ? 'text-white/90' : 'text-white/60'}`}>{planet.name}</figcaption>
                </figure>
              );
            })}
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center mt-8 gap-2">
          {PLANET_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1 w-1 rounded-full transition-all duration-300 ${i === index ? 'bg-white w-2.5' : 'bg-white/30 hover:bg-white/50'}`}
              aria-label={`Show planet ${PLANET_IMAGES[i].name}`}
            />
          ))}
        </div>
      </div>
      
      {/* Bottom gradient blend to Benefits section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent via-black/80 to-black z-[2]" />
    </section>
  );
};

export default PlanetsCarousel;
