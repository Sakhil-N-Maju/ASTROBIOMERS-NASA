/**
 * Audio Chart Component
 * Provides audio alternative to visual charts for accessibility
 */

import { useState, useEffect } from 'react';
import { Volume2, VolumeX, BarChart3, Loader2 } from 'lucide-react';
import {
  sonifyBarChart,
  sonifyTrend,
  sonifyGraphStats,
  playNotification,
  isAudioSupported,
  resumeAudioContext
} from '@/utils/sonification';

interface AudioChartProps {
  data: any;
  type: 'bar' | 'line' | 'stats';
  label?: string;
  autoPlay?: boolean;
}

export function AudioChart({ 
  data, 
  type, 
  label = 'Data', 
  autoPlay = false 
}: AudioChartProps) {
  const [playing, setPlaying] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(isAudioSupported());
  }, []);

  useEffect(() => {
    if (autoPlay && enabled && supported) {
      handlePlay();
    }
  }, [autoPlay, enabled, supported]);

  const handlePlay = async () => {
    if (!supported || !enabled) return;

    setPlaying(true);
    
    try {
      // Resume audio context (required after user interaction)
      await resumeAudioContext();

      // Play appropriate sonification based on type
      switch (type) {
        case 'bar':
          await sonifyBarChart(data);
          break;
        case 'line':
          await sonifyTrend(data, label);
          break;
        case 'stats':
          await sonifyGraphStats(data);
          break;
      }

      playNotification(); // Success sound
    } catch (error) {
      console.error('Sonification error:', error);
    } finally {
      setPlaying(false);
    }
  };

  const toggleEnabled = () => {
    setEnabled(!enabled);
  };

  if (!supported) {
    return (
      <div className="text-sm text-gray-500">
        Audio not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleEnabled}
        className={`p-2 rounded transition ${
          enabled
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
        }`}
        aria-label={enabled ? 'Disable audio' : 'Enable audio'}
        title={enabled ? 'Audio enabled' : 'Audio disabled'}
      >
        {enabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </button>

      <button
        onClick={handlePlay}
        disabled={!enabled || playing}
        className={`flex items-center gap-2 px-3 py-2 rounded transition ${
          enabled && !playing
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
        aria-label="Play audio representation"
      >
        {playing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Playing...</span>
          </>
        ) : (
          <>
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">Listen to Data</span>
          </>
        )}
      </button>
    </div>
  );
}

/**
 * Stats Audio Component - for knowledge graph statistics
 */
interface StatsAudioProps {
  papers: number;
  entities: number;
  relationships: number;
  autoPlay?: boolean;
}

export function StatsAudio({ papers, entities, relationships, autoPlay }: StatsAudioProps) {
  return (
    <AudioChart
      data={{ papers, entities, relationships }}
      type="stats"
      label="Knowledge Graph Statistics"
      autoPlay={autoPlay}
    />
  );
}

/**
 * Trend Audio Component - for time series data
 */
interface TrendAudioProps {
  data: number[];
  label: string;
  autoPlay?: boolean;
}

export function TrendAudio({ data, label, autoPlay }: TrendAudioProps) {
  return (
    <AudioChart
      data={data}
      type="line"
      label={label}
      autoPlay={autoPlay}
    />
  );
}

/**
 * Bar Chart Audio Component
 */
interface BarChartAudioProps {
  data: Array<{ label: string; value: number }>;
  autoPlay?: boolean;
}

export function BarChartAudio({ data, autoPlay }: BarChartAudioProps) {
  return (
    <AudioChart
      data={data}
      type="bar"
      label="Bar Chart"
      autoPlay={autoPlay}
    />
  );
}
