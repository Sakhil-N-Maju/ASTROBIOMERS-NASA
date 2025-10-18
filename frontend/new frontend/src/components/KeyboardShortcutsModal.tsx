/**
 * Keyboard Shortcuts Help Modal
 * Displays all available keyboard shortcuts to users
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard, X } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ 
  open: controlledOpen, 
  onOpenChange 
}: KeyboardShortcutsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled or uncontrolled state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Listen for ? key to open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.isContentEditable;

      if (e.key === '?' && !isInput && !isOpen) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  // Detect macOS for displaying Mac keyboard symbols
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

  // Group shortcuts by category
  const groupedShortcuts = KEYBOARD_SHORTCUTS.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof KEYBOARD_SHORTCUTS>);

  return (
    <>
      {/* Floating help button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-24 right-8 z-50 bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-sm"
        onClick={() => setOpen(true)}
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-5 h-5 text-white" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent 
          className="max-w-2xl max-h-[80vh] overflow-y-auto bg-black/95 border-white/10 text-white"
          aria-describedby="keyboard-shortcuts-description"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Keyboard className="w-6 h-6 text-blue-400" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription id="keyboard-shortcuts-description" className="text-white/70">
              Navigate Astrobiomers efficiently using your keyboard
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 text-blue-400">{category}</h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <span className="text-sm text-white/90">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {(isMac && shortcut.mac ? shortcut.mac : shortcut.keys).map((key, keyIdx) => (
                          <kbd 
                            key={keyIdx}
                            className="px-2 py-1 text-xs font-mono bg-white/10 border border-white/20 rounded shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-white/80">
              <strong>Tip:</strong> Press <kbd className="px-2 py-1 text-xs bg-white/10 border border-white/20 rounded">?</kbd> at any time to show this help dialog.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full mt-4 bg-white/5 hover:bg-white/10 border-white/20 text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
