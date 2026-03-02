'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/lib/store';
import { getScene } from '@/data/story';

const ROTATION_SPEED = 1.5; // radians per second
const ZOOM_SPEED = 3; // units per second
const MIN_RADIUS = 2;
const MAX_RADIUS = 20;

export default function KeyboardCameraControls() {
  const { camera } = useThree();
  const { currentScene, phase } = useGameStore();
  
  const sceneData = getScene(currentScene);
  const initialPos = useMemo<[number, number, number]>(() => sceneData.cameraPosition || [0, 3, 10], [sceneData.cameraPosition]);
  const initialTarget = useMemo<[number, number, number]>(() => sceneData.cameraTarget || [0, 0, 0], [sceneData.cameraTarget]);
  
  const targetRef = useRef(new THREE.Vector3(...initialTarget));
  const radiusRef = useRef(
    new THREE.Vector3(...initialPos).distanceTo(new THREE.Vector3(...initialTarget))
  );
  const thetaRef = useRef(0); // yaw (horizontal)
  const phiRef = useRef(Math.PI / 4); // pitch (vertical), clamped 0.1 to PI-0.1
  
  // Derived position from spherical coordinates
  const computePosition = () => {
    const radius = radiusRef.current;
    const theta = thetaRef.current;
    const phi = phiRef.current;
    const x = targetRef.current.x + radius * Math.sin(phi) * Math.cos(theta);
    const y = targetRef.current.y + radius * Math.cos(phi);
    const z = targetRef.current.z + radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  };

  const [keys, setKeys] = useState<Record<string, boolean>>({});

  // Update target if scene changes
  useEffect(() => {
    targetRef.current.set(...initialTarget);
    // Also reset radius and angles to match initial position relative to new target
    const currentPos = new THREE.Vector3(...initialPos);
    const offset = currentPos.clone().sub(targetRef.current);
    radiusRef.current = offset.length();
    if (radiusRef.current === 0) radiusRef.current = 5;
    // Horizontal angle
    thetaRef.current = Math.atan2(offset.z, offset.x);
    // Vertical angle
    phiRef.current = Math.acos(offset.y / radiusRef.current);
    // Clamp phi
    phiRef.current = Math.max(0.1, Math.min(Math.PI - 0.1, phiRef.current));
  }, [initialTarget, initialPos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Only active during scene/choice phases if cameraControls enabled
  const enabled = phase === 'scene' || phase === 'choice';
  const cameraControls = sceneData.cameraControls !== false; // default true

  useFrame((_, delta) => {
    if (!enabled || !cameraControls) {
      // If disabled or not in appropriate phase, maintain lookAt target
      camera.lookAt(targetRef.current);
      return;
    }

    const left = keys['arrowleft'] || keys['a'];
    const right = keys['arrowright'] || keys['d'];
    const up = keys['arrowup'] || keys['w'];
    const down = keys['arrowdown'] || keys['s'];
    const zoomIn = keys['='] || keys['+'];
    const zoomOut = keys['-'] || keys['_'];
    const reset = keys['r'];

    if (reset) {
      // Reset to original
      targetRef.current.set(...initialTarget);
      const offset = new THREE.Vector3(...initialPos).sub(targetRef.current);
      radiusRef.current = offset.length();
      thetaRef.current = Math.atan2(offset.z, offset.x);
      phiRef.current = Math.acos(offset.y / radiusRef.current);
      phiRef.current = Math.max(0.1, Math.min(Math.PI - 0.1, phiRef.current));
    } else {
      // Horizontal rotation (left/right)
      if (left) {
        thetaRef.current -= ROTATION_SPEED * delta;
      }
      if (right) {
        thetaRef.current += ROTATION_SPEED * delta;
      }
      // Vertical rotation (up/down) – adjust phi
      if (up) {
        phiRef.current -= ROTATION_SPEED * delta;
      }
      if (down) {
        phiRef.current += ROTATION_SPEED * delta;
      }
      // Clamp phi to avoid flipping
      phiRef.current = Math.max(0.1, Math.min(Math.PI - 0.1, phiRef.current));
      // Zoom
      if (zoomIn) {
        radiusRef.current = Math.max(MIN_RADIUS, radiusRef.current - ZOOM_SPEED * delta);
      }
      if (zoomOut) {
        radiusRef.current = Math.min(MAX_RADIUS, radiusRef.current + ZOOM_SPEED * delta);
      }
    }

    // Apply new position
    const newPos = computePosition();
    camera.position.copy(newPos);
    camera.lookAt(targetRef.current);
  });

  return null;
}