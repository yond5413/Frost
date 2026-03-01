'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';

export default function FearEffects() {
  const fearLevel = useGameStore((state) => state.fearLevel);
  const [grainOpacity, setGrainOpacity] = useState(0);
  
  useEffect(() => {
    if (fearLevel > 30) {
      setGrainOpacity(Math.min(0.15, (fearLevel - 30) / 400));
    } else {
      setGrainOpacity(0);
    }
  }, [fearLevel]);
  
  const vignetteIntensity = Math.min(0.7, fearLevel / 150);
  const vignetteColor = fearLevel > 70 ? 'rgba(80, 0, 0,' : 'rgba(0, 0, 0,';
  
  return (
    <>
      {/* Vignette effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: `${vignetteColor} ${vignetteIntensity})`,
          boxShadow: fearLevel > 80 
            ? 'inset 0 0 100px rgba(100, 0, 0, 0.5)' 
            : 'none',
          transition: 'all 0.5s ease-out',
        }}
      />
      
      {/* Screen grain */}
      {grainOpacity > 0 && (
        <div
          className="fixed inset-0 pointer-events-none z-[5] animate-grain"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: grainOpacity,
          }}
        />
      )}

      {/* Red tint at high fear */}
      {fearLevel > 70 && (
        <div
          className="fixed inset-0 pointer-events-none z-[15]"
          style={{
            background: `radial-gradient(circle, transparent 30%, rgba(60, 0, 0, ${(fearLevel - 70) / 100}) 100%)`,
            transition: 'opacity 0.3s ease-out',
          }}
        />
      )}
    </>
  );
}
