import { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TRENDS_FORCE_MOCK = (import.meta.env.VITE_TRENDS_MOCK === '1' || import.meta.env.VITE_TRENDS_MOCK === 'true');

interface TimelinePoint { year: number; papers: number; }
interface TopicTrend { topic: string; trend: number; status: string; total_papers: number; }
interface Author { name: string; papers: number; citations: number; h_index: number; }
interface CoPair { source: string; target: string; count: number; }

// ---------- Client-side mock generators (mirrors backend routes) ----------
function generateSampleTimeline(years: number = 10) : TimelinePoint[] {
  const current = new Date().getFullYear();
  const arr: TimelinePoint[] = [];
  for (let i = years - 1; i >= 0; i--) {
    const year = current - i;
    const growth = (years - 1 - i);
    const papers = Math.max(5, Math.round(40 + growth * 4 + Math.sin(growth/1.6)*8 + (Math.random()*10-5)));
    arr.push({ year, papers });
  }
  return arr;
}

function generateSampleTopics(): TopicTrend[] {
  const base = [
    'microgravity bone loss', 'stem cell differentiation', 'oxidative stress response',
    'immune dysregulation', 'circadian rhythm', 'radiation dna repair',
    'muscle atrophy', 'mitochondrial dynamics'
  ];
  return base.map(t => {
    const trend = parseFloat((Math.random()*2.2 - 1.0).toFixed(3));
    const status = trend > 0.45 ? 'emerging' : trend < -0.45 ? 'declining' : 'stable';
    return { topic: t, trend, status, total_papers: Math.floor(Math.random()*220)+15 };
  });
}

function generateSampleAuthors(): Author[] {
  const names = ['Smith J.', 'Garcia L.', 'Kumar A.', 'Chen W.', 'Lopez M.', 'Yamamoto T.', 'Ivanov P.', 'Singh R.'];
  return names.map(n => {
    const papers = Math.floor(Math.random()*55)+5;
    return { name: n, papers, citations: papers * (Math.floor(Math.random()*20)+4), h_index: Math.min(papers, Math.floor(Math.random()*16)+4) };
  }).sort((a,b)=>b.papers-a.papers);
}

function generateSampleCoPairs(topics: TopicTrend[]): CoPair[] {
  const pairs: CoPair[] = [];
  for (let i=0;i<topics.length;i++) {
    for (let j=i+1;j<topics.length;j++) {
      if (Math.random() < 0.35) {
        pairs.push({ source: topics[i].topic, target: topics[j].topic, count: Math.floor(Math.random()*37)+3 });
      }
    }
  }
  return pairs;
}

export default function Trends() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [topics, setTopics] = useState<TopicTrend[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [coPairs, setCoPairs] = useState<CoPair[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [mockFallback, setMockFallback] = useState(false);
  const [showStable, setShowStable] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null); setMockFallback(false);
      // If forced mock, skip network
      if (TRENDS_FORCE_MOCK) {
        const t = generateSampleTopics();
        setTimeline(generateSampleTimeline());
        setTopics(t);
        setAuthors(generateSampleAuthors());
        setCoPairs(generateSampleCoPairs(t));
        setLastUpdated(new Date().toISOString());
        setMockFallback(true);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/trends/summary`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTimeline(data.timeline || []);
        setTopics(data.topics || []);
        setAuthors(data.topAuthors || []);
        setCoPairs(data.cooccurrence?.pairs || []);
        setLastUpdated(data.generated_at);
      } catch (e: any) {
        // Fallback to client mock if backend unreachable
        const t = generateSampleTopics();
        setTimeline(generateSampleTimeline());
        setTopics(t);
        setAuthors(generateSampleAuthors());
        setCoPairs(generateSampleCoPairs(t));
        setLastUpdated(new Date().toISOString());
        setMockFallback(true);
        // Do not show red error banner, but keep a console note
        console.debug('[Trends] Network fetch failed, using client mock:', e?.message);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const filteredTopics = useMemo(() => topics.filter(t => showStable || t.status !== 'stable'), [topics, showStable]);
  const emerging = filteredTopics.filter(t => t.status === 'emerging');
  const declining = filteredTopics.filter(t => t.status === 'declining');

  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Research Trends</h1>
            <p className="text-white/60 max-w-2xl">Live analytics summarizing publication volume, emerging & declining topics, and author impact across space biology literature.</p>
            {lastUpdated && (
              <p className="text-xs text-white/40 mt-3">Generated: {new Date(lastUpdated).toLocaleString()}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer select-none">
              <input type="checkbox" className="accent-blue-500" checked={showStable} onChange={e => setShowStable(e.target.checked)} />
              Show stable topics
            </label>
          </div>
        </div>

        {error && !mockFallback && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 mb-8">
            <p className="text-red-300 text-sm">⚠️ {error}</p>
          </div>
        )}

        {mockFallback && (
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 mb-8 text-sm text-blue-200">
            Showing locally generated mock trend analytics (backend unavailable). Set <code className="bg-black/40 px-1 rounded">VITE_TRENDS_MOCK=0</code> and start the API to load real data.
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-white/10 p-8 bg-white/5 mb-8 animate-pulse">
            <p className="text-white/50 text-sm">Loading trend analytics…</p>
          </div>
        )}

  {!loading && (error ? mockFallback : true) && (
          <div className="space-y-14">
            {/* Publication Timeline */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">📈 Publication Timeline</h2>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="year" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
                    <Line type="monotone" dataKey="papers" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Emerging & Declining Topics */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">🔥 Topic Momentum</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="font-medium mb-2 text-emerald-300">Emerging</h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2 text-sm">
                    {emerging.length === 0 && <p className="text-white/40 text-xs">None</p>}
                    {emerging.map(t => (
                      <div key={t.topic} className="flex items-center justify-between gap-4 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <span className="flex-1 truncate" title={t.topic}>{t.topic}</span>
                        <span className="text-emerald-300 font-mono text-xs">{t.trend.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="font-medium mb-2 text-red-300">Declining</h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2 text-sm">
                    {declining.length === 0 && <p className="text-white/40 text-xs">None</p>}
                    {declining.map(t => (
                      <div key={t.topic} className="flex items-center justify-between gap-4 p-2 rounded bg-red-500/10 border border-red-500/20">
                        <span className="flex-1 truncate" title={t.topic}>{t.topic}</span>
                        <span className="text-red-300 font-mono text-xs">{t.trend.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Topic Distribution (bar chart) */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">🏷️ Topic Volume</h2>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredTopics.slice().sort((a,b)=>b.total_papers - a.total_papers)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="topic" tickFormatter={(v:any)=>v.split(' ').slice(0,2).join(' ')} stroke="#888" interval={0} angle={-20} textAnchor="end" height={70} />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
                    <Legend />
                    <Bar dataKey="total_papers" fill="#6366f1" name="Papers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Author Impact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">🏆 Author Impact</h2>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 0 }}>
                    <CartesianGrid stroke="#222" />
                    <XAxis type="number" dataKey="papers" name="Papers" stroke="#888" />
                    <YAxis type="number" dataKey="citations" name="Citations" stroke="#888" />
                    <ZAxis type="number" dataKey="h_index" range={[60, 400]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#111', border: '1px solid #333' }} formatter={(val:any, name:any, props:any)=>[val, name]} />
                    <Scatter name="Authors" data={authors} fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <p className="text-white/40 text-xs mt-2">Bubble size ~ h-index (mock data)</p>
            </section>

            {/* Co-occurrence table */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">🔗 Topic Co-occurrence</h2>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/60 text-left">
                      <th className="py-2 pr-4">Source</th>
                      <th className="py-2 pr-4">Target</th>
                      <th className="py-2 pr-4">Co-occurrence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coPairs.slice(0, 60).map((p,i)=>(
                      <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                        <td className="py-2 pr-4 whitespace-nowrap">{p.source}</td>
                        <td className="py-2 pr-4 whitespace-nowrap">{p.target}</td>
                        <td className="py-2 pr-4 font-mono">{p.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {coPairs.length === 0 && <p className="text-white/40 text-xs">No pairs generated.</p>}
              </div>
            </section>
          </div>
        )}
        <p className="text-white/30 text-[10px] mt-16">All trend analytics are currently mock-generated. Connect real Neo4j + topic modeling pipeline to replace this layer.</p>
      </div>
    </main>
  );
}