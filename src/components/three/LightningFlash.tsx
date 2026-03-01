'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/lib/store';

export default function LightningFlash() {
  const lightRef = useRef<THREE.PointLight>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const flashIntensityRef = useRef(0);
  const nextFlashTimeRef = useRef(0);
  const fearLevel = useGameStore((state) => state.fearLevel);
  
  useEffect(() => {
    const baseInterval = 8000;
    const fearMultiplier = Math.max(0.3, 1 - (fearLevel / 150));
    nextFlashTimeRef.current = Date.now() + baseInterval * fearMultiplier * (0.5 + Math.random());
    
    const interval = setInterval(() => {
      if (Date.now() > nextFlashTimeRef.current) {
        setIsFlashing(true);
        flashIntensityRef.current = 2 + Math.random() * 2;
        
        setTimeout(() => {
          setIsFlashing(false);
        }, 100 + Math.random() * 100);
        
        const baseInterval = 8000;
        const fearMultiplier = Math.max(0.3, 1 - (fearLevel / 150));
        nextFlashTimeRef.current = Date.now() + baseInterval * fearMultiplier * (0.5 + Math.random());
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [fearLevel]);
  
  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.intensity = isFlashing ? flashIntensityRef.current : 0;
    }
  });
  
  return (
    <pointLight
      ref={lightRef}
      position={[0, 20, 0]}
      color="#ffffff"
      intensity={0}
      distance={100}
      decay={1}
    />
  );
}

export function LightningFlashEffect() {
  const { currentScene } = useGameStore();
  const [flash, setFlash] = useState(0);
  
  useEffect(() => {
    const triggerFlash = () => {
      setFlash(1);
      setTimeout(() => setFlash(0.5), 50);
      setTimeout(() => setFlash(1), 100);
      setTimeout(() => setFlash(0), 200);
    };
    
    const baseInterval = 8000 + Math.random() * 5000;
    const interval = setInterval(triggerFlash, baseInterval);
    
    triggerFlash();
    
    return () => clearInterval(interval);
  }, [currentScene]);
  
  if (flash <= 0) return null;
  
  return (
    <div
      className="fixed inset-0 pointer-events-none z-20"
      style={{
        backgroundColor: `rgba(255, 255, 255, ${flash * 0.3})`,
        transition: 'background-color 0.05s ease-out',
      }}
    />
  );
}
