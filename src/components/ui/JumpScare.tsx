'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/lib/store';
import { useThree } from '@react-three/fiber';

export default function JumpScare() {
  const { jumpScareActive, clearJumpScare } = useGameStore();
  const [flashState, setFlashState] = useState<'none' | 'flash' | 'fade'>('none');
  const [vignetteOpacity, setVignetteOpacity] = useState(0);
  const [screenShake, setScreenShake] = useState(0);
  
  useEffect(() => {
    if (jumpScareActive) {
      // Phase 1: White flash
      setFlashState('flash');
      setVignetteOpacity(0);
      setScreenShake(20);
      
      // Phase 2: Fade to red
      setTimeout(() => {
        setFlashState('fade');
        setVignetteOpacity(0.9);
        setScreenShake(15);
      }, 150);
      
      // Phase 3: Peak scare
      setTimeout(() => {
        setVignetteOpacity(1);
        setScreenShake(25);
      }, 300);
      
      // Phase 4: Begin fade
      setTimeout(() => {
        setVignetteOpacity(0.7);
        setScreenShake(10);
      }, 500);
      
      // Clear
      setTimeout(() => {
        setFlashState('none');
        setVignetteOpacity(0);
        setScreenShake(0);
        clearJumpScare();
      }, 1000);
    }
  }, [jumpScareActive, clearJumpScare]);
  
  if (!jumpScareActive && flashState === 'none') return null;
  
  return (
    <>
      {/* White flash overlay */}
      {flashState === 'flash' && (
        <div 
          className="fixed inset-0 z-50 bg-white animate-pulse"
          style={{ animationDuration: '150ms' }}
        />
      )}
      
      {flashState === 'fade' && (
        <div 
          className="fixed inset-0 z-50 bg-red-900"
          style={{ opacity: 0.8 }}
        />
      )}
      
      {/* Red vignette */}
      <div 
        className="fixed inset-0 z-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle, transparent 20%, rgba(139, 0, 0, ${vignetteOpacity}) 70%, rgba(50, 0, 0, ${vignetteOpacity}) 100%)`,
          transition: 'opacity 0.1s ease-out',
        }}
      />
      
      {/* Screen shake container */}
      <div
        className="fixed inset-0 z-30 pointer-events-none"
        style={{
          transform: screenShake > 0 ? `translate(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px)` : 'none',
          transition: 'transform 0.05s ease-out',
        }}
      >
        {/* Scary text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="text-red-700 font-black tracking-widest animate-pulse"
            style={{
              fontSize: '12rem',
              textShadow: '0 0 50px rgba(139, 0, 0, 0.8), 0 0 100px rgba(139, 0, 0, 0.6)',
              opacity: vignetteOpacity > 0.5 ? 0.9 : 0,
              transition: 'opacity 0.15s ease-out',
            }}
          >
            !
          </div>
        </div>
      </div>
    </>
  );
}

export function JumpScareCameraEffect() {
  const { jumpScareActive } = useGameStore();
  const { camera } = useThree();
  const originalFov = useRef(60);
  const animationRef = useRef<number | null>(null);
  const cameraRef = useRef(camera);
  
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);
  
  useEffect(() => {
    if (jumpScareActive && 'fov' in cameraRef.current) {
      const perspCamera = cameraRef.current as THREE.PerspectiveCamera;
      originalFov.current = perspCamera.fov;
      
      // FOV warp sequence
      const warpSequence = () => {
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          
          if (elapsed < 150) {
            // Widen rapidly
            perspCamera.fov = originalFov.current + (elapsed / 150) * 30;
          } else if (elapsed < 400) {
            // Narrow back down
            const progress = (elapsed - 150) / 250;
            perspCamera.fov = originalFov.current + 30 - progress * 35;
          } else if (elapsed < 700) {
            // Slight wobble
            const progress = (elapsed - 400) / 300;
            perspCamera.fov = originalFov.current - 5 + Math.sin(progress * Math.PI * 4) * 3;
          } else {
            // Return to normal
            perspCamera.fov = originalFov.current;
            return;
          }
          
          perspCamera.updateProjectionMatrix();
          animationRef.current = requestAnimationFrame(animate);
        };
        
        animate();
      };
      
      warpSequence();
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        perspCamera.fov = originalFov.current;
        perspCamera.updateProjectionMatrix();
      };
    }
  }, [jumpScareActive]);
  
  return null;
}
