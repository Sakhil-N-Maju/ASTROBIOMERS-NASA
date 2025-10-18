import { useSearchParams } from 'react-router-dom';

// Real NASA Space Biology Research Papers
// Sources: NASA OSDR, GeneLab, Space Biology Publications, NSLSL, NASA Task Book
const RESEARCH_PAPERS: { planet: string; title: string; summary: string; source: string }[] = [
  {
    planet: 'Mars',
    title: 'Plant Growth in Simulated Martian Regolith',
    summary: 'Investigation of plant growth capabilities in Mars regolith simulants, examining nutrient availability, root development, and biomass production under reduced pressure conditions.',
    source: 'NASA NSLSL'
  },
  {
    planet: 'Mars',
    title: 'Microbial Survival in Mars-like Environments',
    summary: 'Study of extremophile bacteria survival rates in perchlorate-rich soils under low temperature and radiation conditions mimicking Martian surface.',
    source: 'NASA OSDR'
  },
  {
    planet: 'Earth',
    title: 'Rodent Research on the ISS: RR-1 Mission',
    summary: 'Comprehensive analysis of musculoskeletal changes, bone density loss, and muscle atrophy in mice during spaceflight aboard the International Space Station.',
    source: 'NASA GeneLab'
  },
  {
    planet: 'Earth',
    title: 'Plant Signaling and Gravity Response',
    summary: 'Transcriptomic analysis of Arabidopsis seedlings grown in microgravity, revealing altered gene expression in auxin transport and gravitropism pathways.',
    source: 'NASA Space Biology'
  },
  {
    planet: 'Earth',
    title: 'Cardiovascular Deconditioning in Spaceflight',
    summary: 'Long-duration spaceflight impacts on cardiac function, blood pressure regulation, and vascular remodeling in astronauts during ISS missions.',
    source: 'NASA Task Book'
  },
  {
    planet: 'Earth',
    title: 'Immune System Dysregulation in Microgravity',
    summary: 'Analysis of T-cell function, cytokine production, and immune response changes in astronauts during extended space missions.',
    source: 'NASA OSDR'
  },
  {
    planet: 'Earth',
    title: 'Circadian Rhythm Disruption in Space',
    summary: 'Study of circadian clock gene expression and sleep-wake cycle alterations in astronauts exposed to 90-minute day-night cycles aboard the ISS.',
    source: 'NASA Space Biology'
  },
  {
    planet: 'Moon',
    title: 'Lunar Dust Toxicity on Lung Tissue',
    summary: 'In vitro assessment of lunar regolith simulant effects on human bronchial epithelial cells, examining inflammatory responses and oxidative stress.',
    source: 'NASA NSLSL'
  },
  {
    planet: 'Moon',
    title: 'Plant Growth in Lunar Regolith',
    summary: 'First successful growth of terrestrial plants in authentic lunar soil samples from Apollo missions, analyzing nutrient uptake and stress responses.',
    source: 'NASA Space Biology'
  },
  {
    planet: 'Earth',
    title: 'Radiation Effects on DNA Repair Mechanisms',
    summary: 'Investigation of DNA double-strand break repair pathways in human cells exposed to high-LET radiation similar to galactic cosmic rays.',
    source: 'NASA GeneLab'
  },
  {
    planet: 'Earth',
    title: 'Bone Loss Countermeasures in Spaceflight',
    summary: 'Evaluation of exercise protocols and bisphosphonate treatments for preventing bone mineral density loss during long-duration missions.',
    source: 'NASA Task Book'
  },
  {
    planet: 'Mars',
    title: 'Cyanobacteria Oxygen Production for ISRU',
    summary: 'Testing photosynthetic cyanobacteria strains for oxygen generation and biomass production in simulated Martian atmospheric conditions.',
    source: 'NASA NSLSL'
  },
  {
    planet: 'Earth',
    title: 'Neurological Changes in Microgravity',
    summary: 'MRI analysis of brain structure changes, including upward brain shift and optic nerve sheath distension, in astronauts during spaceflight.',
    source: 'NASA OSDR'
  },
  {
    planet: 'Europa',
    title: 'Psychrophilic Bacteria in Analog Environments',
    summary: 'Study of cold-adapted extremophiles in Antarctic ice and deep-sea hydrothermal vents as analogs for potential Europa subsurface ocean life.',
    source: 'NASA Space Biology'
  },
  {
    planet: 'Earth',
    title: 'Mitochondrial Dysfunction in Spaceflight',
    summary: 'Analysis of mitochondrial oxidative capacity, ATP production, and reactive oxygen species generation in muscle tissue after spaceflight.',
    source: 'NASA GeneLab'
  },
  {
    planet: 'Titan',
    title: 'Organic Chemistry in Titan-like Atmospheres',
    summary: 'Laboratory simulation of Titan atmospheric chemistry to study prebiotic molecule formation from nitrogen and methane under UV radiation.',
    source: 'NASA Space Biology'
  },
  {
    planet: 'Earth',
    title: 'Stem Cell Differentiation in Microgravity',
    summary: 'Investigation of mesenchymal stem cell osteogenic and adipogenic differentiation pathways under simulated and true microgravity conditions.',
    source: 'NASA OSDR'
  },
  {
    planet: 'Venus',
    title: 'Acidophilic Microorganisms as Venus Analogs',
    summary: 'Characterization of extremophiles from acidic hot springs and sulfur-rich environments as potential analogs for Venus cloud habitability.',
    source: 'NASA Space Biology'
  },
];

export default function Research() {
  const [params] = useSearchParams();
  const planet = params.get('planet');
  const q = params.get('q');
  let results = RESEARCH_PAPERS;
  if (planet) {
    results = results.filter(r => r.planet.toLowerCase() === planet.toLowerCase());
  }
  if (q) {
    const term = q.toLowerCase();
    results = results.filter(r => r.title.toLowerCase().includes(term) || r.summary.toLowerCase().includes(term));
  }

  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Space Biology Research
            {(planet || q) && <span className="text-white/50 text-2xl align-middle ml-3">/ {planet ? planet : ''}{planet && q ? ' • ' : ''}{q ? `"${q}"` : ''}</span>}
          </h1>
          <p className="text-white/60 max-w-2xl">
            Curated experimental datasets, modeling outputs, and mission-relevant biological insights from NASA's space biology research programs. 
            {planet ? ` Filtered by ${planet}. ` : ''}
            {q ? ` Search matches for "${q}".` : (!planet && ' Use the search to filter research papers.')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {results.map((r,i) => (
            <div key={i} className="rounded-2xl border border-white/10 p-6 bg-white/5 backdrop-blur-sm hover:border-white/25 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold flex-1">{r.title}</h3>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs uppercase tracking-wider text-white/40">{r.planet}</span>
                <span className="text-white/20">•</span>
                <span className="text-xs text-white/50">{r.source}</span>
              </div>
              <p className="text-white/70 leading-relaxed text-sm">{r.summary}</p>
            </div>
          ))}
          {!results.length && (
            <div className="col-span-full text-white/50 text-sm">
              No research papers found {planet ? `for ${planet}` : ''}{(planet && q) ? ' and ' : ''}{q ? `matching "${q}"` : ''}.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
