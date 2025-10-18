import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import SectionBackground from "@/components/SectionBackground";

// Interactive + modern benefit cards with hover glow, pointer reactive spotlight, and staggered item reveals
const BENEFITS = [
  {
    category: "For Researchers",
    items: [
      "Access 10,000+ peer‑reviewed research papers instantly",
      "AI synthesis of complex multi‑factorial relationships",
      "Interactive knowledge graph exploration & pathfinding",
      "On‑demand summarization & literature review generation",
    ],
    accent: "from-sky-500/20 via-cyan-400/10 to-transparent"
  },
  {
    category: "For Scientists",
    items: [
      "Discover hidden connections across decades of research",
      "Hypothesis generation via AI‑powered gap identification",
      "Real‑time collaboration across global research teams",
      "Integration with NASA GeneLab & omics datasets",
    ],
    accent: "from-emerald-500/25 via-teal-400/10 to-transparent"
  },
  {
    category: "For Investors & Managers",
    items: [
      "Track research trends & emerging frontiers",
      "Identify high‑impact areas & key influencers",
      "Visualize collaboration networks & partnerships",
      "Decision intelligence with data‑driven insights",
    ],
    accent: "from-amber-500/25 via-orange-400/10 to-transparent"
  },
];

const Benefits = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Stagger entrance when section scrolls into view
  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll('[data-benefit-card]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('benefit-visible');
          }
        });
      },
      { threshold: 0.25 }
    );
    cards?.forEach((c, i) => {
      (c as HTMLElement).style.setProperty('--stagger', `${i * 120}ms`);
      observer.observe(c);
    });
    return () => observer.disconnect();
  }, []);

  const handlePointer = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--mx', x + 'px');
    el.style.setProperty('--my', y + 'px');
  };

  return (
    <section id="benefits" className="relative py-20 bg-black with-section-atmosphere overflow-hidden">
      <SectionBackground />

      <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="text-center mb-24 space-y-6 max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Purpose‑Built for Every Role
          </h2>
          <p className="text-lg sm:text-xl text-white/60 leading-relaxed">
            Designed to empower every actor in the space biology ecosystem with adaptive intelligence & actionable context.
          </p>
        </div>

        <div ref={containerRef} className="grid lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {BENEFITS.map((b, i) => (
            <div
              key={b.category}
              data-benefit-card
              onMouseMove={handlePointer}
              className="benefit-card benefit-glow relative group rounded-3xl border border-white/5 bg-gradient-to-br from-zinc-900/70 to-zinc-900/20 backdrop-blur-[6px] p-10 overflow-hidden isolation-auto opacity-0 translate-y-6 [transition:opacity_.9s_var(--stagger),transform_.9s_var(--stagger)]"
            >
              {/* Dynamic spotlight & accent gradient */}
              <div className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr ${b.accent}`} />
              <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),white,transparent_55%)] bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.18),transparent_60%)] opacity-0 group-hover:opacity-100 mix-blend-screen transition-opacity duration-500" />

              <h3 className="relative text-2xl font-bold mb-8 tracking-tight text-white flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-white/70 animate-pulse" />{b.category}
              </h3>
              <ul className="relative space-y-5">
                {b.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex gap-4 items-start opacity-0 translate-y-3 animate-[benefitItem_.75s_cubic-bezier(.4,0,.2,1)_forwards]"
                    style={{ animationDelay: `${300 + idx * 110}ms` }}
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 relative overflow-hidden">
                      <span className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Check className="w-3.5 h-3.5 text-white" />
                    </span>
                    <span className="text-white/65 group-hover:text-white/75 transition-colors text-[15px] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              {/* Subtle bottom glow */}
              <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-white/5 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
