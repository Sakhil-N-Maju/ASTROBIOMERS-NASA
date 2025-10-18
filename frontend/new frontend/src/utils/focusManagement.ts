/**
 * Focus Management Utilities
 * Helpers for managing keyboard focus in accessible applications
 */

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors)
  );

  // Filter out hidden elements
  return elements.filter(el => {
    return el.offsetWidth > 0 && 
           el.offsetHeight > 0 && 
           window.getComputedStyle(el).visibility !== 'hidden';
  });
}

/**
 * Trap focus within a container (for modals)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    // Shift + Tab: Move to previous element
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    }
    // Tab: Move to next element
    else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Restore focus to a previously focused element
 */
let previouslyFocusedElement: HTMLElement | null = null;

export function saveFocus(): void {
  previouslyFocusedElement = document.activeElement as HTMLElement;
}

export function restoreFocus(): void {
  if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
    previouslyFocusedElement.focus();
    previouslyFocusedElement = null;
  }
}

/**
 * Focus the first element in a container
 */
export function focusFirstElement(container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);
  focusableElements[0]?.focus();
}

/**
 * Focus the last element in a container
 */
export function focusLastElement(container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);
  const lastElement = focusableElements[focusableElements.length - 1];
  lastElement?.focus();
}

/**
 * Check if an element is focused
 */
export function isFocused(element: HTMLElement): boolean {
  return document.activeElement === element;
}

/**
 * Move focus to next/previous element
 */
export function moveFocus(direction: 'next' | 'previous', container?: HTMLElement): void {
  const root = container || document.body;
  const focusableElements = getFocusableElements(root);
  const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

  if (currentIndex === -1) {
    focusableElements[0]?.focus();
    return;
  }

  const nextIndex = direction === 'next' 
    ? (currentIndex + 1) % focusableElements.length
    : (currentIndex - 1 + focusableElements.length) % focusableElements.length;

  focusableElements[nextIndex]?.focus();
}

/**
 * Create a focus trap for a modal/dialog
 */
export class FocusTrap {
  private container: HTMLElement;
  private cleanup: (() => void) | null = null;
  private previousFocus: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  activate(): void {
    // Save current focus
    this.previousFocus = document.activeElement as HTMLElement;

    // Trap focus
    this.cleanup = trapFocus(this.container);
  }

  deactivate(): void {
    // Remove focus trap
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }

    // Restore previous focus
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
  }
}
