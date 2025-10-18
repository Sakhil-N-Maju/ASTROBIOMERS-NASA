import { Database, Sparkles, Users, BarChart3 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

type Feature = {
  icon: any;
  title: string;
  description: string;
  gradient: string;
  accent: string;
  badge?: string;
  link?: string;
};

const FEATURES: Feature[] = [
  {
    icon: Database,
    title: "Knowledge Graph Foundation",
    description: "Unified biomedical entities & relationships stitched into an adaptive, queryable graph that becomes smarter with every interaction.",
    gradient: "from-purple-600/20 via-indigo-600/10 to-transparent",
    accent: "bg-purple-500/15 text-purple-300",
    badge: "Core Data Layer",
  },
  {
    icon: BarChart3,
    title: "Interactive Insight Dashboard",
    description: "High‑fidelity, multi‑dimensional exploration: temporal trends, pathway linkages, co-occurrence networks – all rendered in real time.",
    gradient: "from-sky-500/20 via-cyan-500/10 to-transparent",
    accent: "bg-cyan-400/15 text-cyan-300",
    badge: "Visual Analytics",
  },
  {
    icon: Sparkles,
    title: "AI Intelligence Layer",
    description: "Retrieval‑augmented reasoning that synthesizes literature, experiments & graph context into concise, citation‑aware answers.",
    gradient: "from-amber-400/25 via-yellow-300/10 to-transparent",
    accent: "bg-amber-400/15 text-amber-300",
    badge: "Adaptive AI",
  },
  {
    icon: Users,
    title: "Collaborative Research Hub",
    description: "Spaces, shared queries, and annotation streams turn isolated analysis into a living, reproducible knowledge workflow.",
    gradient: "from-emerald-500/25 via-teal-400/10 to-transparent",
    accent: "bg-emerald-400/15 text-emerald-300",
    badge: "Team Layer",
  },
];

// Utility hook for subtle stagger entrance animations
const useStaggerReveal = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = Array.from(el.querySelectorAll('[data-feature-card]')) as HTMLElement[];
    children.forEach((c, i) => {
      c.style.animationDelay = `${i * 90}ms`;
    });
  }, []);
  return ref;
};

const Features = () => {
  const gridRef = useStaggerReveal();

  return (
    <section id="features" className="relative py-28 bg-black overflow-hidden">
      {/* Top gradient blend from hero section */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black via-black/80 to-transparent z-[2]" />
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/bg1.jpeg" 
          alt="" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      <div className="features-top-seam" />
      {/* Decorative radial gradients */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent_65%)]">
        <div className="absolute -top-40 -left-20 w-[700px] h-[700px] bg-purple-600/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -right-32 w-[640px] h-[640px] bg-cyan-500/10 blur-3xl rounded-full" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-10 z-10">
        <div className="text-center mb-20 space-y-6 max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight !text-white drop-shadow-lg" style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            Powered by Four Core Pillars
          </h2>
          <p className="text-lg sm:text-xl text-white leading-relaxed drop-shadow-md">
            A modular architecture that turns heterogeneous space biology data into cumulative, navigable intelligence — accelerating discovery, validation and collaboration.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid gap-10 md:grid-cols-2 lg:gap-12 max-w-7xl mx-auto"
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                data-feature-card
                className="group glass-card relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1 animate-[featureIn_.8s_cubic-bezier(.4,0,.2,1)_both]"
              >
                {/* Glow gradient overlay */}
                <div className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr ${f.gradient}`} />

                {/* Animated icon container */}
                <div className="relative mb-7 inline-flex">
                  <div className={`h-16 w-16 rounded-2xl ${f.accent} flex items-center justify-center ring-1 ring-white/10 shadow-inner shadow-black/40 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_8px_30px_-6px_rgba(0,0,0,0.6)]`}> 
                    <span className="icon-orbit" />
                    <Icon className="w-8 h-8 text-white drop-shadow relative" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold tracking-tight mb-4 text-white group-hover:text-white/90 transition-colors">
                  {f.title}
                </h3>
                <p className="text-white/60 leading-relaxed text-[15.5px] mb-6 pr-2">
                  {f.description}
                </p>

                <div className="flex items-center gap-5 text-sm font-medium">
                  <button className="relative px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors border border-white/10 backdrop-blur-sm group/btn shadow-[0_0_0_1px_rgba(255,255,255,0.07)]">
                    Learn more
                    <span className="absolute inset-0 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
                  </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {/* Bottom gradient blend to next section (upward smudge) */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent z-[2]" />
        </section>
      );
    };
    
    export default Features;
