'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/lib/store';

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface Props {
  position?: [number, number, number];
}

function ShadowWendigo({ chapter, intensity }: { chapter: number; intensity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftEyeLightRef = useRef<THREE.PointLight>(null);
  const rightEyeLightRef = useRef<THREE.PointLight>(null);
  
  const eyePulseRef = useRef(0);
  const bodyRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    eyePulseRef.current += delta * 4;
    
    const pulseIntensity = 2 + Math.sin(eyePulseRef.current) * 1.5;
    const flicker = Math.sin(eyePulseRef.current * 15) > 0.8 ? 0.3 : 1;
    
    if (leftEyeRef.current && leftEyeRef.current.material && 'emissiveIntensity' in leftEyeRef.current.material) {
      (leftEyeRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulseIntensity * flicker;
    }
    if (leftEyeLightRef.current) {
      leftEyeLightRef.current.intensity = pulseIntensity * flicker * 0.8;
    }
    if (rightEyeRef.current && rightEyeRef.current.material && 'emissiveIntensity' in rightEyeRef.current.material) {
      (rightEyeRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulseIntensity * flicker;
    }
    if (rightEyeLightRef.current) {
      rightEyeLightRef.current.intensity = pulseIntensity * flicker * 0.8;
    }
    
    if (bodyRef.current) {
      const breathe = 1 + Math.sin(eyePulseRef.current * 0.5) * 0.05;
      bodyRef.current.scale.setScalar(breathe);
    }
  });
  
  const bodyOpacity = chapter <= 2 ? 0.15 : chapter <= 4 ? 0.3 : 0.5;
  const antlerVisibility = chapter <= 2 ? 0 : chapter <= 4 ? 0.3 : 0.6;
  
  return (
    <group ref={groupRef}>
      <mesh ref={bodyRef}>
        <capsuleGeometry args={[0.4, 2.2, 8, 16]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={bodyOpacity * intensity}
        />
      </mesh>
      
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={bodyOpacity * intensity}
        />
      </mesh>
      
      {antlerVisibility > 0 && (
        <>
          <mesh position={[-0.2, 2.9, -0.1]} rotation={[0, 0, -0.4]} scale={antlerVisibility}>
            <cylinderGeometry args={[0.03, 0.04, 0.5, 6]} />
            <meshBasicMaterial color="#000000" transparent opacity={antlerVisibility * intensity} />
          </mesh>
          <mesh position={[0.2, 2.9, -0.1]} rotation={[0, 0, 0.4]} scale={antlerVisibility}>
            <cylinderGeometry args={[0.03, 0.04, 0.5, 6]} />
            <meshBasicMaterial color="#000000" transparent opacity={antlerVisibility * intensity} />
          </mesh>
        </>
      )}
      
      {[-0.12, 0.12].map((x, i) => (
        <group key={i} position={[x, 2.45, 0.25]}>
          <mesh ref={i === 0 ? leftEyeRef : rightEyeRef}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color="#ff0000" 
              emissive="#ff0000" 
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
          <pointLight 
            ref={i === 0 ? leftEyeLightRef : rightEyeLightRef}
            position={[0, 0, 0.1]} 
            color="#ff0000" 
            intensity={2} 
            distance={6}
            decay={2}
          />
        </group>
      ))}
      
      {chapter >= 4 && (
        <>
          <mesh position={[-0.6, 1.8, 0]} rotation={[0, 0, 0.5]}>
            <capsuleGeometry args={[0.08, 1.2, 4, 8]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.3 * intensity} />
          </mesh>
          <mesh position={[0.6, 1.8, 0]} rotation={[0, 0, -0.5]}>
            <capsuleGeometry args={[0.08, 1.2, 4, 8]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.3 * intensity} />
          </mesh>
        </>
      )}
    </group>
  );
}

function FogSwirl({ intensity = 1 }: { intensity?: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);
  
  const { positions, velocities } = useMemo(() => {
    const count = 60;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = seededRandom(i) * Math.PI * 2;
      const radius = 0.5 + seededRandom(i + 100) * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = seededRandom(i + 200) * 0.8;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      vel[i * 3] = (seededRandom(i + 300) - 0.5) * 0.3;
      vel[i * 3 + 1] = 0.2 + seededRandom(i + 400) * 0.3;
      vel[i * 3 + 2] = (seededRandom(i + 500) - 0.5) * 0.3;
    }
    return { positions: pos, velocities: vel };
  }, []);
  
  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    timeRef.current += delta;
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < 60; i++) {
      pos[i * 3] += velocities[i * 3] * delta;
      pos[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      pos[i * 3 + 2] += velocities[i * 3 + 2] * delta;
      
      const dist = Math.sqrt(pos[i * 3] ** 2 + pos[i * 3 + 2] ** 2);
      if (dist > 2.5 || pos[i * 3 + 1] > 1.5) {
        const angle = (i * 2.399) + (timeRef.current * 0.5);
        const radius = 0.1 + (i % 5) * 0.08;
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef} position={[0, 0.3, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#111122"
        size={0.15}
        transparent
        opacity={0.4 * intensity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Wendigo({ position = [0, 0, -15] }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(0);
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3(...position));
  const [isVisible, setIsVisible] = useState(false);
  const visibilityTimerRef = useRef(0);
  const jumpScareTimerRef = useRef(0);
  
  const fearLevel = useGameStore((state) => state.fearLevel);
  const currentScene = useGameStore((state) => state.currentScene);
  const jumpScareActive = useGameStore((state) => state.jumpScareActive);
  
  const chapter = useMemo(() => {
    if (currentScene.startsWith('chapter1') || currentScene.startsWith('ch1')) return 1;
    if (currentScene.startsWith('chapter2') || currentScene.startsWith('ch2')) return 2;
    if (currentScene.startsWith('chapter3') || currentScene.startsWith('ch3')) return 3;
    if (currentScene.startsWith('chapter4') || currentScene.startsWith('ch4')) return 4;
    return 5;
  }, [currentScene]);
  
  const behaviorConfig = useMemo(() => {
    switch (chapter) {
      case 1:
        return { 
          baseDistance: 18, 
          visibilityDuration: 1500,
          hiddenDuration: 8000,
          jumpScareChance: 0.02,
          aggressive: false,
        };
      case 2:
        return { 
          baseDistance: 12, 
          visibilityDuration: 2000,
          hiddenDuration: 5000,
          jumpScareChance: 0.05,
          aggressive: false,
        };
      case 3:
        return { 
          baseDistance: 8, 
          visibilityDuration: 1500,
          hiddenDuration: 3500,
          jumpScareChance: 0.1,
          aggressive: true,
        };
      case 4:
        return { 
          baseDistance: 5, 
          visibilityDuration: 2000,
          hiddenDuration: 2500,
          jumpScareChance: 0.2,
          aggressive: true,
        };
      default:
        return { 
          baseDistance: 3, 
          visibilityDuration: 2500,
          hiddenDuration: 2000,
          jumpScareChance: 0.35,
          aggressive: true,
        };
    }
  }, [chapter]);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    phaseRef.current += delta;
    
    const config = behaviorConfig;
    const isJumpScare = jumpScareActive;
    
    if (isJumpScare) {
      jumpScareTimerRef.current += delta * 1000;
      
      if (jumpScareTimerRef.current < 100) {
        groupRef.current.position.set(0, 1.5, -2.5);
        groupRef.current.scale.setScalar(1.5);
      } else if (jumpScareTimerRef.current < 1000) {
        groupRef.current.position.lerp(new THREE.Vector3(0, 1.5, -2.5), 0.3);
      } else {
        groupRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.2);
      }
      
      if (jumpScareTimerRef.current > 1500) {
        jumpScareTimerRef.current = 0;
      }
      return;
    }
    
    visibilityTimerRef.current += delta * 1000;
    
    const cycleTime = isVisible ? config.visibilityDuration : config.hiddenDuration;
    
    if (visibilityTimerRef.current > cycleTime) {
      setIsVisible(!isVisible);
      visibilityTimerRef.current = 0;
      
      if (!isVisible) {
        const angle = Math.random() * Math.PI * 2;
        const radius = config.baseDistance + (Math.random() - 0.5) * 4;
        const newPos = new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius - 10
        );
        setTargetPosition(newPos);
      }
    }
    
    const currentPos = groupRef.current.position;
    const targetPos = targetPosition;
    
    if (isVisible) {
      currentPos.lerp(targetPos, 0.02);
      
      if (config.aggressive && Math.random() < 0.01) {
        const lungeTarget = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          0.5 + Math.random(),
          -5 + Math.random() * 2
        );
        currentPos.lerp(lungeTarget, 0.3);
      }
    } else {
      currentPos.lerp(new THREE.Vector3(0, -10, -30), 0.05);
    }
    
    groupRef.current.scale.setScalar(isVisible ? 1 : 0);
    
    groupRef.current.lookAt(0, 1.5, 0);
  });

  const intensity = fearLevel / 100;
  
  return (
    <group ref={groupRef} position={position}>
      {isVisible && <FogSwirl intensity={intensity} />}
      {(isVisible || jumpScareActive) && (
        <ShadowWendigo chapter={chapter} intensity={intensity} />
      )}
    </group>
  );
}
