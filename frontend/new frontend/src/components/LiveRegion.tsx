/**
 * Live Region Component
 * Announces dynamic content to screen readers
 */

import { useEffect, useState } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  clearAfter?: number; // Clear message after X milliseconds
  atomic?: boolean;
}

export function LiveRegion({ 
  message, 
  politeness = 'polite',
  clearAfter,
  atomic = true 
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);

    if (clearAfter && message) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
}

/**
 * Status Message Component
 * For status updates (loading, success, error)
 */
export function StatusMessage({ 
  type, 
  message 
}: { 
  type: 'loading' | 'success' | 'error' | 'info'; 
  message: string 
}) {
  const politeness = type === 'error' ? 'assertive' : 'polite';

  return (
    <LiveRegion 
      message={message} 
      politeness={politeness}
      clearAfter={5000}
    />
  );
}

/**
 * Alert Component
 * For important announcements
 */
export function AlertMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="sr-only"
    >
      {message}
    </div>
  );
}
