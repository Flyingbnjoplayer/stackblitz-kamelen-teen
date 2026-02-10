//stackblitz-kamelen-teen/src/components/ui/rotary-knob.tsx
'use client';

import {
  useRef,
  useState,
  useEffect,
  type MouseEvent,
  type TouchEvent,
} from 'react';
import { cn } from '@/lib/utils';

export type RotaryKnobProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: number;
  className?: string;
};

export function RotaryKnob({
  value,
  onChange,
  min = 0,
  max = 100,
  size = 80,
  className,
}: RotaryKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  // interne flags in ref voor events
  const isDraggingRef = useRef(false);
  const dragStateRef = useRef({ startY: 0, startValue: 0 });

  // states die we wél in render mogen gebruiken
  const [currentValue, setCurrentValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  // Sync internal value with prop
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Sensitivity: how many pixels to drag for full range (0-100)
  const sensitivity = 150;

  // Event handlers in ref (voorkomt stale closures)
  const handlersRef = useRef({
    handleMouseMove: (e: globalThis.MouseEvent): void => {
      if (!isDraggingRef.current) return;
      e.preventDefault();

      const deltaY = dragStateRef.current.startY - e.clientY;
      const valueChange = (deltaY / sensitivity) * (max - min);
      let newValue = Math.round(dragStateRef.current.startValue + valueChange);
      newValue = Math.max(min, Math.min(max, newValue));

      setCurrentValue(newValue);
      onChange(newValue);
    },
    handleMouseUp: (): void => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handlersRef.current.handleMouseMove);
      window.removeEventListener('mouseup', handlersRef.current.handleMouseUp);
    },
    handleTouchMove: (e: globalThis.TouchEvent): void => {
      if (!isDraggingRef.current) return;
      // Alleen tijdens drag: preventDefault zodat scrollen buiten drag kan
      e.preventDefault();

      const touch = e.touches[0];
      if (touch) {
        const deltaY = dragStateRef.current.startY - touch.clientY;
        const valueChange = (deltaY / sensitivity) * (max - min);
        let newValue = Math.round(dragStateRef.current.startValue + valueChange);
        newValue = Math.max(min, Math.min(max, newValue));

        setCurrentValue(newValue);
        onChange(newValue);
      }
    },
    handleTouchEnd: (): void => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      window.removeEventListener('touchmove', handlersRef.current.handleTouchMove);
      window.removeEventListener('touchend', handlersRef.current.handleTouchEnd);
    },
  });

  // Mouse start
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    dragStateRef.current = {
      startY: e.clientY,
      startValue: currentValue,
    };
    isDraggingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'ns-resize';
    window.addEventListener('mousemove', handlersRef.current.handleMouseMove);
    window.addEventListener('mouseup', handlersRef.current.handleMouseUp);
  };

  // Touch start
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      dragStateRef.current = {
        startY: touch.clientY,
        startValue: currentValue,
      };
      isDraggingRef.current = true;
      setIsDragging(true);
      window.addEventListener('touchmove', handlersRef.current.handleTouchMove, {
        passive: false,
      });
      window.addEventListener('touchend', handlersRef.current.handleTouchEnd);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handlersRef.current.handleMouseMove);
      window.removeEventListener('mouseup', handlersRef.current.handleMouseUp);
      window.removeEventListener('touchmove', handlersRef.current.handleTouchMove);
      window.removeEventListener('touchend', handlersRef.current.handleTouchEnd);
    };
  }, []);

  // Calculate rotation angle (0-270 degrees range)
  const rotation = (currentValue / max) * 270 - 135;

  // styles afgeleid uit state (niet direct uit ref)
  const ringShadow = isDragging
    ? '0 0 20px rgba(59, 130, 246, 0.5), inset 0 2px 4px rgba(0,0,0,0.2)'
    : '0 4px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)';

  const rotationTransition = isDragging ? '0ms' : '100ms';

  return (
    <div
      ref={knobRef}
      className={cn(
        'relative flex items-center justify-center cursor-ns-resize select-none',
        className,
      )}
      style={{ width: size, height: size }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/30 shadow-lg"
        style={{ boxShadow: ringShadow }}
      />
      {/* Inner circle with gradient */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/40 to-blue-700/60 backdrop-blur-sm" />
      {/* Tick marks */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {Array.from({ length: 11 }).map((_, i) => {
          const angle = -135 + i * 27;
          const isActive = i * 10 <= currentValue;
          const x1 = 50 + 38 * Math.cos((angle * Math.PI) / 180);
          const y1 = 50 + 38 * Math.sin((angle * Math.PI) / 180);
          const x2 = 50 + 42 * Math.cos((angle * Math.PI) / 180);
          const y2 = 50 + 42 * Math.sin((angle * Math.PI) / 180);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? '#60a5fa' : '#ffffff40'}
              strokeWidth={isActive ? '2' : '1'}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      {/* Rotating indicator */}
      <div
        className="absolute w-full h-full transition-transform"
        style={{
          transform: `rotate(${rotation}deg)`,
          transitionDuration: rotationTransition,
        }}
      >
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-1 h-[30%] bg-white rounded-full shadow-lg" />
        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-lg" />
      </div>
      {/* Center dot */}
      <div className="absolute w-3 h-3 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full border border-white/50 shadow-inner" />
    </div>
  );
}