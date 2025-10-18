/**
 * Tour Script - Voice-guided walkthrough of Astrobiomers
 */

import { TourStep } from '@/components/GuidedTour';

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Astrobiomers! 🚀',
    description: 'Discover how AI transforms space biology research. Let me show you around with voice guidance!',
    voiceScript: `Welcome to Astrobiomers, your AI-powered Space Biology Knowledge Engine! 
    I'll guide you through our platform's features with voice narration. 
    This tour will take about 3 minutes. You can pause, skip, or navigate at your own pace. 
    Let's begin our journey through the cosmos of biological research!`,
    target: '.logo', // Target logo or header
    position: 'bottom'
  },

  {
    id: 'knowledge-graph',
    title: 'Interactive Knowledge Graph',
    description: 'Explore 608 NASA publications as an interactive network. Search for organisms, compounds, or biological processes.',
    voiceScript: `The heart of Astrobiomers is our Interactive Knowledge Graph. 
    We've processed 608 NASA space biology publications and organized them into a visual network. 
    Each node represents a paper, organism, compound, or biological process. 
    Connections show relationships discovered through AI analysis. 
    You can search, zoom, and click to explore the interconnected world of space biology research.`,
    target: '[data-tour="knowledge-graph"]',
    position: 'top'
  },

  {
    id: 'search',
    title: 'Intelligent Search',
    description: 'Type any term like "microgravity", "radiation", or "stem cells" to instantly see related research.',
    voiceScript: `Our Intelligent Search uses natural language processing to understand your queries. 
    Simply type a term like microgravity, radiation, or stem cells. 
    The graph updates in real-time, showing relevant papers and entities. 
    The AI understands biological relationships, so searching for bone density will also show related 
    terms like osteoblasts, calcium, and countermeasures. 
    Try it now with any space biology topic that interests you!`,
    target: '[data-tour="search-bar"]',
    position: 'bottom'
  },

  {
    id: 'paper-details',
    title: 'AI-Enhanced Paper Details',
    description: 'Click any paper node to view its details. Get AI-generated summaries and voice narration instantly.',
    voiceScript: `When you click on a green paper node, you'll see comprehensive details. 
    This includes the title, authors, publication year, and abstract. 
    But here's where AI shines: You can generate an instant summary using BART or PEGASUS models. 
    These advanced transformer models condense complex abstracts into concise summaries. 
    You can also use the Read Aloud feature for hands-free learning. 
    Perfect for accessibility or when you're multitasking!`,
    target: '[data-tour="paper-node"]',
    position: 'left'
  },

  {
    id: 'ai-assistant',
    title: 'RAG-Powered AI Assistant',
    description: 'Ask questions about space biology research and get answers grounded in actual papers with citations.',
    voiceScript: `Our AI Research Assistant uses Retrieval Augmented Generation, or RAG. 
    Ask any question about space biology, like "What are the effects of microgravity on bone density?" 
    The assistant searches our knowledge graph, finds relevant papers, 
    and generates an answer based on actual research, complete with citations. 
    This ensures every claim is backed by scientific publications. 
    It's like having a research librarian with instant access to all 608 papers!`,
    target: '[data-tour="ai-assistant"]',
    position: 'right'
  },

  {
    id: 'entities',
    title: 'Entity Extraction',
    description: 'Our AI automatically identifies organisms, compounds, and biological processes using SciBERT.',
    voiceScript: `Behind the scenes, we use SciBERT, a BERT model trained on scientific literature. 
    It performs Named Entity Recognition to identify key concepts in each paper. 
    This includes organisms like mice, plants, or bacteria; 
    compounds like calcium or cortisol; 
    and biological processes like apoptosis or gene expression. 
    These entities become nodes in our knowledge graph, 
    connecting papers that study similar concepts, even if they use different terminology.`,
    target: '[data-tour="entity-filter"]',
    position: 'bottom'
  },

  {
    id: 'visualization',
    title: 'High-Performance Visualization',
    description: 'Powered by Sigma.js and WebGL for smooth rendering of complex networks with thousands of connections.',
    voiceScript: `Our visualization uses Sigma dot j s, a high-performance graph rendering library. 
    It leverages WebGL for hardware-accelerated graphics, 
    allowing smooth interaction even with hundreds of nodes and relationships. 
    You can zoom, pan, and explore without lag. 
    Different colors represent different entity types: green for papers, 
    blue for organisms, purple for compounds, and orange for biological processes. 
    The layout algorithm positions related items close together, revealing clusters of research themes.`,
    target: '[data-tour="graph-canvas"]',
    position: 'top'
  },

  {
    id: 'offline-mode',
    title: 'Works Offline',
    description: 'Service workers cache data locally. Access previously viewed content even without internet.',
    voiceScript: `Astrobiomers works offline thanks to service workers. 
    Once you've loaded the app, it caches essential data and assets locally. 
    If you lose internet connection, you can still browse previously viewed papers and entities. 
    The app automatically syncs new data when you're back online. 
    This is perfect for working in remote locations, on flights, or anywhere with unreliable connectivity. 
    Your research doesn't have to stop when your WiFi does!`,
    target: '[data-tour="offline-indicator"]',
    position: 'top'
  },

  {
    id: 'accessibility',
    title: 'Accessibility First',
    description: 'Full keyboard navigation, screen reader support, and voice features make research accessible to everyone.',
    voiceScript: `Accessibility is core to our design. 
    Every interactive element has proper ARIA labels for screen readers. 
    You can navigate the entire interface using only your keyboard with Tab, Enter, and Escape keys. 
    The voice narration you're hearing right now works throughout the app. 
    Papers can be read aloud, and all graphs have text alternatives. 
    We believe cutting-edge research tools should be available to everyone, 
    regardless of ability or preferred interaction method.`,
    target: '[data-tour="accessibility-menu"]',
    position: 'left'
  },

  {
    id: 'data-sources',
    title: 'Trusted NASA Data',
    description: 'All data comes from NASA Open Science Data Repository, Space Life Sciences Library, and PubMed Central.',
    voiceScript: `Our knowledge graph is built on trusted, peer-reviewed research. 
    We source papers from NASA's Open Science Data Repository, 
    the Space Life Sciences Library, and PubMed Central. 
    All 608 publications are full-text, open-access articles focused on space biology. 
    This includes research on how microgravity, radiation, and other space conditions 
    affect humans, plants, microbes, and other organisms. 
    Every paper links back to its original source, so you can dive deeper into any topic.`,
    target: '[data-tour="footer-links"]',
    position: 'top'
  },

  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    description: 'Start exploring! Search for topics, ask the AI assistant questions, or browse the knowledge graph.',
    voiceScript: `Congratulations! You've completed the tour of Astrobiomers. 
    You now know how to search the knowledge graph, view paper details, 
    generate AI summaries, ask questions to our RAG assistant, 
    and leverage voice features for accessibility. 
    The platform works offline, uses cutting-edge AI models like SciBERT and BART, 
    and connects you with 608 NASA space biology publications. 
    Ready to discover something new? Start by searching for a topic that interests you. 
    Welcome aboard the Astrobiomers mission! 
    The future of space biology research is at your fingertips.`,
    position: 'bottom'
  }
];

/**
 * Quick tour (shorter version for returning users)
 */
export const quickTourSteps: TourStep[] = [
  {
    id: 'quick-search',
    title: 'Quick Start: Search',
    description: 'Type any space biology term to see the knowledge graph.',
    voiceScript: 'Welcome back! Type any space biology term to explore the knowledge graph.',
    target: '[data-tour="search-bar"]',
    position: 'bottom'
  },
  {
    id: 'quick-ai',
    title: 'Quick Start: AI Assistant',
    description: 'Ask questions and get answers from 608 NASA papers.',
    voiceScript: 'Ask questions about space biology and get answers grounded in research.',
    target: '[data-tour="ai-assistant"]',
    position: 'right'
  },
  {
    id: 'quick-features',
    title: 'New Features',
    description: 'Try AI summaries, voice narration, and offline mode!',
    voiceScript: 'Check out our new features: AI summaries, voice narration, and offline mode!',
    position: 'bottom'
  }
];

/**
 * Feature-specific tours
 */
export const featureTours = {
  summarization: [
    {
      id: 'summary-intro',
      title: 'AI Summarization',
      description: 'Generate concise summaries of research papers using BART or PEGASUS models.',
      voiceScript: 'Our AI summarization uses state-of-the-art transformer models to condense complex papers into digestible summaries.',
      target: '[data-tour="summary-button"]',
      position: 'top'
    }
  ],
  
  voice: [
    {
      id: 'voice-intro',
      title: 'Voice Features',
      description: 'Listen to papers read aloud with adjustable speed and pitch.',
      voiceScript: 'Text-to-speech lets you listen to papers hands-free. Perfect for multitasking or accessibility!',
      target: '[data-tour="voice-button"]',
      position: 'top'
    }
  ],
  
  offline: [
    {
      id: 'offline-intro',
      title: 'Offline Mode',
      description: 'Access cached data even without internet connection.',
      voiceScript: 'Service workers enable offline access. Your research continues even when the internet doesn\'t!',
      target: '[data-tour="offline-indicator"]',
      position: 'bottom'
    }
  ]
};
