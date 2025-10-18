/**
 * Guided Tour Component
 * Provides an interactive walkthrough of Astrobiomers features with pointer tooltips
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Volume2, VolumeX, ChevronRight, ChevronLeft, Play, Pause } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  voiceScript: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface GuidedTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

export function GuidedTour({ steps, onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isOpen, setIsOpen] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [hasChosenVoice, setHasChosenVoice] = useState(false);
  const [tts, ttsControls] = useTextToSpeech();
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = currentStep >= 0 ? steps[currentStep] : null;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const isWelcomeScreen = currentStep === -1;

  const calculatePosition = useCallback((targetSelector: string, preferredPosition?: string) => {
    const targetElement = document.querySelector(targetSelector) as HTMLElement;
    if (!targetElement || !tooltipRef.current) return null;

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 20;
    const arrowSize = 12;

    let top = 0;
    let left = 0;
    let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
    const position = preferredPosition || 'bottom';

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - arrowSize - padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        arrowPosition = 'bottom';
        break;
      case 'bottom':
        top = targetRect.bottom + arrowSize + padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        arrowPosition = 'top';
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left - tooltipRect.width - arrowSize - padding;
        arrowPosition = 'right';
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + arrowSize + padding;
        arrowPosition = 'left';
        break;
    }

    const maxLeft = window.innerWidth - tooltipRect.width - padding;
    const maxTop = window.innerHeight - tooltipRect.height - padding;
    left = Math.max(padding, Math.min(left, maxLeft));
    top = Math.max(padding, Math.min(top, maxTop));

    return { top, left, arrowPosition };
  }, []);

  useEffect(() => {
    if (step?.target && !isWelcomeScreen) {
      setTimeout(() => {
        const position = calculatePosition(step.target!, step.position);
        setTooltipPosition(position);
      }, 100);
    } else {
      setTooltipPosition(null);
    }
  }, [currentStep, step, isWelcomeScreen, calculatePosition]);

  const speakStep = useCallback(() => {
    if (voiceEnabled && step && hasChosenVoice) {
      try {
        ttsControls.speak(step.voiceScript, { rate: 0.9, pitch: 1.0, volume: 1.0 });
      } catch (error) {
        console.warn('[Tour] Speech synthesis not ready:', error);
      }
    }
  }, [voiceEnabled, step, hasChosenVoice, ttsControls]);

  useEffect(() => {
    if (currentStep >= 0 && voiceEnabled && hasChosenVoice) {
      const timer = setTimeout(() => speakStep(), 300);
      return () => clearTimeout(timer);
    }
    if (step?.target) {
      const element = document.querySelector(step.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tour-highlight');
      }
    }
    return () => {
      if (step?.target) {
        const element = document.querySelector(step.target);
        if (element) element.classList.remove('tour-highlight');
      }
      ttsControls.stop();
    };
  }, [currentStep, step, voiceEnabled, hasChosenVoice, speakStep, ttsControls]);

  const nextStep = () => {
    if (isLastStep) {
      ttsControls.stop();
      setIsOpen(false);
      onComplete?.();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (!isFirstStep && !isWelcomeScreen) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    ttsControls.stop();
    setIsOpen(false);
    onSkip?.();
  };

  const toggleVoice = () => {
    if (voiceEnabled) ttsControls.stop();
    else if (hasChosenVoice) speakStep();
    setVoiceEnabled(!voiceEnabled);
  };

  const togglePause = () => {
    if (tts.paused) ttsControls.resume();
    else ttsControls.pause();
  };

  const startTourWithVoice = (enableVoice: boolean) => {
    setVoiceEnabled(enableVoice);
    setHasChosenVoice(true);
    setCurrentStep(0);
  };

  const getArrowStyles = () => {
    if (!tooltipPosition) return {};
    const styles: Record<string, any> = { position: 'absolute', width: '0', height: '0', borderStyle: 'solid' };
    switch (tooltipPosition.arrowPosition) {
      case 'top':
        Object.assign(styles, { bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '0 12px 12px 12px', borderColor: 'transparent transparent rgb(88 28 135) transparent' });
        break;
      case 'bottom':
        Object.assign(styles, { top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '12px 12px 0 12px', borderColor: 'rgb(88 28 135) transparent transparent transparent' });
        break;
      case 'left':
        Object.assign(styles, { right: '100%', top: '50%', transform: 'translateY(-50%)', borderWidth: '12px 12px 12px 0', borderColor: 'transparent rgb(88 28 135) transparent transparent' });
        break;
      case 'right':
        Object.assign(styles, { left: '100%', top: '50%', transform: 'translateY(-50%)', borderWidth: '12px 0 12px 12px', borderColor: 'transparent transparent transparent rgb(88 28 135)' });
        break;
    }
    return styles;
  };

  if (!isOpen) return null;
  if (isWelcomeScreen) return null;

  return <>Tour Component</>;
}

export function useTour() {
  const [showTour, setShowTour] = useState(false);
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    const tourCompleted = localStorage.getItem('tour-completed');
    setCompleted(tourCompleted === 'true');
  }, []);
  return {
    showTour,
    completed,
    startTour: () => setShowTour(true),
    endTour: () => {
      setShowTour(false);
      setCompleted(true);
      localStorage.setItem('tour-completed', 'true');
    },
    resetTour: () => {
      setCompleted(false);
      localStorage.removeItem('tour-completed');
      setShowTour(true);
    }
  };
}
