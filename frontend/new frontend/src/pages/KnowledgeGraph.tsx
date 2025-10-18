import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { Search, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import EvidenceModal from '@/components/EvidenceModal';
import { StatsAudio } from '@/components/AudioChart';
import { LiveRegion, StatusMessage, AlertMessage } from '@/components/LiveRegion';

// ⚠️ TEMPORARY BACKEND URL
// When moving to main laptop, change this to your production backend URL
// Example: const API_BASE_URL = 'https://your-backend.com/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const MOCK_MODE = (import.meta.env.VITE_MOCK_KG === '1' || import.meta.env.VITE_MOCK_KG === 'true');

function buildMockGraph(query: string): GraphData {
  const rootEntity = query.trim() || 'sample';
  return {
    query: rootEntity,
    rootEntity,
    paperCount: 1,
    nodes: [
      { id: `entity:${rootEntity}`, label: rootEntity.toUpperCase(), type: 'entity', group: 1 },
      { id: 'paper:123456', label: `${rootEntity} Study in Microgravity`, type: 'paper', group: 2, paperId: '123456' },
      { id: 'entity:microgravity', label: 'Microgravity', type: 'entity', group: 1 },
    ],
    links: [
      { source: `entity:${rootEntity}`, target: 'paper:123456', value: 1 },
      { source: 'paper:123456', target: 'entity:microgravity', value: 1 },
    ]
  };
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'entity' | 'paper';
  group: number;
  paperId?: string;
  url?: string;
  fullTitle?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
  type?: string;
}

interface GraphData {
  query: string;
  rootEntity: string;
  nodes: Node[];
  links: Link[];
  paperCount: number;
}

export default function KnowledgeGraph() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockFallback, setMockFallback] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<{sourceId: string, targetId: string, relationshipType: string} | null>(null);
  const [forceLive, setForceLive] = useState(false);

  const fetchKnowledgeGraph = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedPaper(null);

    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-graph?q=${encodeURIComponent(searchQuery)}`);

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.detail || errorMsg;
        } catch (_) { /* swallow */ }
        throw new Error(errorMsg);
      }

      const raw = await response.json();
      const normQuery = searchQuery.trim();
      const paperCount = raw.paperCount ?? (Array.isArray(raw.nodes) ? raw.nodes.filter((n: any) => n.type === 'paper').length : 0);
      const normalized: GraphData = {
        query: normQuery,
        rootEntity: raw.rootEntity || normQuery,
        nodes: raw.nodes || [],
        links: raw.links || [],
        paperCount
      };
      setGraphData(normalized);
      setError(null);
      setMockFallback(false);
      console.debug('[KG] Loaded live graph', { normQuery, paperCount });
    } catch (err) {
      if (MOCK_MODE && !forceLive) {
        // Use mock data silently; treat as info not error
        const mock = buildMockGraph(searchQuery);
        setGraphData(mock);
        setMockFallback(true);
        setError(null);
        console.debug('[KG] Using mock fallback graph');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
        if (MOCK_MODE && forceLive) {
          // keep existing graph so user can revert
          console.debug('[KG] Live fetch failed while forceLive enabled', err);
        } else {
          setGraphData(null);
          setMockFallback(false);
        }
        console.debug('[KG] Error fetching live graph', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      fetchKnowledgeGraph(query.trim());
    }
  };

  const handleNodeClick = async (node: Node) => {
    if (node.type === 'paper' && node.paperId) {
      // In mock mode just synthesize a paper detail object
      if (MOCK_MODE) {
        // Derive related entities from current graph links
        let relatedEntities: string[] = [];
        if (graphData) {
          const entityIds = new Set<string>();
          graphData.links.forEach(l => {
            const src = typeof l.source === 'string' ? l.source : l.source.id;
            const tgt = typeof l.target === 'string' ? l.target : l.target.id;
            if (src === node.id) {
              const targetNode = graphData.nodes.find(n => n.id === tgt && n.type === 'entity');
              if (targetNode) entityIds.add(targetNode.label);
            } else if (tgt === node.id) {
              const sourceNode = graphData.nodes.find(n => n.id === src && n.type === 'entity');
              if (sourceNode) entityIds.add(sourceNode.label);
            }
          });
          relatedEntities = Array.from(entityIds);
        }
        setSelectedPaper({
          id: node.paperId,
          title: node.label,
          year: new Date().getFullYear(),
          entities: relatedEntities.length ? relatedEntities : ['Microgravity', 'Spaceflight'],
          abstract: `This is a mock abstract describing the study "${node.label}". Disable mock mode to load real paper metadata from the backend API once it is running.`,
          url: `https://pubmed.ncbi.nlm.nih.gov/${node.paperId}/`
        });
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/paper/${node.paperId}`);
        if (response.ok) {
          const paperData = await response.json();
          setSelectedPaper(paperData);
        } else {
          console.warn('Backend returned non-OK for paper details; synthesizing fallback');
          // Fallback synthesize
          let relatedEntities: string[] = [];
          if (graphData) {
            const entityIds = new Set<string>();
            graphData.links.forEach(l => {
              const src = typeof l.source === 'string' ? l.source : l.source.id;
              const tgt = typeof l.target === 'string' ? l.target : l.target.id;
              if (src === node.id) {
                const targetNode = graphData.nodes.find(n => n.id === tgt && n.type === 'entity');
                if (targetNode) entityIds.add(targetNode.label);
              } else if (tgt === node.id) {
                const sourceNode = graphData.nodes.find(n => n.id === src && n.type === 'entity');
                if (sourceNode) entityIds.add(sourceNode.label);
              }
            });
            relatedEntities = Array.from(entityIds);
          }
          setSelectedPaper({
            id: node.paperId,
            title: node.label,
            year: new Date().getFullYear(),
            entities: relatedEntities.length ? relatedEntities : ['Microgravity'],
            abstract: 'Fallback generated paper details (backend endpoint not available).',
            url: `https://pubmed.ncbi.nlm.nih.gov/${node.paperId}/`
          });
        }
      } catch (err) {
        console.error('Failed to fetch paper details; synthesizing fallback:', err);
        let relatedEntities: string[] = [];
        if (graphData) {
          const entityIds = new Set<string>();
          graphData.links.forEach(l => {
            const src = typeof l.source === 'string' ? l.source : l.source.id;
            const tgt = typeof l.target === 'string' ? l.target : l.target.id;
            if (src === node.id) {
              const targetNode = graphData.nodes.find(n => n.id === tgt && n.type === 'entity');
              if (targetNode) entityIds.add(targetNode.label);
            } else if (tgt === node.id) {
              const sourceNode = graphData.nodes.find(n => n.id === src && n.type === 'entity');
              if (sourceNode) entityIds.add(sourceNode.label);
            }
          });
          relatedEntities = Array.from(entityIds);
        }
        setSelectedPaper({
          id: node.paperId,
          title: node.label,
          year: new Date().getFullYear(),
          entities: relatedEntities.length ? relatedEntities : ['Spaceflight'],
          abstract: 'Offline fallback (network error).',
          url: `https://pubmed.ncbi.nlm.nih.gov/${node.paperId}/`
        });
      }
    }
  };

  const openPaperInResearch = (url: string) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      setQuery(initialQuery);
      fetchKnowledgeGraph(initialQuery);
    }
  }, []);

  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create arrow marker for links
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#666')
      .style('opacity', 0.6);

    // Create force simulation
    const simulation = d3.forceSimulation<Node>(graphData.nodes)
      .force('link', d3.forceLink<Node, Link>(graphData.links)
        .id(d => d.id)
        .distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value))
      .attr('marker-end', 'url(#arrowhead)')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        const source = typeof d.source === 'string' ? d.source : d.source.id;
        const target = typeof d.target === 'string' ? d.target : d.target.id;
        setSelectedEdge({
          sourceId: source,
          targetId: target,
          relationshipType: d.type || 'RELATED_TO'
        });
        setEvidenceModalOpen(true);
      })
      .on('mouseenter', function(this: SVGLineElement) {
        d3.select(this)
          .attr('stroke', '#3b82f6')
          .attr('stroke-width', function(d: any) { return Math.sqrt(d.value) * 2; });
      })
      .on('mouseleave', function(this: SVGLineElement) {
        d3.select(this)
          .attr('stroke', '#999')
          .attr('stroke-width', function(d: any) { return Math.sqrt(d.value); });
      });

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Add circles for nodes
    node.append('circle')
      .attr('r', (d: Node) => d.type === 'entity' ? 30 : 20)
      .attr('fill', (d: Node) => d.type === 'entity' ? '#3b82f6' : '#10b981')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        handleNodeClick(d);
      })
      .on('mouseenter', function(event, d: Node) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d.type === 'entity' ? 30 : 20) * 1.2);
      })
      .on('mouseleave', function(event, d: Node) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.type === 'entity' ? 30 : 20);
      });

    // Add labels
    node.append('text')
      .text(d => d.label)
      .attr('font-size', d => d.type === 'entity' ? '14px' : '11px')
      .attr('font-weight', d => d.type === 'entity' ? 'bold' : 'normal')
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.type === 'entity' ? 45 : 35)
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .each(function(d) {
        const text = d3.select(this);
        const words = d.label.split(' ');
        if (words.length > 3) {
          text.text('');
          const tspan1 = text.append('tspan')
            .attr('x', 0)
            .attr('dy', d.type === 'entity' ? 45 : 35)
            .text(words.slice(0, 3).join(' '));
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', 15)
            .text(words.slice(3).join(' ') + '...');
        }
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [graphData]);

  return (
    <main id="main-content" className="min-h-screen bg-black text-white pt-20" role="main" aria-label="Knowledge Graph Explorer" data-tour="knowledge-graph">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {MOCK_MODE && (
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-xs text-white/50 hidden sm:inline">
                  {forceLive ? 'Attempting live Neo4j data' : mockFallback ? 'Mock graph active' : 'Mock mode enabled'}
                </span>
                <Button
                  variant={forceLive ? 'destructive' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    const next = !forceLive;
                    setForceLive(next);
                    if (graphData && graphData.query) {
                      fetchKnowledgeGraph(graphData.query);
                    } else if (query.trim()) {
                      fetchKnowledgeGraph(query.trim());
                    }
                  }}
                  className={forceLive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
                >
                  {forceLive ? 'Back to Mock' : 'Use Live Data'}
                </Button>
              </div>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white" data-tour="graph-title">
            Knowledge Graph Explorer
          </h1>
          <p className="text-white/70 max-w-3xl mb-6">
            Explore the interconnected web of space biology research. Search for proteins, genes, 
            biological processes, or experimental conditions to visualize their relationships 
            with research papers and discover new connections.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl" role="search" aria-label="Search knowledge graph" data-tour="search-bar">
            <div className="relative flex-1">
              <label htmlFor="knowledge-graph-search" className="sr-only">
                Search space biology research
              </label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" aria-hidden="true" />
              <Input
                id="knowledge-graph-search"
                type="search"
                placeholder="Search for proteins, genes, processes (e.g., 'stem cells', 'microgravity', 'bone loss')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-500"
                aria-label="Search for proteins, genes, or biological processes"
                aria-describedby="search-hint"
              />
              <span id="search-hint" className="sr-only">
                Enter keywords like proteins, genes, experimental conditions, or diseases to generate a knowledge graph visualization
              </span>
            </div>
            <Button 
              type="submit" 
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700"
              aria-label={loading ? "Generating knowledge graph..." : "Generate knowledge graph visualization"}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  <span>Loading...</span>
                </>
              ) : (
                'Generate Graph'
              )}
            </Button>
          </form>
        </div>

        {/* Error Message */}
        {error && !mockFallback && (
          <>
            <Card className="bg-red-500/10 border-red-500/20 p-4 mb-6" role="alert">
              <p className="text-red-400">
                ⚠️ {error}
                {error.includes('Failed to fetch') && (
                  <span className="block mt-2 text-sm">
                    Make sure the backend is running: <code className="bg-black/30 px-2 py-1 rounded">cd backend &amp;&amp; .\\.venv\\Scripts\\Activate.ps1 &amp;&amp; python main.py</code>
                  </span>
                )}
              </p>
            </Card>
            <AlertMessage message={`Error loading knowledge graph: ${error}`} />
          </>
        )}
        {(mockFallback || (MOCK_MODE && !forceLive)) && !loading && graphData && (
          <Card className="bg-blue-500/10 border-blue-400/30 p-4 mb-6" role="status">
            <p className="text-blue-300 text-sm">
              {forceLive ? 'Live data attempt failed; retaining previous mock graph.' : 'Showing sample knowledge graph (mock mode).'}
              {MOCK_MODE && ' Click "Use Live Data" to attempt querying Neo4j.'}
            </p>
          </Card>
        )}

        {/* Loading announcement */}
        {loading && (
          <StatusMessage type="loading" message="Generating knowledge graph visualization..." />
        )}

        {/* Success announcement */}
        {graphData && !loading && (
          <LiveRegion 
            message={`Knowledge graph loaded successfully. Showing ${graphData.paperCount} papers and ${graphData.nodes.length} entities.`}
            politeness="polite"
            clearAfter={5000}
          />
        )}

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Graph Visualization */}
          <div className="lg:col-span-2" data-tour="graph-visualization">
            <Card className="bg-white/5 border-white/10 p-6 h-[600px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                </div>
              ) : graphData ? (
                <div className="relative h-full">
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent z-10 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/70">
                          <span className="font-semibold text-white">Root Entity:</span> {graphData.rootEntity}
                          <span className="ml-4">
                            <span className="font-semibold text-white">Papers:</span> {graphData.paperCount}
                          </span>
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          💡 Drag nodes to rearrange • Scroll to zoom • Click papers to view details
                        </p>
                      </div>
                      
                      {/* Audio Stats */}
                      <div data-tour="audio-stats">
                        <StatsAudio
                          papers={graphData.paperCount}
                          entities={graphData.nodes.filter(n => n.type === 'entity').length}
                          relationships={graphData.links.length}
                          autoPlay={false}
                        />
                      </div>
                    </div>
                  </div>
                  <svg
                    ref={svgRef}
                    className="w-full h-full"
                    style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0f 100%)' }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/50">
                  <Search className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">No graph loaded</p>
                  <p className="text-sm mt-2">Enter a search term to generate a knowledge graph</p>
                </div>
              )}
            </Card>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 p-6 h-[600px] overflow-y-auto">
              {selectedPaper ? (
                <div>
                  <h3 className="text-xl font-bold mb-4 text-white">Paper Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-white/50 mb-1">TITLE</p>
                      <p className="text-sm font-medium text-white">{selectedPaper.title}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-white/50 mb-1">ID</p>
                      <p className="text-sm text-white/70">{selectedPaper.id}</p>
                    </div>

                    {selectedPaper.year && (
                      <div>
                        <p className="text-xs text-white/50 mb-1">YEAR</p>
                        <p className="text-sm text-white/70">{selectedPaper.year}</p>
                      </div>
                    )}

                    {selectedPaper.abstract && (
                      <div>
                        <p className="text-xs text-white/50 mb-1">ABSTRACT</p>
                        <p className="text-xs text-white/60 leading-relaxed">{selectedPaper.abstract}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-white/50 mb-2">RELATED ENTITIES</p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedPaper.entities || []).map((entity: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                          >
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => openPaperInResearch(selectedPaper.url)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Full Article
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setSelectedPaper(null)}
                      className="w-full border-white/10 text-white hover:bg-white/5"
                    >
                      Close Details
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/50">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <ExternalLink className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-center">
                    Click on a paper node (green circles) to view details
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Evidence Modal */}
        {selectedEdge && (
          <EvidenceModal
            open={evidenceModalOpen}
            onClose={() => {
              setEvidenceModalOpen(false);
              setSelectedEdge(null);
            }}
            sourceId={selectedEdge.sourceId}
            targetId={selectedEdge.targetId}
            relationshipType={selectedEdge.relationshipType}
          />
        )}

        {/* Legend */}
        <Card className="bg-white/5 border-white/10 p-4 mt-6">
          <p className="text-sm font-semibold text-white mb-3">Legend</p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white"></div>
              <span className="text-sm text-white/70">Entity / Concept</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white"></div>
              <span className="text-sm text-white/70">Research Paper</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-0.5 bg-gray-500"></div>
              <span className="text-sm text-white/70">Relationship (click for evidence)</span>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
