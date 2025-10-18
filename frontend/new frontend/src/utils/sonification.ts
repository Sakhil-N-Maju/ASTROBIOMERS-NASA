/**
 * Sonification Utilities
 * Converts data to audio for accessibility and alternative data representation
 * 
 * Uses Web Audio API for sound generation
 */

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a single tone
 */
export function playTone(
  frequency: number,
  duration: number = 200,
  volume: number = 0.3,
  waveform: OscillatorType = 'sine'
): void {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = waveform;

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration / 1000);
}

/**
 * Map a value to a frequency range
 */
export function mapToFrequency(
  value: number,
  min: number,
  max: number,
  minFreq: number = 200,
  maxFreq: number = 800
): number {
  const normalized = (value - min) / (max - min);
  return minFreq + normalized * (maxFreq - minFreq);
}

/**
 * Play a sequence of tones from data
 */
export async function playDataSequence(
  data: number[],
  options: {
    minFreq?: number;
    maxFreq?: number;
    duration?: number;
    gap?: number;
    volume?: number;
    waveform?: OscillatorType;
  } = {}
): Promise<void> {
  const {
    minFreq = 200,
    maxFreq = 800,
    duration = 150,
    gap = 50,
    volume = 0.3,
    waveform = 'sine'
  } = options;

  const min = Math.min(...data);
  const max = Math.max(...data);

  for (const value of data) {
    const freq = mapToFrequency(value, min, max, minFreq, maxFreq);
    playTone(freq, duration, volume, waveform);
    await sleep(duration + gap);
  }
}

/**
 * Sonify graph statistics
 */
export async function sonifyGraphStats(stats: {
  papers: number;
  entities: number;
  relationships: number;
}): Promise<void> {
  // Announce with speech
  const text = `Knowledge graph contains ${stats.papers} papers, ${stats.entities} entities, and ${stats.relationships} relationships.`;
  
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    speechSynthesis.speak(utterance);
  }

  // Play tones representing the data
  await sleep(2000); // Wait for speech

  // Papers: Low tone
  for (let i = 0; i < 3; i++) {
    playTone(200 + stats.papers, 200, 0.3);
    await sleep(250);
  }

  await sleep(500);

  // Entities: Mid tone
  for (let i = 0; i < 3; i++) {
    playTone(400 + stats.entities, 200, 0.3);
    await sleep(250);
  }

  await sleep(500);

  // Relationships: High tone
  for (let i = 0; i < 3; i++) {
    playTone(600 + stats.relationships, 200, 0.3);
    await sleep(250);
  }
}

/**
 * Sonify node degrees (connections)
 */
export async function sonifyNodeConnections(
  nodes: Array<{ id: string; connections: number }>
): Promise<void> {
  const sortedNodes = [...nodes].sort((a, b) => a.connections - b.connections);
  const topNodes = sortedNodes.slice(-10); // Top 10 most connected

  for (const node of topNodes) {
    const freq = mapToFrequency(node.connections, 0, 50, 300, 900);
    playTone(freq, 300, 0.3, 'triangle');
    await sleep(400);
  }
}

/**
 * Play success sound
 */
export function playSuccess(): void {
  const ctx = getAudioContext();
  
  // Major chord: C, E, G
  const notes = [261.63, 329.63, 392.00];
  
  notes.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    const startTime = ctx.currentTime + index * 0.1;
    gainNode.gain.setValueAtTime(0.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.5);
  });
}

/**
 * Play error sound
 */
export function playError(): void {
  const ctx = getAudioContext();
  
  // Descending dissonant tones
  const frequencies = [400, 350, 300];
  
  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sawtooth';
    
    const startTime = ctx.currentTime + index * 0.15;
    gainNode.gain.setValueAtTime(0.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.3);
  });
}

/**
 * Play notification sound
 */
export function playNotification(): void {
  playTone(800, 100, 0.2, 'sine');
  setTimeout(() => playTone(1000, 100, 0.2, 'sine'), 150);
}

/**
 * Play click sound
 */
export function playClick(): void {
  playTone(600, 50, 0.1, 'sine');
}

/**
 * Play hover sound
 */
export function playHover(): void {
  playTone(400, 30, 0.05, 'sine');
}

/**
 * Sonify data trends (increasing/decreasing)
 */
export async function sonifyTrend(
  data: number[],
  label: string
): Promise<void> {
  // Announce trend
  const trend = data[data.length - 1] > data[0] ? 'increasing' : 'decreasing';
  const text = `${label} is ${trend}.`;
  
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
    await sleep(1500);
  }

  // Play trend as ascending/descending tones
  await playDataSequence(data, {
    minFreq: 300,
    maxFreq: 700,
    duration: 100,
    gap: 50,
    waveform: 'triangle'
  });
}

/**
 * Create an audio representation of a bar chart
 */
export async function sonifyBarChart(
  data: Array<{ label: string; value: number }>
): Promise<void> {
  // Announce the chart
  const text = `Bar chart with ${data.length} items. From ${data[0].label} to ${data[data.length - 1].label}.`;
  
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
    await sleep(2000);
  }

  // Play each bar as a tone
  const values = data.map(d => d.value);
  await playDataSequence(values, {
    duration: 200,
    gap: 100,
    waveform: 'square'
  });
}

/**
 * Create spatial audio for graph nodes
 */
export function playSpatialTone(
  x: number,
  y: number,
  frequency: number = 440,
  duration: number = 200
): void {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const panner = ctx.createStereoPanner();

  oscillator.connect(gainNode);
  gainNode.connect(panner);
  panner.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  // Pan based on x position (-1 to 1)
  panner.pan.value = Math.max(-1, Math.min(1, x));

  // Volume based on y position
  const volume = Math.max(0.1, Math.min(0.5, 1 - Math.abs(y)));
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration / 1000);
}

// Utility function
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if Web Audio API is supported
 */
export function isAudioSupported(): boolean {
  return 'AudioContext' in window || 'webkitAudioContext' in window;
}

/**
 * Resume audio context (required after user interaction in some browsers)
 */
export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}
