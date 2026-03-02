'use client';

import { useGameStore } from '@/lib/store';

export default function FearEffects() {
  const fearLevel = useGameStore((state) => state.fearLevel);
  
  const grainOpacity = fearLevel > 30 ? Math.min(0.15, (fearLevel - 30) / 400) : 0;
  const vignetteIntensity = Math.min(0.7, fearLevel / 150);
  const vignetteColor = fearLevel > 70 ? 'rgba(80, 0, 0,' : 'rgba(0, 0, 0,';

  return (
    <>
      {/* Vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none z-10 transition-all duration-1000 ease-in-out"
        style={{
          background: `radial-gradient(circle, transparent 20%, ${vignetteColor}${vignetteIntensity}) 100%)`,
          boxShadow: fearLevel > 80
            ? 'inset 0 0 150px rgba(120, 0, 0, 0.6)'
            : 'inset 0 0 100px rgba(0, 0, 0, 0.4)',
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
      <div
        className="fixed inset-0 pointer-events-none z-[15] transition-opacity duration-1000 ease-in-out"
        style={{
          background: 'rgba(80, 0, 0, 0.25)',
          opacity: fearLevel > 70 ? (fearLevel - 70) / 60 : 0,
        }}
      />
    </>
  );
}
