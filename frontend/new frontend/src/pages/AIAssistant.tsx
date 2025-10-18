import { useState, useEffect } from 'react';
import { Send, Loader2, BookOpen, Sparkles, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { LiveRegion, StatusMessage, AlertMessage } from '@/components/LiveRegion';

// Backend API URL
// When deploying, update this to your production backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  metadata?: any;
}

interface Source {
  type: string;
  id: string;
  title: string;
  year?: number;
  url?: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Space Biology Research Assistant. I can answer questions about spaceflight effects, microgravity, radiation, and countermeasures using our knowledge graph. Ask me anything!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [examples, setExamples] = useState<string[]>([]);
  const [ttsState, ttsControls] = useTextToSpeech();
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);

  // Load example questions on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/chat/examples`)
      .then(r => r.json())
      .then(data => {
        if (data.examples && Array.isArray(data.examples)) {
          // Flatten the nested structure: extract all questions from all categories
          const allQuestions = data.examples.flatMap((cat: any) => 
            Array.isArray(cat.questions) ? cat.questions : []
          );
          setExamples(allQuestions.slice(0, 5));
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content,
          max_papers: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        metadata: data.metadata,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please make sure the backend is running and try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const handleReadAloud = (content: string, index: number) => {
    if (speakingMessageIndex === index && ttsState.speaking) {
      ttsControls.stop();
      setSpeakingMessageIndex(null);
    } else {
      ttsControls.speak(content, {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });
      setSpeakingMessageIndex(index);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-black text-white pt-20" role="main" aria-label="AI Research Assistant">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              AI Research Assistant
            </h1>
          </div>
          <p className="text-white/70 max-w-2xl mx-auto">
            Ask questions about space biology research. Powered by Knowledge Graph + AI.
          </p>
        </div>

        {/* Example Questions */}
        {messages.length === 1 && examples.length > 0 && (
          <Card className="bg-white/5 border-white/10 p-6 mb-6">
            <p className="text-sm text-white/70 mb-3">💡 Try asking:</p>
            <div className="grid gap-2">
              {examples.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  className="text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-sm text-white/90 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Chat Messages */}
        <div className="space-y-6 mb-6" role="log" aria-label="Conversation history" aria-live="polite">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600/20 border-blue-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="prose prose-invert max-w-none flex-1">
                    <p className="text-white/90 whitespace-pre-wrap">{message.content}</p>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-white/50 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Sources ({message.sources.length} papers):
                      </p>
                      <div className="space-y-2">
                        {message.sources.map((source, sourceIdx) => (
                          <div
                            key={sourceIdx}
                            className="text-xs bg-white/5 p-2 rounded border border-white/10"
                          >
                            <p className="font-medium text-white/80">{source.title}</p>
                            {source.year && (
                              <p className="text-white/50">Year: {source.year}</p>
                            )}
                            {source.url && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline"
                              >
                                View on PubMed →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  {message.metadata && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex flex-wrap gap-3 text-xs text-white/50">
                        <span>📊 {message.metadata.paper_count} papers analyzed</span>
                        <span>🔬 {message.metadata.entity_count} entities</span>
                        {message.metadata.llm_provider !== 'none' && (
                          <span>🤖 {message.metadata.llm_provider}</span>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                  
                  {/* Read Aloud Button - only for assistant messages */}
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReadAloud(message.content, idx)}
                      className="text-white/50 hover:text-white shrink-0"
                      data-tour="read-aloud"
                      aria-label={speakingMessageIndex === idx ? 'Stop reading' : 'Read aloud'}
                    >
                      {speakingMessageIndex === idx && ttsState.speaking ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <>
              <div className="flex justify-start">
                <Card className="bg-white/5 border-white/10 p-4">
                  <div className="flex items-center gap-3 text-white/70">
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span>Searching knowledge graph...</span>
                  </div>
                </Card>
              </div>
              <StatusMessage type="loading" message="AI assistant is searching the knowledge graph for relevant information..." />
            </>
          )}

          {/* Success announcement for new messages */}
          {!loading && messages.length > 1 && messages[messages.length - 1].role === 'assistant' && (
            <LiveRegion
              message="AI assistant has responded. New message received."
              politeness="polite"
              clearAfter={3000}
            />
          )}
        </div>

        {/* Warning about LLM */}
        <Card className="bg-amber-500/10 border-amber-500/20 p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-amber-200 font-medium mb-1">Running in Fallback Mode</p>
              <p className="text-amber-300/80">
                For AI-powered synthesis, set <code className="bg-black/30 px-1 py-0.5 rounded">OPENAI_API_KEY</code> or{' '}
                <code className="bg-black/30 px-1 py-0.5 rounded">ANTHROPIC_API_KEY</code> environment variable.
                Currently showing structured knowledge graph data only.
              </p>
            </div>
          </div>
        </Card>

        {/* Input Form */}
        <Card className="bg-white/5 border-white/10 p-4 sticky bottom-4">
          <form onSubmit={handleSubmit} className="flex gap-3" role="search" aria-label="Ask AI research assistant">
            <div className="flex-1">
              <label htmlFor="chat-input" className="sr-only">
                Ask a question about space biology research
              </label>
              <Input
                id="chat-input"
                type="text"
                placeholder="Ask a question about space biology research..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                aria-disabled={loading}
                className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-500"
                aria-label="Ask a question about microgravity, radiation, or space biology"
                aria-describedby="chat-hint"
              />
              <span id="chat-hint" className="sr-only">
                Ask questions about spaceflight effects, microgravity, radiation exposure, countermeasures, or any space biology topic
              </span>
            </div>
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
              aria-label={loading ? "Sending question to AI assistant..." : "Send question to AI assistant"}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span className="sr-only">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" aria-hidden="true" />
                  <span className="sr-only">Send</span>
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
