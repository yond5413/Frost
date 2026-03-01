'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/lib/store';

interface InteractableObjectProps {
    position: [number, number, number];
    label: string;
    onInteract: () => void;
    requiredPhase?: string;
    sceneAccess?: string[]; // only show in these scenes
    children?: React.ReactNode;
}

export default function InteractableObject({
    position,
    label,
    onInteract,
    requiredPhase = 'exploration',
    sceneAccess,
    children
}: InteractableObjectProps) {
    const { phase, currentScene } = useGameStore();
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Group>(null);

    const isActivePhase = phase === requiredPhase;
    const isCorrectScene = !sceneAccess || sceneAccess.includes(currentScene);
    const isVisible = isActivePhase && isCorrectScene;

    useFrame((_, delta) => {
        if (meshRef.current && hovered && isVisible) {
            meshRef.current.rotation.y += delta;
            meshRef.current.position.y = position[1] + Math.sin(Date.now() / 200) * 0.05;
        } else if (meshRef.current && !hovered) {
            // Return to base position softly
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], 0.1);
        }
    });

    if (!isVisible) return null;

    return (
        <group
            ref={meshRef}
            position={position}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
            onClick={(e) => { e.stopPropagation(); if (isVisible) { document.body.style.cursor = 'auto'; onInteract(); } }}
        >
            {/* Visual Indicator (Glow/Sparkle) */}
            <mesh>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshBasicMaterial color={hovered ? "#ffffff" : "#ffaa00"} transparent opacity={hovered ? 0.6 : 0.3} wireframe />
            </mesh>

            {/* Inner object geometry */}
            {children}

            {/* Floating Label */}
            {hovered && (
                <Html center position={[0, 0.5, 0]}>
                    <div className="bg-black/80 px-3 py-1 text-xs text-white uppercase tracking-widest border border-gray-600 rounded select-none shadow-[0_0_10px_rgba(255,255,255,0.2)] pointer-events-none whitespace-nowrap">
                        {label}
                    </div>
                </Html>
            )}
        </group>
    );
}
