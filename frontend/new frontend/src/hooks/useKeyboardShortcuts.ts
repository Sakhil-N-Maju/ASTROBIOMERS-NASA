/**
 * Global Keyboard Shortcuts Hook
 * Provides application-wide keyboard shortcuts for accessibility
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcutsOptions {
  onSearchFocus?: () => void;
  onEscape?: () => void;
  onHelp?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore shortcuts when typing in input fields
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable;

    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !isInput) {
      e.preventDefault();
      if (options.onSearchFocus) {
        options.onSearchFocus();
      } else {
        // Default: focus first search input
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]'
        );
        searchInput?.focus();
      }
    }

    // Escape: Close modals/overlays
    if (e.key === 'Escape') {
      if (options.onEscape) {
        options.onEscape();
      }
    }

    // ? : Show keyboard shortcuts help
    if (e.key === '?' && !isInput) {
      e.preventDefault();
      if (options.onHelp) {
        options.onHelp();
      } else {
        // TODO: Show keyboard shortcuts modal
        console.log('Keyboard shortcuts help - implement modal');
      }
    }

    // Alt + H: Go to homepage
    if (e.altKey && e.key === 'h') {
      e.preventDefault();
      navigate('/');
    }

    // Alt + K: Go to knowledge graph
    if (e.altKey && e.key === 'k') {
      e.preventDefault();
      navigate('/knowledge-graph');
    }

    // Alt + A: Go to AI assistant
    if (e.altKey && e.key === 'a') {
      e.preventDefault();
      navigate('/ai-assistant');
    }

    // Alt + R: Go to research
    if (e.altKey && e.key === 'r') {
      e.preventDefault();
      navigate('/research');
    }

  }, [navigate, options]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    // Return any methods if needed
  };
}

/**
 * List of all keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = [
  {
    keys: ['Ctrl', 'K'],
    mac: ['⌘', 'K'],
    description: 'Focus search input',
    category: 'Navigation'
  },
  {
    keys: ['Esc'],
    description: 'Close modal or dialog',
    category: 'Navigation'
  },
  {
    keys: ['?'],
    description: 'Show keyboard shortcuts help',
    category: 'Help'
  },
  {
    keys: ['Alt', 'H'],
    mac: ['⌥', 'H'],
    description: 'Go to homepage',
    category: 'Navigation'
  },
  {
    keys: ['Alt', 'K'],
    mac: ['⌥', 'K'],
    description: 'Go to knowledge graph',
    category: 'Navigation'
  },
  {
    keys: ['Alt', 'A'],
    mac: ['⌥', 'A'],
    description: 'Go to AI assistant',
    category: 'Navigation'
  },
  {
    keys: ['Alt', 'R'],
    mac: ['⌥', 'R'],
    description: 'Go to research page',
    category: 'Navigation'
  },
  {
    keys: ['Tab'],
    description: 'Navigate to next element',
    category: 'Navigation'
  },
  {
    keys: ['Shift', 'Tab'],
    description: 'Navigate to previous element',
    category: 'Navigation'
  },
  {
    keys: ['Enter'],
    description: 'Activate button or link',
    category: 'Action'
  },
  {
    keys: ['Space'],
    description: 'Activate button',
    category: 'Action'
  }
];
