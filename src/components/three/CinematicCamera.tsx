'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, CameraShot } from '@/lib/store';

interface CameraShotConfig {
  distance: number;
  height: number;
  angle: number;
}

const CAMERA_SHOTS: Record<CameraShot, CameraShotConfig> = {
  wide: { distance: 4, height: 3, angle: 0 },
  medium: { distance: 5, height: 2, angle: 0 },
  closeup: { distance: 2.5, height: 1.6, angle: 0 },
  over_shoulder: { distance: 1.5, height: 1.5, angle: Math.PI * 0.1 },
  pov: { distance: 0.1, height: 1.6, angle: 0 },
  speaker: { distance: 3, height: 1.8, angle: 0 },
  tracking: { distance: 6, height: 2.5, angle: 0 },
  panic: { distance: 4, height: 2, angle: 0 },
  freeze: { distance: 5, height: 2, angle: 0 },
  flicker: { distance: 5, height: 2, angle: 0 },
};


function clampCameraByEnvironment(target: THREE.Vector3, environment: string): THREE.Vector3 {
  if (environment === 'lodge' || environment === 'cabin') {
    return new THREE.Vector3(
      Math.max(-5.5, Math.min(5.5, target.x)),
      Math.max(1.4, Math.min(4.8, target.y)),
      Math.max(2.2, Math.min(9, target.z))
    );
  }

  return new THREE.Vector3(
    Math.max(-12, Math.min(12, target.x)),
    Math.max(1.2, Math.min(6.5, target.y)),
    Math.max(-20, Math.min(12, target.z))
  );
}


const SCENE_CAMERA_OVERRIDES: Record<string, { camera: [number, number, number]; lookAt: [number, number, number] }> = {
  chapter1_start: { camera: [0.5, 2.1, 4.2], lookAt: [0, 1.3, 0] },
  ch1_clue_found: { camera: [2.8, 1.9, 2.6], lookAt: [3.2, 1.1, 0.2] },
  chapter3_gather: { camera: [-1.2, 2.0, 4.6], lookAt: [0.4, 1.4, 0.3] },
  ch4_learn_wendigo: { camera: [-0.8, 2.3, 3.2], lookAt: [0.8, 1.5, 0.2] },
  chapter5_start: { camera: [0, 2.6, 5.2], lookAt: [0, 1.4, -0.8] },
};

interface CharacterCameraPosition {
  [characterId: string]: THREE.Vector3;
}

const DEFAULT_CHARACTER_POSITIONS: CharacterCameraPosition = {
  sam: new THREE.Vector3(-2, 0, 2),
  mike: new THREE.Vector3(2, 0, 2),
  jessica: new THREE.Vector3(3, 0, 1),
  emily: new THREE.Vector3(-3, 0, 1),
  ashley: new THREE.Vector3(1, 0, 3),
  chris: new THREE.Vector3(-1, 0, 3),
  josh: new THREE.Vector3(0, 0, 3),
  matt: new THREE.Vector3(2, 0, 0),
  hannah: new THREE.Vector3(-2, 0, 0),
  beth: new THREE.Vector3(0, 0, 2),
  stranger: new THREE.Vector3(1, 0, 2),
};

export default function CinematicCamera() {
  const { camera } = useThree();
  const { phase, fearLevel, currentSpeaker, currentCameraShot, currentEnvironment, currentScene } = useGameStore();

  const targetPositionRef = useRef(new THREE.Vector3(0, 2, 8));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 1, 0));
  const transitionProgressRef = useRef(1);
  const startPositionRef = useRef(new THREE.Vector3());
  const timeRef = useRef(0);

  useEffect(() => {
    transitionProgressRef.current = 0;
    startPositionRef.current.copy(camera.position);
  }, [currentSpeaker, currentCameraShot, camera]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (phase !== 'scene' && phase !== 'choice') return;

    const shot = currentCameraShot || 'wide';
    const speaker = currentSpeaker || 'narrator';

    const shotConfig = CAMERA_SHOTS[shot] || CAMERA_SHOTS.wide;

    let cameraTarget: THREE.Vector3;
    let lookAtTarget: THREE.Vector3;

    if (speaker === 'narrator') {
      cameraTarget = new THREE.Vector3(0, shotConfig.height, shotConfig.distance);
      lookAtTarget = new THREE.Vector3(0, 1, 0);
    } else {
      const charPos = DEFAULT_CHARACTER_POSITIONS[speaker];
      if (charPos && shot !== 'wide') {
        const offsetX = shot === 'over_shoulder' ? (charPos.x > 0 ? -0.5 : 0.5) : 0;
        lookAtTarget = new THREE.Vector3(charPos.x, 1.5, charPos.z);

        const angle = shotConfig.angle;
        cameraTarget = new THREE.Vector3(
          charPos.x - Math.sin(angle) * shotConfig.distance + offsetX,
          shotConfig.height,
          charPos.z + Math.cos(angle) * shotConfig.distance
        );
      } else {
        cameraTarget = new THREE.Vector3(0, shotConfig.height, shotConfig.distance);
        lookAtTarget = new THREE.Vector3(0, 1, 0);
      }
    }

    const sceneOverride = SCENE_CAMERA_OVERRIDES[currentScene];
    if (sceneOverride && (shot === 'wide' || shot === 'tracking')) {
      cameraTarget = new THREE.Vector3(...sceneOverride.camera);
      lookAtTarget = new THREE.Vector3(...sceneOverride.lookAt);
    }

    const clampedTarget = clampCameraByEnvironment(cameraTarget, currentEnvironment);
    targetPositionRef.current.copy(clampedTarget);
    targetLookAtRef.current.copy(lookAtTarget);

    const transitionSpeed = 2.5;
    transitionProgressRef.current = Math.min(1, transitionProgressRef.current + delta * transitionSpeed);

    const t = easeInOutCubic(transitionProgressRef.current);

    camera.position.lerp(targetPositionRef.current, t * 0.15);
    camera.lookAt(targetLookAtRef.current);

    if (fearLevel > 50 && phase === 'scene') {
      const shakeIntensity = ((fearLevel - 50) / 50) * 0.02;
      const shakeX = (Math.sin(timeRef.current * 20) * 0.5) * shakeIntensity;
      const shakeY = (Math.cos(timeRef.current * 25) * 0.5) * shakeIntensity;
      camera.position.set(
        camera.position.x + shakeX,
        camera.position.y + shakeY,
        camera.position.z
      );
    }
  });

  return null;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
