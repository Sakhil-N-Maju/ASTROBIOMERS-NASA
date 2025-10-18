import { Rocket, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import { Button } from "@/components/ui/button"; // Removed unused Button import
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: "Home", href: "/" }, // Added Home link
    { name: "Research", href: "/research" },
    { name: "Knowledge Graph", href: "/knowledge-graph" },
    { name: "AI Assistant", href: "/ai-assistant" },
  { name: "Trends", href: "/trends" },
  // { name: "Features", href: "#features" }, // removed per request
    { name: "About", href: "#about" },
  // { name: "Contact", href: "#contact" }, // removed per request
  ];

  const isActivePath = (href: string) => {
    if (href.startsWith('#')) return false;
    return location.pathname === href;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="nav-link flex items-center gap-3 group" aria-label="Astrobiomers - Biology Space Research Engine, Go to homepage">
            <img 
              src="/logo.png" 
              alt="BSRE Logo" 
              className="h-12 w-auto group-hover:scale-110 transition-transform"
            />
            <span className="text-xl font-heading font-bold text-white tracking-wide">
              ASTROBIOMERS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8" role="list">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                // Added nav-link class so global CSS can exclude underline
                className="nav-link text-sm font-medium text-foreground/80 hover:text-foreground transition-colors mt-1"
                aria-current={isActivePath(link.href) ? "page" : undefined}
                role="listitem"
              >
                {link.name}
              </Link>
            ))}
            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = query.trim();
                if (trimmed.length) {
                  navigate(`/research?q=${encodeURIComponent(trimmed)}`);
                  setIsMenuOpen(false);
                }
              }}
              className="relative"
              role="search"
              aria-label="Search research papers"
            >
              <label htmlFor="nav-search" className="sr-only">
                Search research papers
              </label>
              <Search className="w-4 h-4 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                id="nav-search"
                type="search"
                placeholder="Search research..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-48 lg:w-64 bg-muted/20 border border-border/50 focus:border-primary/60 focus:outline-none rounded-lg py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground/40 transition"
                aria-label="Search research papers by keyword or topic"
              />
            </form>
            {/* Removed Get Started button per request */}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-border animate-fade-in-up" role="list">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors px-2"
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActivePath(link.href) ? "page" : undefined}
                  role="listitem"
                >
                  {link.name}
                </Link>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = query.trim();
                  if (trimmed.length) {
                    navigate(`/research?q=${encodeURIComponent(trimmed)}`);
                    setIsMenuOpen(false);
                  }
                }}
                className="relative px-2"
                role="search"
                aria-label="Search research papers"
              >
                <label htmlFor="nav-search-mobile" className="sr-only">
                  Search research papers
                </label>
                <Search className="w-4 h-4 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id="nav-search-mobile"
                  type="search"
                  placeholder="Search research..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-muted/20 border border-border/50 focus:border-primary/60 focus:outline-none rounded-lg py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground/40 transition"
                  aria-label="Search research papers by keyword or topic"
                />
              </form>
              {/* Removed Get Started button in mobile menu */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
