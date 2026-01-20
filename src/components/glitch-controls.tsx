'use client';

import { Button } from './ui/button';
import { RotateCcw } from 'lucide-react';
import { RotaryKnob } from './ui/rotary-knob';

export type EffectState = {
  rgbSplit: number;
  scanLines: number;
  vhsDistortion: number;
  chromaticAberration: number;
  digitalCorruption: number;
  colorShift: number;
  glitchBars: number;
  bitCrush: number;
};

export type GlitchControlsProps = {
  effectStates: EffectState;
  onEffectChange: (effectId: string, value: number) => void;
  onReset: () => void;
};

const effects = [
  { id: 'rgbSplit', label: 'RGB Split', icon: '🔴🟢🔵' },
  { id: 'scanLines', label: 'Scan Lines', icon: '📺' },
  { id: 'vhsDistortion', label: 'VHS Distortion', icon: '📼' },
  { id: 'chromaticAberration', label: 'Chromatic', icon: '🌈' },
  { id: 'digitalCorruption', label: 'Corruption', icon: '💾' },
  { id: 'colorShift', label: 'Color Shift', icon: '🎨' },
  { id: 'glitchBars', label: 'Glitch Bars', icon: '⚡' },
  { id: 'bitCrush', label: 'Bit Crush', icon: '🔨' },
];

export function GlitchControls({ effectStates, onEffectChange, onReset }: GlitchControlsProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Effects</h2>
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="border-white/30 hover:bg-white/10 bg-white/5"
        >
          <RotateCcw className="w-4 h-4 mr-2 text-white" />
          <span className="font-bold text-white">Reset All</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {effects.map((effect) => (
          <div key={effect.id} className="flex flex-col items-center space-y-3">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-white">
                <span className="text-xl">{effect.icon}</span>
                <label className="text-sm font-bold">{effect.label}</label>
              </div>
              <div className="text-lg font-mono text-blue-100 bg-white/10 px-3 py-1 rounded">
                {effectStates[effect.id as keyof EffectState]}
              </div>
            </div>
            
            <RotaryKnob
              value={effectStates[effect.id as keyof EffectState]}
              onChange={(value: number) => onEffectChange(effect.id, value)}
              max={100}
              size={90}
              className="touch-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-white/20">
        <p className="text-xs text-blue-100/60 text-center">
          Rotate the knobs to create your perfect glitch art ⚡
        </p>
      </div>
    </div>
  );
}
