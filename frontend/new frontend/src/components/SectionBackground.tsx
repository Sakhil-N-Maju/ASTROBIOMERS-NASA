import React from "react";

/* SectionBackground
   Provides aurora + dark veil atmospheric background ONLY for sections
   rendered after the Hero (which has a video background). Place this
   inside a relatively positioned wrapper that contains all post-hero
   sections so the effect never overlays the hero.
*/
const SectionBackground: React.FC = () => {
  return (
    <div className="section-fx pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Solid black base so underlying stays pure black */}
      <div className="absolute inset-0 bg-black" />
      {/* Seam fade from hero */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black via-black/70 to-transparent" />
      {/* Aurora colors (low intensity) */}
      <div className="aurora-field" />
      {/* Dark veil + extra darkening overlay to keep sections black */}
      <div className="dark-veil" />
      <div className="black-overlay" />
    </div>
  );
};

export default SectionBackground;

