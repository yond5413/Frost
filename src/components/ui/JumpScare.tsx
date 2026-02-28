'use client';
import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';

export default function JumpScare() {
  const { jumpScareActive, clearJumpScare } = useGameStore();

  useEffect(() => {
    if (jumpScareActive) {
      const timer = setTimeout(clearJumpScare, 800);
      return () => clearTimeout(timer);
    }
  }, [jumpScareActive, clearJumpScare]);

  if (!jumpScareActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-red-950/90 flex items-center justify-center animate-pulse">
      <div className="text-white text-9xl font-black tracking-widest opacity-80">!</div>
    </div>
  );
}
