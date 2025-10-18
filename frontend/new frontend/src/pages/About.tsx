export default function About() {
  return (
    <main className="min-h-screen bg-black text-white py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">About BSRE</h1>
        <p className="text-white/60 text-xl mb-16">
          Biology Space Research Engine
        </p>

        <div className="space-y-12">
          {/* Main Description */}
          <section className="rounded-2xl border border-white/10 p-8 bg-white/5 backdrop-blur-sm">
            <p className="text-white/80 leading-relaxed text-lg mb-6">
              The <strong>Biology Space Research Engine (BSRE)</strong> is an intelligent platform for exploring 
              space biology research. We transform complex scientific papers into an interactive, 
              interconnected knowledge graph that reveals hidden patterns and relationships.
            </p>
            <p className="text-white/80 leading-relaxed text-lg">
              Built for the <strong>NASA Space Apps Challenge 2024</strong>, BSRE combines knowledge graphs, 
              AI assistance, and trend analysis to help researchers, scientists, and space enthusiasts 
              discover insights from NASA's space biology research.
            </p>
          </section>

          {/* Mission */}
          <section className="rounded-2xl border border-white/10 p-8 bg-white/5 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4">🚀 Our Mission</h2>
            <p className="text-white/80 leading-relaxed text-lg">
              To make space biology research more <strong>accessible</strong>, <strong>discoverable</strong>, 
              and <strong>actionable</strong> for the global scientific community. We believe that by 
              connecting researchers with relevant knowledge faster, we can accelerate breakthroughs 
              in understanding how life adapts to space.
            </p>
          </section>

          {/* Technology Stack */}
          <section className="rounded-2xl border border-white/10 p-8 bg-white/5 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-6">⚙️ Technology</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white/90">Frontend</h3>
                <ul className="space-y-2 text-white/70">
                  <li>• React 18 + TypeScript</li>
                  <li>• Vite build system</li>
                  <li>• D3.js for visualizations</li>
                  <li>• Tailwind CSS + Shadcn/UI</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white/90">Backend</h3>
                <ul className="space-y-2 text-white/70">
                  <li>• Python FastAPI</li>
                  <li>• Neo4j Graph Database</li>
                  <li>• LangChain RAG</li>
                  <li>• Real NASA data (148 papers)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Source */}
          <section className="rounded-2xl border border-white/10 p-8 bg-white/5 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4">📊 Data Source</h2>
            <p className="text-white/80 leading-relaxed text-lg mb-4">
              Our knowledge graph is built from <strong>148 real NASA research papers</strong> covering 
              topics like microgravity effects, radiation biology, plant growth in space, and extremophile studies.
            </p>
            <p className="text-white/80 leading-relaxed text-lg">
              We extract entities (proteins, genes, organisms, processes) and relationships from scientific 
              literature, then connect them with evidence from supporting papers. This creates a living 
              map of space biology knowledge.
            </p>
          </section>

          {/* Team / Contact */}
          <section className="rounded-2xl border border-white/10 p-8 bg-white/5 backdrop-blur-sm text-center">
            <h2 className="text-3xl font-bold mb-4">🌌 Built for NASA Space Apps 2024</h2>
            <p className="text-white/60 text-lg">
              Empowering the next generation of space biology research
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
