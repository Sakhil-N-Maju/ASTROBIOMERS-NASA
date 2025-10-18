import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Research from "./pages/Research";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import AIAssistant from "./pages/AIAssistant";
import Trends from "./pages/Trends";
// import Features from "./pages/Features"; // Features page removed from navigation per request
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navigation from "@/components/Navigation";
import NotFound from "./pages/NotFound";
import { GuidedTour } from "@/components/GuidedTour";
import { tourSteps } from "@/data/tourScript";
import { registerServiceWorker } from "@/utils/serviceWorker";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";

const queryClient = new QueryClient();

// Inner component that uses Router-dependent hooks
const AppContent = () => {
  const [showTour, setShowTour] = useState(false);

  // Enable keyboard shortcuts (now inside Router context)
  useKeyboardShortcuts({
    onEscape: () => {
      setShowTour(false);
    },
  });

  // Check if user wants to see tour on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('astrobiomers_tour_completed');
    const urlParams = new URLSearchParams(window.location.search);
    const tourParam = urlParams.get('tour');
    
    // Show tour if: 1) Never seen before, 2) URL param ?tour=true
    if (!hasSeenTour || tourParam === 'true') {
      setShowTour(true);
    }
  }, []);

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/research" element={<Research />} />
        <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/trends" element={<Trends />} />
  {/* <Route path="/features" element={<Features />} /> */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsModal />
      
      {/* Guided Tour Overlay */}
      {showTour && (
        <GuidedTour
          steps={tourSteps}
          onComplete={() => {
            setShowTour(false);
            localStorage.setItem('astrobiomers_tour_completed', 'true');
          }}
          autoStart={true}
        />
      )}
    </>
  );
};

const App = () => {
  // Register service worker on mount (production only)
  useEffect(() => {
    // Only register in production
    if (import.meta.env.PROD) {
      registerServiceWorker();
    } else {
      console.log('[App] Service Worker disabled in development mode');
      // Unregister any existing service workers in development
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
            console.log('[App] Unregistered existing service worker');
          });
        });
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Skip link removed per request */}
        
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
