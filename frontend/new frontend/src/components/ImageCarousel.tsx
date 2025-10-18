import React, { useState } from "react";
import SectionBackground from "@/components/SectionBackground";

const images = [
  { src: "/nasa1.webp", title: "Gallery 1" },
  { src: "/nasa2.jpg", title: "Gallery 2" },
  { src: "/nasa3.jpg", title: "Gallery 3" },
  { src: "/nasa4.webp", title: "Gallery 4" },
  { src: "/nasa5.webp", title: "Gallery 5" },
  { src: "/nasa6.webp", title: "Gallery 6" },
  { src: "/nasa7.webp", title: "Gallery 7" },
  { src: "/nasa8.jpg", title: "Gallery 8" },
];

export default function ImageCarousel() {
  
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-16 relative bg-black with-section-atmosphere overflow-hidden">
      {/* Local atmospheric background for this section */}
      <SectionBackground />
      <div className="relative z-10 w-full px-6 lg:px-16">
        <div className="text-center mb-4 space-y-1">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Visualizing Space Biology
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Explore the fascinating world where biology meets the cosmos
          </p>
        </div>

        <div className="bento-grid w-full mx-auto">
          {images.map((img, i) => (
            <div
              key={i}
              className={`bento-item tile-${i + 1}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((prev) => (prev === i ? null : prev))}
            >
              <img src={img.src} alt="" className="bento-img" />
            </div>
          ))}
        </div>

        {active !== null && (
          <div className="bento-overlay pointer-events-none">
            <div className="overlay-content pointer-events-none">
              <img
                src={images[active].src}
                alt={images[active].title}
              />
            </div>
          </div>
        )}
      </div>

      {/* No fullscreen overlay — tiles expand in place */}
    </section>
  );
}
