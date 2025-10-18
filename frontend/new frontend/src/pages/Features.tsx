export default function Features() {
  const features = [
    {
      icon: '🔍',
      title: 'Knowledge Graph',
      description: 'Visualize space biology research as an interactive knowledge graph. Explore entities, relationships, and evidence with click-through details.',
      highlights: ['156+ Entities', 'Interactive D3.js', 'Evidence Modal', 'Real-time Search']
    },
    {
      icon: '🤖',
      title: 'AI Research Assistant',
      description: 'Ask questions about space biology research and get AI-powered answers. Powered by knowledge graph integration with source citations.',
      highlights: ['Natural Language', 'Source Citations', 'RAG Architecture', 'Fallback Mode']
    },
    {
      icon: '📊',
      title: 'Trends Analysis',
      description: 'Discover emerging topics, publication patterns, and influential researchers. Track research evolution over time.',
      highlights: ['Timeline Charts', 'Emerging Topics', 'Top Authors', 'Growth Metrics']
    },
    {
      icon: '📄',
      title: 'Research Library',
      description: 'Browse curated experimental datasets, modeling outputs, and mission-relevant biological insights from NASA research.',
      highlights: ['148 Papers', 'Planet Filter', 'Search', 'PubMed Links']
    },
    {
      icon: '♿',
      title: 'Accessibility',
      description: 'Full keyboard navigation, screen reader support, and WCAG 2.1 AA compliance for inclusive access.',
      highlights: ['Keyboard Nav', 'ARIA Labels', 'Focus Indicators', 'Semantic HTML']
    },
    {
      icon: '🔗',
      title: 'Evidence Transparency',
      description: 'Click any graph edge to see supporting papers. View confidence levels and original research sources.',
      highlights: ['Click Edges', 'Confidence Levels', 'Paper Abstracts', 'DOI Links']
    }
  ];

  return (
    <main className="min-h-screen bg-black text-white py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">🌟 Features</h1>
        <p className="text-white/60 max-w-3xl mb-16 text-lg">
          Biology Space Research Engine combines cutting-edge technologies to make space biology research 
          accessible, discoverable, and actionable for researchers worldwide.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="rounded-2xl border border-white/10 p-8 bg-white/5 backdrop-blur-sm hover:border-white/25 hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-white/70 leading-relaxed mb-6">
                {feature.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {feature.highlights.map((highlight, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/20"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
